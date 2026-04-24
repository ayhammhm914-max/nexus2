import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { CartDrawer } from "./components/cart/CartDrawer";
import { Footer } from "./components/layout/Footer";
import { Header } from "./components/layout/Header";
import { useAuthStore } from "./store/auth.store";
import { useLanguageStore } from "./store/language.store";

export const App = () => {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const language = useLanguageStore((state) => state.language);

  useEffect(() => {
    if (user && !accessToken) {
      void refreshToken();
    }
  }, [accessToken, refreshToken, user]);

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
