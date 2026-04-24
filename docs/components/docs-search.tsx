"use client";

import { ArrowRight, CornerDownLeft, Loader2, Search } from "lucide-react";
import Link from "next/link";
import { addBasePath } from "next/dist/client/add-base-path";
import { useRouter } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";

type SearchEntry = {
  route: string;
  title: string;
  description: string;
  headings: string[];
  text: string;
};

const EMPTY_RESULTS = [] as SearchEntry[];
const MAX_RESULTS = 8;
const DEFAULT_RESULTS_PER_GROUP = 5;
const INPUTS = new Set(["INPUT", "SELECT", "BUTTON", "TEXTAREA"]);
const GROUP_ORDER = ["Pages", "Hooks", "Components"] as const;

type SearchGroupLabel = (typeof GROUP_ORDER)[number];

interface SearchGroup {
  label: SearchGroupLabel;
  entries: SearchEntry[];
}

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

function getGroupLabel(entry: SearchEntry): SearchGroupLabel {
  if (entry.route.startsWith("/hooks/")) {
    return "Hooks";
  }

  if (entry.route.startsWith("/components/")) {
    return "Components";
  }

  return "Pages";
}

function groupEntries(entries: SearchEntry[]): SearchGroup[] {
  return GROUP_ORDER.map((label) => ({
    label,
    entries: entries.filter((entry) => getGroupLabel(entry) === label),
  })).filter((group) => group.entries.length > 0);
}

export function DocsSearch() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [entries, setEntries] = useState<SearchEntry[]>(EMPTY_RESULTS);
  const [results, setResults] = useState<SearchEntry[]>(EMPTY_RESULTS);
  const [isOpen, setIsOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

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
        !containerRef.current?.contains(activeElement)
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
    if (!isOpen) {
      return;
    }

    const focusTimeout = window.setTimeout(() => {
      inputRef.current?.focus({ preventScroll: true });
    }, 0);

    return () => {
      window.clearTimeout(focusTimeout);
    };
  }, [isOpen]);

  const trimmedQuery = deferredQuery.trim();
  const hasQuery = trimmedQuery.length > 0;
  const defaultEntries = useMemo(() => {
    const groupedEntries = groupEntries(entries);

    return groupedEntries.flatMap((group) => group.entries.slice(0, DEFAULT_RESULTS_PER_GROUP));
  }, [entries]);
  const visibleEntries = hasQuery ? results : defaultEntries;
  const groupedResults = useMemo(() => groupEntries(visibleEntries), [visibleEntries]);
  const selectableEntries = useMemo(
    () => groupedResults.flatMap((group) => group.entries),
    [groupedResults],
  );
  const hasResults = selectableEntries.length > 0;
  const showEmptyState = isReady && hasQuery && !hasResults;

  useEffect(() => {
    setActiveIndex(0);
  }, [trimmedQuery]);

  useEffect(() => {
    setActiveIndex((currentIndex) =>
      selectableEntries.length === 0 ? 0 : Math.min(currentIndex, selectableEntries.length - 1),
    );
  }, [selectableEntries.length]);

  const closeSearch = () => {
    setIsOpen(false);
  };

  const openSearch = () => {
    setIsOpen(true);
  };

  const goToEntry = (entry: SearchEntry) => {
    closeSearch();
    setQuery("");
    router.push(entry.route);
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((currentIndex) =>
        selectableEntries.length === 0 ? 0 : (currentIndex + 1) % selectableEntries.length,
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((currentIndex) =>
        selectableEntries.length === 0
          ? 0
          : (currentIndex - 1 + selectableEntries.length) % selectableEntries.length,
      );
      return;
    }

    if (event.key === "Enter") {
      const activeEntry = selectableEntries[activeIndex];

      if (activeEntry) {
        event.preventDefault();
        goToEntry(activeEntry);
      }

      return;
    }

    if (event.key === "Escape") {
      closeSearch();
    }
  };

  return (
    <div ref={containerRef} className="react-rsc-kit-search">
      <button
        type="button"
        className="react-rsc-kit-search-trigger"
        onClick={openSearch}
        aria-label="Search documentation"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <Search className="react-rsc-kit-search-trigger-icon" aria-hidden="true" />
        <span className="react-rsc-kit-search-trigger-label">
          {isReady ? "Search documentation..." : "Loading search..."}
        </span>
        <kbd className="react-rsc-kit-search-shortcut">Cmd/Ctrl K</kbd>
      </button>

      {isOpen ? (
        <div
          className="react-rsc-kit-search-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeSearch();
            }
          }}
        >
          <div className="react-rsc-kit-search-dialog" role="dialog" aria-modal="true">
            <div className="react-rsc-kit-search-input-shell">
              <Search className="react-rsc-kit-search-icon" aria-hidden="true" />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.currentTarget.value)}
                onKeyDown={handleInputKeyDown}
                placeholder={isReady ? "Search documentation..." : "Loading search..."}
                className="react-rsc-kit-search-input focus-visible:ring-0! focus-visible:ring-offset-0! focus-visible:outline-none!"
                aria-label="Search documentation"
              />
              {!isReady ? (
                <Loader2 className="react-rsc-kit-search-loading" aria-hidden="true" />
              ) : null}
            </div>

            <div className="react-rsc-kit-search-results" role="listbox">
              {hasResults
                ? groupedResults.map((group) => (
                    <div key={group.label} className="react-rsc-kit-search-group">
                      <p className="react-rsc-kit-search-group-label">{group.label}</p>
                      <div className="react-rsc-kit-search-group-items">
                        {group.entries.map((result) => {
                          const resultIndex = selectableEntries.findIndex(
                            (entry) => entry.route === result.route,
                          );
                          const isActive = resultIndex === activeIndex;

                          return (
                            <Link
                              key={result.route}
                              href={result.route}
                              role="option"
                              aria-selected={isActive}
                              data-active={isActive ? "true" : undefined}
                              className="react-rsc-kit-search-result"
                              onMouseEnter={() => setActiveIndex(resultIndex)}
                              onClick={() => {
                                closeSearch();
                                setQuery("");
                              }}
                            >
                              <ArrowRight
                                className="react-rsc-kit-search-result-icon"
                                aria-hidden="true"
                              />
                              <span className="react-rsc-kit-search-result-title">
                                {result.title}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))
                : null}

              {showEmptyState ? (
                <p className="react-rsc-kit-search-empty">No matching docs pages.</p>
              ) : null}
            </div>

            <div className="react-rsc-kit-search-footer">
              <kbd className="react-rsc-kit-search-footer-key">
                <CornerDownLeft aria-hidden="true" />
              </kbd>
              <span>Go to Page</span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
