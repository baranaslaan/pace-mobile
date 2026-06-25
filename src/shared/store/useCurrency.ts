import { useMemo } from "react";
import { usePaceStore } from "./usePaceStore";
import { symbolOf, formatMoney, formatNumber, groupSeparatorOf, groupDigits } from "@/shared/lib/money";

/**
 * Aktif para birimini + kur dönüşümünü store'dan reaktif olarak verir.
 *
 * Depodaki tüm tutarlar TABAN birimdedir (bkz. rates.ts). Bu hook görüntü
 * birimine çevirir:
 * - `toDisplay(base)` : taban tutar → görüntü tutarı (gösterim için).
 * - `toBase(display)` : kullanıcının girdiği görüntü tutarı → taban (saklama).
 * - `fmt(base)`       : taban tutarı sembollü, yuvarlanmış metne çevirir.
 * - `symbol`          : sadece sembol (ön ek Text'leri, "X / gün" birimi).
 */
export function useCurrency() {
  const currency = usePaceStore((s) => s.currency);
  const rates = usePaceStore((s) => s.rates);

  return useMemo(() => {
    // rate = 1 taban birim kaç görüntü birimi eder.
    const rate = rates[currency] && rates[currency] > 0 ? rates[currency] : 1;
    const symbol = symbolOf(currency);
    const group = groupSeparatorOf(currency);
    const toDisplay = (base: number) => base * rate;
    const toBase = (display: number) => display / rate;
    return {
      currency,
      symbol,
      rate,
      group,
      toDisplay,
      toBase,
      fmt: (base: number) => formatMoney(toDisplay(base), currency),
      // Sembolsüz, görüntü birimine çevrilmiş, gruplu sayı (ör. ring içi).
      fmtNum: (base: number) => formatNumber(toDisplay(base), currency),
      // Kullanıcının yazdığı ham metni canlı binlik ayıraçlı biçime sokar.
      groupLive: (raw: string) => groupDigits(raw, group),
      // Taban tutarı, input'ta düzenlenebilir gruplu metne çevirir.
      toGroupedInput: (base: number) => formatNumber(toDisplay(base), currency),
    };
  }, [currency, rates]);
}
