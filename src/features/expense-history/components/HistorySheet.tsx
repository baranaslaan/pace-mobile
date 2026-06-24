import React, { useMemo, useState } from "react";
import { StyleSheet, View, TouchableOpacity, ScrollView } from "react-native";
import { Text } from "../../../shared/typography/Text";
import { AnimatePresence, MotiView } from "moti";
import { usePaceStore } from "../../../shared/store/usePaceStore";
import { dayKey } from "../../../shared/lib/date";
import { RotateCcwIcon } from "../../../shared/ui/icons";
import { BottomSheet } from "../../../shared/ui/BottomSheet";
import { EntryRow } from "./EntryRow";
import { useCurrency } from "../../../shared/store/useCurrency";
import { useT } from "../../../shared/i18n";
import { theme } from "../../../shared/styles/theme";

interface HistorySheetProps {
  open: boolean;
  onClose: () => void;
}

export function HistorySheet({ open, onClose }: HistorySheetProps) {
  const entries = usePaceStore((s) => s.entries);
  const updateExpense = usePaceStore((s) => s.updateExpense);
  const removeExpense = usePaceStore((s) => s.removeExpense);
  const resetToday = usePaceStore((s) => s.resetToday);
  const { fmt } = useCurrency();
  const { t } = useT();

  const [confirmReset, setConfirmReset] = useState(false);

  const today = useMemo(() => {
    const key = dayKey();
    return entries
      .filter((e) => e.day === key)
      .sort((a, b) => b.ts - a.ts);
  }, [entries]);

  const total = today.reduce((sum, e) => sum + e.amount, 0);

  const handleClose = () => {
    setConfirmReset(false);
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={handleClose} title={t("history.title")}>
      <Text style={styles.summary}>
        {t("history.summaryTotal")} <Text style={{ fontWeight: "700" }}>{fmt(total)}</Text>
        <Text style={styles.dot}> • </Text>
        {t("history.items", { n: today.length })}
      </Text>

      <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 20 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <AnimatePresence>
          {today.map((entry) => (
            <EntryRow
              key={entry.id}
              entry={entry}
              onUpdate={updateExpense}
              onRemove={removeExpense}
            />
          ))}
        </AnimatePresence>

        {today.length === 0 && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>{t("history.empty")}</Text>
          </View>
        )}
      </ScrollView>

      {today.length > 0 && (
        !confirmReset ? (
          <TouchableOpacity style={styles.reset} onPress={() => setConfirmReset(true)} activeOpacity={0.7}>
            <RotateCcwIcon color="#f87171" />
            <Text style={styles.resetText}>{t("history.resetToday")}</Text>
          </TouchableOpacity>
        ) : (
          <MotiView
            style={styles.confirm}
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Text style={styles.confirmText}>{t("history.confirmReset")}</Text>
            <View style={styles.confirmBtns}>
              <TouchableOpacity
                style={styles.cancel}
                onPress={() => setConfirmReset(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelText}>{t("common.cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmDanger}
                onPress={() => {
                  resetToday();
                  setConfirmReset(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.confirmDangerText}>{t("common.reset")}</Text>
              </TouchableOpacity>
            </View>
          </MotiView>
        )
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  summary: {
    fontSize: 13,
    color: theme.colors.textSoft,
    marginBottom: 18,
  },
  dot: {
    color: theme.colors.textMute,
  },
  list: {
    // Sabit 300 cap yerine: sheet'in 88%'ine kadar uzar (başlık + alt eylem
    // sabit kalır), taşınca liste içinde scroll eder.
    flexShrink: 1,
    marginHorizontal: -4,
    paddingHorizontal: 4,
  },
  infoBox: {
    paddingVertical: 28,
    paddingHorizontal: 12,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.textDim,
    lineHeight: 21,
    textAlign: "center",
  },
  reset: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  resetText: {
    color: "#f87171",
    fontSize: 14,
    fontWeight: "700",
  },
  confirm: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 14,
  },
  confirmText: {
    color: theme.colors.textSoft,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    marginBottom: 12,
  },
  confirmBtns: {
    flexDirection: "row",
    gap: 8,
  },
  cancel: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.07)",
    alignItems: "center",
  },
  cancelText: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  confirmDanger: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#dc2626",
    alignItems: "center",
  },
  confirmDangerText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});
