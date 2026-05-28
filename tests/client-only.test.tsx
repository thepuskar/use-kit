import { act, render, screen, waitFor } from "@testing-library/react";
import { StrictMode } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ClientOnly } from "../src/client";

const originalLocalStorageDescriptor = Object.getOwnPropertyDescriptor(window, "localStorage");
const originalMatchMediaDescriptor = Object.getOwnPropertyDescriptor(window, "matchMedia");
const originalRequestIdleCallbackDescriptor = Object.getOwnPropertyDescriptor(
  window,
  "requestIdleCallback",
);
const originalCancelIdleCallbackDescriptor = Object.getOwnPropertyDescriptor(
  window,
  "cancelIdleCallback",
);
const originalRequestAnimationFrameDescriptor = Object.getOwnPropertyDescriptor(
  window,
  "requestAnimationFrame",
);
const originalCancelAnimationFrameDescriptor = Object.getOwnPropertyDescriptor(
  window,
  "cancelAnimationFrame",
);

function restoreWindowProperty(name: keyof Window, descriptor: PropertyDescriptor | undefined) {
  if (descriptor) {
    Object.defineProperty(window, name, descriptor);
    return;
  }

  Reflect.deleteProperty(window, name);
}

function installMissingWindowFeature(name: keyof Window) {
  Object.defineProperty(window, name, {
    configurable: true,
    writable: true,
    value: undefined,
  });
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  restoreWindowProperty("localStorage", originalLocalStorageDescriptor);
  restoreWindowProperty("matchMedia", originalMatchMediaDescriptor);
  restoreWindowProperty("requestIdleCallback", originalRequestIdleCallbackDescriptor);
  restoreWindowProperty("cancelIdleCallback", originalCancelIdleCallbackDescriptor);
  restoreWindowProperty("requestAnimationFrame", originalRequestAnimationFrameDescriptor);
  restoreWindowProperty("cancelAnimationFrame", originalCancelAnimationFrameDescriptor);
});

describe("ClientOnly", () => {
  it("renders fallback on the initial client render", () => {
    const container = document.createElement("div");
    const root = createRoot(container);

    flushSync(() => {
      root.render(
        <ClientOnly fallback={<span>Loading</span>}>
          <span>Ready</span>
        </ClientOnly>,
      );
    });

    expect(container).toHaveTextContent("Loading");
    expect(container).not.toHaveTextContent("Ready");

    act(() => {
      root.unmount();
    });
  });

  it("renders children after client mount", async () => {
    render(
      <ClientOnly fallback={<span>Loading</span>}>
        <span>Ready</span>
      </ClientOnly>,
    );

    expect(await screen.findByText("Ready")).toBeInTheDocument();
    expect(screen.queryByText("Loading")).not.toBeInTheDocument();
  });

  it("supports fallback={null}", () => {
    vi.useFakeTimers();

    const { container } = render(
      <ClientOnly fallback={null} delay={100}>
        <span>Ready</span>
      </ClientOnly>,
    );

    expect(container).toBeEmptyDOMElement();

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(screen.getByText("Ready")).toBeInTheDocument();
  });

  it("does not wrap null fallback when suppressing hydration warnings", () => {
    vi.useFakeTimers();

    const { container } = render(
      <ClientOnly fallback={null} delay={100} suppressHydrationWarning>
        <span>Ready</span>
      </ClientOnly>,
    );

    expect(container).toBeEmptyDOMElement();

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(screen.getByText("Ready")).toBeInTheDocument();
  });

  it("does not wrap post-mount children when suppressing hydration warnings", () => {
    vi.useFakeTimers();

    const { container } = render(
      <ClientOnly fallback={<span>Loading</span>} delay={100} suppressHydrationWarning>
        Ready
      </ClientOnly>,
    );

    expect(container.innerHTML).toBe("<span>Loading</span>");

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(container.innerHTML).toBe("Ready");
  });

  it("supports function-as-child state", () => {
    vi.useFakeTimers();

    render(
      <ClientOnly fallback={<span>Loading</span>} delay={100}>
        {({ isClient, isReady, isSupported, missingFeatures }) => (
          <span>
            {isClient && isSupported && missingFeatures.length === 0 && !isReady
              ? "Waiting"
              : "Ready"}
          </span>
        )}
      </ClientOnly>,
    );

    expect(screen.getByText("Waiting")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(screen.getByText("Ready")).toBeInTheDocument();
  });

  it("supports delayed rendering", () => {
    vi.useFakeTimers();

    render(
      <ClientOnly fallback={<span>Loading</span>} delay={300}>
        <span>Ready</span>
      </ClientOnly>,
    );

    expect(screen.getByText("Loading")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(299);
    });

    expect(screen.queryByText("Ready")).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(screen.getByText("Ready")).toBeInTheDocument();
  });

  it("treats negative delay as zero", async () => {
    render(
      <ClientOnly fallback={<span>Loading</span>} delay={-10}>
        <span>Ready</span>
      </ClientOnly>,
    );

    expect(await screen.findByText("Ready")).toBeInTheDocument();
  });

  it("cleans up delay timers on unmount", () => {
    vi.useFakeTimers();
    const onReady = vi.fn();
    const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");
    const { unmount } = render(
      <ClientOnly fallback={<span>Loading</span>} delay={1000} onReady={onReady}>
        <span>Ready</span>
      </ClientOnly>,
    );

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(onReady).not.toHaveBeenCalled();
  });

  it('supports strategy="idle"', () => {
    vi.useFakeTimers();
    const requestIdleCallback = vi.fn((callback: IdleRequestCallback) => {
      const handle = window.setTimeout(
        () =>
          callback({
            didTimeout: false,
            timeRemaining: () => 50,
          }),
        0,
      );

      return handle;
    });
    const cancelIdleCallback = vi.fn((handle: number) => {
      window.clearTimeout(handle);
    });

    Object.defineProperty(window, "requestIdleCallback", {
      configurable: true,
      writable: true,
      value: requestIdleCallback,
    });
    Object.defineProperty(window, "cancelIdleCallback", {
      configurable: true,
      writable: true,
      value: cancelIdleCallback,
    });

    render(
      <ClientOnly fallback={<span>Loading</span>} strategy="idle">
        <span>Ready</span>
      </ClientOnly>,
    );

    expect(screen.getByText("Loading")).toBeInTheDocument();
    expect(requestIdleCallback).toHaveBeenCalledTimes(1);

    act(() => {
      vi.runOnlyPendingTimers();
    });

    expect(screen.getByText("Ready")).toBeInTheDocument();
  });

  it('supports strategy="animation-frame"', () => {
    vi.useFakeTimers();
    const requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
      const handle = window.setTimeout(() => callback(16), 16);

      return handle;
    });
    const cancelAnimationFrame = vi.fn((handle: number) => {
      window.clearTimeout(handle);
    });

    Object.defineProperty(window, "requestAnimationFrame", {
      configurable: true,
      writable: true,
      value: requestAnimationFrame,
    });
    Object.defineProperty(window, "cancelAnimationFrame", {
      configurable: true,
      writable: true,
      value: cancelAnimationFrame,
    });

    render(
      <ClientOnly fallback={<span>Loading</span>} strategy="animation-frame">
        <span>Ready</span>
      </ClientOnly>,
    );

    expect(screen.getByText("Loading")).toBeInTheDocument();
    expect(requestAnimationFrame).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(16);
    });

    expect(screen.getByText("Ready")).toBeInTheDocument();
  });

  it("calls onReady once in Strict Mode", async () => {
    const onReady = vi.fn();

    render(
      <StrictMode>
        <ClientOnly fallback={<span>Loading</span>} onReady={onReady}>
          <span>Ready</span>
        </ClientOnly>
      </StrictMode>,
    );

    expect(await screen.findByText("Ready")).toBeInTheDocument();
    expect(onReady).toHaveBeenCalledTimes(1);
  });

  it("calls onReady again when readiness config changes", () => {
    vi.useFakeTimers();
    const onReady = vi.fn();

    const { rerender } = render(
      <ClientOnly fallback={<span>Loading</span>} delay={100} onReady={onReady}>
        <span>Ready</span>
      </ClientOnly>,
    );

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(onReady).toHaveBeenCalledTimes(1);

    rerender(
      <ClientOnly fallback={<span>Loading</span>} delay={200} onReady={onReady}>
        <span>Ready</span>
      </ClientOnly>,
    );

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(onReady).toHaveBeenCalledTimes(2);
  });

  it("detects missing localStorage and renders unsupportedFallback", async () => {
    const onUnsupported = vi.fn();

    installMissingWindowFeature("localStorage");

    render(
      <ClientOnly
        fallback={<span>Loading</span>}
        unsupportedFallback={(missingFeatures) => (
          <span>Missing: {missingFeatures.join(", ")}</span>
        )}
        require={{ localStorage: true }}
        onUnsupported={onUnsupported}
      >
        <span>Ready</span>
      </ClientOnly>,
    );

    expect(await screen.findByText("Missing: localStorage")).toBeInTheDocument();
    expect(screen.queryByText("Ready")).not.toBeInTheDocument();
    expect(onUnsupported).toHaveBeenCalledTimes(1);
    expect(onUnsupported).toHaveBeenCalledWith(["localStorage"]);
  });

  it("detects missing matchMedia and falls back when unsupportedFallback is omitted", async () => {
    installMissingWindowFeature("matchMedia");

    render(
      <ClientOnly fallback={<span>Loading</span>} require={{ matchMedia: true }}>
        <span>Ready</span>
      </ClientOnly>,
    );

    expect(await screen.findByText("Loading")).toBeInTheDocument();
    expect(screen.queryByText("Ready")).not.toBeInTheDocument();
  });

  it("does not wrap unsupported fallback when suppressing hydration warnings", async () => {
    installMissingWindowFeature("matchMedia");

    const { container } = render(
      <ClientOnly
        fallback={null}
        unsupportedFallback="Unsupported"
        require={{ matchMedia: true }}
        suppressHydrationWarning
      >
        <span>Ready</span>
      </ClientOnly>,
    );

    expect(await screen.findByText("Unsupported")).toBeInTheDocument();
    expect(container.innerHTML).toBe("Unsupported");
  });

  it("calls onUnsupported once in Strict Mode", async () => {
    const onUnsupported = vi.fn();

    installMissingWindowFeature("matchMedia");

    render(
      <StrictMode>
        <ClientOnly
          fallback={<span>Loading</span>}
          unsupportedFallback={<span>Unsupported</span>}
          require={{ matchMedia: true }}
          onUnsupported={onUnsupported}
        >
          <span>Ready</span>
        </ClientOnly>
      </StrictMode>,
    );

    expect(await screen.findByText("Unsupported")).toBeInTheDocument();
    expect(onUnsupported).toHaveBeenCalledTimes(1);
  });

  it("calls onUnsupported again when requirement config changes", async () => {
    const onUnsupported = vi.fn();

    installMissingWindowFeature("matchMedia");

    const { rerender } = render(
      <ClientOnly
        fallback={<span>Loading</span>}
        unsupportedFallback={<span>Unsupported</span>}
        require={{ matchMedia: true }}
        onUnsupported={onUnsupported}
      >
        <span>Ready</span>
      </ClientOnly>,
    );

    expect(await screen.findByText("Unsupported")).toBeInTheDocument();
    expect(onUnsupported).toHaveBeenCalledTimes(1);
    expect(onUnsupported).toHaveBeenLastCalledWith(["matchMedia"]);

    rerender(
      <ClientOnly
        fallback={<span>Loading</span>}
        unsupportedFallback={<span>Unsupported</span>}
        require={{ window: true, matchMedia: true }}
        onUnsupported={onUnsupported}
      >
        <span>Ready</span>
      </ClientOnly>,
    );

    await waitFor(() => {
      expect(onUnsupported).toHaveBeenCalledTimes(2);
    });
    expect(onUnsupported).toHaveBeenLastCalledWith(["matchMedia"]);
  });

  it("works inside React Strict Mode", async () => {
    render(
      <StrictMode>
        <ClientOnly fallback={<span>Loading</span>}>
          <span>Ready</span>
        </ClientOnly>
      </StrictMode>,
    );

    expect(await screen.findByText("Ready")).toBeInTheDocument();
  });

  it("reports internal scheduling errors and keeps rendering fallback", async () => {
    const onError = vi.fn();

    Object.defineProperty(window, "requestAnimationFrame", {
      configurable: true,
      writable: true,
      value: () => {
        throw new Error("scheduler unavailable");
      },
    });

    render(
      <ClientOnly fallback={<span>Loading</span>} strategy="animation-frame" onError={onError}>
        <span>Ready</span>
      </ClientOnly>,
    );

    await waitFor(() => {
      expect(onError).toHaveBeenCalledTimes(1);
    });
    expect(screen.getByText("Loading")).toBeInTheDocument();
    expect(screen.queryByText("Ready")).not.toBeInTheDocument();
  });
});
