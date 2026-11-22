import type { NextConfig } from "next";

// STATIC_EXPORT=1 builds a static preview (no API routes, orders go to WhatsApp).
const isExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: { NEXT_PUBLIC_STATIC: isExport ? "1" : "0" },
  ...(isExport ? { output: "export", trailingSlash: true, images: { unoptimized: true } } : {}),
};

export default nextConfig;
