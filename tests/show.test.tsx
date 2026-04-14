import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Show } from "../src/server";

describe("Show", () => {
  it("renders children when when is truthy", () => {
    render(
      <Show when={true} fallback={<span>fallback</span>}>
        content
      </Show>,
    );

    expect(screen.getByText("content")).toBeInTheDocument();
    expect(screen.queryByText("fallback")).not.toBeInTheDocument();
  });

  it("renders fallback when when is falsy", () => {
    render(
      <Show when={false} fallback={<span>fallback</span>}>
        content
      </Show>,
    );

    expect(screen.getByText("fallback")).toBeInTheDocument();
    expect(screen.queryByText("content")).not.toBeInTheDocument();
  });

  it("renders nothing when when is falsy and fallback is omitted", () => {
    const { container } = render(
      <Show when={null}>
        <span>content</span>
      </Show>,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("resolves function when", () => {
    render(
      <Show when={() => "hello"} fallback={null}>
        {(value) => <span>{value}</span>}
      </Show>,
    );

    expect(screen.getByText("hello")).toBeInTheDocument();
  });

  it("passes narrowed value to render-prop children", () => {
    const user = { name: "Ava" };

    render(
      <Show when={user} fallback={<span>guest</span>}>
        {(u) => <span>Welcome, {u.name}</span>}
      </Show>,
    );

    expect(screen.getByText("Welcome, Ava")).toBeInTheDocument();
  });
});
