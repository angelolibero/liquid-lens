# Verification

Run the package checks from the repository root:

```bash
npm ci
npm run typecheck
npm test
npm run build
npm run lint
npm --prefix demo ci
npm run demo:build
```

The package tests hold the tuning table to its promises: unique keys, defaults inside their ranges, presets that only name knobs that exist and stay in range, `valuesFor` filling every knob, and every uniform the component sets being declared by the shader. The demo build checks its TypeScript and emits the static site used by GitHub Pages. CI runs these checks on pushes and pull requests.

A shader is not seen by unit tests. For a change to how the lens draws or moves, open the demo and look at it in both themes, on wide and narrow viewports, with a mouse and with touch, and step through the presets.

To check Git packaging, install `git+https://github.com/angelolibero/liquid-lens.git` in a clean temporary React consumer and import `LiquidLens` from `liquid-lens`. The Git install runs `prepare`, which generates the JavaScript and declarations used by consumers.
