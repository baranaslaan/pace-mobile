import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View, TextInput, TouchableOpacity } from "react-native";
import { Text } from "../../../shared/typography/Text";
import { MotiView } from "moti";
import { TrashIcon } from "../../../shared/ui/icons";
import { useCurrency } from "../../../shared/store/useCurrency";
import { parseGrouped } from "../../../shared/lib/money";
import { useT } from "../../../shared/i18n";
import { theme } from "../../../shared/styles/theme";
import type { Subscription } from "../../../shared/lib/engine";

interface SubscriptionRowProps {
  sub: Subscription;
  onUpdateAmount: (id: string, amount: number) => void;
  onRemove: (id: string) => void;
}

export function SubscriptionRow({ sub, onUpdateAmount, onRemove }: SubscriptionRowProps) {
  const { symbol, toBase, groupLive, toGroupedInput } = useCurrency();
  const { t } = useT();
  // Yazarken de blur'da da binlik ayıraçlı — tek tutarlı biçim.
  const grouped = toGroupedInput(sub.amount);
  const [draft, setDraft] = useState(grouped);
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) setDraft(grouped);
  }, [grouped]);

  const commit = () => {
    focused.current = false;
    const value = parseGrouped(draft);
    if (Number.isFinite(value) && value > 0) onUpdateAmount(sub.id, toBase(value));
    else setDraft(grouped);
  };

  return (
    <MotiView
      style={styles.item}
      from={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 56 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ type: "timing", duration: 220 }}
    >
      <Text style={styles.itemName} numberOfLines={1}>{sub.name}</Text>

      <View style={styles.amountField}>
        <Text style={styles.prefix}>{symbol}</Text>
        <TextInput
          style={styles.amountInput}
          keyboardType="number-pad"
          value={draft}
          onChangeText={(v) => setDraft(groupLive(v))}
          onFocus={() => {
            focused.current = true;
          }}
          onBlur={commit}
          onSubmitEditing={commit}
          numberOfLines={1}
        />
      </View>

      <TouchableOpacity
        style={styles.remove}
        onPress={() => onRemove(sub.id)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${sub.name}, ${t("a11y.delete")}`}
      >
        <TrashIcon color={theme.colors.textSoft} />
      </TouchableOpacity>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    marginBottom: 8,
    overflow: "hidden",
  },
  itemName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: theme.colors.textPrimary,
    paddingRight: 16,
  },
  amountField: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginRight: 12,
  },
  prefix: {
    fontSize: 14,
    color: theme.colors.textDim,
    fontWeight: "700",
    marginRight: 4,
  },
  amountInput: {
    fontSize: 15,
    fontWeight: "700",
    fontFamily: theme.fonts.outfitBold,
    color: theme.colors.textPrimary,
    // Sabit genişlik: tutar uzadıkça alan büyümesin, taşan kısım kırpılsın.
    width: 96,
    textAlign: "right",
    fontVariant: ["tabular-nums"],
  },
  remove: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 11,
  },
});
