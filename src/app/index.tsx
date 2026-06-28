import React, { useEffect, useState } from "react";
import { StyleSheet, View, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { AnimatePresence, MotiView } from "moti";
import { usePaceStore } from "../shared/store/usePaceStore";
import { useDayKey } from "../shared/store/useDayKey";
import { getTone } from "../shared/lib/tone";
import { useLimitLogic } from "../features/limit-board/hooks/useLimitLogic";
import { Logo } from "../shared/typography/Logo";
import { MoreIcon } from "../shared/ui/icons";

import { Splash } from "../features/splash/components/Splash";
import { Onboarding } from "../features/onboarding/components/Onboarding";
import { LimitBoard } from "../features/limit-board/components/LimitBoard";
import { ExpenseInput } from "../features/expense-input/components/ExpenseInput";
import { AppSheets } from "./AppSheets";
import { scheduleDailyReminder } from "../shared/lib/notifications";
import { translate, type Language } from "../shared/i18n";
import { useWidgetSync } from "../widgets/useWidgetSync";

import { theme } from "../shared/styles/theme";

// Logo girişi ~600ms'de tamamlanıyor; markanın görünmesine yetecek kadar tut,
// fazlası boşa bekleme. Hydration genelde bundan hızlı bittiği için asıl freni budur.
const MIN_SPLASH_MS = 700;

export default function AppIndex() {
  const onboarded = usePaceStore((s) => s.onboarded);
  const hydrated = usePaceStore((s) => s._hydrated);
  const rollIfNewMonth = usePaceStore((s) => s.rollIfNewMonth);
  const applyRecurring = usePaceStore((s) => s.applyRecurring);
  const reminderEnabled = usePaceStore((s) => s.reminderEnabled);
  const reminderHour = usePaceStore((s) => s.reminderHour);
  const reminderMinute = usePaceStore((s) => s.reminderMinute);
  const language = usePaceStore((s) => s.language) as Language;
  // Gün anahtarı; değişince (resume/gece yarısı) ay devri + tekrarlayanlar
  // yeniden değerlendirilsin.
  const today = useDayKey();
  const { remaining, limit } = useLimitLogic();
  const tone = getTone(remaining, limit);

  // Günlük limit/tempo değiştikçe iOS ana ekran widget'ını güncel tut.
  useWidgetSync();

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
    if (hydrated) {
      rollIfNewMonth();
      // Ay devrinden SONRA çalışsın: vadesi geçmiş tekrarlayanları bu ayın
      // kalemleri olarak ekle.
      applyRecurring();
    }
    // `today` bağımlılığı: uygulama arka plandayken gün/ay geçip resume olunca
    // (ya da açıkken gece yarısında) devir + tekrarlayanlar yeniden işlesin.
  }, [hydrated, today, rollIfNewMonth, applyRecurring]);

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

  return (
    <View style={styles.screen}>
      {/* Alt katman: hazır olunca app/onboarding. Splash üstte opak dururken
          burası boyanır, böylece splash sönünce altta hazır içerik bulunur —
          geçişte boş/blink kare oluşmaz. */}
      <AnimatePresence>
      {!ready ? null : !onboarded ? (
        <MotiView
          key="onboarding"
          style={StyleSheet.absoluteFill}
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: "timing", duration: 350 }}
        >
          <Onboarding />
        </MotiView>
      ) : (
        <MotiView
          key="app"
          style={StyleSheet.absoluteFill}
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: "timing", duration: 350 }}
        >
          <View style={styles.safe}>
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
                onPress={() => {
                  Keyboard.dismiss();
                  setMenuOpen(!menuOpen);
                }}
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
          </View>

          <AppSheets menuOpen={menuOpen} onCloseMenu={() => setMenuOpen(false)} />
        </MotiView>
      )}
      </AnimatePresence>

      {/* Üst katman: splash. Hazır olunca sönerek alttaki içeriği açar. */}
      <AnimatePresence>
        {!ready && <Splash key="splash" />}
      </AnimatePresence>
    </View>
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
