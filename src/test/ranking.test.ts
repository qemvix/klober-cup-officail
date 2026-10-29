import { describe, expect, it } from "vitest";
import { rankBy, tierFor } from "@/lib/ranking";

describe("tiers", () => {
  it("Emerald at 1700+", () => expect(tierFor(1700)).toBe("Emerald"));
  it("Diamond at 1500+", () => expect(tierFor(1500)).toBe("Diamond"));
  it("Gold at 1300+", () => expect(tierFor(1300)).toBe("Gold"));
  it("Iron below 1300", () => expect(tierFor(1299)).toBe("Iron"));
});

describe("ties", () => {
  const rows = [
    { n: "a", v: 1872 }, { n: "b", v: 1850 }, { n: "c", v: 1820 }, { n: "d", v: 1000 },
  ];
  const { ranks } = rankBy(rows, (r) => r.v, (r) => r.n);
  it("players within 25 ELO share a spot", () => {
    expect(ranks.get("b")).toMatchObject({ rank: 1, tied: true });
  });
  it("more than 25 ELO apart is a new spot", () => {
    expect(ranks.get("c")).toMatchObject({ rank: 3, tied: false });
  });
});
