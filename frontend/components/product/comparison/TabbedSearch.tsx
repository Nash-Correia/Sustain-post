// components/product/TabbedSearch.tsx
"use client";

import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import { useSearchParams } from "next/navigation";
import SearchableSelect from "@/components/ui/SearchableSelect";
import LoginRequiredModal from "@/components/LoginRequiredModal";
import { useAuth } from "@/components/auth/AuthProvider"; // Import auth hook
import { clsx } from "@/lib/utils";
import { InfoTooltip } from "@/components/ui/InfoTooltip";


export type Tab = "Funds" | "Companies" | "Sectors";

interface TabbedSearchProps {
  fundOptions: string[];
  companyOptions: string[];
  sectorOptions: string[];
  onSelect: (value: string, type: Tab) => void;
  fundData?: { [key: string]: { grade: string } };
  companyData?: { [key: string]: { grade: string } };
  sectorData?: { [key: string]: { grade: string } };
  persistKey?: string;
  requireAuth?: boolean; // New prop to enable/disable auth requirement
}

export type TabbedSearchHandle = {
  select: (type: Tab, value: string) => void;
  clear: (type?: Tab) => void;
  getActiveTab: () => Tab;
};

const DEFAULT_STORAGE_KEY = "tabbed-search-state:v3";

const buildActiveStyles = (): React.CSSProperties & Record<string, string> => ({
  borderBottomColor: "var(--color-login-btn, #10B981)",
  color: "var(--color-login-btn, #10B981)",
  "--tw-ring-color": "var(--color-login-btn, #10B981)",
});

const TabButton = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className={clsx(
      "relative px-4 py-3 text-sm font-semibold border-b-2 transition-all duration-200 focus:outline-none",
      active
        ? "border-brand-action text-brand-action bg-white shadow-sm"
        : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-200"
    )}
    style={active ? buildActiveStyles() : undefined}
  >
    {children}
    {active && (
      <span
        className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-sm"
        style={{ backgroundColor: "var(--color-login-btn, #10B981)" }}
      />
    )}
  </button>
);

type PersistedState = {
  activeTab: Tab;
  selections: { Funds: string; Companies: string; Sectors: string };
};

type SelectionState = "idle" | "url-loading" | "storage-loading" | "ready";

// ================= Storage utilities =================
function safeLoad(key: string): PersistedState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    if (
      parsed &&
      (parsed.activeTab === "Funds" ||
        parsed.activeTab === "Companies" ||
        parsed.activeTab === "Sectors") &&
      parsed.selections &&
      typeof parsed.selections.Funds === "string" &&
      typeof parsed.selections.Companies === "string" &&
      typeof parsed.selections.Sectors === "string"
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function safeSave(key: string, state: PersistedState) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(key, JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
}

// ================= Normalization utilities =================
function normalizeSectorLabel(v: string) {
  return v.replace(/\s+sector$/i, "").trim();
}

function findCanonical(options: string[], raw: string) {
  const needle = raw.toLowerCase();
  return options.find((x) => x.toLowerCase() === needle) ?? "";
}

function ensureInOptions(value: string, options: string[], tab: Tab) {
  if (!value) return "";
  const normalized = tab === "Sectors" ? normalizeSectorLabel(value) : value;
  return findCanonical(options, normalized);
}

// ================= Main Component =================
const TabbedSearch = forwardRef<TabbedSearchHandle, TabbedSearchProps>(function TabbedSearch(
  {
    fundOptions,
    companyOptions,
    sectorOptions,
    onSelect,
    fundData,
    companyData,
    sectorData,
    persistKey = DEFAULT_STORAGE_KEY,
    requireAuth = true, // Default to requiring auth
  },
  ref
) {
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth(); // Get authentication status

  // Login modal state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingSelection, setPendingSelection] = useState<{ tab: Tab; value: string } | null>(null);

  // Core UI state
  const [activeTab, setActiveTab] = useState<Tab>("Funds");
  const [selectedFund, setSelectedFund] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [searchKey, setSearchKey] = useState(0);
  const [loadingState, setLoadingState] = useState<SelectionState>("idle");

  // Refs for coordination
  const initializationPhaseRef = useRef<"pending" | "url-checked" | "storage-checked" | "complete">("pending");
  const lastUrlParamsRef = useRef<string>("");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const isInitialMount = useRef(true);
  const pendingUrlSelectionRef = useRef<{ tab: Tab; value: string } | null>(null);

  // ================= Helper callbacks =================
  const notifyClear = useCallback((tab: Tab) => onSelect("", tab), [onSelect]);

  const getOptionsForTab = useCallback(
    (tab: Tab) => {
      switch (tab) {
        case "Funds":
          return fundOptions;
        case "Companies":
          return companyOptions;
        case "Sectors":
          return sectorOptions;
      }
    },
    [fundOptions, companyOptions, sectorOptions]
  );

  const applySelection = useCallback(
    (tab: Tab, value: string, switchTab = false) => {
      console.log('🎯 applySelection called:', {
        tab,
        value,
        requireAuth,
        isAuthenticated,
        switchTab,
        shouldBlock: requireAuth && !isAuthenticated && value
      });

      // Check authentication before applying selection
      if (requireAuth && !isAuthenticated && value) {
        console.log('🚫 Blocking applySelection - showing login modal');
        setPendingSelection({ tab, value });
        setShowLoginModal(true);
        return "";
      }

      const options = getOptionsForTab(tab);
      const canonical = ensureInOptions(value, options, tab);

      if (switchTab && tab !== activeTab) {
        setActiveTab(tab);
        setSearchKey((k) => k + 1);
      }

      if (tab === "Funds") setSelectedFund(canonical);
      if (tab === "Companies") setSelectedCompany(canonical);
      if (tab === "Sectors") setSelectedSector(canonical);

      if (canonical) {
        onSelect(canonical, tab);
      } else {
        notifyClear(tab);
      }

      return canonical;
    },
    [activeTab, getOptionsForTab, onSelect, notifyClear, requireAuth, isAuthenticated]
  );

  const inferTabFromValue = useCallback(
    (value: string): Tab | null => {
      const normalized = normalizeSectorLabel(value);

      if (
        ensureInOptions(value, sectorOptions, "Sectors") ||
        ensureInOptions(normalized, sectorOptions, "Sectors")
      ) {
        return "Sectors";
      }
      if (ensureInOptions(value, companyOptions, "Companies")) {
        return "Companies";
      }
      if (ensureInOptions(value, fundOptions, "Funds")) {
        return "Funds";
      }
      return null;
    },
    [fundOptions, companyOptions, sectorOptions]
  );

  // Handle successful login - apply pending selection
  useEffect(() => {
    console.log('🔐 Auth effect:', {
      isAuthenticated,
      hasPendingSelection: !!pendingSelection,
      pendingSelection
    });

    if (isAuthenticated && pendingSelection) {
      console.log('✅ User logged in! Applying pending selection...');
      applySelection(pendingSelection.tab, pendingSelection.value, true);
      setPendingSelection(null);
      setShowLoginModal(false);
    }
  }, [isAuthenticated, pendingSelection, applySelection]);

  // Debug: Monitor modal state
  useEffect(() => {
    console.log('🔔 Modal state changed:', {
      showLoginModal,
      pendingSelection,
      requireAuth,
      isAuthenticated
    });
  }, [showLoginModal, pendingSelection, requireAuth, isAuthenticated]);

  /* ====================== URL intent ====================== */
  useEffect(() => {
    const q = (searchParams.get("q") || "").trim();
    const typeParam = (searchParams.get("type") || "").trim();
    const urlKey = `${q}|${typeParam}`;

    const urlChanged = lastUrlParamsRef.current !== urlKey;
    
    if (!q && !typeParam) {
      lastUrlParamsRef.current = urlKey;
      if (initializationPhaseRef.current === "pending") {
        initializationPhaseRef.current = "url-checked";
      }
      return;
    }

    if (urlChanged) {
      lastUrlParamsRef.current = urlKey;
      setLoadingState("url-loading");

      let targetTab: Tab | null =
        typeParam === "Funds" || typeParam === "Companies" || typeParam === "Sectors"
          ? (typeParam as Tab)
          : null;

      if (!targetTab) {
        targetTab = inferTabFromValue(q) || "Sectors";
      }

      pendingUrlSelectionRef.current = { tab: targetTab, value: q };
      
      if (initializationPhaseRef.current !== "complete") {
        initializationPhaseRef.current = "complete";
        isInitialMount.current = false;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  /* ====================== Apply pending when options become available ====================== */
  useEffect(() => {
    const pending = pendingUrlSelectionRef.current;
    if (!pending) return;

    const options = getOptionsForTab(pending.tab);

    if (options.length > 0) {
      applySelection(pending.tab, pending.value, true);
      pendingUrlSelectionRef.current = null;
      setLoadingState("ready");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fundOptions, companyOptions, sectorOptions, getOptionsForTab]);

  /* ====================== SessionStorage ====================== */
  useEffect(() => {
    if (!isInitialMount.current) return;
    if (initializationPhaseRef.current !== "url-checked") return;

    const saved = safeLoad(persistKey);
    initializationPhaseRef.current = "storage-checked";

    if (!saved) {
      setLoadingState("ready");
      initializationPhaseRef.current = "complete";
      isInitialMount.current = false;
      return;
    }

    setLoadingState("storage-loading");

    const vFunds = ensureInOptions(saved.selections.Funds, fundOptions, "Funds");
    const vCompanies = ensureInOptions(saved.selections.Companies, companyOptions, "Companies");
    const vSectors = ensureInOptions(saved.selections.Sectors, sectorOptions, "Sectors");

    setActiveTab(saved.activeTab);
    setSelectedFund(vFunds);
    setSelectedCompany(vCompanies);
    setSelectedSector(vSectors);

    const act = saved.activeTab;
    const v = act === "Funds" ? vFunds : act === "Companies" ? vCompanies : vSectors;
    if (v) onSelect(v, act);
    else notifyClear(act);

    setLoadingState("ready");
    initializationPhaseRef.current = "complete";
    isInitialMount.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persistKey, fundOptions, companyOptions, sectorOptions, onSelect]);

  /* ====================== sessionStorage Persistence ====================== */
  useEffect(() => {
    if (initializationPhaseRef.current !== "complete") return;

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      const state: PersistedState = {
        activeTab,
        selections: {
          Funds: selectedFund,
          Companies: selectedCompany,
          Sectors: selectedSector,
        },
      };
      safeSave(persistKey, state);
    }, 300);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [persistKey, activeTab, selectedFund, selectedCompany, selectedSector]);

  /* ====================== Validate selections ====================== */
  useEffect(() => {
    if (loadingState !== "ready") return;

    if (selectedFund && !findCanonical(fundOptions, selectedFund)) {
      setSelectedFund("");
      if (activeTab === "Funds") notifyClear("Funds");
    }
    if (selectedCompany && !findCanonical(companyOptions, selectedCompany)) {
      setSelectedCompany("");
      if (activeTab === "Companies") notifyClear("Companies");
    }
    if (selectedSector && !findCanonical(sectorOptions, selectedSector)) {
      setSelectedSector("");
      if (activeTab === "Sectors") notifyClear("Sectors");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fundOptions, companyOptions, sectorOptions, loadingState]);

  /* ====================== Derived state ====================== */
  const currentOptions = useMemo(() => {
    switch (activeTab) {
      case "Funds":
        return fundOptions;
      case "Companies":
        return companyOptions;
      case "Sectors":
        return sectorOptions;
      default:
        return [];
    }
  }, [activeTab, fundOptions, companyOptions, sectorOptions]);

  const { selected, setter } = useMemo(() => {
    switch (activeTab) {
      case "Funds":
        return { selected: selectedFund, setter: setSelectedFund };
      case "Companies":
        return { selected: selectedCompany, setter: setSelectedCompany };
      case "Sectors":
        return { selected: selectedSector, setter: setSelectedSector };
    }
  }, [activeTab, selectedFund, selectedCompany, selectedSector]);

  const gradePeek = useMemo(() => {
    if (activeTab === "Funds" && selectedFund && fundData?.[selectedFund]?.grade) {
      return fundData[selectedFund].grade;
    }
    if (activeTab === "Companies" && selectedCompany && companyData?.[selectedCompany]?.grade) {
      return companyData[selectedCompany].grade;
    }
    if (activeTab === "Sectors" && selectedSector && sectorData?.[selectedSector]?.grade) {
      return sectorData[selectedSector].grade;
    }
    return undefined;
  }, [activeTab, selectedFund, selectedCompany, selectedSector, fundData, companyData, sectorData]);

  /* ====================== Handlers ====================== */
  const handleTabSwitch = useCallback(
    (newTab: Tab) => {
      if (newTab === activeTab) return;
      setActiveTab(newTab);
      setSearchKey((k) => k + 1);

      if (newTab === "Funds") {
        selectedFund ? onSelect(selectedFund, "Funds") : notifyClear("Funds");
      } else if (newTab === "Companies") {
        selectedCompany ? onSelect(selectedCompany, "Companies") : notifyClear("Companies");
      } else if (newTab === "Sectors") {
        selectedSector ? onSelect(selectedSector, "Sectors") : notifyClear("Sectors");
      }
    },
    [activeTab, selectedFund, selectedCompany, selectedSector, onSelect, notifyClear]
  );

  const handleSelection = useCallback(
    (value: string) => {
      console.log('🔍 handleSelection called:', {
        value,
        requireAuth,
        isAuthenticated,
        activeTab,
        shouldBlock: requireAuth && !isAuthenticated && value
      });

      // Check authentication before allowing selection
      if (requireAuth && !isAuthenticated && value) {
        console.log('🚫 Blocking selection - showing login modal');
        setPendingSelection({ tab: activeTab, value });
        setShowLoginModal(true);
        return;
      }

      console.log('✅ Allowing selection');
      setter(value);
      onSelect(value, activeTab);
    },
    [setter, onSelect, activeTab, requireAuth, isAuthenticated]
  );

  /* ====================== Imperative API ====================== */
  useImperativeHandle(
    ref,
    (): TabbedSearchHandle => ({
      select: (type: Tab, rawValue: string) => {
        applySelection(type, rawValue, true);
      },
      clear: (type?: Tab) => {
        const t = type ?? activeTab;
        if (t === "Funds") setSelectedFund("");
        if (t === "Companies") setSelectedCompany("");
        if (t === "Sectors") setSelectedSector("");
        onSelect("", t);
      },
      getActiveTab: () => activeTab,
    }),
    [activeTab, applySelection, onSelect]
  );

  const getPlaceholder = () => {
    switch (activeTab) {
      case "Funds":
        return "Search for a Fund...";
      case "Companies":
        return "Search for a Company...";
      case "Sectors":
        return "Search for a Sector...";
      default:
        return "Search...";
    }
  };

  const isLoading = loadingState === "url-loading" || loadingState === "storage-loading";

  return (
    <>
      <div className="space-y-6 z-35">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-brand-dark mb-6">ESG Rating Comparison</h2>

          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-1">
              <TabButton active={activeTab === "Funds"} onClick={() => handleTabSwitch("Funds")}>
                Funds
              </TabButton>
              <TabButton active={activeTab === "Sectors"} onClick={() => handleTabSwitch("Sectors")}>
                Sectors
              </TabButton>
              <TabButton active={activeTab === "Companies"} onClick={() => handleTabSwitch("Companies")}>
                Companies
              </TabButton>
            </nav>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "var(--color-login-btn, #10B981)" }} />
              <span className="text-sm font-medium text-gray-700">Searching in {activeTab}</span>
              {isLoading && (
                <span className="ml-auto text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200 animate-pulse">
                  Loading...
                </span>
              )}
              {!isLoading && gradePeek && (
                <span className="ml-auto text-xs px-2 py-1 rounded-full bg-brand-surface text-brand-dark border border-ui-border">
                  Grade: <b>{gradePeek}</b>
                </span>
              )}
            </div>

            <SearchableSelect
              key={`${activeTab}-${searchKey}`}
              options={currentOptions}
              selected={selected}
              onChange={handleSelection}
              placeholder={getPlaceholder()}
            />

            {currentOptions.length > 0 && (
              <div className="text-xs text-gray-500 flex items-center gap-2">
                {currentOptions.length} {activeTab.toLowerCase()} available
                {activeTab === "Funds" && (
                  <InfoTooltip
                    id="fundCoverage"
                    mode="hover"
                    align="right"
                    panelWidthClass="w-80"
                  />
                )}
                {activeTab === "Companies" && (
                  <InfoTooltip
                    id="companyCoverage"
                    mode="hover"
                    align="right"
                    panelWidthClass="w-80"
                  />
                )}
                {activeTab === "Sectors" && (
                  <InfoTooltip
                    id="sectorCoverage"
                    mode="hover"
                    align="right"
                    panelWidthClass="w-80"
                  />
                )}
              </div>
            )}



            {/* Authentication notice */}
            {/* {requireAuth && !isAuthenticated && (
              <div className="mt-4 p-3 bg-teal-50 border border-teal-200 rounded-lg">
                <p className="text-sm text-teal-700">
                  <span className="font-semibold">Sign in required:</span> Please log in to view detailed ESG ratings and comparison data.
                </p>
              </div>
            )} */}
          </div>
        </div>
      </div>

      {/* Login Required Modal */}
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => {
          console.log('❌ Login modal closed');
          setShowLoginModal(false);
          setPendingSelection(null);
        }}
      />
    </>
  );
});

export default TabbedSearch;