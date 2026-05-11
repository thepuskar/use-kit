import { act, renderHook } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { useDisclosure } from "../src/client/hooks";

describe("useDisclosure", () => {
  it("defaults to closed in uncontrolled mode", () => {
    const { result } = renderHook(() => useDisclosure());

    expect(result.current.isOpen).toBe(false);
  });

  it("initializes uncontrolled state from defaultOpen", () => {
    const { result } = renderHook(() =>
      useDisclosure({
        defaultOpen: true,
      }),
    );

    expect(result.current.isOpen).toBe(true);
  });

  it("does not re-read defaultOpen after uncontrolled initialization", () => {
    const { result, rerender } = renderHook(
      ({ defaultOpen }: { defaultOpen: boolean }) =>
        useDisclosure({
          defaultOpen,
        }),
      {
        initialProps: {
          defaultOpen: true,
        },
      },
    );

    rerender({
      defaultOpen: false,
    });

    expect(result.current.isOpen).toBe(true);
  });

  it("opens, closes, toggles, and notifies only on uncontrolled transitions", () => {
    const onOpen = vi.fn();
    const onClose = vi.fn();
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useDisclosure({
        onOpen,
        onClose,
        onChange,
      }),
    );

    act(() => {
      result.current.open();
    });

    expect(result.current.isOpen).toBe(true);
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true);

    act(() => {
      result.current.open();
      result.current.setOpen(true);
    });

    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.toggle();
    });

    expect(result.current.isOpen).toBe(false);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith(false);

    act(() => {
      result.current.close();
    });

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("composes consecutive uncontrolled updates before rerender", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useDisclosure({
        onChange,
      }),
    );

    act(() => {
      result.current.toggle();
      result.current.toggle();
    });

    expect(result.current.isOpen).toBe(false);
    expect(onChange).toHaveBeenNthCalledWith(1, true);
    expect(onChange).toHaveBeenNthCalledWith(2, false);
  });

  it("derives state from controlled open and ignores defaultOpen", () => {
    const onOpen = vi.fn();
    const onClose = vi.fn();
    const onChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ open }: { open: boolean }) =>
        useDisclosure({
          open,
          defaultOpen: true,
          onOpen,
          onClose,
          onChange,
        }),
      {
        initialProps: {
          open: false,
        },
      },
    );

    expect(result.current.isOpen).toBe(false);

    act(() => {
      result.current.open();
    });

    expect(result.current.isOpen).toBe(false);
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true);

    rerender({
      open: true,
    });

    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.setOpen(true);
    });

    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.close();
    });

    expect(result.current.isOpen).toBe(true);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it("tracks pending controlled transitions across consecutive calls before rerender", () => {
    const onOpen = vi.fn();
    const onClose = vi.fn();
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useDisclosure({
        open: false,
        onOpen,
        onClose,
        onChange,
      }),
    );

    act(() => {
      result.current.setOpen(true);
      result.current.setOpen(true);
      result.current.toggle();
    });

    expect(result.current.isOpen).toBe(false);
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenNthCalledWith(1, true);
    expect(onChange).toHaveBeenNthCalledWith(2, false);
  });

  it("uses the latest callbacks", () => {
    const firstOnOpen = vi.fn();
    const nextOnOpen = vi.fn();
    const firstOnChange = vi.fn();
    const nextOnChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ onOpen, onChange }: { onOpen: () => void; onChange: (open: boolean) => void }) =>
        useDisclosure({
          onOpen,
          onChange,
        }),
      {
        initialProps: {
          onOpen: firstOnOpen,
          onChange: firstOnChange,
        },
      },
    );

    rerender({
      onOpen: nextOnOpen,
      onChange: nextOnChange,
    });

    act(() => {
      result.current.open();
    });

    expect(firstOnOpen).not.toHaveBeenCalled();
    expect(firstOnChange).not.toHaveBeenCalled();
    expect(nextOnOpen).toHaveBeenCalledTimes(1);
    expect(nextOnChange).toHaveBeenCalledWith(true);
  });

  it("keeps the return object and action references stable across unchanged rerenders", () => {
    const { result, rerender } = renderHook(() => useDisclosure());
    const firstReturn = result.current;
    const firstOpen = result.current.open;
    const firstClose = result.current.close;
    const firstToggle = result.current.toggle;
    const firstSetOpen = result.current.setOpen;

    rerender();

    expect(result.current).toBe(firstReturn);
    expect(result.current.open).toBe(firstOpen);
    expect(result.current.close).toBe(firstClose);
    expect(result.current.toggle).toBe(firstToggle);
    expect(result.current.setOpen).toBe(firstSetOpen);
  });

  it("renders safely on the server", () => {
    function ServerRenderedDisclosure() {
      const { isOpen } = useDisclosure({
        defaultOpen: true,
      });

      return <span>{String(isOpen)}</span>;
    }

    expect(renderToString(<ServerRenderedDisclosure />)).toContain("<span>true</span>");
  });
});
