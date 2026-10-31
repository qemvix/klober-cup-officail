export const DAILY_VICTIM_CAP = 20;
export const TIER_LISTED_KILL_ELO_REWARD = 10;
export const UNLISTED_KILL_ELO_REWARD = 5;
export const CONSECUTIVE_DEATH_INTERVAL = 2;
export const CONSECUTIVE_DEATH_PENALTY = 1;

export function resolveKillRules(input: {
  victimDeathsToday: number;
  victimConsecutiveDeaths: number;
  victimIsTierListed: boolean;
}) {
  const victimDailyDeaths = Math.max(0, Math.trunc(input.victimDeathsToday)) + 1;
  const victimConsecutiveDeaths = Math.max(0, Math.trunc(input.victimConsecutiveDeaths)) + 1;
  const baseReward = input.victimIsTierListed
    ? TIER_LISTED_KILL_ELO_REWARD
    : UNLISTED_KILL_ELO_REWARD;

  return {
    victimDailyDeaths,
    victimConsecutiveDeaths,
    killerConsecutiveDeathsAfter: 0,
    killerEloAwarded: victimDailyDeaths <= DAILY_VICTIM_CAP ? baseReward : 0,
    // The victim's own v0.5.0 client reports deaths. A kill report never debits twice.
    victimEloPenalty: 0,
  };
}

export function resolveDeathRules(input: {
  deaths: number;
  previousMode: string;
  mode: string;
  sameRun: boolean;
}) {
  const consecutiveDeaths =
    input.sameRun && input.previousMode === input.mode
      ? Math.max(0, Math.trunc(input.deaths)) + 1
      : 1;
  return {
    consecutiveDeaths,
    eloPenalty: consecutiveDeaths === CONSECUTIVE_DEATH_INTERVAL ? CONSECUTIVE_DEATH_PENALTY : 0,
  };
}
