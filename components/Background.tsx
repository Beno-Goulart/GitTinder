const noiseSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2"/></filter><rect width="120" height="120" filter="url(#n)"/></svg>';
const NOISE = `url("data:image/svg+xml;utf8,${encodeURIComponent(noiseSvg)}")`;

// Faint GitHub-contribution-grid motif along the bottom — the GitHub signature
// in the GitTinder backdrop. Printed in warm tan ink, a few cells pulse coral.
const CONTRIB_GRID_SVG = (() => {
  const cols = 30;
  const rows = 7;
  let rects = "";
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const seed = (r * 7 + c * 13) % 11;
      const lit = seed < 3;
      const attrs = lit
        ? ` fill="#ff4655" class="gt-grid-cell" style="--gt-dur:${2.4 + seed * 0.4}s"`
        : ` fill="#d8c8a2"`;
      rects += `<rect x="${c * 16}" y="${r * 16}" width="12" height="12" rx="2.5"${attrs}/>`;
    }
  }
  return `<svg width="${cols * 16}" height="${rows * 16}" viewBox="0 0 ${cols * 16} ${rows * 16}" style="width:100%;height:100%" aria-hidden="true">${rects}</svg>`;
})();

export default function Background() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-bg">
      {/* coral ambient — the "flame" action color, a soft top spotlight */}
      <div
        className="animate-flood absolute"
        style={{
          top: "-34%",
          left: "50%",
          width: "120%",
          height: "92%",
          background:
            "radial-gradient(50% 62% at 50% 0%, rgba(255,70,85,.10), rgba(255,244,224,.35) 46%, rgba(255,244,224,0) 72%)",
        }}
      />
      {/* left warm peach wash */}
      <div
        className="absolute"
        style={{
          top: "-10%",
          left: "4%",
          width: "38%",
          height: "78%",
          background: "radial-gradient(closest-side, rgba(255,122,69,.10), transparent 72%)",
          filter: "blur(18px)",
          transform: "rotate(16deg)",
        }}
      />
      {/* right whisper of rose — the match side, kept subtle */}
      <div
        className="absolute"
        style={{
          top: "-10%",
          right: "4%",
          width: "34%",
          height: "78%",
          background: "radial-gradient(closest-side, rgba(255,61,127,.07), transparent 72%)",
          filter: "blur(20px)",
          transform: "rotate(-16deg)",
        }}
      />
      {/* warm floor vignette */}
      <div
        className="absolute"
        style={{
          bottom: "-24%",
          left: "50%",
          width: "150%",
          height: "55%",
          transform: "translateX(-50%)",
          background: "radial-gradient(60% 100% at 50% 100%, rgba(120,90,40,.12), transparent 72%)",
        }}
      />
      {/* contribution-grid motif, faint along the bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 max-[980px]:hidden"
        style={{ height: "16%", opacity: 0.55, maskImage: "linear-gradient(to top, #000, transparent)", WebkitMaskImage: "linear-gradient(to top, #000, transparent)" }}
      >
        <div style={{ width: "100%", height: "100%" }} dangerouslySetInnerHTML={{ __html: CONTRIB_GRID_SVG }} />
      </div>
      <div className="absolute inset-0" style={{ opacity: 0.05, backgroundImage: NOISE, mixBlendMode: "multiply" }} />
    </div>
  );
}
