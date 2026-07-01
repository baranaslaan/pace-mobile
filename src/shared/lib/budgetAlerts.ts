/* =============================================================
   Bütçe-eşiği uyarıları — saf mantık.
   Aylık harcanabilir havuzun (pool) belirli yüzdeleri aşıldığında
   kullanıcıyı bir kez uyarmak için hangi eşiğin duyurulacağını hesaplar.
   Yan etki yok; bildirim/haptik çağıran taraf (useBudgetAlerts) işler.
   ============================================================= */

/** Uyarı verilen eşikler (harcanabilir havuzun yüzdesi). Yüksekten düşüğe okunur. */
export const DEFAULT_BUDGET_THRESHOLDS = [80, 100] as const;

/** Ay-başına duyurulan eşikleri saklayan dedupe durumu. */
export interface BudgetAlertState {
  /** monthKey ("YYYY-MM"); "" = henüz hiç değerlendirilmedi. */
  month: string;
  /** Bu ay genel bütçe için uyarılan eşik yüzdeleri. */
  crossed: number[];
  /** Bu ay kategori-başı uyarılan eşikler (kategoriId → yüzdeler). */
  byCategory: Record<string, number[]>;
}

const isNumArray = (v: unknown): v is number[] =>
  Array.isArray(v) && v.every((n) => typeof n === "number");

export function isBudgetAlertState(v: unknown): v is BudgetAlertState {
  const s = v as BudgetAlertState;
  return (
    !!v &&
    typeof s.month === "string" &&
    isNumArray(s.crossed) &&
    !!s.byCategory &&
    typeof s.byCategory === "object" &&
    Object.values(s.byCategory).every(isNumArray)
  );
}

/** Boş/eksik/eski şekli tam geçerli bir BudgetAlertState'e normalize eder. */
export function normalizeBudgetAlertState(v: unknown): BudgetAlertState {
  const s = (v ?? {}) as Partial<BudgetAlertState>;
  const byCategory: Record<string, number[]> = {};
  if (s.byCategory && typeof s.byCategory === "object") {
    for (const [k, arr] of Object.entries(s.byCategory)) {
      if (isNumArray(arr)) byCategory[k] = arr;
    }
  }
  return {
    month: typeof s.month === "string" ? s.month : "",
    crossed: isNumArray(s.crossed) ? s.crossed : [],
    byCategory,
  };
}

/**
 * Ay-başı harcamanın havuza oranı (yüzde). Havuz yoksa (bütçe girilmemiş ya da
 * sabit giderler bütçeyi yiyorsa) eşik anlamsız → `null`.
 */
export function budgetUsagePct(spent: number, pool: number): number | null {
  if (!(pool > 0) || !Number.isFinite(spent)) return null;
  return (spent / pool) * 100;
}

/** Verilen kullanımda karşılanan (≤ usage) tüm eşikler. Dedupe kaydı için. */
export function thresholdsMet(
  usagePct: number | null,
  thresholds: readonly number[] = DEFAULT_BUDGET_THRESHOLDS,
): number[] {
  if (usagePct == null) return [];
  return thresholds.filter((t) => usagePct >= t);
}

/**
 * Duyurulacak eşik: karşılanan ama henüz uyarılmamış eşiklerin EN YÜKSEĞİ.
 * (Tek harcamada birden fazla eşik atlanırsa en anlamlısı = en yüksek olanı;
 *  kalanları çağıran taraf {@link thresholdsMet} ile birlikte "uyarıldı" işaretler.)
 * Yeni aşan yoksa `null`.
 */
export function newlyCrossedThreshold(
  usagePct: number | null,
  alreadyAlerted: readonly number[],
  thresholds: readonly number[] = DEFAULT_BUDGET_THRESHOLDS,
): number | null {
  const fresh = thresholdsMet(usagePct, thresholds).filter(
    (t) => !alreadyAlerted.includes(t),
  );
  return fresh.length ? Math.max(...fresh) : null;
}
