"use client";
import React, { FormEvent, useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getCompanyData, getFundData, type CompanyDataRow, type FundDataRow } from "@/lib/excel-data";
import { ROUTES } from "@/lib/constants";



type CSSVars = React.CSSProperties & { ["--tw-ring-color"]?: string };

/* ================= Icons ================= */
const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
       fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ClearIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
       fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const LoadingSpinner = () => (
  <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

/* ============== Types ============== */
type TabType = "Companies" | "Funds" | "Sectors";
type Group = "Companies" | "Funds" | "Sectors" | "Popular" | "Keywords";
type Suggestion = { label: string; group: Group };

type SearchHeroProps = {
  /** If provided, we will switch your TabbedSearch and pre-select instead of navigating. */
  onPick?: (type: TabType, value: string) => void;
};

type SearchData = {
  companies: string[];
  sectors: string[];
  funds: string[];
};

/* ============== Routing helper ============== */
function buildRouteForSelection(term: string, data: SearchData, groupHint?: Group) {
  const q = term.trim();
  if (!q) return "/";

  const lc = q.toLowerCase();
  
  // Static pages
  if (lc.includes("report")) return ROUTES.productB;
  if (lc.includes("methodology")) return ROUTES.methodology;
  if (lc.includes("compare")) return ROUTES.productA;

  // Check if it matches any entity
  const isCompany = data.companies.some((c) => c.toLowerCase() === lc);
  const isFund = data.funds.some((f) => f.toLowerCase() === lc);
  const isSector = data.sectors.some((s) => s.toLowerCase() === lc || `${s} sector`.toLowerCase() === lc);

  // Build URL with q and type params for TabbedSearch to pick up
  if (groupHint === "Companies" && isCompany) {
    return `${ROUTES.productA}?q=${encodeURIComponent(term)}&type=Companies`;
  }
  if (groupHint === "Funds" && isFund) {
    return `${ROUTES.productA}?q=${encodeURIComponent(term)}&type=Funds`;
  }
  if (groupHint === "Sectors" && isSector) {
    const normalized = term.replace(/ sector$/i, "");
    return `${ROUTES.productA}?q=${encodeURIComponent(normalized)}&type=Sectors`;
  }

  // Infer type if no hint provided
  if (isCompany) {
    return `${ROUTES.productA}?q=${encodeURIComponent(term)}&type=Companies`;
  }
  if (isFund) {
    return `${ROUTES.productA}?q=${encodeURIComponent(term)}&type=Funds`;
  }
  if (isSector) {
    const normalized = term.replace(/ sector$/i, "");
    return `${ROUTES.productA}?q=${encodeURIComponent(normalized)}&type=Sectors`;
  }

  // fallback keeps the free-text query (TabbedSearch will infer)
  return `${ROUTES.productA}?q=${encodeURIComponent(q)}`;
}

/* ============== Fair merge utility ============== */
function roundRobinMerge(lists: { group: Group; items: string[] }[], cap = 20): Suggestion[] {
  const queues = lists.map(({ group, items }) => ({ group, items: [...items] }));
  const out: Suggestion[] = [];
  let gi = 0;
  while (out.length < cap && queues.some((q) => q.items.length)) {
    const qlen = queues.length;
    for (let step = 0; step < qlen && out.length < cap; step++) {
      const idx = (gi + step) % qlen;
      const bucket = queues[idx];
      if (bucket.items.length) {
        out.push({ label: bucket.items.shift()!, group: bucket.group });
      }
    }
    gi++;
  }
  return out;
}

/* ============== Suggestion builder ============== */
function buildSuggestions(query: string, data: SearchData): Suggestion[] {
  const v = query.trim().toLowerCase();

  // Empty state: only Popular
  if (!v) {
    return ["Reports", "Methodology", "Compare"].map((label) => ({
      label,
      group: "Popular" as const,
    }));
  }

  // When typing: search all three
  const startsWith = (s: string) => s.toLowerCase().startsWith(v);
  const includes = (s: string) => s.toLowerCase().includes(v);

  const rankAndFilter = (arr: string[]) => [
    ...arr.filter(startsWith),
    ...arr.filter((s) => !startsWith(s) && includes(s)),
  ];

  const comp = rankAndFilter(data.companies);
  const funds = rankAndFilter(data.funds);
  const sect = rankAndFilter(data.sectors);
  const keywords = ["Reports", "Methodology", "Compare"].filter(includes);

  // Round-robin merge to ensure visibility across groups, then append keyword hits
  const merged = roundRobinMerge(
    [
      { group: "Companies" as const, items: comp },
      { group: "Funds" as const, items: funds },
      { group: "Sectors" as const, items: sect },
    ],
    18 // leave a little room for keywords
  );

  const kw = keywords.map((label) => ({ label, group: "Keywords" as const }));
  return [...merged, ...kw].slice(0, 20);
}

/* ================= Component ================= */
export default function SearchHero({ onPick }: SearchHeroProps) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [error, setError] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Load excel data on client
  const [loading, setLoading] = useState(true);
  const [companyRows, setCompanyRows] = useState<CompanyDataRow[]>([]);
  const [fundRows, setFundRows] = useState<FundDataRow[]>([]);

  // ================= Data Loading with Error Boundary =================
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [companies, funds] = await Promise.all([getCompanyData(), getFundData()]);
        if (!cancelled) {
          setCompanyRows(companies || []);
          setFundRows(funds || []);
        }
      } catch (e) {
        console.error("Search: excel load error", e);
        if (!cancelled) {
          setError("Failed to load search data. Please refresh the page.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ================= Debounced Query =================
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQ(q);
    }, 150); // 150ms debounce for suggestions

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [q]);

  // ================= Normalize datasets =================
  const data = useMemo<SearchData>(() => {
    const companies = Array.from(
      new Set(companyRows.map((r) => r.companyName).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));
    const sectors = Array.from(
      new Set(companyRows.map((r) => r.sector).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));
    const funds = Array.from(
      new Set(fundRows.map((r) => r.fundName).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));
    return { companies, sectors, funds };
  }, [companyRows, fundRows]);

  // ================= Build suggestions (memoized with debounced query) =================
  const suggestions: Suggestion[] = useMemo(() => {
    return buildSuggestions(debouncedQ, data);
  }, [debouncedQ, data]);

  // Reset selection on input/focus change
  useEffect(() => setActiveIndex(-1), [q, isFocused]);

  // ================= Handlers =================
  const clearSearch = useCallback(() => {
    setQ("");
    setActiveIndex(-1);
    inputRef.current?.focus();
  }, []);

  const handleSelection = useCallback(
    (label: string, groupHint?: Group) => {
      const term = label.trim();
      if (!term) return;

      const lc = term.toLowerCase();

      // Exact matches
      const isCompany = data.companies.some((c) => c.toLowerCase() === lc);
      const isFund = data.funds.some((f) => f.toLowerCase() === lc);
      const isSector = data.sectors.some(
        (s) => s.toLowerCase() === lc || `${s} sector`.toLowerCase() === lc
      );

      // If group is known (clicked from a grouped result) and matches a dataset, prefer that
      if (onPick && groupHint === "Companies" && isCompany) {
        return onPick("Companies", term);
      }
      if (onPick && groupHint === "Funds" && isFund) {
        return onPick("Funds", term);
      }
      if (onPick && groupHint === "Sectors" && isSector) {
        // normalize "X sector" to "X"
        const normalized = term.replace(/ sector$/i, "");
        return onPick("Sectors", normalized);
      }

      // If group is Popular/Keywords or no group, try dataset inference
      if (onPick) {
        if (isCompany) return onPick("Companies", term);
        if (isFund) return onPick("Funds", term);
        if (isSector) {
          const normalized = term.replace(/ sector$/i, "");
          return onPick("Sectors", normalized);
        }
      }

      // Otherwise fall back to routing
      const url = buildRouteForSelection(term, data);
      return router.push(url);
    },
    [data, onPick, router]
  );

  const onSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        const s = suggestions[activeIndex];
        handleSelection(s.label, s.group);
        return;
      }
      handleSelection(q);
    },
    [activeIndex, suggestions, handleSelection, q]
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isFocused) return;
      const max = suggestions.length - 1;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => {
          const nextIndex = Math.min(max, i + 1);
          // Scroll into view on next tick
          requestAnimationFrame(() => {
            const el = listRef.current?.querySelector<HTMLButtonElement>(
              `[data-index="${nextIndex}"]`
            );
            el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
          });
          return nextIndex;
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => {
          const prevIndex = Math.max(0, i - 1);
          requestAnimationFrame(() => {
            const el = listRef.current?.querySelector<HTMLButtonElement>(
              `[data-index="${prevIndex}"]`
            );
            el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
          });
          return prevIndex;
        });
      } else if (e.key === "Enter") {
        if (activeIndex >= 0 && suggestions[activeIndex]) {
          e.preventDefault();
          const s = suggestions[activeIndex];
          handleSelection(s.label, s.group);
        }
      } else if (e.key === "Escape") {
        setActiveIndex(-1);
        setIsFocused(false);
        inputRef.current?.blur();
      }
    },
    [isFocused, suggestions, activeIndex, handleSelection]
  );

  // ================= Grouped rendering =================
  const grouped = useMemo(() => {
    const groups: Record<Group, { index: number; s: Suggestion }[]> = {
      Companies: [],
      Funds: [],
      Sectors: [],
      Popular: [],
      Keywords: [],
    };
    suggestions.forEach((s, index) => {
      groups[s.group].push({ index, s });
    });
    return groups;
  }, [suggestions]);

  // ================= Error Boundary UI =================
  if (error) {
    return (
      <section aria-label="Site search" className="relative z-[39] pt-8 pb-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-xl border-2 border-red-200 bg-red-50 p-6 text-center">
              <p className="text-sm font-medium text-red-800">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 text-sm text-red-600 hover:text-red-800 underline"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Site search" className="relative z-[39] pt-8 pb-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <form onSubmit={onSubmit} className="mx-auto max-w-3xl" onKeyDown={onKeyDown}>
          <div className="relative">
            {/* Input shell */}
            <div
              className={`relative flex items-center overflow-hidden rounded-xl border-2 bg-white shadow-sm transition-all duration-200 ${
                isFocused ? "shadow-lg ring-1 ring-opacity-20" : "border-gray-200 hover:border-gray-300"
              }`}
              style={
                isFocused
                  ? ({
                      borderColor: "var(--color-login-btn)",
                      "--tw-ring-color": "var(--color-login-btn)",
                    } as CSSVars)
                  : undefined
              }
            >
              <div className="pl-4 pr-3">
                {loading ? (
                  <LoadingSpinner />
                ) : (
                  <SearchIcon className="text-gray-400 h-5 w-5" />
                )}
              </div>

              <input
                ref={inputRef}
                type="text"
                placeholder={loading ? "Loading data…" : "Search company, fund, sector, report…"}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 120)}
                className="flex-1 py-4 pr-4 text-base placeholder-gray-500 border-0 focus:outline-none focus:ring-0 bg-transparent"
                autoComplete="off"
                spellCheck="false"
                role="combobox"
                aria-autocomplete="list"
                aria-haspopup="listbox"
                aria-expanded={isFocused}
                aria-controls="search-suggestions"
                disabled={loading}
              />

              {q && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="mr-2 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Clear search"
                >
                  <ClearIcon className="text-gray-400 hover:text-gray-600" />
                </button>
              )}

              <button
                type="submit"
                disabled={!q.trim() || loading}
                className={`m-1.5 inline-flex items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold shadow-sm transition-all duration-200 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  q.trim() && !loading ? "cursor-pointer hover:opacity-90" : "opacity-50 cursor-not-allowed"
                }`}
              style={
                q.trim() && !loading
                  ? ({
                      backgroundColor: "var(--color-login-btn)",
                      "--tw-ring-color": "var(--color-login-btn)",
                    } as CSSVars)
                  : ({ backgroundColor: "#f3f4f6", color: "#9ca3af" } as React.CSSProperties)
              }
              >
                <SearchIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>

            {/* Suggestions dropdown */}
            {isFocused && !loading && (
              <div
                id="search-suggestions"
                className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-[60]"
                onMouseDownCapture={(e) => e.preventDefault()}
                onPointerDownCapture={(e) => e.preventDefault()}
                role="listbox"
                aria-label="Search suggestions"
              >
                {suggestions.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500">
                    {debouncedQ !== q ? (
                      <span className="flex items-center gap-2">
                        <LoadingSpinner />
                        Searching...
                      </span>
                    ) : (
                      "No matches."
                    )}
                  </div>
                ) : (
                  <div ref={listRef} className="max-h-72 overflow-auto py-2">
                    {(["Popular", "Companies", "Funds", "Sectors", "Keywords"] as Group[]).map((group) =>
                      grouped[group].length ? (
                        <div key={group}>
                          <div className="px-3 pt-2 pb-1 text-[11px] uppercase tracking-wide text-gray-400">
                            {group}
                          </div>
                          {grouped[group].map(({ index, s }) => {
                            const active = index === activeIndex;
                            return (
                              <button
                                key={`${group}-${s.label}-${index}`}
                                type="button"
                                data-index={index}
                                onMouseEnter={() => setActiveIndex(index)}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  setIsFocused(false);
                                  handleSelection(s.label, s.group);
                                }}
                                onClick={() => {
                                  setIsFocused(false);
                                  handleSelection(s.label, s.group);
                                }}
                                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                                  active ? "bg-gray-50" : "hover:bg-gray-50"
                                }`}
                                role="option"
                                aria-selected={active}
                              >
                                <SearchIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                <span className="truncate">{s.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      ) : null
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </form>

        {/* Optional: Data stats for debugging */}
        {!loading && process.env.NODE_ENV === "development" && (
          <div className="mx-auto max-w-3xl mt-2 text-xs text-gray-400 text-center">
            {data.companies.length} companies · {data.funds.length} funds · {data.sectors.length} sectors loaded
          </div>
        )}
      </div>
    </section>
  );
}