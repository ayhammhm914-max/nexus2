import { AnimatePresence, motion } from "framer-motion";
import {
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
import { useCartStore } from "../../store/cart.store";
import { useLanguageStore, useTranslation } from "../../store/language.store";
import { useUIStore } from "../../store/ui.store";
import { Button } from "../ui/Button";

export const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
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
  const navLinks = [
    { label: t("header.nav.home"), to: "/" },
    { label: t("header.nav.fullGames"), to: "/store?category=pc-games" },
    { label: t("header.nav.giftCards"), to: "/store?category=gift-cards" },
    { label: t("header.nav.subscriptions"), to: "/store?category=subscriptions" },
    { label: t("header.nav.deals"), to: "/store?sort=sale" }
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

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl">
      {!announcementDismissed ? (
        <div className="border-b border-primary/15 bg-background/80">
          <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-4 overflow-hidden px-4 py-2 text-[11px] uppercase tracking-[0.26em] text-primary sm:px-6">
            <div className="animate-marquee whitespace-nowrap">
              {t("header.announcement")}
            </div>
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

      <div className="glass border-b border-white/10">
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

          <div className="hidden flex-1 items-center gap-6 lg:flex lg:px-6">
            <nav className="flex items-center gap-5">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `text-sm font-medium transition ${
                      isActive ? "text-primary" : "text-muted hover:text-ink"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <form
              onSubmit={handleSearchSubmit}
              className="flex min-w-[280px] flex-1 items-center rounded-full border border-white/10 bg-white/5 px-4 py-3 shadow-card xl:min-w-[360px]"
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
        {mobileOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/90 p-6 backdrop-blur-xl"
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
                setMobileOpen(false);
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

            <nav className="flex flex-col gap-5 text-lg">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => (isActive ? "text-primary" : "text-white")}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <div className="mt-8 border-t border-white/10 pt-6">
              {isAuthenticated && user ? (
                <div className="flex flex-col gap-3">
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex rounded-full bg-primary px-5 py-3 font-semibold text-slate-950"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
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
                  onClick={() => setMobileOpen(false)}
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
