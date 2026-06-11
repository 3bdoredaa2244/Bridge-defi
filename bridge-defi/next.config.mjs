import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // ── ICP asset-canister hosting ──────────────────────────────────
  // Export a fully static site to `out/`. The ICP asset canister serves
  // these files directly — there is no Node server in production.
  output: "export",
  // The asset canister has no Next image-optimization server.
  images: { unoptimized: true },
  // Emit `route/index.html` so the asset canister serves clean URLs
  // (e.g. /dashboard → /dashboard/index.html) without server rewrites.
  trailingSlash: true,
  // This app lives inside a larger repo with its own lockfiles — pin the
  // file-tracing root so Next doesn't infer the parent directory.
  outputFileTracingRoot: __dirname,
  // @dfinity packages ship ESM that benefits from transpilation.
  transpilePackages: [
    "@dfinity/agent",
    "@dfinity/auth-client",
    "@dfinity/candid",
    "@dfinity/principal",
  ],
  webpack: (config) => {
    // The agent libraries reference these node builtins; they are not needed in the browser.
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

export default nextConfig;
