import type { Product } from "../../types/product.types";
import { ProductCard } from "./ProductCard";

type ProductRailProps = {
  eyebrow: string;
  title: string;
  description: string;
  products: Product[];
};

export const ProductRail = ({ eyebrow, title, description, products }: ProductRailProps) => {
  if (!products.length) {
    return null;
  }

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <div className="text-xs uppercase tracking-[0.3em] text-primary">{eyebrow}</div>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-display text-3xl text-white">{title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-muted">{description}</p>
          </div>
        </div>
      </div>

      <div className="flex snap-x gap-5 overflow-x-auto pb-2 md:grid md:grid-cols-2 md:overflow-visible xl:grid-cols-4">
        {products.map((product) => (
          <div key={product.id} className="min-w-[280px] snap-start md:min-w-0">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
};
