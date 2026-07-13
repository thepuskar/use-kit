import { useCallback, useState } from "react";

import { useEventListener } from "../useEventListener";
import { useIsomorphicEffect } from "../useIsomorphicEffect";

interface WindowPosition {
  x: number;
  y: number;
}

const INITIAL_POSITION: WindowPosition = { x: 0, y: 0 };

function readWindowPosition(): WindowPosition {
  if (typeof window === "undefined") {
    return INITIAL_POSITION;
  }

  return {
    x: window.scrollX,
    y: window.scrollY,
  };
}

/**
 * Track the window scroll position in an SSR-safe way.
 * Returns `{ x: 0, y: 0 }` until mounted, then syncs and listens for scroll events.
 */
export const useWindowPosition = (): WindowPosition => {
  const [scrollPosition, setScrollPosition] = useState<WindowPosition>(INITIAL_POSITION);

  const updatePosition = useCallback(() => {
    setScrollPosition(readWindowPosition());
  }, []);

  useIsomorphicEffect(() => {
    updatePosition();
  }, [updatePosition]);

  useEventListener({
    target: typeof window !== "undefined" ? window : null,
    eventType: "scroll",
    handler: updatePosition,
    options: { passive: true },
  });

  return scrollPosition;
};
