import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import { useCartStore } from "../../store/cart.store";
import { useTranslation } from "../../store/language.store";
import { formatCurrency } from "../../utils/format";
import { Button } from "../ui/Button";

export const CartDrawer = () => {
  const isOpen = useCartStore((state) => state.isOpen);
  const closeCart = useCartStore((state) => state.closeCart);
  const { items, total, removeItem } = useCart();
  const { t, dir } = useTranslation();

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-black/60"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 220, damping: 28 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-panel p-6 shadow-card sm:max-w-lg"
            dir={dir}
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="font-display text-lg tracking-[0.22em] text-white">{t("cart.title")}</div>
                <div className="text-sm text-muted">
                  {items.length} {t("cart.itemsReady")}
                </div>
              </div>
              <button aria-label={t("cart.close")} onClick={closeCart} type="button">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-auto">
              {items.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/10 p-8 text-center text-sm text-muted">
                  {t("cart.empty")}
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.productId} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-semibold text-white">{item.product?.name ?? t("product.fallbackName")}</div>
                        <div className="mt-1 text-sm text-muted">
                          {t("cart.qty")} {item.quantity}
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-xs uppercase tracking-[0.2em] text-danger"
                        type="button"
                      >
                        {t("cart.remove")}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between text-sm text-muted">
                <span>{t("cart.total")}</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <Link to="/cart" onClick={closeCart} className="mt-4 block">
                <Button className="w-full">{t("cart.openCheckout")}</Button>
              </Link>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
};
