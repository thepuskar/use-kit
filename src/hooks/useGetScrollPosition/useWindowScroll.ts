import { useState } from "react";

import { useEventListener } from "../index";

/**
 * React hook to track window scroll position.
 * @param {Number} [initialPosition] - The initial scroll position.
 * @returns A number representing the current scroll position of the window.
 */

interface IState {
  x: number;
  y: number;
}

export const useWindowPosition = (): IState => {
  const [scrollPosition, setScrollPosition] = useState<IState>({
    x: 0,
    y: 0,
  });

  const updatePosition = () => {
    setScrollPosition({ x: window.pageXOffset, y: window.pageYOffset });
  };
  useEventListener({
    target: window,
    eventType: "scroll",
    handler: updatePosition,
  });

  return scrollPosition;
};
