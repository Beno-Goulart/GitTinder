import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Loads the DINPro suite + Bebas Neue for next/og (Satori) text — used by the
// embeddable /<user>.png card and the per-profile OG image. Bebas is the big
// "match" number face; DINPro is the card body.
export async function loadCardFonts() {
  const f = (name: string) => readFile(join(process.cwd(), "app", "fonts", name));
  const [bebas, cond, medium, bold] = await Promise.all([
    f("BebasNeue-Regular.ttf"),
    f("DINPro-Cond.otf"),
    f("DINPro-CondMedium.otf"),
    f("DINPro-CondBold.otf"),
  ]);
  return [
    { name: "Bebas", data: bebas, weight: 400 as const, style: "normal" as const },
    { name: "DINPro", data: cond, weight: 400 as const, style: "normal" as const },
    { name: "DINPro", data: medium, weight: 500 as const, style: "normal" as const },
    { name: "DINPro", data: bold, weight: 700 as const, style: "normal" as const },
  ];
}
