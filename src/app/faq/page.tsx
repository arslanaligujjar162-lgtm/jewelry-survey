import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers on ring sizing, returns and exchanges, how long PVD plating lasts, Cash on Delivery, and delivery timelines across Pakistan.",
  alternates: { canonical: "/faq" },
};

const FAQ_SECTIONS: { category: string; items: { q: string; a: React.ReactNode }[] }[] = [
  {
    category: "Sizing",
    items: [
      {
        q: "How do I find my ring size?",
        a: (
          <>
            Use our{" "}
            <Link href="/sizing-guide" className="text-brand-umber underline">
              sizing guide
            </Link>{" "}
            to measure an existing ring or your finger at home. Most of our rings run US 5-9; each product page
            lists the exact range in stock.
          </>
        ),
      },
      {
        q: "What if I order the wrong ring size?",
        a: "Get in touch within 7 days of delivery and we'll arrange an exchange, as long as the ring hasn't been worn or resized.",
      },
    ],
  },
  {
    category: "Returns & exchanges",
    items: [
      {
        q: "What's your return policy?",
        a: (
          <>
            Unworn items in original packaging can be returned within 7 days of delivery for a refund or exchange.
            Earrings can&apos;t be returned for hygiene reasons unless faulty. Full details are on our{" "}
            <Link href="/returns-policy" className="text-brand-umber underline">
              Return &amp; Exchange Policy
            </Link>
            .
          </>
        ),
      },
      {
        q: "How do I start a return?",
        a: "WhatsApp us your order number and reason, or use the return request option we'll share in your order confirmation. We'll confirm pickup or drop-off details from there.",
      },
    ],
  },
  {
    category: "Plating longevity",
    items: [
      {
        q: "How long does PVD gold plating last?",
        a: "PVD bonds gold to the steel base at a molecular level, so it holds up to daily wear far longer than standard gold plating. How long depends on how it's worn — see our care guide for the habits that make the biggest difference.",
      },
      {
        q: "Is this real gold?",
        a: "No. This is 316L stainless steel with a real PVD gold coating — not solid gold and not gold-filled. We're upfront about that because the price reflects it.",
      },
    ],
  },
  {
    category: "Cash on Delivery",
    items: [
      {
        q: "How does Cash on Delivery work?",
        a: "Place your order online, verify it with the one-time code sent to your phone, and pay the courier in cash when your order arrives. No advance payment needed.",
      },
      {
        q: "Is online payment available?",
        a: "Not yet. Card, JazzCash, and Easypaisa are coming once our payment gateway account is approved. Cash on Delivery is available across our serviceable areas now.",
      },
    ],
  },
  {
    category: "Delivery timelines",
    items: [
      {
        q: "How long does delivery take?",
        a: "1-2 business days in Lahore, Islamabad, and Rawalpindi; 2-3 days in most other major cities; up to 5 days in some areas. Your exact estimate shows at checkout once you enter your city.",
      },
      {
        q: "Do you deliver everywhere in Pakistan?",
        a: "We currently cover major cities, checked automatically at checkout by your city and postal code. If your area isn't listed yet, WhatsApp us and we'll let you know when it's added.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="container-page py-14 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <p className="font-body text-sm font-semibold uppercase tracking-widest text-brand-umber">FAQ</p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-brand-umber-dark sm:text-4xl">
          Frequently asked questions
        </h1>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center rounded-full shadow-retro-sm bg-brand-umber px-8 py-4 font-body text-base font-bold text-brand-ivory transition hover:-translate-y-0.5 hover:bg-brand-umber-dark hover:shadow-[5px_5px_0_0_#482a24] active:translate-y-0 active:shadow-none"
          >
            Shop the collection
          </Link>
        </div>

        <div className="mt-10 space-y-10">
          {FAQ_SECTIONS.map((section) => (
            <div key={section.category}>
              <h2 className="font-body text-sm font-semibold uppercase tracking-wide text-brand-umber">
                {section.category}
              </h2>
              <div className="mt-3 divide-y divide-brand-umber/10 border-y border-brand-umber/10">
                {section.items.map((item) => (
                  <details key={item.q} className="group py-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between font-body text-base font-medium text-brand-charcoal">
                      {item.q}
                      <span className="ml-4 shrink-0 text-brand-umber transition group-open:rotate-45">+</span>
                    </summary>
                    <div className="mt-2 font-body text-sm text-brand-charcoal/80">{item.a}</div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
