import Link from "next/link";

export function StickyMobileCTA({
  label,
  href,
}: {
  label: string;
  href: string;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-brand-umber/15 bg-brand-ivory p-3 shadow-[0_-2px_12px_rgba(0,0,0,0.06)] sm:hidden">
      <Link
        href={href}
        className="flex w-full items-center justify-center rounded-full bg-brand-umber py-3 font-body text-sm font-semibold text-brand-ivory"
      >
        {label}
      </Link>
    </div>
  );
}
