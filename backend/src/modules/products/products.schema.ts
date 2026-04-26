import { ProductRegion, ProductType } from "@prisma/client";
import { z } from "zod";

export const productQuerySchema = {
  query: z
    .object({
      page: z.coerce.number().min(1).default(1),
      limit: z.coerce.number().min(1).max(50).default(12),
      sort: z
        .enum(["price_asc", "price_desc", "newest", "popular", "rating", "sale"])
        .optional(),
      category: z.string().optional(),
      platform: z.string().optional(),
      type: z.nativeEnum(ProductType).optional(),
      region: z.nativeEnum(ProductRegion).optional(),
      minPrice: z.coerce.number().optional(),
      maxPrice: z.coerce.number().optional(),
      inStock: z.enum(["true", "false"]).optional(),
      onSale: z.enum(["true", "false"]).optional(),
      tags: z.string().optional(),
      q: z.string().optional()
    })
    .strict()
};

export const productSlugSchema = {
  params: z
    .object({
      slug: z.string().min(1)
    })
    .strict()
};

export const productIdSchema = {
  params: z
    .object({
      id: z.string().uuid()
    })
    .strict()
};

export const createProductSchema = {
  body: z
    .object({
      name: z.string().min(3),
      description: z.string().min(20),
      shortDescription: z.string().min(10),
      type: z.nativeEnum(ProductType),
      platformId: z.string().uuid(),
      categoryId: z.string().uuid(),
      basePrice: z.coerce.number().positive(),
      salePrice: z.coerce.number().positive().optional(),
      currency: z.string().default("USD"),
      region: z.nativeEnum(ProductRegion).default(ProductRegion.GLOBAL),
      stock: z.coerce.number().min(0).default(0),
      unlimitedStock: z.boolean().default(false),
      isFeatured: z.boolean().default(false),
      isHot: z.boolean().default(false),
      isNew: z.boolean().default(false),
      tags: z.array(z.string()).default([]),
      coverImageUrl: z.string().url().optional(),
      thumbnailUrl: z.string().url().optional(),
      trailerVideoId: z.string().regex(/^[a-zA-Z0-9_-]{11}$/).nullable().optional(),
      images: z.array(z.string().url()).default([]),
      minQuantity: z.coerce.number().min(1).default(1),
      maxQuantity: z.coerce.number().min(1).default(10)
    })
    .strict()
};

export const updateProductSchema = {
  body: createProductSchema.body.partial()
};

export const importKeysSchema = {
  params: z
    .object({
      id: z.string().uuid()
    })
    .strict(),
  body: z
    .object({
      keys: z.array(z.string().min(6)).min(1),
      batchLabel: z.string().min(3).default("Manual import")
    })
    .strict()
};
