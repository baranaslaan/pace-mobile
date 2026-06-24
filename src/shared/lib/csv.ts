/* =============================================================
   CSV üretimi — saf, test edilebilir. Harcama kalemlerini
   Excel/Numbers uyumlu CSV metnine çevirir.
   ============================================================= */

import type { ExpenseEntry } from "./engine";
import { categoryById } from "./categories";
import { RATES_BASE } from "./rates";

export interface CSVOptions {
  /** Taban tutarı görüntü birimine çevirir (varsayılan: kimlik = taban). */
  convert?: (base: number) => number;
  /** Tutar sütunu başlığında gösterilecek para birimi kodu. */
  currencyCode?: string;
  /** Kategori kimliğini görünen ada çevirir (varsayılan: katalog TR adı). */
  categoryLabel?: (id: string | undefined) => string;
  /** Sütun başlıkları (varsayılan: TR). */
  headers?: { date: string; time: string; category: string; amount: string; note: string };
}

/**
 * Formül enjeksiyonunu etkisizleştirir: bir alan "=", "+", "-", "@", tab ya da
 * CR ile başlıyorsa, Excel/Numbers bunu formül olarak çalıştırabilir. Başına tek
 * tırnak koyup düz metin olarak yorumlanmasını sağlarız.
 */
function neutralizeFormula(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

/** Önce formülü etkisizleştir, sonra virgül/tırnak/yeni satırı CSV'ye göre kaçır. */
function escapeField(value: string): string {
  const safe = neutralizeFormula(value);
  if (/[",\n]/.test(safe)) {
    return `"${safe.replace(/"/g, '""')}"`;
  }
  return safe;
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
 * Sütunlar: Tarih, Saat, Kategori, Tutar (<kod>), Not. Tutarlar `convert` ile
 * görüntü birimine çevrilip yuvarlanır.
 */
export function expensesToCSV(
  entries: ExpenseEntry[],
  opts: CSVOptions = {},
): string {
  const convert = opts.convert ?? ((n) => n);
  const code = opts.currencyCode ?? RATES_BASE;
  const labelOf = opts.categoryLabel ?? ((id) => categoryById(id).label);
  const h = opts.headers ?? {
    date: "Tarih",
    time: "Saat",
    category: "Kategori",
    amount: "Tutar",
    note: "Not",
  };
  const header = `${h.date},${h.time},${h.category},${h.amount} (${code}),${h.note}`;
  const rows = [...entries]
    .sort((a, b) => a.ts - b.ts)
    .map((e) =>
      [
        e.day,
        timeOf(e.ts),
        escapeField(labelOf(e.category)),
        String(Math.round(convert(e.amount))),
        escapeField(e.note ?? ""),
      ].join(","),
    );
  return [header, ...rows].join("\n");
}
