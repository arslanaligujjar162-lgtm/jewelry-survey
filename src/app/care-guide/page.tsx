import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Care Guide",
  description:
    "How to make PVD-coated 316L stainless steel jewellery last: what to avoid, how to clean it, and how to store it between wears.",
};

const CARE_ITEMS = [
  {
    title: "Put it on last, take it off first",
    body: "Perfume, lotion, and hairspray shorten the life of any plating. Get dressed, then put your jewellery on. Take it off before you shower or sleep.",
  },
  {
    title: "Keep it dry when you can",
    body: "PVD is more durable than standard gold plating, but chlorine and prolonged water exposure still wear it down faster. Take it off for the pool and the gym.",
  },
  {
    title: "Clean it gently",
    body: "Wipe with a soft, dry cloth after wear. If it needs more, use a barely damp cloth and dry it immediately. Skip harsh jewellery cleaners and ultrasonic cleaners.",
  },
  {
    title: "Store pieces separately",
    body: "Keep each piece in its own pouch or compartment. Metal-on-metal contact in a drawer is the fastest way to scratch a plated surface.",
  },
  {
    title: "Avoid direct abrasion",
    body: "Sports, manual work, and tight clothing are the main causes of visible wear. Set jewellery aside for anything physical.",
  },
];

export default function CareGuidePage() {
  return (
    <div className="container-page py-14 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <p className="font-body text-sm font-semibold uppercase tracking-widest text-brand-umber">Care guide</p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-brand-umber-dark sm:text-4xl">
          How to make PVD last
        </h1>
        <p className="mt-4 font-body text-base text-brand-charcoal/80">
          PVD (physical vapour deposition) bonds gold to 316L stainless steel at a molecular level, which is why it
          holds up better than standard gold plating. Better doesn&apos;t mean indestructible — a few habits make a
          real difference.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center rounded-full bg-brand-umber px-7 py-3 font-body text-sm font-semibold text-brand-ivory transition hover:bg-brand-umber-dark"
          >
            Shop the collection
          </Link>
        </div>

        <ol className="mt-10 space-y-8">
          {CARE_ITEMS.map((item, i) => (
            <li key={item.title} className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-butter font-body text-sm font-semibold text-brand-umber-dark">
                {i + 1}
              </span>
              <div>
                <h2 className="font-body text-base font-semibold text-brand-umber-dark">{item.title}</h2>
                <p className="mt-1 font-body text-sm text-brand-charcoal/80">{item.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <p className="mt-10 font-body text-sm text-brand-charcoal/70">
          Questions about a specific piece? See our{" "}
          <Link href="/faq" className="text-brand-umber underline">
            FAQ
          </Link>{" "}
          or{" "}
          <Link href="/contact" className="text-brand-umber underline">
            contact us
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
