import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";
import type { ApiResponse } from "../types/api.types";
import type { PaginatedProducts, Product } from "../types/product.types";

export const useProducts = (
  params?: Record<string, string | number | undefined>,
  options?: { enabled?: boolean }
) =>
  useQuery({
    queryKey: ["products", params],
    queryFn: async () => {
      const response = await api.get<ApiResponse<PaginatedProducts>>("/products", {
        params
      });
      return response.data.data;
    },
    enabled: options?.enabled ?? true
  });

export const useFeaturedProducts = () =>
  useQuery({
    queryKey: ["products", "featured"],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Product[]>>("/products/featured");
      return response.data.data;
    },
    staleTime: 5 * 60_000
  });

export const useHotDeals = () =>
  useQuery({
    queryKey: ["products", "hot-deals"],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Product[]>>("/products/hot-deals");
      return response.data.data;
    },
    staleTime: 2 * 60_000
  });

export const useProduct = (slug: string) =>
  useQuery({
    queryKey: ["products", slug],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Product>>(`/products/${slug}`);
      return response.data.data;
    },
    enabled: Boolean(slug)
  });

export const useRelatedProducts = (productId?: string) =>
  useQuery({
    queryKey: ["products", productId, "related"],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Product[]>>(`/products/${productId}/related`);
      return response.data.data;
    },
    enabled: Boolean(productId)
  });
