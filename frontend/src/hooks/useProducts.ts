import { useQuery } from "@tanstack/react-query";
import {
  fallbackFeaturedProducts,
  fallbackHotDeals,
  fallbackPaginatedProducts,
  fallbackProductBySlug,
  fallbackRelatedProducts
} from "../data/fallbackProducts";
import { storefrontApi } from "../lib/api";
import type { ApiResponse } from "../types/api.types";
import type { PaginatedProducts, Product } from "../types/product.types";

export const useProducts = (
  params?: Record<string, string | number | undefined>,
  options?: { enabled?: boolean }
) =>
  useQuery({
    queryKey: ["products", params],
    queryFn: async () => {
      try {
        const response = await storefrontApi.get<ApiResponse<PaginatedProducts>>("/products", {
          params
        });
        return response.data.data;
      } catch {
        return fallbackPaginatedProducts(params);
      }
    },
    enabled: options?.enabled ?? true
  });

export const useFeaturedProducts = () =>
  useQuery({
    queryKey: ["products", "featured"],
    queryFn: async () => {
      try {
        const response = await storefrontApi.get<ApiResponse<Product[]>>("/products/featured");
        return response.data.data;
      } catch {
        return fallbackFeaturedProducts();
      }
    },
    staleTime: 5 * 60_000
  });

export const useHotDeals = () =>
  useQuery({
    queryKey: ["products", "hot-deals"],
    queryFn: async () => {
      try {
        const response = await storefrontApi.get<ApiResponse<Product[]>>("/products/hot-deals");
        return response.data.data;
      } catch {
        return fallbackHotDeals();
      }
    },
    staleTime: 2 * 60_000
  });

export const useProduct = (slug: string) =>
  useQuery({
    queryKey: ["products", slug],
    queryFn: async () => {
      try {
        const response = await storefrontApi.get<ApiResponse<Product>>(`/products/${slug}`);
        return response.data.data;
      } catch {
        const fallbackProduct = fallbackProductBySlug(slug);
        if (!fallbackProduct) {
          throw new Error("Product not found.");
        }
        return fallbackProduct;
      }
    },
    enabled: Boolean(slug)
  });

export const useRelatedProducts = (productId?: string) =>
  useQuery({
    queryKey: ["products", productId, "related"],
    queryFn: async () => {
      try {
        const response = await storefrontApi.get<ApiResponse<Product[]>>(`/products/${productId}/related`);
        return response.data.data;
      } catch {
        return fallbackRelatedProducts(productId);
      }
    },
    enabled: Boolean(productId)
  });
