# Contributing

Thanks for contributing to `react-rsc-kit`.

## Development Setup

1. Fork and clone the repository.
2. Use Node.js `20` (see `.nvmrc`).
3. Install dependencies:

```bash
npm install
```

## Branching

- Create feature branches from `main`.
- Keep PRs focused and small.
- Rebase on top of latest `main` before opening/reviewing.

## Commit Convention

This repository uses **Conventional Commits**.

Examples:

- `feat(hooks): add usePrevious hook`
- `fix(switch): handle function children typing`
- `docs(readme): update client entrypoint examples`

## Run Checks Locally

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
```

## Pull Request Checklist

- [ ] Tests added/updated for behavior changes
- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes
- [ ] `npm run test` passes
- [ ] `npm run build` passes
- [ ] Docs/README updated when API changes

## Release Notes

When changing public API or behavior, include a short changelog-style note in the PR description.
