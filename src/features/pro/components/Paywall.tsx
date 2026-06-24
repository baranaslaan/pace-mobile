import React, { useEffect, useState } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Text } from "../../../shared/typography/Text";
import { MotiView } from "moti";
import { usePaceStore } from "../../../shared/store/usePaceStore";
import { BottomSheet } from "../../../shared/ui/BottomSheet";
import { CheckIcon, SparklesIcon } from "../../../shared/ui/icons";
import { useT } from "../../../shared/i18n";
import { theme } from "../../../shared/styles/theme";

const MOCK_PURCHASE_MS = 900;

type Phase = "idle" | "purchasing" | "done";

interface PaywallProps {
  open: boolean;
  onClose: () => void;
}

export function Paywall({ open, onClose }: PaywallProps) {
  const isPro = usePaceStore((s) => s.isPro);
  const unlockPro = usePaceStore((s) => s.unlockPro);
  const { t } = useT();
  const benefits = [
    t("paywall.benefit1"),
    t("paywall.benefit2"),
    t("paywall.benefit3"),
    t("paywall.benefit4"),
  ];
  const [phase, setPhase] = useState<Phase>("idle");

  useEffect(() => {
    if (!open) setPhase("idle");
  }, [open]);

  useEffect(() => {
    if (phase !== "done") return;
    const t = setTimeout(onClose, 1100);
    return () => clearTimeout(t);
  }, [phase, onClose]);

  const handlePurchase = () => {
    if (phase !== "idle") return;
    setPhase("purchasing");
    setTimeout(() => {
      unlockPro();
      setPhase("done");
    }, MOCK_PURCHASE_MS);
  };

  const unlocked = isPro || phase === "done";

  return (
    <BottomSheet open={open} onClose={onClose} title="Pace Pro">
      <View style={styles.body}>
        <View style={styles.badge}>
          <SparklesIcon color="#fff" />
        </View>

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

            <TouchableOpacity
              style={[styles.cta, phase !== "idle" && { opacity: 0.7 }]}
              onPress={handlePurchase}
              disabled={phase !== "idle"}
              activeOpacity={0.9}
            >
              <Text style={styles.ctaText}>
                {phase === "purchasing" ? t("paywall.processing") : t("paywall.buy", { price: "₺149" })}
              </Text>
            </TouchableOpacity>

            <Text style={styles.fine}>{t("paywall.fine")}</Text>
          </>
        )}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
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
  cta: {
    alignSelf: "stretch",
    height: 56,
    borderRadius: 16,
    backgroundColor: theme.colors.textPrimary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
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
