// components/product/FundsComparisonTable.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  getCompanyData,
  type FundDataRow,
  type PortfolioCompany,
  type CompanyDataRow,
} from "@/lib/excel-data";
import { formatNumber } from "../productUtils";
import GreenRatingGauge from "../GreenRatingGauge";

type CompanyModeProps = {
  mode: "companies";
  companies: (PortfolioCompany & { sector?: string })[] | PortfolioCompany[];
  onRemoveCompany: (isin: string) => void;
  gaugePosition?: "top" | "bottom"; // kept for backward-compat
  sectorLookupByIsin?: Record<string, string>;
  sectorLookupByCompany?: Record<string, string>;
  allCompanyData?: CompanyDataRow[];
};

type FundModeProps = {
  mode: "funds";
  funds: FundDataRow[];
  onRemoveFund: (fundName: string) => void;
  gaugePosition?: "top" | "bottom"; // kept for backward-compat
};

type SectorModeProps = {
  mode: "sectors";
  sectors: string[];
  allCompanyData: CompanyDataRow[];
  onRemoveSector: (sectorName: string) => void;
  gaugePosition?: "top" | "bottom"; // kept for backward-compat
};

type ComparisonProps = CompanyModeProps | FundModeProps | SectorModeProps;

function computeGrade(score: number): string {
  if (score > 75) return "A+";
  if (score >= 70) return "A";
  if (score >= 65) return "B+";
  if (score >= 60) return "B";
  if (score >= 55) return "C+";
  if (score >= 50) return "C";
  return "D";
}

function parsePercent(pct: string | number | undefined): number {
  if (pct === undefined || pct === null) return 0;
  if (typeof pct === "number") return pct;
  const raw = String(pct).trim();
  if (raw.endsWith("%")) {
    const n = parseFloat(raw.replace("%", "").trim());
    return isNaN(n) ? 0 : n; // "5%" -> 5
  }
  const n = parseFloat(raw);
  if (isNaN(n)) return 0;
  return n <= 1 ? n * 100 : n; // treat <=1 as fraction
}

export default function FundsComparisonTable(props: ComparisonProps) {
  const isFunds = props.mode === "funds";
  const isCompanies = props.mode === "companies";
  const isSectors = props.mode === "sectors";

  // ---- Optional lazy load of company dataset to resolve sectors (companies mode) ----
  const [lazyCompanyData, setLazyCompanyData] = useState<CompanyDataRow[] | null>(null);
  useEffect(() => {
    if (!isCompanies) return;
    const { allCompanyData, sectorLookupByIsin, sectorLookupByCompany } = props as CompanyModeProps;

    const needFetch =
      !allCompanyData && !sectorLookupByIsin && !sectorLookupByCompany && !lazyCompanyData;
    if (!needFetch) return;

    let cancelled = false;
    (async () => {
      try {
        const rows = await getCompanyData();
        if (!cancelled) setLazyCompanyData(rows);
      } catch {
        // ignore; we'll fallback to "—"
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isCompanies, props, lazyCompanyData]);

  // Build effective sector maps (prefer explicit props, then allCompanyData, then lazy fetch)
  const effectiveSectorByIsin = useMemo(() => {
    const map: Record<string, string> = {};
    if (isCompanies) {
      const { sectorLookupByIsin, allCompanyData } = props as CompanyModeProps;
      if (allCompanyData) {
        for (const r of allCompanyData) {
          const isin = (r.isin || "").trim();
          if (isin && r.sector) map[isin] = r.sector;
        }
      } else if (lazyCompanyData) {
        for (const r of lazyCompanyData) {
          const isin = (r.isin || "").trim();
          if (isin && r.sector) map[isin] = r.sector;
        }
      }
      if (sectorLookupByIsin) Object.assign(map, sectorLookupByIsin);
    }
    return map;
  }, [isCompanies, props, lazyCompanyData]);

  const effectiveSectorByName = useMemo(() => {
    const map: Record<string, string> = {};
    if (isCompanies) {
      const { sectorLookupByCompany, allCompanyData } = props as CompanyModeProps;
      const src = allCompanyData ?? lazyCompanyData ?? [];
      for (const r of src) {
        const key = (r.companyName || "").trim().toLowerCase();
        if (key && r.sector) map[key] = r.sector;
      }
      if (sectorLookupByCompany) {
        for (const k of Object.keys(sectorLookupByCompany)) {
          map[k.trim().toLowerCase()] = sectorLookupByCompany[k];
        }
      }
    }
    return map;
  }, [isCompanies, props, lazyCompanyData]);

  // ---- Derived summary (for gauge + KPIs) ----
  let title = "Selected Items";
  let esgScore = 0;
  let coveragePct = 0; // AUM% or Universe coverage%
  let rating = "D";
  let gaugeName = "Average Rating";

  // extra counters for mode-specific UIs
  let fundsCount = 0;
  let companiesCount = 0;
  let sectorsSelected = 0;
  let companiesInSelectedSectors = 0;

  if (isFunds) {
    title = "Selected Funds";
    gaugeName = "Average Fund Rating";

    const funds = (props as FundModeProps).funds;
    fundsCount = funds.length;

    const weights = funds.map((f) => parsePercent(f.percentage));
    const totalW = weights.reduce((a, b) => a + b, 0);
    const weightedSum = funds.reduce((acc, f, i) => acc + (f.score || 0) * (weights[i] || 0), 0);
    esgScore =
      totalW > 0
        ? weightedSum / totalW
        : funds.length > 0
        ? funds.reduce((a, f) => a + (f.score || 0), 0) / funds.length
        : 0;

    coveragePct = Math.min(100, totalW); // "AUM Covered"
    rating = computeGrade(esgScore);
  } else if (isCompanies) {
    title = "My Portfolio Companies";
    gaugeName = "Average Company Rating";

    const companies = (props as CompanyModeProps).companies as (PortfolioCompany & {
      sector?: string;
    })[];
    companiesCount = companies.length;

    esgScore = companiesCount > 0 ? companies.reduce((a, c) => a + (c.esgScore || 0), 0) / companiesCount : 0;
    coveragePct = companiesCount > 0 ? 100 : 0; // equal split assumption (unused in UI below)
    rating = computeGrade(esgScore);
  } else {
    title = "Selected Sectors";
    gaugeName = "Average Sector Rating";

    const { sectors, allCompanyData } = props as SectorModeProps;
    sectorsSelected = sectors.length;

    type SectorRow = { sectorName: string; count: number; avgComposite: number; grade: string };
    const sectorRows: SectorRow[] = sectors.map((name) => {
      const comps = allCompanyData.filter((c) => c.sector === name);
      const count = comps.length;
      const avgComposite = count > 0 ? comps.reduce((s, c) => s + (c.composite ?? 0), 0) / count : 0;
      return { sectorName: name, count, avgComposite, grade: computeGrade(avgComposite) };
    });

    companiesInSelectedSectors = sectorRows.reduce((s, r) => s + r.count, 0);
    const weightedSum = sectorRows.reduce((s, r) => s + r.avgComposite * r.count, 0);
    esgScore = companiesInSelectedSectors > 0 ? weightedSum / companiesInSelectedSectors : 0;
    rating = computeGrade(esgScore);

    const universe = (props as SectorModeProps).allCompanyData.length;
    coveragePct = universe > 0 ? Math.min(100, (companiesInSelectedSectors / universe) * 100) : 0; // Universe coverage%
  }

  // ---- Gauge in a consistent card ----
  const GaugeBlock = (
    <div className="text-center p-4 w-full min-h-32 flex items-center justify-center">
      <GreenRatingGauge score={esgScore} rating={rating} fundName={gaugeName} />
    </div>
  );

  // ---- Mode-specific summary UIs -------------------------------------------------------
  function FundsSummary() {
    return (
      <div className="bg-white border border-gray-200 rounded-large p-6 sm:p-8 mt-6">
        <h4 className="text-xl font-bold text-brand-dark mb-6">My Fund Portfolio</h4>

        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 md:grid-cols-2 items-center">
            {/* LEFT: Gauge */}
            <div className="flex items-center justify-center">{GaugeBlock}</div>

            {/* RIGHT: Score + AUM Covered */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="mr-5 flex-shrink-0 bg-indigo-100 rounded-full p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-600">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 3" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-indigo-700 font-medium">Weighted ESG Composite Score</p>
                  <p className="text-4xl font-bold text-gray-800">{formatNumber(esgScore)}</p>
                  <p className="text-xs text-gray-500 mt-1">{fundsCount} {fundsCount === 1 ? "fund" : "funds"} selected</p>
                </div>
              </div>

              <div className="flex items-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="mr-5 flex-shrink-0 bg-teal-100 rounded-full p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-teal-600">
                    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                    <path d="M22 12A10 10 0 0 0 12 2v10z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-teal-700 font-medium">AUM Covered</p>
                  <p className="text-4xl font-bold text-gray-800">{formatNumber(coveragePct)}%</p>
                </div>
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-gray-500 mt-2 max-w-xs mx-auto">
          Ratings are calculated based on a weighted average, in line with each fund&apos;s % allocation of AUM.
        </p>
        </div>
      </div>
    );
  }

  function CompaniesSummary() {
    return (
      <div className="bg-white border border-gray-200 rounded-large p-6 sm:p-8 mt-6">
        <h4 className="text-xl font-bold text-brand-dark mb-6">My Portfolio-Analysis</h4>

        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 md:grid-cols-2 items-center">
            {/* LEFT: Gauge */}
            <div className="flex items-center justify-center">{GaugeBlock}</div>

            {/* RIGHT: Score + Companies Selected */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="mr-5 flex-shrink-0 bg-indigo-100 rounded-full p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-600">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 3" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-indigo-700 font-medium">Average ESG Score</p>
                  <p className="text-4xl font-bold text-gray-800">{formatNumber(esgScore)}</p>
                </div>
              </div>

              <div className="flex items-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="mr-5 flex-shrink-0 bg-teal-100 rounded-full p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-teal-600">
                    <path d="M3 7h18" /><path d="M3 12h18" /><path d="M3 17h18" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-teal-700 font-medium">Companies Selected</p>
                  <p className="text-4xl font-bold text-gray-800">{companiesCount}</p>
                </div>
              </div>
            </div>
          </div>
                  <p className="text-center text-xs text-gray-500 mt-2 max-w-xs mx-auto">
          Ratings are calculated based on a weighted average, in line with each fund&apos;s % allocation of AUM.
        </p>
        </div>
      </div>
    );
  }

  function SectorsSummary() {
    return (
      <div className="bg-white border border-gray-200 rounded-large p-6 sm:p-8 mt-6">
        <h4 className="text-xl font-bold text-brand-dark mb-6">My Sectors</h4>

        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 md:grid-cols-2 items-center">
            {/* LEFT: Gauge */}
            <div className="flex items-center justify-center">{GaugeBlock}</div>

            {/* RIGHT: Score + Companies Covered (+ coverage hint) */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="mr-5 flex-shrink-0 bg-indigo-100 rounded-full p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-600">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 3" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-indigo-700 font-medium">Average Composite Score</p>
                  <p className="text-4xl font-bold text-gray-800">{formatNumber(esgScore)}</p>
                  <p className="text-xs text-gray-500 mt-1">{sectorsSelected} selected sector{sectorsSelected === 1 ? "" : "s"}</p>
                </div>
              </div>

              <div className="flex items-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="mr-5 flex-shrink-0 bg-teal-100 rounded-full p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-teal-600">
                    <path d="M16 21v-2a4 4 0 0 0-8 0v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-teal-700 font-medium">Companies Covered</p>
                  <p className="text-4xl font-bold text-gray-800">{companiesInSelectedSectors}</p>
                </div>
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-gray-500 mt-2 max-w-xs mx-auto">
          Ratings are calculated based on a weighted average, in line with each fund&apos;s % allocation of AUM.
        </p>
        </div>
      </div>
    );
  }
  // --------------------------------------------------------------------------------------

  return (
    <>
{/* Table */}
<div className="bg-white border border-gray-200 rounded-large p-6 sm:p-8">
  <h3 className="text-2xl font-bold text-brand-dark mb-6">{title}</h3>

  {/* figure out counts so we can render blank rows */}
  {(() => {
    const rowCount =
      isFunds
        ? (props as FundModeProps).funds.length
        : isCompanies
        ? (props as CompanyModeProps).companies.length
        : (props as SectorModeProps).sectors.length;

    const minRows = 7;                       // target body height = 10 rows
    const blanks = Math.max(0, minRows - rowCount);
    const colCount = 5;                       // all 3 modes render 5 columns

    return (
      <div className="overflow-x-auto">
        {/* scrollable body with fixed height (~56px per row × 10 rows) */}
        <div className="max-h-[380px] overflow-y-auto rounded-md border border-gray-100">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                {isFunds && (
                  <>
                    <th className="p-3 font-semibold text-gray-700">Fund Name</th>
                    <th className="p-3 font-semibold text-gray-700">ESG Composite Score</th>
                    <th className="p-3 font-semibold text-gray-700">ESG Rating</th>
                    <th className="p-3 font-semibold text-gray-700">Holding</th>
                    <th className="p-3 font-semibold text-gray-700">Action</th>
                  </>
                )}

                {isCompanies && (
                  <>
                    <th className="p-3 font-semibold text-gray-700">Company Name</th>
                    <th className="p-3 font-semibold text-gray-700">ISIN</th>
                    <th className="p-3 font-semibold text-gray-700">Sector</th>
                    <th className="p-3 font-semibold text-gray-700">ESG Composite Score</th>
                    <th className="p-3 font-semibold text-gray-700">Action</th>
                  </>
                )}

                {isSectors && (
                  <>
                    <th className="p-3 font-semibold text-gray-700">Sector Name</th>
                    <th className="p-3 font-semibold text-gray-700">Companies</th>
                    <th className="p-3 font-semibold text-gray-700">Average ESG Composite</th>
                    <th className="p-3 font-semibold text-gray-700">Sector ESG Rating</th>
                    <th className="p-3 font-semibold text-gray-700">Action</th>
                  </>
                )}
              </tr>
            </thead>

            <tbody className="align-top">
              {isFunds &&
                (props as FundModeProps).funds.map((f) => {
                  const holding = `${formatNumber(parsePercent(f.percentage))}%`;
                  return (
                    <tr key={f.fundName} className="border-b border-gray-200">
                      <td className="p-3 font-medium text-gray-800">{f.fundName}</td>
                      <td className="p-3 text-gray-600">{formatNumber(f.score)}</td>
                      <td className="p-3 text-gray-600">{f.grade}</td>
                      <td className="p-3 text-gray-600">{holding}</td>
                      <td className="p-3">
                        <button
                          onClick={() => (props as FundModeProps).onRemoveFund(f.fundName)}
                          className="text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}

              {isCompanies &&
                (() => {
                  const {
                    companies,
                    onRemoveCompany,
                    sectorLookupByIsin,
                    sectorLookupByCompany,
                  } = props as CompanyModeProps;

                  return (companies as (PortfolioCompany & { sector?: string })[]).map((item) => {
                    const normalizedName = (item.companyName || "").trim().toLowerCase();
                    const sector =
                      item.sector ??
                      sectorLookupByIsin?.[item.isin] ??
                      sectorLookupByCompany?.[item.companyName] ??
                      effectiveSectorByIsin[item.isin] ??
                      effectiveSectorByName[normalizedName] ??
                      "—";

                    return (
                      <tr key={item.isin} className="border-b border-gray-200">
                        <td className="p-3 font-medium text-gray-800">{item.companyName}</td>
                        <td className="p-3 text-gray-600">{item.isin}</td>
                        <td className="p-3 text-gray-600">{sector}</td>
                        <td className="p-3 text-gray-800 font-bold">
                          {formatNumber(item.esgScore)}
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => onRemoveCompany(item.isin)}
                            className="text-red-600 hover:underline"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  });
                })()}

              {isSectors &&
                (() => {
                  const { sectors, allCompanyData, onRemoveSector } = props as SectorModeProps;

                  const rows = sectors.map((name) => {
                    const comps = allCompanyData.filter((c) => c.sector === name);
                    const count = comps.length;
                    const avgComposite =
                      count > 0 ? comps.reduce((s, c) => s + (c.composite ?? 0), 0) / count : 0;
                    return {
                      sectorName: name,
                      count,
                      avgComposite,
                      grade: computeGrade(avgComposite),
                    };
                  });

                  return rows.map((row) => (
                    <tr key={row.sectorName} className="border-b border-gray-200">
                      <td className="p-3 font-medium text-gray-800">{row.sectorName}</td>
                      <td className="p-3 text-gray-600">{row.count}</td>
                      <td className="p-3 text-gray-800 font-bold">
                        {formatNumber(row.avgComposite)}
                      </td>
                      <td className="p-3 text-gray-600">{row.grade}</td>
                      <td className="p-3">
                        <button
                          onClick={() => onRemoveSector(row.sectorName)}
                          className="text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ));
                })()}

              {/* --- placeholder rows to keep 10-row height --- */}
              {Array.from({ length: blanks }).map((_, i) => (
                <tr key={`placeholder-${i}`} className="border-b border-gray-100">
                  <td className="p-3" colSpan={colCount}>
                    &nbsp;
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  })()}
</div>
{/* -------- Mode-specific summary below -------- */}
 {isCompanies ? <CompaniesSummary />: ""}
    </>
  );
}
