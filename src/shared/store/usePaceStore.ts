import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import { createMMKV } from "react-native-mmkv";
import { dayKey, monthKey } from "@/shared/lib/date";
import { rollMonth } from "@/shared/lib/engine";
import { migrateEntries } from "@/shared/lib/migrate";
import { isCategoryId } from "@/shared/lib/categories";
import { isCurrencyCode, DEFAULT_CURRENCY } from "@/shared/lib/money";
import { FALLBACK_RATES, isRateTable } from "@/shared/lib/rates";
import { isLanguage, DEFAULT_LANGUAGE } from "@/shared/i18n/lang";
import { isBudgetAlertState, type BudgetAlertState } from "@/shared/lib/budgetAlerts";
import {
  dueRecurring,
  mostRecentDue,
  isQuickTemplate,
  isRecurringRule,
  type QuickTemplate,
  type RecurringRule,
} from "@/shared/lib/recurring";
import type {
  ExpenseEntry,
  MonthSummary,
  Subscription,
} from "@/shared/lib/engine";

/** Ücretsiz planda eklenebilecek en fazla sabit gider sayısı. */
export const FREE_SUBSCRIPTION_LIMIT = 3;

/** Ücretsiz planda eklenebilecek en fazla hızlı şablon sayısı. */
export const FREE_TEMPLATE_LIMIT = 3;

/** Persist anahtarı ve şema sürümü — yedekleme/geri yükleme bunlara dayanır. */
export const PERSIST_KEY = "pace-v1";
export const PERSIST_VERSION = 10;

const mmkvStorage = createMMKV({ id: "pace-storage" });

export const zustandStorage: StateStorage = {
  setItem: (name, value) => {
    return mmkvStorage.set(name, value);
  },
  getItem: (name) => {
    const value = mmkvStorage.getString(name);
    return value ?? null;
  },
  removeItem: (name) => {
    return mmkvStorage.remove(name);
  },
};

/** Basit benzersiz kimlik (crypto varsa onu kullan). */
function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

interface PaceState {
  budget: number;
  subscriptions: Subscription[];
  entries: ExpenseEntry[];
  /** Hızlı ekleme şablonları (tek dokunuşla harcama). */
  templates: QuickTemplate[];
  /** Zamanlanmış tekrarlayan harcama kuralları. */
  recurring: RecurringRule[];
  archive: MonthSummary[];
  activeMonth: string;
  onboarded: boolean;
  isPro: boolean;
  currency: string;
  /** Arayüz dili ("tr" | "en"). */
  language: string;
  /** Taban birime göre kur tablosu (bkz. rates.ts). Tutarlar taban birimde. */
  rates: Record<string, number>;
  /** Kurların son güncellenme zamanı (epoch ms); 0 = hiç çekilmedi. */
  ratesUpdatedAt: number;
  reminderEnabled: boolean;
  reminderHour: number;
  reminderMinute: number;
  /** Bütçe-eşiği uyarıları açık mı? (yerel bildirim; izin gerektirir) */
  budgetAlertsEnabled: boolean;
  /** Ay-başına hangi bütçe eşiklerinin uyarıldığı — tekrar spam önler. */
  budgetAlertState: BudgetAlertState;
  /** Rollover (devir) ipucu bir kez gösterilip kapatıldı mı? */
  rolloverTipSeen: boolean;
  /** İlk-harcama ipucu görüldü mü? (ilk kalem eklenince/dokununca kalıcı kapanır) */
  firstExpenseTipSeen: boolean;
  _hydrated: boolean;

  setBudget: (amount: number) => void;
  addSubscription: (name: string, amount: number) => void;
  updateSubscription: (id: string, patch: Partial<Omit<Subscription, "id">>) => void;
  removeSubscription: (id: string) => void;
  addExpense: (amount: number, note?: string, category?: string) => void;
  updateExpense: (
    id: string,
    patch: Partial<Pick<ExpenseEntry, "amount" | "note" | "category">>,
  ) => void;
  removeExpense: (id: string) => void;
  addTemplate: (label: string, amount: number, category?: string) => void;
  removeTemplate: (id: string) => void;
  applyTemplate: (id: string) => void;
  addRecurring: (rule: Omit<RecurringRule, "id" | "lastPostedDay">) => void;
  updateRecurring: (
    id: string,
    patch: Partial<Omit<RecurringRule, "id" | "lastPostedDay">>,
  ) => void;
  removeRecurring: (id: string) => void;
  /** Vadesi gelen tekrarlayanları otomatik kalem olarak ekler (açılışta çağrılır). */
  applyRecurring: () => void;
  resetToday: () => void;
  resetAll: () => void;
  completeOnboarding: () => void;
  unlockPro: () => void;
  lockPro: () => void;
  setCurrency: (code: string) => void;
  setLanguage: (code: string) => void;
  setRates: (rates: Record<string, number>) => void;
  setReminder: (enabled: boolean, hour: number, minute: number) => void;
  setBudgetAlertsEnabled: (enabled: boolean) => void;
  /** Ay-başı dedupe kaydını günceller (uyarılan eşikler). */
  setBudgetAlertState: (month: string, crossed: number[]) => void;
  markRolloverTipSeen: () => void;
  markFirstExpenseTipSeen: () => void;
  rollIfNewMonth: () => void;
}

export const usePaceStore = create<PaceState>()(
  persist(
    (set) => ({
      budget: 0,
      subscriptions: [],
      entries: [],
      templates: [],
      recurring: [],
      archive: [],
      activeMonth: "",
      onboarded: false,
      isPro: false,
      currency: DEFAULT_CURRENCY,
      language: DEFAULT_LANGUAGE,
      rates: FALLBACK_RATES,
      ratesUpdatedAt: 0,
      reminderEnabled: false,
      reminderHour: 20,
      reminderMinute: 0,
      budgetAlertsEnabled: true,
      budgetAlertState: { month: "", crossed: [] },
      rolloverTipSeen: false,
      firstExpenseTipSeen: false,
      _hydrated: false,

      setBudget: (amount) =>
        set(() => ({ budget: Number.isFinite(amount) && amount > 0 ? amount : 0 })),

      addSubscription: (name, amount) =>
        set((s) => {
          const trimmed = name.trim();
          if (!trimmed || !Number.isFinite(amount) || amount <= 0) return s;
          // Ücretsiz planda sabit gider sayısı sınırlı — UI'dan kaçan
          // (örn. onboarding) yolları da burada kesilir.
          if (!s.isPro && s.subscriptions.length >= FREE_SUBSCRIPTION_LIMIT) return s;
          return {
            subscriptions: [...s.subscriptions, { id: uid(), name: trimmed, amount }],
          };
        }),

      updateSubscription: (id, patch) =>
        set((s) => ({
          subscriptions: s.subscriptions.map((sub) =>
            sub.id === id ? { ...sub, ...patch } : sub,
          ),
        })),

      removeSubscription: (id) =>
        set((s) => ({
          subscriptions: s.subscriptions.filter((sub) => sub.id !== id),
        })),

      addExpense: (amount, note, category) =>
        set((s) => {
          if (!Number.isFinite(amount) || amount <= 0) return s;
          const trimmed = note?.trim();
          const entry: ExpenseEntry = {
            id: uid(),
            day: dayKey(),
            amount,
            ts: Date.now(),
            ...(trimmed ? { note: trimmed } : {}),
            ...(isCategoryId(category) ? { category } : {}),
          };
          // İlk harcama loglandığı an ilk-açılış ipucu kalıcı olarak kapanır.
          return { entries: [...s.entries, entry], firstExpenseTipSeen: true };
        }),

      updateExpense: (id, patch) =>
        set((s) => ({
          entries: s.entries.map((e) => {
            if (e.id !== id) return e;
            const next = { ...e };
            if (patch.amount !== undefined) {
              if (!Number.isFinite(patch.amount) || patch.amount <= 0) return e;
              next.amount = patch.amount;
            }
            if (patch.note !== undefined) {
              const trimmed = patch.note.trim();
              if (trimmed) next.note = trimmed;
              else delete next.note;
            }
            if (patch.category !== undefined) {
              if (isCategoryId(patch.category)) next.category = patch.category;
              else delete next.category;
            }
            return next;
          }),
        })),

      removeExpense: (id) =>
        set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),

      addTemplate: (label, amount, category) =>
        set((s) => {
          const trimmed = label.trim();
          if (!trimmed || !Number.isFinite(amount) || amount <= 0) return s;
          // Ücretsiz planda hızlı şablon sayısı sınırlı.
          if (!s.isPro && s.templates.length >= FREE_TEMPLATE_LIMIT) return s;
          const tpl: QuickTemplate = {
            id: uid(),
            label: trimmed,
            amount,
            ...(isCategoryId(category) ? { category } : {}),
          };
          return { templates: [...s.templates, tpl] };
        }),

      removeTemplate: (id) =>
        set((s) => ({ templates: s.templates.filter((t) => t.id !== id) })),

      // Şablonu bugün tarihli bir harcama kalemine çevirir (tek dokunuş).
      applyTemplate: (id) =>
        set((s) => {
          const tpl = s.templates.find((t) => t.id === id);
          if (!tpl) return s;
          const entry: ExpenseEntry = {
            id: uid(),
            day: dayKey(),
            amount: tpl.amount,
            ts: Date.now(),
            note: tpl.label,
            ...(tpl.category ? { category: tpl.category } : {}),
          };
          return { entries: [...s.entries, entry] };
        }),

      addRecurring: (rule) =>
        set((s) => {
          const candidate: RecurringRule = { ...rule, id: uid() };
          if (!isRecurringRule(candidate)) return s;
          // En yakın geçmiş vadeyi "postlanmış" say — kural eklenince geriye
          // doldurma yapılmaz; bir sonraki vadeden itibaren işler.
          candidate.lastPostedDay = mostRecentDue(candidate, new Date());
          return { recurring: [...s.recurring, candidate] };
        }),

      updateRecurring: (id, patch) =>
        set((s) => ({
          recurring: s.recurring.map((r) => {
            if (r.id !== id) return r;
            // Tutar/gün/aralık değişiminde lastPostedDay'i koru — yeniden
            // postlama vade karşılaştırmasıyla doğal olarak yönetilir.
            const next = { ...r, ...patch };
            return isRecurringRule(next) ? next : r;
          }),
        })),

      removeRecurring: (id) =>
        set((s) => ({ recurring: s.recurring.filter((r) => r.id !== id) })),

      applyRecurring: () =>
        set((s) => {
          // Zamanlanmış otomatik posting bir Pro özelliği. Pro düşen kullanıcının
          // kuralları store'da kalır (UI'da gizli) ama otomatik postlama durur —
          // aksi halde göremediği/silemediği hayalet harcamalar oluşurdu.
          if (!s.isPro) return s;
          const due = dueRecurring(s.recurring, new Date());
          if (due.length === 0) return s;
          const byId = new Map(s.recurring.map((r) => [r.id, r]));
          const newEntries: ExpenseEntry[] = [];
          for (const { ruleId, day } of due) {
            const r = byId.get(ruleId);
            if (!r) continue;
            newEntries.push({
              id: uid(),
              day,
              amount: r.amount,
              // Vade gününün öğlesine sabitle — gün içi sıralamada makul yer.
              ts: Date.parse(`${day}T12:00`),
              note: r.label,
              ...(r.category ? { category: r.category } : {}),
            });
          }
          const dueMap = new Map(due.map((d) => [d.ruleId, d.day]));
          const recurring = s.recurring.map((r) =>
            dueMap.has(r.id) ? { ...r, lastPostedDay: dueMap.get(r.id) } : r,
          );
          return { entries: [...s.entries, ...newEntries], recurring };
        }),

      resetToday: () =>
        set((s) => {
          const key = dayKey();
          const next = s.entries.filter((e) => e.day !== key);
          if (next.length === s.entries.length) return s;
          return { entries: next };
        }),

      completeOnboarding: () => set({ onboarded: true }),

      // Tüm kullanıcı verisini sıfırlar (onboarding'e döner). Pro hakkı korunur
      // — satın alma veri sıfırlamayla kaybolmamalı.
      resetAll: () =>
        set({
          budget: 0,
          subscriptions: [],
          entries: [],
          templates: [],
          recurring: [],
          archive: [],
          activeMonth: "",
          onboarded: false,
        }),

      unlockPro: () => set({ isPro: true }),

      lockPro: () => set({ isPro: false }),

      setCurrency: (code) =>
        set(() => (isCurrencyCode(code) ? { currency: code } : {})),

      setLanguage: (code) =>
        set(() => (isLanguage(code) ? { language: code } : {})),

      setRates: (rates) =>
        set(() =>
          isRateTable(rates) ? { rates, ratesUpdatedAt: Date.now() } : {},
        ),

      setReminder: (enabled, hour, minute) =>
        set({ reminderEnabled: enabled, reminderHour: hour, reminderMinute: minute }),

      setBudgetAlertsEnabled: (enabled) => set({ budgetAlertsEnabled: enabled }),

      setBudgetAlertState: (month, crossed) =>
        set({ budgetAlertState: { month, crossed } }),

      markRolloverTipSeen: () => set({ rolloverTipSeen: true }),

      markFirstExpenseTipSeen: () => set({ firstExpenseTipSeen: true }),

      rollIfNewMonth: () =>
        set((s) => rollMonth(s, monthKey()) ?? s),
    }),
    {
      name: PERSIST_KEY,
      storage: createJSONStorage(() => zustandStorage),
      partialize: ({
        budget,
        subscriptions,
        entries,
        templates,
        recurring,
        archive,
        activeMonth,
        onboarded,
        isPro,
        currency,
        language,
        rates,
        ratesUpdatedAt,
        reminderEnabled,
        reminderHour,
        reminderMinute,
        budgetAlertsEnabled,
        budgetAlertState,
        rolloverTipSeen,
        firstExpenseTipSeen,
      }) => ({
        budget,
        subscriptions,
        entries,
        templates,
        recurring,
        archive,
        activeMonth,
        onboarded,
        isPro,
        currency,
        language,
        rates,
        ratesUpdatedAt,
        reminderEnabled,
        reminderHour,
        reminderMinute,
        budgetAlertsEnabled,
        budgetAlertState,
        rolloverTipSeen,
        firstExpenseTipSeen,
      }),
      version: PERSIST_VERSION,
      migrate: (persisted) => {
        const s = (persisted ?? {}) as Partial<PaceState>;
        return {
          budget:
            typeof s.budget === "number" && s.budget > 0 ? s.budget : 0,
          subscriptions: Array.isArray(s.subscriptions)
            ? s.subscriptions.filter(
                (sub): sub is Subscription =>
                  !!sub &&
                  typeof sub.id === "string" &&
                  typeof sub.name === "string" &&
                  typeof sub.amount === "number" &&
                  sub.amount > 0,
              )
            : [],
          entries: migrateEntries(persisted),
          templates: Array.isArray(s.templates)
            ? s.templates.filter(isQuickTemplate)
            : [],
          recurring: Array.isArray(s.recurring)
            ? s.recurring.filter(isRecurringRule)
            : [],
          archive: Array.isArray(s.archive)
            ? s.archive.filter(
                (a): a is MonthSummary =>
                  !!a &&
                  typeof a.month === "string" &&
                  typeof a.spent === "number",
              )
            : [],
          activeMonth: typeof s.activeMonth === "string" ? s.activeMonth : "",
          onboarded: Boolean(s.onboarded),
          isPro: Boolean(s.isPro),
          currency: isCurrencyCode(s.currency) ? s.currency : DEFAULT_CURRENCY,
          language: isLanguage(s.language) ? s.language : DEFAULT_LANGUAGE,
          rates: isRateTable(s.rates) ? s.rates : FALLBACK_RATES,
          ratesUpdatedAt:
            typeof s.ratesUpdatedAt === "number" ? s.ratesUpdatedAt : 0,
          reminderEnabled: Boolean(s.reminderEnabled),
          reminderHour: typeof s.reminderHour === "number" ? s.reminderHour : 20,
          reminderMinute:
            typeof s.reminderMinute === "number" ? s.reminderMinute : 0,
          budgetAlertsEnabled:
            typeof s.budgetAlertsEnabled === "boolean"
              ? s.budgetAlertsEnabled
              : true,
          budgetAlertState: isBudgetAlertState(s.budgetAlertState)
            ? s.budgetAlertState
            : { month: "", crossed: [] },
          rolloverTipSeen: Boolean(s.rolloverTipSeen),
          // Mevcut (zaten onboard olmuş) kullanıcılar ilk-açılış ipucunu görmesin.
          firstExpenseTipSeen:
            Boolean(s.firstExpenseTipSeen) || Boolean(s.onboarded),
        } as PaceState;
      },
    },
  ),
);

const markHydrated = () => usePaceStore.setState({ _hydrated: true });
if (usePaceStore.persist.hasHydrated()) {
  markHydrated();
}
usePaceStore.persist.onFinishHydration(markHydrated);
