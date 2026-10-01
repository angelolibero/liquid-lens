/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  THE SHADER: A FIELD, ONE LEVEL OF IT, AND A PHOTOGRAPH SEEN THROUGH.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Seven soft bodies chase the pointer. Where two are near each other their
 * heights ADD, so the line around them is one closed curve with a waist
 * rather than two circles overlapping: that merging is the whole of why this
 * reads as liquid and not as a string of discs. Pull them apart and the waist
 * thins, snaps, and the far one is left as a drop.
 *
 * Inside that shape the photograph is drawn; outside it, nothing. The picture
 * is out of focus at the edge of the body and sharp deep inside, which is
 * what makes the shape read as something with a thickness rather than a hole
 * cut in a mask.
 */

/** How many bodies chase the pointer. Seven is enough for a waist. */
export const BODIES = 7;

/** How many ripples can be crossing the lens at once. A fifth press retires
    the oldest, which by then has nearly died away anyway. */
export const RIPPLES = 4;

const VERTEX = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAGMENT = `
precision highp float;

uniform sampler2D uImage;
uniform vec2 uImageSize;
uniform vec2 uRes;
uniform float uR;
uniform float uTime;

uniform vec4 uBlob[${BODIES}];

uniform float uThresh;
uniform float uFade;
uniform float uBlur;
uniform float uSoft;
uniform float uWarp;
uniform float uGrain;
uniform float uCorner;
uniform float uFlow;

uniform vec3 uPaper;
uniform float uVeil;

/* xy: centre in device px. z: age in seconds, negative when the slot is
   empty. w: the press's own strength, 1 for a click. */
uniform vec4 uRipple[${RIPPLES}];
uniform float uRippleStrength;
uniform float uRippleSpeed;
uniform float uRippleWidth;
uniform float uRippleDecay;

/**
 * ---- THE PICTURE FILLS THE BOX WITHOUT BEING STRETCHED -------------------
 *
 * The same arithmetic as CSS object-fit: cover: whichever axis is short
 * decides the scale and the other one is centred and cropped. Written here
 * rather than left to the texture wrap because a shader that samples outside
 * 0..1 gets the edge pixel smeared, and a smeared edge under a blur is a
 * bright band along the side of the picture.
 */
vec2 coverUV(vec2 f) {
  float boxAspect = uRes.x / max(uRes.y, 1.0);
  float imgAspect = uImageSize.x / max(uImageSize.y, 1.0);
  /* The axis with the excess is the one that gets CROPPED, so its sampled
     range is SMALLER than the full 0..1, which is a multiply. Dividing here
     samples outside the texture instead, and CLAMP_TO_EDGE answers that by
     smearing the edge row across the whole overflow: long horizontal streaks
     down a portrait window, which is exactly what it did. */
  vec2 scale = boxAspect > imgAspect
    ? vec2(1.0, imgAspect / boxAspect)
    : vec2(boxAspect / imgAspect, 1.0);
  return (f / uRes - 0.5) * scale + 0.5;
}

/** The photograph, with the room's own light laid over it. */
vec3 scene(vec2 f) {
  vec3 col = texture2D(uImage, coverUV(f)).rgb;
  /* Plain alpha, because the veil is not trying to keep the photograph's
     contrast, it is spending some of it: this is the light in the room the
     picture is hanging in, not a filter on the picture. */
  return mix(col, uPaper, uVeil);
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

/** Value noise: bilinear over a hashed lattice, smoothed at the cell edges. */
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

/**
 * ---- OUT OF FOCUS, IN TWELVE TAPS ---------------------------------------
 *
 * A spiral of samples on the golden angle, each one further out than the
 * last, with the whole spiral turned by a per-pixel random amount. The turn
 * is what stops twelve taps looking like twelve taps: without it every pixel
 * samples the same twelve directions and the blur grows visible spokes.
 *
 * IT RETURNS EARLY WHEN THERE IS NOTHING TO BLUR, which is most of the
 * picture most of the time. Twelve texture fetches per pixel is the single
 * most expensive thing here, and it is worth the branch to not pay it.
 */
vec3 sceneBlur(vec2 f, float rad) {
  if (rad < 0.7) return scene(f);
  float turn = hash(f) * 6.2831853;
  vec3 sum = vec3(0.0);
  for (int i = 0; i < 12; i++) {
    float fi = float(i);
    float ang = turn + fi * 2.39996323;
    float rr = sqrt((fi + 0.5) / 12.0) * rad;
    sum += scene(f + vec2(cos(ang), sin(ang)) * rr);
  }
  return sum / 12.0;
}

/**
 * ---- THE FIELD, AND THE CORNERS ARE THE NORM IT IS MEASURED IN -----------
 *
 * Every body is a gaussian bump. A gaussian and not the classic inverse
 * square: 1/d^2 has no end, so every body is felt everywhere and a body on
 * the far side still nudges the boundary here. A gaussian is numerically
 * zero within a few sigma, which makes each body local and the shape stable
 * while one drifts away.
 *
 * dot(d, d) is the squared distance under the ordinary norm, and a bump built
 * on it has circular level sets because that is what "same distance" means
 * there. Measure the same offset under |x|^n + |y|^n and the set of points at
 * one distance is a superellipse: 1 is a diamond, 2 is the circle, and the
 * higher it goes the more the sides flatten until the body is a rounded
 * square.
 *
 * AND IT IS BUILT WITHOUT A SINGLE pow. The straight spelling is
 * pow(pow(x, n) + pow(y, n), 2/n), three transcendentals per body per pixel,
 * twenty-one over every pixel of a full-screen canvas every frame. Four
 * exponents are exact and cheap instead, and the knob rides between them: 1
 * is (|x| + |y|) squared, 2 is the dot product, 4 is the square root of
 * dot(n*n, n*n), and 8 is the same trick once more. Between two rungs this is
 * a blend of two distances rather than the norm at that exponent, which is
 * the same family of shapes and not a number to do arithmetic with. Nobody
 * reads this knob, they turn it and look.
 */
float field(vec2 p) {
  float s = 0.0;
  vec2 one = vec2(1.0);
  for (int i = 0; i < ${BODIES}; i++) {
    vec2 d = p - uBlob[i].xy;
    float sig = uBlob[i].z;
    /* Clamped before it is raised: a body is numerically zero a few sigma
       out, but the eighth power does not know that. */
    vec2 n = min(abs(d) / sig, 16.0);
    vec2 q = n * n;
    float r2;
    if (uCorner <= 2.0) {
      float diamond = dot(n, one);
      r2 = mix(diamond * diamond, dot(n, n), uCorner - 1.0);
    } else if (uCorner <= 4.0) {
      r2 = mix(dot(n, n), sqrt(dot(q, q)), (uCorner - 2.0) * 0.5);
    } else {
      vec2 q2 = q * q;
      r2 = mix(sqrt(dot(q, q)), sqrt(sqrt(dot(q2, q2))),
               min(1.0, (uCorner - 4.0) * 0.25));
    }
    s += uBlob[i].w * exp(-0.5 * r2);
  }
  return s;
}

/**
 * ---- A PRESS IS A DROP ON THE SURFACE -----------------------------------
 *
 * Each press sends one ring outward from where it landed, and the ring is a
 * crest with a trough behind it: one period of a sine under a gaussian
 * envelope, so it has a front and a back instead of being a band of
 * brightness. It returns a DISPLACEMENT, radial, in device px, and the
 * caller spends it twice: on where the picture is read, which is the
 * refraction a wave makes in what is under it, and on where the field is
 * measured, which is the shore lifting as the ring crosses it.
 *
 * EVERYTHING IS A FRACTION OF THE LIGHT'S RADIUS, as the coastline is, so a
 * ripple on a phone and on a 5K screen is the same ripple at its own size.
 * It dies on two clocks: the ring loses height as it ages, and nothing is
 * computed once a slot is empty, which is most frames.
 */
vec2 ripple(vec2 f) {
  vec2 push = vec2(0.0);
  if (uRippleStrength <= 0.0) return push;
  float width = max(uRippleWidth * uR, 1.0);
  for (int i = 0; i < ${RIPPLES}; i++) {
    vec4 r = uRipple[i];
    if (r.z < 0.0) continue;
    vec2 d = f - r.xy;
    float dist = length(d);
    float x = (dist - r.z * uRippleSpeed * uR) / width;
    if (abs(x) > 3.0) continue;
    float height = exp(-x * x) * exp(-r.z / max(uRippleDecay, 0.05)) * r.w;
    push += d / max(dist, 1.0) * sin(x * 3.1415927) * height;
  }
  return push * uRippleStrength * uR * 0.12;
}

void main() {
  vec2 f = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 push = ripple(f);

  /* ---- THE BOUNDARY IS WARPED BEFORE IT IS FOUND ----------------------
     Bumps alone give a shape made of arcs, and arcs read as geometry. The
     field is sampled at a position pushed around by low frequency noise
     instead, so the same shape acquires bays and headlands: the contour
     stops being circular without any circle being drawn wrong.
     .
     THE NOISE DRIFTS SLOWLY. It is the one thing here that moves without the
     pointer, and it has to stay well under the speed of a hand or the surface
     boils. This is a body of water at rest, not a pot. */
  float k = uGrain / uR;
  float drift = uTime * uFlow;
  vec2 wobble = vec2(
    vnoise(f * k + vec2(drift * 0.05, 0.0)),
    vnoise(f * k + vec2(11.3, 4.7 - drift * 0.04))) - 0.5;
  /* The ring lifts the shore as well as bending the picture: the same push,
     at a little more than half, because the edge is read against flat paper
     and moves the eye more than the same offset inside the picture does. */
  vec2 q = f + wobble * (uWarp * uR) + push * 0.6;

  float v = field(q);

  /* ---- TWO SURFACES, AND THEY ARE NOT THE SAME SURFACE ----------------
     .
     A body of liquid does two separate things to what is behind it, and one
     number driving both makes them one thing: as soon as the edge is crisp
     enough to read as liquid there is no depth of picture left out of focus,
     and softening it enough to look through dissolves the shape.
     .
     uFade IS THE SURFACE THAT GOES BACK TO THE PAGE. It is the band of field
     across which alpha climbs, so it decides how much of the shape is a
     dissolve into the room behind rather than a body.
     .
     uBlur IS THE SURFACE THAT IS OUT OF FOCUS, measured INWARD from the level
     line: how deep into the body the picture takes to come back into focus,
     with uSoft saying how far out of focus it is at the shallow end. Nothing
     ties it to the fade: a hard-edged shape whose interior is soft for a long
     way is a thick body seen through, and a wide fade over a sharp picture is
     a mist. */
  float a = smoothstep(uThresh - uFade, uThresh + uFade, v);
  if (a <= 0.003) { gl_FragColor = vec4(0.0); return; }

  float clear = smoothstep(uThresh, uThresh + uBlur, v);
  gl_FragColor = vec4(sceneBlur(f - push, uSoft * (1.0 - clear)), a);
}
`;

export const SOURCE = { VERTEX, FRAGMENT };
