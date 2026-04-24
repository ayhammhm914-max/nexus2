import type { Product } from "../types/product.types";

export const getProductOfferLabel = (product: Product) => {
  switch (product.category.slug) {
    case "gift-cards":
      return "Gift Card";
    case "subscriptions":
      return "Gaming Subscription";
    case "in-game-currency":
      return "In-Game Currency";
    default:
      return "Full Game (Digital Code)";
  }
};

export const getPlatformRedeemLabel = (platformName: string) => {
  switch (platformName) {
    case "Steam":
      return "Redeem on Steam";
    case "Epic Games":
      return "Redeem in Epic Games Store";
    case "PlayStation":
      return "Redeem on PlayStation";
    case "Xbox":
      return "Redeem on Xbox";
    case "Nintendo":
      return "Redeem on Nintendo";
    case "EA":
      return "Redeem with EA";
    case "Ubisoft":
      return "Redeem with Ubisoft";
    default:
      return `Redeem on ${platformName}`;
  }
};

export const uniqueProducts = (products: Product[]) => {
  const seen = new Set<string>();

  return products.filter((product) => {
    if (seen.has(product.id)) {
      return false;
    }

    seen.add(product.id);
    return true;
  });
};
