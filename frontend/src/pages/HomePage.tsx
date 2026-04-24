import { HeroBanner } from "../components/home/HeroBanner";
import { HowItWorks } from "../components/home/HowItWorks";
import { PlatformShowcase } from "../components/home/PlatformShowcase";
import { ProductShelf } from "../components/home/ProductShelf";
import { SocialProof } from "../components/home/SocialProof";
import { TrustSystem } from "../components/home/TrustSystem";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { useFeaturedProducts, useHotDeals, useProducts } from "../hooks/useProducts";
import { useTranslation } from "../store/language.store";
import type { Product } from "../types/product.types";
import { uniqueProducts } from "../utils/storefront";

const byCategory = (products: Product[], slug: string) =>
  products.filter((product) => product.category.slug === slug);

export const HomePage = () => {
  const { t } = useTranslation();
  const featured = useFeaturedProducts();
  const deals = useHotDeals();
  const catalog = useProducts({ limit: 50, sort: "popular" });

  const catalogItems = catalog.data?.items ?? [];
  const heroProducts = uniqueProducts([
    ...(featured.data ?? []),
    ...(deals.data ?? []),
    ...catalogItems
  ]);
  const featuredDeals = uniqueProducts([...(deals.data ?? []), ...(featured.data ?? [])]).slice(0, 4);
  const spotlightProducts = heroProducts.slice(0, 3);
  const trendingNow = uniqueProducts([
    ...catalogItems.filter((product) => product.isHot || product.isNew),
    ...catalogItems
  ]).slice(0, 4);
  const giftCards = byCategory(catalogItems, "gift-cards").slice(0, 4);
  const subscriptions = byCategory(catalogItems, "subscriptions").slice(0, 4);
  const inGameCurrency = byCategory(catalogItems, "in-game-currency").slice(0, 4);
  const isLoading = featured.isLoading || deals.isLoading || catalog.isLoading;

  return (
    <>
      <HeroBanner spotlightProducts={spotlightProducts} showcaseProducts={heroProducts} />
      <TrustSystem />
      <HowItWorks />

      {isLoading ? <LoadingSpinner /> : null}

      <ProductShelf
        eyebrow={t("shelf.featured.eyebrow")}
        title={t("shelf.featured.title")}
        description={t("shelf.featured.description")}
        products={featuredDeals}
        linkTo="/store?sort=sale"
        linkLabel={t("shelf.featured.link")}
      />

      <PlatformShowcase />

      <ProductShelf
        eyebrow={t("shelf.trending.eyebrow")}
        title={t("shelf.trending.title")}
        description={t("shelf.trending.description")}
        products={trendingNow}
        linkTo="/store"
        linkLabel={t("shelf.trending.link")}
      />

      <SocialProof />

      <ProductShelf
        eyebrow={t("shelf.giftCards.eyebrow")}
        title={t("shelf.giftCards.title")}
        description={t("shelf.giftCards.description")}
        products={giftCards}
        linkTo="/store?category=gift-cards"
        linkLabel={t("shelf.giftCards.link")}
      />

      <ProductShelf
        eyebrow={t("shelf.subscriptions.eyebrow")}
        title={t("shelf.subscriptions.title")}
        description={t("shelf.subscriptions.description")}
        products={subscriptions}
        linkTo="/store?category=subscriptions"
        linkLabel={t("shelf.subscriptions.link")}
      />

      <ProductShelf
        eyebrow={t("shelf.currency.eyebrow")}
        title={t("shelf.currency.title")}
        description={t("shelf.currency.description")}
        products={inGameCurrency}
        linkTo="/store?category=in-game-currency"
        linkLabel={t("shelf.currency.link")}
      />
    </>
  );
};
