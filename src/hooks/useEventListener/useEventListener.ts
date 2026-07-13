import { RefObject } from "react";

import { offEvent, onEvent } from "../../utils";
import { useGetLatest } from "../useGetLatest";
import { useIsomorphicEffect } from "../useIsomorphicEffect";

type ElementEventListener<K extends keyof HTMLElementEventMap> = (
  this: HTMLElement,
  event: HTMLElementEventMap[K],
) => void;

type DocumentEventListener<K extends keyof DocumentEventMap> = (
  this: Document,
  event: DocumentEventMap[K],
) => void;

type WindowEventListener<K extends keyof WindowEventMap> = (
  this: Window,
  event: WindowEventMap[K],
) => void;

type Options = boolean | AddEventListenerOptions;
type ListenerTarget = HTMLElement | Window | Document;
type MaybeTargetRef<T extends ListenerTarget = HTMLElement> = RefObject<T | null> | T | null;

type UseEventListener = {
  <K extends keyof HTMLElementEventMap, T extends HTMLElement = HTMLElement>(
    config: {
      target: RefObject<T | null> | T | null;
      eventType: K;
      handler: ElementEventListener<K>;
      options?: Options;
    },
    shouldAttach?: boolean,
  ): void;
  <K extends keyof DocumentEventMap, T extends Document = Document>(
    config: {
      target: T | null;
      eventType: K;
      handler: DocumentEventListener<K>;
      options?: Options;
    },
    shouldAttach?: boolean,
  ): void;
  <K extends keyof WindowEventMap, T extends Window = Window>(
    config: {
      target: T | null;
      eventType: K;
      handler: WindowEventListener<K>;
      options?: Options;
    },
    shouldAttach?: boolean,
  ): void;
};

function isRefTarget(value: MaybeTargetRef): value is RefObject<HTMLElement | null> {
  return typeof value === "object" && value !== null && "current" in value;
}

function resolveTarget(target: MaybeTargetRef): ListenerTarget | null {
  if (isRefTarget(target)) {
    return target.current;
  }

  return target;
}

/**
 * Detect whether the browser supports the options object form of addEventListener
 * (including `passive` / `once` / `signal`) by observing a getter during attach.
 */
const isOptionParamSupported = (): boolean => {
  if (typeof window === "undefined" || typeof window.addEventListener !== "function") {
    return false;
  }

  let optionSupported = false;
  try {
    const options = Object.defineProperty({}, "passive", {
      get() {
        optionSupported = true;
        return false;
      },
    });

    const noop = () => undefined;
    window.addEventListener("test-passive-support", noop, options);
    window.removeEventListener("test-passive-support", noop, options);
  } catch {
    return false;
  }

  return optionSupported;
};

/**
 * Bind an event listener to a target (element, document, or window) and clean it up on change/unmount.
 *
 * @param config.target - The target to which the listener will be attached.
 * @param config.eventType - A case-sensitive string representing the event type to listen for.
 * @param config.handler - Event listener callback.
 * @param shouldAttach - If set to false, the listener won't be attached. (default = true)
 */
export const useEventListener: UseEventListener = (
  config: {
    target: MaybeTargetRef;
    eventType: string;
    handler: unknown;
    options?: Options;
  },
  shouldAttach = true,
): void => {
  const { target = null, eventType, handler, options } = config;

  const cachedOptions = useGetLatest(options);
  const cachedHandler = useGetLatest(handler);

  useIsomorphicEffect(() => {
    const element = resolveTarget(target);

    if (!element) return;

    let unsubscribed = false;
    const listener = (event: Event) => {
      if (unsubscribed) return;
      (cachedHandler.current as (ev: Event) => void)(event);
    };

    let thirdParam: boolean | AddEventListenerOptions | undefined = cachedOptions.current;

    if (typeof cachedOptions.current !== "boolean" && cachedOptions.current != null) {
      if (isOptionParamSupported()) {
        thirdParam = cachedOptions.current;
      } else {
        thirdParam = cachedOptions.current.capture;
      }
    }

    if (shouldAttach) {
      onEvent(element, eventType, listener, thirdParam);
    }

    return () => {
      unsubscribed = true;
      offEvent(element, eventType, listener, thirdParam);
    };
  }, [target, eventType, shouldAttach]);
};
