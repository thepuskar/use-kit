import { act, renderHook } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useControllableState } from "../src/client/hooks";

describe("useControllableState", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("initializes uncontrolled state from a direct defaultValue", () => {
    const { result } = renderHook(() =>
      useControllableState<string>({
        defaultValue: "initial",
      }),
    );

    expect(result.current[0]).toBe("initial");
    expect(result.current[2].isControlled).toBe(false);
  });

  it("supports lazy uncontrolled initialization", () => {
    const initializer = vi.fn(() => "lazy");
    const { result, rerender } = renderHook(() =>
      useControllableState<string>({
        defaultValue: initializer,
      }),
    );

    rerender();

    expect(result.current[0]).toBe("lazy");
    expect(initializer).toHaveBeenCalledTimes(1);
  });

  it("treats undefined value as uncontrolled", () => {
    const { result } = renderHook(() =>
      useControllableState<string>({
        value: undefined,
        defaultValue: "fallback",
      }),
    );

    expect(result.current[0]).toBe("fallback");
    expect(result.current[2].isControlled).toBe(false);
  });

  it("does not re-read defaultValue after uncontrolled initialization", () => {
    const { result, rerender } = renderHook(
      ({ defaultValue }: { defaultValue: string }) =>
        useControllableState<string>({
          defaultValue,
        }),
      {
        initialProps: {
          defaultValue: "first",
        },
      },
    );

    rerender({
      defaultValue: "second",
    });

    expect(result.current[0]).toBe("first");
  });

  it("updates uncontrolled state and calls onChange", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useControllableState<number>({
        defaultValue: 1,
        onChange,
      }),
    );

    act(() => {
      result.current[1](2);
    });

    expect(result.current[0]).toBe(2);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(2, 1);
  });

  it("uses the controlled value as the source of truth", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) =>
        useControllableState<string>({
          value,
        }),
      {
        initialProps: {
          value: "first",
        },
      },
    );

    expect(result.current[0]).toBe("first");
    expect(result.current[2].isControlled).toBe(true);

    rerender({
      value: "second",
    });

    expect(result.current[0]).toBe("second");
  });

  it("calls onChange without updating internal state in controlled mode", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useControllableState<string>({
        value: "current",
        onChange,
      }),
    );

    act(() => {
      result.current[1]("requested");
    });

    expect(result.current[0]).toBe("current");
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("requested", "current");
  });

  it("supports functional updates in uncontrolled mode", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useControllableState<number>({
        defaultValue: 1,
        onChange,
      }),
    );

    act(() => {
      result.current[1]((currentValue) => (currentValue ?? 0) + 1);
    });

    expect(result.current[0]).toBe(2);
    expect(onChange).toHaveBeenCalledWith(2, 1);
  });

  it("composes consecutive uncontrolled functional updates", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useControllableState<number>({
        defaultValue: 0,
        onChange,
      }),
    );

    act(() => {
      result.current[1]((currentValue) => (currentValue ?? 0) + 1);
      result.current[1]((currentValue) => (currentValue ?? 0) + 1);
    });

    expect(result.current[0]).toBe(2);
    expect(onChange).toHaveBeenNthCalledWith(1, 1, 0);
    expect(onChange).toHaveBeenNthCalledWith(2, 2, 1);
  });

  it("supports functional updates in controlled mode", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useControllableState<number>({
        value: 10,
        onChange,
      }),
    );

    act(() => {
      result.current[1]((currentValue) => (currentValue ?? 0) + 5);
    });

    expect(result.current[0]).toBe(10);
    expect(onChange).toHaveBeenCalledWith(15, 10);
  });

  it("does not call onChange when the requested value is unchanged", () => {
    const uncontrolledOnChange = vi.fn();
    const controlledOnChange = vi.fn();
    const { result: uncontrolledResult } = renderHook(() =>
      useControllableState<string>({
        defaultValue: "same",
        onChange: uncontrolledOnChange,
      }),
    );
    const { result: controlledResult } = renderHook(() =>
      useControllableState<string>({
        value: "same",
        onChange: controlledOnChange,
      }),
    );

    act(() => {
      uncontrolledResult.current[1]("same");
      controlledResult.current[1]("same");
    });

    expect(uncontrolledOnChange).not.toHaveBeenCalled();
    expect(controlledOnChange).not.toHaveBeenCalled();
  });

  it("uses a custom shouldUpdate predicate", () => {
    interface Item {
      id: number;
      label: string;
    }

    const onChange = vi.fn();
    const shouldUpdate = vi.fn((nextValue: Item, previousValue: Item) => {
      return nextValue.id !== previousValue.id;
    });
    const { result } = renderHook(() =>
      useControllableState<Item>({
        defaultValue: {
          id: 1,
          label: "Initial",
        },
        onChange,
        shouldUpdate,
      }),
    );

    act(() => {
      result.current[1]({
        id: 1,
        label: "Ignored",
      });
    });

    expect(result.current[0]).toEqual({
      id: 1,
      label: "Initial",
    });
    expect(onChange).not.toHaveBeenCalled();

    act(() => {
      result.current[1]({
        id: 2,
        label: "Accepted",
      });
    });

    expect(result.current[0]).toEqual({
      id: 2,
      label: "Accepted",
    });
    expect(shouldUpdate).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("uses the latest onChange callback", () => {
    const firstOnChange = vi.fn();
    const secondOnChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ onChange }: { onChange: (nextValue: string, previousValue: string) => void }) =>
        useControllableState<string>({
          defaultValue: "initial",
          onChange,
        }),
      {
        initialProps: {
          onChange: firstOnChange,
        },
      },
    );

    rerender({
      onChange: secondOnChange,
    });

    act(() => {
      result.current[1]("next");
    });

    expect(firstOnChange).not.toHaveBeenCalled();
    expect(secondOnChange).toHaveBeenCalledWith("next", "initial");
  });

  it("uses the latest shouldUpdate predicate", () => {
    const firstShouldUpdate = vi.fn(() => false);
    const secondShouldUpdate = vi.fn(() => true);
    const { result, rerender } = renderHook(
      ({ shouldUpdate }: { shouldUpdate: (nextValue: number, previousValue: number) => boolean }) =>
        useControllableState<number>({
          defaultValue: 0,
          shouldUpdate,
        }),
      {
        initialProps: {
          shouldUpdate: firstShouldUpdate,
        },
      },
    );

    rerender({
      shouldUpdate: secondShouldUpdate,
    });

    act(() => {
      result.current[1](1);
    });

    expect(result.current[0]).toBe(1);
    expect(firstShouldUpdate).not.toHaveBeenCalled();
    expect(secondShouldUpdate).toHaveBeenCalledWith(1, 0);
  });

  it("warns when switching between uncontrolled and controlled modes", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const initialProps: { value: string | undefined } = {
      value: undefined,
    };
    const { rerender } = renderHook(
      ({ value }: { value: string | undefined }) =>
        useControllableState<string>({
          value,
          name: "Tabs.value",
        }),
      {
        initialProps,
      },
    );

    expect(warn).not.toHaveBeenCalled();

    rerender({
      value: "settings",
    });

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("Tabs.value"));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("uncontrolled to controlled"));

    rerender({
      value: "billing",
    });

    expect(warn).toHaveBeenCalledTimes(1);
  });

  it("warns when both value and defaultValue are provided", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const { rerender } = renderHook(() =>
      useControllableState<string>({
        value: "controlled",
        defaultValue: "uncontrolled",
        name: "Select.value",
      }),
    );

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("Select.value"));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("both value and defaultValue"));

    rerender();

    expect(warn).toHaveBeenCalledTimes(1);
  });

  it("does not warn in production", () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    process.env.NODE_ENV = "production";

    try {
      renderHook(() =>
        useControllableState<string>({
          value: "controlled",
          defaultValue: "uncontrolled",
          name: "Select.value",
        }),
      );

      expect(warn).not.toHaveBeenCalled();
    } finally {
      if (originalNodeEnv === undefined) {
        delete process.env.NODE_ENV;
      } else {
        process.env.NODE_ENV = originalNodeEnv;
      }
    }
  });

  it("renders safely on the server", () => {
    function ServerRenderedValue() {
      const [value] = useControllableState<string>({
        defaultValue: "server",
      });

      return <span>{value}</span>;
    }

    expect(renderToString(<ServerRenderedValue />)).toContain("<span>server</span>");
  });
});
