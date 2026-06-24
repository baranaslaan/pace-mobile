import { describe, it, expect } from "vitest";
import { getTone } from "../tone";

describe("getTone", () => {
  it("limit yoksa nötr (alarm vermez)", () => {
    expect(getTone(0, 0).key).toBe("neutral");
    expect(getTone(50, 0).key).toBe("neutral");
  });

  it("kalan eksiyse 'over' (danger zone)", () => {
    expect(getTone(-1, 100).key).toBe("over");
  });

  it("oran > 0.5 → good", () => {
    expect(getTone(60, 100).key).toBe("good");
  });

  it("0.25 < oran ≤ 0.5 → warn", () => {
    expect(getTone(40, 100).key).toBe("warn");
    expect(getTone(50, 100).key).toBe("warn"); // tam sınır (>0.5 değil)
  });

  it("oran ≤ 0.25 → crit", () => {
    expect(getTone(20, 100).key).toBe("crit");
    expect(getTone(0, 100).key).toBe("crit");
  });

  it("her ton renk + rgb taşır", () => {
    const t = getTone(60, 100);
    expect(t.color).toMatch(/^#/);
    expect(t.rgb.split(",").length).toBe(3);
  });
});
