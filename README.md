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
