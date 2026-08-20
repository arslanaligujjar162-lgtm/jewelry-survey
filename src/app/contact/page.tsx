import type { Metadata } from "next";
import { CONTACT, whatsappLink } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Contact",
  description: "Reach 7teen2wenty by WhatsApp, email, or visit us. We reply fastest on WhatsApp.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="container-page py-14 sm:py-20">
      <div className="mx-auto max-w-xl">
        <p className="font-body text-sm font-semibold uppercase tracking-widest text-brand-umber">Contact</p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-brand-umber-dark sm:text-4xl">Get in touch</h1>
        <p className="mt-4 font-body text-base text-brand-charcoal/80">
          Questions about sizing, an order, or a return — WhatsApp is the fastest way to reach us.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={whatsappLink("Hi! I have a question about 7teen2wenty.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-brand-umber px-7 py-3 font-body text-sm font-semibold text-brand-ivory transition hover:bg-brand-umber-dark"
          >
            Chat on WhatsApp
          </a>
          <a
            href={`mailto:${CONTACT.email}`}
            className="inline-flex items-center justify-center rounded-full border border-brand-umber/30 px-7 py-3 font-body text-sm font-semibold text-brand-umber-dark transition hover:bg-brand-sky-light"
          >
            Email us
          </a>
        </div>

        <dl className="mt-12 space-y-6 border-t border-brand-umber/10 pt-8">
          <div>
            <dt className="font-body text-sm font-semibold uppercase tracking-wide text-brand-umber">Email</dt>
            <dd className="mt-1 font-body text-base text-brand-charcoal">{CONTACT.email}</dd>
          </div>
          <div>
            <dt className="font-body text-sm font-semibold uppercase tracking-wide text-brand-umber">WhatsApp</dt>
            <dd className="mt-1 font-body text-base text-brand-charcoal">+{CONTACT.whatsappNumber}</dd>
          </div>
          <div>
            <dt className="font-body text-sm font-semibold uppercase tracking-wide text-brand-umber">Address</dt>
            <dd className="mt-1 font-body text-base text-brand-charcoal">{CONTACT.address}</dd>
          </div>
          <div>
            <dt className="font-body text-sm font-semibold uppercase tracking-wide text-brand-umber">Hours</dt>
            <dd className="mt-1 font-body text-base text-brand-charcoal">Monday - Saturday, 11am - 7pm PKT</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
