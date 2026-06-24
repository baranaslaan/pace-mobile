import React from "react";
import { StyleSheet, View, TouchableOpacity, type StyleProp, type ViewStyle } from "react-native";
import { Text } from "../../../shared/typography/Text";
import { LockIcon } from "../../../shared/ui/icons";
import { theme } from "../../../shared/styles/theme";

interface ProUpsellProps {
  title: string;
  text: string;
  cta: string;
  onUpgrade: () => void;
  /** Konumlandırma override'ı (ör. Analytics'te absolute overlay). */
  style?: StyleProp<ViewStyle>;
}

/**
 * Tek tip "Pace Pro'ya geç" kartı — tüm sheet'lerde (Tekrarlayanlar, Tempo,
 * Bütçe) aynı görünür. Zemin OPAK; hem sheet üstünde hem overlay olarak çalışır.
 */
export function ProUpsell({ title, text, cta, onUpgrade, style }: ProUpsellProps) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.icon}>
        <LockIcon color="#fff" />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.text}>{text}</Text>
      <TouchableOpacity style={styles.cta} onPress={onUpgrade} activeOpacity={0.9}>
        <Text style={styles.ctaText}>{cta}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    padding: 22,
    borderRadius: 18,
    // Opak koyu-mavi (translucent 0.08'in koyu zemindeki karşılığı) — overlay'de
    // de altı sızdırmaz.
    backgroundColor: theme.colors.upsellBg,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.25)",
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.stateGood,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    textAlign: "center",
    marginBottom: 6,
  },
  text: {
    fontSize: 13,
    color: theme.colors.textSoft,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 18,
  },
  cta: {
    alignSelf: "stretch",
    height: 46,
    borderRadius: 12,
    backgroundColor: theme.colors.stateGood,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
