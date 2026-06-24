import React from "react";
import { StyleSheet, View, TextInput } from "react-native";
import { Text } from "../../../shared/typography/Text";
import { useCurrency } from "../../../shared/store/useCurrency";
import { useT } from "../../../shared/i18n";
import { theme } from "../../../shared/styles/theme";

interface BudgetStepProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export function BudgetStep({ value, onChange, onSubmit }: BudgetStepProps) {
  const { symbol } = useCurrency();
  const { t } = useT();
  return (
    <View style={styles.step}>
      <View style={styles.heading}>
        <Text style={styles.title}>{t("budgetStep.title")}</Text>
        <Text style={styles.hint}>{t("budgetStep.hint")}</Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.prefix}>{symbol}</Text>
        <TextInput
          autoFocus
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor={theme.colors.textMute}
          style={[styles.input, value !== "" && styles.inputFilled]}
          value={value}
          onChangeText={onChange}
          onSubmitEditing={onSubmit}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  step: {
    flex: 1,
    justifyContent: "center",
    gap: 36,
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
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  prefix: {
    fontSize: 34,
    fontWeight: "700",
    fontFamily: theme.fonts.outfitBold,
    color: "rgba(255, 255, 255, 0.22)",
  },
  input: {
    flex: 1,
    fontSize: 48,
    fontWeight: "800",
    fontFamily: theme.fonts.outfitExtra,
    letterSpacing: -1,
    color: "rgba(255, 255, 255, 0.18)",
  },
  inputFilled: {
    color: theme.colors.textPrimary,
  },
});
