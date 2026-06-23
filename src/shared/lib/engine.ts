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
  /** Hazır gösterim cümlesi. */
  message: string;
}

/**
 * Mevcut harcama temposuyla ay sonu öngörüsü.
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
    return {
      endBalance: pool,
      zeroDay: null,
      message: "Henüz harcama yok — tempon belirlenmedi.",
    };
  }

  if (endBalance >= 0) {
    return {
      endBalance,
      zeroDay: null,
      message: `Bu hızla ay sonunda elinde ${Math.round(endBalance)} ₺ kalır.`,
    };
  }

  // Bütçe ay bitmeden tükenir: havuzu tempoya böl.
  const zeroDay = Math.min(total, Math.max(1, Math.ceil(pool / pace)));
  return {
    endBalance,
    zeroDay,
    message: `Dikkat — bu hızla ayın ${zeroDay}'inde bütçen biter.`,
  };
}
