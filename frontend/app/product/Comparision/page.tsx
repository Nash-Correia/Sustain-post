// app/(whatever-your-route-is)/ProductAPage.tsx
"use client";

import { useRef, useState, useEffect, useMemo, useCallback, Suspense } from "react";
import {
  getCompanyData,
  getFundData,
  CompanyDataRow,
  FundDataRow,
  PortfolioCompany,
} from "@/lib/excel-data";
import TabbedSearch from "@/components/product/comparision/TabbedSearch";
import FundsComparisonTable from "@/components/product/comparision/CustomComparisonTable";
import FundDetails from "@/components/product/comparision/details/FundDetails";
import SectorDetails from "@/components/product/comparision/details/SectorDetails";
import CompanyDetails from "@/components/product/comparision/details/CompanyDetails";
import AnalysisCard from "@/components/product/comparision/PeerAnalysisCard";

type SelectedItem =
  | { name: string; type: "Funds" | "Sectors" | "Companies" }
  | null;

/* =========================
   Helpers
========================= */

function gradeFromScore(avg: number): string {
  if (avg > 75) return "A+";
  if (avg >= 70) return "A";
  if (avg >= 65) return "B+";
  if (avg >= 60) return "B";
  if (avg >= 55) return "C+";
  if (avg >= 50) return "C";
  return "D";
}

function getNumberProp(obj: unknown, key: string): number | undefined {
  if (obj && typeof obj === "object" && key in obj) {
    const v = (obj as Record<string, unknown>)[key];
    return typeof v === "number" ? v : undefined;
  }
  return undefined;
}

function companyComposite(c: CompanyDataRow): number | null {
  const comp = getNumberProp(c, "composite");
  if (typeof comp === "number") return comp;
  return typeof c.esgScore === "number" ? c.esgScore : null;
}

function gradeTextColor(ratingRaw: string | undefined | null) {
  const r = (ratingRaw ?? "").toUpperCase().trim();
  if (!r || r === "N/A" || r === "X") return "text-gray-700";
  if (r.startsWith("A+")) return "text-rating-a-plus";
  if (r.startsWith("A")) return "text-rating-a";
  if (r.startsWith("B+")) return "text-rating-b-plus";
  if (r.startsWith("B")) return "text-rating-b";
  if (r.startsWith("C+")) return "text-rating-c-plus";
  if (r.startsWith("C")) return "text-rating-c";
  if (r.startsWith("D")) return "text-rating-d";
  return "text-gray-700";
}

/** rAF-throttled sticky detector reading the sticky header's top. */
function useHeaderSticky(headerRef: React.RefObject<HTMLElement>, offsetPx = 80) {
  const [isStuck, setIsStuck] = useState(false);
  const rafRef = useRef<number | null>(null);

  const readIsStuck = useCallback(() => {
    const el = headerRef.current;
    if (!el) return false;
    const top = el.getBoundingClientRect().top;
    return top <= offsetPx + 0.5; // top-20 ≈ 80px
  }, [headerRef, offsetPx]);

  const onScroll = useCallback(() => {
    if (rafRef.current != null) return;
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      const next = readIsStuck();
      setIsStuck((prev) => (prev !== next ? next : prev));
    });
  }, [readIsStuck]);

  useEffect(() => {
    const init = () => setIsStuck(readIsStuck());
    init();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", init);

    const id = window.setTimeout(init, 0);

    return () => {
      window.clearTimeout(id);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", init);
      if (rafRef.current != null) window.cancelAnimationFrame(rafRef.current);
    };
  }, [onScroll, readIsStuck]);

  return isStuck;
}

/** Smooth-scroll helper */
const scrollToId = (id: string) => {
  if (typeof window === "undefined") return;
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

/* =========================
   Page
========================= */

export default function ProductAPage() {
  const [allCompanyData, setAllCompanyData] = useState<CompanyDataRow[]>([]);
  const [allFundData, setAllFundData] = useState<FundDataRow[]>([]);
  const [selectedItem, setSelectedItem] = useState<SelectedItem>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [portfolioCompanies, setPortfolioCompanies] = useState<PortfolioCompany[]>([]);
  const [selectedFunds, setSelectedFunds] = useState<FundDataRow[]>([]);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [companyData, fundData] = await Promise.all([getCompanyData(), getFundData()]);
        if (!cancelled) {
          setAllCompanyData(companyData);
          setAllFundData(fundData);
        }
      } catch (e) {
        console.error("Failed to load data", e);
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : String(e);
          setLoadError(`Failed to load data. Please try again. ${msg ? ` (${msg})` : ""}`);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const { companyOptions, fundOptions, sectorOptions, companyMap, fundMap, companiesBySector } =
    useMemo(() => {
      const cMap = new Map<string, CompanyDataRow>();
      const fMap = new Map<string, FundDataRow>();
      const bySector = new Map<string, CompanyDataRow[]>();

      for (const c of allCompanyData) {
        if (c.companyName) cMap.set(c.companyName, c);
        const sec = c.sector;
        if (sec) {
          if (!bySector.has(sec)) bySector.set(sec, []);
          bySector.get(sec)!.push(c);
        }
      }
      for (const f of allFundData) {
        if (f.fundName) fMap.set(f.fundName, f);
      }

      const companies = allCompanyData.map((c) => c.companyName).filter(Boolean) as string[];
      const funds = allFundData.map((f) => f.fundName).filter(Boolean) as string[];
      const sectors = Array.from(new Set(allCompanyData.map((c) => c.sector).filter(Boolean))) as string[];

      return {
        companyOptions: companies,
        fundOptions: funds,
        sectorOptions: sectors,
        companyMap: cMap,
        fundMap: fMap,
        companiesBySector: bySector,
      };
    }, [allCompanyData, allFundData]);

  const gaugeData = useMemo(() => {
    if (!selectedItem || !selectedItem.name?.trim()) {
      return { score: 0, rating: "N/A", name: "Select an item" };
    }

    if (selectedItem.type === "Funds") {
      const fund = fundMap.get(selectedItem.name);
      return {
        score: typeof fund?.score === "number" ? fund!.score : 0,
        rating: fund?.grade ?? "N/A",
        name: fund?.fundName ?? selectedItem.name,
      };
    }

    if (selectedItem.type === "Companies") {
      const company = companyMap.get(selectedItem.name);
      const score = company ? companyComposite(company) ?? 0 : 0;
      return {
        score,
        rating: company?.grade ?? "N/A",
        name: company?.companyName ?? selectedItem.name,
      };
    }

    if (selectedItem.type === "Sectors") {
      const list = companiesBySector.get(selectedItem.name) ?? [];
      if (list.length === 0) {
        return { score: 0, rating: "N/A", name: `${selectedItem.name} (Sector)` };
      }
      const total = list.reduce((acc, c) => acc + (companyComposite(c) ?? 0), 0);
      const avg = Math.round(total / list.length);
      return {
        score: avg,
        rating: gradeFromScore(avg),
        name: `${selectedItem.name} (Sector Average)`,
      };
    }

    return { score: 0, rating: "N/A", name: selectedItem.name };
  }, [selectedItem, fundMap, companyMap, companiesBySector]);

  const handleSelection = useCallback(
    (value: string, type: "Funds" | "Companies" | "Sectors") => {
      setSelectedItem({ name: value, type });
    },
    []
  );

  const handleAddCompanyToList = useCallback((company: CompanyDataRow) => {
    const item: PortfolioCompany = {
      companyName: company.companyName,
      isin: company.isin,
      aum: 0,
      esgScore: company.esgScore,
    };
    setPortfolioCompanies((prev) =>
      prev.some((p) => p.isin === item.isin) ? prev : [...prev, item]
    );
  }, []);

  const handleRemoveCompanyFromList = useCallback((isin: string) => {
    setPortfolioCompanies((prev) => prev.filter((p) => p.isin !== isin));
  }, []);

  const handleAddFundToList = useCallback((fund: FundDataRow) => {
    setSelectedFunds((prev) =>
      prev.some((f) => f.fundName === fund.fundName) ? prev : [...prev, fund]
    );
  }, []);

  const handleRemoveFundFromList = useCallback((fundName: string) => {
    setSelectedFunds((prev) => prev.filter((f) => f.fundName !== fundName));
  }, []);

  const handleAddSectorToList = useCallback((sectorName: string) => {
    const clean = sectorName.trim();
    if (!clean) return;
    setSelectedSectors((prev) => (prev.includes(clean) ? prev : [...prev, clean]));
  }, []);

  const handleRemoveSectorFromList = useCallback((sectorName: string) => {
    setSelectedSectors((prev) => prev.filter((s) => s !== sectorName));
  }, []);

  /* ========= wrappers that add AND scroll ========= */
  const addFundAndScroll = useCallback((fund: FundDataRow) => {
    handleAddFundToList(fund);
    // allow DOM to update then scroll to compare section
    requestAnimationFrame(() => setTimeout(() => scrollToId("compare-section"), 0));
  }, [handleAddFundToList]);

  const addSectorAndScroll = useCallback((sectorName: string) => {
    handleAddSectorToList(sectorName);
    requestAnimationFrame(() => setTimeout(() => scrollToId("compare-section"), 0));
  }, [handleAddSectorToList]);

  const addCompanyAndScroll = useCallback((company: CompanyDataRow) => {
    handleAddCompanyToList(company);
    requestAnimationFrame(() => setTimeout(() => scrollToId("portfolio-section"), 0));
  }, [handleAddCompanyToList]);

  /* =========================
     Sticky Context Bar
     - Y padding reduces when sticky (more for Companies)
     - Left cluster scales; button stays pinned
  ========================= */

  const StickyContextBar = () => {
    const headerRef = useRef<HTMLElement | null>(null);
    const isStuck = useHeaderSticky(headerRef as React.RefObject<HTMLElement>, 80);
    if (!selectedItem?.name) return null;

    // defaults
    let title = selectedItem.name;
    let subtitle: string | null = null;
    let ratingText: string = "N/A";
    let compositeVal: number | null = null;
    let addBtn: React.ReactNode = null;

    const isFundAlready =
      selectedItem.type === "Funds" &&
      !!fundMap.get(selectedItem.name) &&
      selectedFunds.some((f) => f.fundName === selectedItem.name);

    const isCompanyAlready =
      selectedItem.type === "Companies" &&
      !!companyMap.get(selectedItem.name) &&
      portfolioCompanies.some((p) => p.companyName === selectedItem.name);

    const isSectorAlready =
      selectedItem.type === "Sectors" && selectedSectors.includes(selectedItem.name);

    const alreadyAdded = isFundAlready || isCompanyAlready || isSectorAlready;

    if (selectedItem.type === "Funds") {
      const fund = fundMap.get(selectedItem.name);
      if (!fund) return null;
      title = fund.fundName;
      ratingText = fund.grade || "N/A";
      compositeVal = typeof fund.score === "number" ? fund.score : null;
      addBtn = (
        <button
          onClick={() => addFundAndScroll(fund)}
          disabled={alreadyAdded}
          className={[
            "px-4 py-2 rounded-lg text-sm font-medium transition-opacity",
            alreadyAdded
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-brand-action text-white hover:opacity-90",
          ].join(" ")}
        >
          Compare
        </button>
      );
    } else if (selectedItem.type === "Companies") {
      const company = companyMap.get(selectedItem.name);
      if (!company) return null;
      title = company.companyName;
      subtitle = company.sector || null;
      ratingText = company.grade || "N/A";
      compositeVal = companyComposite(company);
      addBtn = (
        <button
          onClick={() => addCompanyAndScroll(company)}
          disabled={alreadyAdded}
          className={[
            "px-4 py-2 rounded-lg text-sm font-medium transition-opacity",
            alreadyAdded
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-brand-action text-white hover:opacity-90",
          ].join(" ")}
        >
          Add to Portfolio
        </button>
      );
    } else if (selectedItem.type === "Sectors") {
      title = `${selectedItem.name} Sector`;
      const list = companiesBySector.get(selectedItem.name) ?? [];
      if (list.length > 0) {
        const totalComposite = list.reduce((s, c) => s + (companyComposite(c) ?? 0), 0);
        const avgComposite = Math.round(totalComposite / list.length);
        compositeVal = avgComposite;
        ratingText = gradeFromScore(avgComposite);
      }
      addBtn = (
        <button
          onClick={() => addSectorAndScroll(selectedItem.name)}
          disabled={alreadyAdded}
          className={[
            "px-4 py-2 rounded-lg text-sm font-medium transition-opacity",
            alreadyAdded
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-brand-action text-white hover:opacity-90",
          ].join(" ")}
        >
          Compare
        </button>
      );
    }

    const isCompany = selectedItem.type === "Companies";
    const gradeColorCls = gradeTextColor(ratingText);

    // spacing + scale
    const containerPadding = isStuck ? "py-2" : "py-4";
    const leftScale = isStuck ? 0.86 : 1;
    const centerScale = isStuck ? 0.82 : 1;

    // unified value size; shrink when stuck
    const valueSizeCls = isStuck ? "text-4xl" : "text-5xl";

    // label placement:
    const labelAbove = !isStuck;

    const labelBase = isStuck
      ? "text-[20px] font-semibold tracking-wider text-gray-600 whitespace-nowrap leading-tight"
      : "text-[15px] font-semibold uppercase tracking-wider text-gray-600 whitespace-nowrap leading-tight";
    const labelAboveCls = `${labelBase} text-center`;
    const labelLeftCls = `${labelBase} text-left`;

    const metricCardBase = "rounded-xl border border-gray-200";
    const metricCardPad = isStuck ? "px-3 py-1.5" : "px-4 py-2.5";
    const ratingMinW = isStuck ? "min-w-[180px]" : "min-w-[200px]";
    const compositeMinW = isStuck ? "min-w-[210px]" : "min-w-[230px]";

    return (
      <section
        ref={headerRef as React.RefObject<HTMLElement>}
        role="region"
        aria-label="Context"
        className={[
          "sticky top-20 z-30 bg-white border-b border-gray-200",
          containerPadding,
          "transition-[padding] duration-150 ease-out",
        ].join(" ")}
      >
        <div className="px-6">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6">
            {/* LEFT: title/subtitle (scales) */}
            <div
              className="min-w-0 transform-gpu will-change-transform transition-transform duration-150 ease-out"
              style={{ transform: `scale(${leftScale})`, transformOrigin: "top left" }}
            >
              <h2 className="font-semibold text-brand-dark truncate text-2xl sm:text-3xl">
                {title}
              </h2>
              {subtitle && (
                <p className="mt-0.5 text-ui-text-secondary truncate text-base">
                  {subtitle}
                </p>
              )}
            </div>

            {/* CENTER: metrics (pinned center; scales) */}
            <div
              className="justify-self-center transform-gpu will-change-transform transition-transform duration-150 ease-out"
              style={{ transform: `scale(${centerScale})`, transformOrigin: "center" }}
            >
              {isCompany && (
                <div className="inline-flex items-center gap-6">
                  {/* ESG Rating */}
                  <div className={`${metricCardBase} ${metricCardPad} ${ratingMinW}`}>
                    {labelAbove ? (
                      <div className="flex flex-col items-center">
                        <div className={labelAboveCls}>ESG Rating</div>
                        <div
                          className={[
                            "leading-none font-extrabold tracking-tight text-center",
                            valueSizeCls,
                            gradeColorCls,
                          ].join(" ")}
                          title="ESG grade"
                        >
                          {ratingText || "N/A"}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-3">
                        <div className={labelLeftCls}>ESG Rating</div>
                        <div
                          className={[
                            "leading-none font-extrabold tracking-tight",
                            valueSizeCls,
                            gradeColorCls,
                          ].join(" ")}
                          title="ESG grade"
                        >
                          {ratingText || "N/A"}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Composite */}
                  <div className={`${metricCardBase} ${metricCardPad} ${compositeMinW}`}>
                    {labelAbove ? (
                      <div className="flex flex-col items-center">
                        <div className={labelAboveCls}>ESG Composite Score</div>
                        <div
                          className={[
                            "font-extrabold text-gray-900 leading-none tracking-tight text-center",
                            valueSizeCls,
                          ].join(" ")}
                          title="Composite score"
                        >
                          {typeof compositeVal === "number" ? Math.round(compositeVal) : "—"}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-3">
                        <div className={labelLeftCls}>ESG Composite Score</div>
                        <div
                          className={[
                            "font-extrabold text-gray-900 leading-none tracking-tight",
                            valueSizeCls,
                          ].join(" ")}
                          title="Composite score"
                        >
                          {typeof compositeVal === "number" ? Math.round(compositeVal) : "—"}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT: action button (unpinned scale, stays put) */}
            <div className="justify-self-end">{addBtn}</div>
          </div>
        </div>
      </section>
    );
  };

  /* =========================
     Render
  ========================= */

  const renderSelectionCard = () => {
    if (!selectedItem || !selectedItem.name?.trim()) return null;

    switch (selectedItem.type) {
      case "Funds": {
        const fund = fundMap.get(selectedItem.name);
        if (!fund) return null;
        return (
          <FundDetails
            fund={fund}
            allCompanyData={allCompanyData}
            // use wrapper that scrolls after adding
            handleAddFundToList={addFundAndScroll}
          />
        );
      }
      case "Companies": {
        const company = companyMap.get(selectedItem.name);
        if (!company) return null;
        return (
          <CompanyDetails
            company={company}
            // use wrapper that scrolls after adding
            handleAddToPortfolio={addCompanyAndScroll}
            gaugeData={gaugeData}
          />
        );
      }
      case "Sectors": {
        return (
          <SectorDetails
            sectorName={selectedItem.name}
            allCompanyData={allCompanyData}
            gaugeData={gaugeData}
            // use wrapper that scrolls after adding
            onAddSector={addSectorAndScroll}
            stickyTopOffsetPx={80}
          />
        );
      }
      default:
        return null;
    }
  };

  // ⬇️ Wrap everything in <Suspense> so any descendant using useSearchParams()
  // (e.g., TabbedSearch or others) satisfies Next.js' requirement.
  return (
    <Suspense fallback={<div />}>
      <div className="bg-brand-bg-light space-y-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          {loadError && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
              {loadError}
            </div>
          )}

          <div className="space-y-8">
            <TabbedSearch
              fundOptions={fundOptions}
              companyOptions={companyOptions}
              sectorOptions={sectorOptions}
              onSelect={handleSelection}
            />

            {selectedItem ? (
              <section className="relative">
                <StickyContextBar />

                <div className="space-y-4">
                  {/* Details card */}
                  {renderSelectionCard()}

                  {/* Analysis card */}
                  <AnalysisCard selectedItem={selectedItem} allCompanyData={allCompanyData} />

                  {/* Anchors for smooth scroll targets */}
                  {/* Compare section anchor (funds & sectors) */}
                  {(selectedItem.type === "Funds" || selectedItem.type === "Sectors") && (
                    <div id="compare-section" className="scroll-mt-35" />
                  )}
                  {/* Portfolio section anchor (companies) */}
                  {selectedItem.type === "Companies" && (
                    <div id="portfolio-section" className="scroll-mt-50" />
                  )}

                  {/* Comparison lists */}
                  {selectedItem.type === "Funds" && selectedFunds.length > 0 && (
                    <FundsComparisonTable
                      mode="funds"
                      funds={selectedFunds}
                      onRemoveFund={handleRemoveFundFromList}
                    />
                  )}

                  {selectedItem.type === "Sectors" && selectedSectors.length > 0 && (
                    <FundsComparisonTable
                      mode="sectors"
                      sectors={selectedSectors}
                      allCompanyData={allCompanyData}
                      onRemoveSector={handleRemoveSectorFromList}
                    />
                  )}

                  {selectedItem.type === "Companies" && portfolioCompanies.length > 0 && (
                    <FundsComparisonTable
                      mode="companies"
                      companies={portfolioCompanies}
                      onRemoveCompany={handleRemoveCompanyFromList}
                    />
                  )}
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </div>
    </Suspense>
  );
}
