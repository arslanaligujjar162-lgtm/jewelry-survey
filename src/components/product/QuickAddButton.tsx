"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/lib/types";
import { trackEvent, trackPixelEvent } from "@/lib/analytics";
import { OrderOnWhatsAppButton } from "@/components/product/OrderOnWhatsAppButton";

const BASE = "flex min-w-0 flex-1 items-center justify-center whitespace-nowrap rounded-full py-2 font-body text-[11px] font-bold transition sm:text-xs";

export function QuickAddButton({ product }: { product: Product }) {
  const { addLine, openDrawer } = useCart();

  if (product.stock_count <= 0) {
    return (
      <div className="mt-2 flex">
        <span className={`${BASE} cursor-not-allowed border border-brand-umber/20 text-brand-charcoal/40`}>
          Out of stock
        </span>
      </div>
    );
  }

  // Beside the main button: icon only on narrow tiles, "Order" and then the
  // full "Order on WhatsApp" as the tile gets wider.
  const whatsapp = (
    <OrderOnWhatsAppButton
      product={product}
      className="flex shrink-0 items-center justify-center gap-1 rounded-full border-2 border-[#25D366] bg-[#25D366] px-2.5 py-2 font-body text-[11px] font-bold text-white transition hover:border-[#1DA851] hover:bg-[#1DA851] sm:gap-1.5 sm:px-3 sm:text-xs"
    >
      <span className="sm:hidden md:inline xl:hidden">Order</span>
      <span className="hidden xl:inline">Order on WhatsApp</span>
    </OrderOnWhatsAppButton>
  );

  // Pieces with a size or colour to choose go to the product page — quick-add
  // must never silently pick one on the customer's behalf.
  const needsColour = Boolean(product.colour_options?.length);
  if (product.ring_size_range || needsColour) {
    return (
      <div className="mt-2 flex gap-2">
        <Link
          href={`/product/${product.slug}`}
          className={`${BASE} border-2 border-brand-umber-dark text-brand-umber-dark hover:bg-brand-sky/10`}
        >
          {needsColour ? "Choose colour" : "Choose size"}
        </Link>
        {whatsapp}
      </div>
    );
  }

  return (
    <div className="mt-2 flex gap-2">
      <button
        type="button"
        onClick={() => {
          addLine({
            product_id: product.id,
            sku: product.sku,
            name: product.name,
            slug: product.slug,
            image: product.images[0],
            price: product.price,
            quantity: 1,
            ring_size: null,
            max_stock: product.stock_count,
          });

          trackEvent("add_to_cart", { item_id: product.sku, item_name: product.name, value: product.price });
          trackPixelEvent("AddToCart", { content_ids: [product.sku], value: product.price, currency: "PKR" });

          openDrawer();
        }}
        className={`${BASE} border-2 border-brand-umber-dark text-brand-umber-dark hover:bg-brand-umber hover:text-brand-ivory`}
      >
        Add to bag
      </button>
      {whatsapp}
    </div>
  );
}
