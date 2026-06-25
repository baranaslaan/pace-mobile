import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View, TextInput, TouchableOpacity } from "react-native";
import { Text } from "../../../shared/typography/Text";
import { MotiView } from "moti";
import { timeLabel } from "../../../shared/lib/date";
import { TrashIcon } from "../../../shared/ui/icons";
import { CATEGORIES, categoryById } from "../../../shared/lib/categories";
import { useCurrency } from "../../../shared/store/useCurrency";
import { parseGrouped } from "../../../shared/lib/money";
import { useT } from "../../../shared/i18n";
import { theme } from "../../../shared/styles/theme";

interface EntryRowProps {
  entry: any;
  onUpdate: (id: string, patch: any) => void;
  onRemove: (id: string) => void;
}

export function EntryRow({ entry, onUpdate, onRemove }: EntryRowProps) {
  const { symbol, toBase, groupLive, toGroupedInput } = useCurrency();
  const { t } = useT();
  // Yazarken de blur'da da binlik ayıraçlı — tek tutarlı biçim.
  const grouped = toGroupedInput(entry.amount);
  const [amount, setAmount] = useState(grouped);
  const [note, setNote] = useState(entry.note ?? "");
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) setAmount(grouped);
  }, [grouped]);

  const commitAmount = () => {
    focused.current = false;
    const value = parseGrouped(amount);
    if (Number.isFinite(value) && value > 0) onUpdate(entry.id, { amount: toBase(value) });
    else setAmount(grouped);
  };

  const commitNote = () => {
    const trimmed = note.trim();
    if (trimmed !== (entry.note ?? "")) onUpdate(entry.id, { note: trimmed });
    setNote(trimmed);
  };

  // Dokununca sıradaki kategoriye geç (listede sırayla döner).
  const cat = categoryById(entry.category);
  const cycleCategory = () => {
    const idx = CATEGORIES.findIndex((c) => c.id === entry.category);
    const next = CATEGORIES[(idx + 1) % CATEGORIES.length];
    onUpdate(entry.id, { category: next.id });
  };

  return (
    <MotiView
      style={styles.item}
      from={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 56 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ type: "timing", duration: 220 }}
    >
      <Text style={styles.time}>{timeLabel(entry.ts)}</Text>

      <TouchableOpacity
        style={styles.catBtn}
        onPress={cycleCategory}
        activeOpacity={0.6}
        hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
      >
        <View style={[styles.catDot, { backgroundColor: cat.color }]} />
      </TouchableOpacity>

      <TextInput
        style={styles.noteInput}
        placeholder={t("entry.notePlaceholder")}
        placeholderTextColor={theme.colors.textDim}
        value={note}
        maxLength={40}
        onChangeText={setNote}
        onBlur={commitNote}
        onSubmitEditing={commitNote}
      />

      <View style={styles.amountField}>
        <Text style={styles.prefix}>{symbol}</Text>
        <TextInput
          style={styles.amountInput}
          keyboardType="number-pad"
          value={amount}
          onChangeText={(v) => setAmount(groupLive(v))}
          onFocus={() => {
            focused.current = true;
          }}
          onBlur={commitAmount}
          onSubmitEditing={commitAmount}
          numberOfLines={1}
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
  catBtn: {
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  catDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
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
    // Sabit genişlik: gruplu tutar uzasa da satır kaymasın, taşan kırpılsın.
    width: 84,
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
