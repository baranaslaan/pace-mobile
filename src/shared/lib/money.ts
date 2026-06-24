/* =============================================================
   Para birimi — saf, tek doğruluk kaynağı.

   Sembol ön ekli, tam sayıya yuvarlanmış biçim (mevcut "₺123" stiliyle
   uyumlu). Tutar dönüşümü YOK — kullanıcı bütçeyi seçtiği para biriminde
   girer; uygulama yalnızca sembolü değiştirir.
   ============================================================= */

export interface Currency {
  /** ISO 4217 kodu — store'da bu saklanır. */
  code: string;
  /** Görünen sembol. */
  symbol: string;
  /** Ayar ekranındaki ad (TR). */
  label: string;
}

/** Varsayılan para birimi (mevcut davranış). */
export const DEFAULT_CURRENCY = "TRY";

/** Seçilebilir para birimleri — ayar ekranındaki görünüm sırası. */
export const CURRENCIES: Currency[] = [
  { code: "TRY", symbol: "₺", label: "Türk Lirası" },
  { code: "USD", symbol: "$", label: "ABD Doları" },
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "GBP", symbol: "£", label: "Sterlin" },
];

const BY_CODE: Record<string, Currency> = Object.fromEntries(
  CURRENCIES.map((c) => [c.code, c]),
);

/** Geçerli para birimi kodu mu? (migrate/güven için.) */
export function isCurrencyCode(code: unknown): code is string {
  return typeof code === "string" && code in BY_CODE;
}

/** Koddan para birimi — bilinmeyen/eksik kod varsayılana düşer (asla null). */
export function currencyByCode(code: string | undefined): Currency {
  return (code && BY_CODE[code]) || BY_CODE[DEFAULT_CURRENCY];
}

/** Sadece sembol (ör. ön ek Text'leri ve "X / gün" birimi için). */
export function symbolOf(code: string | undefined): string {
  return currencyByCode(code).symbol;
}

/** Sembol ön ekli, tam sayıya yuvarlanmış tutar (ör. "₺123"). */
export function formatMoney(amount: number, code: string | undefined): string {
  return `${symbolOf(code)}${Math.round(amount)}`;
}
