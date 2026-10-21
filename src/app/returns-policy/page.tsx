import type { Metadata } from "next";
import { whatsappLink } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Return & Exchange Policy",
  description:
    "1720 is exchange-only, no refunds: how to request an exchange within 3 days of delivery, what it costs, and what's excluded.",
  alternates: { canonical: "/returns-policy" },
};

export default function ReturnsPolicyPage() {
  return (
    <div className="container-page py-14 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-3xl font-semibold text-brand-umber-dark sm:text-4xl">
          Return &amp; Exchange Policy
        </h1>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={whatsappLink("Hi! I'd like to request an exchange.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full shadow-retro-sm bg-brand-umber px-8 py-4 font-body text-base font-bold text-brand-ivory transition hover:-translate-y-0.5 hover:bg-brand-umber-dark hover:shadow-[5px_5px_0_0_#482a24] active:translate-y-0 active:shadow-none"
          >
            Request an exchange on WhatsApp
          </a>
        </div>

        <div className="mt-10 space-y-10 font-body text-sm leading-relaxed text-brand-charcoal/85">
          <section>
            <h2 className="font-display text-xl font-semibold text-brand-umber-dark">Exchange Policy</h2>
            <p className="mt-3">
              Ordered something that doesn&apos;t fit your style or your taste? You can exchange it within 3 days of
              delivery.
            </p>

            <h3 className="mt-6 font-body text-base font-semibold text-brand-umber-dark">
              To request an exchange
            </h3>
            <ol className="mt-2 list-decimal space-y-3 pl-5">
              <li>
                Message us on{" "}
                <a href={whatsappLink("Hi! I'd like to request an exchange.")} className="text-brand-umber underline">
                  WhatsApp at 0335-6389333
                </a>{" "}
                with:
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Your order number</li>
                  <li>The reason for the exchange</li>
                  <li>The item you&apos;d like instead</li>
                </ul>
              </li>
              <li>We&apos;ll confirm your eligibility and send you an exchange reference number.</li>
              <li>
                Send the item back to us, unworn and in its original packaging, with the exchange reference number
                written on the outside. Courier it to 1720, Himalya 16, Cantt, Sialkot.
              </li>
              <li>
                We inspect the item when it arrives. Once it passes, we dispatch your new piece and message you the
                balance to pay on delivery.
              </li>
            </ol>

            <h3 className="mt-6 font-body text-base font-semibold text-brand-umber-dark">Costs</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Return shipping and shipping for the new piece are paid by you.</li>
              <li>If the new piece costs more, you pay the difference on delivery.</li>
              <li>If it costs less, we refund the difference within 7 working days.</li>
              <li>Earrings are exchange-only, and only if they are unworn.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-brand-umber-dark">Return Policy</h2>
            <p className="mt-3">
              1720 has a no-return policy. All items are carefully inspected prior to dispatch to ensure that your
              purchase is in perfect order.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
