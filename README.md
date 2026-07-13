# react-rsc-kit

Typed React hooks and utility components with explicit **RSC-safe** and **client** entrypoints for Next.js App Router and other React 18+ apps.

[![npm version](https://img.shields.io/npm/v/react-rsc-kit)](https://www.npmjs.com/package/react-rsc-kit)
[![npm downloads](https://img.shields.io/npm/dm/react-rsc-kit)](https://www.npmjs.com/package/react-rsc-kit)
[![Docs](https://img.shields.io/badge/docs-live-0f766e)](https://react-rsc-kit.puskaradhikari.com.np/)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)

## Links

- Docs: [react-rsc-kit.puskaradhikari.com.np](https://react-rsc-kit.puskaradhikari.com.np/)
- npm: [npmjs.com/package/react-rsc-kit](https://www.npmjs.com/package/react-rsc-kit)
- Issues: [github.com/thepuskar/react-rsc-kit/issues](https://github.com/thepuskar/react-rsc-kit/issues)
- Repository: [github.com/thepuskar/react-rsc-kit](https://github.com/thepuskar/react-rsc-kit)

## Install

```bash
npm install react-rsc-kit
```

## Features

- RSC-safe root and server entrypoints for control-flow primitives.
- Client entrypoints for hooks and browser-aware utilities.
- `ClientOnly` for hydration-safe browser-only subtrees, fallbacks, delays, feature checks, and scheduler strategies.
- TypeScript-first public API with focused React 18+ support.

## Usage

### Component (server-safe)

```tsx
import { Match, Show, Switch } from "react-rsc-kit";

export function Greeting({ user }: { user: { name: string } | null }) {
  return (
    <Show when={user} fallback={<p>Please sign in</p>}>
      {(u) => <p>Welcome, {u.name}</p>}
    </Show>
  );
}

export function Status({ user }: { user: { name: string } | null }) {
  return (
    <Switch fallback={<p>Please sign in</p>}>
      <Match when={user}>{(u) => <p>Welcome, {u.name}</p>}</Match>
    </Switch>
  );
}
```

### Hook (client-only)

```tsx
"use client";

import { useToggle } from "react-rsc-kit/client";

export function ToggleButton() {
  const [on, toggle] = useToggle(false);
  return <button onClick={() => toggle()}>{on ? "ON" : "OFF"}</button>;
}
```

### ClientOnly (client-only)

```tsx
"use client";

import { ClientOnly } from "react-rsc-kit/client";

export function ChartBoundary() {
  return (
    <ClientOnly
      fallback={<div aria-busy="true">Loading chart...</div>}
      require={{ window: true, document: true, matchMedia: true }}
      strategy="idle"
    >
      <Chart />
    </ClientOnly>
  );
}
```

### Async data (client-only)

Prefer **`useFetch`** for HTTP reads and **`useMutation`** for writes / side effects. They expose status flags, abort, and typed results.

`useAsync` / `useAsyncFn` remain for lightweight manual runners, but new code should use `useFetch` / `useMutation` when they fit.

```tsx
"use client";

import { useFetch, useMutation } from "react-rsc-kit/client";

export function Profile({ id }: { id: string }) {
  const { data, loading, error } = useFetch<{ name: string }>(`/api/users/${id}`);
  const save = useMutation(async (name: string) => {
    await fetch(`/api/users/${id}`, { method: "PATCH", body: JSON.stringify({ name }) });
  });

  if (loading) return <p>Loading…</p>;
  if (error || !data) return <p>Failed</p>;

  return (
    <button onClick={() => save.mutate(data.name)} disabled={save.isPending}>
      {data.name}
    </button>
  );
}
```

## RSC Guidance

- `react-rsc-kit` and `react-rsc-kit/server` are **server-safe** entrypoints.
- `react-rsc-kit/client` and `react-rsc-kit/hooks` are **client entrypoints**.
- In Next.js App Router, import hooks/client-only APIs only from `.../client` (or `.../hooks`) inside files that have `"use client"`.

## Development

```bash
npm install
npm run build
npm run test
npm run lint
npm run format:check
```

## Community

- Contributing: [CONTRIBUTING.md](./CONTRIBUTING.md)
- Project Pipeline: [PIPELINE.md](./PIPELINE.md)
- Code of Conduct: [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
- Support: [SUPPORT.md](./SUPPORT.md)
- Security: [SECURITY.md](./SECURITY.md)
- License: [LICENSE](./LICENSE)
