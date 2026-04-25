import type { ICategory, IProduct } from "../../types";

const normalizeMenuSegment = (value: string) =>
  value
    .trim()
    .replace(/^#+/, "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const buildSearchHref = (category: ICategory, subLabel?: string) => {
  const categorySlug = category.slug || normalizeMenuSegment(category.name);
  const queryLabel = subLabel ?? category.name;
  const subSlug = subLabel ? normalizeMenuSegment(subLabel) : "";
  const slug = subSlug ? `${categorySlug}-${subSlug}` : categorySlug;

  return `/pesquisa/${slug}?search=${encodeURIComponent(queryLabel)}`;
};

export const buildTopMenuItems = (categories: ICategory[]) =>
  categories.map((category) => ({
    label: category.name,
    href: buildSearchHref(category),
  }));

export const buildFeaturedProducts = (products: IProduct[]) =>
  products
    .filter((product) => product.isPromotional)
    .sort((a, b) => (a.featuredPosition ?? 0) - (b.featuredPosition ?? 0));

export const dealDeadline = new Date(
  Date.now() + 23 * 60 * 60 * 1000
).toISOString();
