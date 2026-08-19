/** @type {import('next').NextConfig} */
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
};

export default nextConfig;
