import { HugeiconsIcon } from "@hugeicons/react";
import { GithubIcon, PackageIcon } from "@hugeicons/core-free-icons";

import { LiquidLens } from "liquid-lens";
import { PHOTOS } from "@/photos";

/* ── THE README COVER, drawn by the component it advertises. A fixed 1600×900
   stage: `npm run dev`, open /liquid-lens/cover.html, and a headless Chrome
   at device scale 2 takes the picture. Nothing here ships: `vite build` only
   builds index.html. ── */

/* The demo's default tuning, held still on a short path, so the picture is
   the shape this repository is about and not one frame of a wide drift. The
   paper is the light page's ground, as the demo opens. */
const LENS = { drift: 0.08 };
const MARK = { ball: 0.26, spacing: 0.75, thresh: 0.5, warp: 0.25, grain: 1.2, fade: 0.05, blur: 0.4, soft: 3, drift: 0.06, churn: 1.4 };

function ReactMark() {
  return <svg viewBox="-11.5 -10.23 23 20.46" aria-hidden="true">
    <circle r="2.05" fill="currentColor" />
    <g stroke="currentColor" strokeWidth="1" fill="none">
      <ellipse rx="11" ry="4.2" />
      <ellipse rx="11" ry="4.2" transform="rotate(60)" />
      <ellipse rx="11" ry="4.2" transform="rotate(120)" />
    </g>
  </svg>;
}

export function Cover() {
  /* BY ID, NOT BY PLACE: the README's picture is this photograph, and the
     demo's list can reorder without the cover changing under it. */
  const photo = PHOTOS.find(option => option.id === "plateau")!;
  const paper = "#f4f4f4";
  return <div className="cover">
    <div className="cover-ground" aria-hidden="true" />
    <LiquidLens src={photo.url} values={LENS} follow={false} paper={paper} className="cover-lens" />

    <header className="cover-top">
      <span className="cover-mark" aria-hidden="true">
        <LiquidLens src={photo.card} values={MARK} follow={false} paper={paper} className="absolute inset-0" />
      </span>
      <span className="cover-badge"><ReactMark />React</span>
    </header>

    <div className="cover-copy">
      <h1>Liquid Lens</h1>
      <p>Soft bodies that chase the pointer and show a photograph only where they are.</p>
      <ul className="cover-list">
        <li><HugeiconsIcon icon={GithubIcon} />Free &amp; open source</li>
        <li><ReactMark />React component</li>
        <li><HugeiconsIcon icon={PackageIcon} />Plain WebGL, no dependencies</li>
      </ul>
    </div>
  </div>;
}

