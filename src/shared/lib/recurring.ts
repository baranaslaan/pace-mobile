/* =============================================================
   Tekrarlayan harcamalar — saf, store'dan bağımsız (test edilebilir).

   İki ayrı kavram:
   - QuickTemplate : sık harcama şablonu. Otomatik POSTLANMAZ; kullanıcı giriş
     ekranında dokununca anında bir harcama kalemine dönüşür.
   - RecurringRule : zamanlanmış harcama. Vadesi (haftalık/aylık) gelince
     uygulama açılışında otomatik kalem oluşturur (rollover gibi yakalama).

   Tutarlar her zaman TABAN para birimindedir (bkz. money.ts / rates.ts).
   ============================================================= */

import { dayKey } from "./date";
import { isCategoryRef } from "./categories";

/** Hızlı ekleme şablonu (tek dokunuşla harcama). */
export interface QuickTemplate {
  id: string;
  label: string;
  /** Taban para biriminde tutar. */
  amount: number;
  category?: string;
}

export type Cadence = "weekly" | "monthly";

/** Zamanlanmış tekrarlayan harcama kuralı. */
export interface RecurringRule {
  id: string;
  label: string;
  /** Taban para biriminde tutar. */
  amount: number;
  category?: string;
  cadence: Cadence;
  /**
   * weekly → haftanın günü (0=Pazar … 6=Cumartesi, JS getDay).
   * monthly → ayın günü (1..31; ay kısaysa son güne kırpılır).
   */
  day: number;
  /** En son otomatik postlanan vade ("YYYY-MM-DD"); tekrar postlamayı önler. */
  lastPostedDay?: string;
}

/** Ortak alan doğrulaması (label + pozitif tutar + opsiyonel geçerli kategori). */
function validBase(x: any): boolean {
  return (
    !!x &&
    typeof x === "object" &&
    typeof x.id === "string" &&
    typeof x.label === "string" &&
    x.label.trim().length > 0 &&
    typeof x.amount === "number" &&
    x.amount > 0 &&
    (x.category === undefined || isCategoryRef(x.category))
  );
}

export function isQuickTemplate(x: unknown): x is QuickTemplate {
  return validBase(x);
}

export function isRecurringRule(x: unknown): x is RecurringRule {
  const r = x as RecurringRule;
  if (!validBase(r)) return false;
  if (r.cadence !== "weekly" && r.cadence !== "monthly") return false;
  if (typeof r.day !== "number") return false;
  if (r.cadence === "weekly") return r.day >= 0 && r.day <= 6;
  return r.day >= 1 && r.day <= 31;
}

/** Ayın gününü o ayın son gününe kırpar (ör. 31 → 30/28). */
function clampDay(year: number, monthIdx: number, day: number): number {
  const last = new Date(year, monthIdx + 1, 0).getDate();
  return Math.min(day, last);
}

/**
 * Kuralın bugüne (dahil) kadarki EN YAKIN vade gününü "YYYY-MM-DD" verir.
 * - weekly  : bugünden geriye o haftanın gününe.
 * - monthly : bu ayın günü geçtiyse bu ay, yoksa geçen ay.
 */
export function mostRecentDue(rule: RecurringRule, now: Date = new Date()): string {
  if (rule.cadence === "weekly") {
    const back = (now.getDay() - rule.day + 7) % 7;
    const d = new Date(now);
    d.setDate(now.getDate() - back);
    return dayKey(d);
  }
  const y = now.getFullYear();
  const m = now.getMonth();
  const thisDay = clampDay(y, m, rule.day);
  if (now.getDate() >= thisDay) {
    return dayKey(new Date(y, m, thisDay));
  }
  // Geçen ay
  const pm = new Date(y, m - 1, 1);
  const pd = clampDay(pm.getFullYear(), pm.getMonth(), rule.day);
  return dayKey(new Date(pm.getFullYear(), pm.getMonth(), pd));
}

/**
 * Henüz postlanmamış (lastPostedDay'den daha yeni vadeli) kuralları döndürür.
 * Her kural için yalnızca EN SON vade postlanır — uzun aradan sonra geçmiş tüm
 * tekrarlar geriye doldurulmaz (sürpriz yığılmayı önler).
 */
export function dueRecurring(
  rules: RecurringRule[],
  now: Date = new Date(),
): { ruleId: string; day: string }[] {
  const out: { ruleId: string; day: string }[] = [];
  for (const r of rules) {
    const day = mostRecentDue(r, now);
    if (!r.lastPostedDay || r.lastPostedDay < day) {
      out.push({ ruleId: r.id, day });
    }
  }
  return out;
}
