# Contributing

Install dependencies with `npm ci`. Before proposing a package change, run `npm run typecheck`, `npm test`, `npm run build` and `npm run lint`. For demo changes, also run `npm --prefix demo ci` and `npm run demo:build`.

Keep the package independent of host applications and of the demo's shadcn/ui code. Public API changes belong in `src/index.ts` and `docs/API.md`. A new knob goes in `src/knobs.ts` with a uniform in the shader; a new preset turns one or two decisions hard over and says in its note what the move was.

If you change how the shader draws or how the bodies move, compare it in the demo against the previous version, in both themes. A visual change needs a visual check.
