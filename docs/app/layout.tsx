import type { Metadata } from "next";
import type { ReactNode, SVGProps } from "react";
import { Inter } from "next/font/google";
import Link from "next/link";
import { Layout, Navbar, ThemeSwitch } from "nextra-theme-docs";
import { getPageMap } from "nextra/page-map";

import { DocsSearch } from "../components/docs-search";
import { SiteLogo } from "../components/site-logo";
import "../styles/index.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

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
    <div className="hidden items-center gap-1 xl:flex">
      {externalLinks.map((link) => {
        const Icon = link.icon;

        return (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="use-kit-nav-icon-link"
            title={link.label}
          >
            <Icon className="size-5 shrink-0" />
          </a>
        );
      })}
      <ThemeSwitch className="use-kit-theme-toggle" lite />
    </div>
  );
}

function TocLinks() {
  return (
    <div className="use-kit-surface-muted p-4 text-sm">
      <p className="use-kit-muted-label">Quick links</p>
      <div className="mt-3 space-y-1">
        <a
          href="https://www.npmjs.com/package/@thepuskar/use-kit"
          target="_blank"
          rel="noreferrer"
          className="use-kit-row-link"
        >
          View on npm
        </a>
        <a
          href="https://github.com/thepuskar/use-kit"
          target="_blank"
          rel="noreferrer"
          className="use-kit-row-link"
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

function GitHubIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 1C5.925 1 1 5.925 1 12c0 4.86 3.152 8.983 7.523 10.435.55.1.748-.238.748-.53 0-.262-.01-1.13-.015-2.05-3.048.664-3.692-1.472-3.692-1.472-.498-1.268-1.218-1.605-1.218-1.605-.996-.682.075-.668.075-.668 1.103.078 1.683 1.133 1.683 1.133.98 1.682 2.573 1.196 3.202.914.1-.71.384-1.196.698-1.47-2.433-.278-4.992-1.22-4.992-5.431 0-1.2.428-2.18 1.128-2.95-.113-.28-.49-1.398.106-2.915 0 0 .92-.295 3.01 1.125.872-.243 1.81-.365 2.742-.37.93.005 1.868.127 2.742.37 2.088-1.42 3.008-1.125 3.008-1.125.598 1.517.222 2.635.11 2.915.702.77 1.126 1.75 1.126 2.95 0 4.223-2.563 5.15-5.006 5.42.395.34.747 1.01.747 2.035 0 1.47-.014 2.654-.014 3.015 0 .295.197.637.752.53C19.85 20.98 23 16.859 23 12c0-6.075-4.925-11-11-11z" />
    </svg>
  );
}

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="use-kit-footer-col">
      <p className="use-kit-footer-col-title">{title}</p>
      <ul className="use-kit-footer-col-list">{children}</ul>
    </div>
  );
}

function SiteFooter() {
  const year = new Date().getFullYear();

  /**
   * Nextra’s `<Footer>` wraps children in `display:flex` + `justify-center`, so a single grid child
   * shrinks to content width and the multi-column layout collapses. Use a plain `<footer>` instead.
   */
  return (
    <div className="use-kit-footer-outer">
      <footer className="use-kit-footer-mega">
        <div className="use-kit-footer-mega-inner">
          <div className="use-kit-footer-brand-block">
            <div className="use-kit-footer-brand-mark">
              <SiteLogo compact />
            </div>
            <div className="use-kit-footer-social" aria-label="Repository links">
              <a
                href="https://github.com/thepuskar/use-kit"
                target="_blank"
                rel="noreferrer"
                className="use-kit-footer-social-link"
                title="GitHub"
              >
                <GitHubIcon className="size-5" />
              </a>
              <a
                href="https://www.npmjs.com/package/@thepuskar/use-kit"
                target="_blank"
                rel="noreferrer"
                className="use-kit-footer-social-link"
                title="npm"
              >
                <NpmIcon className="size-5" />
              </a>
            </div>
            <p className="use-kit-footer-brand-meta">
              <a
                href="https://github.com/thepuskar/use-kit/blob/main/LICENSE"
                target="_blank"
                rel="noreferrer"
                className="use-kit-footer-brand-meta-link"
              >
                Terms & privacy
              </a>
            </p>
            <p className="use-kit-footer-copyright">© {year} Puskar Adhikari</p>
          </div>

          <FooterColumn title="Documentation">
            <li>
              <Link href="/" className="use-kit-footer-col-link">
                Introduction
              </Link>
            </li>
            <li>
              <Link href="/hooks/useToggle/" className="use-kit-footer-col-link">
                useToggle
              </Link>
            </li>
            <li>
              <Link href="/hooks/useLocalStorage/" className="use-kit-footer-col-link">
                useLocalStorage
              </Link>
            </li>
            <li>
              <Link href="/components/for/" className="use-kit-footer-col-link">
                For
              </Link>
            </li>
            <li>
              <Link href="/components/switch/" className="use-kit-footer-col-link">
                Switch / Match
              </Link>
            </li>
          </FooterColumn>

          <FooterColumn title="Repository">
            <li>
              <a
                href="https://www.npmjs.com/package/@thepuskar/use-kit"
                target="_blank"
                rel="noreferrer"
                className="use-kit-footer-col-link"
              >
                npm
              </a>
            </li>
            <li>
              <a
                href="https://github.com/thepuskar/use-kit"
                target="_blank"
                rel="noreferrer"
                className="use-kit-footer-col-link"
              >
                GitHub
              </a>
            </li>
            <li>
              <a
                href="https://github.com/thepuskar/use-kit/issues"
                target="_blank"
                rel="noreferrer"
                className="use-kit-footer-col-link"
              >
                Issues
              </a>
            </li>
          </FooterColumn>
        </div>
      </footer>
    </div>
  );
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const pageMap = await getPageMap();

  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#f7f6f3" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#202022" />
      </head>
      <body className={`use-kit-docs ${inter.className}`}>
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
            title: <span className="text-[var(--uk-text-primary)]">On this page</span>,
            extraContent: <TocLinks />,
          }}
          navbar={
            <Navbar
              logo={<SiteLogo compact />}
              projectLink="https://github.com/thepuskar/use-kit"
              className="use-kit-navbar"
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
