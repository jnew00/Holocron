import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
  cacheOnNavigation: true,
  reloadOnOnline: true,
});

const nextConfig: NextConfig = {
  /* config options here */
  // Empty turbopack config to silence webpack warning
  // Serwist still uses webpack for service worker compilation
  turbopack: {},
};

export default withSerwist(nextConfig);
