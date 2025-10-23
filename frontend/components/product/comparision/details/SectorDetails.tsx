"use client";

import { useMemo, useState } from "react";
import { CompanyDataRow } from "@/lib/excel-data";
import { formatNumber, getColumnStats, getExtremeChipClass } from "../../productUtils";
import { InfoTooltip } from "@/components/ui/InfoTooltip";

type GaugeData = { score: number; rating: string; name: string };

const SectorDetails = ({
  sectorName,
  allCompanyData,
  gaugeData: _gaugeData,              // unused -> prefixed to silence lint
  onAddSector: _onAddSector,          // unused -> prefixed to silence lint
  stickyTopOffsetPx: _stickyTopOffsetPx = 80, // unused -> prefixed to silence lint
}: {
  sectorName: string;
  allCompanyData: CompanyDataRow[];
  gaugeData: GaugeData;
  onAddSector?: (sectorName: string) => void;
  stickyTopOffsetPx?: number;
}) => {
  // ✅ hooks must run on every render
  const [isExpanded, setIsExpanded] = useState(false);

  // compute flags AFTER hooks (or at least don’t return before hooks)
  const hasSector = !!(sectorName && sectorName.trim());

  const companiesInSector = useMemo(
    () => allCompanyData.filter((c) => c.sector === sectorName),
    [allCompanyData, sectorName]
  );
  const totalCompanies = companiesInSector.length;

  
  const numericColumns = [
  "composite",
  "esgScore",
  "e_score",
  "s_score",
  "g_score",
] as const satisfies readonly (keyof CompanyDataRow)[];

const pageStats = useMemo(
  () =>
    getColumnStats<CompanyDataRow, (typeof numericColumns)[number]>(
      companiesInSector,
      numericColumns
    ),
  [companiesInSector]
);
  // If nothing to show, return AFTER hooks
  if (!hasSector || totalCompanies === 0) return null;

  // Stats for strict min/max chips


  const avgComposite =
    totalCompanies > 0
      ? companiesInSector.reduce((acc, c) => acc + (c.composite ?? 0), 0) / totalCompanies
      : 0;

  let sectorGrade = "D";
  if (avgComposite > 75) sectorGrade = "A+";
  else if (avgComposite >= 70) sectorGrade = "A";
  else if (avgComposite >= 65) sectorGrade = "B+";
  else if (avgComposite >= 60) sectorGrade = "B";
  else if (avgComposite >= 55) sectorGrade = "C+";
  else if (avgComposite >= 50) sectorGrade = "C";

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
      <div className={`relative flex flex-row items-center gap-1 ${alignCls} px-2 py-2 leading-snug`}>
        <span className="font-bold text-gray-700 whitespace-normal">{children}</span>
        <InfoTooltip id={tip} align="center" panelWidthClass="w-72" />
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-large p-6 sm:p-8">
      {/* Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Average ESG Composite Score Card */}
        <div className="flex items-center p-6 bg-white rounded-xl border border-gray-300 shadow-sm ">
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
            <p className="text-3xl font-bold text-gray-800">
              {formatNumber(avgComposite)}
            </p>
            <p className="text-sm text-gray-600 font-medium inline-flex items-center gap-1">
              Average ESG Composite Score
              <InfoTooltip
                id="sectorAverageCompositeScore"
                align="left"
                panelWidthClass="w-72"
              />
            </p>
          </div>
        </div>

        {/* Sector Rating Card */}
        <div className="flex items-center p-6 bg-white rounded-xl border border-gray-300 shadow-sm ">
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
              <path d="M12 15l-3.5 -3.5" />
              <path d="M15 12l-3.5 3.5" />
              <path d="M10 21h4" />
              <path d="M12 21v-4" />
              <path d="M4.22 10.22l1.42 1.42" />
              <path d="M18.36 11.64l1.42 -1.42" />
              <path d="M12 3a9 9 0 0 0 0 18" />
            </svg>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-800">{sectorGrade}</p>
            <p className="text-sm text-gray-600 font-medium inline-flex items-center gap-1">
              Sector Rating
              <InfoTooltip id="sectorAverageRating" align="left" panelWidthClass="w-64" />
            </p>
          </div>
        </div>

        {/* Total Companies Card */}
        <div className="flex items-center p-6 bg-white rounded-xl border border-gray-300 shadow-sm ">
          <div className="mr-5 flex-shrink-0 bg-indigo-100 rounded-full p-3">
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
              className="text-indigo-600"
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
            <p className="text-3xl font-bold text-gray-800">
              {totalCompanies}
            </p>
            <p className="text-sm text-gray-600 font-medium">
              Total Companies
            </p>
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

      {/* Table */}
      <div className="relative h-[400px] overflow-auto rounded-lg border border-gray-200 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-600">
        <table
          className={`w-full table-auto ${
            isExpanded ? "text-xs" : "text-sm"
          }`}
        >
          {!isExpanded ? (
            <thead className="sticky top-0 bg-gray-100">
              <tr className="align-middle">
                <th className="text-left p-3 font-bold text-gray-700">
                  Company
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
            {companiesInSector.map((row, index) =>
              !isExpanded ? (
                <tr
                  key={`${index}-collapsed`}
                  className="border-b border-gray-100 hover:bg-gray-50 h-12"
                >
                  <td className="p-3 font-medium text-gray-800">
                    {row.companyName}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={getExtremeChipClass(
                        "esgScore",
                        row.esgScore,
                        pageStats
                      )}
                    >
                      {formatNumber(row.esgScore ?? 0)}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={getExtremeChipClass(
                        "composite",
                        row.composite,
                        pageStats
                      )}
                    >
                      {formatNumber(row.composite ?? 0)}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                      {row.grade ?? "-"}
                    </span>
                  </td>
                </tr>
              ) : (
                <tr
                  key={`${index}-expanded`}
                  className="border-b border-gray-100 hover:bg-gray-50 h-12"
                >
                  <td className="p-2 font-medium text-gray-800">
                    {row.companyName}
                  </td>
                  <td className="p-2 text-center">
                    <span
                      className={getExtremeChipClass(
                        "e_score",
                        row.e_score,
                        pageStats
                      )}
                    >
                      {formatNumber(row.e_score ?? 0)}
                    </span>
                  </td>
                  <td className="p-2 text-center">
                    <span
                      className={getExtremeChipClass(
                        "s_score",
                        row.s_score,
                        pageStats
                      )}
                    >
                      {formatNumber(row.s_score ?? 0)}
                    </span>
                  </td>
                  <td className="p-2 text-center">
                    <span
                      className={getExtremeChipClass(
                        "g_score",
                        row.g_score,
                        pageStats
                      )}
                    >
                      {formatNumber(row.g_score ?? 0)}
                    </span>
                  </td>
                  <td className="p-2 text-center">
                    <span
                      className={getExtremeChipClass(
                        "esgScore",
                        row.esgScore,
                        pageStats
                      )}
                    >
                      {formatNumber(row.esgScore ?? 0)}
                    </span>
                  </td>
                  <td className="p-2 text-center">{row.positive || "-"}</td>
                  <td className="p-2 text-center">{row.negative || "-"}</td>
                  <td className="p-2 text-center">{row.controversy || "-"}</td>
                  <td className="p-2 text-center">
                    <span
                      className={getExtremeChipClass(
                        "composite",
                        row.composite,
                        pageStats
                      )}
                    >
                      {formatNumber(row.composite ?? 0)}
                    </span>
                  </td>
                  <td className="p-2 text-center">
                    <span className="px-2 py-1 rounded-full font-semibold bg-gray-100 text-gray-700">
                      {row.grade ?? "-"}
                    </span>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SectorDetails;