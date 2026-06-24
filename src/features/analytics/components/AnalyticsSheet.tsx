import React from "react";
import { StyleSheet, View, TouchableOpacity, ScrollView } from "react-native";
import { Text } from "../../../shared/typography/Text";
import { usePaceStore } from "../../../shared/store/usePaceStore";
import { useLimitLogic } from "../../limit-board/hooks/useLimitLogic";
import { expensesByDay, weeklyTrend, weekdayBreakdown, categoryBreakdown } from "../../../shared/lib/engine";
import { categoryById } from "../../../shared/lib/categories";
import { dayKey, monthKey } from "../../../shared/lib/date";
import { BottomSheet } from "../../../shared/ui/BottomSheet";
import { LockIcon } from "../../../shared/ui/icons";
import { theme } from "../../../shared/styles/theme";

const HISTORY_DAYS = 7;

const MONTHS_TR = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

// Pazartesi-başlangıçlı görüntü sırası (JS getDay indeksi) + etiketleri.
const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const WEEKDAY_LABELS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const WEEKDAY_FULL = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

function monthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return `${MONTHS_TR[m - 1] ?? key} ${y}`;
}

interface DayBar {
  key: string;
  day: number;
  amount: number;
  isToday: boolean;
}

function recentDays(expenses: Record<string, number>, count: number): DayBar[] {
  const today = new Date();
  const out: DayBar[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (d.getMonth() !== today.getMonth()) continue;
    const key = dayKey(d);
    out.push({ key, day: d.getDate(), amount: expenses[key] ?? 0, isToday: i === 0 });
  }
  return out;
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
  const { forecast, stats } = useLimitLogic();

  const expMap = expensesByDay(entries);
  const days = recentDays(expMap, HISTORY_DAYS);
  const maxAmount = Math.max(1, ...days.map((d) => d.amount));
  const surplus = forecast.endBalance >= 0;

  const trend = weeklyTrend(expMap);
  const categories = categoryBreakdown(entries, monthKey());
  const maxCategory = Math.max(1, ...categories.map((c) => c.total));
  const weekdays = weekdayBreakdown(expMap);
  const maxWeekdayAvg = Math.max(1, ...weekdays.map((w) => w.avg));
  const peak = weekdays.reduce((a, b) => (b.avg > a.avg ? b : a), weekdays[0]);
  const projected = Math.round(stats.pace * stats.total);

  // Trend yönü: harcama azaldıysa "iyi" (mavi), arttıysa "uyarı" (amber).
  const down = trend.deltaPct !== null && trend.deltaPct < 0;
  const deltaAbs = trend.deltaPct === null ? 0 : Math.abs(Math.round(trend.deltaPct));

  return (
    <BottomSheet open={open} onClose={onClose} title="Tempo">
      <ScrollView contentContainerStyle={{ paddingBottom: 0 }} keyboardShouldPersistTaps="handled">
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>₺{Math.round(stats.spent)}</Text>
            <Text style={styles.statLabel}>harcanan</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>₺{Math.round(stats.pace)}</Text>
            <Text style={styles.statLabel}>günlük ort.</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>₺{Math.round(stats.pool)}</Text>
            <Text style={styles.statLabel}>havuz</Text>
          </View>
        </View>

        <View style={styles.proWrap}>
          <View style={!isPro && { opacity: 0.3, pointerEvents: "none" }}>
            <Text style={styles.sectionLabel}>Haftalık tempo</Text>
            <View style={styles.trendCard}>
              <View style={styles.trendTop}>
                <View>
                  <Text style={styles.trendValue}>₺{Math.round(trend.thisWeek)}</Text>
                  <Text style={styles.trendCaption}>son 7 gün</Text>
                </View>
                {trend.deltaPct !== null && (
                  <View style={[styles.trendChip, down ? styles.trendChipDown : styles.trendChipUp]}>
                    <Text style={[styles.trendChipText, down ? styles.trendChipTextDown : styles.trendChipTextUp]}>
                      {down ? "↓" : "↑"} %{deltaAbs}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.trendNote}>
                {trend.deltaPct === null
                  ? "Geçen hafta veri yok — kıyas için bir hafta gerek."
                  : down
                    ? `Geçen haftaya göre %${deltaAbs} daha az harcadın. Tempon yavaşlıyor 👏`
                    : `Geçen haftaya göre %${deltaAbs} daha fazla harcadın. Tempona dikkat.`}
              </Text>
            </View>

            <View style={[styles.forecast, surplus ? styles.forecastGood : styles.forecastBad]}>
              <Text style={styles.forecastLabel}>Ay sonu öngörüsü</Text>
              <Text style={[styles.forecastMsg, surplus ? styles.forecastMsgGood : styles.forecastMsgBad]}>
                {forecast.message}
              </Text>
              {stats.pace > 0 && (
                <Text style={styles.forecastSub}>
                  Tahmini ay sonu harcama ₺{projected} / havuz ₺{Math.round(stats.pool)}
                </Text>
              )}
            </View>

            <Text style={styles.sectionLabel}>Son günler</Text>
            <View style={styles.history}>
              {days.map((d) => (
                <View key={d.key} style={styles.row}>
                  <Text style={[styles.day, d.isToday && styles.dayToday]}>
                    {d.isToday ? "Bugün" : d.day}
                  </Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.bar, { width: `${(d.amount / maxAmount) * 100}%` }]} />
                  </View>
                  <Text style={styles.amount}>₺{Math.round(d.amount)}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.sectionLabel}>Haftanın günleri</Text>
            <View style={styles.weekChart}>
              {WEEKDAY_ORDER.map((wd) => {
                const stat = weekdays[wd];
                const h = Math.max(4, (stat.avg / maxWeekdayAvg) * 64);
                const isPeak = stat.avg > 0 && wd === peak.weekday;
                return (
                  <View key={wd} style={styles.weekCol}>
                    <View style={styles.weekBarTrack}>
                      <View
                        style={[
                          styles.weekBar,
                          { height: h },
                          isPeak ? styles.weekBarPeak : styles.weekBarDim,
                        ]}
                      />
                    </View>
                    <Text style={[styles.weekLabel, isPeak && styles.weekLabelPeak]}>
                      {WEEKDAY_LABELS[WEEKDAY_ORDER.indexOf(wd)]}
                    </Text>
                  </View>
                );
              })}
            </View>
            <Text style={styles.weekNote}>
              {peak.avg > 0
                ? `En çok ${WEEKDAY_FULL[peak.weekday]} günleri harcıyorsun · ort ₺${Math.round(peak.avg)}`
                : "Haftanın günü dağılımı için biraz daha veri gerek."}
            </Text>

            {categories.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>Kategori dağılımı</Text>
                <View style={styles.cats}>
                  {categories.map((c) => {
                    const cat = categoryById(c.categoryId);
                    return (
                      <View key={c.categoryId} style={styles.catRow}>
                        <View style={[styles.catDot, { backgroundColor: cat.color }]} />
                        <Text style={styles.catName}>{cat.label}</Text>
                        <View style={styles.catBarTrack}>
                          <View
                            style={[
                              styles.catBar,
                              { width: `${(c.total / maxCategory) * 100}%`, backgroundColor: cat.color },
                            ]}
                          />
                        </View>
                        <Text style={styles.catPct}>%{Math.round(c.share * 100)}</Text>
                        <Text style={styles.catAmount}>₺{Math.round(c.total)}</Text>
                      </View>
                    );
                  })}
                </View>
              </>
            )}

            {archive.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>Geçmiş aylar</Text>
                <View style={styles.months}>
                  {archive.map((mo) => {
                    const within = mo.spent <= mo.pool;
                    return (
                      <View key={mo.month} style={styles.monthRow}>
                        <View style={[styles.monthDot, within ? styles.monthDotGood : styles.monthDotBad]} />
                        <Text style={styles.monthName}>{monthLabel(mo.month)}</Text>
                        <Text style={styles.monthSpent}>
                          ₺{Math.round(mo.spent)}
                          <Text style={styles.monthPool}> / ₺{Math.round(mo.pool)}</Text>
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </>
            )}
          </View>

          {!isPro && (
            <View style={styles.lockCard} pointerEvents="box-none">
              <View style={styles.lockIcon}>
                <LockIcon color="#fff" />
              </View>
              <Text style={styles.lockTitle}>Tempo analizi Pace Pro'da</Text>
              <Text style={styles.lockText}>
                Ay sonu tahminini ve geçmiş harcama dökümünü gör. Tek seferlik ödeme, ömür boyu.
              </Text>
              <TouchableOpacity style={styles.lockCta} onPress={onUpgrade} activeOpacity={0.9}>
                <Text style={styles.lockCtaText}>Pace Pro'ya geç</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
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
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textMute,
    textTransform: "uppercase",
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
    textTransform: "uppercase",
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
  weekChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 84,
    marginBottom: 12,
  },
  weekCol: {
    flex: 1,
    alignItems: "center",
  },
  weekBarTrack: {
    height: 64,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  weekBar: {
    width: 16,
    borderRadius: 5,
  },
  weekBarPeak: {
    backgroundColor: theme.colors.stateGood,
  },
  weekBarDim: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  weekLabel: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.textMute,
  },
  weekLabelPeak: {
    color: theme.colors.textPrimary,
  },
  weekNote: {
    fontSize: 13,
    color: theme.colors.textSoft,
    lineHeight: 19,
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: 16,
  },
  history: {
    marginBottom: 32,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  day: {
    width: 48,
    fontSize: 13,
    color: theme.colors.textSoft,
    fontWeight: "500",
  },
  dayToday: {
    color: theme.colors.textPrimary,
    fontWeight: "700",
  },
  barTrack: {
    flex: 1,
    height: 24,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 6,
    marginRight: 12,
    overflow: "hidden",
  },
  bar: {
    height: "100%",
    backgroundColor: theme.colors.stateGood,
    borderRadius: 6,
    minWidth: 4,
  },
  amount: {
    width: 60,
    textAlign: "right",
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textPrimary,
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
  lockCard: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    alignItems: "center",
    padding: 24,
    backgroundColor: "#161922",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.6,
    shadowRadius: 32,
    elevation: 20,
    zIndex: 10,
  },
  lockIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  lockTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  lockText: {
    fontSize: 14,
    color: theme.colors.textSoft,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  lockCta: {
    alignSelf: "stretch",
    height: 48,
    borderRadius: 12,
    backgroundColor: theme.colors.textPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  lockCtaText: {
    color: "#000",
    fontSize: 15,
    fontWeight: "700",
  },
});
