import type { PaginatedProducts, Product } from "../types/product.types";

const steamCover = (appId: number) =>
  `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${appId}/library_600x900_2x.jpg`;

const steamThumb = (appId: number) =>
  `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${appId}/capsule_616x353.jpg`;

const categories = {
  games: { id: "fallback-pc-games", name: "PC Games", slug: "pc-games" },
  giftCards: { id: "fallback-gift-cards", name: "Gift Cards", slug: "gift-cards" },
  subscriptions: { id: "fallback-subscriptions", name: "Subscriptions", slug: "subscriptions" },
  currency: { id: "fallback-currency", name: "In-Game Currency", slug: "in-game-currency" }
};

const platforms = {
  steam: { id: "fallback-steam", name: "Steam", slug: "steam", color: "#00D4FF" },
  xbox: { id: "fallback-xbox", name: "Xbox", slug: "xbox", color: "#00FF88" },
  playstation: { id: "fallback-playstation", name: "PlayStation", slug: "playstation", color: "#60A5FA" },
  nintendo: { id: "fallback-nintendo", name: "Nintendo", slug: "nintendo", color: "#FF3B3B" },
  ea: { id: "fallback-ea", name: "EA", slug: "ea", color: "#FB923C" },
  spotify: { id: "fallback-spotify", name: "Spotify", slug: "spotify", color: "#1DB954" },
  netflix: { id: "fallback-netflix", name: "Netflix", slug: "netflix", color: "#E50914" },
  discord: { id: "fallback-discord", name: "Discord", slug: "discord", color: "#8B5CF6" }
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const product = (
  name: string,
  overrides: Partial<Product> & {
    platform: Product["platform"];
    category: Product["category"];
    type: string;
    basePrice: number;
  }
): Product => ({
  id: `fallback-${slugify(name)}`,
  name,
  slug: slugify(name),
  description: `${name} delivered instantly from NEXUS as a verified digital product.`,
  shortDescription: `${name} delivered instantly as secure digital access from NEXUS.`,
  salePrice: null,
  currency: "USD",
  stock: 12,
  isFeatured: false,
  isHot: false,
  isNew: false,
  soldCount: 120,
  coverImageUrl: null,
  thumbnailUrl: null,
  images: [],
  rating: 4.9,
  reviewCount: 18,
  tags: [],
  region: "GLOBAL",
  ...overrides
});

export const fallbackProducts: Product[] = [
  product("Cyberpunk 2077", {
    platform: platforms.steam,
    category: categories.games,
    type: "GAME_KEY",
    basePrice: 59.99,
    salePrice: 42.99,
    isFeatured: true,
    isHot: true,
    coverImageUrl: steamCover(1091500),
    thumbnailUrl: steamThumb(1091500),
    tags: ["game", "steam", "rpg", "digital-code"]
  }),
  product("Elden Ring", {
    platform: platforms.steam,
    category: categories.games,
    type: "GAME_KEY",
    basePrice: 59.99,
    salePrice: 47.99,
    isFeatured: true,
    coverImageUrl: steamCover(1245620),
    thumbnailUrl: steamThumb(1245620),
    tags: ["game", "steam", "soulslike", "digital-code"]
  }),
  product("Red Dead Redemption 2", {
    platform: platforms.steam,
    category: categories.games,
    type: "GAME_KEY",
    basePrice: 59.99,
    salePrice: 24.99,
    isHot: true,
    coverImageUrl: steamCover(1174180),
    thumbnailUrl: steamThumb(1174180),
    tags: ["game", "steam", "open-world", "digital-code"]
  }),
  product("Forza Horizon 5", {
    platform: platforms.xbox,
    category: categories.games,
    type: "GAME_KEY",
    basePrice: 59.99,
    salePrice: 38.99,
    isFeatured: true,
    coverImageUrl: steamCover(1551360),
    thumbnailUrl: steamThumb(1551360),
    tags: ["game", "xbox", "racing", "digital-code"]
  }),
  product("Hogwarts Legacy", {
    platform: platforms.steam,
    category: categories.games,
    type: "GAME_KEY",
    basePrice: 59.99,
    salePrice: 34.99,
    coverImageUrl: steamCover(990080),
    thumbnailUrl: steamThumb(990080),
    tags: ["game", "steam", "rpg", "magic"]
  }),
  product("The Witcher 3", {
    platform: platforms.steam,
    category: categories.games,
    type: "GAME_KEY",
    basePrice: 39.99,
    salePrice: 8.99,
    isHot: true,
    coverImageUrl: steamCover(292030),
    thumbnailUrl: steamThumb(292030),
    tags: ["game", "steam", "rpg", "fantasy"]
  }),
  product("PlayStation Store Card $50 USA", {
    platform: platforms.playstation,
    category: categories.giftCards,
    type: "GIFT_CARD",
    basePrice: 50,
    salePrice: 47.99,
    coverImageUrl: "https://placehold.co/900x1200/0A1B4D/60A5FA?text=PlayStation+Card",
    thumbnailUrl: "https://placehold.co/900x520/0A1B4D/60A5FA?text=PlayStation+Card",
    tags: ["gift-card", "psn", "playstation", "usa"]
  }),
  product("Xbox Gift Card $50 Global", {
    platform: platforms.xbox,
    category: categories.giftCards,
    type: "GIFT_CARD",
    basePrice: 50,
    salePrice: 47.49,
    coverImageUrl: "https://placehold.co/900x1200/052E16/4ADE80?text=Xbox+Gift+Card",
    thumbnailUrl: "https://placehold.co/900x520/052E16/4ADE80?text=Xbox+Gift+Card",
    tags: ["gift-card", "xbox", "global"]
  }),
  product("Nintendo eShop Card $35 USA", {
    platform: platforms.nintendo,
    category: categories.giftCards,
    type: "GIFT_CARD",
    basePrice: 35,
    salePrice: 33.99,
    coverImageUrl: "https://placehold.co/900x1200/450A0A/FCA5A5?text=Nintendo+eShop",
    thumbnailUrl: "https://placehold.co/900x520/450A0A/FCA5A5?text=Nintendo+eShop",
    tags: ["gift-card", "nintendo", "eshop", "usa"]
  }),
  product("Xbox Game Pass Ultimate 3 Months Global", {
    platform: platforms.xbox,
    category: categories.subscriptions,
    type: "SUBSCRIPTION",
    basePrice: 44.99,
    salePrice: 36.99,
    coverImageUrl: "/media/subscriptions/xbox-game-pass.svg",
    thumbnailUrl: "/media/subscriptions/xbox-game-pass.svg",
    tags: ["subscription", "xbox", "game-pass", "ultimate"]
  }),
  product("PlayStation Plus Premium Global", {
    platform: platforms.playstation,
    category: categories.subscriptions,
    type: "SUBSCRIPTION",
    basePrice: 17.99,
    salePrice: 15.49,
    coverImageUrl: "/media/subscriptions/playstation-plus.svg",
    thumbnailUrl: "/media/subscriptions/playstation-plus.svg",
    tags: ["subscription", "playstation", "sony", "ps-plus"]
  }),
  product("Spotify Premium Global", {
    platform: platforms.spotify,
    category: categories.subscriptions,
    type: "SUBSCRIPTION",
    basePrice: 10.99,
    salePrice: 8.99,
    coverImageUrl: "/media/subscriptions/spotify-premium.svg",
    thumbnailUrl: "/media/subscriptions/spotify-premium.svg",
    tags: ["subscription", "spotify", "premium"]
  }),
  product("Netflix Gift Global", {
    platform: platforms.netflix,
    category: categories.subscriptions,
    type: "SUBSCRIPTION",
    basePrice: 25.99,
    salePrice: 22.99,
    coverImageUrl: "/media/subscriptions/netflix.svg",
    thumbnailUrl: "/media/subscriptions/netflix.svg",
    tags: ["subscription", "netflix", "gift-card"]
  }),
  product("Discord Nitro Global", {
    platform: platforms.discord,
    category: categories.subscriptions,
    type: "SUBSCRIPTION",
    basePrice: 9.99,
    salePrice: 8.49,
    coverImageUrl: "/media/subscriptions/discord-nitro.svg",
    thumbnailUrl: "/media/subscriptions/discord-nitro.svg",
    tags: ["subscription", "discord", "nitro"]
  }),
  product("Fortnite V-Bucks 5000", {
    platform: platforms.steam,
    category: categories.currency,
    type: "IN_GAME_CURRENCY",
    basePrice: 36.99,
    salePrice: 33.99,
    coverImageUrl: "https://placehold.co/900x1200/172554/93C5FD?text=V-Bucks",
    thumbnailUrl: "https://placehold.co/900x520/172554/93C5FD?text=V-Bucks",
    tags: ["currency", "fortnite", "v-bucks"]
  }),
  product("Roblox Robux 1700", {
    platform: platforms.steam,
    category: categories.currency,
    type: "IN_GAME_CURRENCY",
    basePrice: 19.99,
    salePrice: 18.49,
    coverImageUrl: "https://placehold.co/900x1200/111827/F8FAFC?text=Robux",
    thumbnailUrl: "https://placehold.co/900x520/111827/F8FAFC?text=Robux",
    tags: ["currency", "roblox", "robux"]
  })
].map((item) => ({
  ...item,
  images: [item.coverImageUrl, item.thumbnailUrl].filter(Boolean) as string[]
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
      return Number(right.isFeatured) - Number(left.isFeatured);
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
