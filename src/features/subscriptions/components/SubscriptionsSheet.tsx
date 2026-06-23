import React, { useState } from "react";
import { StyleSheet, View, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { Text } from "../../../shared/typography/Text";
import { AnimatePresence } from "moti";
import { usePaceStore } from "../../../shared/store/usePaceStore";
import { useLimitLogic } from "../../limit-board/hooks/useLimitLogic";
import { totalSubscriptions } from "../../../shared/lib/engine";
import { PlusIcon } from "../../../shared/ui/icons";
import { BottomSheet } from "../../../shared/ui/BottomSheet";
import { SubscriptionRow } from "./SubscriptionRow";
import { BudgetField } from "./BudgetField";
import { theme } from "../../../shared/styles/theme";

const FREE_LIMIT = 3;

interface SubscriptionsSheetProps {
  open: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

export function SubscriptionsSheet({ open, onClose, onUpgrade }: SubscriptionsSheetProps) {
  const budget = usePaceStore((s) => s.budget);
  const setBudget = usePaceStore((s) => s.setBudget);
  const subscriptions = usePaceStore((s) => s.subscriptions);
  const addSubscription = usePaceStore((s) => s.addSubscription);
  const updateSubscription = usePaceStore((s) => s.updateSubscription);
  const removeSubscription = usePaceStore((s) => s.removeSubscription);
  const isPro = usePaceStore((s) => s.isPro);
  const { limit } = useLimitLogic();

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");

  const parsed = Number.parseFloat(amount);
  const canAdd = name.trim() !== "" && !Number.isNaN(parsed) && parsed > 0;
  const atFreeLimit = !isPro && subscriptions.length >= FREE_LIMIT;
  const total = totalSubscriptions(subscriptions);

  const submit = () => {
    if (!canAdd || atFreeLimit) return;
    addSubscription(name, parsed);
    setName("");
    setAmount("");
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="Bütçe & Giderler">
      <BudgetField value={budget} onCommit={setBudget} />

      <Text style={styles.sub}>
        Günlük limitin <Text style={{ fontWeight: "700" }}>₺{Math.round(limit)}</Text>
        <Text style={styles.dot}> • </Text>
        rezerve <Text style={{ fontWeight: "700" }}>₺{Math.round(total)}</Text>
      </Text>

      <Text style={styles.listLabel}>Sabit giderler</Text>

      <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 20 }} keyboardShouldPersistTaps="handled">
        <AnimatePresence>
          {subscriptions.map((sub) => (
            <SubscriptionRow
              key={sub.id}
              sub={sub}
              onUpdateAmount={(id, value) => updateSubscription(id, { amount: value })}
              onRemove={removeSubscription}
            />
          ))}
        </AnimatePresence>

        {subscriptions.length === 0 && (
          <Text style={styles.empty}>Henüz sabit gider yok. Kira, abonelik, kredi…</Text>
        )}
      </ScrollView>

      {atFreeLimit ? (
        <View style={styles.lock}>
          <Text style={styles.lockText}>
            Ücretsiz planda en fazla {FREE_LIMIT} sabit gider.
            <Text style={styles.proSpan}> Pace Pro</Text> ile sınırsız ekle — tek seferlik, ömür boyu.
          </Text>
          <TouchableOpacity style={styles.lockCta} onPress={onUpgrade} activeOpacity={0.9}>
            <Text style={styles.lockCtaText}>Pace Pro'ya geç</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.addRow}>
          <TextInput
            style={styles.nameInput}
            placeholder="Ne için?"
            placeholderTextColor={theme.colors.textDim}
            value={name}
            onChangeText={setName}
            onSubmitEditing={submit}
          />
          <View style={styles.amountField}>
            <Text style={styles.amountPrefix}>₺</Text>
            <TextInput
              style={styles.amountInput}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={theme.colors.textDim}
              value={amount}
              onChangeText={setAmount}
              onSubmitEditing={submit}
            />
          </View>
          <TouchableOpacity
            style={[styles.add, !canAdd && { opacity: 0.35 }]}
            onPress={submit}
            disabled={!canAdd}
            activeOpacity={0.7}
          >
            <PlusIcon color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sub: {
    fontSize: 14,
    color: theme.colors.textSoft,
    marginTop: 12,
    marginBottom: 32,
  },
  dot: {
    color: theme.colors.textMute,
  },
  listLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.textDim,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  list: {
    maxHeight: 300,
  },
  empty: {
    fontSize: 15,
    color: theme.colors.textSoft,
    fontStyle: "italic",
    paddingVertical: 16,
  },
  lock: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    marginTop: 16,
  },
  lockText: {
    fontSize: 14,
    color: theme.colors.textSoft,
    lineHeight: 20,
    textAlign: "center",
  },
  proSpan: {
    color: theme.colors.stateGood,
    fontWeight: "700",
  },
  lockCta: {
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.colors.stateGood,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },
  lockCtaText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    gap: 12,
  },
  nameInput: {
    flex: 1,
    height: 50,
    borderRadius: 14,
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
    height: 50,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingHorizontal: 12,
    width: 90,
  },
  amountPrefix: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.textDim,
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    fontFamily: theme.fonts.outfitBold,
    color: theme.colors.textPrimary,
    textAlign: "right",
  },
  add: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: theme.colors.stateGood,
    alignItems: "center",
    justifyContent: "center",
  },
});
