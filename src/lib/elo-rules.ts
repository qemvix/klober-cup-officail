export const DAILY_VICTIM_CAP = 20;
export const KILL_ELO_REWARD = 10;
export const CONSECUTIVE_DEATH_INTERVAL = 10;
export const CONSECUTIVE_DEATH_PENALTY = 10;

export function resolveKillRules(input: { victimDeathsToday: number; victimConsecutiveDeaths: number }) {
  const victimDailyDeaths = Math.max(0, Math.trunc(input.victimDeathsToday)) + 1;
  const victimConsecutiveDeaths = Math.max(0, Math.trunc(input.victimConsecutiveDeaths)) + 1;
  return {
    victimDailyDeaths,
    victimConsecutiveDeaths,
    killerConsecutiveDeathsAfter: 0,
    killerEloAwarded: victimDailyDeaths <= DAILY_VICTIM_CAP ? KILL_ELO_REWARD : 0,
    victimEloPenalty: victimConsecutiveDeaths % CONSECUTIVE_DEATH_INTERVAL === 0 ? CONSECUTIVE_DEATH_PENALTY : 0,
  };
}
