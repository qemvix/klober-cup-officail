-- 0003_add_expanded_gamemodes.sql
-- RUN ONCE in the Lovable Cloud SQL editor before using the new gamemodes.
-- Keeps existing player ELO and the existing kill/cap/penalty logic intact.
-- New modes: crystal, pot, elytra-mace, spear-mace, trident.

BEGIN;

DO $migration$
DECLARE
  v_check record;
  v_count integer := 0;
  v_definition text;
  v_old text := '''nethpot''';
  v_new text := '''nethpot'', ''crystal'', ''pot'', ''elytra-mace'', ''spear-mace'', ''trident''';
BEGIN
  -- Find and widen the original CHECK that restricts event gamemodes.
  FOR v_check IN
    SELECT c.conname
    FROM pg_constraint c
    WHERE c.conrelid = 'public.elo_match_events'::regclass
      AND c.contype = 'c'
      AND pg_get_constraintdef(c.oid) ILIKE '%gamemode%'
      AND pg_get_constraintdef(c.oid) ILIKE '%nethpot%'
  LOOP
    EXECUTE format('ALTER TABLE public.elo_match_events DROP CONSTRAINT %I', v_check.conname);
    v_count := v_count + 1;
  END LOOP;

  IF v_count = 0 THEN
    RAISE EXCEPTION 'Existing gamemode CHECK not found; inspect public.elo_match_events before running migration';
  END IF;

  ALTER TABLE public.elo_match_events
    ADD CONSTRAINT elo_match_events_supported_gamemode_check
    CHECK (gamemode IN (
      'diamond-smp', 'lt-cart', 'ht-cart', 'creeper', 'uhc',
      'sword', 'smp', 'axe', 'mace', 'nethpot',
      'crystal', 'pot', 'elytra-mace', 'spear-mace', 'trident'
    ));

  -- Preserve the installed record_elo_kill body (all award rules, daily cap,
  -- streaks, idempotency, security), but extend its existing mode allowlist.
  SELECT pg_get_functiondef(
    'public.record_elo_kill(uuid,text,text,text,text,timestamptz)'::regprocedure
  ) INTO v_definition;

  IF v_definition IS NULL OR position(v_old IN v_definition) = 0 THEN
    RAISE EXCEPTION 'Could not locate the original gamemode list in record_elo_kill; inspect function manually';
  END IF;

  -- Replace the allowlist token in the CREATE OR REPLACE FUNCTION definition.
  -- The source function itself is not otherwise changed.
  v_definition := replace(v_definition, v_old, v_new);
  EXECUTE v_definition;
END;
$migration$;

-- Existing JSONB mode ELO values are untouched. New keys start at 1000.
-- Fill missing new-mode keys only, preserving any existing custom ELO.
UPDATE public.players
SET elo = COALESCE(elo, '{}'::jsonb)
    || (
       SELECT COALESCE(jsonb_object_agg(slug, 1000), '{}'::jsonb)
       FROM unnest(ARRAY[
         'crystal', 'pot', 'elytra-mace', 'spear-mace', 'trident'
       ]) AS t(slug)
       WHERE NOT (COALESCE(public.players.elo, '{}'::jsonb) ? slug)
    )
WHERE NOT (
    COALESCE(elo, '{}'::jsonb) ?& ARRAY[
      'crystal', 'pot', 'elytra-mace', 'spear-mace', 'trident'
    ]
);

COMMIT;
