import { describe, it, expect } from "vitest";
import {
  mostRecentDue,
  dueRecurring,
  isQuickTemplate,
  isRecurringRule,
  type RecurringRule,
} from "../recurring";

// 24 Haziran 2026, Çarşamba (getDay = 3).
const NOW = new Date(2026, 5, 24, 10, 0, 0);

function monthly(day: number, lastPostedDay?: string): RecurringRule {
  return { id: "m", label: "x", amount: 100, cadence: "monthly", day, lastPostedDay };
}
function weekly(day: number, lastPostedDay?: string): RecurringRule {
  return { id: "w", label: "x", amount: 100, cadence: "weekly", day, lastPostedDay };
}

describe("mostRecentDue", () => {
  it("aylık: günü geçtiyse bu ay", () => {
    expect(mostRecentDue(monthly(5), NOW)).toBe("2026-06-05");
  });

  it("aylık: günü gelmediyse geçen ay", () => {
    expect(mostRecentDue(monthly(28), NOW)).toBe("2026-05-28");
  });

  it("aylık: ay kısaysa son güne kırpılır", () => {
    // Haziran 30 gün → 31 bu ay gelmedi sayılır, geçen ay (Mayıs 31)
    expect(mostRecentDue(monthly(31), NOW)).toBe("2026-05-31");
  });

  it("haftalık: bugünden geriye o güne", () => {
    expect(mostRecentDue(weekly(1), NOW)).toBe("2026-06-22"); // Pazartesi
    expect(mostRecentDue(weekly(3), NOW)).toBe("2026-06-24"); // bugün (Çarşamba)
  });
});

describe("dueRecurring", () => {
  it("hiç postlanmamış kuralı döndürür", () => {
    expect(dueRecurring([monthly(5)], NOW)).toEqual([{ ruleId: "m", day: "2026-06-05" }]);
  });

  it("aynı vade zaten postlandıysa döndürmez", () => {
    expect(dueRecurring([monthly(5, "2026-06-05")], NOW)).toEqual([]);
  });

  it("eski vade postlandıysa yeni vadeyi döndürür", () => {
    expect(dueRecurring([monthly(5, "2026-05-05")], NOW)).toEqual([{ ruleId: "m", day: "2026-06-05" }]);
  });
});

describe("guards", () => {
  it("isQuickTemplate temel alanları doğrular", () => {
    expect(isQuickTemplate({ id: "1", label: "Kahve", amount: 50 })).toBe(true);
    expect(isQuickTemplate({ id: "1", label: "Kahve", amount: 50, category: "kahve" })).toBe(true);
    expect(isQuickTemplate({ id: "1", label: "Kahve", amount: 50, category: "yok" })).toBe(false);
    expect(isQuickTemplate({ id: "1", label: "  ", amount: 50 })).toBe(false);
    expect(isQuickTemplate({ id: "1", label: "x", amount: 0 })).toBe(false);
  });

  it("isRecurringRule cadence + gün aralığını doğrular", () => {
    expect(isRecurringRule(monthly(15))).toBe(true);
    expect(isRecurringRule(weekly(0))).toBe(true);
    expect(isRecurringRule({ ...monthly(0) })).toBe(false); // aylık gün < 1
    expect(isRecurringRule({ ...monthly(32) })).toBe(false); // aylık gün > 31
    expect(isRecurringRule({ ...weekly(7) })).toBe(false); // haftalık gün > 6
    expect(isRecurringRule({ ...monthly(5), cadence: "yearly" as any })).toBe(false);
  });
});
