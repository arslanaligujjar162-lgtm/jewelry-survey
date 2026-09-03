"use client";

import { useState } from "react";
import Image from "next/image";

export function ProductGallery({ images, productName }: { images: string[]; productName: string }) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="aspect-square overflow-hidden rounded-2xl bg-brand-sky/10">
        <Image
          src={images[active]}
          alt={`${productName}, view ${active + 1} of ${images.length}`}
          width={900}
          height={900}
          priority
          className="h-full w-full object-cover"
        />
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2">
          {images.map((img, i) => (
            <button
              key={img}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show view ${i + 1} of ${productName}`}
              aria-current={active === i}
              className={`h-16 w-16 overflow-hidden rounded-lg border-2 bg-brand-sky/10 transition ${
                active === i ? "border-brand-umber" : "border-transparent"
              }`}
            >
              <Image src={img} alt="" width={64} height={64} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
