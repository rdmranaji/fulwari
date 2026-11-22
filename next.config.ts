import type { NextConfig } from "next";

// STATIC_EXPORT=1 builds a static preview (no API routes, orders go to WhatsApp).
// NEXT_BASE_PATH serves it from a sub-folder, e.g. "/fulwari" on GitHub Pages.
const isExport = process.env.STATIC_EXPORT === "1";
const basePath = isExport ? process.env.NEXT_BASE_PATH || "" : "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: { NEXT_PUBLIC_STATIC: isExport ? "1" : "0", NEXT_PUBLIC_BASE_PATH: basePath },
  ...(isExport ? { output: "export", trailingSlash: true, images: { unoptimized: true }, basePath, assetPrefix: basePath || undefined } : {}),
};

export default nextConfig;
