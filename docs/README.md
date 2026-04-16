## Docs App

`REACT_RSC_KIT_SOURCE` is only for the `docs` app.

- Default local mode: leave `REACT_RSC_KIT_SOURCE` unset, or set it to `1`. This makes the docs app resolve `react-rsc-kit` from the local repo `src` directory.
- Package mode: set `REACT_RSC_KIT_SOURCE=0`. This uses the installed `react-rsc-kit` dependency from `docs/package.json` instead of the local source aliases.

**Current setup:** `docs/package.json` points `react-rsc-kit` to `file:..` so the docs app stays installable before the renamed package exists on npm. If you want to validate the published npm package after the first release, replace that dependency with a semver range and keep `REACT_RSC_KIT_SOURCE=0`.

**Package mode note:** Build the root package first if you want to run the docs without source aliases:

```bash
npm run build
```

**New exports vs package mode:** The live docs app may demonstrate APIs that are not in the current packaged build yet. In that case a demo may import from `../../../src/...` so Turbopack does not prefer `node_modules/react-rsc-kit` over the alias. Keep the **repo root** `react` / `react-dom` versions aligned with `docs/package.json` (same major) so those imports do not load a second React copy (`ReactCurrentDispatcher` errors).

Examples:

```bash
cd docs
pnpm dev
pnpm build
```

Those commands use local source aliases.

```bash
cd docs
pnpm dev:package
pnpm build:package
```

Those commands set `REACT_RSC_KIT_SOURCE=0` and use the installed package dependency.
