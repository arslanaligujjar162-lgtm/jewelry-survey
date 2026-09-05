import type { Metadata } from "next";
import { LegalNotice } from "@/components/legal/LegalNotice";
import { CONTACT } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How 1720 collects, uses, and protects your personal information.",
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container-page py-14 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-3xl font-semibold text-brand-umber-dark sm:text-4xl">Privacy Policy</h1>
        <p className="mt-2 font-body text-sm text-brand-charcoal/60">Last updated: placeholder</p>

        <div className="mt-8">
          <LegalNotice />
        </div>

        <div className="space-y-6 font-body text-sm leading-relaxed text-brand-charcoal/85">
          <section>
            <h2 className="font-body text-base font-semibold text-brand-umber-dark">1. Information we collect</h2>
            <p className="mt-2">
              When you place an order, we collect your name, phone number, email (optional), and shipping address.
              When you browse, we collect standard analytics data (pages viewed, device type, approximate location)
              through Google Analytics and Meta Pixel.
            </p>
          </section>
          <section>
            <h2 className="font-body text-base font-semibold text-brand-umber-dark">2. How we use it</h2>
            <p className="mt-2">
              To process and deliver your order, verify it by SMS/WhatsApp one-time code, send order updates, and
              improve the site. We do not sell your personal information to third parties.
            </p>
          </section>
          <section>
            <h2 className="font-body text-base font-semibold text-brand-umber-dark">3. Who we share it with</h2>
            <p className="mt-2">
              Courier partners (to deliver your order) and our hosting/database provider (Supabase, Vercel). Each is
              bound to use your data only to provide their service to us.
            </p>
          </section>
          <section>
            <h2 className="font-body text-base font-semibold text-brand-umber-dark">4. Cookies</h2>
            <p className="mt-2">
              We use cookies for cart persistence and analytics. You can control cookies through your browser
              settings; blocking them may affect cart functionality.
            </p>
          </section>
          <section>
            <h2 className="font-body text-base font-semibold text-brand-umber-dark">5. Your rights</h2>
            <p className="mt-2">
              You can request a copy of the data we hold about you, or ask us to delete it, by emailing{" "}
              {CONTACT.email}.
            </p>
          </section>
          <section>
            <h2 className="font-body text-base font-semibold text-brand-umber-dark">6. Contact</h2>
            <p className="mt-2">
              Questions about this policy: {CONTACT.email} or WhatsApp us.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
