import React, { useState } from "react";
import { StyleSheet, View, TextInput } from "react-native";
import { Text } from "../../../shared/typography/Text";
import { useCurrency } from "../../../shared/store/useCurrency";
import { theme } from "../../../shared/styles/theme";

interface BudgetFieldProps {
  value: number;
  onCommit: (amount: number) => void;
}

export function BudgetField({ value, onCommit }: BudgetFieldProps) {
  const { symbol } = useCurrency();
  const [draft, setDraft] = useState(String(value));

  const commit = () => {
    const next = Number.parseFloat(draft);
    if (Number.isFinite(next) && next > 0) onCommit(next);
    else setDraft(String(value));
  };

  return (
    <View style={styles.budget}>
      <Text style={styles.budgetLabel}>Aylık bütçe</Text>
      <View style={styles.budgetField}>
        <Text style={styles.budgetPrefix}>{symbol}</Text>
        <TextInput
          style={styles.budgetInput}
          keyboardType="decimal-pad"
          value={draft}
          onChangeText={setDraft}
          onBlur={commit}
          onSubmitEditing={commit}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  budget: {
    marginBottom: 16,
  },
  budgetLabel: {
    marginBottom: 8,
    color: theme.colors.textSoft,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  budgetField: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  budgetPrefix: {
    fontSize: 22,
    color: theme.colors.textDim,
    fontWeight: "700",
    marginRight: 6,
  },
  budgetInput: {
    flex: 1,
    fontSize: 26,
    fontWeight: "800",
    fontFamily: theme.fonts.outfitExtra,
    color: theme.colors.textPrimary,
    minWidth: 80,
    letterSpacing: -0.5,
  },
});
