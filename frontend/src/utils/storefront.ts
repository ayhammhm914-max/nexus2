import type { Language } from "../i18n/translations";
import type { Product } from "../types/product.types";

export const getProductOfferLabel = (product: Product, language: Language = "en") => {
  if (language === "ar") {
    switch (product.category.slug) {
      case "gift-cards":
        return "بطاقة هدايا";
      case "subscriptions":
        return "اشتراك ألعاب";
      case "in-game-currency":
        return "عملة داخل اللعبة";
      default:
        return "لعبة كاملة (كود رقمي)";
    }
  }

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

export const getPlatformRedeemLabel = (platformName: string, language: Language = "en") => {
  if (language === "ar") {
    return `التفعيل على ${platformName}`;
  }

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

export const getLocalizedCategoryName = (product: Product, language: Language = "en") => {
  if (language === "en") {
    return product.category.name;
  }

  switch (product.category.slug) {
    case "pc-games":
      return "ألعاب PC";
    case "console-games":
      return "ألعاب الكونسول";
    case "gift-cards":
      return "بطاقات هدايا";
    case "subscriptions":
      return "اشتراكات";
    case "in-game-currency":
      return "عملات داخل الألعاب";
    default:
      return product.category.name;
  }
};

export const getLocalizedProductShortDescription = (
  product: Product,
  language: Language = "en"
) => {
  if (language === "en") {
    return product.shortDescription;
  }

  if (product.type === "GAME_KEY") {
    return `${product.name} كود لعبة رقمي مع تسليم فوري.`;
  }

  if (product.type === "GIFT_CARD" || product.type === "WALLET_TOP_UP") {
    return `${product.name} رصيد رقمي موثق مع تسليم فوري.`;
  }

  if (product.type === "SUBSCRIPTION") {
    return `${product.name} وصول اشتراك مع تسليم رقمي فوري.`;
  }

  if (product.type === "IN_GAME_CURRENCY") {
    return `${product.name} شحن رقمي مع تسليم فوري.`;
  }

  return `${product.name} منتج رقمي موثق مع تسليم فوري.`;
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
