// components/product/RatingTable.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { authService } from "@/lib/auth";
import PDFViewer from "@/components/PDFViewer";
import LoginRequiredModal from "@/components/LoginRequiredModal";

export type RatingRow = {
  company: string;
  sector: string;
  rating: string;
  year: number;
  reportUrl?: string;
  isin?: string;
  reportFilename?: string;
};

type SortOrder = "asc" | "desc" | null;

type Props = {
  // Data (already filtered/paginated upstream if needed)
  rows: RatingRow[];

  // Filters
  companyOptions?: string[];
  filterCompanies?: string[];
  onFilterCompanies?: (values: string[]) => void;

  sectorOptions?: string[];
  filterSectors?: string[];
  onFilterSectors?: (values: string[]) => void;

  // Sorting
  sortRating?: SortOrder;
  onSortRating?: (order: SortOrder) => void;

  // Year
  filterYear: number;
  onFilterYear: (v: number) => void;
  yearOptions: number[];

  // Actions
  onRequest: (company: string) => void;
  isLoggedIn?: boolean;

  // Optional ownership/info hooks (kept for API compatibility; not used here)
  hasReport?: (company: string, year: number) => boolean;
  onShow?: (row: RatingRow) => void;

  // Display mode
  mode?: "all" | "mine";
  showTabs?: boolean;

  // Infinite scroll (optional)
  infiniteScroll?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  loadMoreRef?: React.RefObject<HTMLDivElement>;
  //loadMoreSubject: React.RefObject<HTMLDivElement>;
};

const ROW_H = "h-12";

export default function RatingTable(p: Props) {
  // --------- Null-safe fallbacks (only for used props) ----------
  const companyOptions = p.companyOptions ?? [];
  const sectorOptions = p.sectorOptions ?? [];
  const filterCompanies = p.filterCompanies ?? [];
  const filterSectors = p.filterSectors ?? [];
  const sortRating: SortOrder = p.sortRating ?? null;
  const onFilterCompanies = p.onFilterCompanies ?? (() => {});
  const onFilterSectors = p.onFilterSectors ?? (() => {});
  const onSortRating = p.onSortRating ?? (() => {});
  const isLoggedIn = Boolean(p.isLoggedIn);
  const mode = p.mode ?? "all";
  const showTabs = Boolean(p.showTabs);
  const infiniteScroll = p.infiniteScroll ?? true;
  const loadingMore = p.loadingMore ?? false;
  const hasMore = p.hasMore ?? false;
  // --------------------------------------------------------------

  // PDF Viewer state
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [selectedCompanyName, setSelectedCompanyName] = useState<string>("");

  // Login-required modal
  const [showLoginModal, setShowLoginModal] = useState(false);

  function toggleRatingSort() {
    if (sortRating === null) return onSortRating("asc");
    if (sortRating === "asc") return onSortRating("desc");
    return onSortRating(null);
  }

  function handleSecureDownload(companyName: string) {
    setSelectedCompanyName(companyName);
    setPdfViewerOpen(true);
  }

  const handlePurchaseClick = async (companyIsin: string | undefined, companyName: string): Promise<boolean> => {
    // If not logged in, show modal and abort
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return false;
    }

    // Only attempt logging when authenticated
    try {
      const token = authService.getAccessToken();
      if (!token) {
        // Token missing → treat as not logged-in
        setShowLoginModal(true);
        return false;
      }

      const resp = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/log-purchase/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${String(token)}`,
        },
        // Back-end expects company_name; keep ISIN available if later needed
        body: JSON.stringify({ company_name: companyName, ...(companyIsin ? { company_isin: companyIsin } : {}) }),
      });

      if (!resp.ok) {
        // Try to read server error for logging; still avoid throwing
        try {
          const data = (await resp.json()) as Record<string, unknown>;
          // eslint-disable-next-line no-console
          console.error("Failed to log purchase:", data);
        } catch {
          // ignore parse errors
        }
        return false;
      }

      return true;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error logging purchase:", err);
      return false;
    }
  };

  return (
    <div className="pt-0">
      <div
        className={`${
          showTabs ? "rounded-t-none border-t-0" : "rounded-t-[14px]"
        } rounded-b-[14px] border border-gray-300 bg-white shadow-sm`}
      >
        {/* ====================== FIXED TABLE HEADER ====================== */}
        <div
          className={`grid grid-cols-[2.5fr_1.5fr_1fr_1fr] items-center px-4 sm:px-6 h-14 ${
            showTabs ? "rounded-none border-t-0" : "rounded-t-[14px]"
          } border-b border-gray-200 text-[15px] font-semibold text-[#1C6C6C] bg-white z-20 relative`}
        >
          {/* Company */}
          <div className="relative">
            <MultiSelectDropdown
              label="Company"
              options={companyOptions}
              selected={filterCompanies}
              onChange={onFilterCompanies}
              placeholder="Search companies..."
            />
          </div>

          {/* Sector */}
          <div className="relative flex items-center justify-center">
            <MultiSelectDropdown
              label="ESG Sector"
              options={sectorOptions}
              selected={filterSectors}
              onChange={onFilterSectors}
              placeholder="Search sectors..."
              center
            />
          </div>

          {/* Rating */}
          <div className="relative flex items-center justify-center">
            <button
              type="button"
              onClick={toggleRatingSort}
              aria-pressed={!!sortRating}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[#195D5D] hover:bg-gray-50"
              title="Toggle rating sort"
            >
              <span>ESG Rating</span>
              {sortRating === "asc" ? (
                <SortUp className="h-4 w-4 text-gray-400" />
              ) : sortRating === "desc" ? (
                <SortDown className="h-4 w-4 text-gray-400" />
              ) : (
                <SortBoth className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>

          {/* Year */}
          <div className="relative flex items-center justify-center">
            <HeaderDropdown label={`${p.filterYear} Report`} chevron center>
              <MenuList align="right">
                {p.yearOptions.map((y) => (
                  <MenuItem key={y} selected={p.filterYear === y} onClick={() => p.onFilterYear(y)}>
                    {y} Report
                  </MenuItem>
                ))}
              </MenuList>
            </HeaderDropdown>
          </div>
        </div>

        {/* ====================== SCROLLABLE TABLE BODY ====================== */}
        <div className="max-h-[500px] overflow-y-auto">
          <ul className="divide-y divide-gray-200">
            {(p.rows ?? []).map((r, i) => {
              const reportFilename = r.reportFilename || "No file available";

              return (
                <li
                  key={`${r.company}-${i}`}
                  className={`grid min-w-0 grid-cols-[2.5fr_1.5fr_1fr_1fr] items-center px-4 sm:px-6 ${ROW_H}`}
                >
                  {/* Company */}
                  <div className="min-w-0 truncate text-[15px] text-gray-900 pr-4">{r.company}</div>

                  {/* Sector */}
                  <div className="text-center text-[14px] text-gray-600 px-2">{r.sector || "—"}</div>

                  {/* Rating */}
                  <div className="text-center text-[14px] font-extrabold text-gray-900">{r.rating}</div>

                  {/* Action */}
                  <div className="text-center">
                    {mode === "mine" ? (
                      reportFilename && reportFilename !== "No file available" ? (
                        <button
                          className="text-[14px] font-medium text-[#195D5D] hover:underline"
                          onClick={() => handleSecureDownload(r.company)}
                        >
                          View
                        </button>
                      ) : (
                        <span className="text-[14px] text-gray-400">No Report</span>
                      )
                    ) : (
                      <button
                        className={`text-[14px] font-medium ${
                          isLoggedIn ? "text-[#1D7AEA] hover:underline" : "text-gray-400"
                        } ${!isLoggedIn ? "cursor-not-allowed" : ""}`}
                        onClick={async () => {
                          const ok = await handlePurchaseClick(r.isin, r.company);
                          if (ok) {
                            p.onRequest(r.company);
                          }
                          // If not ok and not logged in, modal is already shown inside handlePurchaseClick.
                        }}
                      >
                        Purchase
                      </button>
                    )}
                  </div>
                </li>
              );
            })}

            {/* Empty state */}
            {(!p.rows || p.rows.length === 0) && (
              <li className="px-4 py-4 text-center text-gray-500">No records found.</li>
            )}
          </ul>

          {/* Infinite scroll status / sentinel */}
          {infiniteScroll && (
            <div ref={p.loadMoreRef} className="h-10 py-3 text-center">
              {loadingMore && <p className="text-gray-600 text-sm">Loading…</p>}
              {!loadingMore && !hasMore && (p.rows?.length ?? 0) > 0 && (
                <p className="text-gray-500 text-sm">— End of list —</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* PDF Viewer Modal */}
      <PDFViewer
        isOpen={pdfViewerOpen}
        onClose={() => setPdfViewerOpen(false)}
        companyName={selectedCompanyName}
        title={`${selectedCompanyName} ESG Report`}
      />

      {/* Login Required Modal (shown when clicking Purchase while not logged in) */}
      <LoginRequiredModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
}

/* ====================== MULTI-SELECT DROPDOWN ====================== */

function MultiSelectDropdown({
  label,
  options,
  selected,
  onChange,
  placeholder = "Search...",
  center = false,
}: {
  label: string;
  options?: string[];
  selected?: string[];
  onChange?: (values: string[]) => void;
  placeholder?: string;
  center?: boolean;
}) {
  const safeOptions = React.useMemo(() => options ?? [], [options]);
  const safeSelected = React.useMemo(() => selected ?? [], [selected]);
  const emitChange = onChange ?? (() => {});

  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filtered = useMemo(() => {
    if (!q.trim()) return safeOptions;
    const nq = q.toLowerCase();
    return safeOptions.filter((o) => o.toLowerCase().includes(nq));
  }, [safeOptions, q]);

  const allSelected = safeSelected.length === safeOptions.length && safeOptions.length > 0;

  function toggleOne(value: string) {
    if (safeSelected.includes(value)) {
      emitChange(safeSelected.filter((v) => v !== value));
    } else {
      emitChange([...safeSelected, value]);
    }
  }
  function selectAll() {
    emitChange([...safeOptions]);
  }
  function clearAll() {
    emitChange([]);
  }

  return (
    <div ref={ref} className="inline-flex items-center gap-2 relative">
      <button
        className="inline-flex items-center gap-2 text-[#195D5D]"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        type="button"
      >
        <span>{label}</span>
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </button>

      {/* DROPDOWN */}
      <div
        className={[
          "absolute top-full z-50 mt-2 min-w-[280px] rounded-xl border border-gray-200 bg-white shadow-xl",
          center ? "left-1/2 -translate-x-1/2" : "left-0",
          open ? "block" : "hidden",
        ].join(" ")}
        role="menu"
      >
        <div className="p-3 border-b border-gray-100">
          <div className="flex items-center gap-2 rounded-md border border-gray-200 px-2">
            <SearchIcon className="h-4 w-4 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={placeholder}
              className="h-8 w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
            {q && (
              <button
                type="button"
                className="text-xs text-gray-500 hover:text-gray-700"
                onClick={() => setQ("")}
              >
                Clear
              </button>
            )}
          </div>

          <div className="mt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={allSelected ? clearAll : selectAll}
              className="text-xs font-medium text-[#195D5D] hover:underline"
            >
              {allSelected ? "Clear all" : "Select all"}
            </button>
            {safeSelected.length > 0 && !allSelected && (
              <button type="button" onClick={clearAll} className="text-xs text-gray-500 hover:underline">
                Reset
              </button>
            )}
          </div>
        </div>

        <div className="max-h-64 overflow-auto py-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-2 text-sm text-gray-500">No matches</div>
          ) : (
            filtered.map((opt) => {
              const isChecked = safeSelected.includes(opt);
              return (
                <label key={opt} className="flex cursor-pointer items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-[#195D5D] focus:ring-[#195D5D]"
                    checked={isChecked}
                    onChange={() => toggleOne(opt)}
                  />
                  <span className={isChecked ? "font-medium text-gray-900" : "text-gray-700"}>{opt}</span>
                </label>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-3 py-2">
          <button type="button" className="rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50" onClick={() => setOpen(false)}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ====================== SIMPLE DROPDOWN (YEAR) ====================== */

function HeaderDropdown({
  label,
  children,
  chevron = false,
  center = false,
}: {
  label: string;
  children: React.ReactNode;
  chevron?: boolean;
  center?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={ref} className="inline-flex items-center gap-1 relative">
      <button
        className="inline-flex items-center gap-2 text-[#195D5D]"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        type="button"
      >
        <span>{label}</span>
        {chevron && <ChevronDown className="h-4 w-4 text-gray-400" />}
      </button>

      <div
        className={[
          "absolute top-full z-50 mt-2 min-w-[240px] rounded-xl border border-gray-200 bg-white shadow-xl",
          center ? "left-1/2 -translate-x-1/2" : "left-0",
          open ? "block" : "hidden",
        ].join(" ")}
        role="menu"
      >
        {children}
      </div>
    </div>
  );
}

function MenuList({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return <div className={["py-2", align === "right" ? "text-right" : ""].join(" ")}>{children}</div>;
}

function MenuItem({
  children,
  onClick,
  selected = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  selected?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      role="menuitem"
      className={["block w-full px-4 py-2 text-left text-[14px]", selected ? "bg-gray-100 font-medium text-gray-900" : "text-gray-700 hover:bg-gray-50"].join(" ")}
    >
      {children}
    </button>
  );
}

/* ====================== ICONS ====================== */

function ChevronDown(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
function SortBoth(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M8 18V6m0 0l-3 3m3-3l3 3" />
      <path d="M16 6v12m0 0l-3-3m3 3l3-3" />
    </svg>
  );
}
function SortUp(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M8 18V6m0 0l-3 3m3-3l3 3" />
    </svg>
  );
}
function SortDown(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M16 6v12m0 0l-3-3m3 3l3-3" />
    </svg>
  );
}
function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3-3" />
    </svg>
  );
}
