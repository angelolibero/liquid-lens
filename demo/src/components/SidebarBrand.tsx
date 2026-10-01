import { HugeiconsIcon } from "@hugeicons/react";
import { Moon02Icon, PanelLeftCloseIcon, Sun02Icon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { LiquidLens } from "liquid-lens";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  THE MARK, THE NAME, THE THEME AND THE CLOSE, AS THE REFERENCE HAS THEM.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Every demo in this family opens its column with the same block, and the
 * mark in it is the effect itself at 30px rather than a drawing of it: a logo
 * that moves the way the page does is the shortest possible description of
 * what the page is.
 *
 * THE MARK DOES NOT FOLLOW THE HAND. It is a few pixels wide in a corner the
 * pointer is almost never over, and chasing a hand from across the window
 * would carry every body out of its box. So it drifts, always, and it shows
 * the photograph the big one is showing, at card size.
 */

/* THE SAME EFFECT AT A SIZE IT WAS NOT TUNED FOR. Two of its numbers are in
   pixels and not in fractions of the box: the blur is 70px at full size,
   which over a 30px mark is a smear, and the coastline noise is fine enough
   at the default grain to shatter the shape into specks. So the mark is a
   few bodies apart, a broad slow coast, a short blur and a short drift: still
   recognisably drops of the picture merging over paper. */
const MARK = { ball: 0.26, spacing: 0.75, thresh: 0.5, warp: 0.25, grain: 1.2, fade: 0.05, blur: 0.4, soft: 3, drift: 0.06, churn: 1.4 };

export function SidebarBrand({ dark, setDark, onClose, photo, paper }: {
  dark: boolean;
  setDark: (value: boolean) => void;
  onClose?: () => void;
  /** The photograph's card URL: small, and already loaded by the strip. */
  photo: string;
  paper: string;
}) {
  const label = dark ? "Switch to light theme" : "Switch to dark theme";
  return <div className="sidebar-brand">
    <span className="brand-mark" aria-hidden="true">
      <LiquidLens src={photo} values={MARK} follow={false} paper={paper} className="absolute inset-0" />
    </span>
    <div className="brand-copy"><strong>Liquid Lens</strong><small>Interactive WebGL lens</small></div>
    <div className="brand-actions">
      <Button variant="ghost" size="icon-xs" aria-label={label} title={label} onClick={() => setDark(!dark)}><HugeiconsIcon icon={dark ? Sun02Icon : Moon02Icon} className="size-4" /></Button>
      {onClose && <Button variant="ghost" size="icon-xs" aria-label="Hide controls" title="Hide controls" onClick={onClose}><HugeiconsIcon icon={PanelLeftCloseIcon} className="size-4" /></Button>}
    </div>
  </div>;
}
