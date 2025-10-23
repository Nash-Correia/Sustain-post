// components/ui/InfoTooltip.tsx
"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  MutableRefObject,
} from "react";
import { createPortal } from "react-dom";
import { tooltipData } from "@/lib/tooltipData";

type Align = "left" | "center" | "right";

type InfoTooltipProps = {
  id: keyof typeof tooltipData;
  mode?: "click" | "hover";
  align?: Align;
  panelWidthClass?: string; // e.g., "w-80"
  className?: string;
  titleOverride?: string;
};

const InfoIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <circle cx="12" cy="8" r="0.5" fill="currentColor" />
  </svg>
);

/* ------------------ utilities ------------------ */

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !("matchMedia" in window)) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(!!mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);
  return reduced;
}

type FloatingPosOpts = {
  align: Align;
  gap?: number;
  preferAbove?: boolean;
};

/** Positions a floating panel using position: fixed in a portal (won’t affect container/table layout). */
function useFloatingPosition(
  anchorRef: MutableRefObject<HTMLElement | null>,
  panelRef: MutableRefObject<HTMLElement | null>,
  open: boolean,
  { align, gap = 8, preferAbove = false }: FloatingPosOpts
) {
  const [style, setStyle] = useState<React.CSSProperties>({ visibility: "hidden" });

  const compute = useCallback(() => {
    const anchorEl = anchorRef.current;
    const panelEl = panelRef.current;
    if (!anchorEl || !panelEl) return;

    const ar = anchorEl.getBoundingClientRect();
    const pr = panelEl.getBoundingClientRect();

    const topBelow = Math.round(ar.bottom + gap);
    const topAbove = Math.round(ar.top - pr.height - gap);

    let top = preferAbove
      ? (topAbove >= 0 ? topAbove : topBelow)
      : (topBelow + pr.height <= window.innerHeight ? topBelow : Math.max(0, topAbove));

    let left: number;
    if (align === "center") {
      left = Math.round(ar.left + ar.width / 2 - pr.width / 2);
    } else if (align === "right") {
      left = Math.round(ar.right - pr.width);
    } else {
      left = Math.round(ar.left);
    }

    const margin = 8;
    left = Math.max(margin, Math.min(left, window.innerWidth - pr.width - margin));
    top = Math.max(margin, Math.min(top, window.innerHeight - pr.height - margin));

    setStyle({
      position: "fixed",
      top,
      left,
      zIndex: 1000,
      visibility: "visible",
    });
  }, [align, gap, preferAbove]);

  useEffect(() => {
    if (!open) return;
    compute();
    const id = requestAnimationFrame(compute);
    return () => cancelAnimationFrame(id);
  }, [open, compute]);

  useEffect(() => {
    if (!open) return;
    const onScroll = () => compute();
    const onResize = () => compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [open, compute]);

  return style;
}

/* ------------------ main wrapper ------------------ */

export function InfoTooltip({
  id,
  mode = "hover",
  align = "left",
  panelWidthClass = "w-80",
  className,
  titleOverride,
}: InfoTooltipProps) {
  const info = tooltipData[id];

  // If no info found, just render a static icon (no navigation)
  if (!info) {
    return (
<span
  className={`ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-gray-700 ${className ?? ""}`}
  aria-label={titleOverride ?? (id as string)}
  role="img"
>
  <InfoIcon />
</span>
    );
  }

  const title = titleOverride ?? info.title;
  const desc = info.description;

  return mode === "click" ? (
    <ClickPopover
      title={title}
      desc={desc}
      align={align}
      panelWidthClass={panelWidthClass}
      className={className}
    />
  ) : (
    <HoverTooltip
      id={id as string}
      title={title}
      desc={desc}
      align={align}
      panelWidthClass={panelWidthClass}
      className={className}
    />
  );
}

/* ------------------ Hover Tooltip (portal + fixed; NO redirect) ------------------ */

function HoverTooltip({
  id,
  title,
  desc,
  align,
  panelWidthClass,
  className,
}: {
  id: string;
  title: string;
  desc: string;
  align: Align;
  panelWidthClass: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const wrapRef = useRef<HTMLSpanElement | null>(null);
const triggerRef = useRef<HTMLButtonElement | null>(null);
const panelRef = useRef<HTMLDivElement | null>(null);
  const panelId = React.useId();
  const closeTimer = useRef<number | null>(null);

  const style = useFloatingPosition(triggerRef, panelRef, open, {

    align,
    gap: 8,
    preferAbove: false, // show below when possible
  });

  const transitionCls = useMemo(
    () => (reducedMotion ? "" : "transition-all duration-150 ease-out"),
    [reducedMotion]
  );

  const clearCloseTimer = () => {
    if (closeTimer.current != null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const scheduleClose = () => {
    clearCloseTimer();
    closeTimer.current = window.setTimeout(() => setOpen(false), 120);
  };

  useEffect(() => () => clearCloseTimer(), []);

  useEffect(() => {
    if (!open) return;
    const onScroll = () => setOpen(false);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open]);

  return (
    <>
      <span
        ref={wrapRef}
        className={`relative inline-flex ${className ?? ""}`}
        onMouseEnter={() => {
          clearCloseTimer();
          setOpen(true);
        }}
        onMouseLeave={scheduleClose}
        onFocus={() => {
          clearCloseTimer();
          setOpen(true);
        }}
        onBlur={scheduleClose}
      >
        {/* Button that ONLY shows tooltip; no navigation */}
<button
  ref={triggerRef}
  type="button"
  aria-describedby={panelId}
  aria-label={title}
  className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-gray-700 hover:bg-amber-500/20 focus:outline-none"
>
  <InfoIcon />
  <span className="sr-only">More info about {id}</span>
</button>
      </span>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={panelRef}
            id={panelId}
            role="tooltip"
            className={`
              ${panelWidthClass}
              rounded-lg bg-white p-3 text-sm shadow-md ring-1 ring-black/10
              ${transitionCls} will-change-transform
            `}
            style={style}
            onMouseEnter={clearCloseTimer}
            onMouseLeave={scheduleClose}
          >
            <h4 className="font-semibold text-gray-900 text-left">{title}</h4>
            <p className="mt-1 text-gray-600 text-left leading-relaxed">{desc}</p>
          </div>,
          document.body
        )}
    </>
  );
}

/* ------------------ Click Popover (portal + fixed, non-modal; NO redirect) ------------------ */

function ClickPopover({
  title,
  desc,
  align,
  panelWidthClass,
  className,
}: {
  title: string;
  desc: string;
  align: Align;
  panelWidthClass: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
const triggerRef = useRef<HTMLButtonElement | null>(null);
const panelRef = useRef<HTMLDivElement | null>(null);
  const panelId = React.useId();

const style = useFloatingPosition(triggerRef, panelRef, open, {
  align,
  gap: 8,
  preferAbove: false,
});


  useEffect(() => {
    if (!open) return;

    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t)) return;
      if (triggerRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onScroll = () => setOpen(false);

    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
    };
  }, [open]);

  const transitionCls = useMemo(
    () => (reducedMotion ? "" : "transition-all duration-150 ease-out"),
    [reducedMotion]
  );

  return (
    <>
<button
  ref={triggerRef}
  type="button"
  aria-haspopup="dialog"
  aria-expanded={open}
  aria-controls={panelId}
  aria-label={title}
  onClick={() => setOpen((v) => !v)}
  onKeyDown={(e) => { /* … */ }}
  className={`ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-gray-700 hover:bg-gray-50 focus:outline-none ${className ?? ""}`}
>
  <InfoIcon />
  <span className="sr-only">Show info</span>
</button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-modal="false"
            aria-labelledby={`${panelId}-title`}
            className={`
              ${panelWidthClass}
              rounded-xl border border-gray-200 bg-white p-4 shadow-xl
              ${transitionCls} will-change-transform
            `}
            style={style}
          >
            <h4
              id={`${panelId}-title`}
              className="text-sm text-left font-semibold text-gray-900 opacity-80"
            >
              {title}
            </h4>
            <p className="mt-1 text-sm text-left text-gray-600 opacity-60">
              {desc}
            </p>
          </div>,
          document.body
        )}
    </>
  );
}
