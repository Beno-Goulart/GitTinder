import { describe, expect, it } from "vitest";
import { ImageResponse } from "next/og";
import { cardTree, type CardAssets } from "@/lib/og/renderCard";
import { loadCardFonts } from "@/lib/og/card";
import { SAMPLE_PROFILES } from "@/lib/github/samples";

// Diagnostic: render the sample card through the real Satori pipeline (next/og)
// and assert a valid PNG comes out — catches layout/config regressions in CI.
describe("satori diagnostic", () => {
  const renderCard = async (theme: "light" | "dark" = "light") => {
    const w = 810;
    const avatar = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
    const assets: CardAssets = { avatar, logos: [], avW: w, avH: Math.round((w * 62) / 100) };
    const res = new ImageResponse(cardTree(SAMPLE_PROFILES[0], assets, w, theme), {
      width: w,
      height: Math.round((w * 7) / 5),
      fonts: await loadCardFonts(),
    });
    return Buffer.from(await res.arrayBuffer());
  };

  it("renders the sample card without a layout error", async () => {
    const buf = await renderCard("light");
    expect(buf.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a"); // PNG magic
  });

  it("renders the dark variant without a layout error", async () => {
    const buf = await renderCard("dark");
    expect(buf.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a"); // PNG magic
  });
});
