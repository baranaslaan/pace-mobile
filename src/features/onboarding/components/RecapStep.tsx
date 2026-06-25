import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "../../../shared/typography/Text";
import { dailyLimit } from "../../../shared/lib/engine";
import { remainingDaysInclusive, daysInMonth } from "../../../shared/lib/date";
import type { SubDraft } from "../hooks/useOnboardingFlow";
import { useCurrency } from "../../../shared/store/useCurrency";
import { parseGrouped } from "../../../shared/lib/money";
import { useT } from "../../../shared/i18n";
import { theme } from "../../../shared/styles/theme";

interface RecapStepProps {
  budget: string;
  subs: SubDraft[];
}

export function RecapStep({ budget, subs }: RecapStepProps) {
  const { symbol, fmtNum } = useCurrency();
  const { t } = useT();
  const points = [
    t("recap.point1"),
    t("recap.point2"),
    t("recap.point3"),
    t("recap.point4"),
    t("recap.point5"),
    t("recap.point6"),
  ];
  const limit = dailyLimit({
    budget: parseGrouped(budget) || 0,
    subscriptions: subs,
    expenses: {},
  });
  // Ay ortasında kuruluyorsa, limitin ayın KALAN günlerine bölündüğünü açıkça
  // söyle (1'inde başlamış gibi değil) — yoksa şişkin görünen limit kafa karıştırır.
  const remainingDays = remainingDaysInclusive();
  const prorated = remainingDays < daysInMonth();

  return (
    <View style={styles.step}>
      <View style={styles.heading}>
        <Text style={styles.title}>{t("recap.title")}</Text>
        <Text style={styles.hint}>{t("recap.hint")}</Text>
      </View>

      <View style={styles.limit}>
        <Text style={styles.prefix}>{symbol}</Text>
        <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5}>
          {fmtNum(limit)}
        </Text>
        <Text style={styles.unit}>{t("recap.perDay")}</Text>
      </View>

      {prorated && (
        <Text style={styles.proratedNote}>
          {t("recap.proratedNote", { days: remainingDays })}
        </Text>
      )}

      <View style={styles.points}>
        {points.map((point) => (
          <View key={point} style={styles.point}>
            <View style={styles.bullet} />
            <Text style={styles.pointText}>{point}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  step: {
    flex: 1,
    justifyContent: "center",
    gap: 28,
  },
  heading: {},
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: theme.colors.textPrimary,
    lineHeight: 32,
    letterSpacing: -0.8,
  },
  hint: {
    marginTop: 10,
    fontSize: 15,
    color: theme.colors.textSoft,
  },
  limit: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  prefix: {
    fontFamily: theme.fonts.outfitBold,
    fontSize: 28,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.3)",
  },
  value: {
    fontFamily: theme.fonts.outfitExtra,
    fontSize: 56,
    lineHeight: 62, // Outfit Extra üst/alt kırpmasını önle
    fontWeight: "800",
    color: theme.colors.textPrimary,
    letterSpacing: -2,
    fontVariant: ["tabular-nums"],
    paddingHorizontal: 2, // negatif letterSpacing'in son haneyi kırpmasını önle
  },
  unit: {
    fontFamily: theme.fonts.outfitMedium,
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.textSoft,
  },
  proratedNote: {
    marginTop: -16,
    fontSize: 13,
    lineHeight: 18,
    color: theme.colors.textDim,
  },
  points: {
    gap: 16,
  },
  point: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.stateGood,
    marginTop: 7,
  },
  pointText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textSoft,
    lineHeight: 20,
  },
});
