-- v0.5.0: one -1 penalty at the SECOND self-reported death in one mode/run.
-- Kill observations still enforce the global victim reward cap, but never debit
-- the victim as well: both duel clients may be installed. Death reporting owns penalties.
begin;

create table if not exists public.elo_client_streak (
  player_key text primary key check (player_key ~ '^[a-z0-9_]{1,16}$'),
  gamemode text not null,
  run_id uuid not null,
  deaths integer not null default 0 check (deaths >= 0),
  updated_at timestamptz not null default now()
);
create table if not exists public.elo_self_death_events (
  event_id uuid primary key,
  player_id uuid not null references public.players(id) on delete cascade,
  player_key text not null,
  server_id text not null,
  gamemode text not null,
  run_id uuid not null,
  occurred_at timestamptz not null,
  consecutive_deaths integer not null default 0,
  elo_penalty integer not null default 0 check (elo_penalty between 0 and 1)
);
alter table public.elo_client_streak enable row level security;
alter table public.elo_self_death_events enable row level security;
revoke all on public.elo_client_streak, public.elo_self_death_events from public, anon, authenticated;
grant all on public.elo_client_streak, public.elo_self_death_events to service_role;

-- Preserve the original function's rewards, cap, locking, validation and privileges.
do $patch$
declare
  source text;
  obsolete text := $old$  -- Unlisted victims have no ELO row to penalize, but their streak is still tracked.
  if v_victim_is_tier_listed and v_streak % 10 = 0 then
    v_penalty := 10;

    select coalesce(nullif(elo ->> p_gamemode, '')::integer, 1000)
      into v_current_elo
    from public.players
    where id = v_victim_id;

    update public.players
    set elo = jsonb_set(
      coalesce(elo, '{}'::jsonb),
      array[p_gamemode],
      to_jsonb(v_current_elo - v_penalty),
      true
    )
    where id = v_victim_id;
  end if;$old$;
  reset_line text := $old$  where player_key = v_killer_key;

  update public.elo_player_state$old$;
begin
  select pg_get_functiondef('public.record_elo_kill(uuid,text,text,text,text,timestamptz)'::regprocedure) into source;
  if position('-- v0.5.0 self-report owns penalties' in source) = 0 then
    if position(obsolete in source) = 0 or position(reset_line in source) = 0 then
      raise exception 'Unexpected record_elo_kill body; refusing a partial update';
    end if;
    source := replace(source, obsolete, '  -- v0.5.0 self-report owns penalties; do not debit twice.');
    source := replace(source, $old$return jsonb_build_object('ok', true, 'duplicate', true);$old$,
      $new$return (select jsonb_build_object('ok',true,'duplicate',true,
        'gamemode',gamemode,'killerEloAwarded',killer_elo_awarded,
        'victimIsTierListed',victim_is_tier_listed,'victimEloPenalty',victim_elo_penalty)
        from public.elo_match_events where event_id=p_event_id);$new$);
    source := replace(source, reset_line, $new$  where player_key = v_killer_key;

  update public.elo_client_streak set deaths = 0, updated_at = now()
  where player_key = v_killer_key;

  update public.elo_player_state$new$);
    execute source;
  end if;
end;
$patch$;

create or replace function public.record_elo_self_death_with_token(
  p_ingest_token text, p_event_id uuid, p_server_id text, p_gamemode text,
  p_player_name text, p_run_id uuid, p_occurred_at timestamptz
) returns jsonb
language plpgsql security definer set search_path = ''
as $fn$
declare
  expected text; player_key_value text; player_id_value uuid;
  inserted uuid; streak integer; penalty integer := 0;
begin
  select token into expected from private.elo_ingest_config where id is true;
  if expected is null or p_ingest_token is distinct from expected then
    raise exception 'Unauthorized' using errcode = '28000';
  end if;
  if p_event_id is null or p_run_id is null or p_occurred_at is null
    or p_occurred_at > now() + interval '5 minutes'
    or p_player_name is null or p_player_name !~ '^[A-Za-z0-9_]{1,16}$'
    or p_server_id is null or p_server_id not in ('mcpvp.com','mcpvp.club','minemen.club','flowpvp.gg')
    or p_gamemode is null or p_gamemode not in (
      'diamond-smp','lt-cart','ht-cart','creeper','uhc','sword','smp','axe','mace',
      'nethpot','crystal','pot','elytra-mace','spear-mace','trident') then
    raise exception 'Invalid death event' using errcode = '22023';
  end if;
  player_key_value := lower(p_player_name);
  select id into player_id_value from public.players where lower(name) = player_key_value limit 1;
  if player_id_value is null then
    raise exception 'Player must be registered first' using errcode = 'P0002';
  end if;
  insert into public.elo_self_death_events(event_id,player_id,player_key,server_id,gamemode,run_id,occurred_at)
  values (p_event_id,player_id_value,player_key_value,p_server_id,p_gamemode,p_run_id,p_occurred_at)
  on conflict(event_id) do nothing returning event_id into inserted;
  if inserted is null then
    return (select jsonb_build_object('ok',true,'duplicate',true,'gamemode',gamemode,
      'consecutiveDeaths',consecutive_deaths,'eloPenalty',elo_penalty)
      from public.elo_self_death_events where event_id=p_event_id);
  end if;
  -- Same per-player lock used by kills: streak resets and ELO changes cannot race.
  insert into public.elo_player_state(player_key) values(player_key_value) on conflict do nothing;
  perform 1 from public.elo_player_state where player_key=player_key_value for update;
  insert into public.elo_client_streak(player_key,gamemode,run_id,deaths)
  values(player_key_value,p_gamemode,p_run_id,1)
  on conflict(player_key) do update set
    deaths = case when elo_client_streak.gamemode=excluded.gamemode and elo_client_streak.run_id=excluded.run_id
      then elo_client_streak.deaths+1 else 1 end,
    gamemode=excluded.gamemode, run_id=excluded.run_id, updated_at=now()
  returning deaths into streak;
  if streak=2 then
    penalty := 1;
    update public.players set elo=jsonb_set(coalesce(elo,'{}'::jsonb),array[p_gamemode],
      to_jsonb(coalesce(nullif(elo->>p_gamemode,'')::integer,1000)-1),true)
    where id=player_id_value;
  end if;
  update public.elo_self_death_events set consecutive_deaths=streak,elo_penalty=penalty where event_id=p_event_id;
  return jsonb_build_object('ok',true,'duplicate',false,'gamemode',p_gamemode,
    'consecutiveDeaths',streak,'eloPenalty',penalty);
end;
$fn$;
revoke all on function public.record_elo_self_death_with_token(text,uuid,text,text,text,uuid,timestamptz) from public;
grant execute on function public.record_elo_self_death_with_token(text,uuid,text,text,text,uuid,timestamptz) to anon,authenticated,service_role;
comment on function public.record_elo_self_death_with_token(text,uuid,text,text,text,uuid,timestamptz) is
  'v0.5.0: trusted-token self death reports; -1 only at death 2 of the same mode/run, with UUID idempotency. Kills and mode changes reset the streak.';
commit;
