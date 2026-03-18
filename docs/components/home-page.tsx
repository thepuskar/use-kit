import Link from "next/link";

const entrypoints = [
  {
    title: "@thepuskar/use-kit",
    description: "Server-safe utilities and shared components.",
  },
  {
    title: "@thepuskar/use-kit/server",
    description: "Explicit server entrypoint for RSC-friendly imports.",
  },
  {
    title: "@thepuskar/use-kit/client",
    description: "Client entrypoint for hooks and browser-only helpers.",
  },
  {
    title: "@thepuskar/use-kit/hooks",
    description: "Hooks-only entrypoint for leaner client imports.",
  },
] as const;

const featureCards = [
  {
    href: "/hooks/useToggle/",
    label: "Hooks",
    title: "Hook reference",
    description: "State, effects, browser integrations, and async helpers with usage notes.",
  },
  {
    href: "/components/switch/",
    label: "Components",
    title: "Component reference",
    description: "Small UI primitives that stay explicit, headless, and easy to compose.",
  },
  {
    href: "https://www.npmjs.com/package/@thepuskar/use-kit",
    label: "Package",
    title: "npm distribution",
    description: "Published package details, versions, and install targets.",
    external: true,
  },
  {
    href: "https://github.com/thepuskar/use-kit",
    label: "Repository",
    title: "Source code",
    description: "Implementation details, issues, and contribution entry points.",
    external: true,
  },
] as const;

const gettingStarted = [
  "Install the package from npm.",
  "Choose the matching import boundary: root, server, client, or hooks.",
  "Open a hook or component page for live examples and API details.",
] as const;

const principles = [
  "Clear import boundaries for App Router and server/client splits.",
  "Short demos that show behavior instead of decorative marketing examples.",
  "Reference-first docs with practical defaults and minimal ceremony.",
] as const;

function FeatureLink({
  description,
  external = false,
  href,
  label,
  title,
}: {
  description: string;
  external?: boolean;
  href: string;
  label: string;
  title: string;
}) {
  const className =
    "group flex h-full flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-950 dark:hover:border-white/20 dark:hover:bg-slate-900";

  const content = (
    <>
      <div>
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <h3 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-slate-950 dark:text-white">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
      </div>
      <span className="text-sm font-medium text-slate-900 transition group-hover:text-slate-700 dark:text-white dark:group-hover:text-slate-200">
        Open section
      </span>
    </>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}

export function HomePage() {
  return (
    <div className="pb-10">
      <section className="mt-6">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
              Introduction
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-[-0.04em] text-slate-950 dark:text-white sm:text-5xl">
              React hooks and utility components with explicit server and client entrypoints.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-700 dark:text-slate-300">
              <code>use-kit</code> is a small reference library. The docs are organized around
              import boundaries, live examples, and direct API pages so you can move from install to
              implementation quickly.
            </p>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-950">
              <div className="flex flex-col gap-4 lg:items-start lg:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">
                    Install from npm
                  </p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Start with the package, then pick the correct import path for your runtime.
                  </p>
                </div>
                <pre className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-950 px-4 py-3 text-sm leading-6 text-slate-100 dark:border-white/10">
                  <code>npm install @thepuskar/use-kit</code>
                </pre>
              </div>
            </div>
          </div>

          <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-900/60">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
              Getting Started
            </p>
            <ol className="mt-4 space-y-4">
              {gettingStarted.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white text-xs font-semibold text-slate-700 dark:border-white/15 dark:bg-slate-950 dark:text-slate-200">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">{step}</p>
                </li>
              ))}
            </ol>

            <div className="mt-6 border-t border-slate-200 pt-5 dark:border-white/10">
              <p className="text-sm font-semibold text-slate-950 dark:text-white">
                Recommended first pages
              </p>
              <div className="mt-3 space-y-2">
                <Link
                  href="/hooks/useToggle/"
                  className="block rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition hover:border-slate-300 hover:text-slate-950 dark:border-white/10 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-white/20 dark:hover:text-white"
                >
                  <code>useToggle</code>
                </Link>
                <Link
                  href="/components/switch/"
                  className="block rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition hover:border-slate-300 hover:text-slate-950 dark:border-white/10 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-white/20 dark:hover:text-white"
                >
                  <code>Switch</code>
                </Link>
                <Link
                  href="/hooks/useClickOutside/"
                  className="block rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition hover:border-slate-300 hover:text-slate-950 dark:border-white/10 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-white/20 dark:hover:text-white"
                >
                  <code>useClickOutside</code>
                </Link>
                <Link
                  href="/hooks/useDebounce/"
                  className="block rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition hover:border-slate-300 hover:text-slate-950 dark:border-white/10 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-white/20 dark:hover:text-white"
                >
                  <code>useDebounce</code>
                </Link>
                <Link
                  href="/hooks/useCopyToClipboard/"
                  className="block rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition hover:border-slate-300 hover:text-slate-950 dark:border-white/10 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-white/20 dark:hover:text-white"
                >
                  <code>useCopyToClipboard</code>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="mt-10">
        <div className="max-w-2xl">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
            Entrypoints
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">
            Import only the part of the package your environment needs.
          </h2>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {entrypoints.map((entry) => (
            <article
              key={entry.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-950"
            >
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                Entrypoint
              </p>
              <h3 className="mt-3 text-lg font-semibold tracking-[-0.02em] text-slate-950 dark:text-white">
                {entry.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {entry.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
              Reference Map
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">
              Navigate the documentation by module instead of by marketing section.
            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {featureCards.map((card) => (
                <FeatureLink key={card.href} {...card} />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-950">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
              Documentation Notes
            </p>
            <ul className="mt-4 space-y-3">
              {principles.map((item) => (
                <li
                  key={item}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-14 rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-slate-950">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
          Start Here
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">
          Common first actions inside the docs.
        </h2>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <Link
            href="/hooks/useToggle/"
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-white/20 dark:hover:text-white"
          >
            Open the first hook page
          </Link>
          <Link
            href="/components/switch/"
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-white/20 dark:hover:text-white"
          >
            Review the component API
          </Link>
          <a
            href="https://www.npmjs.com/package/@thepuskar/use-kit"
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-white/20 dark:hover:text-white"
          >
            Check package metadata
          </a>
        </div>
      </section>
    </div>
  );
}
