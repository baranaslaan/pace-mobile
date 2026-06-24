"use client";

import { useCallback, useState } from "react";
import { usePaceStore } from "@/shared/store/usePaceStore";

/** Onboarding sırasında yerel tutulan sabit gider taslağı. */
export interface SubDraft {
  id: string;
  name: string;
  amount: number;
}

/**
 * Adımlar: 0 = hoş geldin (+ dil/para birimi), 1 = bütçe, 2 = sabit giderler,
 * 3 = özellikler turu, 4 = özet/nasıl çalışır.
 */
export const STEP_COUNT = 5;

function uid(): string {
  return Math.random().toString(36).slice(2);
}

/**
 * Onboarding akış durumu. Form değerleri akış boyunca YEREL tutulur ve yalnızca
 * `finish` çağrıldığında store'a yazılır — kullanıcı yarıda bırakırsa kalıcı
 * veri kirlenmez.
 */
export function useOnboardingFlow() {
  const commitBudget = usePaceStore((s) => s.setBudget);
  const commitSubscription = usePaceStore((s) => s.addSubscription);
  const completeOnboarding = usePaceStore((s) => s.completeOnboarding);

  const [step, setStep] = useState(0);
  /** Slide yönü: 1 ileri, -1 geri. */
  const [direction, setDirection] = useState(1);
  const [budget, setBudget] = useState("");
  const [subs, setSubs] = useState<SubDraft[]>([]);

  const goNext = useCallback(() => {
    setDirection(1);
    setStep((s) => Math.min(STEP_COUNT - 1, s + 1));
  }, []);

  const goBack = useCallback(() => {
    setDirection(-1);
    setStep((s) => Math.max(0, s - 1));
  }, []);

  const addSub = useCallback((name: string, amount: number) => {
    const trimmed = name.trim();
    if (!trimmed || !Number.isFinite(amount) || amount <= 0) return;
    setSubs((list) => [...list, { id: uid(), name: trimmed, amount }]);
  }, []);

  const removeSub = useCallback((id: string) => {
    setSubs((list) => list.filter((s) => s.id !== id));
  }, []);

  const finish = useCallback(() => {
    commitBudget(Number.parseFloat(budget) || 0);
    subs.forEach((s) => commitSubscription(s.name, s.amount));
    completeOnboarding();
  }, [budget, subs, commitBudget, commitSubscription, completeOnboarding]);

  return {
    step,
    direction,
    budget,
    setBudget,
    subs,
    addSub,
    removeSub,
    goNext,
    goBack,
    finish,
  };
}
