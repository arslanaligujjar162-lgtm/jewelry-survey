"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { Product } from "@/lib/types";
import { productOrderLink } from "@/lib/whatsapp";
import { trackEvent, trackPixelEvent } from "@/lib/analytics";

/**
 * Opens WhatsApp with an order message for this product already written.
 * The product link uses the origin the customer is actually browsing, which
 * is only known in the browser, so the first render omits it.
 */
export function OrderOnWhatsAppButton({
  product,
  quantity,
  ringSize,
  colour,
  className,
  children,
}: {
  product: Pick<Product, "name" | "slug" | "sku" | "price" | "ring_size_range" | "colour_options">;
  quantity?: number;
  ringSize?: string | null;
  colour?: string | null;
  className: string;
  children?: ReactNode;
}) {
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);

  return (
    <a
      href={productOrderLink(product, { origin, quantity, ringSize, colour })}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Order ${product.name} on WhatsApp`}
      onClick={() => {
        trackEvent("whatsapp_order_click", { item_id: product.sku, item_name: product.name, value: product.price });
        trackPixelEvent("Contact", { content_name: product.name });
      }}
      className={className}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="shrink-0">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.28-1.38a9.9 9.9 0 0 0 4.76 1.21h.01c5.46 0 9.9-4.45 9.9-9.92C21.96 6.45 17.5 2 12.04 2zm5.8 14.11c-.24.68-1.4 1.3-1.93 1.38-.5.08-1.12.11-1.8-.11-.42-.13-.95-.31-1.64-.6-2.88-1.24-4.76-4.14-4.9-4.33-.14-.19-1.17-1.56-1.17-2.98 0-1.42.74-2.11 1-2.4.26-.29.57-.36.76-.36.19 0 .38 0 .55.01.18.01.41-.07.64.49.24.58.81 2 .88 2.14.07.14.12.31.02.5-.1.19-.15.31-.29.48-.14.17-.3.37-.43.5-.14.14-.29.29-.13.57.17.29.75 1.24 1.61 2.01 1.11.99 2.04 1.3 2.33 1.44.29.14.46.12.63-.07.17-.19.72-.84.91-1.13.19-.29.38-.24.63-.14.26.1 1.65.78 1.93.92.29.14.48.21.55.33.07.12.07.68-.17 1.36z" />
      </svg>
      {children}
    </a>
  );
}
