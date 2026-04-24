import type { Prisma } from "@prisma/client";

export type PaginatedResponse<T> = {
  items: T[];
  meta: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
};

export const paginate = <T>(
  data: T[],
  page: number,
  limit: number,
  total = data.length
): PaginatedResponse<T> => ({
  items: data,
  meta: {
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    currentPage: page,
    limit
  }
});

export const getPrismaSkip = (page: number, limit: number) =>
  Math.max(page - 1, 0) * limit;

export const buildSortObject = (sort?: string): Prisma.ProductOrderByWithRelationInput => {
  switch (sort) {
    case "price_asc":
      return { basePrice: "asc" };
    case "price_desc":
      return { basePrice: "desc" };
    case "popular":
      return { soldCount: "desc" };
    case "rating":
      return { rating: "desc" };
    case "sale":
      return { salePrice: "asc" };
    case "newest":
    default:
      return { createdAt: "desc" };
  }
};

export const buildFilterObject = (filters: Record<string, unknown>): Prisma.ProductWhereInput => {
  const where: Prisma.ProductWhereInput = {
    isActive: true
  };
  const currentAnd = () =>
    Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : [];

  if (typeof filters.category === "string" && filters.category) {
    where.category = { slug: filters.category };
  }

  if (typeof filters.platform === "string" && filters.platform) {
    where.platform = { slug: filters.platform };
  }

  if (typeof filters.type === "string" && filters.type) {
    where.type = filters.type as Prisma.EnumProductTypeFilter["equals"];
  }

  if (typeof filters.region === "string" && filters.region) {
    where.region = filters.region as Prisma.EnumProductRegionFilter["equals"];
  }

  if (typeof filters.minPrice === "string" || typeof filters.minPrice === "number") {
    where.basePrice = {
      ...(where.basePrice as Prisma.DecimalFilter | undefined),
      gte: Number(filters.minPrice)
    };
  }

  if (typeof filters.maxPrice === "string" || typeof filters.maxPrice === "number") {
    where.basePrice = {
      ...(where.basePrice as Prisma.DecimalFilter | undefined),
      lte: Number(filters.maxPrice)
    };
  }

  if (filters.inStock === "true") {
    where.OR = [{ stock: { gt: 0 } }, { unlimitedStock: true }];
  }

  if (filters.onSale === "true") {
    where.salePrice = { not: null };
  }

  if (typeof filters.tags === "string" && filters.tags) {
    where.AND = [
      ...currentAnd(),
      ...filters.tags
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .map((tag) => tag.replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim())
        .filter(Boolean)
        .map((tag) => ({
          searchText: {
            contains: tag
          }
        }))
    ];
  }

  if (typeof filters.q === "string" && filters.q.trim()) {
    const rawQuery = filters.q.trim();
    const normalizedQuery = rawQuery
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const tokens = normalizedQuery.split(" ").filter(Boolean).slice(0, 7);

    const orFilters: Prisma.ProductWhereInput[] = [
      { name: { contains: rawQuery } },
      { description: { contains: rawQuery } },
      { searchText: { contains: normalizedQuery } }
    ];

    if (tokens.length) {
      orFilters.push({
        AND: tokens.map((token) => ({
          searchText: {
            contains: token
          }
        }))
      });
    }

    where.AND = [
      ...currentAnd(),
      {
        OR: orFilters
      }
    ];
  }

  return where;
};
