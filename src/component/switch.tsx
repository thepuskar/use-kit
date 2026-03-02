import React, { ReactElement, ReactNode } from "react";

type Falsy = false | 0 | 0n | "" | null | undefined;
type Truthy<T> = Exclude<T, Falsy>;
type Accessor<T> = () => T;
type MaybeAccessor<T> = T | Accessor<T>;

export interface MatchProps<TWhen = unknown> {
  when: MaybeAccessor<TWhen>;
  children: ReactNode | ((value: Truthy<TWhen>) => ReactNode);
}

export interface SwitchProps {
  children: ReactNode;
  fallback?: ReactNode;
}

type InternalMatchProps = MatchProps<unknown>;
type MatchElement = ReactElement<InternalMatchProps, MatchComponent>;

type MatchComponent = {
  <TWhen>(props: MatchProps<TWhen>): ReactElement | null;
  $$switchMatch: symbol;
  displayName?: string;
};

const MATCH_MARKER = Symbol.for("use-kit.switch.match");

function resolveWhen<T>(when: MaybeAccessor<T>): T {
  if (typeof when === "function") {
    return (when as Accessor<T>)();
  }

  return when;
}

function isMatchElement(node: ReactNode): node is MatchElement {
  if (!React.isValidElement(node)) {
    return false;
  }

  const type = node.type as Partial<MatchComponent>;
  return type.$$switchMatch === MATCH_MARKER;
}

export const Match = ((_: MatchProps<unknown>) => null) as MatchComponent;
Match.$$switchMatch = MATCH_MARKER;
Match.displayName = "Match";

export function Switch({ children, fallback }: SwitchProps): ReactElement | null {
  const childArray = React.Children.toArray(children);

  for (const child of childArray) {
    if (!isMatchElement(child)) {
      throw new Error("Switch only accepts Match components as children.");
    }

    const { when, children: matchChildren } = child.props;
    const value = resolveWhen(when);

    if (value) {
      if (typeof matchChildren === "function") {
        const render = matchChildren as (input: unknown) => ReactNode;
        return <>{render(value)}</>;
      }

      return <>{matchChildren}</>;
    }
  }

  if (fallback === undefined) {
    return null;
  }

  return <>{fallback}</>;
}
