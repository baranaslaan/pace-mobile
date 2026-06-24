import { describe, it, expect } from "vitest";
import { FALLBACK_RATES, isRateTable, RATES_BASE } from "../rates";

describe("rates", () => {
  it("yedek tablo tabanı 1, USD pozitif", () => {
    expect(FALLBACK_RATES[RATES_BASE]).toBe(1);
    expect(FALLBACK_RATES.USD).toBeGreaterThan(0);
  });

  it("isRateTable taban=1 ve geçerli USD ister", () => {
    expect(isRateTable(FALLBACK_RATES)).toBe(true);
    expect(isRateTable({ TRY: 1, USD: 0.03 })).toBe(true);
    expect(isRateTable({ TRY: 2, USD: 0.03 })).toBe(false); // taban 1 değil
    expect(isRateTable({ TRY: 1 })).toBe(false); // USD yok
    expect(isRateTable(null)).toBe(false);
    expect(isRateTable("x")).toBe(false);
  });
});
