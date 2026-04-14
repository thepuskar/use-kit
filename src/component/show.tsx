import { ReactNode } from "react";

import { type MaybeAccessor, resolveMaybeAccessor } from "../utils/resolveMaybeAccessor";

type Falsy = false | 0 | 0n | "" | null | undefined;
type Truthy<T> = Exclude<T, Falsy>;

export interface ShowProps<TWhen = unknown> {
  when: MaybeAccessor<TWhen>;
  children: ReactNode | ((value: Truthy<TWhen>) => ReactNode);
  fallback?: ReactNode;
}

export function Show<TWhen = unknown>({ when, children, fallback }: ShowProps<TWhen>) {
  const value = resolveMaybeAccessor(when);

  if (value) {
    if (typeof children === "function") {
      const render = children as (input: Truthy<TWhen>) => ReactNode;
      return <>{render(value as Truthy<TWhen>)}</>;
    }

    return <>{children}</>;
  }

  if (fallback === undefined) {
    return null;
  }

  return <>{fallback}</>;
}

Show.displayName = "Show";
