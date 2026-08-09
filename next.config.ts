import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained build output (.next/standalone with its own server.js and only
  // the traced node_modules) so the image can run without the full repo or a
  // `next start`. Required by the VPS/Coolify deploy; ignored by Vercel.
  output: "standalone",

  // sharp (a native binary) is not used in the dating card pipeline anymore, but
  // keeping it external means the option survives a future Satori enhancement
  // without a config churn. Marking it external loads it from node_modules at
  // runtime instead of bundling it, so the correct platform binary is used.
  serverExternalPackages: ["sharp"],

  async rewrites() {
    // Pretty embed URL: gittinder.com/<username>.png -> the card image route. The
    // username charset matches GitHub's (alphanumerics + hyphens), and it only
    // matches the .png suffix, so this never shadows real static assets in
    // /public. Returned as an afterFiles rewrite (a plain array), so /public
    // files still win over it regardless.
    return [
      { source: "/:username([a-zA-Z0-9-]+).png", destination: "/api/card-image/:username" },
    ];
  },
};

export default nextConfig;
