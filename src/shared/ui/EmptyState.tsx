import React from "react";
import { StyleSheet, View } from "react-native";
import { MotiView } from "moti";
import { Text } from "../typography/Text";
import { theme } from "../styles/theme";

interface EmptyStateProps {
  /** Yumuşak halka içinde gösterilecek ikon (textDim renginde verilmeli). */
  icon: React.ReactNode;
  /** Tek satırlık açıklama metni. */
  text: string;
  /** Dar bölümler (ör. tekrarlayan sheet) için küçük, ferah varyant. */
  compact?: boolean;
}

/**
 * Sheet'lerde tutarlı boş-durum: ortalanmış, sakin bir ikon halkası + tek
 * satır. Minimal kalır (bounce yok) — ilk açılışta boş listeler boşluk yerine
 * nazik bir ipucu gösterir.
 */
export function EmptyState({ icon, text, compact }: EmptyStateProps) {
  return (
    <MotiView
      style={[styles.wrap, compact && styles.wrapCompact]}
      from={{ opacity: 0, translateY: 4 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 240 }}
    >
      <View style={[styles.ring, compact && styles.ringCompact]}>{icon}</View>
      <Text style={[styles.text, compact && styles.textCompact]}>{text}</Text>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  wrapCompact: {
    gap: 10,
    paddingVertical: 18,
  },
  ring: {
    width: 52,
    height: 52,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
  },
  ringCompact: {
    width: 40,
    height: 40,
  },
  text: {
    maxWidth: 280,
    fontSize: 14,
    lineHeight: 21,
    color: theme.colors.textDim,
    textAlign: "center",
  },
  textCompact: {
    fontSize: 13,
    lineHeight: 19,
  },
});
