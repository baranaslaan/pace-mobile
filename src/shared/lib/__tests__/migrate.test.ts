import { describe, it, expect } from "vitest";
import { isDayKey, migrateEntries } from "../migrate";

describe("isDayKey", () => {
  it("yalnızca YYYY-MM-DD biçimini kabul eder", () => {
    expect(isDayKey("2026-06-15")).toBe(true);
    expect(isDayKey("2026-6-15")).toBe(false);
    expect(isDayKey("2026-06")).toBe(false);
    expect(isDayKey(20260615)).toBe(false);
    expect(isDayKey(undefined)).toBe(false);
  });
});

describe("migrateEntries — yeni şema (entries dizisi)", () => {
  it("geçerli kalemleri korur, kategoriyi geçirir", () => {
    const out = migrateEntries({
      entries: [
        { id: "a", day: "2026-06-10", amount: 40, ts: 1, category: "market" },
        { id: "b", day: "2026-06-11", amount: 20, ts: 2 },
      ],
    });
    expect(out).toHaveLength(2);
    expect(out[0].category).toBe("market");
  });

  it("bozuk/≤0/eksik-alan kalemleri eler (veri-kaybı siperi)", () => {
    const out = migrateEntries({
      entries: [
        { id: "ok", day: "2026-06-10", amount: 40, ts: 1 },
        { id: "neg", day: "2026-06-10", amount: -5, ts: 1 },
        { id: "zero", day: "2026-06-10", amount: 0, ts: 1 },
        { id: "badday", day: "06/10", amount: 5, ts: 1 },
        { day: "2026-06-10", amount: 5, ts: 1 }, // id yok
        null,
        "garbage",
      ],
    });
    expect(out.map((e) => e.id)).toEqual(["ok"]);
  });

  it("bilinmeyen kategoriyi undefined'a düşürür", () => {
    const out = migrateEntries({
      entries: [{ id: "a", day: "2026-06-10", amount: 40, ts: 1, category: "uzaylı" }],
    });
    expect(out[0].category).toBeUndefined();
  });
});

describe("migrateEntries — eski şema (expenses map)", () => {
  it("gün→tutar map'ini kalem listesine çevirir", () => {
    const out = migrateEntries({
      expenses: { "2026-06-10": 100, "2026-06-11": 50 },
    });
    expect(out).toHaveLength(2);
    expect(out.map((e) => e.amount).sort((a, b) => a - b)).toEqual([50, 100]);
    expect(out.every((e) => typeof e.id === "string" && e.id.length > 0)).toBe(true);
    // ts vade gününün öğlesine sabitlenir.
    const ten = out.find((e) => e.day === "2026-06-10")!;
    expect(ten.ts).toBe(Date.parse("2026-06-10T12:00"));
  });

  it("geçersiz gün/tutar girişlerini atar", () => {
    const out = migrateEntries({
      expenses: { "2026-06-10": 100, "bad-day": 20, "2026-06-12": 0, "2026-06-13": -3 },
    });
    expect(out.map((e) => e.day)).toEqual(["2026-06-10"]);
  });

  it("hiç veri yoksa boş dizi", () => {
    expect(migrateEntries(undefined)).toEqual([]);
    expect(migrateEntries({})).toEqual([]);
    expect(migrateEntries({ expenses: null })).toEqual([]);
  });
});
