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
