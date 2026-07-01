/* =============================================================
   Bütçe-eşiği uyarıları — efekt katmanı.
   Ay-başı harcama, (genel bütçe VEYA bir kategori limitinin) bir eşiğini yeni
   aştığında tek seferlik yerel bildirim + haptik atar. Kapsam-başına + ay-başına
   dedupe edilir; yeni ayda sessizce yeniden tabanlanır (açılışta/ay devrinde spam
   olmaz). Bir efekt çalışmasında en fazla bir bildirim; öncelik genel bütçe, sonra
   kategoriler (görünüm sırasıyla) — kalanlar sonraki render'da sıradan çıkar.
   Saf karar {@link ../../../shared/lib/budgetAlerts}, yan etki burada.
   ============================================================= */

import { useEffect } from "react";
import { usePaceStore } from "@/shared/store/usePaceStore";
import { useDayKey } from "@/shared/store/useDayKey";
import {
  monthStats,
  categoryBreakdown,
  expensesByDay,
  type PaceSnapshot,
} from "@/shared/lib/engine";
import { monthKey } from "@/shared/lib/date";
import { CATEGORIES, categoryLabel, type Category } from "@/shared/lib/categories";
import {
  budgetUsagePct,
  thresholdsMet,
  newlyCrossedThreshold,
  DEFAULT_BUDGET_THRESHOLDS,
} from "@/shared/lib/budgetAlerts";
import { presentBudgetAlert } from "@/shared/lib/notifications";
import { tapWarn } from "@/shared/lib/haptics";
import { translate, type Language } from "@/shared/i18n";

interface AlertText {
  title: string;
  body: string;
}

/** %100 ve üstü = "aştın", altı = "yaklaşıyorsun". */
function overallMessage(threshold: number, lang: Language, pct: number): AlertText {
  const over = threshold >= 100;
  return {
    title: translate(lang, over ? "budgetAlert.overTitle" : "budgetAlert.nearTitle"),
    body: translate(lang, over ? "budgetAlert.overBody" : "budgetAlert.nearBody", {
      pct: Math.round(pct),
    }),
  };
}

function categoryMessage(
  cat: Category,
  threshold: number,
  lang: Language,
  pct: number,
): AlertText {
  const over = threshold >= 100;
  const name = categoryLabel(cat.id, lang);
  return {
    title: translate(lang, over ? "budgetAlert.catOverTitle" : "budgetAlert.catNearTitle", {
      cat: name,
    }),
    body: translate(lang, over ? "budgetAlert.catOverBody" : "budgetAlert.catNearBody", {
      cat: name,
      pct: Math.round(pct),
    }),
  };
}

/**
 * Kök ekranda bir kez mount edilir. Store'daki harcama/bütçe/kategori-limit
 * değişimini izler. Bildirim izni {@link presentBudgetAlert} içinde kontrol edilir.
 */
export function useBudgetAlerts(): void {
  const hydrated = usePaceStore((s) => s._hydrated);
  const enabled = usePaceStore((s) => s.budgetAlertsEnabled);
  const budget = usePaceStore((s) => s.budget);
  const subscriptions = usePaceStore((s) => s.subscriptions);
  const entries = usePaceStore((s) => s.entries);
  const categoryBudgets = usePaceStore((s) => s.categoryBudgets);
  const alertState = usePaceStore((s) => s.budgetAlertState);
  const setBudgetAlertState = usePaceStore((s) => s.setBudgetAlertState);
  const language = usePaceStore((s) => s.language) as Language;
  const today = useDayKey();

  useEffect(() => {
    if (!hydrated || !enabled) return;

    const now = new Date(`${today}T12:00:00`);
    const month = monthKey(now);
    const snap: PaceSnapshot = {
      budget,
      subscriptions,
      expenses: expensesByDay(entries),
    };
    const { pool, spent } = monthStats(snap, now);
    const overallUsage = budgetUsagePct(spent, pool);

    // Kategori-başı ay harcaması.
    const spentByCat: Record<string, number> = {};
    for (const slice of categoryBreakdown(entries, month)) {
      spentByCat[slice.categoryId] = slice.total;
    }
    const catUsage = (id: string) =>
      categoryBudgets[id] ? budgetUsagePct(spentByCat[id] ?? 0, categoryBudgets[id]) : null;

    // Yeni ay (ya da ilk değerlendirme): mevcut durumu sessizce tabanla — açılışta/
    // ay devrinde bayat uyarı atma, yalnızca bundan sonra YENİ aşımları bildir.
    if (alertState.month !== month) {
      const byCategory: Record<string, number[]> = {};
      for (const id of Object.keys(categoryBudgets)) {
        byCategory[id] = thresholdsMet(catUsage(id), DEFAULT_BUDGET_THRESHOLDS);
      }
      setBudgetAlertState({
        month,
        crossed: thresholdsMet(overallUsage, DEFAULT_BUDGET_THRESHOLDS),
        byCategory,
      });
      return;
    }

    // Tüm yeni aşımları tek geçişte topla (öncelik: genel bütçe, sonra
    // kategoriler görünüm sırasıyla), hepsini at, tek setState ile kaydet.
    // Böylece bir harcama hem genel hem kategori eşiğini aşarsa ikisi de düşer.
    const toFire: AlertText[] = [];
    let nextCrossed = alertState.crossed;
    let nextByCategory = alertState.byCategory;

    const overallThreshold = newlyCrossedThreshold(overallUsage, alertState.crossed);
    if (overallThreshold != null && overallUsage != null) {
      toFire.push(overallMessage(overallThreshold, language, overallUsage));
      nextCrossed = thresholdsMet(overallUsage, DEFAULT_BUDGET_THRESHOLDS);
    }

    for (const cat of CATEGORIES) {
      const usage = catUsage(cat.id);
      if (usage == null) continue;
      const already = alertState.byCategory[cat.id] ?? [];
      const threshold = newlyCrossedThreshold(usage, already);
      if (threshold == null) continue;
      toFire.push(categoryMessage(cat, threshold, language, usage));
      nextByCategory = {
        ...nextByCategory,
        [cat.id]: thresholdsMet(usage, DEFAULT_BUDGET_THRESHOLDS),
      };
    }

    if (toFire.length === 0) return;

    tapWarn();
    for (const text of toFire) void presentBudgetAlert(text);
    setBudgetAlertState({ month, crossed: nextCrossed, byCategory: nextByCategory });
  }, [
    hydrated,
    enabled,
    budget,
    subscriptions,
    entries,
    categoryBudgets,
    alertState,
    setBudgetAlertState,
    language,
    today,
  ]);
}
