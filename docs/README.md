## Docs App

`USE_KIT_SOURCE` is only for the `docs` app.

- Default local mode: leave `USE_KIT_SOURCE` unset, or set it to `1`. This makes the docs app resolve `@thepuskar/use-kit` from the local repo `src` directory.
- Published-package mode: set `USE_KIT_SOURCE=0`. This uses the `@thepuskar/use-kit` version from `docs/package.json` (the npm registry). Use this to verify the docs against what consumers install. The documented APIs must exist in that published version (bump the dependency after you publish a release that adds exports).

**Deployment:** Keep `"@thepuskar/use-kit"` as a normal semver range (not `file:..`). `file:..` breaks setups where the app is installed or built without the parent folder (for example a host that only checks out `docs/`). For CI and previews, build from the **repository root** with `USE_KIT_SOURCE` **unset** so `next.config.mjs` aliases imports to local `src/` — then new APIs work before they hit npm.

**New exports vs npm:** The live docs app may demonstrate APIs that are not in the latest npm tarball yet. In that case a demo may import from `../../../src/...` so Turbopack does not prefer `node_modules/@thepuskar/use-kit` over the alias. Keep the **repo root** `react` / `react-dom` versions aligned with `docs/package.json` (same major) so those imports do not load a second React copy (`ReactCurrentDispatcher` errors). After you publish a version that includes the export, you can switch the demo back to `@thepuskar/use-kit` if you want imports to mirror consumers.

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
