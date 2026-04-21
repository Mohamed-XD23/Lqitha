import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: blob: https://res.cloudinary.com https://*.tile.openstreetmap.org https://unpkg.com https://*.basemaps.cartocdn.com https://*.cartocdn.com;
      font-src 'self';
      connect-src 'self' https: wss: https://nominatim.openstreetmap.org;
      frame-ancestors 'self';
      base-uri 'self';
      object-src 'none';
      worker-src 'self';
    `
      .replace(/\s{2,}/g, " ")
      .trim(),
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key:"Permissions-Policy",
    value: "camera=(self), microphone=(), geolocation=(self), payment=(), usb=()",
  }
];

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  poweredByHeader: false,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate", // ← دائماً نسخة جديدة
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
      {
        source: "/(.*)",
        has: [
          {
            type: "header",
            key: "x-forwarded-proto",
            value: "http",
          },
        ],
        destination: "https://lqitha.vercel.app/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
