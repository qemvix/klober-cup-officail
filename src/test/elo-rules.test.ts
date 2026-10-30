import { describe, expect, it } from "vitest";
import {
  DAILY_VICTIM_CAP,
  resolveKillRules,
} from "@/lib/elo-rules";

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

describe("consecutive death penalty", () => {
  it("subtracts 10 from a listed victim at the 10th consecutive death", () => {
    const result = resolveKillRules({
      victimDeathsToday: 0,
      victimConsecutiveDeaths: 9,
      victimIsTierListed: true,
    });
    expect(result.victimConsecutiveDeaths).toBe(10);
    expect(result.victimEloPenalty).toBe(10);
  });

  it("does not penalize the 11th consecutive death", () => {
    const result = resolveKillRules({
      victimDeathsToday: 0,
      victimConsecutiveDeaths: 10,
      victimIsTierListed: true,
    });
    expect(result.victimEloPenalty).toBe(0);
  });

  it("applies another penalty at the 20th consecutive death", () => {
    const result = resolveKillRules({
      victimDeathsToday: 0,
      victimConsecutiveDeaths: 19,
      victimIsTierListed: true,
    });
    expect(result.victimEloPenalty).toBe(10);
  });

  it("tracks an unlisted victim's streak without applying an ELO penalty", () => {
    const result = resolveKillRules({
      victimDeathsToday: 0,
      victimConsecutiveDeaths: 9,
      victimIsTierListed: false,
    });
    expect(result.victimConsecutiveDeaths).toBe(10);
    expect(result.victimEloPenalty).toBe(0);
  });
});
