import { RefObject, useRef } from "react";

import { useIsomorphicEffect } from "../useIsomorphicEffect";

export type ClickOutsideEvent =
  | "pointerdown"
  | "mousedown"
  | "mouseup"
  | "touchstart"
  | "touchend"
  | "focusin"
  | "focusout";

type MaybeElementRef<T extends Element = Element> = RefObject<T | null> | null;
type MaybeElement<T extends Element = Element> = T | MaybeElementRef<T> | null;

export interface UseClickOutsideOptions<T extends HTMLElement = HTMLElement> {
  /**
   * Optional external ref. If omitted, the hook returns its own ref.
   */
  ref?: RefObject<T | null> | null;

  /**
   * Additional refs that should be treated as inside.
   */
  refs?: Array<MaybeElementRef<Element>>;

  /**
   * Elements or refs that should be ignored when checking outside interactions.
   */
  ignore?: Array<MaybeElement>;

  /**
   * DOM events that should trigger outside checks.
   */
  events?: ClickOutsideEvent[];

  /**
   * Whether listeners are attached during the capture phase.
   */
  capture?: boolean;

  /**
   * Whether to attach passive listeners when supported.
   */
  passive?: boolean;

  /**
   * Disable the hook without unmounting.
   */
  disabled?: boolean;

  /**
   * Custom document target, useful for iframes or portals.
   */
  document?: Document | null;
}

const DEFAULT_EVENTS: ClickOutsideEvent[] = ["pointerdown"];

function resolveElement(value: MaybeElement): Element | null {
  if (!value) {
    return null;
  }

  if (typeof value === "object" && "current" in value) {
    return value.current;
  }

  return value;
}

function isEventInside(target: Node, elements: Element[]): boolean {
  return elements.some((element) => element.contains(target));
}

function getResolvedElements(values: Array<MaybeElement>): Element[] {
  return values
    .map((value) => resolveElement(value))
    .filter((element): element is Element => element !== null);
}

function serializeEvents(events: ClickOutsideEvent[]): string {
  return events.join(",");
}

/**
 * Detect interactions outside one or more elements.
 *
 * Supports the legacy `(handler, events?, capture?)` signature and the newer
 * options object with external refs, disabled state, and ignored elements.
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  handler: (event: Event) => void,
  events?: ClickOutsideEvent[],
  listenCapturing?: boolean,
): RefObject<T | null>;
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  handler: (event: Event) => void,
  options?: UseClickOutsideOptions<T>,
): RefObject<T | null>;
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  handler: (event: Event) => void,
  eventsOrOptions: ClickOutsideEvent[] | UseClickOutsideOptions<T> = DEFAULT_EVENTS,
  listenCapturing = true,
): RefObject<T | null> {
  const internalRef = useRef<T | null>(null);
  const handlerRef = useRef(handler);

  const isLegacySignature = Array.isArray(eventsOrOptions);
  const resolvedOptions = (isLegacySignature ? {} : eventsOrOptions) as UseClickOutsideOptions<T>;

  const {
    ref: externalRef,
    refs = [],
    ignore = [],
    events = isLegacySignature ? eventsOrOptions : DEFAULT_EVENTS,
    capture = isLegacySignature ? listenCapturing : (resolvedOptions.capture ?? true),
    passive = false,
    disabled = false,
    document: ownerDocument,
  } = resolvedOptions;

  const primaryRef = externalRef ?? internalRef;
  const resolvedDocument = ownerDocument ?? (typeof document !== "undefined" ? document : null);
  const eventKey = serializeEvents(events);

  useIsomorphicEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useIsomorphicEffect(() => {
    if (!resolvedDocument || disabled) {
      return;
    }

    const listenerOptions: AddEventListenerOptions = {
      capture,
      passive,
    };

    const handleEvent = (event: Event) => {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      const insideElements = getResolvedElements([primaryRef, ...refs]);

      if (insideElements.length === 0) {
        return;
      }

      if (isEventInside(target, insideElements)) {
        return;
      }

      const ignoredElements = getResolvedElements(ignore);

      if (ignoredElements.length > 0 && isEventInside(target, ignoredElements)) {
        return;
      }

      handlerRef.current(event);
    };

    events.forEach((eventName) => {
      resolvedDocument.addEventListener(eventName, handleEvent, listenerOptions);
    });

    return () => {
      events.forEach((eventName) => {
        resolvedDocument.removeEventListener(eventName, handleEvent, listenerOptions);
      });
    };
  }, [capture, disabled, eventKey, events, ignore, passive, primaryRef, refs, resolvedDocument]);

  return primaryRef;
}
