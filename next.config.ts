import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@point-of-sale/receipt-printer-encoder"],
};

export default nextConfig;
