import Link from "next/link";

const HOOK_PAGES = [
  "useIntersectionObserver",
  "useToggle",
  "useTimeout",
  "useGeolocation",
  "useDebounce",
  "useThrottle",
  "useArray",
  "useLocalStorage",
  "useSessionStorage",
  "useFetch",
  "useMutation",
  "useOnScreen",
  "useClickOutside",
  "useCopyToClipboard",
] as const;

const COMPONENT_PAGES = [
  { href: "/components/for/" as const, label: "For" },
  { href: "/components/switch/" as const, label: "Switch / Match" },
] as const;

const EXPORTS: { path: string; note: string }[] = [
  { path: "@thepuskar/use-kit", note: "Default entry — shared utilities and components." },
  { path: "@thepuskar/use-kit/server", note: "Server-only / RSC-friendly imports." },
  { path: "@thepuskar/use-kit/client", note: "Client components, hooks, and browser helpers." },
  { path: "@thepuskar/use-kit/hooks", note: "Hooks-only barrel for smaller client bundles." },
];

export function HomePage() {
  return (
    <div className="use-kit-doc-home mx-auto max-w-3xl pb-16 pt-2">
      <header className="border-b border-[var(--uk-border-subtle)] pb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--uk-text-primary)]">
          Introduction
        </h1>
        <p className="mt-3 text-base leading-relaxed text-[var(--uk-text-muted)]">
          <code className="rounded bg-[rgba(55,53,47,0.06)] px-1.5 py-0.5 text-[0.9em] dark:bg-[rgba(255,255,255,0.08)]">
            @thepuskar/use-kit
          </code>{" "}
          documents React hooks and small UI primitives with explicit server and client entrypoints,
          live examples on each API page, and TypeScript-friendly usage notes.
        </p>
      </header>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-[var(--uk-text-primary)]">Installation</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--uk-text-muted)]">
          Add the package, then import from the path that matches your runtime (see{" "}
          <Link href="#package-exports" className="use-kit-doc-inline-link">
            Package exports
          </Link>
          ).
        </p>
        <pre className="use-kit-code-snippet mt-3">
          <code>npm install @thepuskar/use-kit</code>
        </pre>
      </section>

      <section id="package-exports" className="mt-10 scroll-mt-20">
        <h2 className="text-lg font-semibold text-[var(--uk-text-primary)]">Package exports</h2>
        <p className="mt-2 text-sm text-[var(--uk-text-muted)]">
          Use the narrowest entrypoint you can so bundlers and the App Router only pull what you
          need.
        </p>
        <div className="use-kit-doc-table-wrap mt-4 overflow-x-auto rounded-lg border border-[var(--uk-border-subtle)]">
          <table className="use-kit-doc-table w-full min-w-[32rem] border-collapse text-left text-sm">
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

      <section className="mt-12" aria-label="Hooks and components">
        <div className="grid gap-10 sm:grid-cols-2">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--uk-text-muted)]">
              Hooks
            </h3>
            <ul className="mt-2 divide-y divide-[var(--uk-border-subtle)] border-y border-[var(--uk-border-subtle)]">
              {HOOK_PAGES.map((name) => (
                <li key={name}>
                  <Link href={`/hooks/${name}/`} className="use-kit-doc-nav-link">
                    <code>{name}</code>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--uk-text-muted)]">
              Components
            </h3>
            <ul className="mt-2 divide-y divide-[var(--uk-border-subtle)] border-y border-[var(--uk-border-subtle)]">
              {COMPONENT_PAGES.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="use-kit-doc-nav-link">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="mt-8 text-xs font-semibold uppercase tracking-wide text-[var(--uk-text-muted)]">
              Elsewhere
            </h3>
            <ul className="mt-2 space-y-1 text-sm text-[var(--uk-text-muted)]">
              <li>
                <a
                  href="https://www.npmjs.com/package/@thepuskar/use-kit"
                  target="_blank"
                  rel="noreferrer"
                  className="use-kit-doc-inline-link"
                >
                  npm package
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/thepuskar/use-kit"
                  target="_blank"
                  rel="noreferrer"
                  className="use-kit-doc-inline-link"
                >
                  GitHub repository
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
