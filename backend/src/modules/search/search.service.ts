import { prisma } from "../../config/database";
import { safeRedisGet, safeRedisSetEx } from "../../config/redis";
import { hashToken } from "../../utils/crypto.utils";

const normalizeQuery = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const searchService = {
  async search(query: string) {
    const normalizedQuery = normalizeQuery(query);
    const tokens = normalizedQuery.split(" ").filter(Boolean).slice(0, 7);
    const cacheKey = `nexus:search:${hashToken(normalizedQuery || query)}`;
    const cached = await safeRedisGet(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: query } },
            { description: { contains: query } },
            { searchText: { contains: normalizedQuery } },
            ...(tokens.length
              ? [
                  {
                    AND: tokens.map((token) => ({
                      searchText: {
                        contains: token
                      }
                    }))
                  }
                ]
              : [])
          ],
        },
        include: {
          platform: true,
          category: true
        },
        take: 12
      }),
      prisma.category.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: query } },
            { description: { contains: query } }
          ]
        },
        take: 6
      })
    ]);

    const response = {
      products,
      categories
    };

    await safeRedisSetEx(cacheKey, 300, JSON.stringify(response));
    return response;
  },

  async suggestions(query: string) {
    const normalizedQuery = normalizeQuery(query);
    const cacheKey = `nexus:search:suggestions:${hashToken(normalizedQuery || query)}`;
    const cached = await safeRedisGet(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const results = await prisma.product.findMany({
      where: {
        isActive: true,
        name: {
          contains: query
        }
      },
      select: {
        id: true,
        name: true,
        slug: true
      },
      take: 10
    });

    await safeRedisSetEx(cacheKey, 60, JSON.stringify(results));
    return results;
  }
};
