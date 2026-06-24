import { describe, it, expect } from "vitest";
import {
  expensesByDay,
  totalSubscriptions,
  spendableThisMonth,
  spentToday,
  dailyLimit,
  remainingToday,
  monthStats,
  summarizeMonth,
  burnForecast,
  weeklyTrend,
  weekdayBreakdown,
  categoryBreakdown,
  disciplineStreak,
  topExpenses,
  rollMonth,
  type PaceSnapshot,
  type ExpenseEntry,
  type RollInput,
} from "../engine";

// Sabit referans: 15 Haziran 2026, öğlen (Haziran = 30 gün).
const NOW = new Date(2026, 5, 15, 12, 0, 0);

function snap(over: Partial<PaceSnapshot> = {}): PaceSnapshot {
  return { budget: 3200, subscriptions: [], expenses: {}, ...over };
}

function entry(day: string, amount: number, category?: string): ExpenseEntry {
  return { id: day + amount, day, amount, ts: Date.parse(`${day}T12:00`), ...(category ? { category } : {}) };
}

describe("expensesByDay", () => {
  it("kalemleri güne göre toplar, ≤0 olanı atar", () => {
    const map = expensesByDay([
      entry("2026-06-10", 40),
      entry("2026-06-10", 60),
      entry("2026-06-11", 20),
      entry("2026-06-11", 0),
    ]);
    expect(map).toEqual({ "2026-06-10": 100, "2026-06-11": 20 });
  });
});

describe("subscriptions & pool", () => {
  it("totalSubscriptions pozitifleri toplar", () => {
    expect(totalSubscriptions([
      { id: "a", name: "kira", amount: 500 },
      { id: "b", name: "spotify", amount: 200 },
    ])).toBe(700);
  });

  it("spendableThisMonth = bütçe − sabit giderler, negatife düşmez", () => {
    expect(spendableThisMonth(snap({ budget: 3000, subscriptions: [{ id: "a", name: "x", amount: 700 }] }))).toBe(2300);
    expect(spendableThisMonth(snap({ budget: 500, subscriptions: [{ id: "a", name: "x", amount: 700 }] }))).toBe(0);
  });
});

describe("dailyLimit (tam rollover)", () => {
  it("harcama yokken havuzu kalan güne böler", () => {
    // pool 3200, kalan gün (15'i dahil) = 16 → 200
    expect(dailyLimit(snap(), NOW)).toBe(200);
  });

  it("bugünden önceki harcamalar havuzdan düşer (sıkışma)", () => {
    const s = snap({ expenses: { "2026-06-10": 160 } });
    expect(dailyLimit(s, NOW)).toBe(190); // (3200-160)/16
  });

  it("bugünün harcaması limiti DÜŞÜRMEZ (sadece kalanı etkiler)", () => {
    const s = snap({ expenses: { "2026-06-15": 50 } });
    expect(dailyLimit(s, NOW)).toBe(200);
    expect(spentToday(s, NOW)).toBe(50);
    expect(remainingToday(s, NOW)).toBe(150);
  });

  it("sabit giderler havuzu küçültür", () => {
    const s = snap({ subscriptions: [{ id: "a", name: "kira", amount: 1200 }] });
    expect(dailyLimit(s, NOW)).toBe(125); // 2000/16
  });

  it("başka ayın harcamaları yok sayılır", () => {
    const s = snap({ expenses: { "2026-05-31": 999 } });
    expect(dailyLimit(s, NOW)).toBe(200);
  });

  it("limit aşıldığında remainingToday eksiye düşer", () => {
    const s = snap({ expenses: { "2026-06-15": 260 } });
    expect(remainingToday(s, NOW)).toBe(-60); // 200 - 260
  });
});

describe("monthStats & summarizeMonth", () => {
  it("monthStats geçen güne göre tempoyu hesaplar", () => {
    const s = snap({ expenses: { "2026-06-01": 150, "2026-06-15": 150 } });
    const st = monthStats(s, NOW);
    expect(st.spent).toBe(300);
    expect(st.elapsed).toBe(15);
    expect(st.total).toBe(30);
    expect(st.pace).toBe(20); // 300 / 15
    expect(st.pool).toBe(3200);
  });

  it("summarizeMonth ayın tamamını özetler", () => {
    const s = snap({ expenses: { "2026-06-02": 100, "2026-06-20": 200 } });
    const sum = summarizeMonth(s, "2026-06");
    expect(sum.spent).toBe(300);
    expect(sum.days).toBe(30);
    expect(sum.pace).toBeCloseTo(10, 5); // 300 / 30
  });
});

describe("burnForecast (kind)", () => {
  it("harcama yokken kind='none'", () => {
    const f = burnForecast(snap(), NOW);
    expect(f.kind).toBe("none");
    expect(f.endBalance).toBe(3200);
    expect(f.zeroDay).toBeNull();
  });

  it("düşük tempoda kind='surplus'", () => {
    const f = burnForecast(snap({ budget: 3000, expenses: { "2026-06-10": 150 } }), NOW);
    expect(f.kind).toBe("surplus"); // pace 10 → projeksiyon 300 < 3000
    expect(f.endBalance).toBeGreaterThan(0);
  });

  it("yüksek tempoda kind='deficit' ve zeroDay hesaplanır", () => {
    const f = burnForecast(snap({ budget: 3000, expenses: { "2026-06-10": 2000 } }), NOW);
    expect(f.kind).toBe("deficit");
    expect(f.endBalance).toBeLessThan(0);
    expect(f.zeroDay).toBe(23); // ceil(3000 / (2000/15))
  });
});

describe("weeklyTrend", () => {
  it("son 7 gün vs önceki 7 günü kıyaslar", () => {
    const exp = { "2026-06-15": 700, "2026-06-05": 350 };
    const t = weeklyTrend(exp, NOW);
    expect(t.thisWeek).toBe(700); // 9–15 Haz
    expect(t.lastWeek).toBe(350); // 2–8 Haz
    expect(t.deltaPct).toBe(100); // %100 artış
  });

  it("önceki hafta veri yoksa deltaPct null", () => {
    const t = weeklyTrend({ "2026-06-15": 100 }, NOW);
    expect(t.deltaPct).toBeNull();
  });
});

describe("weekdayBreakdown", () => {
  it("geçen günleri haftanın gününe göre gruplar", () => {
    const wd = weekdayBreakdown({ "2026-06-01": 100, "2026-06-08": 50 }, NOW);
    // 1 ve 8 Haziran 2026 Pazartesi (getDay=1)
    const monday = wd[1];
    expect(monday.total).toBe(150);
    expect(monday.days).toBeGreaterThanOrEqual(2);
    expect(monday.avg).toBeCloseTo(monday.total / monday.days, 5);
  });
});

describe("categoryBreakdown", () => {
  it("aya göre kategoriler, tutara göre azalan, pay hesaplı", () => {
    const out = categoryBreakdown(
      [
        entry("2026-06-01", 100, "market"),
        entry("2026-06-02", 300, "yemek"),
        entry("2026-06-03", 100), // kategorisiz → diger
        entry("2026-05-30", 999, "market"), // başka ay → hariç
      ],
      "2026-06",
    );
    expect(out.map((c) => c.categoryId)).toEqual(["yemek", "market", "diger"]);
    expect(out[0].total).toBe(300);
    expect(out[0].share).toBeCloseTo(0.6, 5); // 300 / 500
    expect(out.reduce((a, b) => a + b.count, 0)).toBe(3);
  });

  it("boş girişte boş dizi", () => {
    expect(categoryBreakdown([], "2026-06")).toEqual([]);
  });
});

describe("disciplineStreak", () => {
  // Havuz 3200 / 30 gün → günlük hedef ≈ 106.67. NOW = 15 Haziran (1–14 tamam).
  it("hedef altı ardışık günleri sayar; bugün hariç", () => {
    const expenses = { "2026-06-10": 500 }; // gün 10 hedefi aşar, diğerleri 0
    const out = disciplineStreak(expenses, 3200, NOW);
    expect(out.target).toBeCloseTo(3200 / 30, 5);
    expect(out.best).toBe(9); // 1–9 arası kesintisiz
    expect(out.current).toBe(4); // 11–14 (düne kadar)
  });

  it("ayın ilk günü → tamamlanmış gün yok, seri sıfır", () => {
    const out = disciplineStreak({ "2026-06-01": 999 }, 3200, new Date(2026, 5, 1, 12));
    expect(out.current).toBe(0);
    expect(out.best).toBe(0);
  });

  it("harcanmayan gün disiplinli sayılır", () => {
    const out = disciplineStreak({}, 3200, NOW);
    expect(out.current).toBe(14);
    expect(out.best).toBe(14);
  });
});

describe("topExpenses", () => {
  it("aydaki en büyük kalemler, tutara göre azalan", () => {
    const out = topExpenses(
      [
        entry("2026-06-01", 100, "market"),
        entry("2026-06-02", 300, "yemek"),
        entry("2026-06-03", 50),
        entry("2026-05-20", 999, "market"), // başka ay → hariç
      ],
      "2026-06",
      2,
    );
    expect(out.map((e) => e.amount)).toEqual([300, 100]);
  });

  it("eşit tutarda daha yeni kalem önce gelir", () => {
    const older: ExpenseEntry = { id: "a", day: "2026-06-01", amount: 200, ts: 1000 };
    const newer: ExpenseEntry = { id: "b", day: "2026-06-02", amount: 200, ts: 2000 };
    const out = topExpenses([older, newer], "2026-06", 2);
    expect(out.map((e) => e.id)).toEqual(["b", "a"]);
  });
});

describe("rollMonth", () => {
  function rollInput(over: Partial<RollInput> = {}): RollInput {
    return { activeMonth: "2026-05", budget: 3000, subscriptions: [], entries: [], archive: [], ...over };
  }

  it("aktif ay zaten güncelse null döner (state'e dokunma)", () => {
    expect(rollMonth(rollInput({ activeMonth: "2026-06" }), "2026-06")).toBeNull();
  });

  it("geçmiş ayı arşivler ve kalemleri güncel aya indirger", () => {
    const entries: ExpenseEntry[] = [
      entry("2026-05-20", 100),
      entry("2026-05-25", 200),
      entry("2026-06-02", 50),
    ];
    const out = rollMonth(rollInput({ entries }), "2026-06")!;
    expect(out).not.toBeNull();
    expect(out.activeMonth).toBe("2026-06");
    expect(out.archive.map((a) => a.month)).toEqual(["2026-05"]);
    expect(out.archive[0].spent).toBe(300);
    expect(out.entries.map((e) => e.day)).toEqual(["2026-06-02"]);
  });

  it("birden çok geçmiş ayı arşivler, azalan sıralar", () => {
    const entries: ExpenseEntry[] = [
      entry("2026-04-10", 80),
      entry("2026-05-10", 120),
      entry("2026-06-01", 30),
    ];
    const out = rollMonth(rollInput({ activeMonth: "2026-04", entries }), "2026-06")!;
    expect(out.archive.map((a) => a.month)).toEqual(["2026-05", "2026-04"]);
  });

  it("zaten arşivlenmiş ayı tekrar eklemez", () => {
    const entries: ExpenseEntry[] = [entry("2026-05-20", 100), entry("2026-06-02", 50)];
    const archive = [{ month: "2026-05", spent: 999, pool: 3000, pace: 0, days: 31 }];
    const out = rollMonth(rollInput({ entries, archive }), "2026-06")!;
    expect(out.archive.filter((a) => a.month === "2026-05")).toHaveLength(1);
    expect(out.archive[0].spent).toBe(999); // mevcut arşiv korunur
  });

  it("ilk açılış (activeMonth boş) geçmiş kalem yoksa sadece ayı işaretler", () => {
    const out = rollMonth(rollInput({ activeMonth: "", entries: [entry("2026-06-05", 40)] }), "2026-06")!;
    expect(out.activeMonth).toBe("2026-06");
    expect(out.archive).toEqual([]);
    expect(out.entries).toHaveLength(1);
  });
});
