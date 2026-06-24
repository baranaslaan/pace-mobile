/* =============================================================
   CSV üretimi — saf, test edilebilir. Harcama kalemlerini
   Excel/Numbers uyumlu CSV metnine çevirir.
   ============================================================= */

import type { ExpenseEntry } from "./engine";
import { categoryById } from "./categories";

/** Virgül, tırnak veya yeni satır içeren alanı CSV kurallarına göre kaçır. */
function escapeField(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** Epoch ms → "HH:MM" (yerel). */
function timeOf(ts: number): string {
  const d = new Date(ts);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

/**
 * Harcama kalemlerini CSV metnine çevirir (tarih artan). Başlık satırı dahil.
 * Sütunlar: Tarih, Saat, Kategori, Tutar, Not.
 */
export function expensesToCSV(entries: ExpenseEntry[]): string {
  const header = "Tarih,Saat,Kategori,Tutar,Not";
  const rows = [...entries]
    .sort((a, b) => a.ts - b.ts)
    .map((e) =>
      [
        e.day,
        timeOf(e.ts),
        escapeField(categoryById(e.category).label),
        String(e.amount),
        escapeField(e.note ?? ""),
      ].join(","),
    );
  return [header, ...rows].join("\n");
}
