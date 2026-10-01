# API

The package entry exports `LiquidLens`, the tuning table (`KNOBS`, `DEFAULTS`), the presets (`PRESETS`, `valuesFor`), and their TypeScript types. React is the only runtime peer.

## Component

| Prop | Default | Meaning |
| --- | ---: | --- |
| `src` | required | Image URL. It becomes a WebGL texture, so the host must send CORS headers (Unsplash's CDN does). A new `src` rebuilds the context. |
| `values` | `{}` | Any subset of the knobs, by key. Missing or `undefined` keys fall back to `DEFAULTS`. Read every frame, never through a re-render. |
| `animate` | `true` | `false` stops the clock: drift, churn, coastline flow and breathing stop in place. The chase still answers the pointer. |
| `follow` | `true` | `false` ignores the pointer and drifts for good. For a lens much smaller than the window. |
| `paper` | `"#0b0b0c"` | Hex colour of the page behind the lens; `Room light` (`veil`) mixes the picture toward it. Pass the page's own ground. |
| `className`, `style` | unset | The host box. The component sets no position or size of its own; give the host a size and a position, typically `position: absolute; inset: 0` inside a positioned parent. |

The canvas fills the host box. Outside the shape it is transparent, so the parent's background shows through. The pointer is read from `window` `pointermove` in the host's coordinates; touch pointers are ignored. Without a pointer, or 2.6 s after it leaves, the light drifts on its own. Drawing pauses while the document is hidden. The device pixel ratio is capped at 1.5, except for boxes under 160×160 CSS px, which draw at up to 3.

If WebGL is unavailable or the shader fails to compile, the host shows the error text in a `<pre>` at its foot.

## Tuning

`KNOBS` is an array of `{ key, group, label, min, max, step, value, note }`, one per number the look has, in the order a panel shows them. `group` is `"bodies" | "edge" | "picture" | "motion"`. `DEFAULTS` is `{ [key]: value }`. Both ends of every range are reachable on purpose; the README's tables say what each knob does.

`PRESETS` is an array of `{ id, label, note, values }`, where `values` is a partial set of knobs and the first preset, `"default"`, is empty. `valuesFor(preset)` returns a complete `Values` object with the defaults filled in.

```tsx
import { LiquidLens, PRESETS, valuesFor } from "liquid-lens";

const mercury = PRESETS.find(preset => preset.id === "mercury")!;
<LiquidLens src={url} values={valuesFor(mercury)} style={{ position: "absolute", inset: 0 }} />;
```
