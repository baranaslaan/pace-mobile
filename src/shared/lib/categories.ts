/* =============================================================
   Harcama kategorileri — saf, tek doğruluk kaynağı.

   Kategori bir harcama kalemine opsiyonel olarak iliştirilir. Kategorisiz
   (eski veya atlanmış) kalemler analitikte {@link DEFAULT_CATEGORY_ID}'e
   ("Diğer") düşer. UI minimal kalsın diye ikon yerine renkli nokta kullanılır.
   ============================================================= */

export interface Category {
  /** Kalıcı kimlik — store'da bu saklanır (etiket/renk değişse de stabil). */
  id: string;
  /** Görünen ad (TR). */
  label: string;
  /** Nokta/çubuk rengi (hex). */
  color: string;
}

/** Kategorisiz kalemlerin düştüğü varsayılan kategori kimliği. */
export const DEFAULT_CATEGORY_ID = "diger";

/**
 * Seçilebilir kategoriler — görünüm sırası. "Diğer" en sonda durur ve
 * varsayılandır. Yeni kategori eklerken `id`'leri ASLA değiştirme (kalıcı veri).
 */
export const CATEGORIES: Category[] = [
  { id: "market", label: "Market", color: "#22c55e" },
  { id: "yemek", label: "Yemek", color: "#f97316" },
  { id: "ulasim", label: "Ulaşım", color: "#3b82f6" },
  { id: "kahve", label: "Kahve", color: "#d4a373" },
  { id: "eglence", label: "Eğlence", color: "#a855f7" },
  { id: "fatura", label: "Fatura", color: "#ef4444" },
  { id: "saglik", label: "Sağlık", color: "#14b8a6" },
  { id: DEFAULT_CATEGORY_ID, label: "Diğer", color: "#94a3b8" },
];

const BY_ID: Record<string, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
);

/** Geçerli kategori kimliği mi? (migrate/güven için.) */
export function isCategoryId(id: unknown): id is string {
  return typeof id === "string" && id in BY_ID;
}

/** Kimlikten kategori — bilinmeyen/eksik kimlik "Diğer"e düşer (asla null). */
export function categoryById(id: string | undefined): Category {
  return (id && BY_ID[id]) || BY_ID[DEFAULT_CATEGORY_ID];
}
