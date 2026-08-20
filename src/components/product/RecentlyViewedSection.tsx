"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";
import { getRecentlyViewed, type RecentlyViewedItem } from "@/lib/recently-viewed";
import { ProductCard } from "@/components/product/ProductCard";

function toProduct(item: RecentlyViewedItem): Product {
  return {
    ...item,
    category_id: "",
    compare_at_price: null,
    description: "",
    plating_spec: "",
    ring_size_range: null,
    created_at: "",
  };
}

export function RecentlyViewedSection({ excludeProductId }: { excludeProductId?: string }) {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);

  useEffect(() => {
    setItems(getRecentlyViewed(excludeProductId));
  }, [excludeProductId]);

  if (items.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="font-display text-2xl font-semibold text-brand-umber-dark">Recently viewed</h2>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {items.map((item) => (
          <ProductCard key={item.id} product={toProduct(item)} />
        ))}
      </div>
    </section>
  );
}
