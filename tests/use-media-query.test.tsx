import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode, StrictMode } from "react";
import { hydrateRoot, Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useBreakpoint, useMediaQueries, useMediaQuery } from "../src/client/hooks";

type MediaQueryListener = (event: MediaQueryListEvent) => void;

class MockMediaQueryList {
  readonly media: string;
  matches: boolean;
  onchange: MediaQueryListener | null = null;
  readonly addListener = vi.fn((listener: MediaQueryListener) => {
    this.legacyListeners.add(listener);
  });
  readonly removeListener = vi.fn((listener: MediaQueryListener) => {
    this.legacyListeners.delete(listener);
  });
  addEventListener?: MediaQueryList["addEventListener"];
  removeEventListener?: MediaQueryList["removeEventListener"];

  private readonly modernListeners = new Set<EventListenerOrEventListenerObject>();
  private readonly legacyListeners = new Set<MediaQueryListener>();

  constructor(query: string, matches: boolean, legacy = false) {
    this.media = query;
    this.matches = matches;

    if (!legacy) {
      this.addEventListener = vi.fn(
        (type: string, listener: EventListenerOrEventListenerObject) => {
          if (type === "change") {
            this.modernListeners.add(listener);
          }
        },
      ) as MediaQueryList["addEventListener"];
      this.removeEventListener = vi.fn(
        (type: string, listener: EventListenerOrEventListenerObject) => {
          if (type === "change") {
            this.modernListeners.delete(listener);
          }
        },
      ) as MediaQueryList["removeEventListener"];
    }
  }

  get listenerCount() {
    return this.modernListeners.size + this.legacyListeners.size;
  }

  trigger(matches: boolean) {
    this.matches = matches;
    const event = {
      matches,
      media: this.media,
    } as MediaQueryListEvent;

    this.onchange?.(event);
    this.modernListeners.forEach((listener) => {
      if (typeof listener === "function") {
        listener(event);
        return;
      }

      listener.handleEvent(event);
    });
    this.legacyListeners.forEach((listener) => {
      listener(event);
    });
  }

  dispatchEvent(): boolean {
    return true;
  }
}

const originalMatchMediaDescriptor = Object.getOwnPropertyDescriptor(window, "matchMedia");

function restoreMatchMedia() {
  if (originalMatchMediaDescriptor) {
    Object.defineProperty(window, "matchMedia", originalMatchMediaDescriptor);
    return;
  }

  Reflect.deleteProperty(window, "matchMedia");
}

function installMatchMedia(
  initialMatches: Record<string, boolean> = {},
  options: { legacy?: boolean } = {},
) {
  const lists = new Map<string, MockMediaQueryList>();
  const matchMedia = vi.fn((query: string) => {
    let list = lists.get(query);

    if (!list) {
      list = new MockMediaQueryList(query, initialMatches[query] ?? false, options.legacy);
      lists.set(query, list);
    }

    return list as unknown as MediaQueryList;
  });

  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: matchMedia,
  });

  return {
    get(query: string) {
      matchMedia(query);
      return lists.get(query) as MockMediaQueryList;
    },
    matchMedia,
  };
}

describe("useMediaQuery", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    restoreMatchMedia();
  });

  it("reads the browser query value and keeps stable output when nothing changes", () => {
    const query = "(min-width: 1024px)";
    const mock = installMatchMedia({
      [query]: true,
    });
    const { result, rerender } = renderHook(() => useMediaQuery(query));
    const firstResult = result.current;

    expect(result.current).toEqual({
      matches: true,
      query,
      supported: true,
    });
    expect(mock.get(query).listenerCount).toBe(1);

    rerender();

    expect(result.current).toBe(firstResult);
    expect(mock.get(query).addEventListener).toHaveBeenCalledTimes(1);
  });

  it("updates when the media query changes and calls onChange after mount", () => {
    const query = "(prefers-reduced-motion: reduce)";
    const onChange = vi.fn();
    const mock = installMatchMedia({
      [query]: false,
    });
    const { result } = renderHook(() =>
      useMediaQuery(query, {
        onChange,
      }),
    );

    act(() => {
      mock.get(query).trigger(true);
    });

    expect(result.current.matches).toBe(true);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("resubscribes safely when the query changes", () => {
    const firstQuery = "(min-width: 768px)";
    const nextQuery = "(min-width: 1280px)";
    const mock = installMatchMedia({
      [firstQuery]: false,
      [nextQuery]: true,
    });
    const { result, rerender } = renderHook(
      ({ query }: { query: string }) => useMediaQuery(query),
      {
        initialProps: {
          query: firstQuery,
        },
      },
    );

    expect(result.current.matches).toBe(false);
    expect(mock.get(firstQuery).listenerCount).toBe(1);

    rerender({
      query: nextQuery,
    });

    expect(result.current).toEqual({
      matches: true,
      query: nextQuery,
      supported: true,
    });
    expect(mock.get(firstQuery).listenerCount).toBe(0);
    expect(mock.get(nextQuery).listenerCount).toBe(1);
  });

  it("cleans up listeners on unmount", () => {
    const query = "(min-width: 900px)";
    const mock = installMatchMedia();
    const { unmount } = renderHook(() => useMediaQuery(query));

    expect(mock.get(query).listenerCount).toBe(1);

    unmount();

    expect(mock.get(query).listenerCount).toBe(0);
    expect(mock.get(query).removeEventListener).toHaveBeenCalledTimes(1);
  });

  it("shares one MediaQueryList listener across multiple subscribers", () => {
    const query = "(min-width: 1024px)";
    const mock = installMatchMedia({
      [query]: false,
    });
    const { result, unmount } = renderHook(
      () => [useMediaQuery(query), useMediaQuery(query)] as const,
    );

    expect(mock.get(query).listenerCount).toBe(1);

    act(() => {
      mock.get(query).trigger(true);
    });

    expect(result.current[0].matches).toBe(true);
    expect(result.current[1].matches).toBe(true);

    unmount();

    expect(mock.get(query).listenerCount).toBe(0);
  });

  it("falls back when matchMedia is unavailable", () => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: undefined,
    });

    const { result } = renderHook(() =>
      useMediaQuery("(min-width: 1024px)", {
        defaultValue: true,
      }),
    );

    expect(result.current.matches).toBe(true);
    expect(result.current.supported).toBe(false);
  });

  it("can delay the first client snapshot until subscription", async () => {
    const query = "(min-width: 1024px)";
    installMatchMedia({
      [query]: true,
    });
    const renderValues: boolean[] = [];
    const { result } = renderHook(() => {
      const mediaQuery = useMediaQuery(query, {
        defaultValue: false,
        initializeWithValue: false,
      });

      renderValues.push(mediaQuery.matches);
      return mediaQuery;
    });

    expect(renderValues[0]).toBe(false);

    await waitFor(() => {
      expect(result.current.matches).toBe(true);
    });
  });

  it("uses addListener and removeListener in legacy environments", () => {
    const query = "(min-width: 1024px)";
    const mock = installMatchMedia({}, { legacy: true });
    const { result, unmount } = renderHook(() => useMediaQuery(query));

    expect(mock.get(query).addEventListener).toBeUndefined();
    expect(mock.get(query).addListener).toHaveBeenCalledTimes(1);

    act(() => {
      mock.get(query).trigger(true);
    });

    expect(result.current.matches).toBe(true);

    unmount();

    expect(mock.get(query).removeListener).toHaveBeenCalledTimes(1);
  });

  it("keeps one active listener under StrictMode double mounting", () => {
    const query = "(min-width: 1024px)";
    const mock = installMatchMedia();
    const wrapper = ({ children }: { children: ReactNode }) => <StrictMode>{children}</StrictMode>;
    const { unmount } = renderHook(() => useMediaQuery(query), {
      wrapper,
    });

    expect(mock.get(query).listenerCount).toBe(1);

    unmount();

    expect(mock.get(query).listenerCount).toBe(0);
  });

  it("hydrates with the server snapshot and updates after subscription without mismatch", async () => {
    const query = "(min-width: 1024px)";
    const mock = installMatchMedia({
      [query]: true,
    });
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    function ResponsiveLabel() {
      const desktop = useMediaQuery(query, {
        defaultValue: false,
        ssrValue: false,
      });

      return <span>{String(desktop.matches)}</span>;
    }

    const html = renderToString(<ResponsiveLabel />);
    const container = document.createElement("div");
    let root: Root | null = null;

    container.innerHTML = html;
    expect(container.textContent).toBe("false");

    await act(async () => {
      root = hydrateRoot(container, <ResponsiveLabel />);
    });

    await waitFor(() => {
      expect(container.textContent).toBe("true");
    });

    const hydrationErrors = consoleError.mock.calls.filter(([message]) =>
      String(message).toLowerCase().includes("hydration"),
    );

    expect(hydrationErrors).toHaveLength(0);
    expect(mock.get(query).listenerCount).toBe(1);

    await act(async () => {
      root?.unmount();
    });
  });
});

describe("useMediaQueries", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    restoreMatchMedia();
  });

  it("returns a typed match map and updates changed queries", () => {
    const queries = {
      mobile: "(max-width: 767px)",
      desktop: "(min-width: 1024px)",
    };
    const onChange = vi.fn();
    const mock = installMatchMedia({
      [queries.mobile]: true,
      [queries.desktop]: false,
    });
    const { result } = renderHook(() =>
      useMediaQueries(queries, {
        onChange,
      }),
    );

    expect(result.current).toEqual({
      mobile: true,
      desktop: false,
    });

    act(() => {
      mock.get(queries.desktop).trigger(true);
    });

    expect(result.current).toEqual({
      mobile: true,
      desktop: true,
    });
    expect(onChange).toHaveBeenCalledWith({
      mobile: true,
      desktop: true,
    });
  });

  it("supports dynamic query maps without changing hook order", () => {
    const firstQueries = {
      compact: "(max-width: 767px)",
    };
    const nextQueries = {
      compact: "(max-width: 767px)",
      wide: "(min-width: 1280px)",
    };
    const mock = installMatchMedia({
      [firstQueries.compact]: false,
      [nextQueries.wide]: true,
    });
    const { result, rerender } = renderHook(
      ({ queries }: { queries: Record<string, string> }) => useMediaQueries(queries),
      {
        initialProps: {
          queries: firstQueries,
        },
      },
    );

    expect(result.current).toEqual({
      compact: false,
    });

    rerender({
      queries: nextQueries,
    });

    expect(result.current).toEqual({
      compact: false,
      wide: true,
    });
    expect(mock.get(firstQueries.compact).listenerCount).toBe(1);
    expect(mock.get(nextQueries.wide).listenerCount).toBe(1);
  });
});

describe("useBreakpoint", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    restoreMatchMedia();
  });

  it("returns the largest matching default breakpoint", () => {
    installMatchMedia({
      "(min-width: 640px)": true,
      "(min-width: 768px)": true,
      "(min-width: 1024px)": false,
      "(min-width: 1280px)": false,
      "(min-width: 1536px)": false,
    });

    const { result } = renderHook(() => useBreakpoint());

    expect(result.current.breakpoint).toBe("md");
    expect(result.current.matches).toEqual({
      sm: true,
      md: true,
      lg: false,
      xl: false,
      "2xl": false,
    });
    expect(result.current.queries.lg).toBe("(min-width: 1024px)");
    expect(result.current.supported).toBe(true);
  });

  it("supports custom breakpoints and onChange", () => {
    const customBreakpoints = {
      tablet: "768px",
      desktop: "1024px",
    } as const;
    const onChange = vi.fn();
    const mock = installMatchMedia({
      "(min-width: 768px)": true,
      "(min-width: 1024px)": false,
    });
    const { result } = renderHook(() =>
      useBreakpoint({
        breakpoints: customBreakpoints,
        onChange,
      }),
    );

    expect(result.current.breakpoint).toBe("tablet");

    act(() => {
      mock.get("(min-width: 1024px)").trigger(true);
    });

    expect(result.current.breakpoint).toBe("desktop");
    expect(onChange).toHaveBeenCalledWith("desktop", {
      tablet: true,
      desktop: true,
    });
  });
});
