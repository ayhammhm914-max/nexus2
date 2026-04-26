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

type CatalogLink = {
  label: string;
  to: string;
  description?: string;
};

type CatalogTab = {
  key: string;
  label: string;
  title: string;
  viewAllTo: string;
  links: CatalogLink[];
  featured: Product[];
};

type GiftMenuColumn = {
  title: string;
  links: Array<{
    label: string;
    to: string;
  }>;
};

const productUrl = (product: Product) => `/products/${product.slug}`;

const firstProducts = (predicate: (product: Product) => boolean, limit = 2) =>
  fallbackProducts.filter(predicate).slice(0, limit);

const platformTabs: CatalogTab[] = [
  {
    key: "pc",
    label: "PC",
    title: "PC catalog",
    viewAllTo: "/store?category=pc-games",
    links: [
      {
        label: "PC Games",
        to: "/store?category=pc-games",
        description: "Full digital games"
      },
      {
        label: "Steam Games",
        to: "/store?category=pc-games&platform=steam",
        description: "Steam library keys"
      },
      {
        label: "Wallet Top-Ups",
        to: "/store?category=gift-cards",
        description: "Store credit and balance"
      },
      {
        label: "In-Game Currency",
        to: "/store?category=in-game-currency",
        description: "Fast top-ups and points"
      }
    ],
    featured: firstProducts((product) => product.category.slug === "pc-games")
  },
  {
    key: "playstation",
    label: "PLAYSTATION",
    title: "PlayStation digital store",
    viewAllTo: "/store?platform=playstation",
    links: [
      {
        label: "PlayStation Games",
        to: "/store?category=pc-games&platform=playstation",
        description: "Console-ready game keys"
      },
      {
        label: "PlayStation Gift Cards",
        to: "/store?category=gift-cards&platform=playstation",
        description: "PSN and wallet credit"
      },
      {
        label: "PlayStation Plus",
        to: "/store?category=subscriptions&platform=playstation",
        description: "Membership access"
      },
      {
        label: "PlayStation DLC",
        to: "/store?platform=playstation",
        description: "Add-ons and extra content"
      }
    ],
    featured: firstProducts((product) => product.platform.slug === "playstation")
  },
  {
    key: "xbox",
    label: "XBOX",
    title: "Xbox digital store",
    viewAllTo: "/store?platform=xbox",
    links: [
      {
        label: "Xbox Games",
        to: "/store?category=pc-games&platform=xbox",
        description: "Xbox game codes"
      },
      {
        label: "Xbox Game Pass",
        to: "/store?category=subscriptions&platform=xbox",
        description: "Game Pass and memberships"
      },
      {
        label: "Xbox Gift Cards",
        to: "/store?category=gift-cards&platform=xbox",
        description: "Wallet top-ups"
      },
      {
        label: "Xbox Add Ons",
        to: "/store?platform=xbox",
        description: "Extras and live content"
      }
    ],
    featured: firstProducts((product) => product.platform.slug === "xbox")
  },
  {
    key: "nintendo",
    label: "NINTENDO",
    title: "Nintendo digital store",
    viewAllTo: "/store?platform=nintendo",
    links: [
      {
        label: "Nintendo Games",
        to: "/store?category=pc-games&platform=nintendo",
        description: "Switch-ready game codes"
      },
      {
        label: "Nintendo eShop Gift Cards",
        to: "/store?category=gift-cards&platform=nintendo",
        description: "Fast eShop credit"
      },
      {
        label: "Nintendo Switch Online",
        to: "/store?category=subscriptions&platform=nintendo",
        description: "Membership access"
      },
      {
        label: "Nintendo Add Ons",
        to: "/store?platform=nintendo",
        description: "Extras and platform credit"
      }
    ],
    featured: firstProducts((product) => product.platform.slug === "nintendo", 1)
  }
];

const utilityLinks = [
  { label: "DEALS", to: "/store?sort=sale" },
  { label: "LATEST GAMES", to: "/store?category=pc-games" },
  { label: "PRE-ORDER", to: "/store?category=pc-games" }
];

const giftMenuColumns: GiftMenuColumn[] = [
  {
    title: "Platform Credit",
    links: fallbackProducts
      .filter((product) => product.category.slug === "gift-cards")
      .slice(0, 4)
      .map((product) => ({
        label: product.name,
        to: productUrl(product)
      }))
  },
  {
    title: "Memberships",
    links: fallbackProducts
      .filter((product) => product.category.slug === "subscriptions")
      .slice(0, 4)
      .map((product) => ({
        label: product.name,
        to: productUrl(product)
      }))
  },
  {
    title: "Game Currency",
    links: fallbackProducts
      .filter((product) => product.category.slug === "in-game-currency")
      .slice(0, 4)
      .map((product) => ({
        label: product.name,
        to: productUrl(product)
      }))
  },
  {
    title: "Quick Browse",
    links: [
      { label: "Gift Cards", to: "/store?category=gift-cards" },
      { label: "Subscriptions", to: "/store?category=subscriptions" },
      { label: "In-Game Currency", to: "/store?category=in-game-currency" },
      { label: "View All Products", to: "/store" }
    ]
  }
];

const desktopMenuOrder = [
  ...platformTabs,
  {
    key: "gift-cards",
    label: "GIFT CARDS",
    title: "Gift cards and balance",
    viewAllTo: "/store?category=gift-cards",
    links: [
      {
        label: "Gift Cards",
        to: "/store?category=gift-cards",
        description: "Wallet credit and store cards"
      },
      {
        label: "Subscriptions",
        to: "/store?category=subscriptions",
        description: "Gaming memberships and digital access"
      },
      {
        label: "In-Game Currency",
        to: "/store?category=in-game-currency",
        description: "Robux, V-Bucks, points and more"
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

  const mobileQuickLinks = [
    { label: t("header.nav.home"), to: "/" },
    ...utilityLinks
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
    <header className="relative sticky top-0 z-40 backdrop-blur-xl">
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
              aria-label="Dismiss announcement"
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
                aria-label="Search products"
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
              aria-label="Switch language"
              onClick={toggleLanguage}
              className="rounded-full border border-primary/20 bg-primary/10 px-4 py-3 text-xs font-bold uppercase tracking-[0.22em] text-primary transition hover:border-primary/40 hover:bg-primary/15"
              type="button"
            >
              {t("header.language")}
            </button>
            <button
              aria-label="Open wishlist"
              className="hidden rounded-full border border-white/10 p-3 text-muted hover:text-white sm:inline-flex"
              type="button"
            >
              <Heart className="h-4 w-4" />
            </button>
            <button
              aria-label="Open cart"
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
                  Logout
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
              aria-label="Open menu"
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
                  {item.label}
                  {isActive ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              );
            })}
          </div>

          <nav className="flex items-center gap-8">
            {utilityLinks.map((link) => (
              <NavLink
              key={link.label}
              to={link.to}
                className="rounded-md border border-transparent px-2 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white/95 transition duration-150 hover:border-white/10 hover:bg-white/10 hover:text-white"
              >
                {link.label}
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
                    <div key={column.title} className="space-y-5">
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                        {column.title}
                      </div>
                      <div className="space-y-3">
                        {column.links.map((link) => (
                          <Link
                            key={link.label}
                            to={link.to}
                            onClick={() => setDesktopCategoryOpen(null)}
                            className="block rounded-2xl px-3 py-2 text-base font-medium text-white/92 transition duration-150 hover:bg-white/[0.05] hover:text-primary"
                          >
                            {link.label}
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
                        {activeDesktopMenu.title}
                      </div>
                      <div className="space-y-1">
                        {activeDesktopMenu.links.map((link) => (
                          <Link
                            key={link.label}
                            to={link.to}
                            onClick={() => setDesktopCategoryOpen(null)}
                            className="group flex items-center justify-between rounded-2xl border border-transparent px-4 py-4 transition duration-150 hover:border-white/10 hover:bg-white/[0.05] hover:shadow-[0_0_24px_rgba(0,212,255,0.08)]"
                          >
                            <div>
                              <div className="text-[1.05rem] font-semibold text-white">{link.label}</div>
                              {link.description ? (
                                <div className="mt-1 text-sm text-white/55">{link.description}</div>
                              ) : null}
                            </div>
                            <span className="text-xs uppercase tracking-[0.18em] text-white/35 transition group-hover:text-primary">
                              Open
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
                      View All
                    </Link>
                  </div>

                  <div className="space-y-5">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                      Featured
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
              <button aria-label="Close menu" onClick={() => setMobileOpen(false)} type="button">
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
                aria-label="Search products"
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
                      {menu.label}
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
                                key={`${menu.key}-${link.label}`}
                                to={link.to}
                                onClick={handleMobileNavigate}
                                className="block rounded-2xl px-4 py-3 text-sm text-white/92 transition hover:bg-white/[0.05] hover:text-primary"
                              >
                                {link.label}
                              </Link>
                            ))}

                            <Link
                              to={menu.viewAllTo}
                              onClick={handleMobileNavigate}
                              className="block rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary"
                            >
                              View All
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
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleMobileNavigate();
                      void logout();
                    }}
                    className="inline-flex rounded-full border border-white/10 px-5 py-3 font-semibold text-white"
                    type="button"
                  >
                    Logout
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
