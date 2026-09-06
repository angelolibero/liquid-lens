import { DEFAULTS, type Values } from "./knobs";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  EIGHT TUNINGS, AND EACH ONE IS AN ARGUMENT ABOUT WHAT THE SHAPE IS.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Not eight skins of one look. The same eleven numbers can be a porthole, a
 * coastline, a scatter of mercury or a fogged window, and the distance between
 * those is what the panel is for: a person who drags one slider learns what
 * that slider does, and a person who steps through these learns what the
 * effect IS.
 *
 * EACH ONE STATES THE ONE MOVE IT MAKES. A preset that changed nine numbers
 * for no reason anybody could name would be a mood board entry; these each
 * turn one or two decisions hard over and let the rest follow.
 *
 * Anything a preset leaves out stays at the default, so the diff below is
 * also the explanation.
 *
 * THREE WERE CUT AND THE CUT IS THE POINT. `Porthole`, `Slab` and `Shard`
 * each demonstrated a knob honestly and none of them was worth looking at:
 * a clean circle, a rounded square and a spiky star, all of them the maths
 * showing its working rather than the effect being any good. A preset list is
 * a claim that these are the ones worth your time, and padding it with
 * legible-but-dull settings spends the visitor's attention proving something
 * the sliders would have proved anyway.
 */
export type Preset = {
  id: string;
  label: string;
  /** What it does, in one line, shown under the select. */
  note: string;
  values: Partial<Values>;
};

export const PRESETS: Preset[] = [
  {
    id: "default",
    label: "Liquid lens",
    note: "The one this was built for: a hard edge, a coastline for an outline, and a thickness of picture out of focus behind it.",
    values: {},
  },
  {
    id: "mercury",
    label: "Mercury",
    note: "The bodies pushed apart past where they can hold each other, so the mass breaks into drops joined by necks.",
    values: { spacing: 0.78, ball: 0.24, thresh: 0.5, fade: 0.04, warp: 0.25, corner: 2, blur: 0.5, soft: 34, churn: 1.6, chase: 0.14 },
  },
  {
    id: "tiles",
    label: "Tiles",
    note: "Mercury with the corners on: square pieces that still fuse into each other like something poured.",
    values: { spacing: 0.8, ball: 0.24, thresh: 0.5, fade: 0.03, warp: 0.05, corner: 7.6, blur: 0.5, soft: 40 },
  },
  {
    id: "mist",
    label: "Mist",
    note: "All shore and no body: the alpha climbs across most of the field, so nothing has a hard edge anywhere.",
    values: { fade: 1.5, blur: 1.5, soft: 90, warp: 0.5, ball: 0.62, thresh: 0.5, flow: 0.35, drift: 0.34, driftSpeed: 0.4 },
  },
  {
    id: "ink",
    label: "Ink",
    note: "A hard edge over a picture in focus, with the wander fine and wide: a silhouette torn out of the page rather than a body.",
    values: { warp: 1.4, grain: 13, fade: 0.02, blur: 0.06, soft: 4, corner: 2, ball: 0.42 },
  },
  {
    id: "frosted",
    label: "Frosted",
    note: "A wide shore, the deepest blur, and the room's own light mixed in. A pane of frosted glass you move over the picture.",
    values: { fade: 0.62, blur: 1.5, soft: 90, veil: 0.34, warp: 0.35, ball: 0.55 },
  },
  {
    id: "comet",
    label: "Comet",
    note: "The trail shrinking body by body, with a radius that breathes hard. It has a head and a tail while the pointer moves.",
    values: { shrink: 0.06, ball: 0.58, swell: 0.62, spacing: 0, warp: 0.3, fade: 0.05, blur: 0.7, soft: 48, chase: 0.1, drift: 0.34, driftSpeed: 1.8 },
  },
  {
    id: "lake",
    label: "Lake",
    note: "The level line dropped low and the bodies fat, so everything fuses into one calm mass with a broad slow coast.",
    values: { thresh: 0.18, ball: 0.62, warp: 0.8, grain: 1.6, fade: 0.06, blur: 1.2, soft: 62, flow: 0.25, driftSpeed: 0.3, churn: 0.3 },
  },
];

/**
 * A preset as a full set of numbers: its own, over the defaults.
 *
 * The keys are copied one at a time rather than spread, because a spread of a
 * Partial can put an `undefined` on a key under `exactOptionalPropertyTypes`,
 * and an `undefined` reaching the shader is a NaN uniform and a blank canvas.
 */
export function valuesFor(preset: Preset): Values {
  const merged: Values = { ...DEFAULTS };
  for (const [key, value] of Object.entries(preset.values)) {
    if (typeof value === "number") merged[key] = value;
  }
  return merged;
}
