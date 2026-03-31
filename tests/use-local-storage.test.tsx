import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useLocalStorage } from "../src/client/hooks";

const STORAGE_KEY = "use-local-storage-test";
const originalLocalStorageDescriptor = Object.getOwnPropertyDescriptor(window, "localStorage");

interface PersistedSettings {
  items: string[];
  count: number;
  enabled: boolean;
  note: string | null;
}

describe("useLocalStorage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();

    if (originalLocalStorageDescriptor) {
      Object.defineProperty(window, "localStorage", originalLocalStorageDescriptor);
    }

    window.localStorage.clear();
  });

  it("initializes with the default value when localStorage is empty", () => {
    const initializer = vi.fn(() => "draft");
    const { result, rerender } = renderHook(() =>
      useLocalStorage<string>(STORAGE_KEY, initializer),
    );

    rerender();

    expect(initializer).toHaveBeenCalledTimes(1);
    expect(result.current.value).toBe("draft");
    expect(result.current.isSupported).toBe(true);
  });

  it("initializes with a stored plain JSON value when localStorage already has data", () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify("persisted"));

    const { result } = renderHook(() => useLocalStorage(STORAGE_KEY, "fallback"));

    expect(result.current.value).toBe("persisted");
  });

  it("updates state and persists JSON-serializable objects", () => {
    const persistedValue: PersistedSettings = {
      items: ["react", "hooks"],
      count: 2,
      enabled: true,
      note: null,
    };

    const { result, unmount } = renderHook(() =>
      useLocalStorage<PersistedSettings>(STORAGE_KEY, {
        items: [],
        count: 0,
        enabled: false,
        note: null,
      }),
    );

    act(() => {
      result.current.setValue(persistedValue);
    });

    expect(result.current.value).toEqual(persistedValue);

    unmount();

    const { result: nextResult } = renderHook(() =>
      useLocalStorage<PersistedSettings>(STORAGE_KEY, {
        items: [],
        count: 0,
        enabled: false,
        note: "fallback",
      }),
    );

    expect(nextResult.current.value).toEqual(persistedValue);
  });

  it("supports functional updates", () => {
    const { result, unmount } = renderHook(() => useLocalStorage(STORAGE_KEY, 1));

    act(() => {
      result.current.setValue((currentValue) => currentValue + 2);
    });

    expect(result.current.value).toBe(3);

    unmount();

    const { result: nextResult } = renderHook(() => useLocalStorage(STORAGE_KEY, 0));

    expect(nextResult.current.value).toBe(3);
  });

  it("removes and resets values distinctly", () => {
    const { result, unmount } = renderHook(() => useLocalStorage(STORAGE_KEY, "draft"));

    act(() => {
      result.current.setValue("saved");
    });

    act(() => {
      result.current.remove();
    });

    expect(result.current.value).toBe("draft");
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();

    act(() => {
      result.current.setValue("edited");
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.value).toBe("draft");

    unmount();

    const { result: nextResult } = renderHook(() => useLocalStorage(STORAGE_KEY, "fallback"));

    expect(nextResult.current.value).toBe("draft");
  });

  it("handles invalid JSON in localStorage without crashing", () => {
    window.localStorage.setItem(STORAGE_KEY, "{not-valid-json");

    const { result } = renderHook(() => useLocalStorage(STORAGE_KEY, "fallback"));

    expect(result.current.value).toBe("fallback");

    act(() => {
      result.current.setValue("recovered");
    });

    expect(result.current.value).toBe("recovered");
  });

  it("persists explicit undefined values", () => {
    const { result, unmount } = renderHook(() =>
      useLocalStorage<string | undefined>(STORAGE_KEY, "fallback"),
    );

    act(() => {
      result.current.setValue(undefined);
    });

    expect(result.current.value).toBeUndefined();

    unmount();

    const { result: nextResult } = renderHook(() =>
      useLocalStorage<string | undefined>(STORAGE_KEY, "next-fallback"),
    );

    expect(nextResult.current.value).toBeUndefined();
  });

  it("stays usable when localStorage is unavailable", () => {
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get: () => undefined,
    });

    const { result } = renderHook(() => useLocalStorage(STORAGE_KEY, "fallback"));

    expect(result.current.value).toBe("fallback");
    expect(result.current.isSupported).toBe(false);

    act(() => {
      result.current.setValue("updated");
    });

    expect(result.current.value).toBe("updated");

    act(() => {
      result.current.remove();
    });

    expect(result.current.value).toBe("fallback");

    act(() => {
      result.current.setValue("temporary");
      result.current.reset();
    });

    expect(result.current.value).toBe("fallback");
  });
});
