import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircleIcon, Copy01Icon, RotateCcwIcon } from "@hugeicons/core-free-icons";

import { DEFAULTS, KNOBS, PRESETS, valuesFor, type Knob, type Values } from "liquid-lens";
import { PHOTOS, type Photo } from "@/photos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { HouseSlider } from "@/components/HouseSlider";
import { SidebarBrand } from "@/components/SidebarBrand";

/** The four questions the panel is sorted by, in the order they are decided. */
const SECTIONS = [
  { id: "bodies", label: "Bodies" },
  { id: "edge", label: "Edge" },
  { id: "picture", label: "Picture" },
  { id: "motion", label: "Movement" },
] as const;

/* WHAT `Copy config` WRITES is a component you can paste, as the reference's
   does, and not a dump of numbers: the values that differ from the defaults
   and nothing else, because the component already falls back to the rest and
   a diff is also the explanation of the tuning. */
function snippet(values: Values, src: string, animate: boolean) {
  const changed = Object.entries(values).filter(([key, value]) => value !== DEFAULTS[key]);
  const props = [
    `src=${JSON.stringify(src)}`,
    ...(changed.length ? [`values={{ ${changed.map(([key, value]) => `${key}: ${value}`).join(", ")} }}`] : []),
    ...(animate ? [] : ["animate={false}"]),
  ];
  return `import { LiquidLens } from "liquid-lens";\n\nexport function Lens() {\n  return (\n    <div style={{ position: "relative", height: 480 }}>\n      <LiquidLens\n${props.map(line => `        ${line}`).join("\n")}\n        style={{ position: "absolute", inset: 0 }}\n      />\n    </div>\n  );\n}`;
}

/* As many decimals as the step has, so a value never shows a digit the
   slider cannot move. */
const show = (knob: Knob, value: number) => value.toFixed(knob.step >= 1 ? 0 : knob.step >= 0.1 ? 1 : knob.step >= 0.01 ? 2 : 3);

export type ControlProps = {
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
  dark: boolean;
  setDark: (value: boolean) => void;
  paper: string;
  /** Said differently on a touch screen, where the lens drifts by itself. */
  touch: boolean;
};

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  THE CONTROLS, ONCE, FOR TWO CONTAINERS THAT ARE NOT THE SAME OBJECT.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * On a wide window this is the docked column, on a phone the sheet from the
 * foot. What goes inside is one component, because two panels that were only
 * nearly the same would disagree about a knob the first time either was
 * touched, and the one nobody was looking at would be the one that drifted.
 *
 * THE ORDER AND THE PARTS ARE THE REFERENCE'S: the brand, one paragraph of
 * what to do, then groups under a bold title, each cut from the next by a
 * hairline. No accordion. Eighteen sliders in four open groups is a long
 * column, and a long column scrolls; four closed boxes is a column that hides
 * the thing you came to see and asks you to find it.
 */
export function ControlPanel({ onClose, ...props }: ControlProps & { onClose?: () => void }) {
  const { values, setValues, preset, setPreset, photo, setPhoto, custom, setCustom, animate, setAnimate } = props;
  const [copied, setCopied] = React.useState(false);
  const urlId = React.useId();
  const animateId = React.useId();
  const chosen = PRESETS.find(option => option.id === preset);

  const reset = () => { setPreset("default"); setValues({ ...DEFAULTS }); setAnimate(true); };
  const copy = async () => {
    await navigator.clipboard.writeText(snippet(values, custom.trim() || photo.url, animate));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };
  /* A DRAGGED SLIDER CLEARS THE PRESET. A select that kept naming a preset
     after four of its numbers had moved would say you are somewhere you are not. */
  const turn = (key: string, value: number) => {
    setPreset(null);
    setValues(current => ({ ...current, [key]: value }));
  };

  return <div className="controls">
    <SidebarBrand dark={props.dark} setDark={props.setDark} onClose={onClose} photo={photo.card} paper={props.paper} />
    <div className="controls-intro">
      <p>{props.touch
        ? "Seven soft bodies merge into one shape and show the picture only where they are. It follows a pointer, so on a touch screen it drifts by itself."
        : "Move the pointer. Seven soft bodies chase it, their fields merge, and the picture is only drawn where they are."}</p>
    </div>
    <Separator />

    {/* THE PHOTOGRAPHS AS THE PHOTOGRAPHS. Five words for a choice that is
        entirely about how something looks would be a list to decode; a card
        with the frame in it answers the question before it is asked. */}
    <div className="control-group">
      <div className="group-title"><span>Photograph</span></div>
      <div className="photo-strip">
        {PHOTOS.map(option => {
          const on = !custom && option.id === photo.id;
          return <button key={option.id} type="button" className="photo-card" aria-pressed={on} onClick={() => { setCustom(""); setPhoto(option); }}>
            <span className="photo-frame"><img src={option.card} alt="" loading="lazy" /></span>
            <span className="photo-label">{option.label}</span>
          </button>;
        })}
      </div>
      {/* SAID BEFORE IT FAILS AND NOT AFTER: a cross-origin image can be
          shown and not READ, and a texture is a read, so an image from a host
          with no CORS header draws nothing at all. */}
      <Label htmlFor={urlId} className="sr-only">Image URL</Label>
      <Input id={urlId} value={custom} onChange={event => setCustom(event.target.value)} placeholder="or paste an image URL (needs CORS)" spellCheck={false} />
    </div>
    <Separator />

    <div className="control-group">
      <div className="group-title group-title-action"><span>Preset</span><Button variant="ghost" size="icon-xs" aria-label="Reset to Liquid lens" title="Reset to Liquid lens" onClick={reset}><HugeiconsIcon icon={RotateCcwIcon} className="size-4" /></Button></div>
      <div className="preset-row">
        <Select value={preset ?? "custom"} onValueChange={id => {
          const found = PRESETS.find(option => option.id === id);
          if (!found) return;
          setPreset(id);
          setValues(valuesFor(found));
        }}>
          {/* THE LABEL IS PASSED IN rather than left to the value: the
              trigger reads the item's text out of the content, which is not
              mounted until it opens, so the first paint said `default`. */}
          <SelectTrigger aria-label="Lens preset" className="w-full"><SelectValue placeholder="Custom">{chosen?.label ?? "Custom"}</SelectValue></SelectTrigger>
          <SelectContent>
            {PRESETS.map(option => <SelectItem key={option.id} value={option.id}>{option.label}</SelectItem>)}
            {!chosen && <SelectItem value="custom" disabled>Custom</SelectItem>}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" title="Copy React config" onClick={copy}><HugeiconsIcon icon={copied ? CheckmarkCircleIcon : Copy01Icon} size={15} />{copied ? "Copied" : "Copy config"}</Button>
      </div>
      <p className="control-note">{chosen?.note ?? "Your own tuning. Copy config keeps it."}</p>
      <span className="sr-only" role="status" aria-live="polite">{copied ? "React config copied" : ""}</span>
    </div>

    {SECTIONS.map(section => <React.Fragment key={section.id}>
      <Separator />
      <div className="control-group">
        <div className="group-title"><span>{section.label}</span></div>
        {/* THE SWITCH IS THE FIRST ROW OF ITS SECTION, and the knobs it stops
            stay in place, dimmed: see `.is-dimmed`. */}
        {section.id === "motion" && <div className="switch-row">
          <div><Label htmlFor={animateId}>Moves on its own</Label><p>The chase still answers the hand</p></div>
          <Switch id={animateId} checked={animate} onCheckedChange={setAnimate} />
        </div>}
        {KNOBS.filter(knob => knob.group === section.id).map(knob => <SliderRow key={knob.key} knob={knob} value={values[knob.key]} dimmed={section.id === "motion" && !animate} onChange={value => turn(knob.key, value)} />)}
      </div>
    </React.Fragment>)}
  </div>;
}

function SliderRow({ knob, value, dimmed, onChange }: { knob: Knob; value: number; dimmed: boolean; onChange: (value: number) => void }) {
  const inputId = `${React.useId()}-${knob.key}`;
  return <div className={dimmed ? "slider-row is-dimmed" : "slider-row"}>
    <div className="control-line"><Label htmlFor={inputId} title={knob.note}>{knob.label}</Label><span className="control-value">{show(knob, value)}</span></div>
    <HouseSlider id={inputId} label={knob.label} value={value} min={knob.min} max={knob.max} step={knob.step} onChange={onChange} />
  </div>;
}
