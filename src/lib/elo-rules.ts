export const DAILY_VICTIM_CAP = 20;
export const TIER_LISTED_KILL_ELO_REWARD = 10;
export const UNLISTED_KILL_ELO_REWARD = 1;
export const CONSECUTIVE_DEATH_INTERVAL = 10;
export const CONSECUTIVE_DEATH_PENALTY = 10;

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
    victimEloPenalty:
      input.victimIsTierListed && victimConsecutiveDeaths % CONSECUTIVE_DEATH_INTERVAL === 0
        ? CONSECUTIVE_DEATH_PENALTY
        : 0,
  };
}
