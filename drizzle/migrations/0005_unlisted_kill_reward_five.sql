-- Apply in the existing Lovable Cloud SQL editor.
-- Changes only the unlisted-kill award in the installed function; preserves
-- its daily cap, streak penalties, idempotency, permissions, and player ELO.
BEGIN;

DO $migration$
DECLARE
  v_definition text;
  v_signature regprocedure := 'public.record_elo_kill(uuid,text,text,text,text,timestamptz)'::regprocedure;
  v_old_pattern text := 'v_award[[:space:]]*:=[[:space:]]*case[[:space:]]+when[[:space:]]+v_victim_is_tier_listed[[:space:]]+then[[:space:]]+10[[:space:]]+else[[:space:]]+1[[:space:]]+end[[:space:]]*;';
  v_new_pattern text := 'v_award[[:space:]]*:=[[:space:]]*case[[:space:]]+when[[:space:]]+v_victim_is_tier_listed[[:space:]]+then[[:space:]]+10[[:space:]]+else[[:space:]]+5[[:space:]]+end[[:space:]]*;';
BEGIN
  SELECT pg_get_functiondef(v_signature) INTO v_definition;
  IF v_definition ~* v_new_pattern THEN
    RAISE NOTICE 'Unlisted reward is already +5; no change needed';
    RETURN;
  END IF;
  IF NOT (v_definition ~* v_old_pattern) THEN
    RAISE EXCEPTION 'Expected +10 / +1 reward assignment not found. No changes applied; inspect record_elo_kill before proceeding.';
  END IF;
  EXECUTE regexp_replace(v_definition, v_old_pattern,
    'v_award := case when v_victim_is_tier_listed then 10 else 5 end;', 'i');
END;
$migration$;

COMMIT;
