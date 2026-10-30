-- v0.4.0: token-authenticated onboarding for players using the Klober Fabric mod.
-- Paste into the Lovable Cloud SQL editor and run it ONCE.
-- Existing player rows and their ELO values are never changed.
-- Uses the same private.elo_ingest_config token as the existing kill RPC.

create or replace function public.register_elo_player_with_token(
  p_ingest_token text,
  p_server_id text,
  p_player_name text
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_token text;
  v_key text;
  v_name text;
  v_id uuid;
begin
  select config.token into v_token
    from private.elo_ingest_config as config
   where config.id is true;

  if v_token is null or p_ingest_token is distinct from v_token then
    raise exception 'Unauthorized' using errcode = '28000';
  end if;

  -- The client sends the canonical allowlisted server root, not arbitrary IPs.
  if p_server_id not in ('mcpvp.com','mcpvp.club','minemen.club','flowpvp.gg') then
    raise exception 'Unsupported server' using errcode = '22023';
  end if;
  if p_player_name is null
      or p_player_name !~ '^[A-Za-z0-9_]{1,16}$' then
    raise exception 'Invalid Minecraft name' using errcode = '22023';
  end if;

  v_name := trim(p_player_name);
  v_key := lower(v_name);

  -- Serialize concurrent first logins for the same name, even if the table
  -- has no unique index on lower(name).
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('klober-register-' || v_key));

  select p.id into v_id
    from public.players as p where lower(p.name) = v_key limit 1;

  if v_id is not null then
    return jsonb_build_object('ok',true,'created',false,'name',v_name);
  end if;

  insert into public.players (
    id, name, region, skin, tier_override, wins, losses, elo
  ) values (
    pg_catalog.gen_random_uuid(), v_name, 'Unknown', null, null, 0, 0,
    jsonb_build_object(
      'diamond-smp', 1000, 'lt-cart', 1000, 'ht-cart', 1000,
      'creeper', 1000, 'uhc', 1000, 'sword', 1000,
      'smp', 1000, 'axe', 1000, 'mace', 1000,
      'nethpot', 1000, 'crystal', 1000, 'pot', 1000,
      'elytra-mace', 1000, 'spear-mace', 1000, 'trident', 1000
    )
  ) returning id into v_id;

  return jsonb_build_object('ok',true,'created',true,'name',v_name);
end;
$$;

revoke all on function public.register_elo_player_with_token(text,text,text)
  from public, anon, authenticated;
grant execute on function public.register_elo_player_with_token(text,text,text)
  to anon;

comment on function public.register_elo_player_with_token(text,text,text) is
  'Register an unlisted player for all 15 ELO modes, only with the existing ingestion token. Does not verify Minecraft account ownership.';
