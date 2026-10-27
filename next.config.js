import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  allowedDevOrigins: ["127.0.0.1"],
  turbopack: { root: projectRoot },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "sellmykernhome.netlify.app" }],
        destination: "https://sellmykernhome.com/:path*",
        permanent: true,
      },
      { source: "/selling-situations/inherited-property", destination: "/sell-inherited-house-bakersfield", permanent: true },
      { source: "/selling-situations/house-needs-repairs", destination: "/sell-house-needs-repairs-bakersfield", permanent: true },
      { source: "/selling-situations/rental-property", destination: "/sell-rental-property-bakersfield", permanent: true },
    ];
  },
};

export default nextConfig;
