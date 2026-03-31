## Docs App

`USE_KIT_SOURCE` is only for the `docs` app.

- Default local mode: leave `USE_KIT_SOURCE` unset, or set it to `1`. This makes the docs app resolve `@thepuskar/use-kit` from the local repo `src` directory.
- Published-package mode: set `USE_KIT_SOURCE=0`. This uses the published `@thepuskar/use-kit` package from `docs/package.json`.

Examples:

```bash
cd docs
pnpm dev
pnpm build
```

Those commands use local source aliases.

```bash
cd docs
pnpm dev:published
pnpm build:published
```

Those commands set `USE_KIT_SOURCE=0` and use the published package.
