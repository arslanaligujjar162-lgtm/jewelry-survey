"use client";

import { useEffect } from "react";
import type { Product } from "@/lib/types";
import { recordRecentlyViewed } from "@/lib/recently-viewed";

export function RecentlyViewedTracker({ product }: { product: Product }) {
  useEffect(() => {
    recordRecentlyViewed({
      id: product.id,
      sku: product.sku,
      name: product.name,
      slug: product.slug,
      price: product.price,
      images: product.images,
      stock_count: product.stock_count,
      is_new: product.is_new,
      material_spec: product.material_spec,
    });
  }, [product]);

  return null;
}
