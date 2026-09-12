/**
 * Sort options live in their own module so client components (the shop
 * filter bar) can import them without pulling the Supabase client and the
 * whole fallback catalog in `products.ts` into the browser bundle.
 */
export type ProductSort = "newest" | "price-asc" | "price-desc";

export const PRODUCT_SORTS: { value: ProductSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

export function parseProductSort(value: string | undefined): ProductSort {
  return PRODUCT_SORTS.some((s) => s.value === value) ? (value as ProductSort) : "newest";
}
