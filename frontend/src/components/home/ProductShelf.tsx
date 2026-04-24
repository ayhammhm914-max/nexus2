import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "../../store/language.store";
import type { Product } from "../../types/product.types";
import { ProductCard } from "../product/ProductCard";

type ProductShelfProps = {
  eyebrow: string;
  title: string;
  description: string;
  products: Product[];
  linkTo: string;
  linkLabel: string;
};

export const ProductShelf = ({
  eyebrow,
  title,
  description,
  products,
  linkTo,
  linkLabel
}: ProductShelfProps) => {
  const { dir } = useTranslation();
  const visibleProducts = products.slice(0, 4);

  if (!visibleProducts.length) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6" dir={dir}>
      <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-[0.34em] text-primary">{eyebrow}</div>
          <h2 className="mt-3 font-display text-3xl text-white sm:text-4xl">{title}</h2>
          <p className="mt-3 text-sm leading-7 text-muted sm:text-base">{description}</p>
        </div>
        <Link
          to={linkTo}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-white"
        >
          {linkLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-4 hide-scrollbar md:hidden">
        {visibleProducts.map((product) => (
          <div key={product.id} className="min-w-[282px] snap-start">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      <div className="hidden gap-6 md:grid md:grid-cols-2 xl:grid-cols-4">
        {visibleProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};
