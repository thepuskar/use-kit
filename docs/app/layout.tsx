import type { Metadata } from "next";
import type { ReactNode, SVGProps } from "react";
import { Head } from "nextra/components";
import { Footer, Layout, Navbar, ThemeSwitch } from "nextra-theme-docs";
import { getPageMap } from "nextra/page-map";

import { DocsSearch } from "../components/docs-search";
import { SiteLogo } from "../components/site-logo";
import "../styles/index.css";

function NpmIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden="true" {...props}>
      <path d="M1.5 4.5H16.5V13.5H9.12V6.72H5.28V13.5H1.5V4.5Z" fill="currentColor" />
    </svg>
  );
}

function WebsiteIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden="true" {...props}>
      <path
        d="M9 15C12.3137 15 15 12.3137 15 9C15 5.68629 12.3137 3 9 3M9 15C5.68629 15 3 12.3137 3 9C3 5.68629 5.68629 3 9 3M9 15C10.5008 13.3571 11.3539 11.2256 11.4 9C11.3539 6.77435 10.5008 4.64291 9 3M9 15C7.49919 13.3571 6.64608 11.2256 6.6 9C6.64608 6.77435 7.49919 4.64291 9 3M3.6 6.75H14.4M3.6 11.25H14.4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IssuesIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden="true" {...props}>
      <path
        d="M9 15C12.3137 15 15 12.3137 15 9C15 5.68629 12.3137 3 9 3C5.68629 3 3 5.68629 3 9C3 12.3137 5.68629 15 9 15Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M9 5.85V9.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="9" cy="11.85" r="0.75" fill="currentColor" />
    </svg>
  );
}

const externalLinks = [
  {
    href: "https://www.npmjs.com/package/@thepuskar/use-kit",
    label: "npm",
    icon: NpmIcon,
  },
  {
    href: "https://www.puskaradhikari.com.np/",
    label: "website",
    icon: WebsiteIcon,
  },
  {
    href: "https://github.com/thepuskar/use-kit/issues",
    label: "issues",
    icon: IssuesIcon,
  },
] as const;

export const metadata: Metadata = {
  title: {
    default: "@thepuskar/use-kit",
    template: "%s | @thepuskar/use-kit",
  },
  description:
    "Reusable React hooks and utility components with clear server and client entrypoints, live demos, and practical examples.",
  applicationName: "@thepuskar/use-kit",
  authors: [
    {
      name: "Puskar Adhikari",
      url: "https://www.puskaradhikari.com.np/",
    },
  ],
  icons: {
    icon: "/assets/logo.svg",
    shortcut: "/assets/logo.svg",
  },
  keywords: ["react hooks", "use-kit", "nextra", "next.js", "typescript", "utility components"],
};

function ResourcePills() {
  return (
    <div className="hidden items-center gap-2 xl:flex">
      {externalLinks.map((link) => {
        const Icon = link.icon;

        return (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 dark:border-white/10 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-white/20 dark:hover:bg-slate-900 dark:hover:text-white"
            title={link.label}
          >
            <Icon className="size-5 shrink-0" />
            {/* <span>{link.label}</span> */}
          </a>
        );
      })}
      <ThemeSwitch className="use-kit-theme-toggle" lite />
    </div>
  );
}

function TocLinks() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
        Quick Links
      </p>
      <div className="mt-3 space-y-2">
        <a
          href="https://www.npmjs.com/package/@thepuskar/use-kit"
          target="_blank"
          rel="noreferrer"
          className="block rounded-xl border border-slate-200 bg-white px-3 py-2 font-medium transition hover:border-slate-300 hover:text-slate-950 dark:border-white/10 dark:bg-slate-950 dark:hover:border-white/20 dark:hover:text-white"
        >
          View on npm
        </a>
        <a
          href="https://github.com/thepuskar/use-kit"
          target="_blank"
          rel="noreferrer"
          className="block rounded-xl border border-slate-200 bg-white px-3 py-2 font-medium transition hover:border-slate-300 hover:text-slate-950 dark:border-white/10 dark:bg-slate-950 dark:hover:border-white/20 dark:hover:text-white"
        >
          Browse the repo
        </a>
        {/* <a
          href="https://www.puskaradhikari.com.np/"
          target="_blank"
          rel="noreferrer"
          className="block rounded-xl border border-slate-200 bg-white px-3 py-2 font-medium transition hover:border-slate-300 hover:text-slate-950 dark:border-white/10 dark:bg-slate-950 dark:hover:border-white/20 dark:hover:text-white"
        >
          Visit Puskar&apos;s website
        </a> */}
      </div>
    </div>
  );
}

function SiteFooter() {
  return (
    <Footer className="w-full py-12 text-slate-700 dark:text-slate-300">
      <div className="flex w-full flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <SiteLogo />
        </div>

        <div className="flex flex-wrap gap-3 text-sm font-medium">
          <a href="/hooks/useToggle/" className="use-kit-footer-link">
            Hooks
          </a>
          <a href="/components/switch/" className="use-kit-footer-link">
            Components
          </a>
          <a
            href="https://www.npmjs.com/package/@thepuskar/use-kit"
            target="_blank"
            rel="noreferrer"
            className="use-kit-footer-link"
          >
            npm
          </a>
          <a
            href="https://github.com/thepuskar/use-kit"
            target="_blank"
            rel="noreferrer"
            className="use-kit-footer-link"
          >
            GitHub
          </a>
          <a
            href="https://www.puskaradhikari.com.np/"
            target="_blank"
            rel="noreferrer"
            className="use-kit-footer-link"
          >
            Website
          </a>
        </div>
      </div>
    </Footer>
  );
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const pageMap = await getPageMap();

  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head
        color={{
          hue: 215,
          saturation: 18,
          lightness: {
            light: 38,
            dark: 86,
          },
        }}
        backgroundColor={{
          light: "#f8fafc",
          dark: "#0a1020",
        }}
      />
      <body className="use-kit-docs">
        <Layout
          pageMap={pageMap}
          docsRepositoryBase="https://github.com/thepuskar/use-kit/tree/main/docs"
          search={<DocsSearch />}
          editLink={<span>Edit this page on GitHub</span>}
          feedback={{
            content: "Report a docs issue",
            labels: "documentation",
          }}
          sidebar={{
            autoCollapse: false,
            // defaultMenuCollapseLevel: 1,
            toggleButton: true,
          }}
          toc={{
            title: <span className="dark:text-slate-200">On this page</span>,
            extraContent: <TocLinks />,
          }}
          navbar={
            <Navbar
              logo={<SiteLogo compact />}
              projectLink="https://github.com/thepuskar/use-kit"
              className="border-b border-slate-200 bg-[rgba(248,250,252,0.92)] backdrop-blur dark:border-white/10 dark:bg-[rgba(10,16,32,0.88)]"
            >
              <ResourcePills />
            </Navbar>
          }
          footer={<SiteFooter />}
          copyPageButton={false}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
