"use client";

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

    return {
      limit: dailyLimit(snap, now),
      remaining: remainingToday(snap, now),
      spent: spentToday(snap, now),
      forecast: burnForecast(snap, now),
      stats: monthStats(snap, now),
      pool,
      subsTotal,
      budget,
      setup,
    };
  }, [budget, subscriptions, entries]);
}
