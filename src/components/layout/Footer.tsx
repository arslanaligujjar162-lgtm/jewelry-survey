import Link from "next/link";
import { Wordmark } from "@/components/brand/Logo";
import { CONTACT, TAGLINE, whatsappLink } from "@/lib/brand";

const POLICY_LINKS = [
  { href: "/faq", label: "FAQ" },
  { href: "/sizing-guide", label: "Sizing Guide" },
  { href: "/care-guide", label: "Care Guide" },
  { href: "/returns-policy", label: "Return & Exchange Policy" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-brand-umber/10 bg-brand-sky-light/40">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Wordmark />
          <p className="mt-3 max-w-xs font-body text-sm text-brand-umber-dark/80">{TAGLINE}</p>
        </div>

        <div>
          <h3 className="font-body text-sm font-semibold uppercase tracking-wide text-brand-umber-dark">Policies</h3>
          <ul className="mt-3 space-y-2 font-body text-sm">
            {POLICY_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-brand-charcoal/80 hover:text-brand-umber">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-body text-sm font-semibold uppercase tracking-wide text-brand-umber-dark">Contact</h3>
          <ul className="mt-3 space-y-2 font-body text-sm text-brand-charcoal/80">
            <li>{CONTACT.address}</li>
            <li>
              <a href={`mailto:${CONTACT.email}`} className="hover:text-brand-umber">
                {CONTACT.email}
              </a>
            </li>
            <li>
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="hover:text-brand-umber">
                WhatsApp us
              </a>
            </li>
            <li>
              <Link href="/contact" className="hover:text-brand-umber">
                Contact page
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-body text-sm font-semibold uppercase tracking-wide text-brand-umber-dark">Follow</h3>
          <ul className="mt-3 space-y-2 font-body text-sm text-brand-charcoal/80">
            <li>
              <a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-brand-umber">
                Instagram
              </a>
            </li>
            <li>
              <a href={CONTACT.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-brand-umber">
                Facebook
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-brand-umber/10 py-5">
        <p className="container-page font-body text-xs text-brand-charcoal/60">
          © {new Date().getFullYear()} 7teen2wenty. Demi-fine jewellery, 316L stainless steel with PVD gold plating.
          Cash on Delivery available across Pakistan.
        </p>
      </div>
    </footer>
  );
}
