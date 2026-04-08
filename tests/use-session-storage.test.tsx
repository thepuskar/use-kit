import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useSessionStorage } from "../src/client/hooks";

const STORAGE_KEY = "use-session-storage-test";
const originalSessionStorageDescriptor = Object.getOwnPropertyDescriptor(window, "sessionStorage");

interface PersistedSettings {
  items: string[];
  count: number;
  enabled: boolean;
  note: string | null;
}

describe("useSessionStorage", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();

    if (originalSessionStorageDescriptor) {
      Object.defineProperty(window, "sessionStorage", originalSessionStorageDescriptor);
    }

    window.sessionStorage.clear();
  });

  it("initializes with the default value when sessionStorage is empty", () => {
    const initializer = vi.fn(() => "draft");
    const { result, rerender } = renderHook(() =>
      useSessionStorage<string>(STORAGE_KEY, initializer),
    );

    rerender();

    expect(initializer).toHaveBeenCalledTimes(1);
    expect(result.current.value).toBe("draft");
    expect(result.current.isSupported).toBe(true);
  });

  it("initializes with a stored plain JSON value when sessionStorage already has data", () => {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify("persisted"));

    const { result } = renderHook(() => useSessionStorage(STORAGE_KEY, "fallback"));

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
      useSessionStorage<PersistedSettings>(STORAGE_KEY, {
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
      useSessionStorage<PersistedSettings>(STORAGE_KEY, {
        items: [],
        count: 0,
        enabled: false,
        note: "fallback",
      }),
    );

    expect(nextResult.current.value).toEqual(persistedValue);
  });

  it("supports functional updates", () => {
    const { result, unmount } = renderHook(() => useSessionStorage(STORAGE_KEY, 1));

    act(() => {
      result.current.setValue((currentValue) => currentValue + 2);
    });

    expect(result.current.value).toBe(3);

    unmount();

    const { result: nextResult } = renderHook(() => useSessionStorage(STORAGE_KEY, 0));

    expect(nextResult.current.value).toBe(3);
  });

  it("removes and resets values distinctly", () => {
    const { result, unmount } = renderHook(() => useSessionStorage(STORAGE_KEY, "draft"));

    act(() => {
      result.current.setValue("saved");
    });

    act(() => {
      result.current.remove();
    });

    expect(result.current.value).toBe("draft");
    expect(window.sessionStorage.getItem(STORAGE_KEY)).toBeNull();

    act(() => {
      result.current.setValue("edited");
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.value).toBe("draft");

    unmount();

    const { result: nextResult } = renderHook(() => useSessionStorage(STORAGE_KEY, "fallback"));

    expect(nextResult.current.value).toBe("draft");
  });

  it("handles invalid JSON in sessionStorage without crashing", () => {
    window.sessionStorage.setItem(STORAGE_KEY, "{not-valid-json");

    const { result } = renderHook(() => useSessionStorage(STORAGE_KEY, "fallback"));

    expect(result.current.value).toBe("fallback");

    act(() => {
      result.current.setValue("recovered");
    });

    expect(result.current.value).toBe("recovered");
  });

  it("persists explicit undefined values", () => {
    const { result, unmount } = renderHook(() =>
      useSessionStorage<string | undefined>(STORAGE_KEY, "fallback"),
    );

    act(() => {
      result.current.setValue(undefined);
    });

    expect(result.current.value).toBeUndefined();

    unmount();

    const { result: nextResult } = renderHook(() =>
      useSessionStorage<string | undefined>(STORAGE_KEY, "next-fallback"),
    );

    expect(nextResult.current.value).toBeUndefined();
  });

  it("stays usable when sessionStorage is unavailable", () => {
    Object.defineProperty(window, "sessionStorage", {
      configurable: true,
      get: () => undefined,
    });

    const { result } = renderHook(() => useSessionStorage(STORAGE_KEY, "fallback"));

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

  it("uses the latest initialValue for remove and reset when the key is unchanged", () => {
    const { result, rerender } = renderHook(
      ({ init }: { init: string }) => useSessionStorage(STORAGE_KEY, init),
      { initialProps: { init: "first" } },
    );

    act(() => {
      result.current.setValue("stored");
    });

    rerender({ init: "second" });

    act(() => {
      result.current.remove();
    });

    expect(result.current.value).toBe("second");
    expect(window.sessionStorage.getItem(STORAGE_KEY)).toBeNull();

    act(() => {
      result.current.setValue("edited");
    });

    rerender({ init: "third" });

    act(() => {
      result.current.reset();
    });

    expect(result.current.value).toBe("third");
    expect(window.sessionStorage.getItem(STORAGE_KEY)).not.toBeNull();
  });

  it("skips storage writes when a functional update resolves to the same value", () => {
    const setItem = vi.spyOn(Object.getPrototypeOf(window.sessionStorage), "setItem");
    const { result } = renderHook(() => useSessionStorage(STORAGE_KEY, 1));

    setItem.mockClear();

    act(() => {
      result.current.setValue((current) => current);
    });

    expect(result.current.value).toBe(1);
    expect(setItem).not.toHaveBeenCalled();

    setItem.mockRestore();
  });
});
