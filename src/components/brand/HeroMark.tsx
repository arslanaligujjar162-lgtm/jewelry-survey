/**
 * Large-format treatment of the numeral mark for the home hero — fills the
 * space real product photography will eventually take, without resorting
 * to an illustrated motif (brand rule: none allowed). Swap this out for a
 * photo <Image> once real photography exists; nothing else needs to change.
 */
export function HeroMark({ className = "" }: { className?: string }) {
  return (
    <div className={`relative aspect-square w-full overflow-hidden rounded-2xl bg-brand-butter-light ${className}`}>
      <div
        className="absolute -right-1/4 -top-1/4 h-3/4 w-3/4 rounded-full bg-brand-sky-light"
        aria-hidden="true"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-display font-semibold leading-none text-brand-umber-dark/[0.16]"
          style={{ fontSize: "clamp(6rem, 18vw, 11rem)" }}
          aria-hidden="true"
        >
          1720
        </span>
        <div className="mt-3 flex gap-3" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-brand-umber-dark/25" />
          <span className="h-2.5 w-2.5 rounded-full bg-brand-umber-dark/25" />
          <span className="h-2.5 w-2.5 rounded-full bg-brand-umber-dark/25" />
        </div>
      </div>
      <span className="sr-only">7teen2wenty — demi-fine jewellery numeral mark, 1720</span>
    </div>
  );
}
