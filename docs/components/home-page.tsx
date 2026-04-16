import Link from "next/link";

const EXPORTS: { path: string; note: string }[] = [
  { path: "react-rsc-kit", note: "Default entry - shared utilities and control-flow primitives." },
  { path: "react-rsc-kit/server", note: "Server-safe entry for RSC-friendly imports." },
  { path: "react-rsc-kit/client", note: "Client entry for hooks and browser-only helpers." },
  {
    path: "react-rsc-kit/hooks",
    note: "Hooks-only barrel when you want a narrower client import.",
  },
];

const PACKAGE_SUMMARY = [
  { label: "Hooks", value: "14" },
  { label: "UI primitives", value: "3" },
  { label: "Entry points", value: "4" },
  { label: "React support", value: "18+" },
] as const;

const QUICK_ACTIONS = [
  {
    label: "Read docs",
    href: "#package-exports",
    internal: true,
  },
  {
    label: "View on npm",
    href: "https://www.npmjs.com/package/react-rsc-kit",
    internal: false,
  },
  {
    label: "Star repository",
    href: "https://github.com/thepuskar/react-rsc-kit",
    internal: false,
  },
] as const;

const DESIGN_GOALS = [
  {
    title: "Runtime-aware imports",
    description:
      "Server-safe exports stay separate from browser-only hooks so App Router projects can keep import boundaries explicit.",
  },
  {
    title: "Typed public surface",
    description:
      "The package ships typed exports, practical docs, and examples that map directly to the published API consumers install.",
  },
  {
    title: "Focused utility layer",
    description:
      "react-rsc-kit is intentionally small: reusable hooks plus a few control-flow primitives, not a full component system.",
  },
] as const;

const RUNTIME_RULES = [
  {
    title: "Use the root package for shared primitives",
    description:
      "Import runtime-safe helpers and control-flow components from `react-rsc-kit` when they do not depend on browser APIs.",
  },
  {
    title: "Use `/client` for hooks and browser APIs",
    description:
      "Clipboard, storage, intersection observers, effects, and navigator-based helpers belong in a client component boundary.",
  },
  {
    title: "Prefer the narrowest entrypoint",
    description:
      "Use `/server`, `/client`, or `/hooks` when they describe your runtime more precisely than the default package import.",
  },
] as const;

export function HomePage() {
  return (
    <div className="react-rsc-kit-doc-home mx-auto max-w-3xl pb-16 pt-2">
      <header className="border-b border-[var(--uk-border-subtle)] pb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--uk-text-primary)]">
          Introduction
        </h1>
        <p className="mt-3 text-base leading-relaxed text-[var(--uk-text-muted)]">
          <code className="rounded bg-[rgba(55,53,47,0.06)] px-1.5 py-0.5 text-[0.9em] dark:bg-[rgba(255,255,255,0.08)]">
            react-rsc-kit
          </code>{" "}
          is a typed React utility package built around explicit server and client entrypoints,
          small control-flow primitives, and browser hooks that stay easy to reason about in modern
          App Router codebases.
        </p>
      </header>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-[var(--uk-text-primary)]">Installation</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--uk-text-muted)]">
          Install the package, then import from the path that matches your runtime. The{" "}
          <Link href="#package-exports" className="react-rsc-kit-doc-inline-link">
            package exports
          </Link>{" "}
          table below is the main contract to follow.
        </p>
        <pre className="react-rsc-kit-code-snippet mt-3">
          <code>npm install react-rsc-kit</code>
        </pre>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {QUICK_ACTIONS.map((action) =>
            action.internal ? (
              <Link key={action.label} href={action.href} className="react-rsc-kit-pill-row">
                {action.label}
              </Link>
            ) : (
              <a
                key={action.label}
                href={action.href}
                target="_blank"
                rel="noreferrer"
                className="react-rsc-kit-pill-row"
              >
                {action.label}
              </a>
            ),
          )}
        </div>
      </section>

      <section className="mt-12" aria-label="Package summary">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PACKAGE_SUMMARY.map((item) => (
            <div key={item.label} className="react-rsc-kit-panel px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--uk-text-muted)]">
                {item.label}
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--uk-text-primary)]">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="package-exports" className="mt-10 scroll-mt-20">
        <h2 className="text-lg font-semibold text-[var(--uk-text-primary)]">Package exports</h2>
        <p className="mt-2 text-sm text-[var(--uk-text-muted)]">
          Use the narrowest entrypoint you can so bundlers and React runtime boundaries only pull in
          what the current module actually needs.
        </p>
        <div className="react-rsc-kit-doc-table-wrap mt-4 overflow-x-auto rounded-lg border border-[var(--uk-border-subtle)]">
          <table className="react-rsc-kit-doc-table w-full min-w-[32rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--uk-border-subtle)] bg-[rgba(55,53,47,0.04)] dark:bg-[rgba(255,255,255,0.04)]">
                <th className="px-3 py-2 font-semibold text-[var(--uk-text-primary)]">
                  Import path
                </th>
                <th className="px-3 py-2 font-semibold text-[var(--uk-text-primary)]">Purpose</th>
              </tr>
            </thead>
            <tbody>
              {EXPORTS.map((row) => (
                <tr
                  key={row.path}
                  className="border-b border-[var(--uk-border-subtle)] last:border-b-0"
                >
                  <td className="px-3 py-2.5 align-top">
                    <code className="text-[0.85em] text-[var(--uk-text-primary)]">{row.path}</code>
                  </td>
                  <td className="px-3 py-2.5 text-[var(--uk-text-muted)]">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold text-[var(--uk-text-primary)]">
          What this package optimizes for
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--uk-text-muted)]">
          The package is designed to feel reliable in production codebases: small API surface,
          explicit import rules, and primitives that fit naturally into React 18+ applications.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {DESIGN_GOALS.map((goal) => (
            <div key={goal.title} className="react-rsc-kit-panel px-4 py-4">
              <h3 className="text-sm font-semibold text-[var(--uk-text-primary)]">{goal.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--uk-text-muted)]">
                {goal.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold text-[var(--uk-text-primary)]">Runtime rules</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--uk-text-muted)]">
          These are the import boundaries to keep in mind when using the package in server-rendered
          and client-rendered React applications.
        </p>
        <div className="mt-4 space-y-3">
          {RUNTIME_RULES.map((rule, index) => (
            <div
              key={rule.title}
              className="react-rsc-kit-surface-muted flex gap-3 px-4 py-4 text-sm"
            >
              <span className="react-rsc-kit-step-index">{index + 1}</span>
              <div>
                <h3 className="font-semibold text-[var(--uk-text-primary)]">{rule.title}</h3>
                <p className="mt-1 leading-6 text-[var(--uk-text-muted)]">{rule.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
