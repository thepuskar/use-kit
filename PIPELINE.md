# Pipeline

Project pipeline for `@thepuskar/use-kit`.

The goal is to grow the library in a way that strengthens its core identity:
typed reusable React hooks, small utility components, and clear client/server boundaries.

## Phase 1: Foundation

- [ ] Rework `useFetch` into a production-safe primitive with abort support, configurable parsing, cache control, and better typing.
- [ ] Normalize naming and API consistency across hooks:
      `useAsyncFnc` -> `useAsyncFn`, `immidate` -> `immediate`, and align `useGetScrollPosition` naming.
- [ ] Review hooks that mutate inputs and decide whether they belong as React hooks or plain utilities, especially `useArray`.
- [ ] Expand test coverage across the existing public API before adding too many new exports.
- [ ] Tighten docs for client-only vs server-safe imports with examples for Next.js App Router and standard React apps.

## Phase 2: High-Value Hook Additions

- [x] `useLocalStorage`
- [x] `useSessionStorage`
- [ ] `usePrevious`
- [ ] `useControllableState`
- [ ] `useDisclosure`
- [ ] `useMediaQuery`
- [ ] `useWindowSize`
- [ ] `useResizeObserver` or `useElementSize`
- [ ] `useLockBodyScroll`
- [ ] `useHotkeys`
- [ ] `useOnlineStatus`
- [ ] `usePageVisibility`
- [ ] `useIdle`
- [ ] `useReducedMotion`
- [ ] `useHydrated`

## Phase 3: Async and Data Utilities

- [ ] `useAbortableFetch`
- [ ] `usePolling`
- [ ] `useInfiniteScroll`
- [ ] Optional adapter package for TanStack Query interoperability instead of overloading the core package.
- [ ] Small async helpers such as `debounceFn` and `throttleFn`.

## Phase 4: Headless Components and Utilities

- [ ] `ClientOnly`
- [ ] `Portal`
- [ ] `VisuallyHidden`
- [ ] `composeRefs`
- [ ] `mergeRefs`
- [ ] `composeEventHandlers`

## Phase 5: Package Quality and Tooling

- [ ] Add `Changesets` for versioning and release notes.
- [ ] Add `tsd` for public type tests.
- [ ] Add `publint` and `arethetypeswrong` to package validation.
- [ ] Add bundle size checks with `size-limit` or equivalent.
- [ ] Add example apps for Next.js App Router and Vite.
- [ ] Modernize the docs app dependencies and keep docs aligned with the published API.

## Execution Order

1. Stabilize existing hooks and naming.
2. Add storage, responsive, and lifecycle hooks.
3. Add async/data helpers only after the base fetch story is solid.
4. Add headless utilities that improve ergonomics without increasing maintenance too much.
5. Raise package quality gates so every new export is tested, typed, and documented.
