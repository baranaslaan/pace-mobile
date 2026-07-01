import { describe, it, expect } from "vitest";
import {
  categoryById,
  isCategoryId,
  isCategoryRef,
  isCustomCategory,
  buildCategoryList,
  resolveCategory,
  CUSTOM_CATEGORY_PREFIX,
  DEFAULT_CATEGORY_ID,
  CATEGORIES,
} from "../categories";

const CUSTOM = [
  { id: `${CUSTOM_CATEGORY_PREFIX}abc`, label: "Giyim", color: "#ec4899" },
];
const nameOf = (id: string) => `builtin:${id}`;

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

  it("isCategoryRef yerleşik + custom-şekilli kimlikleri kabul, çöpü reddeder", () => {
    expect(isCategoryRef("market")).toBe(true);
    expect(isCategoryRef(`${CUSTOM_CATEGORY_PREFIX}xyz`)).toBe(true);
    expect(isCategoryRef("uzaylı")).toBe(false); // çöp string düşer
    expect(isCategoryRef(undefined)).toBe(false);
  });

  it("isCustomCategory geçerli şekli doğrular", () => {
    expect(isCustomCategory({ id: "c_1", label: "Giyim", color: "#fff" })).toBe(true);
    expect(isCustomCategory({ id: "c_1", label: "  ", color: "#fff" })).toBe(false);
    expect(isCustomCategory({ id: "", label: "x", color: "#fff" })).toBe(false);
    expect(isCustomCategory(null)).toBe(false);
  });

  it("buildCategoryList yerleşik (i18n adlı) + custom'ı birleştirir", () => {
    const list = buildCategoryList(CUSTOM, nameOf);
    expect(list).toHaveLength(CATEGORIES.length + 1);
    expect(list[0]).toMatchObject({ id: "market", name: "builtin:market", builtin: true });
    const custom = list.find((c) => c.id === CUSTOM[0].id);
    expect(custom).toMatchObject({ name: "Giyim", color: "#ec4899", builtin: false });
  });

  it("resolveCategory bilinmeyen/eksik kimlikte 'Diğer'e düşer", () => {
    const list = buildCategoryList(CUSTOM, nameOf);
    expect(resolveCategory(list, CUSTOM[0].id).name).toBe("Giyim");
    expect(resolveCategory(list, "silinmis_c_id").id).toBe(DEFAULT_CATEGORY_ID);
    expect(resolveCategory(list, undefined).id).toBe(DEFAULT_CATEGORY_ID);
  });
});
