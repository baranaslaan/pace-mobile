import { useMemo } from "react";
import { usePaceStore } from "@/shared/store/usePaceStore";
import {
  dailyLimit,
  remainingToday,
  spentToday,
  burnForecast,
  monthStats,
  spendableThisMonth,
  totalSubscriptions,
  expensesByDay,
  type PaceSnapshot,
} from "@/shared/lib/engine";
import { formatMoney } from "@/shared/lib/money";
import { translate, type Language } from "@/shared/i18n";

/**
 * Kurulum/uç durum bayrağı:
 * - `"no-budget"`     → bütçe girilmemiş (limit hesaplanamaz)
 * - `"oversubscribed"`→ sabit giderler bütçeyi yiyor, harcanabilir havuz yok
 * - `null`            → normal akış
 */
export type SetupState = "no-budget" | "oversubscribed" | null;

/** Günlük limit + tempo durumunu store'dan dinamik olarak türetir. */
export function useLimitLogic() {
  const budget = usePaceStore((s) => s.budget);
  const subscriptions = usePaceStore((s) => s.subscriptions);
  const entries = usePaceStore((s) => s.entries);
  const currency = usePaceStore((s) => s.currency);
  const rates = usePaceStore((s) => s.rates);
  const language = usePaceStore((s) => s.language) as Language;

  return useMemo(() => {
    const snap: PaceSnapshot = {
      budget,
      subscriptions,
      expenses: expensesByDay(entries),
    };
    const now = new Date();
    const pool = spendableThisMonth(snap);
    const subsTotal = totalSubscriptions(subscriptions);

    // Havuz 0 ise iki ayrı sebep var; alarm veren "kritik" ring yerine
    // yönlendirici kurulum durumu göstermek için ayırt et.
    const setup: SetupState =
      budget <= 0 ? "no-budget" : pool <= 0 ? "oversubscribed" : null;

    // Taban tutarı görüntü birimine çevirip biçimlendiren fmt. Bileşenler
    // aynısını useCurrency üzerinden kullanır.
    const rate = rates[currency] && rates[currency] > 0 ? rates[currency] : 1;
    const fmt = (base: number) => formatMoney(base * rate, currency);

    // Saf forecast'a dile göre mesaj giydir (motor dilden bağımsız kaldı).
    const f = burnForecast(snap, now);
    const message =
      f.kind === "none"
        ? translate(language, "analytics.forecastNone")
        : f.kind === "surplus"
          ? translate(language, "analytics.forecastSurplus", { balance: fmt(f.endBalance) })
          : translate(language, "analytics.forecastDeficit", { day: f.zeroDay ?? 0 });

    const limit = dailyLimit(snap, now);
    // Rollover görünür biçimde devrede mi: bugünkü limit, düz günlük paydan
    // (havuz / aydaki gün) anlamlı ölçüde saptıysa devir mekaniği çalışmış
    // demektir (az harcandıysa yukarı, aşıldıysa aşağı). İpucu tetikçisi.
    const stats = monthStats(snap, now);
    const evenShare = stats.total > 0 ? pool / stats.total : 0;
    const rolloverActive =
      pool > 0 && Math.abs(limit - evenShare) > Math.max(1, evenShare * 0.05);

    return {
      limit,
      remaining: remainingToday(snap, now),
      spent: spentToday(snap, now),
      forecast: { ...f, message },
      stats,
      pool,
      subsTotal,
      budget,
      setup,
      rolloverActive,
    };
  }, [budget, subscriptions, entries, currency, rates, language]);
}
