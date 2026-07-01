/* =============================================================
   Bütçe-eşiği uyarıları — efekt katmanı.
   Ay-başı harcama, harcanabilir havuzun (pool) bir eşiğini yeni aştığında
   tek seferlik yerel bildirim + haptik atar. Ay-başına dedupe edilir; yeni
   ayda sessizce yeniden tabanlanır (açılışta/ay devrinde spam olmaz).
   Saf karar {@link ../../../shared/lib/budgetAlerts}, yan etki burada.
   ============================================================= */

import { useEffect, useRef } from "react";
import { usePaceStore } from "@/shared/store/usePaceStore";
import { useDayKey } from "@/shared/store/useDayKey";
import { monthStats, expensesByDay, type PaceSnapshot } from "@/shared/lib/engine";
import { monthKey } from "@/shared/lib/date";
import {
  budgetUsagePct,
  thresholdsMet,
  newlyCrossedThreshold,
  DEFAULT_BUDGET_THRESHOLDS,
} from "@/shared/lib/budgetAlerts";
import { presentBudgetAlert } from "@/shared/lib/notifications";
import { tapWarn } from "@/shared/lib/haptics";
import { translate, type Language } from "@/shared/i18n";

/** %100 ve üstü = "aştın", altı = "yaklaşıyorsun". Metin anahtarını seçer. */
function messageFor(threshold: number, lang: Language, pct: number) {
  const over = threshold >= 100;
  return {
    title: translate(lang, over ? "budgetAlert.overTitle" : "budgetAlert.nearTitle"),
    body: translate(lang, over ? "budgetAlert.overBody" : "budgetAlert.nearBody", {
      pct: Math.round(pct),
    }),
  };
}

/**
 * Kök ekranda bir kez mount edilir. Store'daki harcama/bütçe değişimini izler.
 * Bildirim izni {@link presentBudgetAlert} içinde kontrol edilir (izin yoksa sessiz).
 */
export function useBudgetAlerts(): void {
  const hydrated = usePaceStore((s) => s._hydrated);
  const enabled = usePaceStore((s) => s.budgetAlertsEnabled);
  const budget = usePaceStore((s) => s.budget);
  const subscriptions = usePaceStore((s) => s.subscriptions);
  const entries = usePaceStore((s) => s.entries);
  const alertState = usePaceStore((s) => s.budgetAlertState);
  const setBudgetAlertState = usePaceStore((s) => s.setBudgetAlertState);
  const language = usePaceStore((s) => s.language) as Language;
  const today = useDayKey();

  // Aynı efekt çalışmasında iki kez tetiklenmesini önle (StrictMode/hızlı render).
  const busy = useRef(false);

  useEffect(() => {
    if (!hydrated || !enabled || busy.current) return;

    const now = new Date(`${today}T12:00:00`);
    const month = monthKey(now);
    const snap: PaceSnapshot = {
      budget,
      subscriptions,
      expenses: expensesByDay(entries),
    };
    const { pool, spent } = monthStats(snap, now);
    const usage = budgetUsagePct(spent, pool);

    // Yeni ay (ya da ilk değerlendirme): mevcut durumu sessizce tabanla.
    // Böylece açılışta/ay devrinde bayat bir uyarı atılmaz — yalnızca bundan
    // sonra YENİ aşılan eşikler bildirilir.
    if (alertState.month !== month) {
      setBudgetAlertState(month, thresholdsMet(usage, DEFAULT_BUDGET_THRESHOLDS));
      return;
    }

    const threshold = newlyCrossedThreshold(
      usage,
      alertState.crossed,
      DEFAULT_BUDGET_THRESHOLDS,
    );
    if (threshold == null || usage == null) return;

    busy.current = true;
    tapWarn();
    void presentBudgetAlert(messageFor(threshold, language, usage)).finally(() => {
      busy.current = false;
    });
    // Bu aşımla karşılanan tüm eşikleri "uyarıldı" işaretle (ör. 0→%120'de
    // hem 80 hem 100 kapanır, 80 sonradan tekrar tetiklenmez).
    setBudgetAlertState(month, thresholdsMet(usage, DEFAULT_BUDGET_THRESHOLDS));
  }, [
    hydrated,
    enabled,
    budget,
    subscriptions,
    entries,
    alertState,
    setBudgetAlertState,
    language,
    today,
  ]);
}
