// components/product/RatingsClient.tsx
"use client";

import React, { useEffect, useMemo, useState, useRef, useCallback,RefObject } from "react";
import RatingTable, { type RatingRow } from "@/components/product/RatingTable";
import { LOGIN, SHOW_TABS_FOR_EMPTY_USER } from "@/lib/feature-flags";
import { companyAPI, type CompanyListItem, type MyReportItem } from "@/lib/auth";
import { useAuth } from "@/components/auth/AuthProvider";
import RequestReportModal from "./RequestReportModal";

/**
 * Enhanced RatingsClient with infinite scroll loading
 */

// Grade ordering helper for sorting (A+ best → D worst)
const GRADE_ORDER = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D"];
const gradeRank = (g: string) => {
  const i = GRADE_ORDER.indexOf(g?.toUpperCase?.() ?? "");
  return i === -1 ? Number.POSITIVE_INFINITY : i;
};

// Increased page size for better UX with infinite scroll
const PAGE_SIZE = 30;

export default function RatingsClient({ initial = [] as RatingRow[] }) {
  const { user, isAuthenticated } = useAuth();
  
  // Data states
  const [allRows, setAllRows] = useState<RatingRow[]>([]);
  const [myReports, setMyReports] = useState<MyReportItem[]>([]);
  const [displayedRows, setDisplayedRows] = useState<RatingRow[]>([]);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Filter states
  const [filterCompanies, setFilterCompanies] = useState<string[]>([]);
  const [filterSectors, setFilterSectors] = useState<string[]>([]);
  const [sortRating, setSortRating] = useState<"asc" | "desc" | null>(null);
  const [filterYear, setFilterYear] = useState<number>(2024);
  const yearOptions = [2024, 2023];

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Tab state
  type TabKey = "all" | "mine";
  const [tab, setTab] = useState<TabKey>("all");

  // Modals
  const [reqOpen, setReqOpen] = useState(false);
  const [reqDefaultCompany, setReqDefaultCompany] = useState<string | undefined>(undefined);

  // Refs for infinite scroll
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // ===== Load initial data =====
  useEffect(() => {
    let cancelled = false;
    
    (async () => {
      setLoading(true);
      setIsInitialLoad(true);
      
      try {
        console.log('🔄 Loading companies from backend API...');
        
        const companies: CompanyListItem[] = await companyAPI.getAllCompanies();
        console.log('✅ Companies loaded:', companies?.length, 'companies');
        
        const ratingRows: RatingRow[] = companies
          .filter((c) => !!c.company_name && !!c.esg_rating)
          .map((c) => ({
            company: c.company_name,
            sector: c.sector || "—",
            rating: c.esg_rating || "—",
            year: 2024,
            reportUrl: "#",
            isin: c.isin,
          }));

        if (!cancelled) {
          setAllRows(ratingRows);
          console.log('✅ Rating rows created:', ratingRows?.length, 'rows');
        }
        
        if (isAuthenticated) {
          try {
            const userCompanies: MyReportItem[] = await companyAPI.getMyReports();
            if (!cancelled) {
              setMyReports(userCompanies);
              console.log('✅ My reports loaded:', userCompanies?.length, 'reports');
            }
          } catch (error) {
            console.warn('Could not load my reports:', error);
          }
        }
      } catch (e) {
        console.error("❌ Failed loading companies:", e);
        if (!cancelled && initial?.length) {
          setAllRows(initial);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setIsInitialLoad(false);
        }
      }
    })();
    
    return () => {
      cancelled = true;
    };
  }, [initial, isAuthenticated]);

  // ===== My reports transformation =====
  const myRows = useMemo<RatingRow[]>(() => {
    return myReports.map((mr): RatingRow => ({
      company: mr.company_name,
      sector: mr.sector || "—",
      rating: mr.esg_rating || "—",
      year: 2024,
      reportUrl: mr.download_url || "#",
      isin: mr.isin,
      reportFilename: mr.report_filename,
    }));
  }, [myReports]);

  // Show tabs logic
  const showTabs = LOGIN && (SHOW_TABS_FOR_EMPTY_USER || myRows.length > 0);

  // ===== Base rows based on tab =====
  const baseRows = tab === "mine" ? myRows : allRows;

  // ===== Options for filters =====
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

  // ===== Filtered & sorted rows =====
  const filteredRows = useMemo(() => {
    let filtered = baseRows.filter((r) => {
      if (filterCompanies.length && !filterCompanies.includes(r.company)) return false;
      if (filterSectors.length && !filterSectors.includes(r.sector || "—")) return false;
      if (r.year !== filterYear) return false;
      return true;
    });

    if (sortRating) {
      filtered = filtered.sort((a, b) => {
        const aRank = gradeRank(a.rating);
        const bRank = gradeRank(b.rating);
        return sortRating === "asc" ? aRank - bRank : bRank - aRank;
      });
    }

    return filtered;
  }, [baseRows, filterCompanies, filterSectors, filterYear, sortRating]);

  // ===== Load more functionality =====
  const loadMoreRows = useCallback(() => {
    if (loadingMore || !hasMore) return;

    const startIdx = currentPage * PAGE_SIZE;
    const endIdx = startIdx + PAGE_SIZE;
    const moreRows = filteredRows.slice(startIdx, endIdx);

    if (moreRows.length === 0) {
      setHasMore(false);
      return;
    }

    setLoadingMore(true);
    
    // Simulate async loading for smooth UX
    setTimeout(() => {
      setDisplayedRows((prev) => [...prev, ...moreRows]);
      setCurrentPage((prev) => prev + 1);
      setHasMore(endIdx < filteredRows.length);
      setLoadingMore(false);
    }, 300);
  }, [currentPage, filteredRows, loadingMore, hasMore]);

  // ===== Reset when filters change =====
  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    setDisplayedRows(filteredRows.slice(0, PAGE_SIZE));
  }, [filterCompanies, filterSectors, filterYear, sortRating, tab, filteredRows]);

  // ===== Intersection Observer for infinite scroll =====
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !loadingMore && !isInitialLoad) {
          loadMoreRows();
        }
      },
      { threshold: 0.1 }
    );

    const node = loadMoreRef.current;
    if (node) {
      observerRef.current.observe(node);
    }

    return () => {
      if (node) {
        observerRef.current?.unobserve(node);
      }
      observerRef.current?.disconnect();
    };
  }, [hasMore, loadingMore, isInitialLoad, loadMoreRows]);

  // ===== Helpers =====
  const hasReport = (company: string, year: number) => {
    return myReports.some(mr => mr.company_name === company);
  };

  function handleRequest(company: string) {
    if (!LOGIN) return;
    setReqDefaultCompany(company);
    setReqOpen(true);
  }

  function handleShow(row: RatingRow) {
    if (tab === "mine") {
      alert(`Company Details:\nName: ${row.company}\nSector: ${row.sector}\nESG Rating: ${row.rating}\nISIN: ${row.isin || 'N/A'}`);
      return;
    }
    alert("This report requires a download request. Please click Download to request access.");
  }

  // ===== Render =====
  return (
    <section className="w-full">
      {/* Tabs */}
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
        {loading && isInitialLoad ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-teal-600" />
            <span className="ml-3 text-gray-600">Loading companies...</span>
          </div>
        ) : (
          <RatingTable
            rows={displayedRows}
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
            showTabs={showTabs}
            infiniteScroll={true}
            loadingMore={loadingMore}
            hasMore={hasMore}
            loadMoreRef={loadMoreRef as RefObject<HTMLDivElement>}
          />
        )}
      </div>

      {/* Modals */}
      <RequestReportModal
        open={reqOpen}
        onClose={() => setReqOpen(false)}
        defaultCompany={reqDefaultCompany}
        year={filterYear}
        loggedIn={LOGIN}
        companyOptions={companyOptions}
      />
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