import type { Metadata } from "next";
import { LegalNotice } from "@/components/legal/LegalNotice";
import { CONTACT } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that apply when you order from 7teen2wenty.",
};

export default function TermsPage() {
  return (
    <div className="container-page py-14 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-3xl font-semibold text-brand-umber-dark sm:text-4xl">Terms of Service</h1>
        <p className="mt-2 font-body text-sm text-brand-charcoal/60">Last updated: placeholder</p>

        <div className="mt-8">
          <LegalNotice />
        </div>

        <div className="space-y-6 font-body text-sm leading-relaxed text-brand-charcoal/85">
          <section>
            <h2 className="font-body text-base font-semibold text-brand-umber-dark">1. About us</h2>
            <p className="mt-2">
              7teen2wenty (numeral mark 1720) sells demi-fine jewellery made from 316L stainless steel with PVD gold
              plating. We are not a fine jewellery retailer and do not sell solid gold.
            </p>
          </section>
          <section>
            <h2 className="font-body text-base font-semibold text-brand-umber-dark">2. Orders</h2>
            <p className="mt-2">
              An order is confirmed once you complete checkout and verify it with the one-time code sent to your
              phone. We reserve the right to cancel orders we cannot fulfil, with a full refund where payment has
              been taken.
            </p>
          </section>
          <section>
            <h2 className="font-body text-base font-semibold text-brand-umber-dark">3. Pricing</h2>
            <p className="mt-2">
              All prices are listed in Pakistani Rupees (PKR) and include applicable taxes. Delivery fees are shown
              separately at checkout.
            </p>
          </section>
          <section>
            <h2 className="font-body text-base font-semibold text-brand-umber-dark">4. Payment</h2>
            <p className="mt-2">
              Cash on Delivery is available in our serviceable areas. Online payment (card, JazzCash, Easypaisa)
              will be added once available.
            </p>
          </section>
          <section>
            <h2 className="font-body text-base font-semibold text-brand-umber-dark">5. Returns and exchanges</h2>
            <p className="mt-2">
              See our{" "}
              <a href="/returns-policy" className="text-brand-umber underline">
                Return &amp; Exchange Policy
              </a>{" "}
              for full terms.
            </p>
          </section>
          <section>
            <h2 className="font-body text-base font-semibold text-brand-umber-dark">6. Limitation of liability</h2>
            <p className="mt-2">
              We are not liable for indirect or consequential losses arising from use of our products or site,
              beyond what is required by applicable Pakistani law.
            </p>
          </section>
          <section>
            <h2 className="font-body text-base font-semibold text-brand-umber-dark">7. Contact</h2>
            <p className="mt-2">Questions about these terms: {CONTACT.email}.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
