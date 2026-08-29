import Image from "next/image";

/**
 * The locked primary mark (Retro Sky Blue textured background, Pale Butter
 * Yellow numerals) at hero scale. The brand guide drops the illustrated
 * motif system entirely — identity is carried by palette, typography, and
 * photography alone — so this renders the permanent logo artwork itself
 * rather than an invented graphic. Swap for real product photography once
 * it exists; nothing else needs to change.
 */
export function HeroMark({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative aspect-square w-full overflow-hidden rounded-2xl shadow-[0_1px_2px_rgba(72,42,36,0.15),0_16px_40px_rgba(72,42,36,0.18)] ring-1 ring-brand-umber-dark/10 ${className}`}
    >
      <Image
        src="/brand/logo-primary.png"
        alt="7teen2wenty — demi-fine jewellery numeral mark, 1720"
        fill
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="object-cover"
        priority
      />
    </div>
  );
}
