import { describe, expect, it } from "vitest";
import { DAILY_VICTIM_CAP, resolveKillRules, resolveDeathRules } from "@/lib/elo-rules";

describe("tier-list kill rewards", () => {
  it("awards +10 for a tier-listed victim", () => {
    const result = resolveKillRules({
      victimDeathsToday: 0,
      victimConsecutiveDeaths: 0,
      victimIsTierListed: true,
    });
    expect(result.killerEloAwarded).toBe(10);
  });

  it("awards +5 for a victim who is not on the tier list", () => {
    const result = resolveKillRules({
      victimDeathsToday: 0,
      victimConsecutiveDeaths: 0,
      victimIsTierListed: false,
    });
    expect(result.killerEloAwarded).toBe(5);
  });

  it("awards +10 on the 20th death against a tier-listed victim", () => {
    const result = resolveKillRules({
      victimDeathsToday: DAILY_VICTIM_CAP - 1,
      victimConsecutiveDeaths: 0,
      victimIsTierListed: true,
    });
    expect(result.victimDailyDeaths).toBe(20);
    expect(result.killerEloAwarded).toBe(10);
  });

  it("awards no ELO on the 21st death, regardless of tier-list status", () => {
    for (const victimIsTierListed of [true, false]) {
      const result = resolveKillRules({
        victimDeathsToday: DAILY_VICTIM_CAP,
        victimConsecutiveDeaths: 0,
        victimIsTierListed,
      });
      expect(result.victimDailyDeaths).toBe(21);
      expect(result.killerEloAwarded).toBe(0);
    }
  });
});

describe("mode-specific self-death penalty", () => {
  it("charges only the second death of the same mode/run", () => {
    for (let deaths = 0; deaths < 12; deaths++)
      expect(
        resolveDeathRules({ deaths, previousMode: "sword", mode: "sword", sameRun: true })
          .eloPenalty,
      ).toBe(deaths === 1 ? 1 : 0);
  });
  it("resets on a gamemode swap or a kill's new run", () => {
    expect(
      resolveDeathRules({ deaths: 1, previousMode: "sword", mode: "mace", sameRun: true }),
    ).toEqual({ consecutiveDeaths: 1, eloPenalty: 0 });
    expect(
      resolveDeathRules({ deaths: 1, previousMode: "sword", mode: "sword", sameRun: false }),
    ).toEqual({ consecutiveDeaths: 1, eloPenalty: 0 });
  });
  it("does not charge the same victim through a kill report", () => {
    expect(
      resolveKillRules({
        victimDeathsToday: 0,
        victimConsecutiveDeaths: 9,
        victimIsTierListed: true,
      }).victimEloPenalty,
    ).toBe(0);
  });
});
