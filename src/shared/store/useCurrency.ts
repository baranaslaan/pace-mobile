import { useMemo } from "react";
import { usePaceStore } from "./usePaceStore";
import { symbolOf } from "@/shared/lib/money";

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
    const toDisplay = (base: number) => base * rate;
    const toBase = (display: number) => display / rate;
    return {
      currency,
      symbol,
      rate,
      toDisplay,
      toBase,
      fmt: (base: number) => `${symbol}${Math.round(toDisplay(base))}`,
    };
  }, [currency, rates]);
}
