# @thepuskar/use-kit

Typed React hooks and utility components with explicit **RSC-safe** and **client** entrypoints for Next.js App Router and other React 18+ apps.

## Install

```bash
npm install @thepuskar/use-kit
```

## Usage

### Component (server-safe)

```tsx
import { Match, Switch } from "@thepuskar/use-kit";

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

## Docs App

`USE_KIT_SOURCE` is only for the `docs` app.

- Production: leave `USE_KIT_SOURCE` unset, or set it to `0`. This uses the published `@thepuskar/use-kit` package from `docs/package.json`.
- Local source mode: set `USE_KIT_SOURCE=1`. This makes the docs app resolve `@thepuskar/use-kit` from the local repo `src` directory.
- Local production-like mode: leave `USE_KIT_SOURCE` unset if you want local behavior to match production.

Examples:

```bash
cd docs
pnpm dev
pnpm build
```

Those commands use the published package.

```bash
cd docs
pnpm dev:source
pnpm build:source
```

Those commands set `USE_KIT_SOURCE=1` and use local source aliases.

## Community

- Contributing: [CONTRIBUTING.md](./CONTRIBUTING.md)
- Project Pipeline: [PIPELINE.md](./PIPELINE.md)
- Code of Conduct: [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
- Support: [SUPPORT.md](./SUPPORT.md)
- Security: [SECURITY.md](./SECURITY.md)
- License: [LICENSE](./LICENSE)
