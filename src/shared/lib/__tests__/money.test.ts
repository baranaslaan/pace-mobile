import { describe, it, expect } from "vitest";
import {
  formatMoney,
  symbolOf,
  currencyByCode,
  isCurrencyCode,
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

  it("formatMoney sembol ön ekli ve yuvarlanmış", () => {
    expect(formatMoney(123.4, "USD")).toBe("$123");
    expect(formatMoney(123.6, "TRY")).toBe("₺124");
    expect(formatMoney(0, "EUR")).toBe("€0");
  });
});
