import { useSyncExternalStore } from "react";
import { AppState } from "react-native";
import { dayKey } from "@/shared/lib/date";

/* =============================================================
   Gün anahtarı saati — tek paylaşımlı kaynak.

   Sorun: günlük limit/tempo `new Date()` ile türetiliyor ama React'in
   yeniden render tetiği yok. Uygulama arka plandayken gün/ay sınırı geçilince
   (sabah resume) ekran dünün limitini gösteriyordu. Bu store, gün anahtarı
   DEĞİŞTİĞİNDE (resume veya gece yarısı) abonelerini uyandırır; useLimitLogic
   onu bağımlılık alır → limit tazelenir, index'teki ay devri efekti yeniden
   çalışır.

   Tek AppState dinleyicisi + tek gece yarısı timer'ı (singleton); useSync
   ExternalStore ile tüm tüketiciler paylaşır.
   ============================================================= */

let current = dayKey();
const listeners = new Set<() => void>();
let started = false;
let midnightTimer: ReturnType<typeof setTimeout> | null = null;

function notify() {
  const next = dayKey();
  if (next === current) return; // aynı gün — uyandırma
  current = next;
  listeners.forEach((l) => l());
}

function scheduleMidnight() {
  if (midnightTimer) clearTimeout(midnightTimer);
  const now = new Date();
  // Yerel gece yarısından 5 sn sonra: saat farkı/DST kenarında güvenli taraf.
  const nextMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    5,
  );
  midnightTimer = setTimeout(() => {
    notify();
    scheduleMidnight();
  }, nextMidnight.getTime() - now.getTime());
}

function start() {
  if (started) return;
  started = true;
  // Arka plandan dönüşte (gün/ay geçmiş olabilir) ve foreground'da gece
  // yarısında gün anahtarını tazele.
  AppState.addEventListener("change", (s) => {
    if (s === "active") notify();
  });
  scheduleMidnight();
}

/** Bugünün gün anahtarı ("YYYY-MM-DD"); gün değişince consumer'ı re-render eder. */
export function useDayKey(): string {
  return useSyncExternalStore(
    (cb) => {
      start();
      listeners.add(cb);
      return () => {
        listeners.delete(cb);
      };
    },
    () => current,
    () => current,
  );
}
