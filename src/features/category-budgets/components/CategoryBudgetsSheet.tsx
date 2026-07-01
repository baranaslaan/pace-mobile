import React, { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, View, TextInput, TouchableOpacity, ScrollView, Pressable } from "react-native";
import { MotiView } from "moti";
import { Text } from "../../../shared/typography/Text";
import { usePaceStore } from "../../../shared/store/usePaceStore";
import { useCategories } from "../../../shared/store/useCategories";
import { useDayKey } from "../../../shared/store/useDayKey";
import { categoryBreakdown } from "../../../shared/lib/engine";
import { monthKey } from "../../../shared/lib/date";
import {
  CATEGORY_PALETTE,
  DEFAULT_CATEGORY_ID,
  type ResolvedCategory,
} from "../../../shared/lib/categories";
import { parseGrouped } from "../../../shared/lib/money";
import { BottomSheet } from "../../../shared/ui/BottomSheet";
import { ProUpsell } from "../../pro/components/ProUpsell";
import { PlusIcon, TrashIcon } from "../../../shared/ui/icons";
import { useCurrency } from "../../../shared/store/useCurrency";
import { useT } from "../../../shared/i18n";
import { theme } from "../../../shared/styles/theme";

interface CategoryBudgetsSheetProps {
  open: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

/** Kullanım yüzdesine göre ilerleme rengi. */
function usageColor(pct: number): string {
  if (pct >= 100) return theme.colors.stateOver;
  if (pct >= 80) return theme.colors.stateWarn;
  return theme.colors.stateGood;
}

export function CategoryBudgetsSheet({ open, onClose, onUpgrade }: CategoryBudgetsSheetProps) {
  const isPro = usePaceStore((s) => s.isPro);
  const entries = usePaceStore((s) => s.entries);
  const categoryBudgets = usePaceStore((s) => s.categoryBudgets);
  const setCategoryBudget = usePaceStore((s) => s.setCategoryBudget);
  const addCustomCategory = usePaceStore((s) => s.addCustomCategory);
  const removeCustomCategory = usePaceStore((s) => s.removeCustomCategory);
  const { list } = useCategories();
  const { t } = useT();
  const today = useDayKey();

  const month = monthKey(new Date(`${today}T12:00:00`));
  const spentByCat = useMemo(() => {
    const m: Record<string, number> = {};
    for (const slice of categoryBreakdown(entries, month)) m[slice.categoryId] = slice.total;
    return m;
  }, [entries, month]);

  // Bütçelenebilir kategoriler — "Diğer" (yakalama kovası) hariç, custom dahil.
  const budgetable = list.filter((c) => c.id !== DEFAULT_CATEGORY_ID);

  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState<string>(CATEGORY_PALETTE[0]);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const canAdd = newName.trim().length > 0;

  const submitNew = () => {
    if (!canAdd) return;
    addCustomCategory(newName, newColor);
    setNewName("");
    setNewColor(CATEGORY_PALETTE[0]);
    setPaletteOpen(false);
  };

  return (
    <BottomSheet open={open} onClose={onClose} title={t("catBudget.title")}>
      {!isPro ? (
        <ProUpsell
          title={t("catBudget.proTitle")}
          text={t("catBudget.proText")}
          cta={t("catBudget.goPro")}
          onUpgrade={onUpgrade}
        />
      ) : (
        <>
          <Text style={styles.intro}>{t("catBudget.intro")}</Text>
          <ScrollView
            style={styles.list}
            contentContainerStyle={{ paddingBottom: 12 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {budgetable.map((cat) => (
              <CategoryBudgetRow
                key={cat.id}
                category={cat}
                spentBase={spentByCat[cat.id] ?? 0}
                limitBase={categoryBudgets[cat.id] ?? 0}
                onCommit={(amount) => setCategoryBudget(cat.id, amount)}
                onDelete={cat.builtin ? undefined : () => removeCustomCategory(cat.id)}
                pctLabel={(n) => t("common.pct", { n })}
              />
            ))}
          </ScrollView>

          {/* Yeni (custom) kategori ekle */}
          <View style={styles.addBox}>
            {paletteOpen && (
              <Pressable
                style={styles.paletteBackdrop}
                onPress={() => setPaletteOpen(false)}
              />
            )}
            <View style={styles.addRow}>
              <TouchableOpacity
                onPress={() => setPaletteOpen((o) => !o)}
                activeOpacity={0.7}
                hitSlop={8}
              >
                <View style={[styles.dot, styles.dotLg, { backgroundColor: newColor }]} />
              </TouchableOpacity>
              <TextInput
                style={styles.nameInput}
                placeholder={t("catBudget.newPlaceholder")}
                placeholderTextColor={theme.colors.textDim}
                value={newName}
                onChangeText={setNewName}
                onFocus={() => setPaletteOpen(false)}
                onSubmitEditing={submitNew}
                maxLength={20}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={[styles.add, !canAdd && { opacity: 0.35 }]}
                onPress={submitNew}
                disabled={!canAdd}
                activeOpacity={0.7}
              >
                <PlusIcon color="#fff" />
              </TouchableOpacity>
            </View>
            {paletteOpen && (
              <MotiView
                style={styles.palettePop}
                from={{ opacity: 0, translateY: 6 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "timing", duration: 160 }}
              >
                {CATEGORY_PALETTE.map((color) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => {
                      setNewColor(color);
                      setPaletteOpen(false);
                    }}
                    activeOpacity={0.7}
                    hitSlop={4}
                    style={[styles.swatch, newColor === color && styles.swatchOn]}
                  >
                    <View style={[styles.swatchFill, { backgroundColor: color }]} />
                  </TouchableOpacity>
                ))}
              </MotiView>
            )}
          </View>
        </>
      )}
    </BottomSheet>
  );
}

interface RowProps {
  category: ResolvedCategory;
  spentBase: number;
  limitBase: number;
  onCommit: (amountBase: number) => void;
  onDelete?: () => void;
  pctLabel: (n: number) => string;
}

function CategoryBudgetRow({ category, spentBase, limitBase, onCommit, onDelete, pctLabel }: RowProps) {
  const { symbol, fmt, toBase, groupLive, toGroupedInput } = useCurrency();
  const grouped = toGroupedInput(limitBase);
  const [draft, setDraft] = useState(grouped);
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) setDraft(grouped);
  }, [grouped]);

  const commit = () => {
    focused.current = false;
    const next = parseGrouped(draft);
    // Geçerli pozitif → ayarla; boş/0 → limiti kaldır.
    if (Number.isFinite(next) && next > 0) onCommit(toBase(next));
    else onCommit(0);
  };

  const hasLimit = limitBase > 0;
  const pct = hasLimit ? (spentBase / limitBase) * 100 : 0;
  const barPct = Math.min(100, pct);

  return (
    <View style={styles.row}>
      <View style={styles.rowTop}>
        <View style={styles.nameWrap}>
          <View style={[styles.dot, { backgroundColor: category.color }]} />
          <Text style={styles.name}>{category.name}</Text>
          {onDelete && (
            <TouchableOpacity onPress={onDelete} activeOpacity={0.6} hitSlop={8} style={styles.del}>
              <TrashIcon size={14} color={theme.colors.textDim} />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.amountField}>
          <Text style={styles.amountPrefix}>{symbol}</Text>
          <TextInput
            style={styles.amountInput}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={theme.colors.textDim}
            value={draft}
            onChangeText={(v) => setDraft(groupLive(v))}
            onFocus={() => {
              focused.current = true;
            }}
            onBlur={commit}
            onSubmitEditing={commit}
            numberOfLines={1}
          />
        </View>
      </View>

      {hasLimit && (
        <>
          <View style={styles.track}>
            <View
              style={[styles.fill, { width: `${barPct}%`, backgroundColor: usageColor(pct) }]}
            />
          </View>
          <Text style={styles.usage}>
            {fmt(spentBase)} / {fmt(limitBase)}
            <Text style={styles.dotSep}> · </Text>
            <Text style={{ color: usageColor(pct), fontWeight: "700" }}>
              {pctLabel(Math.round(pct))}
            </Text>
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  intro: {
    fontSize: 14,
    color: theme.colors.textSoft,
    marginTop: 4,
    marginBottom: 20,
    lineHeight: 20,
  },
  list: {
    flexShrink: 1,
  },
  row: {
    marginBottom: 18,
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  nameWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dotLg: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: theme.fonts.outfitSemi,
    color: theme.colors.textPrimary,
  },
  del: {
    padding: 2,
  },
  amountField: {
    flexDirection: "row",
    alignItems: "center",
    height: 46,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingHorizontal: 12,
    width: 110,
  },
  amountPrefix: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.textDim,
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    fontFamily: theme.fonts.outfitBold,
    color: theme.colors.textPrimary,
    textAlign: "right",
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.track,
    marginTop: 12,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 3,
  },
  usage: {
    fontSize: 13,
    color: theme.colors.textSoft,
    marginTop: 6,
  },
  dotSep: {
    color: theme.colors.textMute,
  },
  // ---- yeni kategori ekleme ----
  addBox: {
    position: "relative",
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.hairline,
  },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  nameInput: {
    flex: 1,
    paddingVertical: 13,
    lineHeight: 20,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingHorizontal: 14,
    fontFamily: theme.fonts.outfitMedium,
    fontSize: 15,
    fontWeight: "500",
    color: theme.colors.textPrimary,
  },
  add: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: theme.colors.stateGood,
    alignItems: "center",
    justifyContent: "center",
  },
  paletteBackdrop: {
    position: "absolute",
    left: -24,
    right: -24,
    bottom: 54,
    top: -600,
  },
  palettePop: {
    position: "absolute",
    bottom: 54,
    left: 0,
    right: 0,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    padding: 16,
    borderRadius: 18,
    backgroundColor: theme.colors.sheetBg,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 16,
  },
  swatch: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  swatchOn: {
    borderColor: theme.colors.textPrimary,
  },
  swatchFill: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
});
