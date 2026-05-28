import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach } from "vitest";

type MemoryStorage = Pick<
  Storage,
  "clear" | "getItem" | "key" | "length" | "removeItem" | "setItem"
>;

function createMemoryStorage(): MemoryStorage {
  const values = new Map<string, string>();

  return {
    get length() {
      return values.size;
    },
    clear() {
      values.clear();
    },
    getItem(key) {
      return values.get(key) ?? null;
    },
    key(index) {
      return Array.from(values.keys())[index] ?? null;
    },
    removeItem(key) {
      values.delete(key);
    },
    setItem(key, value) {
      values.set(key, value);
    },
  };
}

function ensureStorage(name: "localStorage" | "sessionStorage") {
  try {
    if (window[name]) {
      return;
    }
  } catch {
    // Fall through and install an in-memory fallback.
  }

  Object.defineProperty(window, name, {
    configurable: true,
    value: createMemoryStorage(),
  });
}

function ensureMatchMedia() {
  if (typeof window.matchMedia === "function") {
    return;
  }

  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: (query: string): MediaQueryList =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        addListener: () => undefined,
        removeListener: () => undefined,
        dispatchEvent: () => true,
      }) as MediaQueryList,
  });
}

function ensureObserver(name: "IntersectionObserver" | "ResizeObserver") {
  if (typeof window[name] !== "undefined") {
    return;
  }

  const Observer = class {
    observe() {
      return undefined;
    }

    unobserve() {
      return undefined;
    }

    disconnect() {
      return undefined;
    }
  };

  Object.defineProperty(window, name, {
    configurable: true,
    writable: true,
    value: Observer,
  });
}

function ensureNavigatorApi<T>(name: "clipboard" | "geolocation", value: T) {
  if (typeof navigator[name] !== "undefined") {
    return;
  }

  Object.defineProperty(navigator, name, {
    configurable: true,
    value,
  });
}

function ensureSchedulers() {
  if (typeof window.requestAnimationFrame !== "function") {
    Object.defineProperty(window, "requestAnimationFrame", {
      configurable: true,
      writable: true,
      value: (callback: FrameRequestCallback) =>
        window.setTimeout(() => callback(performance.now()), 16),
    });
  }

  if (typeof window.cancelAnimationFrame !== "function") {
    Object.defineProperty(window, "cancelAnimationFrame", {
      configurable: true,
      writable: true,
      value: (handle: number) => {
        window.clearTimeout(handle);
      },
    });
  }

  const windowWithIdle = window as typeof window & {
    requestIdleCallback?: (callback: IdleRequestCallback) => number;
    cancelIdleCallback?: (handle: number) => void;
  };

  if (typeof windowWithIdle.requestIdleCallback !== "function") {
    Object.defineProperty(window, "requestIdleCallback", {
      configurable: true,
      writable: true,
      value: (callback: IdleRequestCallback) =>
        window.setTimeout(
          () =>
            callback({
              didTimeout: false,
              timeRemaining: () => 50,
            }),
          0,
        ),
    });
  }

  if (typeof windowWithIdle.cancelIdleCallback !== "function") {
    Object.defineProperty(window, "cancelIdleCallback", {
      configurable: true,
      writable: true,
      value: (handle: number) => {
        window.clearTimeout(handle);
      },
    });
  }
}

beforeEach(() => {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return;
  }

  ensureStorage("localStorage");
  ensureStorage("sessionStorage");
  ensureMatchMedia();
  ensureObserver("IntersectionObserver");
  ensureObserver("ResizeObserver");
  ensureNavigatorApi("clipboard", {
    writeText: async () => undefined,
  });
  ensureNavigatorApi("geolocation", {
    getCurrentPosition: () => undefined,
    watchPosition: () => 0,
    clearWatch: () => undefined,
  });
  ensureSchedulers();
});

afterEach(() => {
  cleanup();
});
