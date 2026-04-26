import { generatedFallbackProducts } from "./generatedFallbackProducts";
import type { PaginatedProducts, Product } from "../types/product.types";

export const fallbackProducts: Product[] = generatedFallbackProducts.map((item) => ({
  ...item,
  images: item.images.length
    ? item.images
    : ([item.coverImageUrl, item.thumbnailUrl].filter(Boolean) as string[])
}));

const matchesQuery = (item: Product, query: string) => {
  const normalizedQuery = query.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const haystack = [
    item.name,
    item.description,
    item.shortDescription,
    item.platform.name,
    item.category.name,
    item.region,
    ...item.tags
  ]
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ");

  return normalizedQuery
    .split(/\s+/)
    .filter(Boolean)
    .every((token) => haystack.includes(token));
};

export const fallbackPaginatedProducts = (
  params?: Record<string, string | number | undefined>
): PaginatedProducts => {
  const page = Number(params?.page ?? 1);
  const limit = Number(params?.limit ?? 24);
  const query = String(params?.q ?? "").trim();
  const category = String(params?.category ?? "").trim();
  const platform = String(params?.platform ?? "").trim();
  const type = String(params?.type ?? "").trim();

  const filtered = fallbackProducts
    .filter((item) => (query ? matchesQuery(item, query) : true))
    .filter((item) => (category ? item.category.slug === category : true))
    .filter((item) => (platform ? item.platform.slug === platform : true))
    .filter((item) => (type ? item.type === type : true))
    .sort((left, right) => {
      if (params?.sort === "price_asc") {
        return left.basePrice - right.basePrice;
      }
      if (params?.sort === "price_desc") {
        return right.basePrice - left.basePrice;
      }
      if (params?.sort === "popular") {
        return right.soldCount - left.soldCount;
      }
      return (
        Number(right.isFeatured) - Number(left.isFeatured) ||
        Number(right.isHot) - Number(left.isHot) ||
        Number(right.isNew) - Number(left.isNew)
      );
    });

  const start = Math.max(page - 1, 0) * limit;
  const items = filtered.slice(start, start + limit);

  return {
    items,
    meta: {
      total: filtered.length,
      totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
      currentPage: page,
      limit
    }
  };
};

export const fallbackFeaturedProducts = () =>
  fallbackProducts.filter((item) => item.isFeatured).slice(0, 8);

export const fallbackHotDeals = () =>
  fallbackProducts.filter((item) => item.salePrice).slice(0, 8);

export const fallbackProductBySlug = (slug: string) =>
  fallbackProducts.find((item) => item.slug === slug);

export const fallbackRelatedProducts = (productId?: string) => {
  const current = fallbackProducts.find((item) => item.id === productId);
  if (!current) {
    return fallbackFeaturedProducts();
  }

  return fallbackProducts
    .filter((item) => item.id !== current.id)
    .filter(
      (item) =>
        item.category.slug === current.category.slug || item.platform.slug === current.platform.slug
    )
    .slice(0, 8);
};
