import { describe, expect, it } from "vitest";
import { DEFAULTS, KNOBS } from "./knobs.js";
import { PRESETS, valuesFor } from "./presets.js";
import { SOURCE } from "./shader.js";

/* The table is read by the renderer and by every panel built on it, so these
   are the promises a panel relies on: a knob is reachable at both ends, its
   default is on its own slider, and a preset never names a knob that is not
   there or a value the slider cannot show. */
describe("knobs", () => {
  it("have unique keys", () => {
    expect(new Set(KNOBS.map(knob => knob.key)).size).toBe(KNOBS.length);
  });

  it("keep their default inside their range, on a positive step", () => {
    for (const knob of KNOBS) {
      expect(knob.min, knob.key).toBeLessThan(knob.max);
      expect(knob.step, knob.key).toBeGreaterThan(0);
      expect(knob.value, knob.key).toBeGreaterThanOrEqual(knob.min);
      expect(knob.value, knob.key).toBeLessThanOrEqual(knob.max);
    }
  });

  it("give DEFAULTS one value per knob", () => {
    expect(Object.keys(DEFAULTS).sort()).toEqual(KNOBS.map(knob => knob.key).sort());
  });
});

describe("presets", () => {
  it("have unique ids and start with the default tuning", () => {
    expect(new Set(PRESETS.map(preset => preset.id)).size).toBe(PRESETS.length);
    expect(PRESETS[0].id).toBe("default");
    expect(PRESETS[0].values).toEqual({});
  });

  it("only name knobs that exist, inside their range", () => {
    const byKey = new Map(KNOBS.map(knob => [knob.key, knob]));
    for (const preset of PRESETS) {
      for (const [key, value] of Object.entries(preset.values)) {
        const knob = byKey.get(key);
        expect(knob, `${preset.id}.${key}`).toBeDefined();
        expect(value, `${preset.id}.${key}`).toBeGreaterThanOrEqual(knob!.min);
        expect(value, `${preset.id}.${key}`).toBeLessThanOrEqual(knob!.max);
      }
    }
  });

  it("fill every knob, falling back to the default and dropping undefined", () => {
    const values = valuesFor({ id: "t", label: "T", note: "", values: { ball: 0.3, warp: undefined } });
    expect(Object.keys(values).sort()).toEqual(Object.keys(DEFAULTS).sort());
    expect(values.ball).toBe(0.3);
    expect(values.warp).toBe(DEFAULTS.warp);
  });
});

describe("shader", () => {
  it("compiles from two non-empty sources", () => {
    expect(SOURCE.VERTEX).toContain("aPos");
    expect(SOURCE.FRAGMENT).toContain("void main");
  });

  /* The component looks these up by name, and a uniform the shader does not
     declare is a null location: the knob would move and nothing would change. */
  it("declares every uniform the component sets", () => {
    for (const name of ["uImage", "uImageSize", "uRes", "uR", "uTime", "uBlob", "uPaper", "uThresh", "uFade", "uBlur", "uSoft", "uWarp", "uGrain", "uCorner", "uVeil", "uFlow", "uRipple", "uRippleStrength", "uRippleSpeed", "uRippleWidth", "uRippleDecay"]) {
      expect(SOURCE.FRAGMENT, name).toMatch(new RegExp(`uniform\\s+\\w+\\s+${name}\\b`));
    }
  });
});
