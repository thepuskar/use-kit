export type Accessor<T> = () => T;
export type MaybeAccessor<T> = T | Accessor<T>;

export function resolveMaybeAccessor<T>(when: MaybeAccessor<T>): T {
  if (typeof when === "function") {
    return (when as Accessor<T>)();
  }

  return when;
}
