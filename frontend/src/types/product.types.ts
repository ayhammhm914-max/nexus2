export type Platform = {
  id: string;
  name: string;
  slug: string;
  color?: string | null;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  type: string;
  basePrice: number;
  salePrice?: number | null;
  currency?: string;
  stock: number;
  isFeatured: boolean;
  isHot: boolean;
  isNew: boolean;
  soldCount: number;
  coverImageUrl?: string | null;
  thumbnailUrl?: string | null;
  trailerVideoId?: string | null;
  images: string[];
  rating?: number | null;
  reviewCount: number;
  tags: string[];
  region: string;
  platform: Platform;
  category: Category;
  reviews?: ProductReview[];
};

export type ProductReview = {
  id: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
  user: {
    username: string;
    avatarUrl?: string | null;
  };
};

export type PaginatedProducts = {
  items: Product[];
  meta: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
};
