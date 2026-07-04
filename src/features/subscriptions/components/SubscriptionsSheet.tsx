import React, { useState } from "react";
import { StyleSheet, View, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { Text } from "../../../shared/typography/Text";
import { AnimatePresence } from "moti";
import { usePaceStore, FREE_SUBSCRIPTION_LIMIT } from "../../../shared/store/usePaceStore";
import { useLimitLogic } from "../../limit-board/hooks/useLimitLogic";
import { totalSubscriptions } from "../../../shared/lib/engine";
import { parseGrouped } from "../../../shared/lib/money";
import { PlusIcon, CardIcon } from "../../../shared/ui/icons";
import { BottomSheet } from "../../../shared/ui/BottomSheet";
import { EmptyState } from "../../../shared/ui/EmptyState";
import { SubscriptionRow } from "./SubscriptionRow";
import { BudgetField } from "./BudgetField";
import { useCurrency } from "../../../shared/store/useCurrency";
import { ProUpsell } from "../../pro/components/ProUpsell";
import { useT } from "../../../shared/i18n";
import { theme } from "../../../shared/styles/theme";

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
  const { symbol, fmt, toBase, groupLive } = useCurrency();
  const { t, tu } = useT();

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");

  const parsed = parseGrouped(amount);
  const canAdd = name.trim() !== "" && !Number.isNaN(parsed) && parsed > 0;
  const atFreeLimit = !isPro && subscriptions.length >= FREE_SUBSCRIPTION_LIMIT;
  const total = totalSubscriptions(subscriptions);

  const submit = () => {
    if (!canAdd || atFreeLimit) return;
    addSubscription(name, toBase(parsed));
    setName("");
    setAmount("");
  };

  return (
    <BottomSheet open={open} onClose={onClose} title={t("subs.title")}>
      <BudgetField value={budget} onCommit={setBudget} />

      <Text style={styles.sub}>
        {t("subs.daily")} <Text style={{ fontWeight: "700" }}>{fmt(limit)}</Text>
        <Text style={styles.dot}> • </Text>
        {t("subs.reserved")} <Text style={{ fontWeight: "700" }}>{fmt(total)}</Text>
      </Text>

      <Text style={styles.listLabel}>{tu("subs.listLabel")}</Text>
      <Text style={styles.listHint}>{t("subs.listHint")}</Text>

      <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 20 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
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
          <EmptyState
            icon={<CardIcon size={22} color={theme.colors.textDim} />}
            text={t("subs.empty")}
          />
        )}
      </ScrollView>

      {atFreeLimit ? (
        <ProUpsell
          title={t("subs.proTitle")}
          text={t("subs.proText", { n: FREE_SUBSCRIPTION_LIMIT })}
          cta={t("subs.goPro")}
          onUpgrade={onUpgrade}
        />
      ) : (
        <View style={styles.addRow}>
          <TextInput
            style={styles.nameInput}
            placeholder={t("subs.whatFor")}
            placeholderTextColor={theme.colors.textDim}
            value={name}
            onChangeText={setName}
            onSubmitEditing={submit}
          />
          <View style={styles.amountField}>
            <Text style={styles.amountPrefix}>{symbol}</Text>
            <TextInput
              style={styles.amountInput}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={theme.colors.textDim}
              value={amount}
              onChangeText={(v) => setAmount(groupLive(v))}
              onSubmitEditing={submit}
              numberOfLines={1}
            />
          </View>
          <TouchableOpacity
            style={[styles.add, !canAdd && { opacity: 0.35 }]}
            onPress={submit}
            disabled={!canAdd}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={t("a11y.add")}
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
    marginBottom: 4,
  },
  listHint: {
    fontSize: 12,
    color: theme.colors.textMute,
    lineHeight: 16,
    marginBottom: 12,
  },
  list: {
    // Sabit cap yerine sheet'in 88%'ine kadar uzar; bütçe alanı + alt eylem
    // sabit kalır, liste taşınca scroll eder.
    flexShrink: 1,
  },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    gap: 12,
  },
  nameInput: {
    flex: 1,
    // Yükseklik padding + lineHeight ile (15*2 + 20 = 50). Sabit height tek
    // başına iOS'ta Outfit placeholder'ını alta kaydırıyordu.
    paddingVertical: 15,
    lineHeight: 20,
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
