import React, { useMemo } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { Text } from "../../../shared/typography/Text";
import { usePaceStore } from "../../../shared/store/usePaceStore";
import { useLimitLogic } from "../../limit-board/hooks/useLimitLogic";
import { expensesByDay, weeklyTrend, categoryBreakdown, topExpenses } from "../../../shared/lib/engine";
import { useCategories } from "../../../shared/store/useCategories";
import { useCurrency } from "../../../shared/store/useCurrency";
import { useT, monthLabel } from "../../../shared/i18n";
import { monthKey } from "../../../shared/lib/date";
import { BottomSheet } from "../../../shared/ui/BottomSheet";
import { ProUpsell } from "../../pro/components/ProUpsell";
import { theme } from "../../../shared/styles/theme";

/** Bütçe kullanım yüzdesine göre çubuk/etiket rengi. */
function usageColor(pct: number): string {
  if (pct >= 100) return theme.colors.stateOver;
  if (pct >= 80) return theme.colors.stateWarn;
  return theme.colors.stateGood;
}

interface AnalyticsSheetProps {
  open: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

export function AnalyticsSheet({ open, onClose, onUpgrade }: AnalyticsSheetProps) {
  const entries = usePaceStore((s) => s.entries);
  const archive = usePaceStore((s) => s.archive);
  const isPro = usePaceStore((s) => s.isPro);
  const categoryBudgets = usePaceStore((s) => s.categoryBudgets);
  const { resolve: resolveCat } = useCategories();
  const { forecast, stats } = useLimitLogic();
  const { fmt } = useCurrency();
  const { t, tu, lang } = useT();

  // Engine türetmelerini tek seferde memoize et — açık sheet'te her render'da
  // entries üzerinden tekrar tarama yapılmasını önler.
  const a = useMemo(() => {
    const expMap = expensesByDay(entries);
    const categories = categoryBreakdown(entries, monthKey());
    const top = topExpenses(entries, monthKey(), 3);
    return {
      trend: weeklyTrend(expMap),
      categories,
      maxCategory: Math.max(1, ...categories.map((c) => c.total)),
      top,
      maxTop: Math.max(1, ...top.map((e) => e.amount)),
    };
  }, [entries]);

  const { trend, categories, maxCategory, top, maxTop } = a;

  // Bütçe durumu: limit koyulmuş kategoriler, kullanıma göre (kritik en üstte).
  const budgetRows = useMemo(() => {
    const spentByCat: Record<string, number> = {};
    for (const c of categories) spentByCat[c.categoryId] = c.total;
    return Object.entries(categoryBudgets)
      .map(([id, limit]) => {
        const spent = spentByCat[id] ?? 0;
        return { id, limit, spent, pct: limit > 0 ? (spent / limit) * 100 : 0 };
      })
      .sort((x, y) => y.pct - x.pct);
  }, [categories, categoryBudgets]);

  const surplus = forecast.endBalance >= 0;
  const projected = Math.round(stats.pace * stats.total);

  // Trend yönü: harcama azaldıysa "iyi" (mavi), arttıysa "uyarı" (amber).
  const down = trend.deltaPct !== null && trend.deltaPct < 0;
  const deltaAbs = trend.deltaPct === null ? 0 : Math.abs(Math.round(trend.deltaPct));

  return (
    <BottomSheet open={open} onClose={onClose} title={t("analytics.title")}>
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 0 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statValue} numberOfLines={1} ellipsizeMode="tail">{fmt(stats.spent)}</Text>
            <Text style={styles.statLabel}>{tu("analytics.spent")}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.stat}>
            <Text style={styles.statValue} numberOfLines={1} ellipsizeMode="tail">{fmt(stats.pace)}</Text>
            <Text style={styles.statLabel}>{tu("analytics.dailyAvg")}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.stat}>
            <Text style={styles.statValue} numberOfLines={1} ellipsizeMode="tail">{fmt(stats.pool)}</Text>
            <Text style={styles.statLabel}>{tu("analytics.pool")}</Text>
          </View>
        </View>

        <View style={styles.proWrap}>
          {/* Kilitli analiz yalnızca Pro'da çizilir — ücretsizde arkadan sızmasın. */}
          {isPro && (
            <>
            <Text style={styles.sectionLabel}>{t("analytics.weeklyPace")}</Text>
            <View style={styles.trendCard}>
              <View style={styles.trendTop}>
                <View>
                  <Text style={styles.trendValue} numberOfLines={1}>{fmt(trend.thisWeek)}</Text>
                  <Text style={styles.trendCaption}>{tu("analytics.last7")}</Text>
                </View>
                {trend.deltaPct !== null && (
                  <View style={[styles.trendChip, down ? styles.trendChipDown : styles.trendChipUp]}>
                    <Text style={[styles.trendChipText, down ? styles.trendChipTextDown : styles.trendChipTextUp]}>
                      {down ? "↓" : "↑"} {t("common.pct", { n: deltaAbs })}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.trendNote}>
                {trend.deltaPct === null
                  ? t("analytics.trendNoData")
                  : down
                    ? t("analytics.trendDown", { pct: deltaAbs })
                    : t("analytics.trendUp", { pct: deltaAbs })}
              </Text>
            </View>

            <View style={[styles.forecast, surplus ? styles.forecastGood : styles.forecastBad]}>
              <Text style={styles.forecastLabel}>{t("analytics.forecastTitle")}</Text>
              <Text style={[styles.forecastMsg, surplus ? styles.forecastMsgGood : styles.forecastMsgBad]}>
                {forecast.message}
              </Text>
              {stats.pace > 0 && (
                <Text style={styles.forecastSub}>
                  {t("analytics.forecastSub", { projected: fmt(projected), pool: fmt(stats.pool) })}
                </Text>
              )}
            </View>

            {categories.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>{t("analytics.categories")}</Text>
                <View style={styles.cats}>
                  {categories.map((c) => {
                    const cat = resolveCat(c.categoryId);
                    return (
                      <View key={c.categoryId} style={styles.catRow}>
                        <View style={[styles.catDot, { backgroundColor: cat.color }]} />
                        <Text style={styles.catName}>{cat.name}</Text>
                        <View style={styles.catBarTrack}>
                          <View
                            style={[
                              styles.catBar,
                              { width: `${(c.total / maxCategory) * 100}%`, backgroundColor: cat.color },
                            ]}
                          />
                        </View>
                        <Text style={styles.catPct}>{t("common.pct", { n: Math.round(c.share * 100) })}</Text>
                        <Text style={styles.catAmount} numberOfLines={1} ellipsizeMode="tail">{fmt(c.total)}</Text>
                      </View>
                    );
                  })}
                </View>
              </>
            )}

            {budgetRows.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>{t("analytics.budgetStatus")}</Text>
                <View style={styles.cats}>
                  {budgetRows.map((b) => {
                    const cat = resolveCat(b.id);
                    const barPct = Math.min(100, b.pct);
                    return (
                      <View key={b.id} style={styles.catRow}>
                        <View style={[styles.catDot, { backgroundColor: cat.color }]} />
                        <Text style={styles.catName}>{cat.name}</Text>
                        <View style={styles.catBarTrack}>
                          <View
                            style={[styles.catBar, { width: `${barPct}%`, backgroundColor: usageColor(b.pct) }]}
                          />
                        </View>
                        <Text style={styles.budgetAmount} numberOfLines={1} ellipsizeMode="tail">
                          {fmt(b.spent)}
                          <Text style={styles.budgetLimit}> / {fmt(b.limit)}</Text>
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </>
            )}

            {top.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>{t("analytics.biggest")}</Text>
                <View style={styles.tops}>
                  {top.map((e) => {
                    const cat = resolveCat(e.category);
                    const note = e.note?.trim();
                    const label = cat.name;
                    return (
                      <View key={e.id} style={styles.topRow}>
                        <View style={[styles.catDot, { backgroundColor: cat.color }]} />
                        <View style={styles.topMeta}>
                          <Text style={styles.topName} numberOfLines={1}>
                            {note || label}
                          </Text>
                          {note ? <Text style={styles.topSub}>{label}</Text> : null}
                        </View>
                        <View style={styles.topBarTrack}>
                          <View
                            style={[
                              styles.topBar,
                              { width: `${(e.amount / maxTop) * 100}%`, backgroundColor: cat.color },
                            ]}
                          />
                        </View>
                        <Text style={styles.topAmount} numberOfLines={1} ellipsizeMode="tail">{fmt(e.amount)}</Text>
                      </View>
                    );
                  })}
                </View>
              </>
            )}

            {archive.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>{t("analytics.pastMonths")}</Text>
                <View style={styles.months}>
                  {archive.map((mo) => {
                    const within = mo.spent <= mo.pool;
                    return (
                      <View key={mo.month} style={styles.monthRow}>
                        <View style={[styles.monthDot, within ? styles.monthDotGood : styles.monthDotBad]} />
                        <Text style={styles.monthName} numberOfLines={1}>{monthLabel(lang, mo.month)}</Text>
                        <Text style={styles.monthSpent} numberOfLines={1}>
                          {fmt(mo.spent)}
                          <Text style={styles.monthPool}> / {fmt(mo.pool)}</Text>
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </>
            )}
            </>
          )}

          {!isPro && (
            <ProUpsell
              title={t("analytics.lockTitle")}
              text={t("analytics.lockText")}
              cta={t("analytics.goPro")}
              onUpgrade={onUpgrade}
            />
          )}
        </View>
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  // Sheet'in 88%'ine kadar uzar, ondan sonra içerik scroll eder.
  scroll: {
    flexShrink: 1,
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 32,
  },
  stat: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 8,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: theme.colors.textPrimary,
    marginBottom: 4,
    // Genişliği stat'a sabitle: tek satıra sığsın, taşarsa font küçülsün.
    alignSelf: "stretch",
    textAlign: "center",
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textMute,
  },
  proWrap: {
    position: "relative",
  },
  forecast: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 32,
  },
  forecastGood: {
    backgroundColor: "rgba(59, 130, 246, 0.08)",
    borderColor: "rgba(59, 130, 246, 0.2)",
  },
  forecastBad: {
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    borderColor: "rgba(239, 68, 68, 0.2)",
  },
  forecastLabel: {
    fontSize: 13,
    color: theme.colors.textSoft,
    fontWeight: "600",
    marginBottom: 8,
  },
  forecastMsg: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
  },
  forecastMsgGood: {
    color: theme.colors.stateGood,
  },
  forecastMsgBad: {
    color: theme.colors.stateCrit,
  },
  forecastSub: {
    fontSize: 13,
    color: theme.colors.textSoft,
    marginTop: 10,
    fontVariant: ["tabular-nums"],
  },
  trendCard: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 32,
  },
  trendTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  trendValue: {
    fontSize: 24,
    fontWeight: "800",
    color: theme.colors.textPrimary,
    fontVariant: ["tabular-nums"],
  },
  trendCaption: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textMute,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  trendChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
  },
  trendChipDown: {
    backgroundColor: "rgba(59, 130, 246, 0.12)",
  },
  trendChipUp: {
    backgroundColor: "rgba(245, 158, 11, 0.12)",
  },
  trendChipText: {
    fontSize: 13,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  trendChipTextDown: {
    color: theme.colors.stateGood,
  },
  trendChipTextUp: {
    color: theme.colors.stateWarn,
  },
  trendNote: {
    fontSize: 13,
    color: theme.colors.textSoft,
    lineHeight: 19,
    marginTop: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: 16,
  },
  tops: {
    marginBottom: 32,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  topMeta: {
    width: 96,
    marginRight: 10,
  },
  topName: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  topSub: {
    fontSize: 11,
    fontWeight: "500",
    color: theme.colors.textMute,
    marginTop: 2,
  },
  topBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 4,
    marginRight: 10,
    overflow: "hidden",
  },
  topBar: {
    height: "100%",
    borderRadius: 4,
    minWidth: 4,
  },
  topAmount: {
    width: 56,
    textAlign: "right",
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    fontVariant: ["tabular-nums"],
  },
  cats: {
    marginBottom: 32,
  },
  catRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  catDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  catName: {
    width: 64,
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.textSoft,
  },
  catBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 4,
    marginRight: 10,
    overflow: "hidden",
  },
  catBar: {
    height: "100%",
    borderRadius: 4,
    minWidth: 4,
  },
  catPct: {
    width: 38,
    textAlign: "right",
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textMute,
    fontVariant: ["tabular-nums"],
  },
  catAmount: {
    width: 56,
    textAlign: "right",
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    fontVariant: ["tabular-nums"],
  },
  budgetAmount: {
    width: 104,
    textAlign: "right",
    fontSize: 12.5,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    fontVariant: ["tabular-nums"],
  },
  budgetLimit: {
    color: theme.colors.textMute,
    fontWeight: "500",
  },
  months: {
    marginBottom: 32,
  },
  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.track,
  },
  monthDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  monthDotGood: {
    backgroundColor: theme.colors.stateGood,
  },
  monthDotBad: {
    backgroundColor: theme.colors.stateCrit,
  },
  monthName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  monthSpent: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  monthPool: {
    color: theme.colors.textMute,
    fontWeight: "500",
  },
});
