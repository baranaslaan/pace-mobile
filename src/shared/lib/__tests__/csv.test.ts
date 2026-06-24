import { describe, it, expect } from "vitest";
import { expensesToCSV } from "../csv";
import type { ExpenseEntry } from "../engine";

function entry(day: string, hour: number, amount: number, over: Partial<ExpenseEntry> = {}): ExpenseEntry {
  return { id: day + hour, day, amount, ts: new Date(`${day}T${String(hour).padStart(2, "0")}:00`).getTime(), ...over };
}

describe("expensesToCSV", () => {
  it("başlık + tarihe göre artan satırlar üretir", () => {
    const csv = expensesToCSV([
      entry("2026-06-02", 9, 50),
      entry("2026-06-01", 8, 20, { category: "market" }),
    ]);
    const lines = csv.split("\n");
    expect(lines[0]).toBe("Tarih,Saat,Kategori,Tutar (TRY),Not");
    // 06-01 önce gelmeli (ts'e göre sıralı)
    expect(lines[1]).toBe("2026-06-01,08:00,Market,20,");
    expect(lines[2]).toBe("2026-06-02,09:00,Diğer,50,");
  });

  it("virgül/tırnak/yeni satır içeren notu kaçırır", () => {
    const csv = expensesToCSV([entry("2026-06-01", 8, 10, { note: 'a,b"c' })]);
    expect(csv.split("\n")[1]).toContain('"a,b""c"');
  });

  it("convert ile görüntü birimine çevirir ve başlığa kodu yazar", () => {
    const csv = expensesToCSV([entry("2026-06-01", 8, 1000)], {
      convert: (n) => n * 0.02,
      currencyCode: "USD",
    });
    const lines = csv.split("\n");
    expect(lines[0]).toContain("Tutar (USD)");
    expect(lines[1]).toBe("2026-06-01,08:00,Diğer,20,"); // 1000 * 0.02
  });

  it("özel kategori adı çözücüsü ve başlıkları kullanır", () => {
    const csv = expensesToCSV([entry("2026-06-01", 8, 10, { category: "market" })], {
      categoryLabel: () => "Groceries",
      headers: { date: "Date", time: "Time", category: "Category", amount: "Amount", note: "Note" },
    });
    const lines = csv.split("\n");
    expect(lines[0]).toBe("Date,Time,Category,Amount (TRY),Note");
    expect(lines[1]).toContain("Groceries");
  });
});
