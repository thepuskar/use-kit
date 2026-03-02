import { RefObject } from "react";

import { offEvent, onEvent } from "../../utils";
import { useGetLatest, useIsomorphicEffect } from "../index";

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

type UseEventListener = {
  <K extends keyof HTMLElementEventMap, T extends HTMLElement = HTMLElement>(
    config: {
      target: RefObject<T> | T | null;
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

/**
 * It tries to define a property on an object, and if it fails, it returns false. If it succeeds, it
 * returns true
 */
const isOptionParamSupported = (): boolean => {
  let optionSupported = false;

  try {
    Object.defineProperty({}, "passive", {
      get: () => {
        optionSupported = true;
        return null;
      },
    });
  } catch (_error) {
    return false;
  }

  return optionSupported;
};

/**
 * A React hook that handles binding/unbinding event listeners in a smart way.
 *
 * @param config.target - The target to which the listener will be attached.
 * @param config.eventType - A case-sensitive string representing the event type to listen for.
 * @param config.handler - event listener callback.
 * @param shouldAttach - If set to false, the listener won't be attached. (default = true)
 */
export const useEventListener: UseEventListener = (
  config: {
    target: RefObject<HTMLElement> | HTMLElement | Window | Document | null;
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
    const element = target && "current" in target ? target.current : target;

    if (!element) return;

    let unsubscribed = false;
    const listener = (event: Event) => {
      if (unsubscribed) return;
      (cachedHandler.current as (ev: Event) => void)(event);
    };

    let thirdParam = cachedOptions.current;

    if (typeof cachedOptions.current !== "boolean") {
      if (isOptionParamSupported()) thirdParam = cachedOptions.current;
      else thirdParam = cachedOptions.current?.capture;
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
