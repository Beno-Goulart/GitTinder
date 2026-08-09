import { describe, expect, it } from "vitest";
import satori from "next/dist/compiled/@vercel/og/satori";
import { cardTree, type CardAssets } from "@/lib/og/renderCard";
import { loadCardFonts } from "@/lib/og/card";
import { SAMPLE_PROFILES } from "@/lib/github/samples";

describe("satori diagnostic", () => {
  it("renders the sample card without a layout error", async () => {
    const w = 810;
    const assets: CardAssets = { avatar: "", logos: [], avW: w, avH: Math.round((w * 62) / 100) };
    const el = cardTree(SAMPLE_PROFILES[0], assets, w);
    const err = await satori(el, {
      width: w,
      height: Math.round((w * 7) / 5),
      fonts: await loadCardFonts(),
    })
      .then(() => null)
      .catch((e: unknown) => e as Error);
    if (err) {
      throw new Error(`SATORI FAILED: ${(err as Error).message}\n${(err as Error).stack ?? ""}`);
    }
    expect(err).toBeNull();
  });
});
