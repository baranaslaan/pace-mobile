import React, { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, View, TextInput, ScrollView } from "react-native";
import { Text } from "../../../shared/typography/Text";
import { usePaceStore } from "../../../shared/store/usePaceStore";
import { useDayKey } from "../../../shared/store/useDayKey";
import { categoryBreakdown } from "../../../shared/lib/engine";
import { monthKey } from "../../../shared/lib/date";
import { CATEGORIES, DEFAULT_CATEGORY_ID, categoryLabel, type Category } from "../../../shared/lib/categories";
import { parseGrouped } from "../../../shared/lib/money";
import { BottomSheet } from "../../../shared/ui/BottomSheet";
import { ProUpsell } from "../../pro/components/ProUpsell";
import { useCurrency } from "../../../shared/store/useCurrency";
import { useT, type Language } from "../../../shared/i18n";
import { theme } from "../../../shared/styles/theme";

interface CategoryBudgetsSheetProps {
  open: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

// Bütçelenebilir kategoriler — "Diğer" (yakalama kovası) hariç.
const BUDGETABLE = CATEGORIES.filter((c) => c.id !== DEFAULT_CATEGORY_ID);

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
  const language = usePaceStore((s) => s.language) as Language;
  const { t } = useT();
  const today = useDayKey();

  const month = monthKey(new Date(`${today}T12:00:00`));
  const spentByCat = useMemo(() => {
    const m: Record<string, number> = {};
    for (const slice of categoryBreakdown(entries, month)) m[slice.categoryId] = slice.total;
    return m;
  }, [entries, month]);

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
            contentContainerStyle={{ paddingBottom: 20 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {BUDGETABLE.map((cat) => (
              <CategoryBudgetRow
                key={cat.id}
                category={cat}
                lang={language}
                spentBase={spentByCat[cat.id] ?? 0}
                limitBase={categoryBudgets[cat.id] ?? 0}
                onCommit={(amount) => setCategoryBudget(cat.id, amount)}
                pctLabel={(n) => t("common.pct", { n })}
              />
            ))}
          </ScrollView>
        </>
      )}
    </BottomSheet>
  );
}

interface RowProps {
  category: Category;
  lang: Language;
  spentBase: number;
  limitBase: number;
  onCommit: (amountBase: number) => void;
  pctLabel: (n: number) => string;
}

function CategoryBudgetRow({ category, lang, spentBase, limitBase, onCommit, pctLabel }: RowProps) {
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
          <Text style={styles.name}>{categoryLabel(category.id, lang)}</Text>
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
  name: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: theme.fonts.outfitSemi,
    color: theme.colors.textPrimary,
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
});
