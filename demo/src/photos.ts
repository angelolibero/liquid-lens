/**
 * The photographs the demo opens with.
 *
 * HOTLINKED FROM UNSPLASH'S CDN AND NOT COMMITTED. Their CDN sends
 * `access-control-allow-origin: *`, which is what a WebGL texture needs to be
 * readable, so the repo carries no photographs at all: it stays a few tens of
 * kilobytes, it clones in a second, and the people who took these keep their
 * traffic and their credit. Every one is under the Unsplash licence.
 *
 * `w=1600` because this is a texture behind a blur, not a print. A 4000px
 * original is four times the download for a difference that is destroyed by
 * the first tap of `sceneBlur`.
 */
export type Photo = {
  id: string;
  label: string;
  by: string;
  at: string;
  /** The texture. */
  url: string;
  /** The same frame at card size. See `thumb`. */
  card: string;
};

const cdn = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=1600&q=80&auto=format&fit=crop`;

/**
 * THE CARD IS A SEPARATE, SMALLER REQUEST and not the texture scaled down in
 * CSS. Five 1600px photographs decoded to fill five 112px cards is four
 * megabytes and a stutter on the first paint, for pictures the size of a
 * stamp. The CDN crops and resizes on its own, so this costs nothing but a
 * different query string.
 */
const thumb = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=280&h=180&q=70&auto=format&fit=crop`;

export const PHOTOS: Photo[] = [
  {
    id: "plateau",
    label: "Plateau",
    by: "Kalen Emsley",
    at: "https://unsplash.com/photos/Bkci_8qcdvQ",
    url: cdn("1464822759023-fed622ff2c3b"),
    card: thumb("1464822759023-fed622ff2c3b"),
  },
  {
    id: "dune",
    label: "Dune",
    by: "Sergey Pesterev",
    at: "https://unsplash.com/photos/tMvuBId5jP4",
    url: cdn("1509316785289-025f5b846b35"),
    card: thumb("1509316785289-025f5b846b35"),
  },
  {
    id: "forest",
    label: "Forest",
    by: "Casey Horner",
    at: "https://unsplash.com/photos/4rDCa5hBlCs",
    url: cdn("1441974231531-c6227db76b6e"),
    card: thumb("1441974231531-c6227db76b6e"),
  },
  {
    id: "city",
    label: "City",
    by: "Pedro Lastra",
    at: "https://unsplash.com/photos/Nyvq2juw4_o",
    url: cdn("1449824913935-59a10b8d2000"),
    card: thumb("1449824913935-59a10b8d2000"),
  },
  {
    id: "portrait",
    label: "Portrait",
    by: "Ayo Ogunseinde",
    at: "https://unsplash.com/photos/sibVwORYqs0",
    url: cdn("1492633423870-43d1cd2775eb"),
    card: thumb("1492633423870-43d1cd2775eb"),
  },
];
