import { BRAND_DESCRIPTION, BRAND_NAME, CONTACT } from "@/lib/brand";
import { SITE_URL } from "@/lib/site-url";

const siteUrl = SITE_URL;

export function SiteSchema() {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND_NAME,
    alternateName: "1720",
    url: siteUrl,
    logo: `${siteUrl}/icon`,
    description: BRAND_DESCRIPTION,
    ...(CONTACT.email && { email: CONTACT.email }),
    address: {
      "@type": "PostalAddress",
      ...(CONTACT.address && { streetAddress: CONTACT.address }),
      addressCountry: "PK",
    },
    sameAs: [CONTACT.instagram, CONTACT.facebook].filter(Boolean),
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: BRAND_NAME,
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/shop?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }} />
    </>
  );
}
