import type { Product } from "../types/product.types";

type BrandKey = "spotify" | "netflix" | "playstation" | "discord" | "amazon";

const BRAND_CARD_IMAGES: Record<BrandKey, string> = {
  spotify: "/cards/spotify-premium.webp",
  netflix: "/cards/netflix.png",
  playstation: "/cards/playstation-store.webp",
  discord: "/cards/discord-nitro.webp",
  amazon: "/cards/amazon-gift-card.webp"
};

export const isCardLikeProduct = (product: Product) =>
  product.category.slug === "gift-cards" || product.category.slug === "subscriptions";

export const getProductBrandKey = (product: Product): BrandKey | null => {
  const slug = product.slug.toLowerCase();
  const name = product.name.toLowerCase();
  const platformSlug = product.platform.slug?.toLowerCase?.() ?? "";
  const platformName = product.platform.name?.toLowerCase?.() ?? "";

  if (slug.includes("spotify") || name.includes("spotify")) return "spotify";
  if (slug.includes("netflix") || name.includes("netflix")) return "netflix";
  if (slug.includes("discord") || name.includes("discord")) return "discord";
  if (slug.includes("amazon") || name.includes("amazon")) return "amazon";
  if (
    slug.includes("playstation") ||
    slug.includes("psn") ||
    platformSlug.includes("playstation") ||
    platformName.includes("playstation")
  )
    return "playstation";

  return null;
};

export const getProductCardImageOverride = (product: Product) => {
  if (!isCardLikeProduct(product)) {
    return null;
  }

  const key = getProductBrandKey(product);
  if (!key) {
    return null;
  }

  return BRAND_CARD_IMAGES[key];
};

export const getProductPrimaryImage = (product: Product) =>
  getProductCardImageOverride(product) ?? product.thumbnailUrl ?? product.coverImageUrl ?? "";

export const getProductWatermarkImage = (product: Product) =>
  getProductCardImageOverride(product) ?? product.coverImageUrl ?? product.thumbnailUrl ?? "";

