import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { For } from "../src/server";

describe("For", () => {
  it("renders each item with index keys by default", () => {
    render(<For each={["a", "b"]}>{(item) => <span>{item}</span>}</For>);

    expect(screen.getByText("a")).toBeInTheDocument();
    expect(screen.getByText("b")).toBeInTheDocument();
  });

  it("uses getKey when provided", () => {
    const { container } = render(
      <For each={[{ id: "x" }, { id: "y" }]} getKey={(item) => item.id}>
        {(item) => <span>{item.id}</span>}
      </For>,
    );

    expect(container.textContent).toBe("xy");
  });

  it("renders empty state when the list is empty", () => {
    render(
      <For each={[]} empty={() => <span>none</span>}>
        {(item) => <span>{item}</span>}
      </For>,
    );

    expect(screen.getByText("none")).toBeInTheDocument();
  });

  it("renders loading state when isLoading is true", () => {
    render(
      <For each={["a"]} isLoading loading={() => <span>loading</span>}>
        {(item) => <span>{item}</span>}
      </For>,
    );

    expect(screen.getByText("loading")).toBeInTheDocument();
    expect(screen.queryByText("a")).not.toBeInTheDocument();
  });

  it("wraps items when as is provided", () => {
    const { container } = render(
      <For each={["one"]} as="ul" wrapperProps={{ className: "list" }}>
        {(item) => <li>{item}</li>}
      </For>,
    );

    const list = container.querySelector("ul.list");
    expect(list).not.toBeNull();
    expect(list?.textContent).toBe("one");
  });
});
