import React, { useRef, useState } from "react";
import { StyleSheet, View, TextInput, TouchableOpacity } from "react-native";
import { MotiView } from "moti";
import { usePaceStore } from "../../../shared/store/usePaceStore";
import { getTone } from "../../../shared/lib/tone";
import { useLimitLogic } from "../../limit-board/hooks/useLimitLogic";
import { ArrowUpIcon } from "../../../shared/ui/icons";
import { theme } from "../../../shared/styles/theme";
import { Text } from "../../../shared/typography/Text";

export function ExpenseInput({ bottomInset = 0 }: { bottomInset?: number }) {
  const addExpense = usePaceStore((s) => s.addExpense);
  const { remaining, limit } = useLimitLogic();
  const tone = getTone(remaining, limit);

  const [input, setInput] = useState("");
  const [note, setNote] = useState("");
  const inputRef = useRef<TextInput>(null);

  const amount = Number.parseFloat(input);
  const valid = !Number.isNaN(amount) && amount > 0;

  const submit = () => {
    if (!valid) return;
    addExpense(amount, note);
    setInput("");
    setNote("");
  };

  return (
    <View style={styles.bar}>
      <MotiView
        style={[
          styles.card,
          { 
            backgroundColor: `rgba(${tone.rgb}, 0.06)`,
            paddingBottom: Math.max(bottomInset + 16, 36)
          }
        ]}
        animate={{ backgroundColor: `rgba(${tone.rgb}, 0.06)` }}
        transition={{ type: "timing", duration: 700 }}
      >
        <Text style={styles.label}>Bugün ne harcadın?</Text>

        <View style={styles.row}>
          <TouchableOpacity
            style={styles.field}
            onPress={() => inputRef.current?.focus()}
            activeOpacity={1}
          >
            <Text style={styles.prefix}>₺</Text>
            <TextInput
              ref={inputRef}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor="rgba(255, 255, 255, 0.18)"
              style={[styles.input, input !== "" && styles.inputFilled]}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={submit}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.submit,
              {
                backgroundColor: tone.color,
                shadowColor: tone.glow,
              },
              !valid && { opacity: 0.3 },
            ]}
            onPress={submit}
            disabled={!valid}
            activeOpacity={0.86}
          >
            <ArrowUpIcon color="#fff" />
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.note}
          placeholder="Not ekle (opsiyonel) — kahve, market…"
          placeholderTextColor="rgba(255, 255, 255, 0.3)"
          value={note}
          onChangeText={setNote}
          onSubmitEditing={submit}
          maxLength={40}
        />
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    zIndex: 1,
  },
  card: {
    borderTopLeftRadius: theme.radius.input,
    borderTopRightRadius: theme.radius.input,
    paddingTop: 22,
    paddingHorizontal: 24,
  },
  label: {
    marginBottom: 14,
    color: theme.colors.textDim,
    fontSize: 13,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    position: "relative",
  },
  field: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 70, // submit button space
  },
  prefix: {
    color: "rgba(255, 255, 255, 0.22)",
    fontWeight: "700",
    fontSize: 32,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontFamily: theme.fonts.outfitExtra,
    fontSize: 40,
    fontWeight: "800",
    color: "rgba(255, 255, 255, 0.18)",
    letterSpacing: -1,
    paddingVertical: 0,
  },
  inputFilled: {
    color: theme.colors.textPrimary,
  },
  submit: {
    position: "absolute",
    right: 0,
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 8,
  },
  note: {
    width: "100%",
    marginTop: 14,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    fontFamily: theme.fonts.outfitMedium,
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.textPrimary,
  },
});
