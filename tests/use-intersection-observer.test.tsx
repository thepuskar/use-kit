import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useIntersectionObserver } from "../src/client/hooks";

function createRect(): DOMRectReadOnly {
  return {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    toJSON: () => ({}),
  } as DOMRectReadOnly;
}

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];

  readonly observe = vi.fn((element: Element) => {
    this.elements.add(element);
  });

  readonly unobserve = vi.fn((element: Element) => {
    this.elements.delete(element);
  });

  readonly disconnect = vi.fn(() => {
    this.elements.clear();
  });

  private readonly elements = new Set<Element>();

  constructor(
    private readonly callback: IntersectionObserverCallback,
    readonly options?: IntersectionObserverInit,
  ) {
    MockIntersectionObserver.instances.push(this);
  }

  trigger({
    target,
    isIntersecting = false,
    intersectionRatio = 0,
  }: {
    target: Element;
    isIntersecting?: boolean;
    intersectionRatio?: number;
  }) {
    const entry = {
      target,
      isIntersecting,
      intersectionRatio,
      time: Date.now(),
      boundingClientRect: createRect(),
      intersectionRect: createRect(),
      rootBounds: null,
    } as IntersectionObserverEntry;

    this.callback([entry], this as unknown as IntersectionObserver);
  }

  static reset() {
    MockIntersectionObserver.instances = [];
  }
}

const originalIntersectionObserver = window.IntersectionObserver;

describe("useIntersectionObserver", () => {
  beforeEach(() => {
    MockIntersectionObserver.reset();
    Object.defineProperty(window, "IntersectionObserver", {
      configurable: true,
      writable: true,
      value: MockIntersectionObserver,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "IntersectionObserver", {
      configurable: true,
      writable: true,
      value: originalIntersectionObserver,
    });
  });

  it("observes a node from the returned callback ref and exposes derived state", () => {
    const { result } = renderHook(() => useIntersectionObserver<HTMLDivElement>());
    const element = document.createElement("div");

    act(() => {
      result.current.ref(element);
    });

    const observer = MockIntersectionObserver.instances[0];

    expect(observer.observe).toHaveBeenCalledWith(element);
    expect(result.current.target).toBe(element);
    expect(result.current.isIntersecting).toBe(false);
    expect(result.current.entry).toBeNull();

    act(() => {
      observer.trigger({
        target: element,
        isIntersecting: true,
        intersectionRatio: 0.6,
      });
    });

    expect(result.current.entry?.target).toBe(element);
    expect(result.current.isIntersecting).toBe(true);
    expect(result.current.hasIntersected).toBe(true);
    expect(result.current.intersectionRatio).toBe(0.6);
  });

  it("supports external refs, onChange, and freezeOnceVisible", () => {
    const onChange = vi.fn();
    const ref = { current: document.createElement("div") };

    const { result } = renderHook(() =>
      useIntersectionObserver<HTMLDivElement>({
        ref,
        freezeOnceVisible: true,
        threshold: 0.25,
        onChange,
      }),
    );

    const observer = MockIntersectionObserver.instances[0];

    expect(observer.observe).toHaveBeenCalledWith(ref.current);
    expect(observer.options?.threshold).toBe(0.25);

    act(() => {
      observer.trigger({
        target: ref.current,
        isIntersecting: true,
        intersectionRatio: 1,
      });
    });

    expect(result.current.isIntersecting).toBe(true);
    expect(result.current.hasIntersected).toBe(true);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: ref.current,
        isIntersecting: true,
      }),
      expect.any(MockIntersectionObserver),
    );
    expect(observer.disconnect).toHaveBeenCalledTimes(1);
  });

  it("returns the fallback state when IntersectionObserver is not supported", () => {
    Object.defineProperty(window, "IntersectionObserver", {
      configurable: true,
      writable: true,
      value: undefined,
    });

    const { result } = renderHook(() =>
      useIntersectionObserver({
        fallbackInView: true,
      }),
    );

    expect(MockIntersectionObserver.instances).toHaveLength(0);
    expect(result.current.isSupported).toBe(false);
    expect(result.current.isIntersecting).toBe(true);
    expect(result.current.hasIntersected).toBe(true);
    expect(result.current.intersectionRatio).toBe(0);
  });

  it("does not create an observer when disabled", () => {
    const ref = { current: document.createElement("div") };

    const { result } = renderHook(() =>
      useIntersectionObserver<HTMLDivElement>({
        ref,
        disabled: true,
      }),
    );

    expect(MockIntersectionObserver.instances).toHaveLength(0);
    expect(result.current.target).toBe(ref.current);
    expect(result.current.isIntersecting).toBe(false);
  });
});
