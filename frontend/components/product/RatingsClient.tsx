// components/product/RatingsClient.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import RatingTable, { type RatingRow } from "@/components/product/RatingTable";
import { LOGIN, SHOW_TABS_FOR_EMPTY_USER } from "@/lib/feature-flags";
import { companyAPI, type CompanyListItem, type MyReportItem } from "@/lib/auth";
import { useAuth } from "@/components/auth/AuthProvider";
import RequestReportModal from "./RequestReportModal";

/**
 * Enhanced RatingsClient with backend integration for real report ownership tracking
 */

// Grade ordering helper for sorting (A+ best → D worst)
const GRADE_ORDER = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D"];
const gradeRank = (g: string) => {
  const i = GRADE_ORDER.indexOf(g?.toUpperCase?.() ?? "");
  return i === -1 ? Number.POSITIVE_INFINITY : i;
};
   
// Pagination (increased for scroll view)
const PAGE_SIZE = 50; // Show more rows before pagination kicks in

export default function RatingsClient({ initial = [] as RatingRow[] }) {
  // Auth context for user information
  const { user, isAuthenticated } = useAuth();
  
  // Raw, fully-loaded rows (from backend)
  const [allRows, setAllRows] = useState<RatingRow[]>(initial);
  const [myReports, setMyReports] = useState<MyReportItem[]>([]);

  // Loading state
  const [loading, setLoading] = useState(false);

  // Column filter states
  const [filterCompanies, setFilterCompanies] = useState<string[]>([]);
  const [filterSectors, setFilterSectors] = useState<string[]>([]);

  // Rating sort state: "asc" | "desc" | null
  const [sortRating, setSortRating] = useState<"asc" | "desc" | null>(null);

  // Year filter (dropdown)
  const [filterYear, setFilterYear] = useState<number>(2024);
  const yearOptions = [2024, 2023];

  // Pagination
  const [page, setPage] = useState(1);

  // Tab state (only shown when showTabs === true)
  type TabKey = "all" | "mine";
  const [tab, setTab] = useState<TabKey>("all");

  // Inbuilt PDF viewer modal state
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [viewerTitle, setViewerTitle] = useState<string>("");

  // Request Report modal state
  const [reqOpen, setReqOpen] = useState(false);
  const [reqDefaultCompany, setReqDefaultCompany] = useState<string | undefined>(undefined);

  // ===== Load companies from backend API =====
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        console.log('🔄 Loading companies from backend API...');
        
        // Load all available companies from backend
        const companies: CompanyListItem[] = await companyAPI.getAllCompanies();
        console.log('✅ Companies loaded:', companies?.length, 'companies');
        
        // Convert to RatingRow format
        const ratingRows: RatingRow[] = companies
          .filter((c) => !!c.company_name && !!c.esg_rating)
          .map((c) => ({
            company: c.company_name,
            sector: c.esg_sector || "—",
            rating: c.esg_rating || "—",
            year: 2024, // Default year for company ratings
            reportUrl: "#", // Will trigger download request
            isin: c.isin, // Add ISIN for identification
          }));

        console.log('✅ Rating rows created:', ratingRows?.length, 'rows');
        if (!cancelled) setAllRows(ratingRows);
        
        // Load user's assigned companies if authenticated
        if (isAuthenticated) {
          try {
            const userCompanies: MyReportItem[] = await companyAPI.getMyReports();
            if (!cancelled) setMyReports(userCompanies);
            console.log('✅ My reports loaded:', userCompanies?.length, 'reports');
          } catch (error) {
            console.warn('Could not load my reports:', error);
          }
        }
      } catch (e) {
        console.error("❌ Failed loading companies from backend:", e);
        console.error("Error details:", {
          message: (e as Error)?.message,
          stack: (e as Error)?.stack,
          name: (e as Error)?.name
        });
        // Fallback to initial data if provided
        if (!cancelled && initial?.length) {
          setAllRows(initial);
          console.log('📋 Using fallback initial data:', initial.length, 'rows');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initial, isAuthenticated]);

  // ----- My reports (from backend assigned companies) -----
  const myRows = useMemo<RatingRow[]>(() => {
    return myReports.map((mr): RatingRow => ({
      company: mr.company_name,
      sector: mr.esg_sector || "—",
      rating: mr.esg_rating || "—",
      year: 2024, // Default year for assigned companies
      reportUrl: mr.download_url || "#", // Secure download URL from backend
      isin: mr.isin,
      reportFilename: mr.report_filename, // Add filename for display
    }));
  }, [myReports]);

  // Show tabs if login enabled and (user has reports OR testing flag is on)
  const showTabs = LOGIN && (SHOW_TABS_FOR_EMPTY_USER || myRows.length > 0);

  // ===== Base rows depend on active tab =====
  const baseRows = tab === "mine" ? myRows : allRows;

  // ===== Derived option lists (Company, Sector) from baseRows =====
  const companyOptions = useMemo(() => {
    const set = new Set<string>();
    baseRows.forEach((r) => set.add(r.company));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [baseRows]);

  const sectorOptions = useMemo(() => {
    const set = new Set<string>();
    baseRows.forEach((r) => set.add(r.sector || "—"));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [baseRows]);

  // ===== Filtering & Sorting =====
  const filteredRows = useMemo(() => {
    let filtered = baseRows.filter((r) => {
      if (filterCompanies.length && !filterCompanies.includes(r.company)) return false;
      if (filterSectors.length && !filterSectors.includes(r.sector || "—")) return false;
      if (r.year !== filterYear) return false;
      return true;
    });

    // Sort by rating if requested
    if (sortRating) {
      filtered = filtered.sort((a, b) => {
        const aRank = gradeRank(a.rating);
        const bRank = gradeRank(b.rating);
        return sortRating === "asc" ? aRank - bRank : bRank - aRank;
      });
    }

    return filtered;
  }, [baseRows, filterCompanies, filterSectors, filterYear, sortRating]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [filterCompanies, filterSectors, filterYear, sortRating, tab]);

  // ===== Pagination slice =====
  const pages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const pageRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, page]);

  // ===== Ownership helpers =====
  const hasReport = (company: string, year: number) => {
    // Check if user has this company assigned in My Reports
    return myReports.some(mr => mr.company_name === company);
  };

  // ===== Actions =====
  function handleRequest(company: string) {
    if (!LOGIN) return;
    setReqDefaultCompany(company);
    setReqOpen(true);
  }

  function handleShow(row: RatingRow) {
    // For My Reports, show company details instead of PDF
    if (tab === "mine") {
      alert(`Company Details:\nName: ${row.company}\nSector: ${row.sector}\nESG Rating: ${row.rating}\nISIN: ${row.isin || 'N/A'}`);
      return;
    }
    
    // For All Reports, this shouldn't happen as they should all be "Download" buttons
    alert("This report requires a download request. Please click Download to request access.");
  }

  // ===== Render =====
  return (
    <section className="w-full">
      {/* Fixed header container */}
      <div className="bg-white">
        {showTabs && (
          <div className="mb-0">
            <div className="inline-flex border-x border-t border-gray-200 rounded-t-xl bg-white">
              <TabButton active={tab === "all"} onClick={() => setTab("all")}>
                All Reports
              </TabButton>
              <TabButton active={tab === "mine"} onClick={() => setTab("mine")}>
                My Reports
              </TabButton>
            </div>
          </div>
        )}
      </div>

      <div className={`${showTabs ? 'rounded-t-none' : 'rounded-lg'} border border-gray-200`}>
        <RatingTable
          rows={pageRows}
          page={page}
          pages={pages}
          onPage={setPage}
          companyOptions={companyOptions}
          sectorOptions={sectorOptions}
          filterCompanies={filterCompanies}
          onFilterCompanies={setFilterCompanies}
          filterSectors={filterSectors}
          onFilterSectors={setFilterSectors}
          sortRating={sortRating}
          onSortRating={setSortRating}
          filterYear={filterYear}
          onFilterYear={setFilterYear}
          yearOptions={yearOptions}
          onRequest={handleRequest}
          isLoggedIn={LOGIN}
          hasReport={hasReport}
          onShow={handleShow}
          mode={tab}
          scrollView={true}
          showTabs={showTabs}
        />
      </div>

      {/* Request modal */}
      <RequestReportModal
        open={reqOpen}
        onClose={() => setReqOpen(false)}
        defaultCompany={reqDefaultCompany}
        year={filterYear}
        loggedIn={LOGIN}
        companyOptions={companyOptions}
      />

      {/* Inbuilt PDF/report viewer */}
      {viewerUrl && (
        <ReportViewerModal
          title={viewerTitle}
          url={viewerUrl}
          onClose={() => setViewerUrl(null)}
        />
      )}
    </section>
  );
}

/* ====================== UI Components ====================== */

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "px-4 py-2 text-sm font-medium transition-all duration-200 border-r border-gray-200 last:border-r-0 first:rounded-tl-xl last:rounded-tr-xl",
        active 
          ? "bg-white text-teal-600 border-b-2 border-b-teal-600 shadow-sm" 
          : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-800",
      ].join(" ")}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}

function ReportViewerModal({
  title,
  url,
  onClose,
}: {
  title: string;
  url: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-11/12 h-5/6 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>
        <div className="flex-1 p-4">
          <iframe
            src={url}
            className="w-full h-full border rounded"
            title="Report Viewer"
          />
        </div>
      </div>
    </div>
  );
}