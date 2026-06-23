/* =============================================================
   Tarih yardımcıları — saf, yan etkisiz.
   Anahtar formatı: "YYYY-MM-DD" (gün), "YYYY-MM" (ay). Hepsi yerel saat.
   ============================================================= */

/** İki haneli sayı ("3" → "03"). */
function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Yerel tarih → "YYYY-MM-DD". */
export function dayKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Yerel tarih → "YYYY-MM". */
export function monthKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

/** Bir gün anahtarının ait olduğu ay ("2026-06-16" → "2026-06"). */
export function monthOf(key: string): string {
  return key.slice(0, 7);
}

/** O ayın toplam gün sayısı. */
export function daysInMonth(d: Date = new Date()): number {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

/** Bugün dahil ayın kalan gün sayısı (örn. 16'sı → 30 günlük ayda 15). */
export function remainingDaysInclusive(d: Date = new Date()): number {
  return daysInMonth(d) - d.getDate() + 1;
}

/** Ayın kaçıncı günü (1..31). */
export function dayOfMonth(d: Date = new Date()): number {
  return d.getDate();
}

/** Epoch ms → "HH:MM" (yerel) — gün içi kalem saatini göstermek için. */
export function timeLabel(ts: number): string {
  const d = new Date(ts);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
