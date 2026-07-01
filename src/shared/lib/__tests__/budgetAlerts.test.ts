import { describe, it, expect } from "vitest";
import {
  budgetUsagePct,
  thresholdsMet,
  newlyCrossedThreshold,
  isBudgetAlertState,
  DEFAULT_BUDGET_THRESHOLDS,
} from "../budgetAlerts";

describe("budgetUsagePct", () => {
  it("havuz yoksa null (eşik anlamsız)", () => {
    expect(budgetUsagePct(50, 0)).toBeNull();
    expect(budgetUsagePct(50, -10)).toBeNull();
  });

  it("oranı yüzde olarak verir", () => {
    expect(budgetUsagePct(0, 1000)).toBe(0);
    expect(budgetUsagePct(800, 1000)).toBe(80);
    expect(budgetUsagePct(1200, 1000)).toBe(120);
  });

  it("geçersiz spent → null", () => {
    expect(budgetUsagePct(NaN, 1000)).toBeNull();
  });
});

describe("thresholdsMet", () => {
  it("null kullanımda hiçbiri", () => {
    expect(thresholdsMet(null)).toEqual([]);
  });

  it("karşılanan tüm eşikleri döndürür", () => {
    expect(thresholdsMet(50)).toEqual([]);
    expect(thresholdsMet(80)).toEqual([80]);
    expect(thresholdsMet(100)).toEqual([80, 100]);
    expect(thresholdsMet(130)).toEqual([80, 100]);
  });
});

describe("newlyCrossedThreshold", () => {
  it("eşik altındayken null", () => {
    expect(newlyCrossedThreshold(50, [])).toBeNull();
  });

  it("ilk aşımda ilgili eşiği duyurur", () => {
    expect(newlyCrossedThreshold(80, [])).toBe(80);
  });

  it("zaten uyarılan eşiği tekrar duyurmaz", () => {
    expect(newlyCrossedThreshold(85, [80])).toBeNull();
  });

  it("tek harcamada iki eşik atlanırsa en yükseği duyurur", () => {
    expect(newlyCrossedThreshold(120, [])).toBe(100);
  });

  it("80 uyarıldıysa 100'ü ayrıca duyurur", () => {
    expect(newlyCrossedThreshold(100, [80])).toBe(100);
  });

  it("havuz yoksa (null) sessiz", () => {
    expect(newlyCrossedThreshold(null, [])).toBeNull();
  });
});

describe("isBudgetAlertState", () => {
  it("geçerli şekli doğrular", () => {
    expect(isBudgetAlertState({ month: "2026-07", crossed: [80] })).toBe(true);
    expect(isBudgetAlertState({ month: "", crossed: [] })).toBe(true);
  });

  it("bozuk şekli reddeder", () => {
    expect(isBudgetAlertState(null)).toBe(false);
    expect(isBudgetAlertState({ month: 7, crossed: [] })).toBe(false);
    expect(isBudgetAlertState({ month: "x", crossed: ["80"] })).toBe(false);
  });
});

describe("DEFAULT_BUDGET_THRESHOLDS", () => {
  it("%80 ve %100", () => {
    expect(DEFAULT_BUDGET_THRESHOLDS).toEqual([80, 100]);
  });
});
