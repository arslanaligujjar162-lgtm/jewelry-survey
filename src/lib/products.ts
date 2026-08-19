import { createClient } from "@/lib/supabase/server";
import type { Category, CategorySlug, Product } from "@/lib/types";
import { FALLBACK_CATEGORIES, FALLBACK_PRODUCTS } from "@/data/seed-products";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export { isSupabaseConfigured };

export interface ProductFilters {
  category?: CategorySlug;
  minPrice?: number;
  maxPrice?: number;
  isNew?: boolean;
}

function attachFallbackCategory(product: Product): Product {
  const category = FALLBACK_CATEGORIES.find((c) => c.id === product.category_id);
  return { ...product, category };
}

function filterFallback(filters: ProductFilters): Product[] {
  return FALLBACK_PRODUCTS.filter((p) => {
    if (filters.category && p.category_id !== filters.category) return false;
    if (filters.minPrice !== undefined && p.price < filters.minPrice) return false;
    if (filters.maxPrice !== undefined && p.price > filters.maxPrice) return false;
    if (filters.isNew && !p.is_new) return false;
    return true;
  }).map(attachFallbackCategory);
}

export async function getCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) return FALLBACK_CATEGORIES;

  const supabase = createClient();
  const { data, error } = await supabase.from("categories").select("*").order("name");
  if (error || !data) return FALLBACK_CATEGORIES;
  return data as Category[];
}

export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  if (!isSupabaseConfigured()) return filterFallback(filters);

  const supabase = createClient();
  let query = supabase.from("products").select("*, category:categories(*)").order("created_at", { ascending: false });

  if (filters.category) {
    const { data: cat } = await supabase.from("categories").select("id").eq("slug", filters.category).maybeSingle();
    if (cat) query = query.eq("category_id", cat.id);
  }
  if (filters.minPrice !== undefined) query = query.gte("price", filters.minPrice);
  if (filters.maxPrice !== undefined) query = query.lte("price", filters.maxPrice);
  if (filters.isNew) query = query.eq("is_new", true);

  const { data, error } = await query;
  if (error || !data) return filterFallback(filters);
  return data as Product[];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!isSupabaseConfigured()) {
    const product = FALLBACK_PRODUCTS.find((p) => p.slug === slug);
    return product ? attachFallbackCategory(product) : null;
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    const fallback = FALLBACK_PRODUCTS.find((p) => p.slug === slug);
    return fallback ? attachFallbackCategory(fallback) : null;
  }
  return data as Product;
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const all = await getProducts({ category: (product.category?.slug ?? product.category_id) as CategorySlug });
  return all.filter((p) => p.id !== product.id).slice(0, limit);
}
