import { describe, it, expect } from "vitest";
import {
  dayKey,
  monthKey,
  monthOf,
  daysInMonth,
  remainingDaysInclusive,
  dayOfMonth,
  timeLabel,
} from "../date";

describe("date", () => {
  it("dayKey/monthKey yerel tarihi sıfır dolgulu biçimler", () => {
    const d = new Date(2026, 0, 3, 9, 5); // 3 Ocak 2026
    expect(dayKey(d)).toBe("2026-01-03");
    expect(monthKey(d)).toBe("2026-01");
  });

  it("monthOf gün anahtarından ayı çıkarır", () => {
    expect(monthOf("2026-06-16")).toBe("2026-06");
  });

  it("daysInMonth ay uzunluğunu verir (artık yıl dahil)", () => {
    expect(daysInMonth(new Date(2026, 5, 1))).toBe(30); // Haziran
    expect(daysInMonth(new Date(2026, 1, 1))).toBe(28); // Şubat 2026
    expect(daysInMonth(new Date(2024, 1, 1))).toBe(29); // Şubat 2024 (artık)
  });

  it("remainingDaysInclusive bugünü dahil eder", () => {
    expect(remainingDaysInclusive(new Date(2026, 5, 16))).toBe(15); // 30 - 16 + 1
    expect(remainingDaysInclusive(new Date(2026, 5, 30))).toBe(1);
  });

  it("dayOfMonth ayın gününü verir", () => {
    expect(dayOfMonth(new Date(2026, 5, 7))).toBe(7);
  });

  it("timeLabel epoch'u HH:MM yapar", () => {
    const ts = new Date(2026, 5, 7, 8, 4).getTime();
    expect(timeLabel(ts)).toBe("08:04");
  });
});
