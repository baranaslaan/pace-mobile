import React, { useState } from "react";
import { StyleSheet, View, TextInput, TouchableOpacity } from "react-native";
import { Text } from "../../../shared/typography/Text";
import { MotiView } from "moti";
import { TrashIcon } from "../../../shared/ui/icons";
import { useCurrency } from "../../../shared/store/useCurrency";
import { theme } from "../../../shared/styles/theme";

interface SubscriptionRowProps {
  sub: any;
  onUpdateAmount: (id: string, amount: number) => void;
  onRemove: (id: string) => void;
}

export function SubscriptionRow({ sub, onUpdateAmount, onRemove }: SubscriptionRowProps) {
  const { symbol, toBase, toDisplay } = useCurrency();
  const [draft, setDraft] = useState(String(Math.round(toDisplay(sub.amount))));

  const commit = () => {
    const value = Number.parseFloat(draft);
    if (Number.isFinite(value) && value > 0) onUpdateAmount(sub.id, toBase(value));
    else setDraft(String(Math.round(toDisplay(sub.amount))));
  };

  return (
    <MotiView
      style={styles.item}
      from={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 56 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ type: "spring", stiffness: 420, damping: 36 }}
    >
      <Text style={styles.itemName} numberOfLines={1}>{sub.name}</Text>

      <View style={styles.amountField}>
        <Text style={styles.prefix}>{symbol}</Text>
        <TextInput
          style={styles.amountInput}
          keyboardType="decimal-pad"
          value={draft}
          onChangeText={setDraft}
          onBlur={commit}
          onSubmitEditing={commit}
        />
      </View>

      <TouchableOpacity
        style={styles.remove}
        onPress={() => onRemove(sub.id)}
        activeOpacity={0.7}
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
    minWidth: 40,
    textAlign: "right",
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
