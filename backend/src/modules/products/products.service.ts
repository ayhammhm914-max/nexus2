import crypto from "node:crypto";
import { prisma } from "../../config/database";
import { safeRedisDel, safeRedisGet, safeRedisSetEx } from "../../config/redis";
import { encryptKey, hashToken } from "../../utils/crypto.utils";
import {
  buildFilterObject,
  buildSortObject,
  getPrismaSkip,
  paginate
} from "../../utils/pagination.utils";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const buildSearchText = (input: {
  name: string;
  description: string;
  shortDescription: string;
  tags: string[];
  platformName?: string;
  categoryName?: string;
  region?: string;
}) =>
  (() => {
    const raw = [
      input.name,
      input.description,
      input.shortDescription,
      input.platformName ?? "",
      input.categoryName ?? "",
      input.region ?? "",
      ...input.tags
    ]
      .filter(Boolean)
      .join(" ");

    const normalized = raw
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return `${raw.toLowerCase()} ${normalized}`.trim();
  })();

const clearProductCaches = async (slug?: string) => {
  const keys = ["nexus:products:featured", "nexus:products:hot-deals", "nexus:products:new-arrivals"];
  if (slug) {
    keys.push(`nexus:product:${slug}`);
  }

  await Promise.all(keys.map((key) => safeRedisDel(key)));
};

export const productsService = {
  async list(filters: Record<string, unknown>) {
    const cacheKey = `nexus:search:${hashToken(JSON.stringify(filters))}`;
    const cached = await safeRedisGet(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const page = Number(filters.page ?? 1);
    const limit = Number(filters.limit ?? 12);
    const where = buildFilterObject(filters);

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          platform: true,
          category: true
        },
        skip: getPrismaSkip(page, limit),
        take: limit,
        orderBy: buildSortObject(typeof filters.sort === "string" ? filters.sort : undefined)
      }),
      prisma.product.count({ where })
    ]);

    const response = paginate(items, page, limit, total);
    await safeRedisSetEx(cacheKey, 300, JSON.stringify(response));
    return response;
  },

  async featured() {
    const cacheKey = "nexus:products:featured";
    const cached = await safeRedisGet(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const items = await prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      include: { platform: true, category: true },
      orderBy: [{ weight: "desc" }, { createdAt: "desc" }],
      take: 8
    });

    await safeRedisSetEx(cacheKey, 1800, JSON.stringify(items));
    return items;
  },

  async hotDeals() {
    const cacheKey = "nexus:products:hot-deals";
    const cached = await safeRedisGet(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const items = await prisma.product.findMany({
      where: {
        isActive: true,
        salePrice: { not: null }
      },
      include: { platform: true, category: true },
      orderBy: [{ weight: "desc" }, { updatedAt: "desc" }],
      take: 8
    });

    await safeRedisSetEx(cacheKey, 900, JSON.stringify(items));
    return items;
  },

  async newArrivals() {
    const cacheKey = "nexus:products:new-arrivals";
    const cached = await safeRedisGet(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const items = await prisma.product.findMany({
      where: {
        isActive: true,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      include: { platform: true, category: true },
      orderBy: { createdAt: "desc" },
      take: 8
    });

    await safeRedisSetEx(cacheKey, 600, JSON.stringify(items));
    return items;
  },

  async bySlug(slug: string) {
    const cacheKey = `nexus:product:${slug}`;
    const cached = await safeRedisGet(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        platform: true,
        category: true,
        reviews: {
          where: { isApproved: true },
          take: 5,
          include: {
            user: {
              select: {
                username: true,
                avatarUrl: true
              }
            }
          }
        }
      }
    });

    if (!product) {
      throw new Error("Product not found.");
    }

    void prisma.product.update({
      where: { id: product.id },
      data: { viewCount: { increment: 1 } }
    });

    await safeRedisSetEx(cacheKey, 600, JSON.stringify(product));
    return product;
  },

  async related(productId: string) {
    const product = await prisma.product.findUniqueOrThrow({
      where: { id: productId }
    });

    return prisma.product.findMany({
      where: {
        id: { not: product.id },
        isActive: true,
        OR: [
          { categoryId: product.categoryId },
          { platformId: product.platformId }
        ]
      },
      include: { platform: true, category: true },
      take: 8
    });
  },

  async create(data: Record<string, unknown>, actorId?: string, meta?: { ip?: string; userAgent?: string }) {
    const baseSlug = slugify(String(data.name));
    let slug = baseSlug;
    let counter = 1;

    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter += 1;
    }

    const platform =
      typeof data.platformId === "string"
        ? await prisma.platform.findUnique({ where: { id: data.platformId } })
        : null;
    const category =
      typeof data.categoryId === "string"
        ? await prisma.category.findUnique({ where: { id: data.categoryId } })
        : null;
    const tags = Array.isArray(data.tags) ? data.tags.map((tag) => String(tag)) : [];
    const searchText = buildSearchText({
      name: String(data.name),
      description: String(data.description),
      shortDescription: String(data.shortDescription),
      tags,
      platformName: platform?.name,
      categoryName: category?.name,
      region: typeof data.region === "string" ? data.region : undefined
    });

    const product = await prisma.product.create({
      data: {
        ...data,
        searchText,
        slug
      } as never
    });

    await prisma.auditLog.create({
      data: {
        userId: actorId,
        action: "product.create",
        entity: "Product",
        entityId: product.id,
        newValue: product as never,
        ipAddress: meta?.ip,
        userAgent: meta?.userAgent
      }
    });

    await clearProductCaches(product.slug);
    return product;
  },

  async update(
    id: string,
    data: Record<string, unknown>,
    actorId?: string,
    meta?: { ip?: string; userAgent?: string }
  ) {
    const previous = await prisma.product.findUniqueOrThrow({ where: { id } });
    const platform =
      typeof data.platformId === "string"
        ? await prisma.platform.findUnique({ where: { id: data.platformId } })
        : previous.platformId
          ? await prisma.platform.findUnique({ where: { id: previous.platformId } })
          : null;
    const category =
      typeof data.categoryId === "string"
        ? await prisma.category.findUnique({ where: { id: data.categoryId } })
        : previous.categoryId
          ? await prisma.category.findUnique({ where: { id: previous.categoryId } })
          : null;
    const mergedTags = Array.isArray(data.tags)
      ? data.tags.map((tag) => String(tag))
      : Array.isArray(previous.tags)
        ? previous.tags.map((tag) => String(tag))
        : [];
    const searchText = buildSearchText({
      name: typeof data.name === "string" ? data.name : previous.name,
      description: typeof data.description === "string" ? data.description : previous.description,
      shortDescription:
        typeof data.shortDescription === "string" ? data.shortDescription : previous.shortDescription,
      tags: mergedTags,
      platformName: platform?.name,
      categoryName: category?.name,
      region: typeof data.region === "string" ? data.region : previous.region
    });
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        searchText
      } as never
    });

    await prisma.auditLog.create({
      data: {
        userId: actorId,
        action: "product.update",
        entity: "Product",
        entityId: product.id,
        oldValue: previous as never,
        newValue: product as never,
        ipAddress: meta?.ip,
        userAgent: meta?.userAgent
      }
    });

    await clearProductCaches(previous.slug);
    return product;
  },

  async remove(id: string, actorId?: string, meta?: { ip?: string; userAgent?: string }) {
    const previous = await prisma.product.findUniqueOrThrow({ where: { id } });
    const product = await prisma.product.update({
      where: { id },
      data: { isActive: false }
    });

    await prisma.auditLog.create({
      data: {
        userId: actorId,
        action: "product.delete",
        entity: "Product",
        entityId: product.id,
        oldValue: previous as never,
        newValue: product as never,
        ipAddress: meta?.ip,
        userAgent: meta?.userAgent
      }
    });

    await clearProductCaches(previous.slug);
    return product;
  },

  async importKeys(
    productId: string,
    keys: string[],
    batchLabel: string,
    actorId?: string,
    meta?: { ip?: string; userAgent?: string }
  ) {
    const batch = await prisma.inventoryBatch.create({
      data: {
        label: batchLabel,
        referenceCode: `IMPORT-${crypto.randomBytes(5).toString("hex").toUpperCase()}`,
        importedById: actorId
      }
    });

    const rows = keys.map((rawKey) => {
      const encrypted = encryptKey(rawKey);
      return {
        productId,
        batchId: batch.id,
        ciphertext: encrypted.encrypted,
        iv: encrypted.iv,
        authTag: encrypted.tag,
        checksum: crypto.createHash("sha256").update(rawKey).digest("hex")
      };
    });

    await prisma.productKey.createMany({
      data: rows,
      skipDuplicates: true
    });

    await prisma.product.update({
      where: { id: productId },
      data: {
        stock: { increment: rows.length }
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: actorId,
        action: "product.keys.import",
        entity: "Product",
        entityId: productId,
        newValue: { importedCount: rows.length, batchId: batch.id } as never,
        ipAddress: meta?.ip,
        userAgent: meta?.userAgent
      }
    });

    return { importedCount: rows.length, batchId: batch.id };
  }
};
