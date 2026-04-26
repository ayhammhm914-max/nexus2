import { motion } from "framer-motion";
import { ArrowRight, Lock, ShieldCheck, Sparkles, TimerReset, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "../../store/language.store";
import type { Product } from "../../types/product.types";
import { getPlatformRedeemLabel, getProductOfferLabel } from "../../utils/storefront";
import { Button } from "../ui/Button";
import { PriceDisplay } from "../ui/PriceDisplay";
import { HeroCinematicBackground } from "./HeroCinematicBackground";
import { HeroGameCarousel } from "./HeroGameCarousel";

type HeroBannerProps = {
  spotlightProducts: Product[];
  showcaseProducts: Product[];
};

export const HeroBanner = ({ spotlightProducts, showcaseProducts }: HeroBannerProps) => {
  const products = spotlightProducts.slice(0, 3);
  const { t, dir, language } = useTranslation();
  const deliverySteps = [
    t("hero.delivery.buy"),
    t("hero.delivery.receive"),
    t("hero.delivery.redeem"),
    t("hero.delivery.play")
  ];

  return (
    <section className="relative overflow-hidden border-b border-white/10">
      <HeroCinematicBackground />

      <div className="grid min-h-[720px] w-full items-center gap-10 px-4 py-16 sm:px-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(300px,0.56fr)_minmax(300px,0.6fr)] lg:px-12 xl:gap-12 xl:px-16 2xl:grid-cols-[minmax(0,0.92fr)_minmax(390px,0.62fr)_minmax(360px,0.66fr)]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-[45rem] justify-self-start"
          dir={dir}
        >
          <div className="inline-flex rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-primary">
            {t("hero.badge")}
          </div>

          <h1 className="mt-8 font-display text-5xl leading-[1.02] text-white sm:text-6xl xl:text-6xl 2xl:text-7xl">
            {t("hero.title")}
            <span className="gradient-text">{t("hero.titleAccent")}</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
            {t("hero.description")}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-slate-100">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
              <Sparkles className="h-4 w-4 text-primary" />
              {t("hero.chip.fullGames")}
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
              <TimerReset className="h-4 w-4 text-accent" />
              {t("hero.chip.instant")}
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
              <Lock className="h-4 w-4 text-gold" />
              {t("hero.chip.secure")}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/store">
              <Button className="px-7 py-4 text-base">
                {t("hero.cta.primary")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/store?sort=sale">
              <Button variant="ghost" className="px-7 py-4 text-base">
                {t("hero.cta.secondary")}
              </Button>
            </Link>
          </div>

          <div className="mt-10 rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
            <div className="text-xs uppercase tracking-[0.28em] text-muted">{t("hero.delivery.title")}</div>
            <div className="mt-4 grid gap-3 sm:grid-cols-4">
              {deliverySteps.map((step, index) => (
                <div key={step} className="rounded-2xl border border-white/10 bg-background/60 px-4 py-4">
                  <div className="text-[11px] uppercase tracking-[0.28em] text-primary">
                    0{index + 1}
                  </div>
                  <div className="mt-2 text-sm font-medium text-white">{step}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/[0.08] px-4 py-4 text-sm leading-7 text-slate-100">
              <ShieldCheck className="mt-1 h-4 w-4 flex-none text-primary" />
              {t("hero.delivery.note")} <strong>{t("hero.delivery.label")}</strong>.
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.08 }}
          className="relative z-10"
        >
          <HeroGameCarousel products={showcaseProducts} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative z-10"
        >
          <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.04] p-5 shadow-card lg:p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.08] via-transparent to-secondary/[0.1]" />
            <div className="relative">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.28em] text-primary">{t("hero.preview.eyebrow")}</div>
                  <h2 className="mt-3 font-display text-3xl text-white">{t("hero.preview.title")}</h2>
                </div>
                <div className="hidden rounded-full border border-white/10 bg-background/60 px-4 py-2 text-xs uppercase tracking-[0.24em] text-muted sm:block">
                  {t("hero.preview.badge")}
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {products.length ? (
                  products.map((product) => (
                    <article
                      key={product.id}
                      className="rounded-[28px] border border-white/10 bg-background/70 p-5 shadow-card"
                    >
                      <div className="flex items-start gap-4">
                        <img
                          src={product.thumbnailUrl ?? product.coverImageUrl ?? ""}
                          alt={product.name}
                          className="h-24 w-20 rounded-2xl object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-primary">
                              {product.platform.name}
                            </span>
                            <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-accent">
                              {t("hero.preview.instant")}
                            </span>
                          </div>
                          <h3 className="mt-3 text-lg font-semibold text-white">{product.name}</h3>
                          <p className="mt-2 text-xs uppercase tracking-[0.22em] text-muted">
                            {getProductOfferLabel(product, language)}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-muted">
                            {getPlatformRedeemLabel(product.platform.name, language)}
                          </p>
                          <div className="mt-4 flex items-center justify-between gap-3">
                            <PriceDisplay basePrice={product.basePrice} salePrice={product.salePrice} />
                            <div className="text-right text-[11px] uppercase tracking-[0.22em] text-muted">
                              {t("hero.preview.verified")}
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="skeleton h-32 rounded-[28px] border border-white/10" />
                  ))
                )}
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div className="rounded-[24px] border border-white/10 bg-background/60 p-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-muted">{t("hero.metric.delivery")}</div>
                  <div className="mt-2 font-display text-2xl text-white">29s</div>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-background/60 p-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-muted">{t("hero.metric.rating")}</div>
                  <div className="mt-2 font-display text-2xl text-white">4.9/5</div>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-background/60 p-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-muted">{t("hero.metric.fulfillment")}</div>
                  <div className="mt-2 inline-flex items-center gap-2 font-medium text-white">
                    <Zap className="h-4 w-4 text-primary" />
                    {t("hero.metric.instantDigital")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
