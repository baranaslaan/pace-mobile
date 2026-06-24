/* =============================================================
   i18n — store tabanlı, bağımlılıksız katalog.

   Kullanım:
   - Bileşenlerde: `const t = useT();  t("settings.title")`
   - React dışında (engine, notifications): `translate(lang, key, params)`
   ============================================================= */

import { useMemo } from "react";
import { usePaceStore } from "@/shared/store/usePaceStore";
import { tr } from "./tr";
import { en } from "./en";
import { Language, DEFAULT_LANGUAGE } from "./lang";

export { LANGUAGES, isLanguage, DEFAULT_LANGUAGE } from "./lang";
export type { Language } from "./lang";

const CATALOGS = { tr, en } as const;

/** "a.b.c" yolunu kataloğdan çözer. */
function resolve(lang: Language, key: string): unknown {
  const parts = key.split(".");
  let node: any = CATALOGS[lang];
  for (const p of parts) {
    node = node?.[p];
    if (node === undefined) break;
  }
  return node;
}

/** "{x}" yer tutucularını params ile değiştirir. */
function interpolate(text: string, params?: Record<string, string | number>): string {
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (m, k) =>
    k in params ? String(params[k]) : m,
  );
}

export type TParams = Record<string, string | number>;

/**
 * Anahtardan çevrilmiş metin. Bilinmeyen anahtarda önce TR'ye, sonra anahtarın
 * kendisine düşer (gözle fark edilir, sessiz boş string yerine).
 */
export function translate(lang: Language, key: string, params?: TParams): string {
  const raw = resolve(lang, key) ?? resolve(DEFAULT_LANGUAGE, key) ?? key;
  return typeof raw === "string" ? interpolate(raw, params) : key;
}

/** Aktif dile göre ay adı, "YYYY-MM" → "Haziran 2026". */
export function monthLabel(lang: Language, key: string): string {
  const [y, m] = key.split("-").map(Number);
  const months = CATALOGS[lang].months;
  return `${months[m - 1] ?? key} ${y}`;
}

/** Aktif dilin haftanın günü dizileri (JS getDay sırası). */
export function weekdaysShort(lang: Language): readonly string[] {
  return CATALOGS[lang].weekdaysShort;
}
export function weekdaysFull(lang: Language): readonly string[] {
  return CATALOGS[lang].weekdaysFull;
}

export type TFn = (key: string, params?: TParams) => string;

/** Aktif dile bağlı t fonksiyonu + dil bilgisi (reaktif). */
export function useT(): { t: TFn; lang: Language } {
  const lang = usePaceStore((s) => s.language) as Language;
  return useMemo(
    () => ({
      lang,
      t: (key: string, params?: TParams) => translate(lang, key, params),
    }),
    [lang],
  );
}
