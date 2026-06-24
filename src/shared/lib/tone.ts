/* =============================================================
   Tempo durumu (tone) — kalan/limit oranına göre renk + anlam.
   Figma Make `getAccent` ile birebir.
   ============================================================= */

export interface Tone {
  key: "good" | "warn" | "crit" | "over" | "neutral";
  /** Halka / aksan rengi. */
  color: string;
  /** "r,g,b" — glow ve gölge hesapları için. */
  rgb: string;
  /** Yumuşak glow rengi. */
  glow: string;
}

/** Kalan tutar + günlük limit → tempo tonu. */
export function getTone(remaining: number, limit: number): Tone {
  // Havuz/limit yok (bütçe girilmemiş veya giderler bütçeyi yiyor): tempo
  // anlamsız. Nötr ton — alarm verme. (Gerçek aşım `limit > 0` ile gelir,
  // o yüzden danger zone bu kapıdan etkilenmez.)
  if (limit <= 0) {
    return {
      key: "neutral",
      color: "#64748b",
      rgb: "100,116,139",
      glow: "rgba(100,116,139,0.18)",
    };
  }

  // Limit aşıldı (kalan eksi) — kritikten daha kötü: derin kızıl "danger zone".
  if (remaining < 0) {
    return {
      key: "over",
      color: "#dc2626",
      rgb: "220,38,38",
      glow: "rgba(220,38,38,0.34)",
    };
  }

  const ratio = limit > 0 ? remaining / limit : 0;

  if (ratio > 0.5) {
    return {
      key: "good",
      color: "#3b82f6",
      rgb: "59,130,246",
      glow: "rgba(59,130,246,0.22)",
    };
  }
  if (ratio > 0.25) {
    return {
      key: "warn",
      color: "#f59e0b",
      rgb: "245,158,11",
      glow: "rgba(245,158,11,0.22)",
    };
  }
  return {
    key: "crit",
    color: "#ef4444",
    rgb: "239,68,68",
    glow: "rgba(239,68,68,0.25)",
  };
}
