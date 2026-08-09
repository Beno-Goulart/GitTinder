// Squircle corner mask, shared by the live DatingCard (browser mask-image) and
// the Satori PNG (lib/og/renderCard.tsx — the bundled Satori/resvg ignores
// border-radius clipping). Radius is always 10% of the card width, so the mask
// scales cleanly to any card size via mask-size: 100% 100%.
export const CARD_CORNER_RADIUS = 0.1; // fraction of card width

export function roundedCardMaskDataUri(w: number, h: number, r: number): string {
  const d =
    `M${r},0 H${w - r} A${r},${r} 0 0 1 ${w},${r} V${h - r} A${r},${r} 0 0 1 ${w - r},${h} ` +
    `H${r} A${r},${r} 0 0 1 0,${h - r} V${r} A${r},${r} 0 0 1 ${r},0 Z`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><path d="${d}" fill="#fff"/></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}
