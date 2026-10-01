# The demo kit

Liquid Lens and [Surface Field](https://github.com/angelolibero/surface-field)
are demos by the same author, and they are meant to look it: open the two side
by side and the only things that differ should be the effect and its knobs.
This file says what is shared, where it comes from, and what each demo is
allowed to make its own.

**The reference is Surface Field's `demo/`.** Both repositories have the same layout: the package at the root, the demo in `demo/`, so the paths below line up. It was drawn first and it is
where a change to the family starts. Nothing is a package: the shared files
are copied, and a fix in one demo is copied into the other in the same sitting.
A shared package starts paying for itself at the third demo, not before.

## Shared, file for file

| What | Where in the reference | Where here |
| --- | --- | --- |
| Tokens: paper, ink, corners, casts, lit edges, float glass | `demo/src/index.css`, top to `@theme inline` | `demo/src/index.css`, the same block |
| Type: Figtree for text, Plus Jakarta Sans for names and titles | `demo/src/fonts/` | `demo/src/fonts/` |
| Icons: Hugeicons (free set) | | |
| Controls: shadcn new-york on `radix-ui` (button, select, switch, label, separator) | `demo/src/components/ui/` | `demo/src/components/ui/` |
| The slider: a 22px recessed track and a ringed thumb | `HouseSlider.tsx` | `demo/src/components/HouseSlider.tsx` |
| The brand block: live mark, name, one line, theme switch, close | `SidebarBrand.tsx` | `demo/src/components/SidebarBrand.tsx` |
| The favicon: the mark as a 64px SVG tile, dark with the system | `demo/public/favicon.svg` | `demo/public/favicon.svg` |

## The shell

- A **docked column on the left**, 306px (290px under 900px), the page's own
  surface, a hairline on its right edge. Open on arrival on a wide window.
- In it, top to bottom: the **brand block**, **one paragraph** saying what to
  do, then **groups** under a bold title, cut by hairlines. No accordions.
- A preset row: a **select and `Copy config`** at half and half, the reset as
  a small icon on the group's title. `Copy config` writes a component to paste,
  not a dump of numbers.
- Closed, the column leaves **one floating button** at the top left.
- The **credit line** sits in the bottom right corner: "Made by Angelo Libero"
  and the repository's GitHub mark. Anything that must be credited (a
  photographer) goes in front of it on the same line.
- Under 769px the column is gone and the **same panel** opens from a floating
  button at the top left.
- **Tabs** appear only when a demo has more than one scene: the reference's
  `Segmented` control, centred over the scene.
- **Light on arrival**, `.dark` on the root for the other theme, and the theme
  switch lives in the brand block.

## What each demo makes its own

- **The mark.** It is the effect itself, live, at 30px, never a drawing of it.
  The favicon is the one place it is a drawing, because a tab icon cannot run
  the effect: the same tile, the same reading of it, still.
- **The name and its one line** ("Interactive React canvas", "Interactive
  WebGL lens").
- **The scene** and everything under "what is this demo's own" in its CSS.
- **The phone's panel.** The reference uses a side sheet; Liquid Lens uses a
  non-modal sheet from the foot, because a modal makes the page inert and
  touching the picture is the whole interaction. If the reference ever needs
  the same, this one is the one to copy.

## The README and its cover

Name as the H1, the cover image directly under it, one paragraph of what it
is, one line linking the live demo, then how to use it, how to run it, and the
licence with the author's name.

The cover is a page, `demo/cover.html`, drawn by the real component and never
built into the site: a 1600×900 stage captured by a headless Chrome at device
scale 2. The layout is fixed across the family:

- the live mark top left, a pill naming the framework top right;
- the name at 88px in Plus Jakarta Sans, one sentence under it at 30px;
- three points, each with its icon in a small well: free and open source, the
  framework, and the one thing that sets this demo apart;
- the scene on the right, with a wash of the page's paper from the left so it
  fades out behind the words.

A cover with a photograph in it goes out as JPG, one without as PNG.
