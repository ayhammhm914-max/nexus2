import { useSearchParams } from "react-router-dom";
import { ProductGrid } from "../components/product/ProductGrid";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { useProducts } from "../hooks/useProducts";

export const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const params = Object.fromEntries(searchParams.entries());
  const products = useProducts({
    ...params,
    limit: params.limit ?? 24
  });

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="mb-10 flex flex-col gap-4 rounded-[32px] border border-white/10 bg-white/5 p-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-sm uppercase tracking-[0.3em] text-primary">Storefront</div>
          <h1 className="mt-3 font-display text-4xl text-white">Digital codes, lined up cleanly.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
            Browse single-seller stock across keys, subscriptions, wallet top-ups and in-game currency.
          </p>
        </div>
      </div>

      {products.isLoading ? (
        <LoadingSpinner />
      ) : (
        <ProductGrid products={products.data?.items ?? []} />
      )}
    </section>
  );
};
