/* =============================================================
   Döviz kurları — taban birime (RATES_BASE) göre.

   rates[X] = 1 taban birim kaç X eder. Örn. base = TRY ise
   rates["USD"] = 0.0215 → 1 ₺ = 0.0215 $. Depodaki tüm tutarlar TABAN
   birimdedir; görüntü birimine çevirim `useCurrency` içinde yapılır.

   Canlı kaynak: frankfurter (ECB referans kurları, ücretsiz/anahtarsız).
   Çevrimdışı/ilk açılışta {@link FALLBACK_RATES} kullanılır.
   ============================================================= */

import { CURRENCIES, DEFAULT_CURRENCY } from "./money";

/** Depolama/taban para birimi — tüm tutarlar bu birimdedir. */
export const RATES_BASE = DEFAULT_CURRENCY; // "TRY"

/**
 * Yedek kurlar (2026-06-23, ECB/frankfurter) — 1 ₺ karşılığı.
 * Yalnızca canlı kur henüz çekilmediğinde/çevrimdışıyken kullanılır.
 */
export const FALLBACK_RATES: Record<string, number> = {
  TRY: 1,
  USD: 0.02151,
  EUR: 0.01889,
  GBP: 0.01628,
};

const SYMBOLS = CURRENCIES.map((c) => c.code)
  .filter((c) => c !== RATES_BASE)
  .join(",");

/** Geçerli bir kur tablosu mu? (migrate/güven için.) Taban her zaman 1 olmalı. */
export function isRateTable(value: unknown): value is Record<string, number> {
  if (!value || typeof value !== "object") return false;
  const r = value as Record<string, unknown>;
  return r[RATES_BASE] === 1 && typeof r.USD === "number" && r.USD > 0;
}

/**
 * Canlı kurları çeker (taban = RATES_BASE). Yalnızca tanımlı para birimlerini
 * ve pozitif değerleri döndürür; taban her zaman 1'dir. Hata fırlatabilir —
 * çağıran tarafta yakalanıp yedek/son bilinen kur korunmalıdır.
 */
export async function fetchRates(): Promise<Record<string, number>> {
  const url = `https://api.frankfurter.dev/v1/latest?base=${RATES_BASE}&symbols=${SYMBOLS}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`rates http ${res.status}`);
  const json = (await res.json()) as { rates?: Record<string, unknown> };
  const rates = json?.rates;
  if (!rates || typeof rates !== "object") throw new Error("bad rates payload");

  const out: Record<string, number> = { [RATES_BASE]: 1 };
  for (const c of CURRENCIES) {
    if (c.code === RATES_BASE) continue;
    const v = rates[c.code];
    if (typeof v === "number" && v > 0) out[c.code] = v;
  }
  return out;
}
