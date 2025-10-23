"use client";

import { CompanyDataRow } from "@/lib/excel-data";
import { formatNumber } from "../../productUtils";
import GreenRatingGauge from "../../GreenRatingGauge";
import { InfoTooltip } from "@/components/ui/InfoTooltip";

type GaugeData = { score: number; rating: string; name: string };

const CompanyDetails = ({
  company,
  handleAddToPortfolio, // kept for parity, button moved to sticky bar
  gaugeData, // reserved
}: {
  company: CompanyDataRow;
  handleAddToPortfolio: (company: CompanyDataRow) => void;
  gaugeData: GaugeData;
}) => {
  if (!company || !company.companyName) return null;

  const clamp100 = (n: number | undefined | null) =>
    Math.max(0, Math.min(100, Number(n ?? 0)));

  const eVal = clamp100(company.e_score);
  const sVal = clamp100(company.s_score);
  const gVal = clamp100(company.g_score);
  const compositeVal = clamp100(company.composite);
  const esgScoreVal = clamp100(company.esgScore);

  const Bar = ({ value, className }: { value: number; className: string }) => (
    <div className="w-full h-2.5 rounded-full bg-gray-200 overflow-hidden">
      <div
        className={`h-full rounded-full transition-[width] duration-500 ${className}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );

  return (
    <div className="bg-white border border-gray-200 p-6 sm:p-8 shadow-sm">
      {/* Progress group */}
<div className="space-y-3 mb-6">
  {/* Environmental */}
  <div className="flex items-center gap-3">
    <div className="min-w-[140px] text-sm text-gray-700 font-medium">
      <span className="inline-flex items-center gap-1">
        Environmental
        <InfoTooltip id="environmentalPillar" align="left" />
      </span>
    </div>
    <Bar
      value={eVal}
      className="bg-[linear-gradient(90deg,#1C4439_0%,#2F7F63_50%,#6DC7BC_100%)]"
    />
    <div className="w-14 text-right text-sm font-bold text-gray-900 tabular-nums">
      {formatNumber(eVal)}
    </div>
  </div>

  {/* Social */}
  <div className="flex items-center gap-3">
    <div className="min-w-[140px] text-sm text-gray-700 font-medium">
      <span className="inline-flex items-center gap-1">
        Social
        <InfoTooltip id="socialPillar" align="left" />
      </span>
    </div>
    <Bar
      value={sVal}
      className="bg-[linear-gradient(90deg,#1E40AF_0%,#3BAFDA_50%,#6DC7BC_100%)]"
    />
    <div className="w-14 text-right text-sm font-bold text-gray-900 tabular-nums">
      {formatNumber(sVal)}
    </div>
  </div>

  {/* Governance */}
  <div className="flex items-center gap-3">
    <div className="min-w-[140px] text-sm text-gray-700 font-medium">
      <span className="inline-flex items-center gap-1">
        Governance
        <InfoTooltip id="governancePillar" align="left" />
      </span>
    </div>
    <Bar
      value={gVal}
      className="bg-[linear-gradient(90deg,#5A6B2F_0%,#9CB25A_50%,#C9DA8E_100%)]"
    />
    <div className="w-14 text-right text-sm font-bold text-gray-900 tabular-nums">
      {formatNumber(gVal)}
    </div>
  </div>
</div>
{/* <div className="space-y-3 mb-6"> <div className="flex items-center gap-3"> <div className="min-w-[140px] text-sm text-gray-700 font-medium"> <span className="inline-flex items-center gap-1"> Environmental <InfoTooltip id="environmentalPillar" align="left" /> </span> </div> <Bar value={eVal} className="bg-gradient-to-r from-environmental via-green-500 to-emerald-600" /> <div className="w-14 text-right text-sm font-bold text-gray-900 tabular-nums"> {formatNumber(eVal)} </div> </div> <div className="flex items-center gap-3"> <div className="min-w-[140px] text-sm text-gray-700 font-medium"> <span className="inline-flex items-center gap-1"> Social <InfoTooltip id="socialPillar" align="left" /> </span> </div> <Bar value={sVal} className="bg-gradient-to-r from-social via-blue-500 to-indigo-600" /> <div className="w-14 text-right text-sm font-bold text-gray-900 tabular-nums"> {formatNumber(sVal)} </div> </div> <div className="flex items-center gap-3"> <div className="min-w-[140px] text-sm text-gray-700 font-medium"> <span className="inline-flex items-center gap-1"> Governance <InfoTooltip id="governancePillar" align="left" /> </span> </div> <Bar value={gVal} className="bg-gradient-to-r from-governance via-yellow-500 to-governance-600" /> <div className="w-14 text-right text-sm font-bold text-gray-900 tabular-nums"> {formatNumber(gVal)} </div> </div> </div> */}

      {/* Screens / summary tiles */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {/* ESG Pillar Score */}
        <div className="flex items-center justify-between p-5 bg-white rounded-xl border border-gray-200 shadow-sm transition-shadow duration-300">
          <div>
            <p className="text-xs text-gray-600 uppercase tracking-wider">
              <span className="inline-flex items-center gap-1">
                ESG Pillar Score
                <InfoTooltip id="esgPillarScore" align="left" />
              </span>
            </p>
            <p className="text-xl font-semibold text-slate-800 mt-1 break-words">
              {company.esgScore ?? "-"}
            </p>
          </div>
          <div className="flex-shrink-0 bg-gray-100 rounded-full p-2.5 ml-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="34"
              height="34"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 18V10" stroke="#228B22" />
              <path d="M12 18V6" stroke="#4169E1" />
              <path d="M18 18V12" stroke="#FFBF00" />
            </svg>
          </div>
        </div>

        {/* Positive Screen */}
        <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm transition-shadow duration-300">
          <div>
            <p className="text-xs text-teal-700 uppercase tracking-wider">
              <span className="inline-flex items-center gap-1">
                Positive Screen
                <InfoTooltip id="positiveScreen" align="left" />
              </span>
            </p>
            <p className="text-lg font-semibold text-teal-900 mt-1 break-words">
              {company.positive || "-"}
            </p>
          </div>
          <div className="flex-shrink-0 bg-teal-100 rounded-full p-2 ml-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="34"
              height="34"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-teal-600"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
        </div>

        {/* Negative Screen */}
        <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm transition-shadow duration-300">
          <div>
            <p className="text-xs text-rose-700 uppercase tracking-wider">
              <span className="inline-flex items-center gap-1">
                Negative Screen
                <InfoTooltip id="negativeScreen" align="left" />
              </span>
            </p>
            <p className="text-lg font-semibold text-rose-900 mt-1 break-words">
              {company.negative || "-"}
            </p>
          </div>
          <div className="flex-shrink-0 bg-rose-100 rounded-full p-2 ml-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="34"
              height="34"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-rose-600"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
              <path d="m14.5 9.5-5 5" />
              <path d="m9.5 9.5 5 5" />
            </svg>
          </div>
        </div>

        {/* Controversy Rating */}
        <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm transition-shadow duration-300">
          <div>
            <p className="text-xs text-amber-700 uppercase tracking-wider">
              <span className="inline-flex items-center gap-1">
                Controversy Rating
                <InfoTooltip id="controversyRating" align="left" />
              </span>
            </p>
            <p className="text-lg font-semibold text-amber-900 mt-1 break-words">
              {company.controversy || "-"}
            </p>
          </div>
          <div className="flex-shrink-0 bg-amber-100 rounded-full p-2 ml-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="34"
              height="34"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-amber-600"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetails;




