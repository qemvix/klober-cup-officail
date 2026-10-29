-- ELO abuse protection: per-mode ELO, global UTC daily victim cap, global death streak.
create table public.elo_player_state (
  player_id uuid primary key references public.players(id) on delete cascade,
  consecutive_deaths integer not null default 0 check (consecutive_deaths >= 0),
  updated_at timestamptz not null default now()
);
create table public.elo_match_events (
  event_id uuid primary key,
  server_id text not null check (char_length(trim(server_id)) between 1 and 80),
  gamemode text not null check (gamemode in ('diamond-smp','lt-cart','ht-cart','creeper','uhc','sword','smp','axe','mace','nethpot')),
  killer_player_id uuid not null references public.players(id) on delete cascade,
  victim_player_id uuid not null references public.players(id) on delete cascade,
  occurred_at timestamptz not null,
  processed_at timestamptz not null default now(),
  victim_daily_death_number integer not null default 0 check (victim_daily_death_number >= 0),
  victim_consecutive_deaths integer not null default 0 check (victim_consecutive_deaths >= 0),
  killer_elo_awarded integer not null default 0 check (killer_elo_awarded >= 0),
  victim_elo_penalty integer not null default 0 check (victim_elo_penalty >= 0),
  constraint elo_match_events_no_self_kill check (killer_player_id <> victim_player_id)
);
create index elo_match_events_victim_day_idx on public.elo_match_events (victim_player_id, occurred_at);
alter table public.elo_player_state enable row level security;
alter table public.elo_match_events enable row level security;
revoke all on public.elo_player_state from public, anon, authenticated;
revoke all on public.elo_match_events from public, anon, authenticated;
grant all on public.elo_player_state to service_role;
grant all on public.elo_match_events to service_role;

create or replace function public.record_elo_kill(
  p_event_id uuid, p_server_id text, p_gamemode text,
  p_killer_name text, p_victim_name text, p_occurred_at timestamptz
) returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_killer_id uuid; v_victim_id uuid; v_inserted uuid;
  v_day_start timestamptz; v_day_end timestamptz;
  v_daily_deaths integer; v_streak integer;
  v_award integer := 0; v_penalty integer := 0; v_elo integer;
begin
  if p_event_id is null or p_occurred_at is null then
    raise exception 'eventId and occurredAt are required' using errcode = '22023';
  end if;
  if p_server_id is null or char_length(trim(p_server_id)) not between 1 and 80 then
    raise exception 'Invalid serverId' using errcode = '22023';
  end if;
  if p_gamemode not in ('diamond-smp','lt-cart','ht-cart','creeper','uhc','sword','smp','axe','mace','nethpot') then
    raise exception 'Unsupported gamemode' using errcode = '22023';
  end if;
  if p_killer_name is null or trim(p_killer_name) !~ '^[A-Za-z0-9_]{1,16}$'
     or p_victim_name is null or trim(p_victim_name) !~ '^[A-Za-z0-9_]{1,16}$' then
    raise exception 'Invalid player name' using errcode = '22023';
  end if;
  if lower(trim(p_killer_name)) = lower(trim(p_victim_name)) then
    raise exception 'Killer and victim must be different' using errcode = '22023';
  end if;
  if exists (select 1 from public.elo_match_events where event_id = p_event_id) then
    return jsonb_build_object('ok', true, 'duplicate', true);
  end if;
  select id into v_killer_id from public.players where lower(name) = lower(trim(p_killer_name)) limit 1;
  if v_killer_id is null then raise exception 'Unknown killer player' using errcode = 'P0002'; end if;
  select id into v_victim_id from public.players where lower(name) = lower(trim(p_victim_name)) limit 1;
  if v_victim_id is null then raise exception 'Unknown victim player' using errcode = 'P0002'; end if;

  insert into public.elo_match_events(event_id,server_id,gamemode,killer_player_id,victim_player_id,occurred_at)
  values (p_event_id,trim(p_server_id),p_gamemode,v_killer_id,v_victim_id,p_occurred_at)
  on conflict (event_id) do nothing returning event_id into v_inserted;
  if v_inserted is null then return jsonb_build_object('ok',true,'duplicate',true); end if;

  insert into public.elo_player_state(player_id) values (v_killer_id),(v_victim_id)
  on conflict (player_id) do nothing;
  perform player_id from public.elo_player_state
    where player_id in (v_killer_id,v_victim_id) order by player_id for update;

  -- Every kill resets the killer streak, even if the victim has reached the cap.
  update public.elo_player_state set consecutive_deaths=0,updated_at=now() where player_id=v_killer_id;
  update public.elo_player_state set consecutive_deaths=consecutive_deaths+1,updated_at=now()
    where player_id=v_victim_id returning consecutive_deaths into v_streak;

  v_day_start := date_trunc('day',p_occurred_at at time zone 'UTC') at time zone 'UTC';
  v_day_end := v_day_start + interval '1 day';
  -- Deliberately no server or gamemode filter: this cap is global per victim.
  select count(*)::integer into v_daily_deaths from public.elo_match_events
    where victim_player_id=v_victim_id and occurred_at>=v_day_start and occurred_at<v_day_end;

  if v_daily_deaths <= 20 then
    v_award := 10;
    select coalesce(nullif(elo->>p_gamemode,'')::integer,1000) into v_elo from public.players where id=v_killer_id;
    update public.players set elo=jsonb_set(coalesce(elo,'{}'::jsonb),array[p_gamemode],to_jsonb(v_elo+v_award),true)
      where id=v_killer_id;
  end if;
  if v_streak % 10 = 0 then
    v_penalty := 10;
    select coalesce(nullif(elo->>p_gamemode,'')::integer,1000) into v_elo from public.players where id=v_victim_id;
    update public.players set elo=jsonb_set(coalesce(elo,'{}'::jsonb),array[p_gamemode],to_jsonb(v_elo-v_penalty),true)
      where id=v_victim_id;
  end if;
  update public.elo_match_events set victim_daily_death_number=v_daily_deaths,
    victim_consecutive_deaths=v_streak,killer_elo_awarded=v_award,victim_elo_penalty=v_penalty
    where event_id=p_event_id;
  return jsonb_build_object('ok',true,'duplicate',false,'gamemode',p_gamemode,
    'dailyVictimDeaths',v_daily_deaths,'dailyVictimCap',20,'consecutiveDeaths',v_streak,
    'killerEloAwarded',v_award,'victimEloPenalty',v_penalty);
end;
$$;
revoke all on function public.record_elo_kill(uuid,text,text,text,text,timestamptz) from public,anon,authenticated;
grant execute on function public.record_elo_kill(uuid,text,text,text,text,timestamptz) to service_role;
