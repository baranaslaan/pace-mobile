import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { Text } from "../../../shared/typography/Text";
import { MotiView } from "moti";
import { usePaceStore } from "../../../shared/store/usePaceStore";
import { BottomSheet } from "../../../shared/ui/BottomSheet";
import { CheckIcon, SparklesIcon } from "../../../shared/ui/icons";
import { tapLight, tapSuccess } from "../../../shared/lib/haptics";
import { useT } from "../../../shared/i18n";
import { theme } from "../../../shared/styles/theme";

const MOCK_PURCHASE_MS = 900;

// Placeholder fiyatlar — gerçek satın almada RevenueCat `localizedPriceString`
// ile mağaza para birimine göre değişir. Lifetime kahraman, yıllık çapa.
const PLANS = [
  { id: "lifetime", price: "₺329" },
  { id: "annual", price: "₺129/yıl" },
] as const;

type Phase = "idle" | "purchasing" | "done";

interface PaywallProps {
  open: boolean;
  onClose: () => void;
}

export function Paywall({ open, onClose }: PaywallProps) {
  const isPro = usePaceStore((s) => s.isPro);
  const unlockPro = usePaceStore((s) => s.unlockPro);
  const { t, tu } = useT();
  const benefits = [
    t("paywall.benefit1"),
    t("paywall.benefit2"),
    t("paywall.benefit3"),
    t("paywall.benefit4"),
    t("paywall.benefit5"),
  ];
  const [phase, setPhase] = useState<Phase>("idle");
  const [plan, setPlan] = useState<string>("lifetime");
  const selected = PLANS.find((p) => p.id === plan) ?? PLANS[0];
  const purchaseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPurchase = () => {
    if (purchaseTimer.current) {
      clearTimeout(purchaseTimer.current);
      purchaseTimer.current = null;
    }
  };

  // Sheet kapanınca durumu sıfırla ve bekleyen mock satın alma timer'ını iptal et.
  useEffect(() => {
    if (!open) {
      clearPurchase();
      setPhase("idle");
    }
  }, [open]);

  // Unmount güvenliği — bekleyen timer unmount sonrası setState etmesin.
  useEffect(() => clearPurchase, []);

  useEffect(() => {
    if (phase !== "done") return;
    const t = setTimeout(onClose, 1100);
    return () => clearTimeout(t);
  }, [phase, onClose]);

  const selectPlan = (id: string) => {
    if (id === plan) return;
    tapLight();
    setPlan(id);
  };

  const handlePurchase = () => {
    if (phase !== "idle") return;
    setPhase("purchasing");
    purchaseTimer.current = setTimeout(() => {
      purchaseTimer.current = null;
      unlockPro();
      tapSuccess();
      setPhase("done");
    }, MOCK_PURCHASE_MS);
  };

  const unlocked = isPro || phase === "done";

  return (
    <BottomSheet open={open} onClose={onClose} title="Pace Pro">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <MotiView
          key={unlocked ? "unlocked" : "idle"}
          style={styles.badge}
          from={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "timing", duration: 240 }}
        >
          {unlocked ? <CheckIcon color="#fff" size={28} /> : <SparklesIcon color="#fff" />}
        </MotiView>

        {unlocked ? (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ alignItems: "center" }}>
            <Text style={styles.headline}>{t("paywall.activeTitle")}</Text>
            <Text style={styles.sub}>{t("paywall.activeSub")}</Text>
          </MotiView>
        ) : (
          <>
            <Text style={styles.headline}>{t("paywall.headline")}</Text>
            <Text style={styles.sub}>{t("paywall.sub")}</Text>

            <View style={styles.benefits}>
              {benefits.map((b) => (
                <View key={b} style={styles.benefit}>
                  <View style={styles.check}>
                    <CheckIcon color="#fff" size={14} />
                  </View>
                  <Text style={styles.benefitText}>{b}</Text>
                </View>
              ))}
            </View>

            {/* Plan seçici — Lifetime kahraman, yıllık çapa. */}
            <View style={styles.plans}>
              {PLANS.map((p) => {
                const active = plan === p.id;
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.plan, active && styles.planActive]}
                    onPress={() => selectPlan(p.id)}
                    activeOpacity={0.85}
                  >
                    {p.id === "lifetime" && (
                      <View style={styles.bestBadge}>
                        <Text style={styles.bestBadgeText}>{tu("paywall.bestValue")}</Text>
                      </View>
                    )}
                    <Text style={[styles.planTitle, active && styles.planTitleActive]}>
                      {t(`paywall.${p.id}`)}
                    </Text>
                    <Text
                      style={[styles.planPrice, active && styles.planPriceActive]}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.5}
                    >
                      {p.price}
                    </Text>
                    <Text style={styles.planNote}>{t(`paywall.${p.id}Note`)}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.launchNote}>{t("paywall.launchNote")}</Text>

            <TouchableOpacity
              style={[styles.cta, phase !== "idle" && { opacity: 0.7 }]}
              onPress={handlePurchase}
              disabled={phase !== "idle"}
              activeOpacity={0.9}
            >
              {phase === "purchasing" ? (
                <View style={styles.ctaBusy}>
                  <ActivityIndicator size="small" color="#000" />
                  <Text style={styles.ctaText}>{t("paywall.processing")}</Text>
                </View>
              ) : (
                <Text style={styles.ctaText}>{t("paywall.buy", { price: selected.price })}</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.fine}>{t("paywall.fine")}</Text>
          </>
        )}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexShrink: 1,
  },
  body: {
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 24,
  },
  badge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.stateGood,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: theme.colors.stateGood,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  headline: {
    fontSize: 24,
    fontWeight: "800",
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  sub: {
    fontSize: 15,
    color: theme.colors.textSoft,
    marginBottom: 32,
    textAlign: "center",
  },
  benefits: {
    alignSelf: "stretch",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 32,
  },
  benefit: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  benefitText: {
    fontSize: 15,
    color: theme.colors.textPrimary,
    fontWeight: "500",
  },
  plans: {
    alignSelf: "stretch",
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  launchNote: {
    fontSize: 12,
    color: theme.colors.stateGood,
    textAlign: "center",
    marginBottom: 16,
  },
  plan: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  planActive: {
    borderColor: theme.colors.stateGood,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
  },
  bestBadge: {
    position: "absolute",
    top: -9,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.stateGood,
  },
  bestBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.3,
  },
  planTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.textSoft,
    marginBottom: 6,
  },
  planTitleActive: {
    color: theme.colors.textPrimary,
  },
  planPrice: {
    fontSize: 20,
    fontWeight: "800",
    color: theme.colors.textPrimary,
    fontVariant: ["tabular-nums"],
    // Genişliği karta sabitle: uzun para birimi fiyatı sarmasın, küçülsün.
    alignSelf: "stretch",
    textAlign: "center",
  },
  planPriceActive: {
    color: theme.colors.stateGood,
  },
  planNote: {
    fontSize: 11,
    color: theme.colors.textMute,
    marginTop: 4,
  },
  cta: {
    alignSelf: "stretch",
    height: 56,
    borderRadius: 16,
    backgroundColor: theme.colors.textPrimary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  ctaBusy: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  ctaText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "700",
  },
  fine: {
    fontSize: 12,
    color: theme.colors.textMute,
    textAlign: "center",
  },
});
