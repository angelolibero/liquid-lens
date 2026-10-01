/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  EVERY NUMBER THE LOOK HAS, WHAT IT IS ALLOWED TO BE, AND WHAT IT DOES.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * One table, read by the renderer and by the panel, so a knob cannot exist in
 * the interface without existing in the shader or the other way round.
 *
 * THE BOUNDS ARE FACTS ABOUT THE MATHS AND NOT ABOUT TASTE. `thresh` past
 * about 1.2 is above the highest field a single body reaches, so the shape
 * disappears; `fade` at its floor is a hard cut with no shore at all. Both
 * ends of every range are meant to be reachable, because the two ends are the
 * things worth knowing about a number, and a range that hides them is a range
 * that lies about what the look can do.
 */
export type Knob = {
  key: string;
  /**
   * Which section of the panel it belongs to.
   *
   * FOUR AND NOT TWO, because a section is a claim that the things in it
   * answer one question, and twelve sliders under the word *Shape* answered
   * three: what a body IS, where its edge falls, and what you see through it.
   * A person hunting for the blur was reading eleven labels to find it.
   */
  group: "bodies" | "edge" | "picture" | "motion";
  /** What it is called in the panel. Two words, naming the EFFECT. */
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  /** One sentence, shown on hover. Say what it does, not what it is. */
  note: string;
};

export const KNOBS: Knob[] = [
  {
    key: "ball",
    group: "bodies",
    label: "Body size",
    min: 0.08,
    max: 0.7,
    step: 0.005,
    value: 0.455,
    note: "How big each body is, as a fraction of the light's radius.",
  },
  {
    key: "corner",
    group: "bodies",
    label: "Body corners",
    min: 1,
    max: 8,
    step: 0.1,
    value: 3.4,
    note: "1 is a diamond, 2 the circle, 8 all but a square. Turn the coast wander down or you will not see it.",
  },
  {
    key: "spacing",
    group: "bodies",
    label: "Body spacing",
    min: 0,
    max: 1,
    step: 0.005,
    value: 0.055,
    note: "How far apart the bodies sit when the pointer is still. At 0 they land on one point and there is nothing to merge.",
  },
  {
    key: "shrink",
    group: "bodies",
    label: "Trailing bodies",
    min: 0,
    max: 0.13,
    step: 0.005,
    value: 0,
    note: "How much smaller each body in the trail is than the one before it.",
  },
  {
    key: "thresh",
    group: "edge",
    label: "Merge level",
    min: 0.15,
    max: 1.2,
    step: 0.01,
    value: 0.35,
    note: "Where the level line sits in the field: low and everything fuses into one lake, high and the drops separate sooner.",
  },
  {
    key: "fade",
    group: "edge",
    label: "Fades to page",
    min: 0.02,
    max: 1.8,
    step: 0.01,
    value: 0.02,
    note: "The width of the shore. At the floor there is none and the edge is a cut.",
  },
  {
    key: "blur",
    group: "picture",
    label: "Blurred depth",
    min: 0.02,
    max: 1.5,
    step: 0.01,
    value: 1.34,
    note: "How deep into the body the picture takes to come back into focus.",
  },
  {
    key: "soft",
    group: "picture",
    label: "Blur strength",
    min: 0,
    max: 90,
    step: 0.5,
    value: 71.5,
    note: "How far out of focus the picture is at the shallow end, in pixels.",
  },
  {
    key: "warp",
    group: "edge",
    label: "Coast wander",
    min: 0,
    max: 1.4,
    step: 0.01,
    value: 1.4,
    note: "How far the noise pushes the boundary around, as a fraction of the radius. This is what makes the edge a coastline.",
  },
  {
    key: "grain",
    group: "edge",
    label: "Coast grain",
    min: 0.4,
    max: 22,
    step: 0.1,
    value: 4.7,
    note: "How fine that wander is. Low is a few broad bays, high is a ragged shore.",
  },
  {
    key: "veil",
    group: "picture",
    label: "Room light",
    min: 0,
    max: 0.9,
    step: 0.01,
    value: 0,
    note: "How much of the page's own paper is laid over the photograph inside the shape.",
  },
  /* ---- AND THE FIVE THAT ARE ABOUT MOVEMENT ---------------------------
     .
     This thing spends most of its life with nobody pointing at it, and what
     it does then is not a detail of the implementation: it is most of what a
     visitor sees. It was five constants buried in the frame loop, which is
     the same as saying the author's taste was the only taste allowed.
     .
     ALL FIVE GO TO ZERO AND THE RESULT IS STILL A PRODUCT: the light parks
     in the middle, the bodies sit still, the coast stops moving, and what is
     left is a shape that answers the pointer and nothing else. That is a
     legitimate way to use this and not a broken state, which is why zero is
     reachable on every one of them. */
  {
    key: "swell",
    group: "motion",
    label: "Size wander",
    min: 0,
    max: 0.9,
    step: 0.01,
    value: 0.09,
    note: "How much the light's radius breathes as it travels. Zero holds it at one size.",
  },
  {
    key: "tempo",
    group: "motion",
    label: "Overall speed",
    min: 0,
    max: 3,
    step: 0.05,
    value: 1,
    note: "The rate of everything that moves on its own. The three below are relative to it, so this is the one to reach for when it is simply too fast.",
  },
  {
    key: "drift",
    group: "motion",
    label: "Drift reach",
    min: 0,
    max: 0.5,
    step: 0.005,
    value: 0.26,
    note: "How far it wanders on its own when nobody is pointing, as a fraction of the box. At 0 it parks in the middle and waits.",
  },
  {
    key: "driftSpeed",
    group: "motion",
    label: "Drift speed",
    min: 0,
    max: 3,
    step: 0.05,
    value: 1,
    note: "How fast it travels that path. The path is two frequencies that do not divide each other, so it never quite repeats.",
  },
  {
    key: "chase",
    group: "motion",
    label: "Chase",
    min: 0.03,
    max: 0.6,
    step: 0.005,
    value: 0.26,
    note: "How quickly the bodies catch what they are following. Low is a long lagging trail, high is a shape glued to the pointer.",
  },
  {
    key: "churn",
    group: "motion",
    label: "Churn",
    min: 0,
    max: 3,
    step: 0.05,
    value: 1,
    note: "How fast each body walks its own small circle. This is the movement inside the shape when it is otherwise still.",
  },
  {
    key: "flow",
    group: "motion",
    label: "Coast flow",
    min: 0,
    max: 4,
    step: 0.05,
    value: 1,
    note: "How fast the coastline noise drifts. Keep it well under the speed of a hand or the surface boils.",
  },
];

export type Values = Record<string, number>;

export const DEFAULTS: Values = Object.fromEntries(
  KNOBS.map((knob) => [knob.key, knob.value]),
);
