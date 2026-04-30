import { clsx } from "clsx";
import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { Heart, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useCartStore } from "../../store/cart.store";
import { useTranslation } from "../../store/language.store";
import type { Product } from "../../types/product.types";
import { calculateDiscount, truncate } from "../../utils/format";
import {
  getLocalizedProductShortDescription,
  getPlatformRedeemLabel,
  getProductOfferLabel
} from "../../utils/storefront";
import { getPlaceholderCoverUrl, getProductPrimaryImage } from "../../utils/productMedia";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { PriceDisplay } from "../ui/PriceDisplay";

export const ProductCard = ({
  product,
  className
}: {
  product: Product;
  className?: string;
}) => {
  const addItem = useCartStore((state) => state.addItem);
  const { t, language, dir } = useTranslation();
  const discount = calculateDiscount(product.basePrice, product.salePrice);
  const platformAccent = product.platform.color ?? "#00D4FF";
  const productOfferLabel = getProductOfferLabel(product, language);
  const productDescription = getLocalizedProductShortDescription(product, language);
  const productTrustLine = product.stock <= 8 ? t("product.sellingFast") : t("product.verifiedStock");
  const platformRedeemLabel = getPlatformRedeemLabel(product.platform.name, language);
  const productImage = getProductPrimaryImage(product);
  const fallbackImage = getPlaceholderCoverUrl(product.slug || product.name);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      style={
        {
          "--platform-accent": platformAccent
        } as CSSProperties
      }
      className={clsx(
        "card-hover group relative overflow-hidden rounded-[28px] border border-white/10 bg-panel/80 shadow-card",
        className
      )}
      dir={dir}
    >
      <Link
        to={`/products/${product.slug}`}
        aria-label={`${t("product.openDetails")}: ${product.name}`}
        className="absolute inset-0 z-10 rounded-[28px]"
      />

      <div className="relative z-20 pointer-events-none aspect-[4/5] overflow-hidden">
        <img
          src={productImage}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(event) => {
            const img = event.currentTarget;
            if (img.src !== fallbackImage) {
              img.src = fallbackImage;
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span
            className="inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em]"
            style={{
              borderColor: `${platformAccent}66`,
              backgroundColor: `${platformAccent}22`,
              color: platformAccent
            }}
          >
            {product.platform.name}
          </span>
          <Badge tone="accent">{t("product.instant")}</Badge>
        </div>
        <button
          aria-label={`${t("product.addWishlist")}: ${product.name}`}
          aria-pressed="false"
          className="pointer-events-auto absolute right-4 top-4 rounded-full border border-white/15 bg-background/50 p-2 text-white"
          type="button"
        >
          <Heart className="h-4 w-4" />
        </button>
        {discount ? (
          <div className="absolute bottom-4 left-4">
            <Badge tone="danger">-{discount}%</Badge>
          </div>
        ) : null}
      </div>
      <div className="relative z-20 space-y-4 p-5">
        <div className="space-y-3 pointer-events-none">
          <div className="flex flex-wrap gap-2">
            <Badge>{productOfferLabel}</Badge>
            <Badge tone={product.stock <= 8 ? "gold" : "default"}>{productTrustLine}</Badge>
          </div>
          <h3 className="block text-lg font-semibold leading-7 text-white">{truncate(product.name, 58)}</h3>
          <p className="text-sm leading-6 text-muted">{truncate(productDescription, 88)}</p>
        </div>

        <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
          <div className="text-[11px] uppercase tracking-[0.22em] text-muted">
            {platformRedeemLabel}
          </div>
          <div className="mt-2 text-sm font-medium text-white">{productOfferLabel}</div>
          <div className="mt-1 text-xs uppercase tracking-[0.22em] text-muted">
            {product.isHot ? t("product.hotDeal") : product.isNew ? t("product.newArrival") : t("product.trustedStock")}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <PriceDisplay basePrice={product.basePrice} salePrice={product.salePrice} />
          <Button
            className="pointer-events-auto gap-2"
            onClick={() => addItem(product)}
            disabled={!product.stock}
          >
            <ShoppingCart className="h-4 w-4" />
            {product.stock ? t("product.addToCart") : t("product.soldOut")}
          </Button>
        </div>
      </div>
    </motion.article>
  );
};
