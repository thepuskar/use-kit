import React from "react";
import { render, screen } from "@testing-library/react";
import { Match, Switch } from "../switch";

describe("Switch", () => {
  it("renders only the first Match that resolves truthy", () => {
    render(
      <Switch fallback={<div>Fallback</div>}>
        <Match when={true}>
          <div>First</div>
        </Match>
        <Match when={true}>
          <div>Second</div>
        </Match>
      </Switch>
    );

    expect(screen.getByText("First")).toBeTruthy();
    expect(screen.queryByText("Second")).toBeNull();
    expect(screen.queryByText("Fallback")).toBeNull();
  });

  it("renders fallback when no Match succeeds", () => {
    render(
      <Switch fallback={<div>Fallback</div>}>
        <Match when={false}>
          <div>First</div>
        </Match>
        <Match when={0}>
          <div>Second</div>
        </Match>
        <Match when={""}>
          <div>Third</div>
        </Match>
      </Switch>
    );

    expect(screen.getByText("Fallback")).toBeTruthy();
  });

  it("renders null when no Match succeeds and fallback is not provided", () => {
    const { container } = render(
      <Switch>
        <Match when={false}>
          <div>First</div>
        </Match>
        <Match when={null}>
          <div>Second</div>
        </Match>
      </Switch>
    );

    expect(container.firstChild).toBeNull();
  });

  it("supports function `when` values", () => {
    const when = jest.fn(() => "ready");

    render(
      <Switch fallback={<div>Fallback</div>}>
        <Match when={when}>{(value) => <div>{value}</div>}</Match>
      </Switch>
    );

    expect(when).toHaveBeenCalledTimes(1);
    expect(screen.getByText("ready")).toBeTruthy();
  });

  it("passes the truthy `when` value to function children", () => {
    const user = { name: "Ada" };

    render(
      <Switch fallback={<div>Fallback</div>}>
        <Match when={user}>{(value) => <div>{value.name}</div>}</Match>
      </Switch>
    );

    expect(screen.getByText("Ada")).toBeTruthy();
  });

  it("stops evaluating after the first successful Match", () => {
    const laterWhen = jest.fn(() => true);

    render(
      <Switch fallback={<div>Fallback</div>}>
        <Match when={"matched"}>
          <div>First</div>
        </Match>
        <Match when={laterWhen}>
          <div>Second</div>
        </Match>
      </Switch>
    );

    expect(screen.getByText("First")).toBeTruthy();
    expect(laterWhen).not.toHaveBeenCalled();
  });

  it("throws when a direct child is not a Match component", () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    expect(() =>
      render(
        <Switch fallback={<div>Fallback</div>}>
          <div>Invalid child</div>
        </Switch>
      )
    ).toThrow("Switch only accepts Match components as children.");

    consoleErrorSpy.mockRestore();
  });
});
