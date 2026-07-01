/* =============================================================
   Persist migrasyonu — saf, store'dan bağımsız (test edilebilir).

   Dönen kullanıcının diskteki verisini güncel şemaya taşır. En riskli
   parça eski `expenses` map'inin (gün → tutar) yeni `entries` listesine
   dönüşümü ve bozuk kalemlerin elenmesidir — buradaki bir regresyon
   kullanıcı verisini sessizce kaybettirir, bu yüzden ayrı test edilir.
   ============================================================= */

import { isCategoryRef } from "./categories";
import type { ExpenseEntry } from "./engine";

/** Basit benzersiz kimlik (crypto varsa onu kullan). */
function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

/** "YYYY-MM-DD" gün anahtarı mı? (migrate güvenliği için.) */
export function isDayKey(k: unknown): k is string {
  return typeof k === "string" && /^\d{4}-\d{2}-\d{2}$/.test(k);
}

/**
 * Diskteki state'ten geçerli harcama kalemlerini çıkarır (saf).
 * - Yeni şema: `entries` dizisi → bozuk/≤0 kalemleri eler, bilinmeyen
 *   kategorileri `undefined`'a düşürür ("Diğer" olarak analiz edilir).
 * - Eski şema: `expenses` map'i (gün → tutar) → kalem listesine çevirir.
 */
export function migrateEntries(persisted: unknown): ExpenseEntry[] {
  const s = (persisted ?? {}) as Record<string, unknown>;
  if (Array.isArray(s.entries)) {
    return s.entries
      .filter(
        (e): e is ExpenseEntry =>
          !!e &&
          typeof e === "object" &&
          typeof (e as ExpenseEntry).id === "string" &&
          isDayKey((e as ExpenseEntry).day) &&
          typeof (e as ExpenseEntry).amount === "number" &&
          (e as ExpenseEntry).amount > 0,
      )
      // Bilinmeyen kategori kimliklerini at — analitik "Diğer"e düşürür.
      // Custom (`c_…`) kimlikler korunur; silinmişse görüntüde "Diğer"e düşer.
      .map((e) => (isCategoryRef(e.category) ? e : { ...e, category: undefined }));
  }

  const expenses = s.expenses;
  if (!expenses || typeof expenses !== "object") return [];
  const entries: ExpenseEntry[] = [];
  for (const [day, value] of Object.entries(expenses)) {
    if (!isDayKey(day) || typeof value !== "number" || value <= 0) continue;
    entries.push({ id: uid(), day, amount: value, ts: Date.parse(`${day}T12:00`) });
  }
  return entries;
}
