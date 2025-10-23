"use client";

import { useEffect, useMemo, useState } from "react";
import { CompanyDataRow, FundDataRow } from "@/lib/excel-data";
import {
  formatNumber,
  getColumnStats,
  getExtremeChipClass,
} from "../../productUtils";
import { InfoTooltip } from "@/components/ui/InfoTooltip";

type Props = {
  fund: FundDataRow | null;
  allCompanyData: CompanyDataRow[];
  handleAddFundToList: (fund: FundDataRow) => void; // kept for parity, not used here now
};

export default function FundDetails({ fund, allCompanyData }: Props) {
// add this near the top of the component (after props)
const hasFund = !!(fund?.fundName && fund.fundName.trim());

// hooks — these are now called on every render (good)
const [isExpanded, setIsExpanded] = useState(false);

useEffect(() => {
  setIsExpanded(false);
}, [fund?.fundName]);

// rest of your hooks...
const rows = useMemo(() => allCompanyData.slice(5, 20), [allCompanyData]);

const totalCompanies = rows.length;

const avgScore =
  totalCompanies > 0
    ? rows.reduce((sum, r) => sum + (r.composite ?? 0), 0) / totalCompanies
    : 0;

const pageStats = useMemo(
  () =>
    getColumnStats<CompanyDataRow, keyof CompanyDataRow>(rows, [
      "composite",
      "esgScore",
      "e_score",
      "s_score",
      "g_score",
    ] as const),
  [rows]
);



  // Header helper: label and tooltip icon are now inline.
  const Header = ({
    children,
    tip,
    align = "center",
  }: {
    children: React.ReactNode;
    tip:
      | "esgPillarScore"
      | "esgCompositeScore"
      | "esgRating"
      | "environmentalPillar"
      | "socialPillar"
      | "governancePillar"
      | "positiveScreen"
      | "negativeScreen"
      | "controversyRating";
    align?: "left" | "center" | "right";
  }) => {
    const alignCls =
      align === "left"
        ? "justify-start text-left"
        : align === "right"
        ? "justify-end text-right"
        : "justify-center text-center";
    return (
      <div
        className={`relative flex flex-row items-center gap-1 ${alignCls} px-2 py-2 leading-snug`}
      >
        <span className="font-bold text-gray-700 whitespace-normal">
          {children}
        </span>
        <InfoTooltip id={tip} align="center" panelWidthClass="w-72" />
      </div>
    );
  };
if (!hasFund) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-large p-6 sm:p-8">
      {/* Overview tiles */}
      <div className="mx-auto max-w-3xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 mb-6">
          {/* Average ESG Composite Score Card */}
          <div className="flex gap-4 items-center p-6 bg-white rounded-xl border border-brand-bg-light shadow-sm">
            <div className="mr-5 flex-shrink-0 bg-teal-100 rounded-full p-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-teal-600"
              >
                <path d="M0 0h24v24H0z" stroke="none" fill="none" />
                <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
                <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                <path d="M13.41 10.59l4.59 -4.59" />
                <path d="M7 12a5 5 0 0 1 5 -5" />
              </svg>
            </div>
            <div>
              <p className="text-4xl font-bold text-gray-800">
                {formatNumber(avgScore)}
              </p>
              <p className="text-sm text-gray-600 font-medium inline-flex items-center gap-1 break-words">
                Weighted ESG Composite Score
                <span className="-translate-y-[1px] inline-flex">
                  <InfoTooltip
                    id="fundWeightedCompositeScore"
                    align="left"
                    panelWidthClass="w-72"
                  />
                </span>
              </p>
            </div>
          </div>

          {/* Total Companies Card */}
          <div className="flex gap-4 items-center p-6 bg-white rounded-xl border border-brand-bg-light shadow-sm">
            <div className="mr-5 flex-shrink-0 bg-cyan-100 rounded-full p-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-cyan-600"
              >
                <path d="M3 21h18" />
                <path d="M5 21v-14l8 -4v18" />
                <path d="M19 21v-10l-6 -4" />
                <path d="M9 9v0" />
                <path d="M9 12v0" />
                <path d="M9 15v0" />
                <path d="M9 18v0" />
              </svg>
            </div>
            <div>
              <p className="text-4xl font-bold text-gray-800">{totalCompanies}</p>
              <p className="text-sm text-gray-600 font-medium">Total Companies</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toggle */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setIsExpanded((v) => !v)}
          aria-expanded={isExpanded}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-all"
        >
          {isExpanded ? "Hide Details" : "Show Details"}
        </button>
      </div>

      {/* Companies table */}
      {totalCompanies > 0 ? (
        <div className="relative h-[400px] overflow-y-auto overflow-x-hidden rounded-lg border border-gray-200 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-600">
          <table
            className={`w-full table-auto ${isExpanded ? "text-xs" : "text-sm"}`}
          >
            {!isExpanded ? (
              <thead className="sticky top-0 bg-gray-100">
                <tr className="align-middle">
                  <th className="text-left p-3 font-bold text-gray-700">
                    Company
                  </th>
                  <th className="text-left p-3 font-bold text-gray-700">
                    Sector
                  </th>
                  <th className="text-center p-2">
                    <Header tip="esgPillarScore">ESG Pillar Score</Header>
                  </th>
                  <th className="text-center p-2">
                    <Header tip="esgCompositeScore">ESG Composite Score</Header>
                  </th>
                  <th className="text-center p-2">
                    <Header tip="esgRating">ESG Rating</Header>
                  </th>
                </tr>
              </thead>
            ) : (
              <thead className="sticky top-0 bg-gray-100">
                <tr className="align-middle">
                  <th className="text-left p-2 font-bold text-gray-700">
                    Company
                  </th>
                  <th className="text-left p-2 font-bold text-gray-700">
                    Sector
                  </th>
                  <th className="text-center p-1">
                    <Header tip="environmentalPillar">E-Pillar Score</Header>
                  </th>
                  <th className="text-center p-1">
                    <Header tip="socialPillar">S-Pillar Score</Header>
                  </th>
                  <th className="text-center p-1">
                    <Header tip="governancePillar">G-Pillar Score</Header>
                  </th>
                  <th className="text-center p-1">
                    <Header tip="esgPillarScore">ESG Pillar Score</Header>
                  </th>
                  <th className="text-center p-1">
                    <Header tip="positiveScreen">Positive Screen</Header>
                  </th>
                  <th className="text-center p-1">
                    <Header tip="negativeScreen">Negative Screen</Header>
                  </th>
                  <th className="text-center p-1">
                    <Header tip="controversyRating">Controversy Rating</Header>
                  </th>
                  <th className="text-center p-1">
                    <Header tip="esgCompositeScore">ESG Composite Score</Header>
                  </th>
                  <th className="text-center p-1">
                    <Header tip="esgRating">ESG Rating</Header>
                  </th>
                </tr>
              </thead>
            )}

            <tbody>
              {rows.map((company, index) =>
                !isExpanded ? (
                  <tr
                    key={`${company.isin || company.companyName}-${index}-collapsed`}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="p-3 font-medium text-gray-800">
                      {company.companyName}
                    </td>
                    <td className="p-3 text-gray-700">{company.sector}</td>
                    <td className="p-3 text-center text-gray-800">
                      <span
                        className={getExtremeChipClass(
                          "esgScore",
                          company.esgScore,
                          pageStats
                        )}
                      >
                        {formatNumber(company.esgScore ?? 0)}
                      </span>
                    </td>
                    <td className="p-2 text-center text-gray-800">
                      <span
                        className={getExtremeChipClass(
                          "composite",
                          company.composite,
                          pageStats
                        )}
                      >
                        {formatNumber(company.composite ?? 0)}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                        {company.grade ?? "-"}
                      </span>
                    </td>
                  </tr>
                ) : (
                  <tr
                    key={`${company.isin || company.companyName}-${index}-expanded`}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="p-2 font-medium text-gray-800">
                      {company.companyName}
                    </td>
                    <td className="p-2 text-gray-700">{company.sector}</td>
                    <td className="p-2 text-center text-gray-800">
                      <span
                        className={getExtremeChipClass(
                          "e_score",
                          company.e_score,
                          pageStats
                        )}
                      >
                        {formatNumber(company.e_score ?? 0)}
                      </span>
                    </td>
                    <td className="p-2 text-center text-gray-800">
                      <span
                        className={getExtremeChipClass(
                          "s_score",
                          company.s_score,
                          pageStats
                        )}
                      >
                        {formatNumber(company.s_score ?? 0)}
                      </span>
                    </td>
                    <td className="p-2 text-center text-gray-800">
                      <span
                        className={getExtremeChipClass(
                          "g_score",
                          company.g_score,
                          pageStats
                        )}
                      >
                        {formatNumber(company.g_score ?? 0)}
                      </span>
                    </td>
                    <td className="p-2 text-center text-gray-800">
                      <span
                        className={getExtremeChipClass(
                          "esgScore",
                          company.esgScore,
                          pageStats
                        )}
                      >
                        {formatNumber(company.esgScore ?? 0)}
                      </span>
                    </td>
                    <td className="p-2 text-center">
                      {company.positive || "-"}
                    </td>
                    <td className="p-2 text-center">
                      {company.negative || "-"}
                    </td>
                    <td className="p-2 text-center">
                      {company.controversy || "-"}
                    </td>
                    <td className="p-2 text-center text-gray-800">
                      <span
                        className={getExtremeChipClass(
                          "composite",
                          company.composite,
                          pageStats
                        )}
                      >
                        {formatNumber(company.composite ?? 0)}
                      </span>
                    </td>
                    <td className="p-2 text-center">
                      <span className="px-2 py-1 rounded-full font-semibold bg-gray-100 text-gray-700">
                        {company.grade ?? "-"}
                      </span>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="border border-ui-border rounded-lg p-6 bg-ui-fill text-ui-text-secondary">
          No companies available for this fund’s current holdings.
        </div>
      )}
    </div>
  );
}