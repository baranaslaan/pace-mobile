import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Text } from "../../../shared/typography/Text";
import { usePaceStore } from "../../../shared/store/usePaceStore";
import { useT, LANGUAGES } from "../../../shared/i18n";
import { CURRENCIES } from "../../../shared/lib/money";
import { theme } from "../../../shared/styles/theme";

export function WelcomeStep() {
  const { t, tu } = useT();
  const language = usePaceStore((s) => s.language);
  const setLanguage = usePaceStore((s) => s.setLanguage);
  const currency = usePaceStore((s) => s.currency);
  const setCurrency = usePaceStore((s) => s.setCurrency);

  return (
    <View style={styles.welcome}>
      <Text style={styles.title}>{t("welcome.title")}</Text>
      <Text style={styles.subtitle}>{t("welcome.subtitle")}</Text>

      {/* Dil + para birimi baştan seçilir — kullanıcı onboarding'i kendi
          dilinde ve para biriminde geçer. */}
      <View style={styles.pickers}>
        <View style={styles.pickerGroup}>
          <Text style={styles.pickerLabel}>{tu("settings.language")}</Text>
          <View style={styles.row}>
            {LANGUAGES.map((l) => {
              const active = language === l.code;
              return (
                <TouchableOpacity
                  key={l.code}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setLanguage(l.code)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {l.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.pickerGroup}>
          <Text style={styles.pickerLabel}>{tu("settings.currency")}</Text>
          <View style={styles.row}>
            {CURRENCIES.map((c) => {
              const active = currency === c.code;
              return (
                <TouchableOpacity
                  key={c.code}
                  style={[styles.chip, styles.curChip, active && styles.chipActive]}
                  onPress={() => setCurrency(c.code)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {c.symbol} {c.code}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  welcome: {
    flex: 1,
    justifyContent: "center",
    gap: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: theme.colors.textPrimary,
    lineHeight: 38,
    letterSpacing: -1,
  },
  subtitle: {
    maxWidth: 300,
    fontSize: 15,
    fontWeight: "400",
    color: theme.colors.textSoft,
    lineHeight: 23,
  },
  pickers: {
    marginTop: 12,
    gap: 18,
  },
  pickerGroup: {
    gap: 10,
  },
  pickerLabel: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.8,
    color: theme.colors.textDim,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  curChip: {
    paddingHorizontal: 14,
  },
  chipActive: {
    borderColor: theme.colors.stateGood,
    backgroundColor: "rgba(59, 130, 246, 0.12)",
  },
  chipText: {
    fontFamily: theme.fonts.outfitMedium,
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textSoft,
  },
  chipTextActive: {
    color: theme.colors.textPrimary,
  },
});
