import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { MotiView, MotiText, AnimatePresence } from "moti";
import { getTone } from "../../../shared/lib/tone";
import { CardIcon } from "../../../shared/ui/icons";
import { useLimitLogic } from "../hooks/useLimitLogic";
import { usePaceStore } from "../../../shared/store/usePaceStore";
import { useCurrency } from "../../../shared/store/useCurrency";
import { useT } from "../../../shared/i18n";
import { Ring } from "./Ring";
import { theme } from "../../../shared/styles/theme";
import { Text } from "../../../shared/typography/Text";

export function LimitBoard() {
  const { remaining, limit, spent, setup, budget, subsTotal, rolloverActive } = useLimitLogic();
  const { fmt } = useCurrency();
  const { t, tu } = useT();
  const tone = getTone(remaining, limit);
  const rolloverTipSeen = usePaceStore((s) => s.rolloverTipSeen);
  const markRolloverTipSeen = usePaceStore((s) => s.markRolloverTipSeen);
  const firstExpenseTipSeen = usePaceStore((s) => s.firstExpenseTipSeen);
  const markFirstExpenseTipSeen = usePaceStore((s) => s.markFirstExpenseTipSeen);
  // Devir görünür biçimde çalıştığı ilk anda, henüz görülmemişse tek seferlik ipucu.
  const showTip = !setup && rolloverActive && !rolloverTipSeen;
  // İlk açılış: bütçe kurulu ama henüz hiç harcama yokken aşağıdaki girişe yönlendir.
  // Devir ipucuyla yarışmasın diye onunla aynı anda gösterilmez.
  const showFirstTip =
    !setup && !showTip && spent === 0 && !firstExpenseTipSeen;

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
            ? t("board.setupOverTitle")
            : t("board.setupBudgetTitle")}
        </Text>
        <Text style={styles.setupText}>
          {oversubscribed
            ? t("board.setupOverText", { subs: fmt(subsTotal), budget: fmt(budget) })
            : t("board.setupBudgetText")}
        </Text>
        <Text style={styles.setupHint}>{t("board.hint")}</Text>
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
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
            from={{ opacity: 0.4, translateY: 4 }}
            animate={{ opacity: 1, translateY: 0 }}
          >
            {fmt(spent)}
          </MotiText>
          <Text style={styles.statLabel}>{tu("board.spent")}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.stat}>
          <Text
            style={styles.statValue}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            {fmt(limit)}
          </Text>
          <Text style={styles.statLabel}>{tu("board.limit")}</Text>
        </View>
      </View>

      <AnimatePresence>
        {showTip && (
          <MotiView
            key="rolloverTip"
            from={{ opacity: 0, translateY: 8 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0, translateY: 8 }}
            transition={{ type: "timing", duration: 220 }}
          >
            <TouchableOpacity
              style={styles.tip}
              onPress={markRolloverTipSeen}
              activeOpacity={0.8}
            >
              <Text style={styles.tipText}>{t("board.rolloverTip")}</Text>
            </TouchableOpacity>
          </MotiView>
        )}

        {showFirstTip && (
          <MotiView
            key="firstTip"
            from={{ opacity: 0, translateY: 8 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0, translateY: 8 }}
            transition={{ type: "timing", duration: 220 }}
          >
            <TouchableOpacity
              style={styles.tip}
              onPress={markFirstExpenseTipSeen}
              activeOpacity={0.8}
            >
              <Text style={styles.tipText}>{t("board.firstExpenseTip")}</Text>
            </TouchableOpacity>
          </MotiView>
        )}
      </AnimatePresence>
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
    // Sabit genişlik + üst container'da ortala (alignSelf:stretch + maxWidth
    // kombinasyonu sola yapıştırıyordu). flex:1 sütunlar bunu eşit böler.
    width: 280,
    gap: 16,
  },
  stat: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontFamily: theme.fonts.outfitBold,
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.5,
    color: theme.colors.textPrimary,
    fontVariant: ["tabular-nums"],
    // Genişliği stat'a sabitle: tek satıra sığsın, taşarsa font küçülsün.
    alignSelf: "stretch",
    textAlign: "center",
  },
  statLabel: {
    fontFamily: theme.fonts.outfitSemi,
    fontSize: 10,
    color: theme.colors.textFaint,
    marginTop: 4,
    fontWeight: "600",
    letterSpacing: 1,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  tip: {
    maxWidth: 320,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  tipText: {
    fontSize: 13,
    lineHeight: 19,
    color: theme.colors.textSoft,
    textAlign: "center",
  },
});
