import { readFileSync } from "node:fs";
import path from "node:path";

let cached: string | null = null;

// The mascot as a base64 data URI, for Satori images (next/og) — which can't
// resolve relative URLs like /mascot.png. Read once from public/ at first use
// and cached for the process lifetime; the file is a static asset. Returns null
// if the file can't be read, so callers can skip the mark gracefully.
export function mascotDataUri(): string | null {
  if (cached) return cached;
  try {
    const file = path.join(process.cwd(), "public", "mascot.png");
    const buf = readFileSync(file);
    cached = `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    cached = null;
  }
  return cached;
}
