import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import { createMMKV } from "react-native-mmkv";
import { dayKey, monthKey, monthOf } from "@/shared/lib/date";
import { summarizeMonth, expensesByDay } from "@/shared/lib/engine";
import type {
  ExpenseEntry,
  MonthSummary,
  Subscription,
} from "@/shared/lib/engine";

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

/** "YYYY-MM-DD" gün anahtarı mı? (migrate güvenliği için.) */
function isDayKey(k: unknown): k is string {
  return typeof k === "string" && /^\d{4}-\d{2}-\d{2}$/.test(k);
}

function migrateEntries(persisted: unknown): ExpenseEntry[] {
  const s = (persisted ?? {}) as Record<string, unknown>;
  if (Array.isArray(s.entries)) {
    return s.entries.filter(
      (e): e is ExpenseEntry =>
        !!e &&
        typeof e === "object" &&
        typeof (e as ExpenseEntry).id === "string" &&
        isDayKey((e as ExpenseEntry).day) &&
        typeof (e as ExpenseEntry).amount === "number" &&
        (e as ExpenseEntry).amount > 0,
    );
  }

  const expenses = s.expenses;
  if (!expenses || typeof expenses !== "object") return [];
  const entries: ExpenseEntry[] = [];
  for (const [day, value] of Object.entries(expenses)) {
    if (!isDayKey(day) || typeof value !== "number" || value <= 0) continue;
    entries.push({ id: uid(), day, amount: value, ts: Date.parse(`${day}T12:00`) });
  }
  return entries;
}

interface PaceState {
  budget: number;
  subscriptions: Subscription[];
  entries: ExpenseEntry[];
  archive: MonthSummary[];
  activeMonth: string;
  onboarded: boolean;
  isPro: boolean;
  _hydrated: boolean;

  setBudget: (amount: number) => void;
  addSubscription: (name: string, amount: number) => void;
  updateSubscription: (id: string, patch: Partial<Omit<Subscription, "id">>) => void;
  removeSubscription: (id: string) => void;
  addExpense: (amount: number, note?: string) => void;
  updateExpense: (
    id: string,
    patch: Partial<Pick<ExpenseEntry, "amount" | "note">>,
  ) => void;
  removeExpense: (id: string) => void;
  resetToday: () => void;
  completeOnboarding: () => void;
  unlockPro: () => void;
  rollIfNewMonth: () => void;
}

export const usePaceStore = create<PaceState>()(
  persist(
    (set) => ({
      budget: 0,
      subscriptions: [],
      entries: [],
      archive: [],
      activeMonth: "",
      onboarded: false,
      isPro: false,
      _hydrated: false,

      setBudget: (amount) =>
        set(() => ({ budget: Number.isFinite(amount) && amount > 0 ? amount : 0 })),

      addSubscription: (name, amount) =>
        set((s) => {
          const trimmed = name.trim();
          if (!trimmed || !Number.isFinite(amount) || amount <= 0) return s;
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

      addExpense: (amount, note) =>
        set((s) => {
          if (!Number.isFinite(amount) || amount <= 0) return s;
          const trimmed = note?.trim();
          const entry: ExpenseEntry = {
            id: uid(),
            day: dayKey(),
            amount,
            ts: Date.now(),
            ...(trimmed ? { note: trimmed } : {}),
          };
          return { entries: [...s.entries, entry] };
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
            return next;
          }),
        })),

      removeExpense: (id) =>
        set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),

      resetToday: () =>
        set((s) => {
          const key = dayKey();
          const next = s.entries.filter((e) => e.day !== key);
          if (next.length === s.entries.length) return s;
          return { entries: next };
        }),

      completeOnboarding: () => set({ onboarded: true }),

      unlockPro: () => set({ isPro: true }),

      rollIfNewMonth: () =>
        set((s) => {
          const now = monthKey();
          if (s.activeMonth === now) return s;

          const snap = {
            budget: s.budget,
            subscriptions: s.subscriptions,
            expenses: expensesByDay(s.entries),
          };

          const archived = new Set(s.archive.map((a) => a.month));
          const pastMonths = new Set<string>();
          for (const e of s.entries) {
            const mo = monthOf(e.day);
            if (mo < now && !archived.has(mo)) pastMonths.add(mo);
          }

          const additions = [...pastMonths].map((mo) =>
            summarizeMonth(snap, mo),
          );

          const entries = s.entries.filter((e) => monthOf(e.day) === now);

          return {
            activeMonth: now,
            archive: [...s.archive, ...additions].sort((a, b) =>
              a.month < b.month ? 1 : -1,
            ),
            entries,
          };
        }),
    }),
    {
      name: "pace-v1",
      storage: createJSONStorage(() => zustandStorage),
      partialize: ({
        budget,
        subscriptions,
        entries,
        archive,
        activeMonth,
        onboarded,
        isPro,
      }) => ({
        budget,
        subscriptions,
        entries,
        archive,
        activeMonth,
        onboarded,
        isPro,
      }),
      version: 3,
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
