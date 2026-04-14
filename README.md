# @thepuskar/use-kit

Typed React hooks and utility components with explicit **RSC-safe** and **client** entrypoints for Next.js App Router and other React 18+ apps.

## Install

```bash
npm install @thepuskar/use-kit
```

## Usage

### Component (server-safe)

```tsx
import { Match, Show, Switch } from "@thepuskar/use-kit";

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

import { useToggle } from "@thepuskar/use-kit/client";

export function ToggleButton() {
  const [on, toggle] = useToggle(false);
  return <button onClick={() => toggle()}>{on ? "ON" : "OFF"}</button>;
}
```

## RSC Guidance

- `@thepuskar/use-kit` and `@thepuskar/use-kit/server` are **server-safe** entrypoints.
- `@thepuskar/use-kit/client` and `@thepuskar/use-kit/hooks` are **client entrypoints**.
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
