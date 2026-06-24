import React, { useState } from "react";
import { StyleSheet, View, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { Text } from "../../../shared/typography/Text";
import { AnimatePresence, MotiView } from "moti";
import { usePaceStore } from "../../../shared/store/usePaceStore";
import { useCurrency } from "../../../shared/store/useCurrency";
import { useT, weekdaysShort, weekdaysFull } from "../../../shared/i18n";
import { CATEGORIES, categoryById } from "../../../shared/lib/categories";
import type { Cadence } from "../../../shared/lib/recurring";
import { PlusIcon, TrashIcon } from "../../../shared/ui/icons";
import { BottomSheet } from "../../../shared/ui/BottomSheet";
import { ProUpsell } from "../../pro/components/ProUpsell";
import { theme } from "../../../shared/styles/theme";

// Pazartesi-başlangıçlı görüntü sırası (JS getDay indeksi).
const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

interface RecurringSheetProps {
  open: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

/** Kategori seçici (yatay chip) — boş seçim "Diğer"e düşer. */
function CategoryPicker({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (id: string | undefined) => void;
}) {
  const { t } = useT();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.catRow}
    >
      {CATEGORIES.map((c) => {
        const active = value === c.id;
        return (
          <TouchableOpacity
            key={c.id}
            style={[styles.catChip, active && { borderColor: c.color, backgroundColor: `${c.color}1f` }]}
            onPress={() => onChange(active ? undefined : c.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.dot, { backgroundColor: c.color }]} />
            <Text style={[styles.catChipText, active && styles.catChipTextActive]}>
              {t(`category.${c.id}`)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

export function RecurringSheet({ open, onClose, onUpgrade }: RecurringSheetProps) {
  const templates = usePaceStore((s) => s.templates);
  const recurring = usePaceStore((s) => s.recurring);
  const isPro = usePaceStore((s) => s.isPro);
  const addTemplate = usePaceStore((s) => s.addTemplate);
  const removeTemplate = usePaceStore((s) => s.removeTemplate);
  const addRecurring = usePaceStore((s) => s.addRecurring);
  const removeRecurring = usePaceStore((s) => s.removeRecurring);
  const { fmt, toBase, symbol } = useCurrency();
  const { t, lang } = useT();
  const wdShort = weekdaysShort(lang);
  const wdFull = weekdaysFull(lang);

  // Hızlı ekleme formu
  const [qName, setQName] = useState("");
  const [qAmount, setQAmount] = useState("");
  const [qCat, setQCat] = useState<string | undefined>(undefined);
  const qParsed = Number.parseFloat(qAmount);
  const qValid = qName.trim() !== "" && Number.isFinite(qParsed) && qParsed > 0;

  const submitQuick = () => {
    if (!qValid) return;
    addTemplate(qName, toBase(qParsed), qCat);
    setQName("");
    setQAmount("");
    setQCat(undefined);
  };

  // Zamanlanmış formu
  const [sName, setSName] = useState("");
  const [sAmount, setSAmount] = useState("");
  const [sCat, setSCat] = useState<string | undefined>(undefined);
  const [cadence, setCadence] = useState<Cadence>("monthly");
  const [weekday, setWeekday] = useState(1);
  const [monthDay, setMonthDay] = useState("1");
  const sParsed = Number.parseFloat(sAmount);
  const sDay = cadence === "weekly" ? weekday : Math.min(31, Math.max(1, Number.parseInt(monthDay || "1", 10)));
  const sValid = sName.trim() !== "" && Number.isFinite(sParsed) && sParsed > 0;

  const submitScheduled = () => {
    if (!sValid) return;
    addRecurring({ label: sName, amount: toBase(sParsed), category: sCat, cadence, day: sDay });
    setSName("");
    setSAmount("");
    setSCat(undefined);
  };

  const ruleSummary = (cad: Cadence, day: number) =>
    cad === "weekly"
      ? t("recurring.weeklySummary", { day: wdFull[day] })
      : t("recurring.monthlySummary", { day });

  return (
    <BottomSheet open={open} onClose={onClose} title={t("recurring.title")}>
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 24 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Hızlı ekleme */}
        <Text style={styles.sectionLabel}>{t("recurring.quickSection")}</Text>
        <Text style={styles.hint}>{t("recurring.quickHint")}</Text>

        <AnimatePresence>
          {templates.map((tpl) => (
            <MotiView
              key={tpl.id}
              style={styles.item}
              from={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 52 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: "timing", duration: 200 }}
            >
              <View style={[styles.dot, { backgroundColor: categoryById(tpl.category).color }]} />
              <Text style={styles.itemName} numberOfLines={1}>{tpl.label}</Text>
              <Text style={styles.itemAmount}>{fmt(tpl.amount)}</Text>
              <TouchableOpacity style={styles.remove} onPress={() => removeTemplate(tpl.id)} activeOpacity={0.7}>
                <TrashIcon color={theme.colors.textSoft} />
              </TouchableOpacity>
            </MotiView>
          ))}
        </AnimatePresence>
        {templates.length === 0 && <Text style={styles.empty}>{t("recurring.quickEmpty")}</Text>}

        <View style={styles.addRow}>
          <TextInput
            style={styles.nameInput}
            placeholder={t("recurring.name")}
            placeholderTextColor={theme.colors.textDim}
            value={qName}
            onChangeText={setQName}
          />
          <View style={styles.amountField}>
            <Text style={styles.prefix}>{symbol}</Text>
            <TextInput
              style={styles.amountInput}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={theme.colors.textDim}
              value={qAmount}
              onChangeText={setQAmount}
            />
          </View>
          <TouchableOpacity
            style={[styles.add, !qValid && { opacity: 0.35 }]}
            onPress={submitQuick}
            disabled={!qValid}
            activeOpacity={0.8}
          >
            <PlusIcon color="#fff" />
          </TouchableOpacity>
        </View>
        <CategoryPicker value={qCat} onChange={setQCat} />

        {/* Zamanlanmış */}
        <Text style={[styles.sectionLabel, { marginTop: 28 }]}>{t("recurring.scheduledSection")}</Text>
        <Text style={styles.hint}>{t("recurring.scheduledHint")}</Text>

        {isPro ? (
        <>
        <AnimatePresence>
          {recurring.map((r) => (
            <MotiView
              key={r.id}
              style={styles.item}
              from={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 52 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: "timing", duration: 200 }}
            >
              <View style={[styles.dot, { backgroundColor: categoryById(r.category).color }]} />
              <View style={styles.ruleInfo}>
                <Text style={styles.itemName} numberOfLines={1}>{r.label}</Text>
                <Text style={styles.ruleSummary}>{ruleSummary(r.cadence, r.day)}</Text>
              </View>
              <Text style={styles.itemAmount}>{fmt(r.amount)}</Text>
              <TouchableOpacity style={styles.remove} onPress={() => removeRecurring(r.id)} activeOpacity={0.7}>
                <TrashIcon color={theme.colors.textSoft} />
              </TouchableOpacity>
            </MotiView>
          ))}
        </AnimatePresence>
        {recurring.length === 0 && <Text style={styles.empty}>{t("recurring.scheduledEmpty")}</Text>}

        <View style={styles.addRow}>
          <TextInput
            style={styles.nameInput}
            placeholder={t("recurring.name")}
            placeholderTextColor={theme.colors.textDim}
            value={sName}
            onChangeText={setSName}
          />
          <View style={styles.amountField}>
            <Text style={styles.prefix}>{symbol}</Text>
            <TextInput
              style={styles.amountInput}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={theme.colors.textDim}
              value={sAmount}
              onChangeText={setSAmount}
            />
          </View>
          <TouchableOpacity
            style={[styles.add, !sValid && { opacity: 0.35 }]}
            onPress={submitScheduled}
            disabled={!sValid}
            activeOpacity={0.8}
          >
            <PlusIcon color="#fff" />
          </TouchableOpacity>
        </View>

        <CategoryPicker value={sCat} onChange={setSCat} />

        {/* Aralık seçimi */}
        <View style={styles.cadenceRow}>
          {(["monthly", "weekly"] as Cadence[]).map((c) => {
            const active = cadence === c;
            return (
              <TouchableOpacity
                key={c}
                style={[styles.cadenceChip, active && styles.cadenceChipActive]}
                onPress={() => setCadence(c)}
                activeOpacity={0.8}
              >
                <Text style={[styles.cadenceText, active && styles.cadenceTextActive]}>
                  {t(`recurring.${c}`)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {cadence === "weekly" ? (
          <View style={styles.weekRow}>
            {WEEKDAY_ORDER.map((wd) => {
              const active = weekday === wd;
              return (
                <TouchableOpacity
                  key={wd}
                  style={[styles.weekChip, active && styles.cadenceChipActive]}
                  onPress={() => setWeekday(wd)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.weekChipText, active && styles.cadenceTextActive]}>
                    {wdShort[wd]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.monthDayRow}>
            <Text style={styles.monthDayLabel}>{t("recurring.dayOfMonth")}</Text>
            <TextInput
              style={styles.monthDayInput}
              keyboardType="number-pad"
              value={monthDay}
              onChangeText={(v) => setMonthDay(v.replace(/[^0-9]/g, "").slice(0, 2))}
              maxLength={2}
            />
          </View>
        )}
        </>
        ) : (
          <ProUpsell
            title={t("recurring.proTitle")}
            text={t("recurring.proText")}
            cta={t("recurring.goPro")}
            onUpgrade={onUpgrade}
          />
        )}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  scroll: {
    // Sheet'in 88%'ine kadar uzar, ondan sonra scroll devreye girer (sabit cap yok).
    flexShrink: 1,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  hint: {
    fontSize: 13,
    color: theme.colors.textSoft,
    marginBottom: 14,
  },
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
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  itemName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: theme.colors.textPrimary,
  },
  ruleInfo: {
    flex: 1,
  },
  ruleSummary: {
    fontSize: 12,
    color: theme.colors.textMute,
    marginTop: 2,
  },
  itemAmount: {
    fontSize: 15,
    fontWeight: "700",
    fontFamily: theme.fonts.outfitBold,
    color: theme.colors.textPrimary,
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
  empty: {
    fontSize: 13,
    color: theme.colors.textDim,
    paddingVertical: 8,
  },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  nameInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    fontFamily: theme.fonts.outfitMedium,
    fontSize: 15,
    color: theme.colors.textPrimary,
  },
  amountField: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
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
    minWidth: 44,
    textAlign: "right",
  },
  add: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.stateGood,
  },
  catRow: {
    gap: 8,
    paddingVertical: 12,
  },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingVertical: 8,
    paddingHorizontal: 13,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  catChipText: {
    fontFamily: theme.fonts.outfitMedium,
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.textSoft,
  },
  catChipTextActive: {
    color: theme.colors.textPrimary,
  },
  cadenceRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  cadenceChip: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 11,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  cadenceChipActive: {
    borderColor: theme.colors.stateGood,
    backgroundColor: "rgba(59, 130, 246, 0.12)",
  },
  cadenceText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textSoft,
  },
  cadenceTextActive: {
    color: theme.colors.textPrimary,
  },
  weekRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 10,
  },
  weekChip: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  weekChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textSoft,
  },
  monthDayRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    paddingHorizontal: 4,
  },
  monthDayLabel: {
    fontSize: 14,
    color: theme.colors.textSoft,
    fontWeight: "600",
  },
  monthDayInput: {
    width: 64,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    fontFamily: theme.fonts.outfitBold,
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    textAlign: "center",
  },
});
