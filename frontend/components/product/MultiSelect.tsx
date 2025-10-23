// components/product/MultiSelect.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
  /** Optional Reset button in header (e.g., to default to a single company) */
  onReset?: () => void;
  resetLabel?: string;
  /** Inline label above the trigger (optional) */
  label?: string;
};

export default function MultiSelect({
  options = [],
  selected = [],
  onChange,
  placeholder = "Search...",
  className = "",
  onReset,
  resetLabel = "Reset",
  label,
}: Props) {
  // ---- State / refs
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [popStyle, setPopStyle] = useState<{
    left: number;
    top: number;
    width: number;
    maxHeight: number;
  }>({ left: 0, top: 0, width: 320, maxHeight: 280 });

  // ---- Close on outside click
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // ---- Recalculate popover placement on open/resize/scroll
  useEffect(() => {
    function update() {
      const t = triggerRef.current;
      if (!t) return;
      const r = t.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const margin = 8;
      const width = Math.max(280, Math.min(420, Math.floor(r.width)));
      const left = Math.min(Math.max(margin, r.left), vw - width - margin);
      // Prefer below; if not enough room, place above
      const spaceBelow = vh - r.bottom - margin;
      const spaceAbove = r.top - margin;
      const want = 340; // desired max height
      const maxHeight =
        spaceBelow >= 200
          ? Math.min(want, Math.max(200, spaceBelow))
          : Math.min(want, Math.max(200, spaceAbove));

      const top = spaceBelow >= 200 ? r.bottom + window.scrollY : r.top + window.scrollY - maxHeight;

      setPopStyle({
        left: Math.round(left + window.scrollX),
        top: Math.round(top),
        width,
        maxHeight,
      });
    }

    if (open) {
      update();
      const ro = new ResizeObserver(update);
      ro.observe(document.documentElement);
      window.addEventListener("scroll", update, true);
      window.addEventListener("resize", update, true);
      return () => {
        ro.disconnect();
        window.removeEventListener("scroll", update, true);
        window.removeEventListener("resize", update, true);
      };
    }
  }, [open]);

  // ---- Search + selected pinned to top (like ReportsTable)
const safeOptions = useMemo(() => options ?? [], [options]);
const safeSelected = useMemo(() => selected ?? [], [selected]);
const selSet = useMemo(() => new Set(safeSelected), [safeSelected]);

  const filtered = useMemo(() => {
    if (!q.trim()) return [...safeOptions];
    const nq = q.toLowerCase();
    return safeOptions.filter((o) => o.toLowerCase().includes(nq));
  }, [safeOptions, q]);

  const { topSelected, bottomUnselected } = useMemo(() => {
    const sel = filtered.filter((o) => selSet.has(o)).sort((a, b) => a.localeCompare(b));
    const rest = filtered.filter((o) => !selSet.has(o)).sort((a, b) => a.localeCompare(b));
    return { topSelected: sel, bottomUnselected: rest };
  }, [filtered, selSet]);

  const allSelected = safeSelected.length > 0 && safeSelected.length === safeOptions.length;

  // ---- Actions
  function toggleOne(value: string) {
    if (selSet.has(value)) {
      onChange(safeSelected.filter((v) => v !== value));
    } else {
      onChange([...safeSelected, value]);
    }
  }
  function selectAll() {
    onChange([...safeOptions]);
  }
  function clearAll() {
    onChange([]);
  }

  return (
    <div ref={wrapRef} className={`w-full ${className}`}>
      {label && <label className="mb-1 block text-[13px] font-medium text-gray-700">{label}</label>}

      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-left text-[14px] text-gray-900 hover:bg-gray-50 focus:outline-none"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 truncate">
            {safeSelected.length === 0 ? (
              <span className="text-gray-400">Select companies</span>
            ) : safeSelected.length === 1 ? (
              <span>{safeSelected[0]}</span>
            ) : (
              <span>{safeSelected.length} selected</span>
            )}
          </div>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
      </button>

      {/* Popover (fixed & clamped to viewport) */}
      {open && (
        <div
          className="fixed z-[200]"
          role="dialog"
          aria-label="Company multi-select"
          style={{
            left: popStyle.left,
            top: popStyle.top,
            width: popStyle.width,
          }}
        >
          <div
            className="min-w-[280px] rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden"
            style={{ maxHeight: popStyle.maxHeight }}
          >
            {/* Search + bulk actions */}
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
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={allSelected ? clearAll : selectAll}
                    className="text-xs font-medium text-[#195D5D] hover:underline"
                  >
                    {allSelected ? "Clear all" : "Select all"}
                  </button>
                  {/* {safeSelected.length > 0 && !allSelected && (
                    <button
                      type="button"
                      onClick={clearAll}
                      className="text-xs text-gray-500 hover:underline"
                    >
                      Reset
                    </button>
                  )} */}
                  {onReset && (
                    <button
                      type="button"
                      onClick={onReset}
                      className="text-xs text-gray-500 hover:underline"
                    >
                      {resetLabel}
                    </button>
                  )}
                </div>

                {safeSelected.length > 0 && (
                  <span className="text-xs text-gray-500">{safeSelected.length} selected</span>
                )}
              </div>
            </div>

            {/* Options: selected group on top, then others (scrollable) */}
            <div
              className="overflow-auto py-2"
              style={{
                // keep the search area visible: subtract ~80px from container max height
                maxHeight: Math.max(140, popStyle.maxHeight - 80),
              }}
            >
              {topSelected.length === 0 && bottomUnselected.length === 0 ? (
                <div className="px-4 py-2 text-sm text-gray-500">No matches</div>
              ) : (
                <>
                  {topSelected.length > 0 && (
                    <>
                      <div className="px-4 pb-1 pt-1 text-[11px] uppercase tracking-wide text-gray-400">
                        Selected ({topSelected.length})
                      </div>
                      {topSelected.map((opt) => (
                        <label
                          key={`sel-${opt}`}
                          className="flex cursor-pointer items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-[#195D5D] focus:ring-[#195D5D]"
                            checked
                            onChange={() => toggleOne(opt)}
                          />
                          <span className="font-medium text-gray-900">{opt}</span>
                        </label>
                      ))}
                      {bottomUnselected.length > 0 && (
                        <div className="px-4 pt-3 pb-1 text-[11px] uppercase tracking-wide text-gray-400">
                          Others
                        </div>
                      )}
                    </>
                  )}

                  {bottomUnselected.map((opt) => (
                    <label
                      key={`unsel-${opt}`}
                      className="flex cursor-pointer items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-[#195D5D] focus:ring-[#195D5D]"
                        checked={false}
                        onChange={() => toggleOne(opt)}
                      />
                      <span className="text-gray-700">{opt}</span>
                    </label>
                  ))}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-3 py-2">
              <button
                type="button"
                className="rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Tiny inline icons (same look as in ReportsTable) */
function ChevronDown(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M6 9l6 6 6-6" />
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
