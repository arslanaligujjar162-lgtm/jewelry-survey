/** @type {import('next').NextConfig} */

// Pragmatic CSP: allows the GA4/Meta Pixel snippets (loaded via next/script
// with inline init code, hence 'unsafe-inline' on script-src) and Supabase
// Storage/API. A nonce-based CSP would drop 'unsafe-inline' but needs
// middleware running on every route to inject the nonce — worth doing if
// this site's threat model grows past a storefront.
//
// 'unsafe-eval' is added only outside production — Next.js dev mode's React
// Refresh / webpack HMR runtime uses eval() for fast source maps, and a CSP
// without it silently breaks every client component in `next dev`. The
// production build never needs it.
const isDev = process.env.NODE_ENV !== "production";
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com https://connect.facebook.net`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co https://www.facebook.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://www.googletagmanager.com https://connect.facebook.net",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: CSP },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig = {
  images: {
    // Placeholder product photography ships as SVG until real photography is
    // in place; Supabase Storage will serve the real images.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
