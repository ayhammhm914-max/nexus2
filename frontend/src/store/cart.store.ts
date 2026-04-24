import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "../types/cart.types";
import type { Product } from "../types/product.types";

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      addItem: (product, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((item) => item.productId === product.id);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.productId === product.id
                  ? { ...item, quantity: item.quantity + quantity, product }
                  : item
              )
            };
          }
          return {
            items: [...state.items, { productId: product.id, quantity, product }]
          };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId)
        })),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId ? { ...item, quantity } : item
          )
        })),
      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false })
    }),
    {
      name: "nexus-cart"
    }
  )
);

