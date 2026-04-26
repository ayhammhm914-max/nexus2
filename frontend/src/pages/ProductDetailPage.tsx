import { useEffect, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Clock3,
  ExternalLink,
  Gift,
  PlayCircle,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { ProductRail } from "../components/product/ProductRail";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { PriceDisplay } from "../components/ui/PriceDisplay";
import {
  useFeaturedProducts,
  useHotDeals,
  useProduct,
  useRelatedProducts
} from "../hooks/useProducts";
import { useCartStore } from "../store/cart.store";
import { uniqueProducts } from "../utils/storefront";
import {
  getProductGallery,
  getProductNarrative,
  getProductRegionLabel,
  getRedeemSteps,
  getYoutubeSearchUrl
} from "../utils/productExperience";
import { useTranslation } from "../store/language.store";
import { getLocalizedCategoryName } from "../utils/storefront";

export const ProductDetailPage = () => {
  const { slug = "" } = useParams();
  const { data, isLoading } = useProduct(slug);
  const relatedProducts = useRelatedProducts(data?.id);
  const featuredProducts = useFeaturedProducts();
  const hotDeals = useHotDeals();
  const addItem = useCartStore((state) => state.addItem);
  const [activeImage, setActiveImage] = useState<string>("");
  const { t, language, dir } = useTranslation();

  useEffect(() => {
    if (!data) {
      return;
    }

    const firstImage = getProductGallery(data)[0] ?? data.coverImageUrl ?? data.thumbnailUrl ?? "";
    setActiveImage(firstImage);
  }, [data]);

  if (isLoading || !data) {
    return <LoadingSpinner />;
  }

  const gallery = getProductGallery(data);
  const narrative = getProductNarrative(data, language);
  const redeemSteps = getRedeemSteps(data, language);
  const similarProducts = (relatedProducts.data ?? []).filter((product) => product.id !== data.id).slice(0, 8);
  const mayLikeProducts = uniqueProducts([
    ...(featuredProducts.data ?? []),
    ...(hotDeals.data ?? []),
    ...(relatedProducts.data ?? [])
  ])
    .filter((product) => product.id !== data.id && !similarProducts.some((item) => item.id === product.id))
    .slice(0, 8);
  const youtubeUrl = getYoutubeSearchUrl(data);
  const regionLabel = getProductRegionLabel(data.region, language);
  const categoryLabel = getLocalizedCategoryName(data, language);
  const reviews = (data.reviews ?? []).slice(0, 3);
  const rawTrailerVideoId = data.trailerVideoId?.trim() ?? "";
  const trailerVideoId = /^[a-zA-Z0-9_-]{11}$/.test(rawTrailerVideoId) ? rawTrailerVideoId : "";
  const trailerEmbedUrl = trailerVideoId
    ? `https://www.youtube.com/embed/${trailerVideoId}?autoplay=1&mute=1&loop=1&playlist=${trailerVideoId}&controls=0&showinfo=0&rel=0&disablekb=1&modestbranding=1&iv_load_policy=3&start=3&playsinline=1`
    : "";

  return (
    <div className="relative overflow-hidden">
      {trailerEmbedUrl ? (
        <div className="product-trailer-bg" aria-hidden="true">
          <iframe
            src={trailerEmbedUrl}
            allow="autoplay; encrypted-media"
            allowFullScreen
            title={t("detail.trailerBackgroundTitle")}
          />
          <div className="trailer-overlay-sides" />
          <div className="trailer-overlay-bottom" />
          <div className="trailer-overlay-top" />
        </div>
      ) : (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_top_left,rgba(0,212,255,0.18),transparent_42%),radial-gradient(circle_at_top_right,rgba(124,58,237,0.16),transparent_40%),linear-gradient(180deg,rgba(8,12,22,0.9),rgba(8,12,22,0))]" />
      )}

      <section className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16" dir={dir}>
        <div className="mb-8 flex flex-wrap items-center gap-3 text-sm text-muted">
          <Link to="/" className="transition hover:text-white">
            {t("detail.home")}
          </Link>
          <span>/</span>
          <Link to="/store" className="transition hover:text-white">
            {t("detail.store")}
          </Link>
          <span>/</span>
          <span className="text-white">{data.name}</span>
        </div>

        <div className="grid gap-10 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-[34px] border border-white/10 bg-panel shadow-card">
              <div className="relative aspect-[4/5] overflow-hidden bg-slate-950">
                {activeImage ? (
                  <img
                    src={activeImage}
                    alt={data.name}
                    className="h-full w-full object-cover"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/5 to-transparent" />
                <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                  <Badge tone="accent">{narrative.eyebrow}</Badge>
                  <Badge>{data.platform.name}</Badge>
                  <Badge tone="gold">{regionLabel}</Badge>
                </div>
              </div>
            </div>

            {gallery.length > 1 ? (
              <div className="grid grid-cols-4 gap-3">
                {gallery.slice(0, 4).map((image) => (
                  <button
                    key={image}
                    type="button"
                    onClick={() => setActiveImage(image)}
                    className={`overflow-hidden rounded-[22px] border ${
                      activeImage === image ? "border-primary shadow-glow-blue" : "border-white/10"
                    } bg-panel transition`}
                  >
                    <img src={image} alt={data.name} className="aspect-[4/5] w-full object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge tone="accent">{t("detail.instantDelivery")}</Badge>
                <Badge>{t("detail.officialProduct")}</Badge>
                <Badge tone="gold">{t("detail.singleSeller")}</Badge>
              </div>

              <h1 className="max-w-4xl font-display text-4xl leading-tight text-white sm:text-5xl">
                {data.name}
              </h1>

              <p className="max-w-2xl text-base leading-8 text-slate-200">{narrative.lead}</p>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-panel/85 p-6 shadow-card">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-3">
                  <PriceDisplay basePrice={data.basePrice} salePrice={data.salePrice} />
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
                    <span className="inline-flex items-center gap-2">
                      <Clock3 className="h-4 w-4 text-primary" />
                      {t("detail.deliverySeconds")}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-accent" />
                      {t("detail.digitalStock")}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button className="gap-2" onClick={() => addItem(data)} disabled={data.stock <= 0}>
                    <ShoppingCart className="h-4 w-4" />
                    {data.stock > 0 ? t("product.addToCart") : t("product.outOfStock")}
                  </Button>
                  <Link
                    to="/store"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-primary/40 hover:bg-white/10"
                  >
                    {t("detail.browseStore")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: t("detail.platform"), value: data.platform.name, icon: BadgeCheck },
                { label: t("detail.region"), value: regionLabel, icon: Gift },
                { label: t("detail.stock"), value: `${data.stock} ${t("detail.available")}`, icon: Sparkles },
                { label: t("detail.category"), value: categoryLabel, icon: ShieldCheck }
              ].map((item) => (
                <article
                  key={item.label}
                  className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5"
                >
                  <item.icon className="h-4 w-4 text-primary" />
                  <div className="mt-3 text-[11px] uppercase tracking-[0.25em] text-muted">{item.label}</div>
                  <div className="mt-2 text-sm font-semibold text-white">{item.value}</div>
                </article>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                t("detail.confidence1"),
                t("detail.confidence2"),
                t("detail.confidence3")
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-muted"
                >
                  <span className="mr-2 text-primary">-</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-14 grid gap-8 xl:grid-cols-[1.02fr_0.98fr]">
          <div className="space-y-8">
            <section className="rounded-[32px] border border-white/10 bg-panel/80 p-8 shadow-card">
              <div className="text-xs uppercase tracking-[0.3em] text-primary">{t("detail.aboutEyebrow")}</div>
              <h2 className="mt-3 font-display text-3xl text-white">{t("detail.aboutTitle")}</h2>
              <p className="mt-4 text-sm leading-8 text-muted">{narrative.overview}</p>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {narrative.bullets.map((bullet) => (
                  <div
                    key={bullet}
                    className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 text-sm leading-7 text-slate-200"
                  >
                    <Check className="mb-3 h-4 w-4 text-accent" />
                    {bullet}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[32px] border border-white/10 bg-panel/80 p-8 shadow-card">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.3em] text-primary">{t("detail.trailerEyebrow")}</div>
                  <h2 className="mt-3 font-display text-3xl text-white">{t("detail.trailerTitle")}</h2>
                  <p className="mt-3 max-w-3xl text-sm leading-8 text-muted">
                    {t("detail.trailerBody")}
                  </p>
                </div>

                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-primary/15"
                >
                  <PlayCircle className="h-4 w-4 text-primary" />
                  {t("detail.watchYoutube")}
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>

              <div className="mt-8 overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(0,212,255,0.15),rgba(124,58,237,0.14),rgba(12,18,32,0.95))] p-8">
                <div className="max-w-3xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-200">
                    <PlayCircle className="h-3.5 w-3.5 text-primary" />
                    {t("detail.trailerSearch")}
                  </div>
                  <h3 className="mt-5 font-display text-2xl text-white">{data.name}</h3>
                  <p className="mt-3 text-sm leading-8 text-slate-200">
                    {t("detail.trailerCardBody")}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[32px] border border-white/10 bg-panel/80 p-8 shadow-card">
              <div className="text-xs uppercase tracking-[0.3em] text-primary">{t("detail.howEyebrow")}</div>
              <h2 className="mt-3 font-display text-3xl text-white">{t("detail.howTitle")}</h2>
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {redeemSteps.map((step, index) => (
                  <article
                    key={step.title}
                    className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                      {index + 1}
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-white">{step.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-muted">{step.description}</p>
                  </article>
                ))}
              </div>
            </section>

            {reviews.length ? (
              <section className="rounded-[32px] border border-white/10 bg-panel/80 p-8 shadow-card">
                <div className="text-xs uppercase tracking-[0.3em] text-primary">{t("detail.feedbackEyebrow")}</div>
                <h2 className="mt-3 font-display text-3xl text-white">{t("detail.feedbackTitle")}</h2>
                <div className="mt-8 grid gap-4">
                  {reviews.map((review) => (
                    <article
                      key={review.id}
                      className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="font-semibold text-white">{review.title}</div>
                          <div className="mt-1 text-sm text-muted">@{review.user.username}</div>
                        </div>
                        <div className="inline-flex items-center gap-1 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-sm text-yellow-200">
                          <Star className="h-4 w-4 fill-current" />
                          {review.rating}/5
                        </div>
                      </div>
                      <p className="mt-4 text-sm leading-7 text-slate-200">{review.body}</p>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <div className="space-y-8">
            <section className="rounded-[32px] border border-white/10 bg-panel/80 p-8 shadow-card">
              <div className="text-xs uppercase tracking-[0.3em] text-primary">{t("detail.whatYouGet")}</div>
              <h2 className="mt-3 font-display text-3xl text-white">{t("detail.whatYouGetTitle")}</h2>
              <div className="mt-6 space-y-4">
                {narrative.includes.map((item) => (
                  <div
                    key={item}
                    className="flex gap-3 rounded-[20px] border border-white/10 bg-white/[0.04] p-4 text-sm leading-7 text-slate-200"
                  >
                    <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-accent" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[32px] border border-white/10 bg-panel/80 p-8 shadow-card">
              <div className="text-xs uppercase tracking-[0.3em] text-primary">{t("detail.redemption")}</div>
              <h2 className="mt-3 font-display text-3xl text-white">{t("detail.redemptionTitle")}</h2>
              <div className="mt-6 rounded-[24px] border border-primary/20 bg-primary/10 p-5 text-sm leading-8 text-slate-100">
                {narrative.platformRedeem}
              </div>
              <div className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.04] p-5 text-sm leading-8 text-muted">
                {t("detail.digitalForm")}
              </div>
            </section>

            <section className="rounded-[32px] border border-white/10 bg-panel/80 p-8 shadow-card">
              <div className="text-xs uppercase tracking-[0.3em] text-primary">{t("detail.why")}</div>
              <h2 className="mt-3 font-display text-3xl text-white">{t("detail.whyTitle")}</h2>
              <div className="mt-6 space-y-4">
                {[
                  t("detail.why1"),
                  t("detail.why2"),
                  t("detail.why3"),
                  t("detail.why4")
                ].map((item) => (
                  <div key={item} className="rounded-[20px] border border-white/10 bg-white/[0.04] p-4 text-sm leading-7 text-slate-200">
                    {item}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[32px] border border-white/10 bg-panel/80 p-8 shadow-card">
              <div className="text-xs uppercase tracking-[0.3em] text-primary">{t("detail.answers")}</div>
              <h2 className="mt-3 font-display text-3xl text-white">{t("detail.answersTitle")}</h2>
              <div className="mt-6 space-y-4">
                {narrative.faqs.map((faq) => (
                  <article key={faq.question} className="rounded-[22px] border border-white/10 bg-white/[0.04] p-5">
                    <h3 className="text-base font-semibold text-white">{faq.question}</h3>
                    <p className="mt-2 text-sm leading-7 text-muted">{faq.answer}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>

        <div className="mt-16 space-y-16">
          <ProductRail
            eyebrow={t("detail.similarEyebrow")}
            title={t("detail.similarTitle")}
            description={t("detail.similarDescription")}
            products={similarProducts}
          />

          <ProductRail
            eyebrow={t("detail.mayLikeEyebrow")}
            title={t("detail.mayLikeTitle")}
            description={t("detail.mayLikeDescription")}
            products={mayLikeProducts}
          />
        </div>
      </section>
    </div>
  );
};
