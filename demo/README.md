# Liquid Lens demo

This Vite app uses the `liquid-lens` package from the repository root and shadcn/ui components for its panel. Try it at [angelolibero.github.io/liquid-lens](https://angelolibero.github.io/liquid-lens/). It is a working playground, not part of the package.

From the repository root:

```bash
npm ci
npm run build
cd demo
npm ci
npm run dev
```

Open the URL printed by Vite. Pick a photograph or paste an image URL from a host that sends CORS headers, choose a preset, or tune any knob. Copy config writes a component with the current tuning to the clipboard. On narrow screens the panel opens as a sheet from the bottom, and the picture stays touchable under it.

`cover.html` draws the README's cover with the real component at 1600×900; it is served by the dev server and not built.

`npm run build` in this directory checks TypeScript and emits a static site in `demo/dist/`. The Vite base path matches this repository's GitHub Pages URL. Pushes to `main` deploy the built demo through GitHub Actions.
