"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { ColourOption } from "@/lib/types";
import { useSelectedColour } from "@/components/product/SelectedColour";

export function ProductGallery({
  images,
  productName,
  colourOptions,
}: {
  images: string[];
  productName: string;
  colourOptions?: ColourOption[] | null;
}) {
  const [active, setActive] = useState(0);
  const selection = useSelectedColour();
  const selectedColour = selection?.colour;

  // Choosing a colour in the add-to-cart form brings its photo forward.
  useEffect(() => {
    const option = colourOptions?.find((o) => o.name === selectedColour);
    const index = option ? images.indexOf(option.image) : -1;
    if (index >= 0) setActive(index);
  }, [selectedColour, colourOptions, images]);

  function show(i: number) {
    setActive(i);
    const option = colourOptions?.find((o) => o.image === images[i]);
    if (option) selection?.setColour(option.name);
  }

  return (
    <div>
      {/* Every view is mounted and only the active one shown, so switching
          colour or view is instant rather than waiting on a fresh download. */}
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-brand-sky/10">
        {images.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt={i === active ? `${productName}, view ${i + 1} of ${images.length}` : ""}
            aria-hidden={i !== active}
            fill
            sizes="(min-width: 1024px) 55vw, 100vw"
            priority={i === 0}
            className={`object-contain transition-opacity duration-300 ${i === active ? "opacity-100" : "opacity-0"}`}
          />
        ))}
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2">
          {images.map((img, i) => (
            <button
              key={img}
              type="button"
              onClick={() => show(i)}
              aria-label={`Show view ${i + 1} of ${productName}`}
              aria-current={active === i}
              className={`h-16 w-16 overflow-hidden rounded-lg border-2 bg-brand-sky/10 transition ${
                active === i ? "border-brand-umber" : "border-transparent"
              }`}
            >
              <Image src={img} alt="" width={64} height={64} className="h-full w-full object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
