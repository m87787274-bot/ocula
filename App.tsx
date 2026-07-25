import { formatErrorMessage } from "./src/lib/errorUtils";
import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  lazy,
  Suspense,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  SearchState,
  ScanStep,
  VisibilityReport,
  User,
  UserRole,
  ScryTemplate,
  TemplateDefinition,
  EntityInput,
  ScanStatus,
} from "./types";
import { Permission, hasPermission } from "./src/constants/permissions";
import { INDUSTRIES, COMPANY_SIZES } from "./src/constants/industries";
import { analyzeBusinessVisibility } from "./services/aiService";
import { storageService } from "./services/storageService";
import { authService } from "./services/authService";
import AuthModal from "./components/AuthModal";
import BusinessNameInput from "./components/BusinessNameInput";
import { FEATURE_UNIT_COSTS, TIER_CONFIGS } from "./src/constants/pricing";
import OculaLogo from "./components/OculaLogo";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  Globe,
  ArrowRight,
  Zap,
  Shield,
  BarChart3,
  Activity,
  Loader2,
  Menu,
  X,
  LayoutDashboard,
  Target,
  Swords,
  Settings as SettingsIcon,
  CreditCard,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Layers,
  Radar,
  Users,
  Sun,
  Moon,
  HelpCircle,
  Plus,
  Home,
  History,
  MessageSquare,
  RefreshCw,
} from "lucide-react";
// Lazy load components
import Scanner from "./components/Scanner";
import Dashboard from "./components/Dashboard";
const UserDashboard = lazy(() => import("./components/UserDashboard"));
const ScanHistory = lazy(() => import("./components/ScanHistory"));
const GlobalMissionControl = lazy(
  () => import("./components/GlobalMissionControl"),
);
const PricingPage = lazy(() => import("./components/PricingPage"));
const LandingPage = lazy(() => import("./components/LandingPage"));
const FlokkerPreLanding = lazy(() => import("./components/FlokkerPreLanding"));
const CompareEntities = lazy(() => import("./components/CompareEntities"));
const HelpSection = lazy(() => import("./components/HelpSection"));
const OnboardingTour = lazy(() => import("./components/OnboardingTour"));
const Settings = lazy(() => import("./components/Settings"));
const Legal = lazy(() => import("./components/Legal"));
const FeedbackModal = lazy(() => import("./components/FeedbackModal"));
const ManageUsers = lazy(() =>
  import("./components/ManageUsers").then((m) => ({ default: m.ManageUsers })),
);

import SplashScreen from "./components/SplashScreen";
import AppLoadingFallback from "./components/AppLoadingFallback";
import AILoader from "./components/AILoader";

const LoadingFallback = () => <AppLoadingFallback />;

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export { OculaLogo };

const SCRY_TEMPLATES: TemplateDefinition[] = [
  {
    id: "standard",
    name: "Standard Audit",
    description:
      "Comprehensive baseline analysis of your digital footprint and overall market positioning.",
    icon: "🔍",
    focus: "Balanced Overview",
    requiredTier: "free",
  },
  {
    id: "competitor",
    name: "Rival Deep-Dive",
    description:
      "Aggressive focus on identifying competitor weaknesses, market share, and strategic gaps.",
    icon: "⚔️",
    focus: "Competitive Intelligence",
    requiredTier: "growth",
  },
  {
    id: "market",
    name: "Market Trends",
    description:
      "Analyze search volume, emerging industry vectors, and macroeconomic shifts.",
    icon: "📈",
    focus: "Market Growth & Trends",
    requiredTier: "growth",
  },
  {
    id: "social",
    name: "Social Resonance",
    description:
      "Deep analysis of audience engagement, brand sentiment, and viral potential.",
    icon: "📱",
    focus: "Social Authority & Reach",
    requiredTier: "premium",
  },
  {
    id: "gmb",
    name: "GMB Focus",
    description:
      "Deep dive into Google My Business performance, local rankings, and review sentiment.",
    icon: "📍",
    focus: "Local Market Dominance",
    requiredTier: "premium",
  },
];

type ScanAction =
  | { type: "START_SCAN" }
  | { type: "SET_MESSAGE"; message: string; step?: ScanStep }
  | { type: "SET_ERROR"; error: string }
  | {
      type: "SET_COMPLETE";
      report: VisibilityReport;
      reports: VisibilityReport[];
    }
  | { type: "SET_REPORT"; report: VisibilityReport; scanId?: string }
  | { type: "RESET" };

const scanReducer = (state: SearchState, action: ScanAction): SearchState => {
  switch (action.type) {
    case "START_SCAN":
      return {
        ...state,
        status: "scanning",
        isScanning: true,
        step: ScanStep.FINDING_BUSINESS,
        message: "Calibrating Ocula lens...",
        error: null,
        report: null,
        reports: [],
      };
    case "SET_MESSAGE":
      return {
        ...state,
        message: action.message,
        step: action.step ?? state.step,
      };
    case "SET_REPORT":
      return {
        ...state,
        status: "success",
        isScanning: false,
        report: action.report,
        scanId: action.scanId,
        error: null,
      };
    case "SET_ERROR":
      return {
        ...state,
        status: "error",
        isScanning: false,
        error: action.error,
        step: ScanStep.IDLE,
        message: "",
      };
    case "SET_COMPLETE":
      return {
        ...state,
        status: "success",
        isScanning: false,
        step: ScanStep.COMPLETE,
        message: action.reports.length > 1 ? "Comparison Complete" : "Complete",
        report: action.report,
        reports: action.reports,
        error: null,
      };
    case "RESET":
      return {
        status: "idle",
        isScanning: false,
        step: ScanStep.IDLE,
        message: "",
        error: null,
        report: null,
        reports: [],
      };
    default:
      return state;
  }
};

import ErrorBoundary from "./components/ErrorBoundary";

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
};

const AppContent: React.FC = () => {
  const [entities, setEntities] = useState<EntityInput[]>([
    { id: "1", businessName: "", location: "", website: "" },
  ]);
  const [selectedTemplate, setSelectedTemplate] =
    useState<ScryTemplate>("standard");
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [user, setUser] = useState<User | null>(null);
  const [hasNoScans, setHasNoScans] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [view, setView] = useState<
    | "flokker"
    | "landing"
    | "home"
    | "dashboard"
    | "history"
    | "missions"
    | "pricing"
    | "compare"
    | "help"
    | "settings"
    | "users"
    | "legal"
  >("flokker");
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [rescanTarget, setRescanTarget] = useState<{ report: VisibilityReport; scanId?: string } | null>(null);
  const [selectedRescanTemplate, setSelectedRescanTemplate] = useState<ScryTemplate>("standard");
  const [config, setConfig] = useState<{
    openaiApiKey: boolean;
    openaiConfigured: boolean;
    dataForSeoConfigured: boolean;
    githubConfigured: boolean;
  } | null>(null);

  useEffect(() => {
    const initApp = async (retries = 3) => {
      try {
        const response = await fetch("/api/config");
        if (response.ok) {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            setConfig(data);
          } else {
            console.warn("Expected JSON from /api/config but got something else");
          }
        } else {
          throw new Error(`Server responded with ${response.status}`);
        }
      } catch (e) {
        if (retries > 0) {
          console.warn(`Retrying config fetch... (${retries} attempts left)`);
          setTimeout(() => initApp(retries - 1), 1000);
        } else {
          console.error("Failed to fetch app config after retries:", e);
        }
      }
    };
    initApp();
  }, []);

  useEffect(() => {
    const unsubscribe = authService.subscribeToAuth(async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await storageService.getUser(firebaseUser.uid);
        setUser(userData);
      } else {
        setUser(null);
      }
      setIsInitialLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isInitialLoading) return;

    if (user) {
      if (view === "landing") {
        const checkUserScans = async () => {
          const scans = await storageService.getScans(user.id);
          setHasNoScans(scans.length === 0);
          setView(scans.length > 0 ? "dashboard" : "home");
        };
        checkUserScans();
      }
    } else {
      const protectedViews = [
        "dashboard",
        "history",
        "missions",
        "compare",
        "settings",
        "users",
      ];
      if (protectedViews.includes(view)) {
        setView("landing");
      }
    }
  }, [user, view, isInitialLoading]);

  const [initialTab, setInitialTab] = useState<
    | "overview"
    | "intelligence"
    | "missions"
    | "social"
    | "rivals"
    | "competitors"
    | "monitor"
    | "executive"
    | "kpis"
  >("overview");
  const navigate = useNavigate();
  const [state, dispatch] = React.useReducer(scanReducer, {
    status: "idle",
    isScanning: false,
    step: ScanStep.IDLE,
    message: "",
    error: null,
    report: null,
    reports: [],
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved ? saved === "true" : false;
  });

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);
  const [isAuthReady, setIsAuthReady] = useState(true);

  const [widgets, setWidgets] = useState([
    { id: "overviewStats", name: "Performance Pulse", visible: true },
    { id: "marketVelocity", name: "Market Velocity", visible: true },
    { id: "visibilityProjection", name: "Visibility Projector", visible: true },
    { id: "searchVisibility", name: "Search visibility", visible: true },
    { id: "rivalSnapshot", name: "Competitor Analysis", visible: true },
    { id: "competitorWatchlist", name: "Rival Watchlist", visible: true },
    { id: "strategicInsights", name: "Strategic Insights", visible: true },
    { id: "marketHub", name: "Market Dominance Hub", visible: true },
    { id: "profile", name: "Business Profile", visible: true },
    { id: "swot", name: "Strategic SWOT", visible: true },
    { id: "keywords", name: "Keyword Intelligence", visible: true },
    { id: "socialIntelligence", name: "Social Command", visible: true },
    { id: "radar", name: "Radar Synthesis", visible: true },
    { id: "keywordMatrix", name: "Opportunity Matrix", visible: true },
    { id: "marketTreemap", name: "Market distribution", visible: true },
    { id: "usage", name: "Intelligence Credits", visible: true },
    { id: "support", name: "Expert Support", visible: true },
  ]);

  useEffect(() => {
    const hasOnboarded = localStorage.getItem("ocula_onboarding_complete");
    if (!hasOnboarded) {
      setShowOnboarding(true);
    }
  }, []);

  useEffect(() => {
    // Artificial delay for splash screen experience
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem("theme")) {
        setIsDarkMode(e.matches);
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    // Sync with AI Studio is no longer needed in the frontend
    // as we use server-side API keys.
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setView("landing");
      setIsMobileMenuOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleSelectKey = async () => {
    // Re-select key if needed, though server-side is preferred
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      // Trigger a config re-fetch or just assume it's set
      window.location.reload();
    }
  };

  const NavItem = ({
    icon: Icon,
    label,
    active,
    onClick,
    collapsed,
  }: {
    icon: any;
    label: string;
    active: boolean;
    onClick: () => void;
    collapsed: boolean;
  }) => (
    <button
      onClick={onClick}
      data-sidebar-item
      className={`relative w-full flex items-center py-2.5 rounded-xl transition-all duration-300 group ${
        active
          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xl shadow-slate-900/10 dark:shadow-white/5"
          : "text-slate-500 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
      } ${collapsed ? "justify-center px-0" : "px-4"}`}
    >
      {active && (
        <motion.div
           layoutId="activeSidebarIndicator"
           className="absolute left-0 w-1 h-4 bg-indigo-500 dark:bg-indigo-400 rounded-full"
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
        />
      )}
      <div
        className={`flex items-center justify-center transition-transform ${collapsed ? "w-full" : "w-5"} ${active ? "" : "group-hover:scale-110"}`}
      >
        <Icon
          className={`w-4 h-4 shrink-0`}
        />
      </div>
      <span
        className={`text-[9.5px] font-black uppercase tracking-[0.1em] whitespace-nowrap overflow-hidden transition-all duration-300 ${collapsed ? "max-w-0 opacity-0 ml-0" : "max-w-[200px] opacity-100 ml-4"}`}
      >
        {label}
      </span>
      {collapsed && (
        <div className="absolute left-full ml-4 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-[120] whitespace-nowrap shadow-2xl border border-white/10 dark:border-slate-200 -translate-x-2 group-hover:translate-x-0">
          {label}
          <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-inherit rotate-45 border-l border-b border-white/10 dark:border-slate-200"></div>
        </div>
      )}
    </button>
  );

  const startScan = async (
    e?: React.FormEvent,
    options?: {
      force?: boolean;
      overrideEntities?: EntityInput[];
      overrideTemplate?: ScryTemplate;
    },
  ) => {
    if (e) e.preventDefault();

    const scanEntities =
      options?.overrideEntities ||
      entities.filter((ent) => ent.businessName.trim() !== "");
    const scanTemplate = options?.overrideTemplate || selectedTemplate;

    // Auth Check: Allow 1 free scan for guests, then require pricing
    const hasScanned =
      typeof window !== "undefined" &&
      localStorage.getItem("ocula_has_scanned");

    if (!user && hasScanned) {
      setView("pricing");
      return;
    }

    if (scanEntities.length === 0) return;

    // API Key Check: Ensure we have at least one provider configured
    if (!config || (!config.openaiApiKey && !config.openaiConfigured)) {
        dispatch({
            type: "SET_ERROR",
            error: "No AI API key configured. Please configure an API key in settings.",
        });
        return;
    }

    // Unit Check: Ensure user has enough units for a scan (only for logged in users)
    const scanCost = FEATURE_UNIT_COSTS.VISIBILITY_SCAN * scanEntities.length;
    if (user && user.account && user.account.unitsRemaining < scanCost) {
      dispatch({
        type: "SET_ERROR",
        error: `Insufficient Units. This scan requires ${scanCost} Units. You have ${user.account.unitsRemaining} Units remaining.`,
      });
      return;
    }

    // Tier Limit Check: Ensure user hasn't exceeded their scan limit (only for logged in users)
    if (user && !options?.force) {
      const tierConfig = TIER_CONFIGS[user.account.tier];
      const scans = await storageService.getScans();
      const currentScanCount =
        user.account.tier === "free"
          ? user.account.totalScans || 0
          : scans.length;

      if (currentScanCount + scanEntities.length > tierConfig.limits.scans) {
        dispatch({
          type: "SET_ERROR",
          error: `Scan Limit Reached. The ${tierConfig.name} tier is limited to ${tierConfig.limits.scans} scan(s). Please upgrade to continue.`,
        });
        setTimeout(() => setView("pricing"), 3000);
        return;
      }
    }

    setView("home");
    dispatch({ type: "START_SCAN" });

    try {
      // Simulate steps for better UX
      const steps = [
        { msg: "Calibrating Sensors...", step: ScanStep.FINDING_BUSINESS },
        { msg: "Market Scouring...", step: ScanStep.LOCAL_PRESENCE },
        { msg: "Ground Trace...", step: ScanStep.SOCIAL_SIGNALS },
        { msg: "Rival Recon...", step: ScanStep.CONTENT_ANALYSIS },
        { msg: "Intelligence Sync...", step: ScanStep.GENERATING_REPORT },
        { msg: "Assembling Dossier...", step: ScanStep.COMPLETE }
      ];

      // Initial message
      dispatch({ type: "SET_MESSAGE", message: steps[0].msg, step: steps[0].step });

      // Start the actual analysis sequentially to avoid rate limits
      const reports: VisibilityReport[] = [];
      const failures: any[] = [];
      let currentStep = 0;

      const stepInterval = setInterval(() => {
        if (currentStep < steps.length - 1) {
          currentStep++;
          dispatch({ 
            type: "SET_MESSAGE", 
            message: steps[currentStep].msg, 
            step: steps[currentStep].step 
          });
        } else {
          dispatch({ 
            type: "SET_MESSAGE", 
            message: "Assembling Dossier...", 
            step: steps[currentStep].step 
          });
        }
      }, 350);

      try {
        for (const entity of scanEntities) {
          let retries = 1;
          let success = false;
          while (retries > 0) {
            try {
                const result = await Promise.race([
                  analyzeBusinessVisibility(
                    entity.businessName,
                    entity.location,
                    entity.website,
                    scanTemplate,
                    entity.industry,
                    entity.companySize,
                  ),
                  new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Scan timed out')), 15000))
                ]);
                
                if (typeof result !== 'object' || result === null) {
                    throw new Error('Invalid response from scan tool');
                }
                
                const report = result as VisibilityReport;
                reports.push(report);
                success = true;
                break;
            } catch (error: any) {
                // Safely extract error message from axios response
                const errorMessage = error.response?.data?.error || (error instanceof Error ? error.message : String(error || '')) || 'An unknown error occurred';
                const isQuotaError = errorMessage.includes('429') || errorMessage.includes('exceeded') || error?.response?.status === 429;
                
                if (retries > 1) {
                  retries--;
                  console.warn(`Scan failed for ${entity.businessName}. Pausing scans for 30s before retrying. ${retries} retries left.`);
                  await new Promise(r => setTimeout(r, 30000));
                  continue;
                }
                console.error(`Scan failed for ${entity.businessName}:`, error);
                failures.push(errorMessage);
                break;
            }
          }
        }
        
        if (reports.length === 0) {
          throw new Error('All scans failed or timed out.');
        }

        if (user) {
          await storageService.updateUserUnits(
            scanCost * (reports.length / scanEntities.length),
            reports.length,
          );
          
          const refreshedUser = await storageService.getUser();
          if (refreshedUser) setUser(refreshedUser);
  
          for (const report of reports) {
            report.focusMode = scanTemplate;
            await storageService.saveScan(
              report.businessName,
              report.overallScore,
              report,
            );
          }
        } else if (typeof window !== "undefined") {
          localStorage.setItem("ocula_has_scanned", "true");
        }

        setInitialTab("overview");
        dispatch({ type: "SET_COMPLETE", report: reports[0], reports });
        if (reports.length > 1) {
          setView("compare");
        }
        navigate("/");
        
      } finally {
        clearInterval(stepInterval);
      }
    } catch (error: any) {
      const errorMessage = formatErrorMessage(error, "Scan failed.");
      const isKeyError = errorMessage === "RESELECT_KEY" || errorMessage === "API_KEY_ERROR" || errorMessage.includes("API_KEY_ERROR");
      
      dispatch({
        type: "SET_ERROR",
        error: isKeyError
          ? "Valid API Key required for deep scrying. Please check your configuration."
          : errorMessage,
      });
    }
  };

  const handleReset = useCallback(() => {
    dispatch({ type: "RESET" });
    setEntities([
      {
        id: "1",
        businessName: "",
        location: "",
        website: "",
        industry: "",
        companySize: "",
      },
    ]);
    setSelectedTemplate("standard");
    setView("home");
    navigate("/");
  }, [navigate]);

  const handleRescan = useCallback(
    async (customReport?: VisibilityReport, customScanId?: string) => {
      const reportToScan =
        customReport && customReport.businessName ? customReport : state.report;
      const scanIdToScan =
        customScanId !== undefined ? customScanId : state.scanId;

      if (!reportToScan) return;

      setRescanTarget({ report: reportToScan, scanId: scanIdToScan });
      setSelectedRescanTemplate((reportToScan.focusMode as ScryTemplate) || "standard");
    },
    [state.report, state.scanId],
  );

  const executeRescan = useCallback(async () => {
    if (!rescanTarget) return;
    const { report: reportToScan, scanId: scanIdToScan } = rescanTarget;

    setRescanTarget(null);

    // Delete the old scan if it exists so we don't hit limits unnecessarily
    if (scanIdToScan) {
      await storageService.deleteScan(scanIdToScan);
    }

    setSelectedTemplate(selectedRescanTemplate);

    startScan(undefined, {
      force: true,
      overrideEntities: [
        {
          id: "1",
          businessName: reportToScan.businessName,
          location: reportToScan.profileBadge?.location || "",
          website: reportToScan.website || "",
        },
      ],
      overrideTemplate: selectedRescanTemplate,
    });
  }, [rescanTarget, selectedRescanTemplate, startScan]);

  const handleSidebarKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const items = Array.from(
        e.currentTarget.querySelectorAll("[data-sidebar-item]"),
      ) as HTMLElement[];
      const activeElement = document.activeElement as HTMLElement;
      const currentIndex = items.indexOf(activeElement);

      let nextIndex;
      if (e.key === "ArrowDown") {
        nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % items.length;
      } else {
        nextIndex =
          currentIndex === -1
            ? items.length - 1
            : (currentIndex - 1 + items.length) % items.length;
      }

      items[nextIndex].focus();
    }
  };

  if (isInitialLoading || !isAuthReady) {
    return <SplashScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 flex">
      <Suspense fallback={<LoadingFallback />}>
        {/* Sidebar for Logged-in Users */}
        {user && view !== "landing" && (
          <>
            {/* Mobile Overlay */}
            <AnimatePresence>
              {isMobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[105] md:hidden"
                />
              )}
            </AnimatePresence>

        <aside
          className={`flex flex-col fixed inset-y-0 left-0 z-[110] bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-xl border-r border-slate-200/60 dark:border-slate-800/60 shadow-xl transition-all duration-500 md:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} ${isSidebarCollapsed ? "w-16 xl:w-20" : "w-[240px] xl:w-[280px]"}`}
        >
              <div className="p-4 flex items-center border-b border-slate-100 dark:border-slate-800/50 h-16 overflow-hidden">
                <div
                  className={`flex items-center cursor-pointer transition-all duration-500 ${isSidebarCollapsed ? "mx-auto" : "gap-3"}`}
                  onClick={() => {
                    setView("landing");
                    handleReset();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <OculaLogo className="w-8 h-8 shrink-0 text-indigo-600 dark:text-white micro-bounce" />
                  <span
                    className={`text-xl font-display font-bold tracking-tight whitespace-nowrap transition-all duration-500 ${isSidebarCollapsed ? "max-w-0 opacity-0" : "max-w-[100px] opacity-100"}`}
                  >
                    ocula
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`md:hidden p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white ml-auto transition-opacity duration-300 ${isSidebarCollapsed ? "opacity-0 hidden" : "opacity-100"}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div
                className="flex-1 p-4 space-y-6 overflow-y-auto custom-scrollbar"
                onKeyDown={handleSidebarKeyDown}
              >
                {/* Persistent CTA */}
                {hasPermission(user?.role, Permission.INITIATE_SCAN) && (
                  <div
                    className={`transition-all duration-500 mb-2 ${isSidebarCollapsed ? "px-0" : "px-2"}`}
                  >
                    <button
                      onClick={() => {
                        handleReset();
                        setView("home");
                        setIsMobileMenuOpen(false);
                      }}
                      data-sidebar-item
                      className={`w-full group relative flex items-center justify-center gap-3 overflow-hidden rounded-2xl bg-indigo-600 font-display font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] hover:shadow-indigo-500/40 active:scale-95 ${isSidebarCollapsed ? "h-12 w-12 p-0 rounded-xl" : "p-4"}`}
                      title={isSidebarCollapsed ? "New Scan" : ""}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                      <Plus className="w-5 h-5 shrink-0" />
                      {!isSidebarCollapsed && (
                        <span className="text-xs">New Scan</span>
                      )}
                    </button>
                  </div>
                )}

                {/* Intelligence Section */}
                <div className="space-y-2">
                  <p
                    className={`text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.25em] px-4 transition-all duration-500 overflow-hidden whitespace-nowrap ${isSidebarCollapsed ? "max-h-0 opacity-0 mb-0" : "max-h-10 opacity-100 mb-2 mt-4"}`}
                  >
                    Intelligence
                  </p>
                  {hasPermission(user?.role, Permission.VIEW_DASHBOARD) && (
                    <div className="relative space-y-1">
                      <NavItem
                        icon={LayoutDashboard}
                        label="Dashboard"
                        active={
                          view === "dashboard" ||
                          (view === "home" && !!state.report)
                        }
                        onClick={() => {
                          setView("dashboard");
                          setIsMobileMenuOpen(false);
                        }}
                        collapsed={isSidebarCollapsed}
                      />
                      <NavItem
                        icon={History}
                        label="Scan History"
                        active={view === "history"}
                        onClick={() => {
                          setView("history");
                          setIsMobileMenuOpen(false);
                        }}
                        collapsed={isSidebarCollapsed}
                      />
                    </div>
                  )}
                  <div
                    id="nav-dashboard"
                    className="absolute inset-0 pointer-events-none"
                  />
                </div>
                <div className="relative space-y-1">
                  {hasPermission(user?.role, Permission.COMPARE_ENTITIES) && (
                    <NavItem
                      icon={Radar}
                      label="Compare"
                      active={view === "compare"}
                      onClick={() => {
                        setView("compare");
                        setIsMobileMenuOpen(false);
                      }}
                      collapsed={isSidebarCollapsed}
                    />
                  )}
                  <div
                    id="nav-compare"
                    className="absolute inset-0 pointer-events-none"
                  />
                </div>

                {/* Operations Section */}
                <div className="space-y-2">
                  <p
                    className={`text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.25em] px-4 transition-all duration-500 overflow-hidden whitespace-nowrap ${isSidebarCollapsed ? "max-h-0 opacity-0 mb-0" : "max-h-10 opacity-100 mb-2 mt-4"}`}
                  >
                    Operations
                  </p>
                  <div className="relative space-y-1">
                    {hasPermission(user?.role, Permission.MANAGE_MISSIONS) && (
                      <NavItem
                        icon={Target}
                        label="Missions"
                        active={view === "missions"}
                        onClick={() => {
                          setView("missions");
                          setIsMobileMenuOpen(false);
                        }}
                        collapsed={isSidebarCollapsed}
                      />
                    )}
                    <div
                      id="nav-missions"
                      className="absolute inset-0 pointer-events-none"
                    />
                    {hasPermission(user?.role, Permission.VIEW_PRICING) && (
                      <NavItem
                        icon={CreditCard}
                        label="Pricing"
                        active={view === "pricing"}
                        onClick={() => {
                          setView("pricing");
                          setIsMobileMenuOpen(false);
                        }}
                        collapsed={isSidebarCollapsed}
                      />
                    )}
                  </div>
                </div>

                {/* System Section */}
                <div className="space-y-2">
                  <p
                    className={`text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.25em] px-4 transition-all duration-500 overflow-hidden whitespace-nowrap ${isSidebarCollapsed ? "max-h-0 opacity-0 mb-0" : "max-h-10 opacity-100 mb-2 mt-4"}`}
                  >
                    System
                  </p>
                  <div className="space-y-1">
                    {hasPermission(user?.role, Permission.MANAGE_USERS) && (
                      <NavItem
                        icon={Users}
                        label="Manage Users"
                        active={view === "users"}
                        onClick={() => {
                          setView("users");
                          setIsMobileMenuOpen(false);
                        }}
                        collapsed={isSidebarCollapsed}
                      />
                    )}
                    {hasPermission(user?.role, Permission.VIEW_HELP) && (
                      <NavItem
                        icon={HelpCircle}
                        label="Help & Support"
                        active={view === "help"}
                        onClick={() => {
                          setView("help");
                          setIsMobileMenuOpen(false);
                        }}
                        collapsed={isSidebarCollapsed}
                      />
                    )}
                    <NavItem
                      icon={isDarkMode ? Sun : Moon}
                      label={isDarkMode ? "Light Mode" : "Dark Mode"}
                      active={false}
                      onClick={() => setIsDarkMode(!isDarkMode)}
                      collapsed={isSidebarCollapsed}
                    />
                    <NavItem
                      icon={MessageSquare}
                      label="Feedback"
                      active={false}
                      onClick={() => setIsFeedbackOpen(true)}
                      collapsed={isSidebarCollapsed}
                    />
                    <NavItem
                      icon={Shield}
                      label="Legal"
                      active={view === "legal"}
                      onClick={() => {
                        setView("legal");
                        setIsMobileMenuOpen(false);
                      }}
                      collapsed={isSidebarCollapsed}
                    />
                    {hasPermission(user?.role, Permission.EDIT_SETTINGS) && (
                      <NavItem
                        icon={SettingsIcon}
                        label="Settings"
                        active={view === "settings"}
                        onClick={() => {
                          setView("settings");
                          setIsMobileMenuOpen(false);
                        }}
                        collapsed={isSidebarCollapsed}
                      />
                    )}
                    <NavItem
                      icon={LogOut}
                      label="Logout"
                      active={false}
                      onClick={handleLogout}
                      collapsed={isSidebarCollapsed}
                    />
                  </div>
                </div>
              </div>

              <div
                className={`py-4 border-t border-slate-100 dark:border-slate-800/50 hidden md:block transition-all duration-300 ${isSidebarCollapsed ? "px-2" : "px-4"}`}
              >
                <button
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="w-full flex items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  title={
                    isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"
                  }
                >
                  {isSidebarCollapsed ? (
                    <ChevronRight className="w-5 h-5" />
                  ) : (
                    <ChevronLeft className="w-5 h-5" />
                  )}
                </button>
              </div>
            </aside>
          </>
        )}

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={(u) => {
            setUser(u);
            setIsAuthModalOpen(false);
            setView("home");
          }}
        />

        {/* Mobile Header for Logged-in Users */}
        {user && view !== "landing" && (
          <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-[100] flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 -ml-2 text-slate-600 dark:text-slate-400"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div
                className="flex items-center gap-2"
                onClick={() => setView("dashboard")}
              >
                <OculaLogo className="w-6 h-6 text-indigo-600 dark:text-white" />
                <span className="text-lg font-display font-bold tracking-tight">
                  ocula
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {hasPermission(user?.role, Permission.INITIATE_SCAN) && (
                <button
                  onClick={() => {
                    handleReset();
                    setView("home");
                  }}
                  className="p-2 rounded-lg bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 active:scale-90 transition-transform"
                  title="New Scan"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </button>
              <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
                <img
                  src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </header>
        )}

        {/* Top Navigation for Landing/Guest */}
        {(!user && view !== "landing" && view !== "flokker") && (
          <nav
            className="fixed top-0 left-0 right-0 z-[100] transition-all duration-500 glass dark:dark-glass py-4 shadow-sm border-b border-slate-200/50 dark:border-slate-800/50"
          >
            <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
              <div
                className="flex items-center space-x-4 cursor-pointer group"
                onClick={() => {
                  setView("landing");
                  handleReset();
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <OculaLogo
                      className="w-8 h-8 text-indigo-600 dark:text-white micro-bounce"
                      color="#4f46e5"
                    />
                    <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                  <span
                    className="text-xl font-display font-bold tracking-tight text-slate-900 dark:text-white"
                  >
                    ocula
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setView("help")}
                  className={`text-[10px] font-mono font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-all ${view === "help" ? "text-slate-900 dark:text-white bg-slate-100 dark:bg-white/10" : "text-slate-500 hover:text-slate-900 dark:text-white/70 dark:hover:text-white"}`}
                >
                  Support
                </button>
                <button
                  onClick={() => setView("pricing")}
                  className="text-[10px] font-mono font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-all text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  Pricing
                </button>
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-2.5 rounded-xl transition-all hover:scale-105 active:scale-95 bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  {isDarkMode ? (
                    <Sun className="w-4 h-4" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}
                </button>
                {user ? (
                  <button
                    onClick={() => setView("dashboard")}
                    className="group flex items-center gap-3 glass dark:dark-glass p-1.5 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 transition-all hover:scale-105 active:scale-95"
                  >
                    <div className="w-7 h-7 rounded-lg overflow-hidden shadow-inner bg-slate-100">
                      <img
                        src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest hidden sm:inline-block text-slate-900 dark:text-white">
                      {user.name.split(" ")[0]}
                    </span>
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setView("home")}
                      className="px-5 py-2.5 rounded-xl font-mono font-bold text-xs transition-all hover:scale-105 active:scale-95 text-slate-600 hover:bg-slate-100 dark:text-white dark:hover:bg-white/10"
                    >
                      Get Started
                    </button>
                  </div>
                )}
              </div>
            </div>
          </nav>
        )}

        {/* Mobile Nav for all */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-2 pt-2 pb-4 flex justify-around items-center shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
          <button
            onClick={() => setView("landing")}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${view === "landing" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
          >
            <Globe
              className={`w-5 h-5 ${view === "landing" ? "fill-indigo-100 dark:fill-indigo-900/30" : ""}`}
            />
            <span className="text-[10px] font-bold tracking-wide">Home</span>
          </button>

          {!user && (
            <button
              onClick={() => setView("help")}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${view === "help" ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
            >
              <HelpCircle
                className={`w-5 h-5 ${view === "help" ? "fill-blue-100 dark:fill-blue-900/30" : ""}`}
              />
              <span className="text-[10px] font-bold tracking-wide">
                Support
              </span>
            </button>
          )}

          {user && (
            <>
              <button
                onClick={() => setView("dashboard")}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${view === "dashboard" ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
              >
                <LayoutDashboard
                  className={`w-5 h-5 ${view === "dashboard" ? "fill-blue-100 dark:fill-blue-900/30" : ""}`}
                />
                <span className="text-[10px] font-bold tracking-wide">
                  Dash
                </span>
              </button>
              <button
                onClick={() => {
                  handleReset();
                  setView("home");
                }}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${view === "home" ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
              >
                <Search
                  className={`w-5 h-5 ${view === "home" ? "fill-blue-100 dark:fill-blue-900/30" : ""}`}
                />
                <span className="text-[10px] font-bold tracking-wide">
                  Scry
                </span>
              </button>
              <button
                onClick={() => setView("missions")}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${view === "missions" ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
              >
                <Target
                  className={`w-5 h-5 ${view === "missions" ? "fill-blue-100 dark:fill-blue-900/30" : ""}`}
                />
                <span className="text-[10px] font-bold tracking-wide">
                  Missions
                </span>
              </button>
              <button
                onClick={() => setView("help")}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${view === "help" ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
              >
                <HelpCircle
                  className={`w-5 h-5 ${view === "help" ? "fill-blue-100 dark:fill-blue-900/30" : ""}`}
                />
                <span className="text-[10px] font-bold tracking-wide">
                  Support
                </span>
              </button>
            </>
          )}
          {!user && (
            <button
              onClick={() => setView("home")}
              className="flex flex-col items-center gap-1 p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
            >
              <Search className="w-5 h-5" />
              <span className="text-[10px] font-bold tracking-wide">Scry</span>
            </button>
          )}
        </nav>

        <main
          className={`relative z-10 min-h-screen flex-1 overflow-x-hidden transition-all duration-300 pb-24 md:pb-0 ${user && view !== "landing" && view !== "flokker" ? (isSidebarCollapsed ? "md:ml-16 xl:ml-20 pt-14 md:pt-0" : "md:ml-[240px] xl:ml-[280px] pt-14 md:pt-0") : ""}`}
        >
          <div className="max-w-[1920px] mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-12">
            <AnimatePresence mode="wait">
              <Suspense
                fallback={
                  <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/10 backdrop-blur-[2px]">
                    <AILoader message="Initializing Tour..." />
                  </div>
                }
              >
                {showOnboarding && (
                  <OnboardingTour
                    onComplete={() => setShowOnboarding(false)}
                    widgets={widgets}
                    setWidgets={setWidgets}
                    selectedTemplate={selectedTemplate}
                    onSetTemplate={setSelectedTemplate}
                    currentView={view}
                    setView={setView}
                    user={user}
                  />
                )}
              </Suspense>
            </AnimatePresence>

            {user && view !== "landing" && view !== "flokker" && (
              <div className="flex items-center gap-2 px-4 sm:px-6 py-4 text-sm text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800/50 bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-md sticky top-14 md:top-0 z-40">
                <button
                  onClick={() => {
                    setView("dashboard");
                    handleReset();
                  }}
                  className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1"
                >
                  <Home className="w-4 h-4" />
                  Home
                </button>

                {view === "dashboard" && (
                  <>
                    <ChevronRight className="w-4 h-4" />
                    <span className="font-semibold text-slate-900 dark:text-white">
                      Dashboard
                    </span>
                  </>
                )}

                {view === "home" && (
                  <>
                    {state.report ? (
                      <>
                        <ChevronRight className="w-4 h-4" />
                        <button
                          onClick={() => {
                            setView("dashboard");
                            handleReset();
                          }}
                          className="hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                          Dashboard
                        </button>
                        <ChevronRight className="w-4 h-4" />
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {state.report.businessName || "Report"}
                        </span>
                      </>
                    ) : (
                      <>
                        <ChevronRight className="w-4 h-4" />
                        <span className="font-semibold text-slate-900 dark:text-white">
                          New Scan
                        </span>
                      </>
                    )}
                  </>
                )}

                {view === "missions" && (
                  <>
                    <ChevronRight className="w-4 h-4" />
                    <span className="font-semibold text-slate-900 dark:text-white">
                      Missions
                    </span>
                  </>
                )}

                {view === "compare" && (
                  <>
                    <ChevronRight className="w-4 h-4" />
                    <span className="font-semibold text-slate-900 dark:text-white">
                      Compare Entities
                    </span>
                  </>
                )}

                {view === "users" && (
                  <>
                    <ChevronRight className="w-4 h-4" />
                    <span className="font-semibold text-slate-900 dark:text-white">
                      Manage Users
                    </span>
                  </>
                )}

                {view === "settings" && (
                  <>
                    <ChevronRight className="w-4 h-4" />
                    <span className="font-semibold text-slate-900 dark:text-white">
                      Settings
                    </span>
                  </>
                )}

                {view === "help" && (
                  <>
                    <ChevronRight className="w-4 h-4" />
                    <span className="font-semibold text-slate-900 dark:text-white">
                      Help & Support
                    </span>
                  </>
                )}

                {view === "pricing" && (
                  <>
                    <ChevronRight className="w-4 h-4" />
                    <span className="font-semibold text-slate-900 dark:text-white">
                      Pricing
                    </span>
                  </>
                )}

                {view === "legal" && (
                  <>
                    <ChevronRight className="w-4 h-4" />
                    <span className="font-semibold text-slate-900 dark:text-white">
                      Legal
                    </span>
                  </>
                )}

                <div className="ml-auto hidden md:flex items-center gap-3">
                  <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all border border-slate-200/50 dark:border-slate-800/50 shadow-sm"
                    title={isDarkMode ? "Light Mode" : "Dark Mode"}
                  >
                    {isDarkMode ? (
                      <Sun className="w-4 h-4" />
                    ) : (
                      <Moon className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {view === "flokker" ? (
              <FlokkerPreLanding
                user={user}
                onLaunchOculaBI={(businessName, industry) => {
                  if (businessName) {
                    setView("home");
                    const initialEntity = {
                      id: "1",
                      businessName,
                      industry: industry || "",
                      companySize: "",
                      location: "",
                      website: "",
                    };
                    setEntities([initialEntity]);
                    setTimeout(() => {
                      startScan(undefined, {
                        overrideEntities: [initialEntity],
                      });
                    }, 100);
                  } else {
                    setView("landing");
                  }
                }}
                onLogin={() => setIsAuthModalOpen(true)}
                onGoToDashboard={() => setView("dashboard")}
                onViewPricing={() => setView("pricing")}
                onViewLegal={() => setView("legal")}
                onGiveFeedback={() => setIsFeedbackOpen(true)}
                isDarkMode={isDarkMode}
                onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
              />
            ) : view === "landing" ? (
              <LandingPage
                user={user}
                onStartAudit={(businessName, industry, companySize) => {
                  setView("home");
                  if (businessName) {
                    const initialEntity = {
                      id: "1",
                      businessName,
                      industry: industry || "",
                      companySize: companySize || "",
                      location: "",
                      website: "",
                    };
                    setEntities([initialEntity]);
                    setTimeout(() => {
                      startScan(undefined, {
                        overrideEntities: [initialEntity],
                      });
                    }, 100);
                  }
                }}
                onLogin={() => setIsAuthModalOpen(true)}
                onViewPricing={() => setView("pricing")}
                onGoToDashboard={() => setView("dashboard")}
                onViewLegal={() => setView("legal")}
                onGiveFeedback={() => setIsFeedbackOpen(true)}
                onGoToFlokker={() => setView("flokker")}
              />
            ) : view === "pricing" ? (
              <PricingPage
                user={user}
                isDarkMode={isDarkMode}
                onBack={() => setView("landing")}
                onLoginRequired={() => setIsAuthModalOpen(true)}
                currentTier={user?.account?.tier}
                onSelectTier={async (t) => {
                  if (user) {
                    const config = TIER_CONFIGS[t];
                    const updatedUser: User = {
                      ...user,
                      account: {
                        ...user.account,
                        tier: t,
                        unitsTotal: config.units,
                        unitsRemaining: config.units,
                        unitsUsed: 0,
                        renewalDate: new Date(
                          Date.now() + 30 * 24 * 60 * 60 * 1000,
                        ).toISOString(),
                      },
                    };
                    await storageService.setUser(updatedUser);
                    setUser(updatedUser);
                    setView("dashboard");
                  }
                }}
              />
            ) : view === "dashboard" && user ? (
              <UserDashboard
                user={user}
                isDarkMode={isDarkMode}
                onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
                onLogout={handleLogout}
                onSelectScan={(r, tab, id) => {
                  dispatch({ type: "SET_REPORT", report: r, scanId: id });
                  setInitialTab(tab || "overview");
                  setView("home");
                }}
                onNewScan={handleReset}
                onRescan={(r, id) => handleRescan(r, id)}
                onGoToMissions={() => setView("missions")}
                onUpdateUser={async (u) => {
                  await storageService.setUser(u);
                  setUser(u);
                }}
              />
            ) : view === "history" && user ? (
              <ScanHistory
                user={user}
                isDarkMode={isDarkMode}
                onSelectScan={(r, tab, id) => {
                  dispatch({ type: "SET_REPORT", report: r, scanId: id });
                  setInitialTab(tab || "overview");
                  setView("home");
                }}
                onNewScan={handleReset}
                onRescan={(r, id) => handleRescan(r, id)}
              />
            ) : view === "missions" && user ? (
              <GlobalMissionControl
                onBack={() => setView("dashboard")}
                isDarkMode={isDarkMode}
                onSelectScan={(r, id) => {
                  dispatch({ type: "SET_REPORT", report: r, scanId: id });
                  setInitialTab("missions");
                  setView("home");
                }}
              />
            ) : view === "compare" && user ? (
              <CompareEntities
                user={user}
                isDarkMode={isDarkMode}
                onBack={() => setView("dashboard")}
                onUpdateUser={async (u) => {
                  await storageService.setUser(u);
                  setUser(u);
                }}
                initialReports={state.reports}
              />
            ) : view === "help" ? (
              <Suspense fallback={<LoadingFallback />}>
                <div className={!user ? "pt-24" : ""}>
                  <HelpSection onRestartTour={() => setShowOnboarding(true)} />
                </div>
              </Suspense>
            ) : view === "settings" && user ? (
              <Settings
                user={user}
                isDarkMode={isDarkMode}
                onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
                onUpdateUser={async (u) => {
                  await storageService.setUser(u);
                  setUser(u);
                }}
                onLogout={handleLogout}
                onUpgradePlan={() => setView("pricing")}
              />
            ) : view === "users" &&
              user &&
              hasPermission(user.role, Permission.MANAGE_USERS) ? (
              <ManageUsers
                isDarkMode={isDarkMode}
                onBack={() => setView("dashboard")}
              />
            ) : view === "legal" ? (
              <Suspense fallback={<LoadingFallback />}>
                <div className={!user ? "pt-24" : ""}>
                  <Legal
                    onBack={() =>
                      setView(
                        user
                          ? state.report
                            ? "home"
                            : "dashboard"
                          : "landing",
                      )
                    }
                  />
                </div>
              </Suspense>
            ) : (
              <div className="pt-32 sm:pt-40 pb-20 px-4">
                {!state.isScanning && !state.report && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-2xl mx-auto text-center"
                  >
                    {user && hasNoScans && (
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="mb-12 p-4 bg-blue-600 text-white rounded-xl shadow-xl border border-blue-500"
                      >
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Zap className="w-4 h-4" />
                          <p className="text-[10px] font-mono font-bold uppercase tracking-widest">
                            Advice: Initiate Scan
                          </p>
                        </div>
                        <p className="text-blue-50 font-medium text-sm">
                          Welcome, {user.name.split(" ")[0]}. To begin your
                          intelligence journey, we advise you to initiate your
                          first scan below.
                        </p>
                      </motion.div>
                    )}

                    <div className="space-y-4 mb-12">
                      <h1 className="text-4xl sm:text-7xl font-display font-bold text-slate-900 dark:text-white tracking-tighter leading-none">
                        Ocula{" "}
                        <span className="text-indigo-600 dark:text-indigo-400">
                          Scry v2.
                        </span>
                      </h1>
                      <p className="text-lg text-slate-500 dark:text-slate-400 font-light">
                        Map every digital signal. Gain clarity.
                      </p>
                    </div>

                    {state.error && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-4 p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 rounded-xl text-rose-600 dark:text-rose-400 font-medium text-center text-sm flex items-center justify-center gap-2"
                      >
                        <Activity className="w-4 h-4" />
                        {state.error}
                      </motion.div>
                    )}

                    <form
                      onSubmit={startScan}
                      className="surface p-6 space-y-6 relative overflow-hidden"
                      id="scan-initiation-form"
                    >
                      <div className="space-y-6 text-left relative z-10">
                        {entities.map((entity, idx) => (
                          <div
                            key={entity.id}
                            className="space-y-4 p-4 bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-800/50 relative group"
                          >
                            {entities.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setEntities(
                                    entities.filter((e) => e.id !== entity.id),
                                  )
                                }
                                className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                            <BusinessNameInput
                              value={entity.businessName}
                              onChange={(val) =>
                                setEntities(
                                  entities.map((ent) =>
                                    ent.id === entity.id
                                      ? {
                                          ...ent,
                                          businessName: val,
                                        }
                                      : ent,
                                  ),
                                )
                              }
                              placeholder="e.g. Acme Corp"
                              label={`Entity ${idx + 1} Name`}
                              size="lg"
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1 flex items-center gap-2">
                                  <MapPin className="w-3 h-3" /> Primary Market
                                </label>
                                <input
                                  type="text"
                                  value={entity.location}
                                  onChange={(e) =>
                                    setEntities(
                                      entities.map((ent) =>
                                        ent.id === entity.id
                                          ? { ...ent, location: e.target.value }
                                          : ent,
                                      ),
                                    )
                                  }
                                  placeholder="City, Country"
                                  className="w-full px-4 py-2.5 rounded-xl surface border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none font-medium text-sm dark:text-white transition-all"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1 flex items-center gap-2">
                                  <Globe className="w-3 h-3" /> Domain
                                </label>
                                <input
                                  type="text"
                                  value={entity.website}
                                  onChange={(e) =>
                                    setEntities(
                                      entities.map((ent) =>
                                        ent.id === entity.id
                                          ? { ...ent, website: e.target.value }
                                          : ent,
                                      ),
                                    )
                                  }
                                  placeholder="domain.com"
                                  className="w-full px-4 py-2.5 rounded-xl surface border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none font-medium text-sm dark:text-white transition-all"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1 flex items-center gap-2">
                                  <Activity className="w-3 h-3" /> Industry
                                </label>
                                <select
                                  value={entity.industry || ""}
                                  onChange={(e) =>
                                    setEntities(
                                      entities.map((ent) =>
                                        ent.id === entity.id
                                          ? { ...ent, industry: e.target.value }
                                          : ent,
                                      ),
                                    )
                                  }
                                  className="w-full px-4 py-2.5 rounded-xl surface border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none font-medium text-sm dark:text-white transition-all"
                                >
                                  <option value="" disabled>
                                    Select Industry
                                  </option>
                                  {INDUSTRIES.map((ind) => (
                                    <option key={ind.value} value={ind.value}>
                                      {ind.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1 flex items-center gap-2">
                                  <Users className="w-3 h-3" /> Company Size
                                </label>
                                <select
                                  value={entity.companySize || ""}
                                  onChange={(e) =>
                                    setEntities(
                                      entities.map((ent) =>
                                        ent.id === entity.id
                                          ? {
                                              ...ent,
                                              companySize: e.target.value,
                                            }
                                          : ent,
                                      ),
                                    )
                                  }
                                  className="w-full px-4 py-2.5 rounded-xl surface border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none font-medium text-sm dark:text-white transition-all"
                                >
                                  <option value="" disabled>
                                    Select Size
                                  </option>
                                  {COMPANY_SIZES.map((size) => (
                                    <option key={size.value} value={size.value}>
                                      {size.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        ))}

                        {entities.length < 4 && (
                          <button
                            type="button"
                            onClick={() =>
                              setEntities([
                                ...entities,
                                {
                                  id: `entity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                                  businessName: "",
                                  location: "",
                                  website: "",
                                  industry: "",
                                  companySize: "",
                                },
                              ])
                            }
                            className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 dark:text-slate-500 hover:border-indigo-500 hover:text-indigo-500 transition-all flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest"
                          >
                            <Plus className="w-4 h-4" /> Add Entity for
                            Comparison
                          </button>
                        )}

                        <div className="space-y-3 pt-2">
                          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 ml-1 flex items-center gap-2">
                            <Activity className="w-3 h-3" /> Analysis Focus Mode
                          </label>
                          <div
                            id="focus-modes-container"
                            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
                          >
                            {SCRY_TEMPLATES.map((tmpl) => {
                              const tierLevels = {
                                free: 0,
                                growth: 1,
                                premium: 2,
                              };
                              const userTierLevel = user
                                ? tierLevels[user.account.tier]
                                : 0;
                              const requiredTierLevel =
                                tierLevels[tmpl.requiredTier || "free"];
                              const isLocked = userTierLevel < requiredTierLevel;

                              return (
                                <button
                                  key={tmpl.id}
                                  type="button"
                                  disabled={isLocked}
                                  onClick={() =>
                                    !isLocked && setSelectedTemplate(tmpl.id)
                                  }
                                  className={`p-4 rounded-2xl border transition-all text-left flex flex-col gap-3 group relative overflow-hidden ${
                                    selectedTemplate === tmpl.id
                                      ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 shadow-sm ring-1 ring-indigo-500/50"
                                      : isLocked
                                        ? "border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 opacity-60 cursor-not-allowed"
                                        : "surface hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md"
                                  }`}
                                >
                                  {isLocked && (
                                    <div className="absolute top-3 right-3">
                                      <span className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[8px] font-black uppercase tracking-widest rounded-md flex items-center gap-1">
                                        <Shield className="w-2 h-2" />{" "}
                                        {tmpl.requiredTier}
                                      </span>
                                    </div>
                                  )}
                                  <div
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-transform duration-300 ${selectedTemplate === tmpl.id ? "bg-indigo-100 dark:bg-indigo-800 scale-110" : "bg-slate-100 dark:bg-slate-800 group-hover:scale-110 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30"}`}
                                  >
                                    {tmpl.icon}
                                  </div>
                                  <div>
                                    <p
                                      className={`text-sm font-black tracking-tight ${selectedTemplate === tmpl.id ? "text-indigo-700 dark:text-indigo-300" : "text-slate-900 dark:text-white"}`}
                                    >
                                      {tmpl.name}
                                    </p>
                                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest">
                                      {tmpl.focus}
                                    </p>
                                    <p
                                      className={`text-xs mt-2 leading-relaxed ${selectedTemplate === tmpl.id ? "text-indigo-600/80 dark:text-indigo-200/70" : "text-slate-500 dark:text-slate-400"}`}
                                    >
                                      {tmpl.description}
                                    </p>
                                  </div>
                                  {selectedTemplate === tmpl.id && (
                                    <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className={`w-full py-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900`}
                      >
                        <span>Initialize Scanner</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <p className="text-[10px] text-slate-400 dark:text-slate-600 text-center">
                        Intelligence data is subject to change based on
                        real-time market fluctuations.
                      </p>
                    </form>
                  </motion.div>
                )}

                <Suspense fallback={<div className="flex items-center justify-center py-20"><AILoader message="Synchronizing Intelligence..." /></div>}>
                  {state.isScanning && (
                    <Scanner
                      status={state.status}
                      step={state.step}
                      message={state.message}
                      error={state.error}
                      entityCount={
                        entities.filter((ent) => ent.businessName.trim() !== "")
                          .length
                      }
                      focusMode={
                        SCRY_TEMPLATES.find((t) => t.id === selectedTemplate)
                          ?.name
                      }
                      onRetry={() => {
                        dispatch({ type: "RESET" });
                        startScan();
                      }}
                      onClose={() => {
                        dispatch({ type: "RESET" });
                      }}
                      onSelectKey={handleSelectKey}
                    />
                  )}

                  {state.report && !state.isScanning && (
                    <Dashboard
                      report={state.report}
                      onReset={handleReset}
                      onRescan={handleRescan}
                      initialTab={initialTab}
                      scanId={state.scanId}
                      isDarkMode={isDarkMode}
                      user={user}
                      onUpdateUser={setUser}
                      widgets={widgets}
                      setWidgets={setWidgets}
                    />
                  )}
                </Suspense>
              </div>
            )}
          </div>
        </main>
      </Suspense>
      <Suspense fallback={null}>
        <FeedbackModal
          user={user}
          isOpen={isFeedbackOpen}
          onClose={() => setIsFeedbackOpen(false)}
          isDarkMode={isDarkMode}
        />
      </Suspense>

      {/* Rescan Option Modal */}
      <AnimatePresence>
        {rescanTarget && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRescanTarget(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-2xl bg-white dark:bg-[#0c0c0c] border border-slate-100 dark:border-slate-800/80 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden z-10 text-slate-900 dark:text-slate-100"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[80px] -mr-24 -mt-24 pointer-events-none" />

              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-display font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="p-1.5 bg-blue-50 dark:bg-blue-950/50 rounded-lg text-blue-600 dark:text-blue-400">
                      <RefreshCw className="w-5 h-5 animate-spin" style={{ animationDuration: "3s" }} />
                    </span>
                    Choose Scan Option
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1.5 leading-relaxed">
                    Select a scan mode to tailor the analysis blueprint and focus metrics for <span className="font-semibold text-slate-800 dark:text-slate-200">"{rescanTarget.report.businessName}"</span>.
                  </p>
                </div>
                <button
                  onClick={() => setRescanTarget(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors hover:bg-slate-50 dark:hover:bg-slate-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 max-h-[360px] overflow-y-auto custom-scrollbar pr-1 mb-8">
                {SCRY_TEMPLATES.map((tmpl) => {
                  const tierLevels: Record<string, number> = {
                    free: 0,
                    growth: 1,
                    premium: 2,
                  };
                  const userTierLevel = user ? tierLevels[user.account.tier] : 0;
                  const requiredTierLevel = tierLevels[tmpl.requiredTier || "free"];
                  const isLocked = userTierLevel < requiredTierLevel;

                  return (
                    <button
                      key={tmpl.id}
                      type="button"
                      disabled={isLocked}
                      onClick={() => !isLocked && setSelectedRescanTemplate(tmpl.id)}
                      className={`w-full p-4 rounded-2xl border transition-all text-left flex items-start gap-4 group relative overflow-hidden ${
                        selectedRescanTemplate === tmpl.id
                          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-sm ring-1 ring-indigo-500/50"
                          : isLocked
                            ? "border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 opacity-50 cursor-not-allowed"
                            : "bg-transparent border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700/50 hover:bg-slate-50 dark:hover:bg-slate-900/30"
                      }`}
                    >
                      {isLocked && (
                        <div className="absolute top-4 right-4">
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[8px] font-black uppercase tracking-widest rounded-md flex items-center gap-1 border border-slate-200/50 dark:border-slate-700/50">
                            <Shield className="w-2 h-2 text-rose-500" />
                            {tmpl.requiredTier}
                          </span>
                        </div>
                      )}
                      
                      <div
                        className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center text-xl transition-transform duration-300 ${
                          selectedRescanTemplate === tmpl.id
                            ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 scale-105"
                            : "bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20"
                        }`}
                      >
                        {tmpl.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-bold ${
                            selectedRescanTemplate === tmpl.id ? "text-indigo-700 dark:text-indigo-300" : "text-slate-800 dark:text-slate-200"
                          }`}>
                            {tmpl.name}
                          </p>
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            • {tmpl.focus}
                          </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-relaxed">
                          {tmpl.description}
                        </p>
                      </div>

                      {selectedRescanTemplate === tmpl.id && (
                        <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setRescanTarget(null)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white transition-all border border-slate-200/60 dark:border-slate-800/80"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeRescan}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Request Rescan
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
