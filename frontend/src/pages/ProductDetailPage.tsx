import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "framer-motion";
import {
  BadgeCheck,
  CheckCircle2,
  ExternalLink,
  Gamepad2,
  GaugeCircle,
  Globe2,
  MonitorPlay,
  Pause,
  Play,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Store,
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
  getYoutubeSearchUrl,
  toStringArray
} from "../utils/productExperience";
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

  const gallery = getProductGallery(data);
  const posterImage = gallery[0] ?? data.coverImageUrl ?? data.thumbnailUrl ?? "";
  const narrative = getProductNarrative(data, language);
  const regionLabel = getProductRegionLabel(data.region, language);
  const categoryLabel = getLocalizedCategoryName(data, language);
  const offerLabel = getProductOfferLabel(data, language);
  const platformRedeem = getPlatformRedeemLabel(data.platform.name, language);
  const youtubeUrl = getYoutubeSearchUrl(data);
  const tags = toStringArray(data.tags);
  const genreLabel = tags[0]?.replace(/-/g, " ") ?? offerLabel;
  const gameAccentColor = data.platform.color ?? "#00d4ff";
  const rawTrailerVideoId = (data.trailerVideoId ?? fallbackTrailerVideoIds[data.slug] ?? "").trim();
  const trailerVideoId = /^[a-zA-Z0-9_-]{11}$/.test(rawTrailerVideoId) ? rawTrailerVideoId : "";
  const trailerVideoUrl =
    "trailerVideoUrl" in data && typeof data.trailerVideoUrl === "string"
      ? data.trailerVideoUrl.trim()
      : "";
  const shouldUsePoster = Boolean(prefersReducedMotion || isMobile || isPaused || (!trailerVideoUrl && !trailerVideoId));
  const trailerEmbedUrl = trailerVideoId
    ? `https://www.youtube.com/embed/${trailerVideoId}?autoplay=${isPaused ? "0" : "1"}&mute=${
        isMuted ? "1" : "0"
      }&loop=1&playlist=${trailerVideoId}&controls=0&showinfo=0&rel=0&disablekb=1&modestbranding=1&iv_load_policy=3&start=3&playsinline=1`
    : "";
  const salePrice = data.salePrice ?? data.basePrice;
  const hasDiscount = Boolean(data.salePrice && data.salePrice < data.basePrice);
  const gameTabs = uniqueProducts([data, ...(relatedProducts.data ?? [])]).slice(0, 6);

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
      {shouldUsePoster ? (
        <img className="cinematic-game-poster" src={posterImage} alt="" aria-hidden="true" />
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
          aria-hidden="true"
        />
      ) : (
        <iframe
          className="cinematic-youtube-bg"
          src={trailerEmbedUrl}
          allow="autoplay; encrypted-media"
          title={t("detail.trailerBackgroundTitle")}
          aria-hidden="true"
        />
      )}

      <div className="cinematic-overlay cinematic-overlay-bottom" />
      <div className="cinematic-overlay cinematic-overlay-left" />
      <div className="cinematic-overlay cinematic-overlay-accent" />
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

        <div className="cinematic-product-grid">
          <div className="cinematic-info">
            <div className="cinematic-badges">
              <span>{genreLabel}</span>
              <span>
                <Star className="h-4 w-4 fill-current" />
                {data.rating ?? "4.9"}
              </span>
              <span>{data.type.replace(/_/g, " ")}</span>
            </div>

            <h1>{data.name}</h1>
            <p className="cinematic-description">{narrative.lead}</p>

            <div className="cinematic-actions">
              <button className="cinematic-primary-cta" type="button" onClick={() => addItem(data)} disabled={data.stock <= 0}>
                <ShoppingCart className="h-5 w-5" />
                {data.stock > 0 ? t("product.addToCart") : t("product.outOfStock")}
              </button>
              <a className="cinematic-ghost-cta" href={youtubeUrl} target="_blank" rel="noreferrer">
                <MonitorPlay className="h-5 w-5" />
                {t("detail.watchYoutube")}
                <ExternalLink className="h-4 w-4" />
              </a>
              <div className="cinematic-price">
                {hasDiscount ? <span>{formatCurrency(data.basePrice, data.currency)}</span> : null}
                <strong>{formatCurrency(salePrice, data.currency)}</strong>
              </div>
            </div>
          </div>

          <aside className="cinematic-meta-panel">
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
                { label: t("detail.stock"), value: `${data.stock} ${t("detail.available")}`, icon: GaugeCircle },
                { label: t("detail.category"), value: categoryLabel, icon: BadgeCheck }
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
              {platformIconLabels.map((label) => (
                <span key={label} className={data.platform.name.toLowerCase().includes(label.toLowerCase()) ? "is-active" : ""}>
                  {label}
                </span>
              ))}
            </div>

            <div className="cinematic-glass-card cinematic-delivery-card">
              <Sparkles className="h-4 w-4" />
              <p>{narrative.overview}</p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};
