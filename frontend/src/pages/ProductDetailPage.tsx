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

export const ProductDetailPage = () => {
  const { slug = "" } = useParams();
  const { data, isLoading } = useProduct(slug);
  const relatedProducts = useRelatedProducts(data?.id);
  const featuredProducts = useFeaturedProducts();
  const hotDeals = useHotDeals();
  const addItem = useCartStore((state) => state.addItem);
  const [activeImage, setActiveImage] = useState<string>("");

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
  const narrative = getProductNarrative(data);
  const redeemSteps = getRedeemSteps(data);
  const similarProducts = (relatedProducts.data ?? []).filter((product) => product.id !== data.id).slice(0, 8);
  const mayLikeProducts = uniqueProducts([
    ...(featuredProducts.data ?? []),
    ...(hotDeals.data ?? []),
    ...(relatedProducts.data ?? [])
  ])
    .filter((product) => product.id !== data.id && !similarProducts.some((item) => item.id === product.id))
    .slice(0, 8);
  const youtubeUrl = getYoutubeSearchUrl(data);
  const regionLabel = getProductRegionLabel(data.region);
  const reviews = (data.reviews ?? []).slice(0, 3);

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_top_left,rgba(0,212,255,0.18),transparent_42%),radial-gradient(circle_at_top_right,rgba(124,58,237,0.16),transparent_40%),linear-gradient(180deg,rgba(8,12,22,0.9),rgba(8,12,22,0))]" />

      <section className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="mb-8 flex flex-wrap items-center gap-3 text-sm text-muted">
          <Link to="/" className="transition hover:text-white">
            Home
          </Link>
          <span>/</span>
          <Link to="/store" className="transition hover:text-white">
            Store
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
                <Badge tone="accent">Instant delivery</Badge>
                <Badge>Full game or official digital product</Badge>
                <Badge tone="gold">Single-seller guarantee</Badge>
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
                      Usually delivered in seconds
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-accent" />
                      Verified digital stock
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button className="gap-2" onClick={() => addItem(data)} disabled={data.stock <= 0}>
                    <ShoppingCart className="h-4 w-4" />
                    {data.stock > 0 ? "Add To Cart" : "Out of Stock"}
                  </Button>
                  <Link
                    to="/store"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-primary/40 hover:bg-white/10"
                  >
                    Browse Store
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Platform", value: data.platform.name, icon: BadgeCheck },
                { label: "Region", value: regionLabel, icon: Gift },
                { label: "Stock", value: `${data.stock} available`, icon: Sparkles },
                { label: "Category", value: data.category.name, icon: ShieldCheck }
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
                "Buy with confidence from one verified digital seller",
                "You are buying the actual product, delivered as a digital code",
                "Secure checkout and straightforward redemption guidance"
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
              <div className="text-xs uppercase tracking-[0.3em] text-primary">About This Product</div>
              <h2 className="mt-3 font-display text-3xl text-white">Clarity first, then instant access.</h2>
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
                  <div className="text-xs uppercase tracking-[0.3em] text-primary">Trailer & Media</div>
                  <h2 className="mt-3 font-display text-3xl text-white">See the game or product in action.</h2>
                  <p className="mt-3 max-w-3xl text-sm leading-8 text-muted">
                    If there is an official trailer or gameplay video on YouTube, this shortcut takes the customer there
                    immediately with the correct search already prepared.
                  </p>
                </div>

                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-primary/15"
                >
                  <PlayCircle className="h-4 w-4 text-primary" />
                  Watch On YouTube
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>

              <div className="mt-8 overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(0,212,255,0.15),rgba(124,58,237,0.14),rgba(12,18,32,0.95))] p-8">
                <div className="max-w-3xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-200">
                    <PlayCircle className="h-3.5 w-3.5 text-primary" />
                    Official trailer search
                  </div>
                  <h3 className="mt-5 font-display text-2xl text-white">{data.name}</h3>
                  <p className="mt-3 text-sm leading-8 text-slate-200">
                    Customers can preview gameplay, story, graphics, or redemption-related explainers before checkout,
                    which adds trust and makes the product easier to understand for non-experts.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[32px] border border-white/10 bg-panel/80 p-8 shadow-card">
              <div className="text-xs uppercase tracking-[0.3em] text-primary">How It Works</div>
              <h2 className="mt-3 font-display text-3xl text-white">Buy - receive code - redeem - use instantly.</h2>
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
                <div className="text-xs uppercase tracking-[0.3em] text-primary">Customer Feedback</div>
                <h2 className="mt-3 font-display text-3xl text-white">Real reactions from NEXUS buyers.</h2>
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
              <div className="text-xs uppercase tracking-[0.3em] text-primary">What You Get</div>
              <h2 className="mt-3 font-display text-3xl text-white">Everything clearly spelled out.</h2>
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
              <div className="text-xs uppercase tracking-[0.3em] text-primary">Redemption Guidance</div>
              <h2 className="mt-3 font-display text-3xl text-white">Simple enough for any customer.</h2>
              <div className="mt-6 rounded-[24px] border border-primary/20 bg-primary/10 p-5 text-sm leading-8 text-slate-100">
                {narrative.platformRedeem}
              </div>
              <div className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.04] p-5 text-sm leading-8 text-muted">
                You are buying the actual product in digital form. The only difference is delivery: instead of a box or
                download installer, you receive a code and redeem it on the correct platform.
              </div>
            </section>

            <section className="rounded-[32px] border border-white/10 bg-panel/80 p-8 shadow-card">
              <div className="text-xs uppercase tracking-[0.3em] text-primary">Why NEXUS</div>
              <h2 className="mt-3 font-display text-3xl text-white">Premium storefront, not a random marketplace.</h2>
              <div className="mt-6 space-y-4">
                {[
                  "Single-seller quality control on every listed product",
                  "Premium, clear product pages that explain exactly what customers are buying",
                  "Fast order flow built around secure digital delivery",
                  "Support-ready structure for activation questions or redemption help"
                ].map((item) => (
                  <div key={item} className="rounded-[20px] border border-white/10 bg-white/[0.04] p-4 text-sm leading-7 text-slate-200">
                    {item}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[32px] border border-white/10 bg-panel/80 p-8 shadow-card">
              <div className="text-xs uppercase tracking-[0.3em] text-primary">Quick Answers</div>
              <h2 className="mt-3 font-display text-3xl text-white">Questions customers usually ask.</h2>
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
            eyebrow="Similar Products"
            title="Close matches for this item."
            description="Related picks from the same platform or category so the customer can compare confidently without leaving the buying flow."
            products={similarProducts}
          />

          <ProductRail
            eyebrow="You May Like"
            title="Other strong picks from the NEXUS catalog."
            description="Featured deals, trusted sellers, and popular digital products that fit the same audience and buying intent."
            products={mayLikeProducts}
          />
        </div>
      </section>
    </div>
  );
};
