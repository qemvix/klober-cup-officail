import { describe, expect, it } from "vitest";
import { DAILY_VICTIM_CAP, resolveKillRules } from "@/lib/elo-rules";

describe("global daily victim cap", () => {
  it("awards ELO for the 20th death", () => {
    expect(resolveKillRules({ victimDeathsToday: DAILY_VICTIM_CAP - 1, victimConsecutiveDeaths: 0 }).killerEloAwarded).toBe(10);
  });
  it("awards no ELO for the 21st death", () => {
    expect(resolveKillRules({ victimDeathsToday: DAILY_VICTIM_CAP, victimConsecutiveDeaths: 0 }).killerEloAwarded).toBe(0);
  });
});
describe("consecutive death penalty", () => {
  it("subtracts 10 at the 10th consecutive death", () => {
    expect(resolveKillRules({ victimDeathsToday: 0, victimConsecutiveDeaths: 9 }).victimEloPenalty).toBe(10);
  });
  it("does not penalize the 11th death", () => {
    expect(resolveKillRules({ victimDeathsToday: 0, victimConsecutiveDeaths: 10 }).victimEloPenalty).toBe(0);
  });
  it("penalizes every further tenth death", () => {
    expect(resolveKillRules({ victimDeathsToday: 0, victimConsecutiveDeaths: 29 }).victimEloPenalty).toBe(10);
  });
});
