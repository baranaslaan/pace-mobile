import { describe, it, expect } from "vitest";
import {
  formatMoney,
  symbolOf,
  currencyByCode,
  isCurrencyCode,
  groupDigits,
  parseGrouped,
  groupSeparatorOf,
  DEFAULT_CURRENCY,
} from "../money";

describe("money", () => {
  it("isCurrencyCode bilinen kodları doğrular", () => {
    expect(isCurrencyCode("TRY")).toBe(true);
    expect(isCurrencyCode("USD")).toBe(true);
    expect(isCurrencyCode("XYZ")).toBe(false);
    expect(isCurrencyCode(undefined)).toBe(false);
  });

  it("currencyByCode bilinmeyende varsayılana düşer", () => {
    expect(currencyByCode("USD").code).toBe("USD");
    expect(currencyByCode("XYZ").code).toBe(DEFAULT_CURRENCY);
    expect(currencyByCode(undefined).code).toBe(DEFAULT_CURRENCY);
  });

  it("symbolOf sembolü verir", () => {
    expect(symbolOf("USD")).toBe("$");
    expect(symbolOf("TRY")).toBe("₺");
    expect(symbolOf("EUR")).toBe("€");
  });

  it("formatMoney sembol ön ekli, yuvarlanmış, binlik ayıraçlı", () => {
    expect(formatMoney(123.4, "USD")).toBe("$123");
    expect(formatMoney(123.6, "TRY")).toBe("₺124");
    expect(formatMoney(0, "EUR")).toBe("€0");
    // Binlik ayıracı para birimine göre (TRY/EUR "." · USD/GBP ",").
    expect(formatMoney(4286, "TRY")).toBe("₺4.286");
    expect(formatMoney(1234567, "USD")).toBe("$1,234,567");
    expect(formatMoney(15000, "EUR")).toBe("€15.000");
    expect(formatMoney(-2500, "GBP")).toBe("£-2,500");
  });

  it("groupSeparatorOf para birimine göre ayıraç verir", () => {
    expect(groupSeparatorOf("TRY")).toBe(".");
    expect(groupSeparatorOf("USD")).toBe(",");
  });

  it("groupDigits ham metni canlı binlik ayıraçlı tam sayıya çevirir", () => {
    expect(groupDigits("", ".")).toBe("");
    expect(groupDigits("5", ".")).toBe("5");
    expect(groupDigits("1234", ".")).toBe("1.234");
    expect(groupDigits("1234567", ",")).toBe("1,234,567");
    // Rakam dışı karakterleri ve baştaki sıfırları temizler.
    expect(groupDigits("1.2a3,4", ".")).toBe("1.234");
    expect(groupDigits("007", ".")).toBe("7");
    expect(groupDigits("abc", ".")).toBe("");
  });

  it("parseGrouped gruplu metinden sayısal değer üretir", () => {
    expect(parseGrouped("1.234")).toBe(1234);
    expect(parseGrouped("1,234,567")).toBe(1234567);
    expect(parseGrouped("5")).toBe(5);
    expect(Number.isNaN(parseGrouped(""))).toBe(true);
    expect(Number.isNaN(parseGrouped("abc"))).toBe(true);
  });
});
