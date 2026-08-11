"use client";

import { useState } from "react";
import { radarGeometry, radarSector } from "@/lib/radar";
import { TRAIT_DESCRIPTIONS, TRAIT_LABELS, TRAITS } from "@/lib/dating/constants";
import { profileTheme, rgba } from "@/lib/dating/theme";
import type { DatingProfile } from "@/lib/dating/types";

const SIZE = 150; // viewBox unit — the svg scales to its container width

// The pair overlay: both profiles' radar shapes drawn on the same axes so the
// compatibility test shows where their trait polygons overlap and diverge.
// Each shape keeps its own tier accent; hover an axis to compare scores.
export default function CompatRadar({
  a,
  b,
  accent,
}: {
  a: DatingProfile;
  b: DatingProfile;
  accent: string;
}) {
  const geoA = radarGeometry(a.stats, SIZE);
  const geoB = radarGeometry(b.stats, SIZE);
  const geo = geoA; // rings/labels/sectors are shared — axes don't depend on stats
  const outer = geo.rings.length - 1;
  const [active, setActive] = useState<number | null>(null);
  const dimmed = (i: number) => active !== null && active !== i;

  const acA = profileTheme(a).accent;
  const acB = profileTheme(b).accent;
  const key = (i: number) => TRAITS[i];

  return (
    <div className="relative w-full">
      {/* legend — which color belongs to which profile */}
      <div className="mb-3 flex items-center justify-center gap-5">
        {[{ p: a, color: acA }, { p: b, color: acB }].map(({ p, color }) => (
          <span
            key={p.login}
            className="flex items-center gap-[6px] text-[12px] font-medium text-ink-soft"
          >
            <span className="h-[8px] w-[8px] rounded-full" style={{ background: color }} />
            @{p.login}
          </span>
        ))}
      </div>

      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full">
        {geo.rings.map((ring, i) => (
          <polygon
            key={ring}
            points={ring}
            fill="none"
            stroke={i === outer ? "rgba(25,21,33,.12)" : "rgba(25,21,33,.06)"}
          />
        ))}

        {/* the focused wedge — the active trait's whole sector takes the light */}
        {active !== null && (
          <polygon
            points={geo.sectors[active]}
            fill={rgba(accent, 0.13)}
            stroke={rgba(accent, 0.3)}
            style={{ animation: "pop .16s cubic-bezier(.16,1,.3,1) both" }}
          />
        )}

        {/* both shapes overlaid, each in its tier accent */}
        {[{ g: geoA, color: acA }, { g: geoB, color: acB }].map(({ g, color }) => (
          <polygon
            key={color}
            points={g.points}
            fill={rgba(color, active !== null ? 0.14 : 0.2)}
            stroke={color}
            strokeWidth="1.4"
            strokeLinejoin="round"
            strokeOpacity={active !== null ? 0.5 : 1}
            style={{ transition: "fill .25s ease, stroke-opacity .25s ease" }}
          />
        ))}

        {[{ g: geoA, color: acA }, { g: geoB, color: acB }].map(({ g, color }) =>
          g.vertices.map((v, i) => (
            <circle
              key={`${color}-${geo.labels[i].label}`}
              cx={v.x}
              cy={v.y}
              r={active === i ? 3 : 1.8}
              fill={color}
              opacity={dimmed(i) ? 0.3 : 1}
              style={{ transition: "r .2s ease, opacity .25s ease" }}
            />
          )),
        )}

        {geo.labels.map((l, i) => (
          <text
            key={l.label}
            x={l.x}
            y={l.y}
            textAnchor="middle"
            dominantBaseline="central"
            className="font-display"
            letterSpacing="1"
            fill="var(--color-ink-faint)"
            opacity={dimmed(i) ? 0.3 : 1}
            style={{
              fontSize: active === i ? 11 : 9.5,
              transition: "opacity .25s ease, font-size .2s ease",
            }}
          >
            {l.label}
          </text>
        ))}

        {/* hit zones */}
        {TRAITS.map((trait, i) => (
          <polygon
            key={trait}
            points={radarSector(geo.center, geo.radius + 17, i)}
            fill="transparent"
            role="button"
            tabIndex={0}
            aria-label={`${TRAIT_LABELS[trait]} — ${a.stats[trait]} vs ${b.stats[trait]}`}
            className="cursor-pointer focus:outline-none"
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive((v) => (v === i ? null : v))}
            onClick={() => setActive((v) => (v === i ? null : i))}
            onFocus={() => setActive(i)}
            onBlur={() => setActive((v) => (v === i ? null : v))}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setActive((v) => (v === i ? null : i));
              }
            }}
          />
        ))}
      </svg>

      {/* the pop-up — both scores on the hovered trait */}
      {active !== null && (
        <div
          className="pointer-events-none absolute z-10 whitespace-nowrap rounded-lg border border-line bg-surface px-[10px] py-[6px] text-center shadow-[0_10px_28px_-8px_rgba(0,0,0,.7)]"
          style={{
            left: `${(geo.labels[active].x / SIZE) * 100}%`,
            top: `${(geo.labels[active].y / SIZE) * 100}%`,
            transform: "translate(-50%, calc(-100% - 8px))",
            animation: "pop .16s cubic-bezier(.16,1,.3,1) both",
          }}
        >
          <div className="font-display text-[9.5px] font-bold tracking-[.22em] text-ink-faint">
            {TRAIT_LABELS[key(active)]}
          </div>
          <div className="mt-[3px] flex items-center justify-center gap-3">
            <span className="flex items-center gap-[5px] text-[10.5px] tabular-nums text-ink-dim">
              <span className="h-[6px] w-[6px] rounded-full" style={{ background: acA }} />
              {a.stats[key(active)]}
            </span>
            <span className="flex items-center gap-[5px] text-[10.5px] tabular-nums text-ink-dim">
              <span className="h-[6px] w-[6px] rounded-full" style={{ background: acB }} />
              {b.stats[key(active)]}
            </span>
          </div>
          <div className="mt-[2px] max-w-[150px] whitespace-normal break-words text-[9.5px] leading-snug text-ink-mute">
            {TRAIT_DESCRIPTIONS[key(active)]}
          </div>
        </div>
      )}
    </div>
  );
}
