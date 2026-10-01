import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { GithubIcon, Menu01Icon, PanelLeftIcon } from "@hugeicons/core-free-icons";

import { ControlPanel } from "@/components/Controls";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/use-media-query";
import { DEFAULTS, LiquidLens, type LiquidLensHandle, type Values } from "liquid-lens";
import { PHOTOS } from "@/photos";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  THE DEMO. The effect, and every number it has beside it.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * The panel is not decoration around the thing: it IS the thing. An effect
 * shown at one tuning is a screenshot that happens to move, and the only way
 * to find out whether it is any use to you is to push it until it breaks and
 * see where the useful part was.
 *
 * ---- THE SHELL IS THE FAMILY'S, NOT THIS PAGE'S ------------------------
 *
 * Docked column on the left with the brand at its head, the scene beside it,
 * one floating button to bring the column back, the credit in the bottom
 * right corner. That is Surface Field's demo, rule for rule, so the two read
 * as one author's work; `docs/DEMO_KIT.md` lists what is shared. What is this
 * page's own is the lens, the photographs, and the phone's sheet below.
 */
export default function App() {
  const [values, setValues] = React.useState<Values>({ ...DEFAULTS });
  const [preset, setPreset] = React.useState<string | null>("default");
  const [photo, setPhoto] = React.useState(PHOTOS[0]);
  const [custom, setCustom] = React.useState("");
  const [animate, setAnimate] = React.useState(true);

  /* ---- THE COLUMN AND THE SHEET ARE TWO SWITCHES ----------------------
     .
     The column is open on arrival, as the reference's is: 306px off a wide
     window is a fair price for showing a visitor that every number here is
     theirs. The sheet covers half a phone, so it waits to be asked. They are
     separate states so that turning a phone or narrowing a window does not
     carry a choice made for one object over to the other. */
  const wide = useMediaQuery("(min-width: 769px)");
  const [sidebar, setSidebar] = React.useState(true);
  const [sheet, setSheet] = React.useState(false);

  /* ---- THE THEME IS A CLASS ON THE ROOT, AND THE LENS READS ITS PAPER ----
     .
     LIGHT ON ARRIVAL. The effect is a hole cut in a photograph, and a hole in
     a white page reads as a picture on paper, while the same hole on black
     reads as a screen with the lights off.
     .
     THE PAPER IS READ FROM THE PAGE, NOT WRITTEN TWICE. `Room light` mixes
     the picture toward the page's own ground, and a ground copied here as a
     hex would be a second palette that the first token change leaves behind.
     .
     SET WHERE THE SWITCH IS PRESSED, not in an effect after it: the class
     goes on the root first, so the read that follows sees the new ground,
     and nothing renders once with the old paper on the new page. */
  const [dark, setDarkState] = React.useState(false);
  const [paper, setPaper] = React.useState(() => hexOf(getComputedStyle(document.body).backgroundColor));
  const setDark = (next: boolean) => {
    document.documentElement.classList.toggle("dark", next);
    setDarkState(next);
    setPaper(hexOf(getComputedStyle(document.body).backgroundColor));
  };

  /* ---- THE SHEET IS DRAGGED DOWN, BECAUSE IT LOOKS LIKE IT CAN BE ------
     .
     A grab bar that reads as a handle and does nothing when pulled teaches a
     visitor that this page does not answer, on the first thing they try.
     .
     DOWN ONLY: the sheet is already at its full height, half the viewport,
     because the other half is the thing being tuned. A THIRD OF THE WAY is
     far enough to mean it; shorter and every mis-swipe on a slider closes it.
     .
     THE DISTANCE IS IN A REF AS WELL AS IN STATE, and the release reads the
     ref: the decision at pointerup is about where the finger IS, not about
     where it was in whichever render made the handler. The release is heard
     on the window, so letting go a few pixels to the side still ends it, and
     the listeners are mounted once, so the first move of a drag is not lost. */
  const [dragY, setDragY] = React.useState(0);
  const drag = React.useRef<{ from: number; height: number } | null>(null);
  const dragged = React.useRef(0);
  React.useEffect(() => {
    const move = (event: PointerEvent) => {
      if (!drag.current) return;
      dragged.current = Math.max(0, event.clientY - drag.current.from);
      setDragY(dragged.current);
    };
    const end = () => {
      const held = drag.current;
      drag.current = null;
      if (held && dragged.current > held.height / 3) setSheet(false);
      dragged.current = 0;
      setDragY(0);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
  }, []);
  const startDrag = (event: React.PointerEvent<HTMLElement>) => {
    dragged.current = 0;
    drag.current = { from: event.clientY, height: event.currentTarget.parentElement?.offsetHeight ?? 0 };
  };

  /* ONE RING ON ARRIVAL, from the middle of the picture, once it has had
     time to load: the surface says it can be touched before anybody has
     found that out by accident. */
  const lens = React.useRef<LiquidLensHandle>(null);
  React.useEffect(() => {
    const first = window.setTimeout(() => lens.current?.ripple(), 900);
    return () => window.clearTimeout(first);
  }, []);

  const touch = typeof window !== "undefined" && !window.matchMedia("(pointer: fine)").matches;
  const panel = { values, setValues, preset, setPreset, photo, setPhoto, custom, setCustom, animate, setAnimate, dark, setDark, paper, touch };

  /* ONE PANEL MOUNTED AT A TIME, not one hidden by CSS: each carries the
     mark, and the mark is a WebGL context with its own frame loop. */
  return <div className="app-shell" data-sidebar={wide && sidebar ? "open" : "closed"}>
    {wide && sidebar && <aside className="control-sidebar"><ControlPanel {...panel} onClose={() => setSidebar(false)} /></aside>}

    <main className="stage">
      <div className="stage-ground" aria-hidden="true" />
      <LiquidLens ref={lens} src={custom.trim() || photo.url} values={values} animate={animate} paper={paper} className="stage-lens" />
    </main>

    {wide && !sidebar && <Button className="sidebar-open-button" variant="outline" size="icon" aria-label="Show controls" title="Show controls" onClick={() => setSidebar(true)}><HugeiconsIcon icon={PanelLeftIcon} size={17} /></Button>}

    {!wide && <>
      <Button className="mobile-controls-button" variant="outline" size="icon" aria-label="Open controls" aria-expanded={sheet} onClick={() => setSheet(true)}><HugeiconsIcon icon={Menu01Icon} size={18} /></Button>
      {/* NOT A DIALOG: see `.control-sheet`. `inert` while shut, so a tab
          key does not walk into a panel nobody can see. */}
      <div className="control-sheet" data-open={sheet} data-dragging={dragY > 0} inert={!sheet} style={{ "--sheet-drag": `${dragY}px` } as React.CSSProperties}>
        {/* THE GRIP IS A BUTTON AS WELL, because a drag is not available to
            everybody: a tap closes it, and so does Return. */}
        <button type="button" className="sheet-grip" aria-label="Close controls" onClick={() => setSheet(false)} onPointerDown={startDrag}><span /></button>
        <ControlPanel {...panel} />
      </div>
    </>}

    {/* THE CREDIT LINE IS THE REFERENCE'S, with the photographer in front:
        the picture is somebody else's work, and their name goes wherever the
        picture is, sidebar open or shut. */}
    <div className="viewport-credit">
      {!custom.trim() && <span>Photo by <a href={photo.at} target="_blank" rel="noopener noreferrer">{photo.by}</a> on Unsplash</span>}
      {!custom.trim() && <span aria-hidden="true">·</span>}
      <a className="credit-author" href="https://github.com/angelolibero" target="_blank" rel="noopener noreferrer">Made by Angelo Libero</a>
      <a href="https://github.com/angelolibero/liquid-lens" target="_blank" rel="noopener noreferrer" aria-label="Liquid Lens on GitHub" title="Liquid Lens on GitHub"><HugeiconsIcon icon={GithubIcon} size={14} /></a>
    </div>
  </div>;
}

/* ANY CSS COLOUR TO HEX, BY LETTING THE BROWSER PAINT IT. The page's ground
   is written in oklch and the lens wants three bytes; a one-pixel canvas is
   the converter every browser already ships, for every syntax it parses. */
function hexOf(color: string) {
  const context = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!context) return "#f4f4f4";
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
  return `#${[r, g, b].map(channel => channel.toString(16).padStart(2, "0")).join("")}`;
}
