import React, { useState } from "react";
import { StyleSheet, View, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { AnimatePresence, MotiView } from "moti";
import { PlusIcon, XIcon } from "../../../shared/ui/icons";
import type { SubDraft } from "../hooks/useOnboardingFlow";
import { FREE_SUBSCRIPTION_LIMIT } from "../../../shared/store/usePaceStore";
import { parseGrouped } from "../../../shared/lib/money";
import { useCurrency } from "../../../shared/store/useCurrency";
import { useT } from "../../../shared/i18n";
import { theme } from "../../../shared/styles/theme";
import { Text } from "../../../shared/typography/Text";

interface SubscriptionsStepProps {
  subs: SubDraft[];
  onAdd: (name: string, amount: number) => void;
  onRemove: (id: string) => void;
  atLimit?: boolean;
}

export function SubscriptionsStep({
  subs,
  onAdd,
  onRemove,
  atLimit = false,
}: SubscriptionsStepProps) {
  const { symbol, fmt, groupLive } = useCurrency();
  const { t } = useT();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");

  const parsed = parseGrouped(amount);
  const canAdd = name.trim() !== "" && !Number.isNaN(parsed) && parsed > 0 && !atLimit;

  const submit = () => {
    if (!canAdd) return;
    onAdd(name, parsed);
    setName("");
    setAmount("");
  };

  return (
    <View style={styles.step}>
      <View style={styles.heading}>
        <Text style={styles.title}>{t("subsStep.title")}</Text>
        <Text style={styles.hint}>{t("subsStep.hint")}</Text>
      </View>

      <View style={styles.addRow}>
        <TextInput
          style={styles.nameInput}
          placeholder={t("subsStep.whatFor")}
          placeholderTextColor={theme.colors.textMute}
          value={name}
          onChangeText={setName}
          onSubmitEditing={submit}
        />
        <View style={styles.amountField}>
          <Text style={styles.prefix}>{symbol}</Text>
          <TextInput
            style={styles.amountInput}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={theme.colors.textMute}
            value={amount}
            onChangeText={(v) => setAmount(groupLive(v))}
            onSubmitEditing={submit}
            numberOfLines={1}
          />
        </View>
        <TouchableOpacity
          style={[styles.addBtn, !canAdd && { opacity: 0.3 }]}
          onPress={submit}
          disabled={!canAdd}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t("a11y.add")}
        >
          <PlusIcon color="#fff" />
        </TouchableOpacity>
      </View>

      {atLimit && (
        <Text style={styles.limitNote}>
          {t("subsStep.limitNote", { n: FREE_SUBSCRIPTION_LIMIT })}
        </Text>
      )}

      <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 40, gap: 8 }} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" showsVerticalScrollIndicator={false}>
        <AnimatePresence>
          {subs.map((sub) => (
            <MotiView
              key={sub.id}
              style={styles.item}
              from={{ opacity: 0, translateY: -8, height: 0 }}
              animate={{ opacity: 1, translateY: 0, height: 56 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: "timing", duration: 220 }}
            >
              <Text style={styles.itemName} numberOfLines={1}>{sub.name}</Text>
              <Text style={styles.itemAmount} numberOfLines={1}>{fmt(sub.amount)}</Text>
              <TouchableOpacity
                style={styles.remove}
                onPress={() => onRemove(sub.id)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`${sub.name}, ${t("a11y.delete")}`}
              >
                <XIcon size={14} color={theme.colors.textDim} />
              </TouchableOpacity>
            </MotiView>
          ))}
        </AnimatePresence>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  step: {
    flex: 1,
    paddingTop: 8,
    gap: 24,
  },
  heading: {},
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    lineHeight: 30,
    letterSpacing: -0.5,
  },
  hint: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "400",
    color: theme.colors.textSoft,
    lineHeight: 21,
  },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  limitNote: {
    marginTop: -12,
    fontFamily: theme.fonts.outfitMedium,
    fontSize: 13,
    fontWeight: "500",
    color: theme.colors.textDim,
    lineHeight: 19,
  },
  nameInput: {
    flex: 1,
    // Yükseklik padding + lineHeight ile kurulur (16*2 + 20 = 52). Sabit
    // height + textAlignVertical, iOS'ta Outfit metrikleriyle placeholder'ı
    // alta kaydırıyordu; deterministik line box ile metin tam ortalanır.
    paddingVertical: 16,
    lineHeight: 20,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingHorizontal: 16,
    fontFamily: theme.fonts.outfitMedium,
    fontSize: 15,
    fontWeight: "500",
    color: theme.colors.textPrimary,
  },
  amountField: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingHorizontal: 14,
    width: 104,
    gap: 4,
  },
  prefix: {
    fontFamily: theme.fonts.outfitBold,
    fontSize: 16,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.3)",
  },
  amountInput: {
    flex: 1,
    fontFamily: theme.fonts.outfitBold,
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    fontVariant: ["tabular-nums"],
  },
  addBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: theme.colors.stateGood,
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    flex: 1,
    marginHorizontal: -4,
    paddingHorizontal: 4,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    gap: 12,
    overflow: "hidden",
  },
  itemName: {
    flex: 1,
    fontFamily: theme.fonts.outfitMedium,
    fontSize: 15,
    fontWeight: "500",
    color: theme.colors.textPrimary,
  },
  itemAmount: {
    fontFamily: theme.fonts.outfitBold,
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.textSoft,
    fontVariant: ["tabular-nums"],
  },
  remove: {
    width: 28,
    height: 28,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
});
