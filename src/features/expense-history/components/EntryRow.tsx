import React, { useState } from "react";
import { StyleSheet, View, TextInput, TouchableOpacity } from "react-native";
import { Text } from "../../../shared/typography/Text";
import { MotiView } from "moti";
import { timeLabel } from "../../../shared/lib/date";
import { TrashIcon } from "../../../shared/ui/icons";
import { theme } from "../../../shared/styles/theme";

interface EntryRowProps {
  entry: any;
  onUpdate: (id: string, patch: any) => void;
  onRemove: (id: string) => void;
}

export function EntryRow({ entry, onUpdate, onRemove }: EntryRowProps) {
  const [amount, setAmount] = useState(String(entry.amount));
  const [note, setNote] = useState(entry.note ?? "");

  const commitAmount = () => {
    const value = Number.parseFloat(amount);
    if (Number.isFinite(value) && value > 0) onUpdate(entry.id, { amount: value });
    else setAmount(String(entry.amount));
  };

  const commitNote = () => {
    const trimmed = note.trim();
    if (trimmed !== (entry.note ?? "")) onUpdate(entry.id, { note: trimmed });
    setNote(trimmed);
  };

  return (
    <MotiView
      style={styles.item}
      from={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 56 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ type: "spring", stiffness: 420, damping: 36 }}
    >
      <Text style={styles.time}>{timeLabel(entry.ts)}</Text>

      <TextInput
        style={styles.noteInput}
        placeholder="Not ekle"
        placeholderTextColor={theme.colors.textDim}
        value={note}
        maxLength={40}
        onChangeText={setNote}
        onBlur={commitNote}
        onSubmitEditing={commitNote}
      />

      <View style={styles.amountField}>
        <Text style={styles.prefix}>₺</Text>
        <TextInput
          style={styles.amountInput}
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
          onBlur={commitAmount}
          onSubmitEditing={commitAmount}
        />
      </View>

      <TouchableOpacity
        style={styles.remove}
        onPress={() => onRemove(entry.id)}
        activeOpacity={0.7}
      >
        <TrashIcon color={theme.colors.textDim} />
      </TouchableOpacity>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    marginBottom: 8,
    overflow: "hidden",
  },
  time: {
    width: 38,
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textDim,
    fontVariant: ["tabular-nums"],
  },
  noteInput: {
    flex: 1,
    fontFamily: theme.fonts.outfitMedium,
    fontSize: 15,
    fontWeight: "500",
    color: theme.colors.textPrimary,
  },
  amountField: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  prefix: {
    fontFamily: theme.fonts.outfitBold,
    fontSize: 14,
    color: theme.colors.textDim,
    fontWeight: "700",
  },
  amountInput: {
    fontSize: 15,
    fontWeight: "700",
    fontFamily: theme.fonts.outfitBold,
    color: theme.colors.textPrimary,
    width: 60,
    textAlign: "right",
    fontVariant: ["tabular-nums"],
  },
  remove: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 11,
  },
});
