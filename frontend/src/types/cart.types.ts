import type { Product } from "./product.types";

export type CartItem = {
  productId: string;
  quantity: number;
  product?: Product;
};

