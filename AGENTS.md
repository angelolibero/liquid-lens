# Working on Liquid Lens

This package must stand on its own. Its runtime may import React and its own modules only. Do not import Tailwind, shadcn, app CSS, or anything from `demo/`. The component takes `className` and `style` and never sets a position of its own: an inline position beats a caller's class.

`src/knobs.ts` is the one table of tuning: the renderer and every panel read it, so a knob cannot exist in one without the other. A new knob gets a row there with a range whose two ends are both worth reaching, a uniform in `src/shader.ts`, a lookup in `src/LiquidLens.tsx`, and a line in the README's tables. A preset names only knobs that exist, inside their range; the tests hold both.

Props reach the frame loop through refs written in a layout effect, never through a re-render of the canvas: a slider being dragged must not rebuild the context or drop the texture. Preserve the visibility pause, the device pixel ratio cap (and its exception for icon-sized boxes), the resize observer, the idle drift, touch being ignored by the chase, and the cleanup of every listener, timer, observer, frame and GL object on unmount.

Public API changes belong in `src/index.ts` and `docs/API.md`.

Run `npm run typecheck`, `npm test`, `npm run build` and `npm run lint` after changing the package, and `npm run demo:build` after changing the demo. For a visual change, look at the demo in both themes, wide and narrow, with a mouse and with touch; unit tests do not see a shader.

The demo's shell is shared with Surface Field's demo; `docs/DEMO_KIT.md` says which files, and a change to one of them is copied to the other in the same sitting.

Never use the Unicode em dash character in generated code, comments, or docs.
