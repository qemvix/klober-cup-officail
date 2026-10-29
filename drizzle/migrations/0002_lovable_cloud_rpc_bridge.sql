-- Lovable Cloud bridge for the Wasmer ELO endpoint.
-- This adds a token-protected RPC wrapper around the existing record_elo_kill function.
-- It does not alter player data or the existing ELO calculation.

create schema if not exists private;

create table if not exists private.elo_ingest_config (
  id boolean primary key default true check (id is true),
  token text not null check (char_length(token) >= 32),
  updated_at timestamptz not null default now()
);

alter table private.elo_ingest_config enable row level security;
revoke all on schema private from public, anon, authenticated;
revoke all on table private.elo_ingest_config from public, anon, authenticated;

create or replace function public.record_elo_kill_with_token(
  p_ingest_token text,
  p_event_id uuid,
  p_server_id text,
  p_gamemode text,
  p_killer_name text,
  p_victim_name text,
  p_occurred_at timestamptz
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_expected_token text;
begin
  select config.token
    into v_expected_token
  from private.elo_ingest_config as config
  where config.id is true;

  if v_expected_token is null or p_ingest_token is distinct from v_expected_token then
    raise exception 'Unauthorized' using errcode = '28000';
  end if;

  return public.record_elo_kill(
    p_event_id,
    p_server_id,
    p_gamemode,
    p_killer_name,
    p_victim_name,
    p_occurred_at
  );
end;
$$;

revoke all on function public.record_elo_kill_with_token(text, uuid, text, text, text, text, timestamptz)
  from public, anon, authenticated;
grant execute on function public.record_elo_kill_with_token(text, uuid, text, text, text, text, timestamptz)
  to anon;

comment on function public.record_elo_kill_with_token(text, uuid, text, text, text, text, timestamptz) is
  'Token-protected wrapper for the ELO event endpoint when the app uses Lovable Cloud and cannot access a service-role key.';
