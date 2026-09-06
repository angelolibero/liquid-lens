import * as React from "react";

import { BODIES, SOURCE } from "./shader";
import { DEFAULTS, type Values } from "./knobs";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  THE COMPONENT. A photograph, a pointer, and one canvas over the box.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Give it an image URL and it fills whatever box it is in. Everything else has
 * a default that works.
 *
 * `values` IS READ INSIDE THE FRAME AND NOT THROUGH REACT. Turning a knob
 * writes to a ref that the loop picks up on its next frame, so a slider being
 * dragged never re-renders the tree above this canvas. A renderer that
 * re-mounted on every pixel of slider travel would rebuild the context and
 * drop the texture, which is how a knob becomes something you set rather than
 * something you TURN.
 */
export function LiquidLens({
  src,
  values,
  animate = true,
  paper = "#0b0b0c",
  className,
}: {
  /** Any image the browser can load with CORS. Unsplash's CDN sends the
      header, so its URLs work as they are. */
  src: string;
  /** The knobs. Anything left out falls back to that knob's default. */
  values?: Partial<Values>;
  /**
   * Whether it moves on its own. False stops the clock and nothing else: see
   * the frame loop for why that is the whole implementation.
   */
  animate?: boolean;
  /** The room's own paper: what `Room light` mixes toward, and what a
      no-WebGL fallback would stand on. */
  paper?: string;
  className?: string;
}) {
  const hostRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = React.useState<string | null>(null);

  /* `exactOptionalPropertyTypes` is on in this template, so a spread of a
     Partial can put `undefined` on a key. The merge drops those rather than
     letting one reach the shader as NaN. */
  const merged: Values = { ...DEFAULTS };
  for (const [key, value] of Object.entries(values ?? {})) {
    if (typeof value === "number") merged[key] = value;
  }
  const valuesRef = React.useRef<Values>(merged);
  valuesRef.current = merged;

  const paperRef = React.useRef(paper);
  paperRef.current = paper;

  const animateRef = React.useRef(animate);
  animateRef.current = animate;

  React.useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: false,
    });
    if (!gl) {
      setFailed("This browser would not give a WebGL context.");
      return;
    }

    /* ---- THE PROGRAM ------------------------------------------------- */
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        setFailed(gl.getShaderInfoLog(shader) ?? "Shader would not compile.");
        return null;
      }
      return shader;
    };
    const vs = compile(gl.VERTEX_SHADER, SOURCE.VERTEX);
    const fs = compile(gl.FRAGMENT_SHADER, SOURCE.FRAGMENT);
    if (!vs || !fs) return;

    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      setFailed(gl.getProgramInfoLog(program) ?? "Program would not link.");
      return;
    }
    gl.useProgram(program);

    /* One triangle pair covering the clip box. There is no geometry in this
       effect: every shape it draws is decided per pixel. */
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const aPos = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const at = (name: string) => gl.getUniformLocation(program, name);
    const uImage = at("uImage");
    const uImageSize = at("uImageSize");
    const uRes = at("uRes");
    const uR = at("uR");
    const uTime = at("uTime");
    const uBlob = at("uBlob");
    const uPaper = at("uPaper");
    const knobLoc: Record<string, WebGLUniformLocation | null> = {
      thresh: at("uThresh"),
      fade: at("uFade"),
      blur: at("uBlur"),
      soft: at("uSoft"),
      warp: at("uWarp"),
      grain: at("uGrain"),
      corner: at("uCorner"),
      veil: at("uVeil"),
      flow: at("uFlow"),
    };

    /* ---- THE PICTURE -------------------------------------------------- */
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    /* A single grey pixel while the photograph is on the wire, so the first
       frames draw the shape rather than nothing. */
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA,
      gl.UNSIGNED_BYTE, new Uint8Array([90, 90, 92, 255]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.uniform1i(uImage, 0);
    gl.uniform2f(uImageSize, 1, 1);

    let alive = true;
    const image = new Image();
    /* WITHOUT THIS THE CANVAS IS TAINTED and the draw fails silently: a
       cross-origin image may be shown but not READ, and a texture is a read. */
    image.crossOrigin = "anonymous";
    image.onload = () => {
      if (!alive) return;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.uniform2f(uImageSize, image.naturalWidth, image.naturalHeight);
    };
    image.onerror = () =>
      alive && setFailed(`That image would not load: ${src}`);
    image.src = src;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    /* ---- THE POINTER, AND WHAT HAPPENS WHEN THERE IS NONE -------------
       The light drifts along a slow lissajous until a pointer arrives, and
       goes back to drifting a few seconds after one leaves. A hero that sits
       in a corner waiting to be discovered is a hero nobody discovers.
       .
       TOUCH IS IGNORED ON PURPOSE. A finger is not a hovering hand, and a
       light that jumped to wherever somebody last tapped would be a light
       being poked. On a touch device this drifts, which is also why the demo
       page hands those devices a still picture instead. */
    let box = host.getBoundingClientRect();
    const target = { x: box.width / 2, y: box.height / 2 };
    let drifting = true;
    let idle: ReturnType<typeof setTimeout> | null = null;

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      box = host.getBoundingClientRect();
      target.x = event.clientX - box.left;
      target.y = event.clientY - box.top;
      drifting = false;
      if (idle) clearTimeout(idle);
      idle = setTimeout(() => (drifting = true), 2600);
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    /* ---- THE BODIES ---------------------------------------------------
       Each chases the pointer at its own rate, so they string out along the
       path while it moves and gather when it stops. The slow circle each one
       walks, at its own phase, is what holds them apart at rest: without it
       the seven sit on one point and the shape is a plain disc with nothing
       merging inside it. */
    const blob = new Float32Array(BODIES * 4);
    const bx = new Float32Array(BODIES).fill(target.x);
    const by = new Float32Array(BODIES).fill(target.y);

    let raf = 0;
    let last = 0;
    let clock = 0;
    const phase = Math.random() * 6.283;

    const resize = () => {
      box = host.getBoundingClientRect();
      /* Capped device pixel ratio: this is a full-box fragment shader with a
         twelve-tap blur in it, and a phone's 3x would be nine times the work
         for a difference nobody can see through a blur. */
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.max(1, Math.round(box.width * dpr));
      const h = Math.max(1, Math.round(box.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      return dpr;
    };

    const paperRGB = () => {
      const hex = paperRef.current.replace("#", "");
      const n = parseInt(hex.length === 3
        ? hex.split("").map((c) => c + c).join("")
        : hex, 16);
      return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
    };

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (document.visibilityState !== "visible") return;

      const dpr = resize();
      gl.viewport(0, 0, canvas.width, canvas.height);

      const steps = Math.min(3, Math.max(0.2, (now - last || 16.7) / 16.7));
      const dt = Math.min(0.1, (now - last || 16.7) / 1000);
      last = now;

      /* ---- THE SWITCH IS ONE LINE, AND THAT IS WHY IT IS TRUSTWORTHY -----
         .
         Everything that happens without a hand on the page is a function of
         this clock: the drift along its path, the circle each body walks, the
         drifting coastline noise, the radius breathing. Freeze the clock and
         all four stop together, in the positions they were in, with nothing
         to keep in step and no second code path to go stale.
         .
         THE CHASE IS NOT ON THE CLOCK and keeps working, which is the whole
         point of the distinction: `steps` is real elapsed time and answers
         the pointer. Off, this is a shape that does exactly what your hand
         does and nothing else. */
      const knob = (key: string) => valuesRef.current[key] ?? DEFAULTS[key];

      /* THE SPEED IS ON THE CLOCK AND NOT ON EACH BEHAVIOUR, for the same
         reason the switch is: the drift, the churn, the coastline and the
         breathing radius are one motion seen four ways, and three of them
         speeding up while the fourth did not is how a thing stops looking
         like one thing. `Drift speed`, `Churn` and `Coast flow` are rates
         RELATIVE to this, so this is the knob for *it is too fast* and those
         are the knobs for *that part is too fast*.
         .
         AT 0 IT IS THE SWITCH, and the switch stays anyway: turning it off is
         a decision and 0 is a value, and a person who wants the thing still
         should not have to express that as an amount. */
      if (animateRef.current) clock += dt * knob("tempo");


      if (drifting) {
        /* A lissajous inside the box, well away from its edges. Two
           frequencies that do not divide each other, so the path never quite
           repeats and never reads as a loop. `Drift reach` at 0 collapses it
           to the centre, which is the honest way to turn this off: the light
           is then only ever where the pointer put it. */
        const reach = knob("drift");
        const speed = knob("driftSpeed");
        target.x = box.width * (0.5 + reach * Math.sin(clock * 0.21 * speed + phase));
        target.y =
          box.height * (0.5 + reach * 0.85 * Math.sin(clock * 0.34 * speed + phase * 1.7));
      }

      /* The light's radius: a fraction of the shorter side, breathing. */
      const base = Math.min(box.width, box.height) * 0.42 * dpr;
      const lit = base * (1 + knob("swell") * 0.5 * Math.sin(clock * 0.37 + phase));

      /* THE LEAD BODY'S RATE IS THE KNOB AND THE REST ARE A FRACTION OF IT,
         so raising the chase shortens the whole trail rather than only
         dragging the front of it away from the back. Floored well above zero:
         a body that never arrives is a body that stays where the page
         loaded. */
      const lead = knob("chase");
      for (let i = 0; i < BODIES; i++) {
        const rate = Math.max(0.02, lead - i * lead * 0.12);
        const k = 1 - Math.pow(1 - rate, steps);
        bx[i] += (target.x * dpr - bx[i]) * k;
        by[i] += (target.y * dpr - by[i]) * k;

        const sway = lit * knob("spacing");
        const churn = clock * knob("churn");
        blob[i * 4] = bx[i] + Math.cos(churn * 0.55 + i * 1.9) * sway;
        blob[i * 4 + 1] = by[i] + Math.sin(churn * 0.47 + i * 2.6) * sway;
        blob[i * 4 + 2] = lit * Math.max(0.02, knob("ball") - i * knob("shrink"));
        blob[i * 4 + 3] = 1 - i * 0.045;
      }

      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uR, lit);
      gl.uniform1f(uTime, clock);
      gl.uniform4fv(uBlob, blob);
      const [r, g, b] = paperRGB();
      gl.uniform3f(uPaper, r, g, b);
      for (const [key, loc] of Object.entries(knobLoc)) {
        if (loc) gl.uniform1f(loc, knob(key));
      }

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    raf = requestAnimationFrame(draw);

    const observer = new ResizeObserver(() => resize());
    observer.observe(host);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("pointermove", onMove);
      if (idle) clearTimeout(idle);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buffer);
      gl.deleteTexture(texture);
    };
  }, [src]);

  /* NO INLINE POSITION HERE. It was `style={{ position: "relative" }}`, which
     is an inline style and therefore beats whatever the caller puts in
     `className`: passing `absolute inset-0` left the host static and 279px
     tall. The caller owns the box; this owns what is drawn in it. The default
     class keeps the failure log positioned when no class is given. */
  return (
    <div ref={hostRef} className={className ?? "relative h-full w-full"}>
      <canvas ref={canvasRef} className="block h-full w-full" />
      {failed ? (
        <pre className="absolute inset-x-0 bottom-0 m-0 overflow-auto p-3 text-xs whitespace-pre-wrap text-red-300">
          {failed}
        </pre>
      ) : null}
    </div>
  );
}
