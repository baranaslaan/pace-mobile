/* =============================================================
   useCategories — yerleşik + kullanıcı (custom) kategorilerinin tek,
   reaktif görüntü kaynağı. Statik CATEGORIES/categoryById yerine
   bileşenler bunu kullanır (custom kategoriler de görünsün diye).
   ============================================================= */

import { useMemo, useCallback } from "react";
import { usePaceStore } from "./usePaceStore";
import { useT } from "../i18n";
import {
  buildCategoryList,
  resolveCategory,
  type ResolvedCategory,
} from "../lib/categories";

export interface CategoriesApi {
  /** Görüntü sırası: yerleşikler + custom'lar. Seçici/liste için. */
  list: ResolvedCategory[];
  /** Kimlikten çözümlenmiş kategori — bilinmeyen "Diğer"e düşer. */
  resolve: (id: string | undefined) => ResolvedCategory;
}

export function useCategories(): CategoriesApi {
  const custom = usePaceStore((s) => s.customCategories);
  const { t } = useT();

  const list = useMemo(
    () => buildCategoryList(custom, (id) => t(`category.${id}`)),
    [custom, t],
  );

  const resolve = useCallback(
    (id: string | undefined) => resolveCategory(list, id),
    [list],
  );

  return { list, resolve };
}
