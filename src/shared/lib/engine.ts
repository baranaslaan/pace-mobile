/* =============================================================
   PACE hesap motoru — saf, store'dan bağımsız (test edilebilir).

   Model:
   - budget        : aylık net bütçe
   - subscriptions : sabit giderler (peşin rezerve)
   - expenses      : "YYYY-MM-DD" → o günün toplam harcaması

   Günlük limit TÜRETİLEN değerdir. Tam rollover:
   kalan harcanabilir para, ayın KALAN günlerine (bugün dahil) bölünür.
   Dün az harcandıysa pay büyür (ödül); aşıldıysa pay küçülür (sıkılaşma).
   ============================================================= */

import {
  dayKey,
  monthOf,
  monthKey,
  remainingDaysInclusive,
  daysInMonth,
  dayOfMonth,
} from "./date";
import { DEFAULT_CATEGORY_ID } from "./categories";

export interface Subscription {
  id: string;
  name: string;
  amount: number;
}

/**
 * Tek harcama kalemi. Kaynak veri artık gün başına tek toplam değil, bu
 * kalemlerin listesidir; gün toplamı {@link expensesByDay} ile türetilir.
 */
export interface ExpenseEntry {
  id: string;
  /** Kalemin ait olduğu gün, "YYYY-MM-DD" (yerel). */
  day: string;
  amount: number;
  /** Opsiyonel etiket/not (ör. "kahve", "market"). */
  note?: string;
  /** Opsiyonel kategori kimliği (bkz. shared/lib/categories). Eksikse "Diğer". */
  category?: string;
  /** Oluşturulma zamanı (epoch ms) — gün içi sıralama için. */
  ts: number;
}

/**
 * Kalem listesinden "YYYY-MM-DD" → o günün toplamı map'ini türetir. Hesap
 * motoru bu türetilmiş map üzerinden çalışır (kalemlerden habersiz kalır).
 */
export function expensesByDay(entries: ExpenseEntry[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const e of entries) {
    if (e.amount > 0) map[e.day] = (map[e.day] ?? 0) + e.amount;
  }
  return map;
}

export interface CategorySlice {
  /** Kategori kimliği (eksik/bilinmeyen → "diger"). */
  categoryId: string;
  /** Bu kategorideki toplam harcama. */
  total: number;
  /** Bu kategorideki kalem sayısı. */
  count: number;
  /** Toplam içindeki pay (0–1); toplam 0 ise 0. */
  share: number;
}

/**
 * Verilen ayın harcama kalemlerini kategoriye göre gruplar (saf). Tutarı azalan
 * sırada döner; harcaması olmayan kategoriler dışlanır. Kategorisiz kalemler
 * {@link DEFAULT_CATEGORY_ID} altında toplanır.
 */
export function categoryBreakdown(
  entries: ExpenseEntry[],
  month: string,
): CategorySlice[] {
  const totals: Record<string, number> = {};
  const counts: Record<string, number> = {};
  let grand = 0;
  for (const e of entries) {
    if (e.amount <= 0 || monthOf(e.day) !== month) continue;
    const id = e.category || DEFAULT_CATEGORY_ID;
    totals[id] = (totals[id] ?? 0) + e.amount;
    counts[id] = (counts[id] ?? 0) + 1;
    grand += e.amount;
  }
  return Object.keys(totals)
    .map((categoryId) => ({
      categoryId,
      total: totals[categoryId],
      count: counts[categoryId],
      share: grand > 0 ? totals[categoryId] / grand : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

export interface PaceSnapshot {
  budget: number;
  subscriptions: Subscription[];
  /** "YYYY-MM-DD" → o günün toplam harcaması. */
  expenses: Record<string, number>;
}

/** Sabit giderlerin toplamı. */
export function totalSubscriptions(subs: Subscription[]): number {
  return subs.reduce((sum, s) => sum + (s.amount > 0 ? s.amount : 0), 0);
}

/** Ay boyunca günlük harcamalar için kalan havuz (bütçe − sabit giderler). */
export function spendableThisMonth(snap: PaceSnapshot): number {
  return Math.max(0, snap.budget - totalSubscriptions(snap.subscriptions));
}

/** Verilen ayda, belirli bir güne kadar (exclusive) toplam harcama. */
function spentBefore(expenses: Record<string, number>, key: string): number {
  const month = monthOf(key);
  let sum = 0;
  for (const [k, v] of Object.entries(expenses)) {
    if (monthOf(k) === month && k < key) sum += v;
  }
  return sum;
}

/** Verilen ayın tamamında toplam harcama. */
function spentInMonth(expenses: Record<string, number>, month: string): number {
  let sum = 0;
  for (const [k, v] of Object.entries(expenses)) {
    if (monthOf(k) === month) sum += v;
  }
  return sum;
}

/** Bugünün harcaması. */
export function spentToday(snap: PaceSnapshot, now: Date = new Date()): number {
  return snap.expenses[dayKey(now)] ?? 0;
}

/**
 * Bugünün günlük limiti (tam rollover ile).
 * (havuz − ayın bugünden önceki harcamaları) / bugün dahil kalan gün
 */
export function dailyLimit(snap: PaceSnapshot, now: Date = new Date()): number {
  const pool = spendableThisMonth(snap);
  const usedBefore = spentBefore(snap.expenses, dayKey(now));
  const left = pool - usedBefore;
  const days = remainingDaysInclusive(now);
  if (days <= 0) return 0;
  return Math.max(0, left / days);
}

/**
 * Bugün için kalan (limit − bugün harcanan). Limit aşılırsa **eksiye düşer**
 * (danger zone göstergesi için işaretli değer korunur).
 */
export function remainingToday(
  snap: PaceSnapshot,
  now: Date = new Date(),
): number {
  return dailyLimit(snap, now) - spentToday(snap, now);
}

export interface MonthStats {
  /** Günlük harcama havuzu (bütçe − sabit giderler). */
  pool: number;
  /** Bu ay toplam harcama. */
  spent: number;
  /** Günlük ortalama harcama (tempo) = spent / geçen gün. */
  pace: number;
  /** Bugün dahil ayın geçen günü. */
  elapsed: number;
  /** Aydaki toplam gün. */
  total: number;
}

export interface MonthSummary {
  /** Ay anahtarı, "YYYY-MM". */
  month: string;
  /** O ayın toplam harcaması. */
  spent: number;
  /**
   * Devir anındaki harcama havuzu (bütçe − sabit giderler). Geçmiş ay için
   * EN İYİ TAHMİN'dir: bütçe/abonelikler o aydan beri değişmiş olabilir, ham
   * geçmiş snapshot tutmuyoruz. Devir anındaki güncel havuz kullanılır.
   */
  pool: number;
  /** O ayın günlük ortalama harcaması (spent / aydaki gün sayısı). */
  pace: number;
  /** Aydaki toplam gün. */
  days: number;
}

/**
 * Biten bir ayı arşiv için özetler (saf). `pool` devir anındaki güncel havuza
 * dayanır — gerekçesi için bkz. {@link MonthSummary.pool}.
 */
export function summarizeMonth(snap: PaceSnapshot, month: string): MonthSummary {
  const spent = spentInMonth(snap.expenses, month);
  const [y, m] = month.split("-").map(Number);
  const days = daysInMonth(new Date(y, m - 1, 1));
  return {
    month,
    spent,
    pool: spendableThisMonth(snap),
    pace: days > 0 ? spent / days : 0,
    days,
  };
}

/** Bu ayın özet istatistikleri (forecast ve analitik bunun üstüne kurulur). */
export function monthStats(
  snap: PaceSnapshot,
  now: Date = new Date(),
): MonthStats {
  const pool = spendableThisMonth(snap);
  const spent = spentInMonth(snap.expenses, monthKey(now));
  const elapsed = dayOfMonth(now); // bugün dahil geçen gün
  const total = daysInMonth(now);
  const pace = elapsed > 0 ? spent / elapsed : 0;
  return { pool, spent, pace, elapsed, total };
}

export interface Forecast {
  /** Mevcut tempoyla ay sonu bakiyesi (+ artar, − biterse). */
  endBalance: number;
  /** Bütçe biterse ayın kaçıncı günü (yoksa null). */
  zeroDay: number | null;
  /**
   * Öngörü türü — mesaj metni dil katmanında (useLimitLogic) üretilir; motor
   * dilden bağımsız kalır.
   * - `"none"`    : henüz harcama yok, tempo belirsiz.
   * - `"surplus"` : bu hızla ay sonunda artı bakiye.
   * - `"deficit"` : bütçe ay bitmeden tükeniyor.
   */
  kind: "none" | "surplus" | "deficit";
}

/**
 * Mevcut harcama temposuyla ay sonu öngörüsü (saf, dilden bağımsız).
 * Tempo = bu ay (bugün dahil) günlük ortalama harcama.
 */
export function burnForecast(
  snap: PaceSnapshot,
  now: Date = new Date(),
): Forecast {
  const { pool, pace, total } = monthStats(snap, now);

  const projected = pace * total;
  const endBalance = pool - projected;

  if (pace <= 0) {
    return { endBalance: pool, zeroDay: null, kind: "none" };
  }

  if (endBalance >= 0) {
    return { endBalance, zeroDay: null, kind: "surplus" };
  }

  // Bütçe ay bitmeden tükenir: havuzu tempoya böl.
  const zeroDay = Math.min(total, Math.max(1, Math.ceil(pool / pace)));
  return { endBalance, zeroDay, kind: "deficit" };
}

export interface WeeklyTrend {
  /** Son 7 günün (bugün dahil) toplam harcaması. */
  thisWeek: number;
  /** Önceki 7 günün toplam harcaması. */
  lastWeek: number;
  /** Son 7 gün günlük ortalama. */
  thisAvg: number;
  /** Önceki 7 gün günlük ortalama. */
  lastAvg: number;
  /** Geçen haftaya göre yüzde değişim (+ arttı, − azaldı); referans 0 ise null. */
  deltaPct: number | null;
}

/**
 * Kayan 7 günlük pencere ile haftalık harcama hızı: son 7 gün vs önceki 7 gün.
 * Ay sınırını doğal olarak aşar (gün bazlı map üzerinden çalışır).
 */
export function weeklyTrend(
  expenses: Record<string, number>,
  now: Date = new Date(),
): WeeklyTrend {
  let thisWeek = 0;
  let lastWeek = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    thisWeek += expenses[dayKey(d)] ?? 0;
  }
  for (let i = 7; i < 14; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    lastWeek += expenses[dayKey(d)] ?? 0;
  }
  const thisAvg = thisWeek / 7;
  const lastAvg = lastWeek / 7;
  const deltaPct = lastAvg > 0 ? ((thisAvg - lastAvg) / lastAvg) * 100 : null;
  return { thisWeek, lastWeek, thisAvg, lastAvg, deltaPct };
}

export interface DisciplineStreak {
  /** Günlük hedef (havuz / aydaki gün) — bu tutarın altı "disiplinli" sayılır. */
  target: number;
  /** Düne kadar uzanan güncel ardışık disiplinli gün (bugün hariç). */
  current: number;
  /** Bu ay içindeki en uzun ardışık disiplinli gün serisi. */
  best: number;
}

/**
 * Disiplin serisi (saf): günlük hedefin altında kalınan ardışık gün sayısı.
 * Hedef = havuz / aydaki toplam gün (düz tempo). Bugün TAMAMLANMADIĞI için
 * sayıma katılmaz; sayım ayın 1'inden düne kadar işler. Harcanmayan gün (0)
 * disiplinli sayılır. `current` düne kadar uzanan son seri, `best` aydaki en
 * uzun seridir.
 */
export function disciplineStreak(
  expenses: Record<string, number>,
  pool: number,
  now: Date = new Date(),
): DisciplineStreak {
  const total = daysInMonth(now);
  const target = total > 0 ? pool / total : 0;
  const today = dayOfMonth(now);

  let best = 0;
  let run = 0;
  for (let d = 1; d < today; d++) {
    const date = new Date(now.getFullYear(), now.getMonth(), d);
    const spent = expenses[dayKey(date)] ?? 0;
    if (spent <= target) {
      run += 1;
      if (run > best) best = run;
    } else {
      run = 0;
    }
  }
  return { target, current: run, best };
}

/**
 * Verilen ayın en büyük harcama kalemleri (saf). Tutara göre azalan; eşitlikte
 * daha yeni kalem (ts büyük) önce. En fazla {@link n} kalem döner.
 */
export function topExpenses(
  entries: ExpenseEntry[],
  month: string,
  n: number,
): ExpenseEntry[] {
  return entries
    .filter((e) => e.amount > 0 && monthOf(e.day) === month)
    .sort((a, b) => b.amount - a.amount || b.ts - a.ts)
    .slice(0, n);
}

export interface WeekdayStat {
  /** 0=Pazar … 6=Cumartesi (JS getDay). */
  weekday: number;
  /** Bu ay o güne denk gelen günlerdeki toplam harcama. */
  total: number;
  /** Bu ay o güne denk gelen (geçmiş) gün sayısı. */
  days: number;
  /** Ortalama (total / days). */
  avg: number;
}

/**
 * Bu ayın geçmiş günlerini haftanın gününe göre gruplar (saf). Hangi günler
 * daha çok harcandığını gösterir — pencere bu ayla sınırlı.
 */
export function weekdayBreakdown(
  expenses: Record<string, number>,
  now: Date = new Date(),
): WeekdayStat[] {
  const totals = new Array(7).fill(0);
  const counts = new Array(7).fill(0);
  const elapsed = dayOfMonth(now);
  for (let d = 1; d <= elapsed; d++) {
    const date = new Date(now.getFullYear(), now.getMonth(), d);
    const wd = date.getDay();
    totals[wd] += expenses[dayKey(date)] ?? 0;
    counts[wd] += 1;
  }
  return totals.map((t, i) => ({
    weekday: i,
    total: t,
    days: counts[i],
    avg: counts[i] > 0 ? t / counts[i] : 0,
  }));
}
