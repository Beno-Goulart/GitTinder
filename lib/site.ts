// Canonical origin for metadata — drives metadataBase, so file-convention OG
// images (opengraph-image.tsx) and relative canonical links unfurl on the host
// the page was actually served from. Priority: explicit NEXT_PUBLIC_SITE_URL
// (custom domain once DNS is wired) → the Vercel deployment host (VERCEL_URL is
// set at runtime on every deployment, including vercel.app previews) → a
// hardcoded fallback. A resolvable og:image host is what makes link previews
// render instead of going black.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ??
  "https://gittinder.com";
