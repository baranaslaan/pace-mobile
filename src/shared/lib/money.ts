/* =============================================================
   Para birimi — saf, tek doğruluk kaynağı.

   Sembol ön ekli, tam sayıya yuvarlanmış biçim (mevcut "₺123" stiliyle
   uyumlu). Bu modül yalnızca BİÇİMLENDİRME yapar; tutarlar tek taban
   birimde saklanır, görünüm birimine dönüşüm useCurrency + rates katmanında
   yapılır (bkz. shared/store/useCurrency, shared/lib/rates).
   ============================================================= */

export interface Currency {
  /** ISO 4217 kodu — store'da bu saklanır. */
  code: string;
  /** Görünen sembol. */
  symbol: string;
  /** Ayar ekranındaki ad (TR). */
  label: string;
  /** Binlik ayıracı (TRY/EUR "." · USD/GBP ","). */
  group: string;
}

/** Varsayılan para birimi (mevcut davranış). */
export const DEFAULT_CURRENCY = "TRY";

/** Seçilebilir para birimleri — ayar ekranındaki görünüm sırası. */
export const CURRENCIES: Currency[] = [
  { code: "TRY", symbol: "₺", label: "Türk Lirası", group: "." },
  { code: "USD", symbol: "$", label: "ABD Doları", group: "," },
  { code: "EUR", symbol: "€", label: "Euro", group: "." },
  { code: "GBP", symbol: "£", label: "Sterlin", group: "," },
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

/** Tam sayıya binlik ayıracı uygular (ör. 4286 → "4.286"). */
function groupThousands(n: number, sep: string): string {
  const sign = n < 0 ? "-" : "";
  const digits = String(Math.abs(n));
  return sign + digits.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
}

/** Sembolsüz, binlik ayıraçlı, yuvarlanmış sayı (ör. "4.286"). */
export function formatNumber(amount: number, code: string | undefined): string {
  return groupThousands(Math.round(amount), currencyByCode(code).group);
}

/** Sembol ön ekli, binlik ayıraçlı, yuvarlanmış tutar (ör. "₺4.286"). */
export function formatMoney(amount: number, code: string | undefined): string {
  return `${symbolOf(code)}${formatNumber(amount, code)}`;
}

/** Para biriminin binlik ayıracı (canlı input gruplaması için). */
export function groupSeparatorOf(code: string | undefined): string {
  return currencyByCode(code).group;
}

/**
 * Kullanıcının yazdığı ham metni binlik ayıraçlı tam sayıya çevirir
 * (ör. "12345" → "12.345"). Tutarlar her yerde yuvarlanarak gösterildiği
 * için giriş de tam sayıdır — ondalık ayıraç belirsizliği böylece kalkar.
 */
export function groupDigits(raw: string, sep: string): string {
  const digits = raw.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
  if (digits === "") return "";
  return groupThousands(Number(digits), sep);
}

/** Gruplu/ayıraçlı metinden sayısal değer (NaN = boş/geçersiz). */
export function parseGrouped(text: string): number {
  const digits = text.replace(/\D/g, "");
  return digits === "" ? Number.NaN : Number.parseInt(digits, 10);
}
