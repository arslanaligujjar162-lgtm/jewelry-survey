import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { formatPKR } from "@/lib/format";
import { StockIndicator } from "@/components/product/StockIndicator";
import { WishlistButton } from "@/components/product/WishlistButton";
import { QuickAddButton } from "@/components/product/QuickAddButton";

export function ProductCard({ product }: { product: Product }) {
  return (
    // The quick-add control sits outside the Link — a button nested inside an
    // anchor is invalid markup and confuses assistive tech.
    <div className="group">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-brand-sky/10">
          <Image
            src={product.images[0]}
            alt={`${product.name} — ${product.material_spec}`}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-contain transition duration-300 group-hover:scale-[1.03]"
          />
          {product.is_new && (
            <span className="absolute left-2 top-2 rounded-full bg-brand-umber px-2.5 py-1 font-body text-[11px] font-semibold uppercase tracking-wide text-brand-ivory">
              New
            </span>
          )}
          <WishlistButton product={product} className="absolute right-2 top-2" />
        </div>
        <div className="mt-3">
          <h3 className="font-body text-sm font-medium text-brand-charcoal">{product.name}</h3>
          <p className="mt-1 font-body text-sm font-semibold text-brand-umber-dark">{formatPKR(product.price)}</p>
          <StockIndicator stock={product.stock_count} className="mt-1" />
        </div>
      </Link>
      <QuickAddButton product={product} />
    </div>
  );
}
