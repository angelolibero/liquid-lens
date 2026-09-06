import * as React from "react";
import { Moon, Sliders, Sun, X } from "lucide-react";

import { Controls } from "@/components/Controls";
import { useMediaQuery } from "@/use-media-query";
import { LiquidLens } from "@/liquid-lens/LiquidLens";
import { DEFAULTS, type Values } from "@/liquid-lens/knobs";
import { PHOTOS } from "@/liquid-lens/photos";
import { Button, buttonVariants } from "@/components/ui/button";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  THE DEMO. The effect at full bleed, and every number it has beside it.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * The panel is not decoration around the thing: it IS the thing. An effect
 * shown at one tuning is a screenshot that happens to move, and the only way
 * to find out whether it is any use to you is to push it until it breaks and
 * see where the useful part was.
 *
 * ---- IT TAKES ITS WIDTH RATHER THAN COVERING IT ------------------------
 *
 * The controls were a card floating over the picture, and a card over the
 * thing it controls is a card you are constantly moving your head around: the
 * bottom right of the effect was simply not visible while you tuned it. So on
 * a wide window this is a real column, full height, and the picture gets the
 * rest. Closing it gives the width back.
 *
 * THE CANVAS FOLLOWS BECAUSE IT MEASURES ITSELF. There is nothing here telling
 * the renderer that the box changed: it watches its host with a ResizeObserver
 * and re-reads every frame anyway, so a width animating over 300ms is just a
 * box that is a different size on each of those frames.
 *
 * ---- AND ON A PHONE IT IS NOT A COLUMN AT ALL --------------------------
 *
 * A 320px column on a 375px screen is the picture deleted. It is a sheet from
 * the bottom, capped at half the viewport, so the effect is always at least
 * half visible while you drag a slider. Two different objects, one content:
 * see `Controls`.
 */
export default function App() {
  const [values, setValues] = React.useState<Values>({ ...DEFAULTS });
  /* THE SELECT SAYS WHICH PRESET, AND A DRAGGED SLIDER CLEARS IT. A control
     that kept naming a preset after you had moved four of its numbers would
     be telling you that you are somewhere you are not. */
  const [preset, setPreset] = React.useState<string | null>("default");
  const [photo, setPhoto] = React.useState(PHOTOS[0]);
  const [custom, setCustom] = React.useState("");
  const [animate, setAnimate] = React.useState(true);

  /* ---- WHICH PANEL, AND WHETHER IT IS OPEN ON ARRIVAL -----------------
     .
     NEITHER OF THEM IS A DIALOG, and this took two goes to get right. The
     first version used shadcn's Sheet, which is Radix's Dialog: it draws an
     overlay, and an overlay over the picture is a scrim over the one thing
     you opened the panel to look at. Worse, a Dialog is MODAL. It marks the
     rest of the page inert, so with the sheet open you could not have put a
     finger on the picture at all, and moving your hand over the picture is
     the entire interaction. Half the screen of controls, and nothing to
     control.
     .
     So both are plain elements that slide, and the only difference between
     them is which axis: the column takes width off the side, the sheet takes
     height off the bottom and floats over what is left. Nothing is trapped
     and nothing is dimmed.
     .
     THEY OPEN DIFFERENTLY, because they cost different things. The column
     takes 320px off a wide window, a fair price for showing a visitor that
     every number here is theirs, so it is open on arrival. The sheet covers
     half a phone, so it waits to be asked. */
  const wide = useMediaQuery("(min-width: 768px)");
  const [open, setOpen] = React.useState(true);
  React.useEffect(() => setOpen(wide), [wide]);

  /* ---- THE SHEET IS DRAGGED DOWN, BECAUSE IT LOOKS LIKE IT CAN BE ------
     .
     The grab bar was decoration for one commit, and a bar that reads as a
     handle and does nothing when pulled is worse than no bar: it teaches a
     visitor that this page does not answer, on the first thing they try.
     .
     DOWN ONLY, and that is not laziness. The sheet is already at its full
     height, half the viewport, because the other half is the thing being
     tuned; there is nowhere up to go. `Math.max(0, …)` is the whole of that
     rule, and it also stops a rubber band upward that would promise a taller
     sheet that does not exist.
     .
     A THIRD OF THE WAY IS FAR ENOUGH to mean it. Shorter than that and every
     mis-swipe on a slider closes the panel; longer and a deliberate flick
     down bounces back, which reads as the page refusing you. */
  const [dragY, setDragY] = React.useState(0);
  const drag = React.useRef<{ from: number; height: number } | null>(null);
  /* THE DISTANCE IS IN A REF AS WELL AS IN STATE, and the release reads the
     ref. State is for drawing and belongs to a render; the decision at
     pointerup must be about where the finger actually IS, not about where it
     was in whichever render happened to create the handler. */
  const dragged = React.useRef(0);

  /* ---- THE RELEASE IS HEARD ON THE WINDOW AND NOT ON THE HANDLE --------
     .
     A drag that only ends when the pointer is lifted ON the thing it started
     on is a drag that gets stuck: let go a few pixels to the side, or let the
     browser take the pointer away, and the sheet stays where it was left,
     following nothing, with the page convinced a finger is still down. The
     window hears every release there is.
     .
     AND THEY ARE MOUNTED ONCE, not for the duration of each gesture. Mounting
     them when a drag starts loses the first move of that drag: the state that
     would trigger the effect is not committed until after the render, and a
     finger has already travelled by then. Two listeners that return on their
     first line when nothing is being dragged cost nothing; a dropped first
     frame is visible. */
  React.useEffect(() => {
    const move = (event: PointerEvent) => {
      if (!drag.current) return;
      dragged.current = Math.max(0, event.clientY - drag.current.from);
      setDragY(dragged.current);
    };
    const end = () => {
      const held = drag.current;
      drag.current = null;
      if (held && dragged.current > held.height / 3) setOpen(false);
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
    const sheet = event.currentTarget.parentElement;
    dragged.current = 0;
    drag.current = { from: event.clientY, height: sheet?.offsetHeight ?? 0 };
  };

  /* ---- THE THEME IS A CLASS ON THE ROOT AND NOTHING ELSE -----------------
     shadcn writes the light tokens on :root and the dark ones under .dark, so
     every component in the panel follows this by itself and there is no
     second palette to keep in step.
     .
     THE EFFECT FOLLOWS TOO, through `paper`: `Room light` mixes the picture
     toward the page's own paper, and a shape lit with black paper on a white
     page would be a hole rather than a body. */
  /* LIGHT ON ARRIVAL. The effect is a hole cut in a photograph, and a hole
     cut in a white page reads as a picture on paper, while the same hole on
     black reads as a screen with the lights off: the first is a thing you
     look at, the second is a thing that looks like a demo. The switch is
     right there for whoever disagrees. */
  const [dark, setDark] = React.useState(false);
  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const src = custom.trim() || photo.url;
  const touch =
    typeof window !== "undefined" &&
    !window.matchMedia("(pointer: fine)").matches;

  const controls = (
    <Controls
      values={values}
      setValues={setValues}
      preset={preset}
      setPreset={setPreset}
      photo={photo}
      setPhoto={setPhoto}
      custom={custom}
      setCustom={setCustom}
      animate={animate}
      setAnimate={setAnimate}
    />
  );

  return (
    <main className="bg-background text-foreground flex h-dvh w-full overflow-hidden">
      <section className="relative min-w-0 flex-1">
        {/* ---- THE ROOM THE PICTURE HANGS IN ---------------------------
            A dot field, and a STATIC one. Everything else on this page moves,
            and a ground that also moved would be a second thing competing
            with the shape for the eye; a ground that holds still is what
            makes the shape read as moving over something rather than as the
            whole screen being animated.
            .
            It is one CSS gradient rather than a canvas, which is the whole
            reason it can be here at all: this sits under a full-screen
            fragment shader and must cost nothing to draw. */}
        <div
          aria-hidden
          className="text-foreground/25 absolute inset-0 [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:22px_22px]"
        />

        <LiquidLens
          src={src}
          values={values}
          animate={animate}
          paper={dark ? "#0a0a0a" : "#ffffff"}
          className="absolute inset-0"
        />

        {/* ---- WHOSE IT IS, AND WHAT LIGHT IT IS IN ----------------------
            Top left, the corner nothing else uses: the panel owns the right,
            the name owns the foot, and a pointer crossing this corner on its
            way into the picture passes two small objects rather than a bar.
            .
            THE CREDIT IS THE REPOSITORY'S OWN NAME and not a word like
            *source*: it is the thing you would type to find this again, it
            says who wrote it in its first half, and it is shorter than the
            sentence that would explain it. No mark beside it: lucide dropped
            its brand glyphs, and a slash between two words already reads as a
            repository to everyone who would click it. */}
        <div className="absolute top-4 left-4 flex items-center gap-1.5">
          <Button
            variant="secondary"
            size="icon"
            aria-label={
              dark ? "Switch to the light page" : "Switch to the dark page"
            }
            onClick={() => setDark((on) => !on)}
          >
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
          {/* THE LINK WEARS THE BUTTON'S CLASSES rather than being slotted
              into one. Radix spells that `asChild` and Base UI spells it
              `render`, and this is a demo people will fork onto whichever of
              the two they already use: `buttonVariants` is the spelling that
              is the same in both. It is also honestly a link, so it should be
              an anchor with the look of a button and not a button pretending. */}
          <a
            href="https://github.com/angelolibero/liquid-lens"
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ variant: "secondary", size: "sm" })}
          >
            angelolibero/liquid-lens
          </a>
        </div>

        {/* THE HANDLE STAYS ON THE PICTURE and does not travel with the panel,
            because a control that moves 320px when you press it is a control
            you have to hunt for to press again. */}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setOpen((o) => !o)}
          className="absolute top-4 right-4"
        >
          {open ? (
            <>
              <X className="size-3.5" />
              <span className="hidden md:inline">Close</span>
            </>
          ) : (
            <>
              <Sliders className="size-3.5" />
              Controls
            </>
          )}
        </Button>

        {/* ---- THE PROJECT, ON PAPER OF ITS OWN --------------------------
            This was four lines of text laid straight on the picture, which is
            legible over a dark plateau and unreadable over a bright sky: the
            one thing on the page that changes under it is the very thing it
            was sitting on. A backdrop blur solves that without a solid card,
            because what it darkens is whatever happens to be behind it, and
            what it keeps is the sense that the picture continues underneath.
            .
            THE SURFACE IS THE PANEL'S, at seven tenths. The controls and this
            block are the two objects standing ON the effect, and two floating
            things in one screen made of different paper is how a page starts
            looking assembled from parts. The alpha is what stops it reading
            as a second panel: solid, it would be a card, and there is already
            a card.
            .
            `supports-[backdrop-filter]` because a browser without it gets the
            fallback alpha and no blur, which is a wash rather than a smear,
            and unreadable is worse than plain. */}
        <div className="pointer-events-none absolute bottom-6 left-6 max-w-sm rounded-xl border bg-[var(--panel)]/80 p-4 supports-[backdrop-filter]:bg-[var(--panel)]/60 supports-[backdrop-filter]:backdrop-blur-md">
          <h1 className="text-2xl font-semibold tracking-tight">Liquid lens</h1>
          <p className="text-muted-foreground mt-0.5 text-xs">
            by{" "}
            <a
              className="hover:text-foreground pointer-events-auto underline underline-offset-2"
              href="https://github.com/angelolibero"
              target="_blank"
              rel="noreferrer"
            >
              Angelo Libero
            </a>
          </p>
          <p className="text-muted-foreground mt-2 text-sm">
            {touch
              ? "Seven soft bodies that merge into one shape. It follows a pointer, so on a touch screen it drifts by itself."
              : "Move the pointer. Seven soft bodies chase it, their fields merge, and the picture is only drawn where they are."}
          </p>
          <p className="text-muted-foreground mt-3 text-xs">
            Photograph by{" "}
            <a
              className="hover:text-foreground pointer-events-auto underline underline-offset-2"
              href={photo.at}
              target="_blank"
              rel="noreferrer"
            >
              {photo.by}
            </a>{" "}
            on Unsplash
          </p>
        </div>
      </section>

      {/* ---- THE COLUMN, ON A WIDE WINDOW -------------------------------
          The width is what animates and the content inside is a fixed 320,
          so nothing reflows on the way: a panel whose labels rewrapped while
          it opened would be four hundred milliseconds of text moving.
          .
          `overflow-hidden` on the outside is what turns a width transition
          into a slide rather than a squeeze. */}
      <aside
        aria-hidden={!open}
        className={`hidden overflow-hidden border-l bg-[var(--panel)] transition-[width] duration-300 ease-out md:block ${
          open ? "w-[320px]" : "w-0"
        } motion-reduce:transition-none`}
      >
        <div className="h-full w-[320px] overflow-y-auto">{controls}</div>
      </aside>

      {/* ---- AND THE SHEET, ON A PHONE ---------------------------------
          Capped at half the viewport so the effect is never less than half
          visible while a slider is under the thumb: tuning something you
          cannot see is not tuning. It slides on a transform rather than being
          mounted and unmounted, which is what lets it leave as deliberately
          as it arrives.
          .
          THE GRAB BAR IS THE ONLY DECORATION and it is doing a job: this
          panel has no overlay and no shadow to say where it begins, so the
          top edge needs one mark that reads as *this is a thing lying over
          the page* rather than as the page ending. */}
      <div
        aria-hidden={!open}
        style={{
          transform: open ? `translateY(${dragY}px)` : undefined,
          /* NO TRANSITION WHILE A FINGER IS ON IT. An eased transform during
             a drag is the sheet arriving where the finger was 300ms ago,
             which feels like lag and is lag. */
          transition: drag.current ? "none" : undefined,
        }}
        className={`fixed inset-x-0 bottom-0 z-40 max-h-[50dvh] bg-[var(--panel)] overflow-y-auto rounded-t-2xl border-t transition-transform duration-300 ease-out md:hidden motion-reduce:transition-none ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* THE HANDLE IS A BUTTON AS WELL AS A GRIP, because a drag is not
            available to everybody: a tap closes it, and so does Return on a
            keyboard. `touch-none` so the browser does not read the drag as a
            scroll of the panel underneath it. */}
        <button
          type="button"
          aria-label="Close the controls"
          onClick={() => setOpen(false)}
          onPointerDown={startDrag}
          className="flex w-full touch-none justify-center py-3"
        >
          <span className="bg-border h-1 w-9 rounded-full" />
        </button>
        {controls}
      </div>

    </main>
  );
}
