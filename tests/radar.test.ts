import { describe, expect, it } from "vitest";
import { radarGeometry, radarSector } from "@/lib/radar";
import { TRAIT_LABELS, TRAITS } from "@/lib/dating/constants";
import type { Traits } from "@/lib/dating/types";

// We test the GEOMETRY the radar encodes: six axes in TRAITS order starting at
// 12 o'clock, values mapped 0–99 onto the radius, rings as even fractions, and
// labels anchored just outside the outer ring. The SVG dressing is React's job.

const traits = (
  spark: number,
  chat: number,
  style: number,
  loyal: number,
  care: number,
  energy: number,
): Traits => ({ spark, chat, style, loyal, care, energy });

const dist = (x: number, y: number, c: number) => Math.hypot(x - c, y - c);

describe("radarGeometry", () => {
  const size = 100;
  const geo = radarGeometry(traits(99, 99, 99, 99, 99, 99), size);
  const { center, radius } = geo;

  it("puts a maxed SPARK (first axis) straight up at the full radius", () => {
    const [spark] = geo.vertices;
    expect(spark.x).toBeCloseTo(center, 1);
    expect(spark.y).toBeCloseTo(center - radius, 1);
  });

  it("keeps the six vertices in TRAITS order, one per 60°", () => {
    expect(geo.vertices).toHaveLength(TRAITS.length);
    // All-equal traits make a regular hexagon: every vertex equidistant.
    for (const v of geo.vertices) {
      expect(dist(v.x, v.y, center)).toBeCloseTo(radius, 1);
    }
    // chat sits upper-right, energy upper-left (clockwise from the top).
    expect(geo.vertices[1].x).toBeGreaterThan(center);
    expect(geo.vertices[5].x).toBeLessThan(center);
  });

  it("scales a value linearly onto the radius", () => {
    const half = radarGeometry(traits(50, 50, 50, 50, 50, 50), size);
    for (const v of half.vertices) {
      expect(dist(v.x, v.y, center)).toBeCloseTo(radius * (50 / 99), 1);
    }
  });

  it("collapses zero traits to the center and clamps values above 99", () => {
    const zero = radarGeometry(traits(0, 0, 0, 0, 0, 0), size);
    for (const v of zero.vertices) {
      expect(v.x).toBeCloseTo(center, 1);
      expect(v.y).toBeCloseTo(center, 1);
    }
    const over = radarGeometry(traits(150, 99, 99, 99, 99, 99), size);
    expect(dist(over.vertices[0].x, over.vertices[0].y, center)).toBeCloseTo(radius, 1);
  });

  it("draws three rings, the outer one at the full radius", () => {
    expect(geo.rings).toHaveLength(3);
    const outerFirst = geo.rings[2].split(" ")[0].split(",").map(Number);
    expect(outerFirst[0]).toBeCloseTo(center, 1);
    expect(outerFirst[1]).toBeCloseTo(center - radius, 1);
  });

  it("anchors one label per trait, in order, just outside the outer ring", () => {
    expect(geo.labels.map((l) => l.label)).toEqual(TRAITS.map((k) => TRAIT_LABELS[k]));
    for (const l of geo.labels) {
      expect(dist(l.x, l.y, center)).toBeGreaterThan(radius);
      expect(l.x).toBeGreaterThanOrEqual(0);
      expect(l.y).toBeGreaterThanOrEqual(0);
      expect(l.x).toBeLessThanOrEqual(size);
      expect(l.y).toBeLessThanOrEqual(size);
    }
  });

  it("joins the vertices into the polygon points attribute", () => {
    expect(geo.points.split(" ")).toHaveLength(6);
    expect(geo.points.startsWith(`${geo.vertices[0].x},${geo.vertices[0].y}`)).toBe(true);
  });

  it("cuts one sector wedge per axis: centre → edge-mid → vertex → edge-mid", () => {
    expect(geo.sectors).toHaveLength(TRAITS.length);
    const pts = geo.sectors[0].split(" ").map((p) => p.split(",").map(Number));
    expect(pts).toHaveLength(4);
    expect(pts[0]).toEqual([center, center]);
    // the wedge's tip is the top vertex; its flanks sit on the hexagon's edges
    expect(pts[2][0]).toBeCloseTo(center, 1);
    expect(pts[2][1]).toBeCloseTo(center - radius, 1);
    const edgeMid = radius * Math.cos(Math.PI / 6);
    expect(dist(pts[1][0], pts[1][1], center)).toBeCloseTo(edgeMid, 1);
    expect(dist(pts[3][0], pts[3][1], center)).toBeCloseTo(edgeMid, 1);
  });

  it("radarSector scales to any radius (bigger interactive hit zones)", () => {
    const pts = radarSector(center, radius + 17, 3)
      .split(" ")
      .map((p) => p.split(",").map(Number));
    // axis 3 = LOYAL, straight down
    expect(pts[2][0]).toBeCloseTo(center, 1);
    expect(pts[2][1]).toBeCloseTo(center + radius + 17, 1);
  });
});
