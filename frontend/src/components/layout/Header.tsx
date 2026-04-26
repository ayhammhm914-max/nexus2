import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Gamepad2,
  Heart,
  Menu,
  Search,
  ShoppingCart,
  UserCircle2,
  X
} from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/context/AuthContext";
import { fallbackProducts } from "../../data/fallbackProducts";
import type { Product } from "../../types/product.types";
import { useCartStore } from "../../store/cart.store";
import { useLanguageStore, useTranslation } from "../../store/language.store";
import { useUIStore } from "../../store/ui.store";
import { Button } from "../ui/Button";
import type { TranslationKey } from "../../i18n/translations";

type CatalogLink = {
  label?: string;
  labelKey?: TranslationKey;
  to: string;
  description?: string;
  descriptionKey?: TranslationKey;
};

type CatalogTab = {
  key: string;
  labelKey: TranslationKey;
  titleKey: TranslationKey;
  viewAllTo: string;
  links: CatalogLink[];
  featured: Product[];
};

type GiftMenuColumn = {
  titleKey: TranslationKey;
  links: Array<{
    label?: string;
    labelKey?: TranslationKey;
    to: string;
  }>;
};

const productUrl = (product: Product) => `/products/${product.slug}`;

const firstProducts = (predicate: (product: Product) => boolean, limit = 2) =>
  fallbackProducts.filter(predicate).slice(0, limit);

const platformTabs: CatalogTab[] = [
  {
    key: "pc",
    labelKey: "header.menu.pc.label",
    titleKey: "header.menu.pc.title",
    viewAllTo: "/store?category=pc-games",
    links: [
      {
        labelKey: "header.menu.pc.games",
        to: "/store?category=pc-games",
        descriptionKey: "header.menu.pc.gamesDesc"
      },
      {
        labelKey: "header.menu.pc.steam",
        to: "/store?category=pc-games&platform=steam",
        descriptionKey: "header.menu.pc.steamDesc"
      },
      {
        labelKey: "header.menu.pc.wallet",
        to: "/store?category=gift-cards",
        descriptionKey: "header.menu.pc.walletDesc"
      },
      {
        labelKey: "header.menu.pc.currency",
        to: "/store?category=in-game-currency",
        descriptionKey: "header.menu.pc.currencyDesc"
      }
    ],
    featured: firstProducts((product) => product.category.slug === "pc-games")
  },
  {
    key: "playstation",
    labelKey: "header.menu.playstation.label",
    titleKey: "header.menu.playstation.title",
    viewAllTo: "/store?platform=playstation",
    links: [
      {
        labelKey: "header.menu.playstation.games",
        to: "/store?category=console-games&platform=playstation",
        descriptionKey: "header.menu.playstation.gamesDesc"
      },
      {
        labelKey: "header.menu.playstation.cards",
        to: "/store?category=gift-cards&platform=playstation",
        descriptionKey: "header.menu.playstation.cardsDesc"
      },
      {
        labelKey: "header.menu.playstation.plus",
        to: "/store?category=subscriptions&platform=playstation",
        descriptionKey: "header.menu.playstation.plusDesc"
      },
      {
        labelKey: "header.menu.playstation.dlc",
        to: "/store?platform=playstation",
        descriptionKey: "header.menu.playstation.dlcDesc"
      }
    ],
    featured: firstProducts((product) => product.platform.slug === "playstation")
  },
  {
    key: "xbox",
    labelKey: "header.menu.xbox.label",
    titleKey: "header.menu.xbox.title",
    viewAllTo: "/store?platform=xbox",
    links: [
      {
        labelKey: "header.menu.xbox.games",
        to: "/store?category=console-games&platform=xbox",
        descriptionKey: "header.menu.xbox.gamesDesc"
      },
      {
        labelKey: "header.menu.xbox.pass",
        to: "/store?category=subscriptions&platform=xbox",
        descriptionKey: "header.menu.xbox.passDesc"
      },
      {
        labelKey: "header.menu.xbox.cards",
        to: "/store?category=gift-cards&platform=xbox",
        descriptionKey: "header.menu.xbox.cardsDesc"
      },
      {
        labelKey: "header.menu.xbox.addons",
        to: "/store?platform=xbox",
        descriptionKey: "header.menu.xbox.addonsDesc"
      }
    ],
    featured: firstProducts((product) => product.platform.slug === "xbox")
  },
  {
    key: "nintendo",
    labelKey: "header.menu.nintendo.label",
    titleKey: "header.menu.nintendo.title",
    viewAllTo: "/store?platform=nintendo",
    links: [
      {
        labelKey: "header.menu.nintendo.games",
        to: "/store?category=console-games&platform=nintendo",
        descriptionKey: "header.menu.nintendo.gamesDesc"
      },
      {
        labelKey: "header.menu.nintendo.cards",
        to: "/store?category=gift-cards&platform=nintendo",
        descriptionKey: "header.menu.nintendo.cardsDesc"
      },
      {
        labelKey: "header.menu.nintendo.online",
        to: "/store?category=subscriptions&platform=nintendo",
        descriptionKey: "header.menu.nintendo.onlineDesc"
      },
      {
        labelKey: "header.menu.nintendo.addons",
        to: "/store?platform=nintendo",
        descriptionKey: "header.menu.nintendo.addonsDesc"
      }
    ],
    featured: firstProducts((product) => product.platform.slug === "nintendo", 1)
  }
];

const consoleGamesTab: CatalogTab = {
  key: "console-games",
  labelKey: "header.menu.console.label",
  titleKey: "header.menu.console.title",
  viewAllTo: "/store?category=console-games",
  links: [
    {
      labelKey: "header.menu.console.all",
      to: "/store?category=console-games",
      descriptionKey: "header.menu.console.allDesc"
    },
    {
      labelKey: "header.menu.console.playstation",
      to: "/store?category=console-games&platform=playstation",
      descriptionKey: "header.menu.console.playstationDesc"
    },
    {
      labelKey: "header.menu.console.xbox",
      to: "/store?category=console-games&platform=xbox",
      descriptionKey: "header.menu.console.xboxDesc"
    },
    {
      labelKey: "header.menu.console.nintendo",
      to: "/store?category=console-games&platform=nintendo",
      descriptionKey: "header.menu.console.nintendoDesc"
    }
  ],
  featured: firstProducts((product) => product.category.slug === "console-games")
};

const utilityLinks: Array<{ labelKey: TranslationKey; to: string }> = [
  { labelKey: "header.utility.deals", to: "/store?sort=sale" },
  { labelKey: "header.utility.latestGames", to: "/store?category=console-games" },
  { labelKey: "header.utility.preorder", to: "/store?type=PREORDER" }
];

const giftMenuColumns: GiftMenuColumn[] = [
  {
    titleKey: "header.gift.platformCredit",
    links: fallbackProducts
      .filter((product) => product.category.slug === "gift-cards")
      .slice(0, 4)
      .map((product) => ({
        label: product.name,
        to: productUrl(product)
      }))
  },
  {
    titleKey: "header.gift.memberships",
    links: fallbackProducts
      .filter((product) => product.category.slug === "subscriptions")
      .slice(0, 4)
      .map((product) => ({
        label: product.name,
        to: productUrl(product)
      }))
  },
  {
    titleKey: "header.gift.gameCurrency",
    links: fallbackProducts
      .filter((product) => product.category.slug === "in-game-currency")
      .slice(0, 4)
      .map((product) => ({
        label: product.name,
        to: productUrl(product)
      }))
  },
  {
    titleKey: "header.gift.quickBrowse",
    links: [
      { labelKey: "header.menu.gift.cards", to: "/store?category=gift-cards" },
      { labelKey: "header.menu.gift.subscriptions", to: "/store?category=subscriptions" },
      { labelKey: "header.menu.gift.currency", to: "/store?category=in-game-currency" },
      { labelKey: "header.gift.viewAllProducts", to: "/store" }
    ]
  }
];

const desktopMenuOrder: CatalogTab[] = [
  platformTabs[0],
  consoleGamesTab,
  ...platformTabs.slice(1),
  {
    key: "gift-cards",
    labelKey: "header.menu.gift.label",
    titleKey: "header.menu.gift.title",
    viewAllTo: "/store?category=gift-cards",
    links: [
      {
        labelKey: "header.menu.gift.cards",
        to: "/store?category=gift-cards",
        descriptionKey: "header.menu.gift.cardsDesc"
      },
      {
        labelKey: "header.menu.gift.subscriptions",
        to: "/store?category=subscriptions",
        descriptionKey: "header.menu.gift.subscriptionsDesc"
      },
      {
        labelKey: "header.menu.gift.currency",
        to: "/store?category=in-game-currency",
        descriptionKey: "header.menu.gift.currencyDesc"
      }
    ],
    featured: firstProducts((product) => product.category.slug === "gift-cards")
  }
];

const ProductPreviewCard = ({
  product,
  onNavigate
}: {
  product: Product;
  onNavigate?: () => void;
}) => {
  const image = product.thumbnailUrl ?? product.coverImageUrl;

  return (
    <Link
      to={productUrl(product)}
      onClick={onNavigate}
      className="group overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-950">
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 via-[#6a5be9]/20 to-transparent text-sm uppercase tracking-[0.3em] text-white/70">
            NEXUS
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090b18] via-[#090b18]/20 to-transparent" />
      </div>
      <div className="space-y-2 p-4">
        <div className="text-[11px] uppercase tracking-[0.22em] text-primary">
          {product.platform.name}
        </div>
        <div className="text-sm font-semibold text-white">{product.name}</div>
      </div>
    </Link>
  );
};

export const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState<string | null>(null);
  const [desktopCategoryOpen, setDesktopCategoryOpen] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { t, dir } = useTranslation();
  const toggleLanguage = useLanguageStore((state) => state.toggleLanguage);
  const navigate = useNavigate();
  const cartCount = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0)
  );
  const openCart = useCartStore((state) => state.openCart);
  const { user, isAuthenticated, logout } = useAuth();
  const announcementDismissed = useUIStore((state) => state.announcementDismissed);
  const dismissAnnouncement = useUIStore((state) => state.dismissAnnouncement);

  const activeDesktopMenu = desktopMenuOrder.find((item) => item.key === desktopCategoryOpen) ?? null;
  const linkLabel = (link: { label?: string; labelKey?: TranslationKey }) =>
    link.label ?? (link.labelKey ? t(link.labelKey) : "");
  const linkDescription = (link: CatalogLink) =>
    link.description ?? (link.descriptionKey ? t(link.descriptionKey) : "");

  const mobileQuickLinks = [
    { label: t("header.nav.home"), to: "/" },
    ...utilityLinks.map((link) => ({ label: t(link.labelKey), to: link.to }))
  ];

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const query = searchTerm.trim();
    if (!query) {
      navigate("/store");
      return;
    }

    navigate(`/store?q=${encodeURIComponent(query)}`);
  };

  const handleMobileNavigate = () => {
    setMobileOpen(false);
    setMobileCategoryOpen(null);
  };

  return (
    <header dir={dir} className="relative sticky top-0 z-40 backdrop-blur-xl">
      {!announcementDismissed ? (
        <div className="border-b border-primary/15 bg-background/80">
          <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-4 overflow-hidden px-4 py-2 text-[11px] uppercase tracking-[0.26em] text-primary sm:px-6">
            <div className="animate-marquee whitespace-nowrap">{t("header.announcement")}</div>
            <div className="hidden text-muted sm:block">
              <Link to="/#how-it-works" className="transition hover:text-white">
                {t("header.howItWorks")}
              </Link>
            </div>
            <button
              aria-label={t("header.dismissAnnouncement")}
              onClick={dismissAnnouncement}
              className="text-muted hover:text-white"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}

      <div className="glass relative z-30 border-b border-white/10">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 shadow-glow-blue">
              <Gamepad2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-display text-xl tracking-[0.32em] text-white">NEXUS</div>
              <div className="text-[10px] uppercase tracking-[0.28em] text-muted">
                {t("header.brandTag")}
              </div>
            </div>
          </Link>

          <div className="hidden flex-1 items-center lg:flex lg:px-8">
            <form
              onSubmit={handleSearchSubmit}
              className="flex min-w-[420px] flex-1 items-center rounded-full border border-white/10 bg-white/5 px-4 py-3 shadow-card xl:min-w-[560px]"
            >
              <Search className="mr-3 h-4 w-4 text-muted" />
              <input
                aria-label={t("header.searchProducts")}
                dir={dir}
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-muted"
                placeholder={t("header.search.placeholder")}
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </form>
          </div>

          <div className="flex items-center gap-3">
            <button
              aria-label={t("header.switchLanguage")}
              onClick={toggleLanguage}
              className="rounded-full border border-primary/20 bg-primary/10 px-4 py-3 text-xs font-bold uppercase tracking-[0.22em] text-primary transition hover:border-primary/40 hover:bg-primary/15"
              type="button"
            >
              {t("header.language")}
            </button>
            <button
              aria-label={t("header.openWishlist")}
              className="hidden rounded-full border border-white/10 p-3 text-muted hover:text-white sm:inline-flex"
              type="button"
            >
              <Heart className="h-4 w-4" />
            </button>
            <button
              aria-label={t("header.openCart")}
              onClick={openCart}
              className="relative rounded-full border border-white/10 p-3 text-muted hover:text-white"
              type="button"
            >
              <ShoppingCart className="h-4 w-4" />
              {cartCount ? (
                <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-slate-950">
                  {cartCount}
                </span>
              ) : null}
            </button>

            {isAuthenticated && user ? (
              <div className="hidden items-center gap-3 md:flex">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:border-primary/30"
                >
                  <UserCircle2 className="h-4 w-4 text-primary" />
                  {user.name}
                </Link>
                <button
                  onClick={() => void logout()}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:border-primary/30 hover:text-primary"
                  type="button"
                >
                  {t("header.logout")}
                </button>
              </div>
            ) : (
              <div className="hidden gap-3 md:flex">
                <Link to="/login">
                  <Button variant="ghost" className="px-5">
                    {t("header.login")}
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="px-5">{t("header.join")}</Button>
                </Link>
              </div>
            )}

            <button
              aria-label={t("header.openMenu")}
              className="rounded-full border border-white/10 p-3 text-muted lg:hidden"
              onClick={() => setMobileOpen(true)}
              type="button"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {activeDesktopMenu ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="pointer-events-none fixed inset-0 z-20 hidden bg-[radial-gradient(circle_at_top,rgba(64,224,255,0.14),transparent_28%),linear-gradient(180deg,rgba(4,8,20,0.18),rgba(4,8,20,0.46)_38%,rgba(4,8,20,0.74))] backdrop-blur-[12px] lg:block"
          />
        ) : null}
      </AnimatePresence>

      <div
        className="navbar-laser-strip relative z-30 hidden border-b border-white/10 shadow-[0_12px_40px_rgba(3,6,18,0.42)] lg:block"
        onMouseLeave={() => setDesktopCategoryOpen(null)}
      >
        <div className="navbar-edge-track" />
        <div className="navbar-edge-track navbar-edge-track-bottom" />
        <div className="navbar-edge-runner" />
        <div className="navbar-edge-runner navbar-edge-runner-bottom" />
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-8 px-6">
          <div className="flex items-center gap-1 xl:gap-2">
            {desktopMenuOrder.map((item) => {
              const isActive = item.key === desktopCategoryOpen;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() =>
                    setDesktopCategoryOpen((current) => (current === item.key ? null : item.key))
                  }
                  onMouseEnter={() => setDesktopCategoryOpen(item.key)}
                  className={`inline-flex items-center gap-2 rounded-md px-4 py-4 text-sm font-semibold uppercase tracking-[0.12em] transition duration-150 ${
                    isActive
                      ? "border border-white/20 bg-[linear-gradient(135deg,rgba(61,79,255,0.7),rgba(0,212,255,0.26)_58%,rgba(133,92,255,0.56))] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_0_24px_rgba(0,212,255,0.24),0_18px_38px_rgba(31,44,138,0.34)]"
                      : "border border-transparent text-white/95 hover:border-white/10 hover:bg-white/10 hover:shadow-[0_0_22px_rgba(0,212,255,0.12)]"
                  }`}
                >
                  {t(item.labelKey)}
                  {isActive ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              );
            })}
          </div>

          <nav className="flex items-center gap-8">
            {utilityLinks.map((link) => (
              <NavLink
                key={link.labelKey}
                to={link.to}
                className="rounded-md border border-transparent px-2 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white/95 transition duration-150 hover:border-white/10 hover:bg-white/10 hover:text-white"
              >
                {t(link.labelKey)}
              </NavLink>
            ))}
          </nav>
        </div>

        <AnimatePresence>
          {activeDesktopMenu ? (
            <motion.div
              key={activeDesktopMenu.key}
              initial={{ opacity: 0, y: -6, scale: 0.988 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6, scale: 0.992 }}
              transition={{ duration: 0.12, ease: "easeOut" }}
              className="absolute inset-x-0 top-full z-40 border-t border-white/10 bg-[linear-gradient(180deg,rgba(9,14,30,0.97),rgba(10,15,28,0.93))] shadow-[0_32px_90px_rgba(2,4,14,0.58)] backdrop-blur-[22px]"
            >
              {activeDesktopMenu.key === "gift-cards" ? (
                <div className="mx-auto grid max-w-screen-2xl gap-10 px-6 py-8 xl:grid-cols-[1.2fr_1fr_1fr_1fr]">
                  {giftMenuColumns.map((column) => (
                    <div key={column.titleKey} className="space-y-5">
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                        {t(column.titleKey)}
                      </div>
                      <div className="space-y-3">
                        {column.links.map((link) => (
                          <Link
                            key={`${link.to}-${linkLabel(link)}`}
                            to={link.to}
                            onClick={() => setDesktopCategoryOpen(null)}
                            className="block rounded-2xl px-3 py-2 text-base font-medium text-white/92 transition duration-150 hover:bg-white/[0.05] hover:text-primary"
                          >
                            {linkLabel(link)}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mx-auto grid max-w-screen-2xl gap-10 px-6 py-8 xl:grid-cols-[0.95fr_1.05fr]">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                        {t(activeDesktopMenu.titleKey)}
                      </div>
                      <div className="space-y-1">
                        {activeDesktopMenu.links.map((link) => (
                          <Link
                            key={link.labelKey ?? link.label}
                            to={link.to}
                            onClick={() => setDesktopCategoryOpen(null)}
                            className="group flex items-center justify-between rounded-2xl border border-transparent px-4 py-4 transition duration-150 hover:border-white/10 hover:bg-white/[0.05] hover:shadow-[0_0_24px_rgba(0,212,255,0.08)]"
                          >
                            <div>
                              <div className="text-[1.05rem] font-semibold text-white">
                                {linkLabel(link)}
                              </div>
                              {linkDescription(link) ? (
                                <div className="mt-1 text-sm text-white/55">
                                  {linkDescription(link)}
                                </div>
                              ) : null}
                            </div>
                            <span className="text-xs uppercase tracking-[0.18em] text-white/35 transition group-hover:text-primary">
                              {t("header.open")}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>

                    <Link
                      to={activeDesktopMenu.viewAllTo}
                      onClick={() => setDesktopCategoryOpen(null)}
                      className="inline-flex items-center rounded-full border border-white/10 px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:border-primary/30 hover:text-primary"
                    >
                      {t("header.viewAll")}
                    </Link>
                  </div>

                  <div className="space-y-5">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                      {t("header.featured")}
                    </div>
                    <div className="grid gap-4 xl:grid-cols-2">
                      {activeDesktopMenu.featured.map((product) => (
                        <ProductPreviewCard
                          key={product.id}
                          product={product}
                          onNavigate={() => setDesktopCategoryOpen(null)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-background/95 p-6 backdrop-blur-xl"
          >
            <div className="mb-8 flex items-center justify-between">
              <div className="font-display text-xl tracking-[0.3em]">NEXUS</div>
              <button
                aria-label={t("header.closeMenu")}
                onClick={() => setMobileOpen(false)}
                type="button"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form
              onSubmit={(event) => {
                handleSearchSubmit(event);
                handleMobileNavigate();
              }}
              className="mb-8 flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-3"
            >
              <Search className="mr-3 h-4 w-4 text-muted" />
              <input
                aria-label={t("header.searchProducts")}
                dir={dir}
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-muted"
                placeholder={t("header.search.mobilePlaceholder")}
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </form>

            <nav className="flex flex-col gap-4 text-lg">
              {mobileQuickLinks.map((link) => (
                <NavLink
                  key={link.label}
                  to={link.to}
                  onClick={handleMobileNavigate}
                  className={({ isActive }) =>
                    `rounded-2xl border px-4 py-4 text-base font-semibold uppercase tracking-[0.1em] ${
                      isActive
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-white/10 bg-white/[0.03] text-white"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <div className="mt-8 space-y-3 border-t border-white/10 pt-6">
              {desktopMenuOrder.map((menu) => {
                const isOpen = mobileCategoryOpen === menu.key;
                const mobileLinks =
                  menu.key === "gift-cards"
                    ? giftMenuColumns.flatMap((column) => column.links)
                    : menu.links;

                return (
                  <div
                    key={menu.key}
                    className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.03]"
                  >
                    <button
                      type="button"
                      onClick={() => setMobileCategoryOpen((current) => (current === menu.key ? null : menu.key))}
                      className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold uppercase tracking-[0.14em] text-white"
                    >
                      {t(menu.labelKey)}
                      {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen ? (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.18, ease: "easeOut" }}
                          className="overflow-hidden border-t border-white/10"
                        >
                          <div className="space-y-2 px-4 py-4">
                            {mobileLinks.map((link) => (
                              <Link
                                key={`${menu.key}-${link.to}-${linkLabel(link)}`}
                                to={link.to}
                                onClick={handleMobileNavigate}
                                className="block rounded-2xl px-4 py-3 text-sm text-white/92 transition hover:bg-white/[0.05] hover:text-primary"
                              >
                                {linkLabel(link)}
                              </Link>
                            ))}

                            <Link
                              to={menu.viewAllTo}
                              onClick={handleMobileNavigate}
                              className="block rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary"
                            >
                              {t("header.viewAll")}
                            </Link>
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 border-t border-white/10 pt-6">
              {isAuthenticated && user ? (
                <div className="flex flex-col gap-3">
                  <Link
                    to="/dashboard"
                    onClick={handleMobileNavigate}
                    className="inline-flex rounded-full bg-primary px-5 py-3 font-semibold text-slate-950"
                  >
                    {t("header.dashboard")}
                  </Link>
                  <button
                    onClick={() => {
                      handleMobileNavigate();
                      void logout();
                    }}
                    className="inline-flex rounded-full border border-white/10 px-5 py-3 font-semibold text-white"
                    type="button"
                  >
                    {t("header.logout")}
                  </button>
                </div>
              ) : (
                <Link
                  to="/register"
                  onClick={handleMobileNavigate}
                  className="inline-flex rounded-full bg-primary px-5 py-3 font-semibold text-slate-950"
                >
                  {t("header.createAccount")}
                </Link>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
};
