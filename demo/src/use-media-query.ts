import * as React from "react";

/**
 * A media query as a boolean that keeps answering.
 *
 * `useSyncExternalStore` and not an effect with state, because the answer can
 * change while the page is open: a window is dragged across a breakpoint, a
 * phone is turned. The subscription is the query's own change event.
 *
 * The server snapshot is `false`, which makes the narrow layout the one that
 * renders first everywhere. That is the safe way round: the mobile sheet is
 * closed on arrival, so a first paint that guesses wrong shows a picture with
 * no panel for one frame rather than a panel with no picture.
 */
export function useMediaQuery(query: string) {
  return React.useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
