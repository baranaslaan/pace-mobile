/* Dil sabitleri — store ile i18n/index arasındaki dairesel importu kırmak için
   ayrı, bağımlılıksız modül. */

export type Language = "tr" | "en";

export const DEFAULT_LANGUAGE: Language = "tr";

export const LANGUAGES: { code: Language; label: string }[] = [
  { code: "tr", label: "Türkçe" },
  { code: "en", label: "English" },
];

export function isLanguage(x: unknown): x is Language {
  return x === "tr" || x === "en";
}
