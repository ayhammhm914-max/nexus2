import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "framer-motion";
import {
  Award,
  BadgeCheck,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Code2,
  ExternalLink,
  Gamepad2,
  GaugeCircle,
  Globe2,
  Heart,
  Languages,
  ListOrdered,
  MonitorPlay,
  Pause,
  Play,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Store,
  Trophy,
  TriangleAlert,
  Volume2,
  VolumeX,
  Zap
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { fallbackTrailerVideoIds } from "../data/fallbackTrailerVideoIds";
import { useProduct, useRelatedProducts } from "../hooks/useProducts";
import { useCartStore } from "../store/cart.store";
import { useTranslation } from "../store/language.store";
import { formatCurrency } from "../utils/format";
import {
  getProductGallery,
  getProductNarrative,
  getProductRegionLabel,
  getRedeemSteps,
  getYoutubeSearchUrl,
  toStringArray
} from "../utils/productExperience";
import {
  getPlaceholderCoverUrl,
  getPlaceholderThumbUrl,
  getProductPrimaryImage,
  getProductWatermarkImage,
  isCardLikeProduct
} from "../utils/productMedia";
import {
  getLocalizedCategoryName,
  getPlatformRedeemLabel,
  getProductOfferLabel,
  uniqueProducts
} from "../utils/storefront";

const useIsMobileViewport = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return isMobile;
};

const platformIconLabels = ["PC", "PS", "XB", "NS"];

type EditionKey = "standard" | "deluxe" | "complete";

const clampPrice = (value: number) => Math.max(0, Math.round(value * 100) / 100);

const getPlatformBadge = (platformSlug: string) => {
  const normalized = platformSlug.toLowerCase();
  if (normalized.includes("playstation") || normalized === "ps" || normalized.startsWith("ps")) return "PS";
  if (normalized.includes("xbox") || normalized === "xbox") return "XB";
  if (normalized.includes("nintendo") || normalized.includes("switch")) return "NS";
  return "PC";
};

export const ProductDetailPage = () => {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useProduct(slug);
  const relatedProducts = useRelatedProducts(data?.id);
  const addItem = useCartStore((state) => state.addItem);
  const { t, language, dir } = useTranslation();
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobileViewport();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [activeEdition, setActiveEdition] = useState<EditionKey>("standard");
  const [activePlatformFilter, setActivePlatformFilter] = useState<string | null>(null);
  const [activationOpen, setActivationOpen] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistToast, setWishlistToast] = useState<string | null>(null);
  const [aboutExpanded, setAboutExpanded] = useState(false);

  useEffect(() => {
    setAboutExpanded(false);
  }, [slug]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    video.muted = isMuted;
    if (isPaused || prefersReducedMotion || isMobile) {
      video.pause();
      return;
    }

    void video.play().catch(() => undefined);
  }, [isMobile, isMuted, isPaused, prefersReducedMotion]);

  if (isLoading || !data) {
    return <LoadingSpinner />;
  }

  const editionLabels: Record<EditionKey, string> = {
    standard: language === "ar" ? "ستاندرد" : "Standard",
    deluxe: language === "ar" ? "ديلوكس" : "Deluxe",
    complete: language === "ar" ? "كومبليت" : "Complete"
  };

  const editionConfigs: Record<EditionKey, { multiplier: number; stockDelta: number }> = {
    standard: { multiplier: 1, stockDelta: 0 },
    deluxe: { multiplier: 1.15, stockDelta: -2 },
    complete: { multiplier: 1.28, stockDelta: -6 }
  };

  const gallery = getProductGallery(data);
  const primaryImage = getProductPrimaryImage(data);
  const posterImage = gallery[0] ?? primaryImage ?? data.coverImageUrl ?? data.thumbnailUrl ?? "";
  const posterFallbackImage = getPlaceholderThumbUrl(data.slug || data.name);
  const cardFallbackImage = getPlaceholderCoverUrl(data.slug || data.name);
  const watermarkImage = getProductWatermarkImage(data);
  const isCardProduct = isCardLikeProduct(data);
  const narrative = getProductNarrative(data, language);
  const regionLabel = getProductRegionLabel(data.region, language);
  const categoryLabel = getLocalizedCategoryName(data, language);
  const offerLabel = getProductOfferLabel(data, language);
  const platformRedeem = getPlatformRedeemLabel(data.platform.name, language);
  const youtubeUrl = getYoutubeSearchUrl(data);
  const tags = toStringArray(data.tags);
  const genreLabel = tags[0]?.replace(/-/g, " ") ?? offerLabel;
  const summaryTags = (tags.length ? tags : [genreLabel, data.type])
    .map((tag) => tag.replace(/-/g, " "))
    .slice(0, 4);
  const summaryDescription = data.shortDescription || narrative.lead;
  const gameAccentColor = data.platform.color ?? "#00d4ff";
  const rawTrailerVideoId = (data.trailerVideoId ?? fallbackTrailerVideoIds[data.slug] ?? "").trim();
  const trailerVideoId = /^[a-zA-Z0-9_-]{11}$/.test(rawTrailerVideoId) ? rawTrailerVideoId : "";
  const trailerVideoUrl =
    "trailerVideoUrl" in data && typeof data.trailerVideoUrl === "string"
      ? data.trailerVideoUrl.trim()
      : "";
  const shouldUsePoster = Boolean(
    prefersReducedMotion || (!trailerVideoUrl && !trailerVideoId)
  );
  const trailerEmbedUrl = trailerVideoId
    ? `https://www.youtube.com/embed/${trailerVideoId}?autoplay=${isPaused ? "0" : "1"}&mute=${
        isMuted ? "1" : "0"
      }&loop=1&playlist=${trailerVideoId}&controls=1&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&start=3&playsinline=1`
    : "";
  const editionConfig = editionConfigs[activeEdition];
  const basePriceForEdition = clampPrice(data.basePrice * editionConfig.multiplier);
  const rawSalePrice = data.salePrice ?? data.basePrice;
  const salePriceForEdition = clampPrice(rawSalePrice * editionConfig.multiplier);
  const hasDiscount = Boolean(data.salePrice && data.salePrice < data.basePrice);
  const effectiveStock = Math.max(0, data.stock + editionConfig.stockDelta);
  const platformBadge = getPlatformBadge(data.platform.slug);
  const redemptionSteps = getRedeemSteps(data, language);
  const lowStock = effectiveStock > 0 && effectiveStock < 15;
  const gameTabs = uniqueProducts([data, ...(relatedProducts.data ?? [])]).slice(0, 6);

  const aboutParagraphs = language === "ar"
    ? [
        `إذا كنت تبحث عن تجربة ${genreLabel} تمنحك ساعات من المتعة، فإن ${data.name} تقدم إيقاعًا سريعًا ووضوحًا في الهدف من أول دقيقة.`,
        `في NEXUS نوفر لك نسخة رقمية موثوقة من بائع واحد، مع توضيح المنصة (${data.platform.name}) والمنطقة (${regionLabel}) حتى تعرف بالضبط أين وكيف تقوم بالتفعيل.`,
        "نركز هنا على التفاصيل التي تهمك: صفحة منتج واضحة، مخزون متاح، وتسليم رقمي سريع بدون انتظار أو رسائل غير ضرورية.",
        "بعد إتمام الدفع، سيظهر الكود داخل حسابك مباشرة. قم بالتفعيل على المنصة الصحيحة وابدأ اللعب فورًا، وإذا واجهت أي سؤال فخطوات التفعيل موجودة في نفس الصفحة."
      ]
    : [
        `Looking for a ${genreLabel} experience that stays fun for hours? ${data.name} keeps the pace tight and the objective clear from the first minute.`,
        `On NEXUS, you get a verified digital copy from a single seller, with platform (${data.platform.name}) and region (${regionLabel}) labeled so you always know where and how to redeem.`,
        "We focus on what matters: a clean product page, real stock, and instant delivery without unnecessary steps.",
        "After checkout, your code appears in your account. Redeem on the correct platform and start playing right away, with activation guidance available on the same page."
      ];

  const featureItems = [
    {
      icon: Zap,
      title: language === "ar" ? "تسليم رقمي فوري" : "Instant delivery",
      body: language === "ar" ? "الكود يظهر مباشرة بعد الدفع داخل حسابك." : "Your code appears right after checkout in your account."
    },
    {
      icon: Gamepad2,
      title: language === "ar" ? "تفعيل واضح على المنصة" : "Platform-ready redeem",
      body: language === "ar" ? platformRedeem : platformRedeem
    },
    {
      icon: Globe2,
      title: language === "ar" ? "منطقة محددة بوضوح" : "Region clearly labeled",
      body:
        language === "ar"
          ? `هذه النسخة مخصصة لمنطقة ${regionLabel}.`
          : `This listing is labeled for the ${regionLabel} region.`
    },
    {
      icon: ShieldCheck,
      title: language === "ar" ? "مخزون موثق" : "Verified stock",
      body:
        language === "ar"
          ? "منتج من بائع واحد داخل المتجر مع حالة مخزون واضحة."
          : "Single-seller inventory with a clear stock status."
    }
  ];

  const awardItems = [
    {
      icon: Trophy,
      title: language === "ar" ? "تقييم مرتفع" : "Top rating",
      subtitle: `${data.rating ?? "4.9"}/5`,
      tooltip:
        language === "ar"
          ? "متوسط تقييم العملاء لهذا المنتج داخل NEXUS."
          : "Average customer rating for this product on NEXUS."
    },
    {
      icon: Award,
      title: language === "ar" ? "اختيار المتجر" : "Store pick",
      subtitle: language === "ar" ? "تجربة موثوقة" : "Trusted choice",
      tooltip:
        language === "ar"
          ? "منتج مناسب لمن يريد تجربة واضحة مع تسليم فوري."
          : "A solid pick if you want a clean flow with instant delivery."
    },
    {
      icon: Sparkles,
      title: language === "ar" ? "تسليم خلال ثوان" : "Seconds delivery",
      subtitle: language === "ar" ? "بعد الدفع" : "After payment",
      tooltip:
        language === "ar"
          ? "يظهر الكود مباشرة بعد إتمام الدفع بنجاح."
          : "Your code shows up instantly after successful checkout."
    }
  ];

  const cartProduct = {
    ...data,
    id: `${data.id}:${activeEdition}`,
    name: `${data.name} — ${editionLabels[activeEdition]}`,
    basePrice: basePriceForEdition,
    salePrice: data.salePrice == null ? null : salePriceForEdition,
    stock: effectiveStock
  };

  const toggleWishlist = () => {
    setWishlisted((current) => {
      const next = !current;
      const message = next
        ? language === "ar"
          ? "تمت الإضافة إلى المفضلة"
          : "Added to wishlist"
        : language === "ar"
          ? "تمت الإزالة من المفضلة"
          : "Removed from wishlist";

      setWishlistToast(message);
      window.setTimeout(() => setWishlistToast(null), 1800);
      return next;
    });
  };

  const switchGame = (nextSlug: string) => {
    if (nextSlug === data.slug) {
      return;
    }

    setIsFading(true);
    window.setTimeout(() => {
      navigate(`/products/${nextSlug}`);
      setIsFading(false);
    }, 450);
  };

  const pageStyle = {
    "--game-accent": gameAccentColor
  } as CSSProperties;

  return (
    <section className="cinematic-game-page" style={pageStyle} dir={dir}>
      <div className={`cinematic-fade-overlay ${isFading ? "is-visible" : ""}`} />

      <div className="cinematic-content">
        <div className="cinematic-topbar">
          <div className="cinematic-breadcrumb">
            <Link to="/">{t("detail.home")}</Link>
            <span>/</span>
            <Link to="/store">{t("detail.store")}</Link>
            <span>/</span>
            <strong>{data.name}</strong>
          </div>
          <Link to="/" className="cinematic-logo">
            <Store className="h-4 w-4" />
            NEXUS
          </Link>
        </div>

        <div className="cinematic-tabs" aria-label="Game selector">
          {gameTabs.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => switchGame(product.slug)}
              className={product.slug === data.slug ? "is-active" : ""}
            >
              {product.name}
            </button>
          ))}
        </div>

        <div className="cinematic-feature-row">
          <div className="cinematic-trailer-player" dir="ltr" aria-label={t("detail.trailerBackgroundTitle")}>
            {isCardProduct ? (
              <div
                className="cinematic-card-watermark"
                aria-hidden="true"
                style={watermarkImage ? ({ "--brand-watermark": `url(${watermarkImage})` } as CSSProperties) : undefined}
              />
            ) : shouldUsePoster ? (
              <img
                className="cinematic-game-poster"
                src={posterImage}
                alt={`${data.name} trailer poster`}
                onError={(event) => {
                  const img = event.currentTarget;
                  if (img.src !== posterFallbackImage) {
                    img.src = posterFallbackImage;
                  }
                }}
              />
            ) : trailerVideoUrl ? (
              <video
                ref={videoRef}
                className="cinematic-game-video"
                src={trailerVideoUrl}
                poster={posterImage}
                autoPlay
                muted={isMuted}
                loop
                playsInline
                controls
              />
            ) : (
              <iframe
                className="cinematic-youtube-player"
                src={trailerEmbedUrl}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                title={`${data.name} trailer`}
              />
            )}
          </div>

          <article className="cinematic-summary-card" dir={dir}>
            <div className="cinematic-summary-rating">
              <span>
                <Star className="h-4 w-4 fill-current" />
                {data.rating ?? "4.9"}
              </span>
              <strong>{data.reviewCount ? `${data.reviewCount} reviews` : t("detail.trailerEyebrow")}</strong>
            </div>

            <h1>{data.name}</h1>
            <div className="cinematic-summary-tags">
              {summaryTags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <p className="cinematic-description">{summaryDescription}</p>
          </article>
        </div>

        <div className="cinematic-detail-stack">
          <div className="cinematic-actions">
            <button
              className="cinematic-primary-cta"
              type="button"
              onClick={() => addItem(cartProduct)}
              disabled={effectiveStock <= 0}
            >
              <ShoppingCart className="h-5 w-5" />
              {effectiveStock > 0 ? t("product.addToCart") : t("product.outOfStock")}
            </button>
            <a className="cinematic-ghost-cta" href={youtubeUrl} target="_blank" rel="noreferrer">
              <MonitorPlay className="h-5 w-5" />
              {t("detail.watchYoutube")}
              <ExternalLink className="h-4 w-4" />
            </a>
            <div className="cinematic-price">
              {hasDiscount ? <span>{formatCurrency(basePriceForEdition, data.currency)}</span> : null}
              <strong>{formatCurrency(salePriceForEdition, data.currency)}</strong>
            </div>
          </div>

          <aside className="cinematic-meta-panel">
            {isCardProduct ? (
              <div className="cinematic-card-preview" aria-label={language === "ar" ? "صورة البطاقة" : "Card image"}>
                <img
                  src={primaryImage}
                  alt={data.name}
                  loading="lazy"
                  onError={(event) => {
                    const img = event.currentTarget;
                    if (img.src !== cardFallbackImage) {
                      img.src = cardFallbackImage;
                    }
                  }}
                />
              </div>
            ) : null}
            <div className="cinematic-edition-card">
              <div className="cinematic-edition-header">
                <strong>{language === "ar" ? "النسخة" : "Edition"}</strong>
                <span className="cinematic-edition-price">
                  {formatCurrency(salePriceForEdition, data.currency)}
                </span>
              </div>
              <div
                className="cinematic-edition-tabs"
                role="tablist"
                aria-label={language === "ar" ? "اختيار النسخة" : "Edition selector"}
              >
                {(Object.keys(editionLabels) as EditionKey[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={activeEdition === key}
                    className={activeEdition === key ? "is-active" : ""}
                    onClick={() => setActiveEdition(key)}
                  >
                    {editionLabels[key]}
                  </button>
                ))}
              </div>
            </div>

            {lowStock ? (
              <div className="cinematic-urgency" role="status">
                <TriangleAlert className="h-4 w-4" />
                <span>{language === "ar" ? "المخزون قليل" : "Low stock"}</span>
                <strong>{effectiveStock}</strong>
              </div>
            ) : null}

            <div className="cinematic-control-row">
              <span className="cinematic-live-dot" />
              <strong>{t("detail.trailerEyebrow")}</strong>
              <button type="button" onClick={() => setIsMuted((current) => !current)} aria-label="Toggle mute">
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
              <button type="button" onClick={() => setIsPaused((current) => !current)} aria-label="Toggle trailer">
                {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </button>
            </div>

            <div className="cinematic-glass-card">
              {[
                { label: t("detail.platform"), value: data.platform.name, icon: Gamepad2 },
                { label: t("detail.region"), value: regionLabel, icon: Globe2 },
                { label: t("detail.stock"), value: `${effectiveStock} ${t("detail.available")}`, icon: GaugeCircle },
                { label: language === "ar" ? "التصنيف" : "Classification", value: categoryLabel, icon: BadgeCheck }
              ].map((item) => (
                <div className="cinematic-kv-row" key={item.label}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>

            <div className="cinematic-trust-row">
              <span>
                <Zap className="h-4 w-4" />
                {t("detail.instantDelivery")}
              </span>
              <span>
                <CheckCircle2 className="h-4 w-4" />
                {t("detail.digitalStock")}
              </span>
              <span>
                <ShieldCheck className="h-4 w-4" />
                {t("detail.officialProduct")}
              </span>
            </div>

            <div className="cinematic-platform-icons" aria-label={platformRedeem}>
              {platformIconLabels.map((label) => {
                const isAvailable = label === platformBadge;
                const isActive = activePlatformFilter ? activePlatformFilter === label : isAvailable;

                return (
                  <button
                    key={label}
                    type="button"
                    disabled={!isAvailable}
                    aria-disabled={!isAvailable}
                    onClick={() => setActivePlatformFilter((current) => (current === label ? null : label))}
                    className={`${isActive ? "is-active" : ""} ${!isAvailable ? "is-disabled" : ""}`}
                    aria-pressed={isActive}
                    title={!isAvailable ? (language === "ar" ? "غير متوفر" : "Unavailable") : undefined}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="cinematic-support-grid">
              <div className="cinematic-support-row">
                <Languages className="h-4 w-4" />
                <span>{language === "ar" ? "لغات اللعبة" : "Game languages"}</span>
                <strong>{language === "ar" ? "العربية، الإنجليزية، الفرنسية" : "Arabic, English, French"}</strong>
              </div>
              <div className="cinematic-support-row">
                <BadgeCheck className="h-4 w-4" />
                <span>{language === "ar" ? "تصنيف العمر" : "Age rating"}</span>
                <strong className="cinematic-age-badge">PEGI 18</strong>
              </div>
              <div className="cinematic-support-row">
                <Code2 className="h-4 w-4" />
                <span>{language === "ar" ? "المطور" : "Developer"}</span>
                <strong>
                  {data.slug.includes("cyberpunk") || data.slug.includes("witcher")
                    ? "CD Projekt Red"
                    : language === "ar"
                      ? "غير متوفر"
                      : "N/A"}
                </strong>
              </div>
              <div className="cinematic-support-row">
                <Building2 className="h-4 w-4" />
                <span>{language === "ar" ? "الناشر" : "Publisher"}</span>
                <strong>
                  {data.slug.includes("cyberpunk") || data.slug.includes("witcher")
                    ? "CD Projekt Red"
                    : language === "ar"
                      ? "غير متوفر"
                      : "N/A"}
                </strong>
              </div>
              <div className="cinematic-support-row">
                <CalendarDays className="h-4 w-4" />
                <span>{language === "ar" ? "تاريخ الإصدار" : "Release date"}</span>
                <strong>
                  {data.slug.includes("witcher")
                    ? language === "ar"
                      ? "19 مايو 2015"
                      : "May 19, 2015"
                    : language === "ar"
                      ? "غير متوفر"
                      : "N/A"}
                </strong>
              </div>
            </div>

            <div className="cinematic-collapse-card">
              <button
                type="button"
                className="cinematic-collapse-trigger"
                onClick={() => setActivationOpen((current) => !current)}
                aria-expanded={activationOpen}
                aria-controls="cinematic-activation-steps"
              >
                <ListOrdered className="h-4 w-4" />
                <span>{language === "ar" ? "خطوات التفعيل" : "Activation steps"}</span>
                {activationOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              <div
                id="cinematic-activation-steps"
                className={`cinematic-collapse-body ${activationOpen ? "is-open" : ""}`}
              >
                <ol>
                  {redemptionSteps.map((step, index) => (
                    <li key={step.title}>
                      <strong>
                        {index + 1}. {step.title}
                      </strong>
                      <p>{step.description}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <button
              type="button"
              className={`cinematic-wishlist ${wishlisted ? "is-active" : ""}`}
              onClick={toggleWishlist}
              aria-pressed={wishlisted}
            >
              <Heart className="h-4 w-4" />
              <span>{language === "ar" ? "المفضلة" : "Wishlist"}</span>
            </button>
            {wishlistToast ? (
              <div className="cinematic-wishlist-toast" role="status">
                {wishlistToast}
              </div>
            ) : null}

            <div className="cinematic-glass-card cinematic-delivery-card">
              <Sparkles className="h-4 w-4" />
              <p>{narrative.overview}</p>
            </div>
          </aside>
        </div>

        <section className="cinematic-about-section" aria-label={language === "ar" ? "عن اللعبة" : "About the game"}>
          <div className="cinematic-about-header">
            <h2 className="cinematic-about-heading">
              <Trophy className="h-5 w-5" />
              {language === "ar" ? "عن اللعبة" : "About the game"}
            </h2>
          </div>

          <div className="cinematic-about-layout">
            <div className="cinematic-about-card">
              <div className={`cinematic-about-body ${aboutExpanded ? "is-expanded" : ""}`}>
                {aboutParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <button
                type="button"
                className="cinematic-read-more"
                onClick={() => setAboutExpanded((current) => !current)}
                aria-expanded={aboutExpanded}
              >
                <span>{aboutExpanded ? (language === "ar" ? "إخفاء" : "Show less") : language === "ar" ? "اقرأ المزيد" : "Read more"}</span>
                {aboutExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>

            <div className="cinematic-about-card">
              <div className="cinematic-section-title">
                {language === "ar" ? "الميزات الرئيسية" : "Key features"}
              </div>
              <div className="cinematic-features-grid">
                {featureItems.map((feature) => (
                  <div key={feature.title} className="cinematic-feature-card">
                    <feature.icon className="h-5 w-5" />
                    <div>
                      <strong>{feature.title}</strong>
                      <p>{feature.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="cinematic-about-card">
              <div className="cinematic-section-title">{language === "ar" ? "الجوائز" : "Awards"}</div>
              <div className="cinematic-awards-strip hide-scrollbar" role="list">
                {awardItems.map((award, index) => {
                  const tooltipId = `award-tip-${data.slug}-${index}`;

                  return (
                    <div key={award.title} className="cinematic-award-item" role="listitem">
                      <button type="button" aria-describedby={tooltipId}>
                        <award.icon className="h-4 w-4" />
                        <div>
                          <strong>{award.title}</strong>
                          <span>{award.subtitle}</span>
                        </div>
                      </button>
                      <div id={tooltipId} role="tooltip" className="cinematic-award-tooltip">
                        {award.tooltip}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
};
