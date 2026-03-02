import { RefObject, useRef } from "react";

import { useIsomorphicEffect } from "../useIsomorphicEffect";

/**
 * Supported event types for detecting interactions outside an element
 * @typedef {'mousedown' | 'mouseup' | 'touchstart' | 'touchend' | 'focusin' | 'focusout'} EventType
 */
type EventType = "mousedown" | "mouseup" | "touchstart" | "touchend" | "focusin" | "focusout";

/**
 * A custom hook to detect interactions outside a specified element
 *
 * @template T - The HTML element type being referenced
 * @param {(event: Event) => void} handler - Callback function triggered when interaction occurs outside the element
 * @param {EventType[]} [events=['mousedown']] - Array of event types to listen for (default: mousedown)
 * @param {boolean} [listenCapturing=true] - Whether to use event capturing phase (default: true)
 * @returns {RefObject<T>} A ref to be attached to the target element
 */

export function useClickOutside<T extends HTMLElement = HTMLElement>(
  handler: (event: Event) => void,
  events: EventType[] = ["mousedown"],
  listenCapturing: boolean = true,
): RefObject<T> {
  const ref = useRef<T>(null);

  useIsomorphicEffect(() => {
    function handleClickOutside(event: Event) {
      // Ensure we're in client environment
      if (typeof window === "undefined") return;

      // Check if ref exists and click/event is outside
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler(event);
      }
    }

    // Add multiple event listeners
    events.forEach((eventType) => {
      document.addEventListener(eventType, handleClickOutside, listenCapturing);
    });

    // Cleanup
    return () => {
      events.forEach((eventType) => {
        document.removeEventListener(eventType, handleClickOutside, listenCapturing);
      });
    };
  }, [handler, events, listenCapturing]);

  return ref;
}
