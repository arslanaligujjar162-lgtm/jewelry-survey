import type { Metadata } from "next";
import { LegalNotice } from "@/components/legal/LegalNotice";
import { whatsappLink } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Return & Exchange Policy",
  description: "How returns and exchanges work at 7teen2wenty: timelines, condition requirements, and what's excluded.",
};

export default function ReturnsPolicyPage() {
  return (
    <div className="container-page py-14 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-3xl font-semibold text-brand-umber-dark sm:text-4xl">
          Return &amp; Exchange Policy
        </h1>
        <p className="mt-2 font-body text-sm text-brand-charcoal/60">Last updated: placeholder</p>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={whatsappLink("Hi! I'd like to start a return.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-brand-umber px-7 py-3 font-body text-sm font-semibold text-brand-ivory transition hover:bg-brand-umber-dark"
          >
            Start a return on WhatsApp
          </a>
        </div>

        <div className="mt-8">
          <LegalNotice />
        </div>

        <div className="space-y-6 font-body text-sm leading-relaxed text-brand-charcoal/85">
          <section>
            <h2 className="font-body text-base font-semibold text-brand-umber-dark">Return window</h2>
            <p className="mt-2">
              Unworn items in original packaging can be returned or exchanged within 7 days of delivery.
            </p>
          </section>
          <section>
            <h2 className="font-body text-base font-semibold text-brand-umber-dark">Condition</h2>
            <p className="mt-2">
              Items must be unworn, unaltered, and in their original packaging with tags attached. We inspect all
              returns before approving a refund or exchange.
            </p>
          </section>
          <section>
            <h2 className="font-body text-base font-semibold text-brand-umber-dark">Exclusions</h2>
            <p className="mt-2">
              Earrings cannot be returned for hygiene reasons unless faulty. Final sale items are marked as such at
              purchase and are not eligible for return.
            </p>
          </section>
          <section>
            <h2 className="font-body text-base font-semibold text-brand-umber-dark">How to start a return</h2>
            <p className="mt-2">
              WhatsApp us your order number and the reason for return. We&apos;ll confirm pickup or drop-off and
              next steps from there.
            </p>
          </section>
          <section>
            <h2 className="font-body text-base font-semibold text-brand-umber-dark">Refunds</h2>
            <p className="mt-2">
              Approved refunds for Cash on Delivery orders are issued via bank transfer within 7-10 business days of
              us receiving the returned item.
            </p>
          </section>
          <section>
            <h2 className="font-body text-base font-semibold text-brand-umber-dark">Faulty items</h2>
            <p className="mt-2">
              If a piece arrives faulty or damaged, contact us within 48 hours of delivery with photos and we&apos;ll
              replace it at no cost.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
