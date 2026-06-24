import { describe, it, expect } from "vitest";
import {
  categoryById,
  isCategoryId,
  DEFAULT_CATEGORY_ID,
  CATEGORIES,
} from "../categories";

describe("categories", () => {
  it("isCategoryId bilinen kimlikleri doğrular", () => {
    expect(isCategoryId("market")).toBe(true);
    expect(isCategoryId("diger")).toBe(true);
    expect(isCategoryId("bilinmeyen")).toBe(false);
    expect(isCategoryId(undefined)).toBe(false);
  });

  it("categoryById bilinmeyen/eksik kimlikte 'diger'e düşer", () => {
    expect(categoryById("market").id).toBe("market");
    expect(categoryById("yok").id).toBe(DEFAULT_CATEGORY_ID);
    expect(categoryById(undefined).id).toBe(DEFAULT_CATEGORY_ID);
  });

  it("her kategori benzersiz kimlik + renk taşır", () => {
    const ids = CATEGORIES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const c of CATEGORIES) expect(c.color).toMatch(/^#/);
  });
});
