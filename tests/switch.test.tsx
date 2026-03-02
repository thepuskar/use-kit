import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Match, Switch } from "../src/server";

describe("Switch", () => {
  it("renders only the first matching branch", () => {
    render(
      <Switch fallback={<span>fallback</span>}>
        <Match when={false}>first</Match>
        <Match when="ready">second</Match>
        <Match when={true}>third</Match>
      </Switch>,
    );

    expect(screen.getByText("second")).toBeInTheDocument();
    expect(screen.queryByText("third")).not.toBeInTheDocument();
    expect(screen.queryByText("fallback")).not.toBeInTheDocument();
  });
});
