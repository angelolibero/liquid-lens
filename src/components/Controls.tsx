import * as React from "react";

import { KNOBS, DEFAULTS, type Values } from "@/liquid-lens/knobs";
import { PHOTOS, type Photo } from "@/liquid-lens/photos";
import { PRESETS, valuesFor } from "@/liquid-lens/presets";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

/** The four questions the panel is sorted by, in the order they are decided. */
const SECTIONS = [
  { id: "bodies", label: "Bodies" },
  { id: "edge", label: "Edge" },
  { id: "picture", label: "Picture" },
  { id: "motion", label: "Movement" },
] as const;

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  THE CONTROLS, ONCE, FOR TWO CONTAINERS THAT ARE NOT THE SAME OBJECT.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * On a wide window this is a column that takes its own width off the picture.
 * On a phone it is a sheet that comes up over the bottom half. Those are two
 * genuinely different objects and neither is a scaled copy of the other, which
 * is exactly why what goes INSIDE them has to be one file: two panels that
 * were only nearly the same would disagree about a knob the first time either
 * was touched, and the one nobody was looking at would be the one that drifted.
 */
export function Controls({
  values,
  setValues,
  preset,
  setPreset,
  photo,
  setPhoto,
  custom,
  setCustom,
  animate,
  setAnimate,
}: {
  values: Values;
  setValues: React.Dispatch<React.SetStateAction<Values>>;
  preset: string | null;
  setPreset: (id: string | null) => void;
  photo: Photo;
  setPhoto: (photo: Photo) => void;
  custom: string;
  setCustom: (url: string) => void;
  animate: boolean;
  setAnimate: (on: boolean) => void;
}) {
  return (
    <div className="grid gap-0 p-4">
      {/* ---- THE PHOTOGRAPHS, AS THE PHOTOGRAPHS -----------------------
          They were five buttons saying *Plateau*, *Dune*, *Forest*, which is a
          list of words for a choice that is entirely about how something
          looks. A card with the frame in it answers the question before it is
          asked.
          .
          IT STARTS AND ENDS WHERE EVERYTHING ELSE DOES. It bled to the panel
          edges for one commit, on the usual argument that a strip which stops
          short of the edge reads as boxed rather than as continuing. The
          argument is real and it lost to a simpler one: this panel has a left
          margin, every label and every slider in it begins on that line, and
          one row starting 16px further out is the only thing in the column
          that does not line up. A ragged left edge costs more than a lost
          affordance.
          .
          SNAP POINTS, because a horizontal strip of five with no snapping
          leaves a card half cut at rest, and a half-cut photograph reads as a
          rendering fault rather than as an invitation to scroll.
          .
          THE SCROLLBAR IS HIDDEN and the overflow is not: on a trackpad it is
          a swipe and on a phone it is a swipe, and a grey bar under five
          photographs would be the only piece of furniture in this panel. */}
      <p className="mb-2 text-xs font-medium">Photograph</p>

      <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {PHOTOS.map((option) => {
          const on = !custom && option.id === photo.id;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={on}
              onClick={() => {
                setCustom("");
                setPhoto(option);
              }}
              className={`group ring-offset-background focus-visible:ring-ring w-[104px] shrink-0 snap-start rounded-lg text-left transition-opacity focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ${
                on ? "" : "opacity-60 hover:opacity-100"
              }`}
            >
              {/* THE RING IS ON THE FRAME AND NOT ON THE CARD, so the mark of
                  the current photograph sits on the picture itself: the label
                  under it is a caption and captions do not get selected.
                  .
                  AND IT IS INSET, which is not a style choice. A ring with an
                  offset is drawn OUTSIDE the element, and this element lives
                  in a scroller: `overflow-x-auto` clips vertically as well, so
                  the offset ring on the selected card was cut off top and
                  bottom, and on the first card it was cut off at the left as
                  well. Padding the scroller would have bought the room and
                  moved the first card off the margin every other row in this
                  panel begins on. Inset, there is nothing outside the box to
                  clip. */}
              <span
                className={`bg-muted block aspect-[8/5] w-full overflow-hidden rounded-lg ${
                  on ? "ring-foreground ring-2 ring-inset" : ""
                }`}
              >
                <img
                  src={option.card}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </span>
              <span
                className={`mt-1.5 block truncate text-[11px] ${
                  on ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {option.label}
              </span>
            </button>
          );
        })}
      </div>

      <Input
        value={custom}
        onChange={(event) => setCustom(event.target.value)}
        placeholder="or paste an image URL"
        spellCheck={false}
        className="mt-2.5 h-8 text-xs"
      />
      {/* SAID BEFORE IT FAILS AND NOT AFTER. A cross-origin image can be
          shown and not READ, and a texture is a read, so an image from a
          host with no CORS header draws nothing at all. */}
      <Separator className="my-4" />

      <Select
        value={preset ?? ""}
        onValueChange={(id) => {
          const found = PRESETS.find((option) => option.id === id);
          if (!found) return;
          setPreset(id);
          setValues(valuesFor(found));
        }}
      >
        <SelectTrigger size="sm" className="w-full">
          {/* THE LABEL IS PASSED IN RATHER THAN LEFT TO THE VALUE. The
              trigger reads the selected item's text out of the content,
              and the content is not mounted until it opens, so the first
              paint said `default` where it meant `Liquid lens`. */}
          <SelectValue placeholder="Custom">
            {PRESETS.find((option) => option.id === preset)?.label ??
              "Custom"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {PRESETS.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-muted-foreground mt-1.5 min-h-[2.5rem] text-[11px] leading-snug">
        {PRESETS.find((option) => option.id === preset)?.note ??
          "Your own tuning. Copy the values to keep it."}
      </p>

      <Separator className="my-4" />

      {/* ---- FOUR SECTIONS, AND EACH ONE ANSWERS ONE QUESTION ----
          What a body is, where its edge falls, what you see through it,
          and what it all does when nobody is pointing. Eighteen sliders
          in one column is a list; this is the same list with the three
          questions said out loud.
          .
          THE FIRST TWO OPEN. A panel that greets you closed is a panel
          that has hidden the thing you came to see, and these two are
          the ones that change the silhouette. */}
      {/* SEVERAL OPEN AT ONCE, which is a decision and not an accident:
          these four are not four answers to one question, they are four
          questions, and closing one to read another would make them compete.
          Base UI's accordion does this without being asked; Radix wants
          `type="multiple"` for the same behaviour. */}
      <Accordion defaultValue={["bodies", "edge"]} className="w-full">
        {SECTIONS.map((section) => (
          <AccordionItem key={section.id} value={section.id}>
            <AccordionTrigger className="py-3 text-xs">
              <span className="flex items-baseline gap-2">
                {section.label}
                <span className="text-muted-foreground text-[11px] font-normal">
                  {KNOBS.filter((k) => k.group === section.id).length}
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              {/* THE SWITCH IS THE FIRST ROW OF ITS OWN SECTION and not
                  a control on the header: a switch inside an accordion
                  trigger is a button inside a button, which is invalid
                  and which a keyboard cannot use. */}
              {section.id === "motion" ? (
                <div className="mb-4 flex items-center justify-between gap-2">
                  <Label
                    htmlFor="animate"
                    className="text-xs font-normal"
                  >
                    Moves on its own
                  </Label>
                  <Switch
                    id="animate"
                    checked={animate}
                    onCheckedChange={setAnimate}
                  />
                </div>
              ) : null}

              {/* DIMMED AND NOT REMOVED when the movement is off. A knob
                  that vanishes takes with it the explanation of what the
                  switch just did. */}
              <div
                className={
                  section.id === "motion" && !animate
                    ? "grid gap-4 opacity-40"
                    : "grid gap-4"
                }
              >
                {KNOBS.filter((knob) => knob.group === section.id).map(
                  (knob) => (
                    <div key={knob.key}>
                      <div className="mb-1.5 flex items-baseline justify-between gap-2">
                        <Label
                          htmlFor={knob.key}
                          title={knob.note}
                          className="cursor-help text-xs font-normal"
                        >
                          {knob.label}
                        </Label>
                        <span className="text-muted-foreground font-mono text-[11px] tabular-nums">
                          {values[knob.key].toFixed(
                            knob.step >= 1 ? 0 : knob.step >= 0.1 ? 1 : 3,
                          )}
                        </span>
                      </div>
                      <Slider
                        id={knob.key}
                        min={knob.min}
                        max={knob.max}
                        step={knob.step}
                        value={[values[knob.key]]}
                        onValueChange={(next) => {
                          setPreset(null);
                          setValues((current) => ({
                            ...current,
                            [knob.key]: Array.isArray(next)
                              ? next[0]
                              : next,
                          }));
                        }}
                      />
                    </div>
                  ),
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="mt-4 flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={() => {
            setPreset("default");
            setValues({ ...DEFAULTS });
          }}
        >
          Reset
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={() =>
            navigator.clipboard.writeText(JSON.stringify(values, null, 2))
          }
        >
          Copy values
        </Button>
      </div>
    </div>
  );
}
