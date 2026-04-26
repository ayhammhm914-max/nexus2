import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { CartDrawer } from "./components/cart/CartDrawer";
import { Footer } from "./components/layout/Footer";
import { Header } from "./components/layout/Header";
import { trackPageView } from "./lib/sentry";
import { useLanguageStore } from "./store/language.store";

export const App = () => {
  const language = useLanguageStore((state) => state.language);
  const location = useLocation();

  useEffect(() => {
    trackPageView(`${location.pathname}${location.search}`);
  }, [location.pathname, location.search]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dataset.language = language;
  }, [language]);

  return (
    <div className="min-h-screen bg-background text-ink">
      <Header />
      <main className="relative overflow-hidden">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
};
