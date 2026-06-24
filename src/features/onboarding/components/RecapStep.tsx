import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "../../../shared/typography/Text";
import { dailyLimit } from "../../../shared/lib/engine";
import type { SubDraft } from "../hooks/useOnboardingFlow";
import { useCurrency } from "../../../shared/store/useCurrency";
import { theme } from "../../../shared/styles/theme";

interface RecapStepProps {
  budget: string;
  subs: SubDraft[];
}

const POINTS = [
  "Her gün ne kadar harcayabileceğini tek bakışta gör.",
  "Harcadıkça düşer; az harcadığın gün yarına artar.",
  "Sabit giderlerin baştan ayrıldı, günlük hesaba karışmaz.",
  "Limiti aşarsan ekran kırmızıya döner ve seni uyarır.",
];

export function RecapStep({ budget, subs }: RecapStepProps) {
  const { symbol } = useCurrency();
  const limit = dailyLimit({
    budget: Number.parseFloat(budget) || 0,
    subscriptions: subs,
    expenses: {},
  });

  return (
    <View style={styles.step}>
      <View style={styles.heading}>
        <Text style={styles.title}>Her şey hazır.</Text>
        <Text style={styles.hint}>Bugünden itibaren günlük limitin:</Text>
      </View>

      <View style={styles.limit}>
        <Text style={styles.prefix}>{symbol}</Text>
        <Text style={styles.value}>{Math.round(limit)}</Text>
        <Text style={styles.unit}>/gün</Text>
      </View>

      <View style={styles.points}>
        {POINTS.map((point) => (
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
    fontWeight: "800",
    color: theme.colors.textPrimary,
    letterSpacing: -2,
    fontVariant: ["tabular-nums"],
  },
  unit: {
    fontFamily: theme.fonts.outfitMedium,
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.textSoft,
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
