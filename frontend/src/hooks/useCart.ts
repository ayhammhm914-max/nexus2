import { useMemo } from "react";
import { useCartStore } from "../store/cart.store";

export const useCart = () => {
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);

  const total = useMemo(
    () =>
      items.reduce((sum, item) => {
        const price = item.product?.salePrice ?? item.product?.basePrice ?? 0;
        return sum + price * item.quantity;
      }, 0),
    [items]
  );

  return {
    items,
    total,
    addItem,
    removeItem,
    updateQuantity,
    clearCart
  };
};

