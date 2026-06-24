import React, { useEffect, useState } from "react";
import { StyleSheet, View, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { AnimatePresence, MotiView } from "moti";
import { usePaceStore } from "../shared/store/usePaceStore";
import { getTone } from "../shared/lib/tone";
import { useLimitLogic } from "../features/limit-board/hooks/useLimitLogic";
import { Logo } from "../shared/typography/Logo";
import { MoreIcon } from "../shared/ui/icons";

import { Splash } from "../features/splash/components/Splash";
import { Onboarding } from "../features/onboarding/components/Onboarding";
import { LimitBoard } from "../features/limit-board/components/LimitBoard";
import { ExpenseInput } from "../features/expense-input/components/ExpenseInput";
import { MoreMenu } from "../features/menu/components/MoreMenu";
import { SubscriptionsSheet } from "../features/subscriptions/components/SubscriptionsSheet";
import { HistorySheet } from "../features/expense-history/components/HistorySheet";
import { AnalyticsSheet } from "../features/analytics/components/AnalyticsSheet";
import { SettingsSheet } from "../features/settings/components/SettingsSheet";
import { Paywall } from "../features/pro/components/Paywall";
import { scheduleDailyReminder } from "../shared/lib/notifications";
import { translate, type Language } from "../shared/i18n";

import { theme } from "../shared/styles/theme";

const MIN_SPLASH_MS = 1400;

export default function AppIndex() {
  const onboarded = usePaceStore((s) => s.onboarded);
  const hydrated = usePaceStore((s) => s._hydrated);
  const rollIfNewMonth = usePaceStore((s) => s.rollIfNewMonth);
  const reminderEnabled = usePaceStore((s) => s.reminderEnabled);
  const reminderHour = usePaceStore((s) => s.reminderHour);
  const reminderMinute = usePaceStore((s) => s.reminderMinute);
  const language = usePaceStore((s) => s.language) as Language;
  const { remaining, limit } = useLimitLogic();
  const tone = getTone(remaining, limit);

  const [mounted, setMounted] = useState(false);
  const [minElapsed, setMinElapsed] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    setMounted(true);
    const t = setTimeout(() => setMinElapsed(true), MIN_SPLASH_MS);
    return () => clearTimeout(t);
  }, []);

  const ready = mounted && minElapsed && hydrated;

  useEffect(() => {
    if (hydrated) rollIfNewMonth();
  }, [hydrated, rollIfNewMonth]);

  // Hatırlatma açıksa, OS planı temizlemiş olabilir — açılışta yeniden kur.
  useEffect(() => {
    if (hydrated && reminderEnabled) {
      scheduleDailyReminder(reminderHour, reminderMinute, {
        title: translate(language, "notif.title"),
        body: translate(language, "notif.body"),
      }).catch(() => {});
    }
  }, [hydrated, reminderEnabled, reminderHour, reminderMinute, language]);

  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSheet, setActiveSheet] = useState<"none" | "history" | "subs" | "analytics" | "paywall" | "settings">("none");

  const handleUpgrade = () => {
    setActiveSheet("paywall");
  };

  return (
    <AnimatePresence>
      {!ready ? (
        <Splash key="splash" />
      ) : !onboarded ? (
        <MotiView
          key="onboarding"
          style={styles.screen}
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: "timing", duration: 500 }}
        >
          <Onboarding />
        </MotiView>
      ) : (
        <MotiView
          key="app"
          style={styles.screen}
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: "timing", duration: 500 }}
        >
          <KeyboardAvoidingView 
            style={styles.safe} 
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              <Svg width="100%" height="100%">
                <Defs>
                  <RadialGradient id="bgGlow" cx="50%" cy="10%" rx="100%" ry="55%">
                    <Stop offset="0%" stopColor={tone.color} stopOpacity="0.13" />
                    <Stop offset="60%" stopColor={tone.color} stopOpacity="0" />
                  </RadialGradient>
                </Defs>
                <Rect width="100%" height="100%" fill="url(#bgGlow)" />
              </Svg>
            </View>

            <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
              <Logo color={tone.color} />
              <TouchableOpacity
                style={styles.more}
                onPress={() => setMenuOpen(!menuOpen)}
                activeOpacity={0.7}
              >
                <MoreIcon color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
              <View style={styles.main}>
                <LimitBoard />
              </View>
            </TouchableWithoutFeedback>

            <ExpenseInput bottomInset={insets.bottom} />
          </KeyboardAvoidingView>

          <MoreMenu
            open={menuOpen}
            onClose={() => setMenuOpen(false)}
            onOpenHistory={() => {
              setMenuOpen(false);
              setActiveSheet("history");
            }}
            onOpenSubscriptions={() => {
              setMenuOpen(false);
              setActiveSheet("subs");
            }}
            onOpenAnalytics={() => {
              setMenuOpen(false);
              setActiveSheet("analytics");
            }}
            onOpenSettings={() => {
              setMenuOpen(false);
              setActiveSheet("settings");
            }}
            onOpenPaywall={() => {
              setMenuOpen(false);
              setActiveSheet("paywall");
            }}
          />

          <HistorySheet
            open={activeSheet === "history"}
            onClose={() => setActiveSheet("none")}
          />

          <SubscriptionsSheet
            open={activeSheet === "subs"}
            onClose={() => setActiveSheet("none")}
            onUpgrade={handleUpgrade}
          />

          <AnalyticsSheet
            open={activeSheet === "analytics"}
            onClose={() => setActiveSheet("none")}
            onUpgrade={handleUpgrade}
          />

          <SettingsSheet
            open={activeSheet === "settings"}
            onClose={() => setActiveSheet("none")}
            onUpgrade={handleUpgrade}
            onOpenSubscriptions={() => setActiveSheet("subs")}
          />

          <Paywall open={activeSheet === "paywall"} onClose={() => setActiveSheet("none")} />
        </MotiView>
      )}
    </AnimatePresence>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.bgPage,
  },
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  more: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  main: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
