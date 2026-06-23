import React from "react";
import { StyleSheet, View } from "react-native";
import { MotiView, MotiText } from "moti";
import { getTone } from "../../../shared/lib/tone";
import { CardIcon } from "../../../shared/ui/icons";
import { useLimitLogic } from "../hooks/useLimitLogic";
import { Ring } from "./Ring";
import { theme } from "../../../shared/styles/theme";
import { Text } from "../../../shared/typography/Text";

export function LimitBoard() {
  const { remaining, limit, spent, setup, budget, subsTotal } = useLimitLogic();
  const tone = getTone(remaining, limit);

  if (setup) {
    const oversubscribed = setup === "oversubscribed";
    return (
      <MotiView
        style={styles.setup}
        from={{ opacity: 0, translateY: 8 }}
        animate={{ opacity: 1, translateY: 0 }}
      >
        <View style={styles.setupIcon}>
          <CardIcon size={26} color={theme.colors.textSoft} />
        </View>
        <Text style={styles.setupTitle}>
          {oversubscribed
            ? "Sabit giderlerin bütçeni aşıyor"
            : "Aylık bütçeni belirle"}
        </Text>
        <Text style={styles.setupText}>
          {oversubscribed
            ? `Giderlerin (₺${Math.round(subsTotal)}) bütçenden (₺${Math.round(
                budget
              )}) fazla. Günlük limit hesaplanamıyor — bütçeni artır ya da gideri azalt.`
            : "Bütçeni girince günlük harcama limitin otomatik hesaplanır."}
        </Text>
        <Text style={styles.setupHint}>••• → Bütçe &amp; Giderler</Text>
      </MotiView>
    );
  }

  return (
    <View style={styles.hero}>
      <Ring remaining={remaining} limit={limit} tone={tone} />

      <View style={styles.stats}>
        <View style={styles.stat}>
          <MotiText
            key={Math.round(spent)}
            style={styles.statValue}
            from={{ opacity: 0.4, translateY: 4 }}
            animate={{ opacity: 1, translateY: 0 }}
          >
            ₺{Math.round(spent)}
          </MotiText>
          <Text style={styles.statLabel}>harcanan</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.stat}>
          <Text style={styles.statValue}>₺{Math.round(limit)}</Text>
          <Text style={styles.statLabel}>limit</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  setup: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    maxWidth: 300,
    padding: 8,
  },
  setupIcon: {
    width: 60,
    height: 60,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  setupTitle: {
    fontFamily: theme.fonts.outfitBold,
    fontSize: 19,
    fontWeight: "700",
    letterSpacing: -0.3,
    color: theme.colors.textPrimary,
    textAlign: "center",
  },
  setupText: {
    fontFamily: theme.fonts.outfitRegular,
    fontSize: 14,
    color: theme.colors.textSoft,
    textAlign: "center",
    lineHeight: 21,
  },
  setupHint: {
    fontFamily: theme.fonts.outfitSemi,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.48,
    color: theme.colors.textDim,
    marginTop: 4,
  },
  hero: {
    alignItems: "center",
    justifyContent: "center",
    gap: 40,
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 48,
  },
  stat: {
    alignItems: "center",
  },
  statValue: {
    fontFamily: theme.fonts.outfitBold,
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.5,
    color: theme.colors.textPrimary,
    fontVariant: ["tabular-nums"],
  },
  statLabel: {
    fontFamily: theme.fonts.outfitSemi,
    fontSize: 10,
    color: theme.colors.textFaint,
    marginTop: 4,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
});
