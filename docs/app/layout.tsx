import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Head } from "nextra/components";
import { Footer, Layout, Navbar } from "nextra-theme-docs";
import { getPageMap } from "nextra/page-map";

import { SiteLogo } from "../components/site-logo";
import "../styles/index.css";

const externalLinks = [
  {
    href: "https://www.npmjs.com/package/@thepuskar/use-kit",
    label: "npm",
  },
  {
    href: "https://www.puskaradhikari.com.np/",
    label: "website",
  },
  {
    href: "https://github.com/thepuskar/use-kit/issues",
    label: "issues",
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
      {externalLinks.map((link) => (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 dark:border-white/10 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-white/20 dark:hover:bg-slate-900 dark:hover:text-white"
        >
          {link.label}
        </a>
      ))}
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
