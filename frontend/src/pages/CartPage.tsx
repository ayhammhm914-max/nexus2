import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { useCart } from "../hooks/useCart";
import { useTranslation } from "../store/language.store";
import { formatCurrency } from "../utils/format";

export const CartPage = () => {
  const { items, total, removeItem, clearCart } = useCart();
  const { t, dir } = useTranslation();

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6" dir={dir}>
      <div className="mb-10">
        <div className="text-sm uppercase tracking-[0.3em] text-primary">{t("cart.checkout")}</div>
        <h1 className="mt-3 font-display text-4xl text-white">{t("cart.title")}</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-white/10 p-8 text-muted">
              {t("cart.empty")}
            </div>
          ) : (
            items.map((item) => (
              <div key={item.productId} className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold text-white">{item.product?.name}</div>
                    <div className="mt-2 text-sm text-muted">
                      {t("cart.quantity")}: {item.quantity}
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    type="button"
                    className="text-xs uppercase tracking-[0.2em] text-danger"
                  >
                    {t("cart.remove")}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="rounded-[32px] border border-white/10 bg-panel p-6 shadow-card">
          <div className="text-sm uppercase tracking-[0.2em] text-muted">{t("cart.summary")}</div>
          <div className="mt-6 flex items-center justify-between text-lg text-white">
            <span>{t("cart.total")}</span>
            <span>{formatCurrency(total)}</span>
          </div>
          <div className="mt-6 flex gap-3">
            <Link to="/login" className="flex-1">
              <Button className="w-full">{t("cart.secureCheckout")}</Button>
            </Link>
            <Button variant="ghost" onClick={clearCart}>
              {t("cart.clear")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
