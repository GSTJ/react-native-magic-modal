import { useEffect, useState } from "react";

/**
 * The viewport, in CSS pixels, standing in for `useWindowDimensions`.
 *
 * The swipe reads it to work out how far off screen is, which is the only thing
 * the chrome ever needed react-native-web's `Dimensions` for.
 *
 * `visualViewport` is the size actually on screen, so a modal dragged away on a
 * phone with the software keyboard open, or on a pinch-zoomed page, travels the
 * distance the user can see rather than the layout distance. It is read first
 * for that reason and falls back to `window.inner*` where it is missing.
 */

const EMPTY_VIEWPORT = { height: 0, width: 0 };

const readViewport = () => {
  if (typeof window === "undefined") {
    return EMPTY_VIEWPORT;
  }

  const visual = window.visualViewport;

  return {
    height: visual?.height ?? window.innerHeight,
    width: visual?.width ?? window.innerWidth,
  };
};

export const useViewportSize = () => {
  // The initializer runs on the server too, where it returns zeroes rather
  // than reaching for a `window` that is not there. Nothing is rendered from
  // this, so a server and a client first render still agree.
  const [size, setSize] = useState(readViewport);

  useEffect(() => {
    const update = () => {
      const next = readViewport();

      setSize((previous) =>
        previous.height === next.height && previous.width === next.width
          ? previous
          : next,
      );
    };

    // Mounting after a resize, or after hydrating from a server render, both
    // land here with a stale size.
    update();

    const visual = window.visualViewport;

    window.addEventListener("resize", update);
    visual?.addEventListener("resize", update);
    visual?.addEventListener("scroll", update);

    return () => {
      window.removeEventListener("resize", update);
      visual?.removeEventListener("resize", update);
      visual?.removeEventListener("scroll", update);
    };
  }, []);

  return size;
};
