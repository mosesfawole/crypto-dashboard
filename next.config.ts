import type { NextConfig } from "next";
import { setDefaultResultOrder } from "dns";

setDefaultResultOrder("ipv4first");

const nextConfig: NextConfig = {
  transpilePackages: ["three"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "assets.coingecko.com" },
      { protocol: "https", hostname: "coin-images.coingecko.com" },
    ],
  },
};

export default nextConfig;
