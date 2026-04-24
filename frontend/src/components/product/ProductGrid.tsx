import type { Product } from "../../types/product.types";
import { ProductCard } from "./ProductCard";

export const ProductGrid = ({ products }: { products: Product[] }) => (
  <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
    {products.map((product) => (
      <ProductCard key={product.id} product={product} />
    ))}
  </div>
);

