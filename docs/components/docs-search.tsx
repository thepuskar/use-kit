"use client";

import Link from "next/link";
import { addBasePath } from "next/dist/client/add-base-path";
import { useDeferredValue, useEffect, useRef, useState } from "react";

type SearchEntry = {
  route: string;
  title: string;
  description: string;
  headings: string[];
  text: string;
};

const EMPTY_RESULTS = [] as SearchEntry[];
const MAX_RESULTS = 6;
const INPUTS = new Set(["INPUT", "SELECT", "BUTTON", "TEXTAREA"]);

function scoreEntry(entry: SearchEntry, terms: string[]) {
  const title = entry.title.toLowerCase();
  const description = entry.description.toLowerCase();
  const headings = entry.headings.join(" ").toLowerCase();
  const text = entry.text.toLowerCase();
  let score = 0;

  for (const term of terms) {
    if (!text.includes(term)) {
      return -1;
    }

    if (title === term) {
      score += 120;
    } else if (title.startsWith(term)) {
      score += 80;
    } else if (title.includes(term)) {
      score += 48;
    }

    if (description.includes(term)) {
      score += 24;
    }

    if (headings.includes(term)) {
      score += 18;
    }

    score += Math.max(0, 12 - text.indexOf(term) / 40);
  }

  return score;
}

export function DocsSearch() {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [entries, setEntries] = useState<SearchEntry[]>(EMPTY_RESULTS);
  const [results, setResults] = useState<SearchEntry[]>(EMPTY_RESULTS);
  const [isOpen, setIsOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadIndex() {
      const response = await fetch(addBasePath("/search-index.json"));

      if (!response.ok) {
        throw new Error(`Failed to load search index: ${response.status}`);
      }

      const data = (await response.json()) as SearchEntry[];

      if (!cancelled) {
        setEntries(data);
        setIsReady(true);
      }
    }

    loadIndex().catch(() => {
      if (!cancelled) {
        setEntries(EMPTY_RESULTS);
        setIsReady(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const normalized = deferredQuery.trim().toLowerCase();

    if (!normalized) {
      setResults(EMPTY_RESULTS);
      return;
    }

    const terms = normalized.split(/\s+/).filter(Boolean);

    const nextResults = [...entries]
      .map((entry) => ({ entry, score: scoreEntry(entry, terms) }))
      .filter((item) => item.score >= 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, MAX_RESULTS)
      .map((item) => item.entry);

    setResults(nextResults);
  }, [deferredQuery, entries]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const activeElement = document.activeElement as HTMLElement | null;

      if (
        activeElement &&
        (INPUTS.has(activeElement.tagName) || activeElement.isContentEditable) &&
        activeElement !== inputRef.current
      ) {
        return;
      }

      if (
        event.key === "/" ||
        (event.key === "k" &&
          !event.shiftKey &&
          (navigator.userAgent.includes("Mac") ? event.metaKey : event.ctrlKey))
      ) {
        event.preventDefault();
        inputRef.current?.focus({ preventScroll: true });
        setIsOpen(true);
      }

      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  const trimmedQuery = deferredQuery.trim();
  const hasResults = results.length > 0;
  const showEmptyState = isReady && trimmedQuery && !hasResults;

  return (
    <div ref={containerRef} className="react-rsc-kit-search">
      <div className="react-rsc-kit-search-shell">
        <svg
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
          className="react-rsc-kit-search-icon"
        >
          <path
            d="M14.375 14.375L17.5 17.5M16.25 9.16667C16.25 13.0797 13.0797 16.25 9.16667 16.25C5.25365 16.25 2.08334 13.0797 2.08334 9.16667C2.08334 5.25365 5.25365 2.08334 9.16667 2.08334C13.0797 2.08334 16.25 5.25365 16.25 9.16667Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(event) => setQuery(event.currentTarget.value)}
          placeholder={isReady ? "Search docs..." : "Loading search..."}
          className="react-rsc-kit-search-input"
          aria-label="Search documentation"
        />
        <kbd className="react-rsc-kit-search-shortcut">Cmd/Ctrl K</kbd>
      </div>

      {isOpen && trimmedQuery ? (
        <div className="react-rsc-kit-search-results">
          {hasResults
            ? results.map((result) => (
                <Link
                  key={result.route}
                  href={result.route}
                  className="react-rsc-kit-search-result"
                  onClick={() => {
                    setIsOpen(false);
                    setQuery("");
                  }}
                >
                  <span className="react-rsc-kit-search-result-title">{result.title}</span>
                  {result.description ? (
                    <span className="react-rsc-kit-search-result-description">
                      {result.description}
                    </span>
                  ) : null}
                  <span className="react-rsc-kit-search-result-route">{result.route}</span>
                </Link>
              ))
            : null}

          {showEmptyState ? (
            <p className="react-rsc-kit-search-empty">No matching docs pages.</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
