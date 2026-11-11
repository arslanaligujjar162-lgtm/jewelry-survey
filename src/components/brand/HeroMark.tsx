import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatPKR } from "@/lib/format";

/**
 * Hero art: the locked primary mark (Retro Sky Blue, Pale Butter numerals)
 * with a real product photograph pinned over its corner like a print on an
 * editorial spread. Falls back to the mark alone if there's no product.
 */
export function HeroMark({ featured, saleBadge = false }: { featured?: Product; saleBadge?: boolean }) {
  const offset = Boolean(featured) || saleBadge;
  return (
    // With a featured print, the bottom padding (a % of width, like the tile
    // and print sizes) drops the print low enough to sit under the numerals —
    // it must never cover "1720" itself.
    <div className={`relative ${offset ? "pb-[33%]" : ""}`}>
      <div
        className={`relative aspect-square overflow-hidden rounded-3xl border-2 border-brand-umber-dark/20 shadow-[0_1px_2px_rgba(72,42,36,0.15),0_20px_48px_rgba(72,42,36,0.22)] ${
          offset ? "ml-auto w-[76%] rotate-[2deg]" : "w-full"
        }`}
      >
        <Image
          src="/brand/logo-primary.png"
          alt="1720 — demi-fine jewelry numeral mark"
          fill
          sizes="(min-width: 1024px) 45vw, 90vw"
          className="object-cover"
          priority
        />
      </div>

      {saleBadge && (
        <svg
          viewBox="0 0 200 200"
          role="img"
          aria-label="Wedding Sale — up to 10% off"
          className="absolute bottom-0 left-0 w-[48%] -rotate-[8deg] font-body drop-shadow-[0_10px_18px_rgba(72,42,36,0.3)]"
        >
          <circle cx="100" cy="100" r="99" fill="#CF5527" />
          <path id="wedding-sale-ring" d="M 100,100 m -74,0 a 74,74 0 1,1 148,0 a 74,74 0 1,1 -148,0" fill="none" />
          <text fill="#FDF2DC" fontSize="15" fontWeight="700" letterSpacing="1.5">
            <textPath href="#wedding-sale-ring" textLength="462">
              WEDDING SALE * WEDDING SALE * WEDDING SALE *
            </textPath>
          </text>
          <text x="100" y="82" textAnchor="middle" fill="#FDF2DC" fontSize="17" fontWeight="700" letterSpacing="3">
            UP TO
          </text>
          <text x="100" y="128" textAnchor="middle" fill="#FDF2DC" fontSize="50" fontWeight="800">
            10%
          </text>
        </svg>
      )}

      {featured && !saleBadge && (
        <Link
          href={`/product/${featured.slug}`}
          className="group absolute bottom-0 left-0 w-[48%] -rotate-[4deg] border-2 border-brand-umber-dark bg-white p-2.5 pb-3 shadow-retro transition duration-300 hover:-rotate-[2deg] hover:shadow-[6px_6px_0_0_#482a24] sm:p-3"
        >
          <div className="relative aspect-square overflow-hidden">
            <Image
              src={featured.images[0]}
              alt={`${featured.name} — ${featured.material_spec}`}
              fill
              sizes="(min-width: 1024px) 26vw, 50vw"
              className="object-contain transition duration-500 group-hover:scale-105"
              priority
            />
          </div>
          <p className="mt-2 font-display text-sm italic leading-tight text-brand-umber-dark sm:text-base">
            Fig. 1 — {featured.name}
            <span className="ml-1.5 font-body text-xs not-italic font-semibold text-brand-charcoal/70">
              {formatPKR(featured.price)}
            </span>
          </p>
        </Link>
      )}
    </div>
  );
}
