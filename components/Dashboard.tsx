
import { formatErrorMessage } from '../src/lib/errorUtils';
import React, { useState, useMemo, useEffect, useRef, lazy, Suspense, useCallback } from 'react';
import { toPng } from 'html-to-image';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { VisibilityReport, Campaign, User, UserRole, SavedScan } from '../types';
import OculaLogo from './OculaLogo';
import DashboardFilters, { FilterState } from './DashboardFilters';
import { Permission, hasPermission } from '../src/constants/permissions';
import { TIER_CONFIGS } from '../src/constants/pricing';
import { PopupModal } from 'react-calendly';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis,
  Radar as RechartsRadar, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Cell,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  ZAxis,
  Treemap,
  ComposedChart,
  Legend,
  PieChart as RechartsPieChart,
  Pie,
} from 'recharts';
import { generateAIFix, generateAudioBriefing, generateSocialPost, generateComparisonVerdict, generateSWOTAnalysis, generateMissionTactics, refreshStrategicInsights } from '../services/aiService';
import { storageService } from '../services/storageService';
import SocialMediaMonitoring from './SocialMediaMonitoring';
import { Swords, Shield, Sparkles, AlertCircle, GripVertical, Eye, EyeOff, LayoutDashboard, Maximize2, Minimize2, Calendar, Target, Activity, PieChart, X, Radar, BarChart2, Share2, Zap, CheckCircle2, Loader2, FileText, RefreshCw, Search, MapPin, TrendingUp, TrendingDown, Minus, Globe, Printer } from 'lucide-react';
import { motion, Reorder, AnimatePresence, animate } from 'framer-motion';
import { Responsive, WidthProvider } from 'react-grid-layout/legacy';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const getBase64Image = async (url: string): Promise<string> => {
  if (!url) return '';
  if (url.startsWith('data:')) return url;
  
  try {
    const response = await fetch(url, { mode: 'cors' });
    if (response.ok) {
      const blob = await response.blob();
      return await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string) || '');
        reader.onerror = () => resolve('');
        reader.readAsDataURL(blob);
      });
    }
  } catch {
    // CORS or fetch error fallback
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 128;
        canvas.height = img.naturalHeight || 128;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
          return;
        }
      } catch {
        // Tainted canvas fallback
      }
      resolve(url);
    };
    img.onerror = () => resolve(url);
    img.src = url;
  });
};

const AnimatedCounter: React.FC<{ value: number }> = ({ value }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate: (latest) => setCount(Math.round(latest)),
    });
    return () => controls.stop();
  }, [value]);

  return <>{count}</>;
};

import AILoader from './AILoader';

// Lazy load sub-components
const CompetitorTracking = lazy(() => import('./CompetitorTracking'));
const SWOTAnalysis = lazy(() => import('./SWOTAnalysis'));
const KeywordVenn = lazy(() => import('./KeywordVenn'));
const RealTimeDashboard = lazy(() => import('./RealTimeDashboard'));
const KeyInsightsDashboard = lazy(() => import('./KeyInsightsDashboard'));
const KPIDashboard = lazy(() => import('./KPIDashboard'));
const MarketDominanceHub = lazy(() => import('./MarketDominanceHub'));
const SearchVisibilityWidget = lazy(() => import('./SearchVisibilityWidget'));
const VisibilityProjectionWidget = lazy(() => import('./VisibilityProjectionWidget'));
const CompetitorWatchlistWidget = lazy(() => import('./CompetitorWatchlistWidget'));
const ArrowRight = lazy(() => import('lucide-react').then(m => ({ default: m.ArrowRight })));
const Lightbulb = lazy(() => import('lucide-react').then(m => ({ default: m.Lightbulb })));
const Users = lazy(() => import('lucide-react').then(m => ({ default: m.Users })));

const ComponentLoader = () => (
  <div className="flex items-center justify-center p-8">
    <AILoader message="Loading widget data..." />
  </div>
);

// OculaLogo removed, imported instead


const decodeBase64 = (base64: string) => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
};

const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
  const dataInt16 = new Int16Array(data.buffer, data.byteOffset, data.byteLength / 2);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
};

const TrendBadge = React.memo(({ trend }: { trend?: 'up' | 'down' | 'stable' }) => {
  const config = {
    up: { 
      label: 'ASCENDING', 
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', 
      icon: (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    },
    down: { 
      label: 'DESCENDING', 
      color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20', 
      icon: (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
        </svg>
      )
    },
    stable: { 
      label: 'STAGNANT', 
      color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20', 
      icon: (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
        </svg>
      )
    }
  };
  const style = config[trend || 'stable'];
  return (
    <span className={`${style.color} text-[9px] font-black px-2.5 py-1 rounded border tracking-widest flex items-center gap-1.5 shadow-sm uppercase`}>
      {style.icon} <span>{style.label}</span>
    </span>
  );
});

interface SocialPostRecord {
  id: string;
  platform: string;
  content: string;
  timestamp: string;
  engagement: {
    likes: number;
    shares: number;
    comments: number;
  };
}

interface DashboardProps {
  report: VisibilityReport;
  onReset: () => void;
  onRescan: () => void;
  initialTab?: 'overview' | 'intelligence' | 'missions' | 'social' | 'rivals' | 'competitors' | 'monitor' | 'executive' | 'kpis';
  scanId?: string;
  isDarkMode: boolean;
  user: User | null;
  onUpdateUser: (user: User) => void;
  widgets: { id: string; name: string; visible: boolean }[];
  setWidgets: React.Dispatch<React.SetStateAction<{ id: string; name: string; visible: boolean }[]>>;
}

const Dashboard: React.FC<DashboardProps> = ({ report, onReset, onRescan, initialTab = 'overview', scanId, isDarkMode, user, onUpdateUser, widgets, setWidgets }) => {
  const currentUserRole = user?.role || UserRole.VIEWER;
  const currentTier = user?.account?.tier || 'free';
  const capabilities = TIER_CONFIGS[currentTier]?.capabilities || TIER_CONFIGS['free'].capabilities;

  const checkCapability = (capability: keyof typeof capabilities, requiredTierName: string) => {
    if (!capabilities[capability]) {
      setErrorMessage({ 
        title: "Access Restricted", 
        body: `This feature is available on the ${requiredTierName} plan. Please upgrade to access.` 
      });
      return false;
    }
    return true;
  };

  const [activeTab, setActiveTab] = useState<'overview' | 'intelligence' | 'missions' | 'social' | 'rivals' | 'competitors' | 'monitor' | 'executive' | 'kpis'>(initialTab);
  
  // Calculate Overview Data
  const trendData = useMemo(() => {
    const baseScore = Number(report.overallScore) || 0;
    const competitors = report.competitorComparison || [];
    const competitorAvg = competitors.length > 0 
      ? competitors.reduce((acc, curr) => acc + (Number(curr.score) || 0), 0) / competitors.length 
      : 0;
    
    return [
      { name: 'Week 1', score: Math.max(0, baseScore - 15), marketAvg: Math.max(0, competitorAvg - 5) },
      { name: 'Week 2', score: Math.max(0, baseScore - 8), marketAvg: Math.max(0, competitorAvg - 2) },
      { name: 'Week 3', score: Math.max(0, baseScore - 3), marketAvg: Math.max(0, competitorAvg + 1) },
      { name: 'Current', score: baseScore, marketAvg: competitorAvg },
    ];
  }, [report]);

  const topCompetitors = useMemo(() => {
    return [...(report.competitorComparison || [])]
      .sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0));
  }, [report]);

  const overviewMetrics = useMemo(() => [
    { 
      label: 'Global Signal', 
      value: Number(report.overallScore) || 0, 
      change: '+14% Δ', 
      trend: 'up',
      icon: <Globe className="w-4 h-4 text-indigo-500" />
    },
    {
      label: 'Local Authority',
      value: report.visibilityBreakdown?.googleMyBusiness || 0,
      change: 'Active Scry',
      trend: 'status',
      icon: <Target className="w-4 h-4 text-indigo-500" />
    },
    { 
      label: 'Market Tier', 
      value: report.visibilityIndex?.visibilityLevel || 'Emerging', 
      change: 'Calibrated', 
      trend: 'status',
      icon: <Shield className="w-4 h-4 text-indigo-500" />
    },
    { 
      label: 'Threat Density', 
      value: (report.competitorComparison || []).length > 10 ? 'CRITICAL' : (report.competitorComparison || []).length > 5 ? 'HIGH' : 'NOMINAL', 
      change: (report.competitorComparison || []).length + ' Detected', 
      trend: 'down', 
      icon: <AlertCircle className="w-4 h-4 text-indigo-500" />
    }
  ], [report]);

  const DEFAULT_OVERVIEW_LAYOUT = useMemo(() => ({
    lg: [
      { i: 'overviewStats', x: 0, y: 0, w: 12, h: 3 },
      { i: 'marketVelocity', x: 0, y: 3, w: 8, h: 7 },
      { i: 'rivalSnapshot', x: 8, y: 3, w: 4, h: 7 },
      { i: 'searchVisibility', x: 0, y: 10, w: 12, h: 3 },
      { i: 'strategicInsights', x: 0, y: 13, w: 12, h: 6 },
      { i: 'marketHub', x: 0, y: 19, w: 12, h: 5 },
      { i: 'profile', x: 0, y: 24, w: 4, h: 4 },
      { i: 'swot', x: 4, y: 24, w: 8, h: 5 },
      { i: 'keywords', x: 0, y: 29, w: 6, h: 4 },
      { i: 'socialIntelligence', x: 6, y: 29, w: 6, h: 4 },
      { i: 'usage', x: 0, y: 33, w: 12, h: 2 },
      { i: 'radar', x: 0, y: 35, w: 6, h: 4 },
      { i: 'keywordMatrix', x: 6, y: 35, w: 6, h: 4 },
      { i: 'marketTreemap', x: 0, y: 39, w: 12, h: 4 },
      { i: 'visibilityProjection', x: 0, y: 43, w: 12, h: 5 },
      { i: 'competitorWatchlist', x: 0, y: 48, w: 12, h: 5 },
      { i: 'support', x: 0, y: 53, w: 12, h: 3 },
    ]
  }), []);

  const [layouts, setLayouts] = useState<any>(() => DEFAULT_OVERVIEW_LAYOUT);

  useEffect(() => {
    const loadLayout = async () => {
      const saved = await storageService.getLayout() as any;
      if (saved && saved.reportLayouts) {
        // Heal layout: ensure any missing default widgets are merged safely
        const mergedLayouts: any = { ...saved.reportLayouts };
        const breakpoints = ['lg', 'md', 'sm', 'xs', 'xxs'];
        
        breakpoints.forEach(bp => {
          if (!mergedLayouts[bp]) {
            mergedLayouts[bp] = [];
          }
          const currentList = mergedLayouts[bp];

          // Enforce/heal safety dimensions for critical widgets
          currentList.forEach((item: any) => {
            if (item.i === 'overviewStats') {
              if (bp === 'lg') item.h = 3;
              else if (bp === 'md') item.h = 5;
              else item.h = 8;
            } else if (item.i === 'marketHub') {
              if (bp === 'lg') item.h = 5;
              else if (bp === 'md') item.h = 9;
              else if (bp === 'sm') item.h = 9;
              else item.h = 13;
            } else if (item.i === 'profile') {
              item.h = Math.max(item.h, 4);
            } else if (item.i === 'support') {
              if (bp === 'lg') item.h = 3;
              else if (bp === 'md') item.h = 4;
              else if (bp === 'sm') item.h = 4;
              else item.h = 5;
            } else if (item.i === 'visibilityProjection') {
              if (bp === 'lg') item.h = 5;
              else if (bp === 'md') item.h = 6;
              else if (bp === 'sm') item.h = 6;
              else item.h = 7;
            } else if (item.i === 'marketVelocity') {
              if (bp === 'lg') item.h = 7;
              else if (bp === 'md') item.h = 10;
              else item.h = 12;
            } else if (item.i === 'rivalSnapshot') {
              if (bp === 'lg') item.h = 7;
              else if (bp === 'md') item.h = 10;
              else item.h = 12;
            }
          });

          DEFAULT_OVERVIEW_LAYOUT.lg.forEach((defItem: any) => {
            const exists = currentList.some((item: any) => item.i === defItem.i);
            if (!exists) {
              const maxY = currentList.reduce((acc: number, item: any) => Math.max(acc, item.y + item.h), 0);
              let itemW = defItem.w;
              let itemX = defItem.x;
              let itemH = defItem.h;
              
              if (bp === 'md') {
                itemW = Math.min(defItem.w, 10);
                itemX = Math.min(defItem.x, 10 - itemW);
                if (defItem.i === 'overviewStats') itemH = 5;
                if (defItem.i === 'marketHub') itemH = 9;
                if (defItem.i === 'marketVelocity') itemH = 10;
                if (defItem.i === 'rivalSnapshot') itemH = 10;
                if (defItem.i === 'visibilityProjection') itemH = 6;
                if (defItem.i === 'competitorWatchlist') itemH = 6;
                if (defItem.i === 'support') itemH = 4;
              } else if (bp === 'sm') {
                itemW = Math.min(defItem.w, 6);
                itemX = Math.min(defItem.x, 6 - itemW);
                if (defItem.i === 'overviewStats') itemH = 8;
                if (defItem.i === 'marketHub') itemH = 9;
                if (defItem.i === 'marketVelocity') itemH = 12;
                if (defItem.i === 'rivalSnapshot') itemH = 12;
                if (defItem.i === 'visibilityProjection') itemH = 6;
                if (defItem.i === 'competitorWatchlist') itemH = 6;
                if (defItem.i === 'support') itemH = 4;
              } else if (bp === 'xs') {
                itemW = Math.min(defItem.w, 4);
                itemX = Math.min(defItem.x, 4 - itemW);
                if (defItem.i === 'overviewStats') itemH = 8;
                if (defItem.i === 'marketHub') itemH = 13;
                if (defItem.i === 'marketVelocity') itemH = 12;
                if (defItem.i === 'rivalSnapshot') itemH = 12;
                if (defItem.i === 'visibilityProjection') itemH = 7;
                if (defItem.i === 'competitorWatchlist') itemH = 7;
                if (defItem.i === 'support') itemH = 5;
              } else if (bp === 'xxs') {
                itemW = Math.min(defItem.w, 2);
                itemX = Math.min(defItem.x, 2 - itemW);
                if (defItem.i === 'overviewStats') itemH = 8;
                if (defItem.i === 'marketHub') itemH = 13;
                if (defItem.i === 'marketVelocity') itemH = 12;
                if (defItem.i === 'rivalSnapshot') itemH = 12;
                if (defItem.i === 'visibilityProjection') itemH = 7;
                if (defItem.i === 'competitorWatchlist') itemH = 7;
                if (defItem.i === 'support') itemH = 5;
              }
              
              currentList.push({
                i: defItem.i,
                x: itemX,
                y: maxY,
                w: itemW,
                h: itemH
              });
            }
          });
        });
        setLayouts(mergedLayouts);
      }
    };
    loadLayout();
  }, [DEFAULT_OVERVIEW_LAYOUT]);

  const handleLayoutChange = (currentLayout: any, allLayouts: any) => {
    setLayouts(allLayouts);
    storageService.getLayout().then(saved => {
      storageService.setLayout({ ...(saved || {}), reportLayouts: allLayouts });
    });
  };
  const [displayScore, setDisplayScore] = useState(0);

  // Advanced Filters State
  const [filters, setFilters] = useState<FilterState>({
    keywordSearch: '',
    keywordDifficulty: 'all',
    selectedCompetitors: [],
    dateRange: 'all'
  });

  const [localStrategicInsights, setLocalStrategicInsights] = useState(report.strategicInsights);
  const [isRefreshingInsights, setIsRefreshingInsights] = useState(false);

  useEffect(() => {
    setLocalStrategicInsights(report.strategicInsights);
  }, [report.strategicInsights]);

  const handleRefreshInsights = useCallback(async () => {
    setIsRefreshingInsights(true);
    try {
      const newInsights = await refreshStrategicInsights(report.businessName, report.summary);
      setLocalStrategicInsights(newInsights);
    } catch (error) {
      console.error("Failed to refresh insights", error);
    } finally {
      setIsRefreshingInsights(false);
    }
  }, [report.businessName, report.summary]);

  const filteredReport = useMemo(() => {
    const r = { ...report };
    r.strategicInsights = localStrategicInsights;

    // Filter Competitors
    if (filters.selectedCompetitors.length > 0) {
      r.competitorComparison = (report.competitorComparison || []).filter(c => 
        filters.selectedCompetitors.includes(c.name)
      );
    }

    // Filter Keywords
    if (r.keywordAnalysis && r.keywordAnalysis.suggestedKeywords) {
      r.keywordAnalysis = {
        ...r.keywordAnalysis,
        suggestedKeywords: r.keywordAnalysis.suggestedKeywords.filter(kw => {
          const matchesSearch = !filters.keywordSearch || (kw?.term || '').toLowerCase().includes(filters.keywordSearch.toLowerCase());
          
          let matchesDifficulty = true;
          if (filters.keywordDifficulty !== 'all') {
             // Map string difficulty to numeric ranges if needed, or use existing 'high'/'medium'/'low' if available
             // The type definition says difficulty is number, but impact/competition are strings.
             // Let's assume difficulty > 70 is high, > 40 is medium, else low.
             const diff = kw.difficulty || 0;
             if (filters.keywordDifficulty === 'high') matchesDifficulty = diff > 70;
             else if (filters.keywordDifficulty === 'medium') matchesDifficulty = diff > 40 && diff <= 70;
             else if (filters.keywordDifficulty === 'low') matchesDifficulty = diff <= 40;
          }
          
          return matchesSearch && matchesDifficulty;
        })
      };
    }

    return r;
  }, [report, filters]);

  useEffect(() => {
    let start = 0;
    const end = Number(report.overallScore) || 0;
    const duration = 1000;
    const increment = end / (duration / 20);
    
    const timer = setInterval(() => {
      if (isNaN(increment)) {
        setDisplayScore(end);
        clearInterval(timer);
        return;
      }
      start += increment;
      if (start >= end) {
        setDisplayScore(end);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.floor(start));
      }
    }, 20);
    
    return () => clearInterval(timer);
  }, [report.overallScore]);
  const [selectedCompetitor, setSelectedCompetitor] = useState<any | null>(null);
  const [comparisonVerdict, setComparisonVerdict] = useState<{ verdict: string; battlePlan: string[] } | null>(null);
  const [isGeneratingVerdict, setIsGeneratingVerdict] = useState(false);
  useEffect(() => {
    if (selectedCompetitor) {
      const fetchVerdict = async () => {
        setIsGeneratingVerdict(true);
        setComparisonVerdict(null);
        try {
          const verdict = await generateComparisonVerdict(
            report.businessName,
            report.overallScore,
            selectedCompetitor.name,
            selectedCompetitor.score,
            report.swotAnalysis?.strengths || [],
            selectedCompetitor.strengths || []
          );
          setComparisonVerdict(verdict);
        } catch (e) {
          setComparisonVerdict({ 
            verdict: "Strategic signal lost. Re-scrying recommended.", 
            battlePlan: ["Re-analyze market signals", "Check competitor activity", "Refresh visibility scan"] 
          });
        } finally {
          setIsGeneratingVerdict(false);
        }
      };
      fetchVerdict();
    }
  }, [selectedCompetitor, report.businessName, report.overallScore, report.swotAnalysis?.strengths]);

  const [activeTactics, setActiveTactics] = useState<any>(null);
  const [loadingTactics, setLoadingTactics] = useState(false);
  const [missionToDelete, setMissionToDelete] = useState<{ id: string; name: string } | null>(null);
  const [dossierToDelete, setDossierToDelete] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [errorMessage, setErrorMessage] = useState<any>(null);
  const [isBriefingLoading, setIsBriefingLoading] = useState(false);
  const [isPlayingBriefing, setIsPlayingBriefing] = useState(false);
  const [isDossierVisible, setIsDossierVisible] = useState(false);
  const [exportLogoUrl, setExportLogoUrl] = useState<string>('');
  const [hoveredRadarMetric, setHoveredRadarMetric] = useState<string | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [socialSubTab, setSocialSubTab] = useState<'monitoring' | 'channels'>('monitoring');

  const [isComparingExporting, setIsComparingExporting] = useState(false);

  const [historyScans, setHistoryScans] = useState<SavedScan[]>([]);
  
  useEffect(() => {
    const fetchScans = async () => {
      const scans = await storageService.getScans();
      setHistoryScans(scans.filter(s => (s?.businessName || '').toLowerCase() === (report?.businessName || '').toLowerCase()));
    };
    fetchScans();
  }, [report.businessName]);

   const [isCustomizing, setIsCustomizing] = useState(false);
  const [isPrintView, setIsPrintView] = useState(false);

  useEffect(() => {
    if (isPrintView) {
      document.body.classList.add('print-view-active');
      setIsCustomizing(false);
    } else {
      document.body.classList.remove('print-view-active');
    }
    return () => {
      document.body.classList.remove('print-view-active');
    };
  }, [isPrintView]);

  const [isCompact, setIsCompact] = useState(false);
  const [isWidgetsCollapsed, setIsWidgetsCollapsed] = useState(false);

  const moveWidget = (index: number, direction: 'up' | 'down') => {
    const newWidgets = [...widgets];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newWidgets.length) return;
    [newWidgets[index], newWidgets[targetIndex]] = [newWidgets[targetIndex], newWidgets[index]];
    setWidgets(newWidgets);
  };

  const toggleWidgetVisibility = (id: string) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, visible: !w.visible } : w));
  };

  // Local reactive state for campaigns (missions)
  const [localCampaigns, setLocalCampaigns] = useState<Campaign[]>(report.campaigns || []);
  const [localSwot, setLocalSwot] = useState(report.swotAnalysis);
  const [isGeneratingSwot, setIsGeneratingSwot] = useState(false);

  useEffect(() => {
    if (!report.swotAnalysis && !localSwot && !isGeneratingSwot) {
      const fetchSwot = async () => {
        setIsGeneratingSwot(true);
        try {
          const swot = await generateSWOTAnalysis(report.businessName, report.summary || "General business visibility analysis");
          setLocalSwot(swot);
        } catch (e) {
          console.error("Failed to generate SWOT", e);
          setLocalSwot({
            strengths: ["Strong digital foundations", "Growth opportunities defined", "Visibility scanning enabled"],
            weaknesses: ["Competitive local space", "Authority index optimization required", "Conversion signal volume"],
            opportunities: ["Local market capture", "Structured KPI measurement", "SEO authority alignment"],
            threats: ["Dynamic position volatility", "Aggressive competitor campaigns", "Algorithm param shifts"]
          });
        } finally {
          setIsGeneratingSwot(false);
        }
      };
      fetchSwot();
    }
  }, [report.swotAnalysis, localSwot, isGeneratingSwot, report.businessName, report.summary]);

  const [localSocialPresence, setLocalSocialPresence] = useState(report.socialPresence || []);
  const [editingSocial, setEditingSocial] = useState<string | null>(null);
  const [socialHandleInput, setSocialHandleInput] = useState('');

  // Social Integration States
  const [connectedPlatforms, setConnectedPlatforms] = useState<Set<string>>(() => {
    const connected = new Set<string>();
    (report.socialPresence || []).forEach(p => {
      if (p.handle && p.handle !== '@unclaimed') {
        connected.add(p.platform);
      }
    });
    return connected;
  });
  const [postHistory, setPostHistory] = useState<SocialPostRecord[]>([]);
  const [isComposing, setIsComposing] = useState(false);
  const [compositionGoal, setCompositionGoal] = useState('');
  const [composingPlatform, setComposingPlatform] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [isGeneratingPost, setIsGeneratingPost] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const dossierRef = useRef<HTMLDivElement>(null);

  const competitorNames = useMemo(() => 
    (report.competitorComparison || []).map(c => c.name), 
  [report.competitorComparison]);

  const safeRadarData = useMemo(() => {
    if (filteredReport.radarMetrics && filteredReport.radarMetrics.length > 0) {
      return filteredReport.radarMetrics.map(m => ({
        subject: m.subject || 'Metric',
        A: Number(m.A) || 0,
        benchmark: 65,
        fullMark: 100
      }));
    }
    if (filteredReport.categories && filteredReport.categories.length > 0) {
      return filteredReport.categories.map(c => ({
        subject: c.name ? c.name.split(' ')[0] : 'Metric',
        A: Number(c.score) || 0,
        benchmark: 65,
        fullMark: 100
      }));
    }
    if (filteredReport.visibilityBreakdown) {
      const vb = filteredReport.visibilityBreakdown;
      return [
        { subject: 'Google', A: Number(vb.googleMyBusiness) || 75, benchmark: 65, fullMark: 100 },
        { subject: 'Social', A: Number(vb.socialPresence) || 70, benchmark: 65, fullMark: 100 },
        { subject: 'Brand', A: Number(vb.brandAuthority) || 76, benchmark: 65, fullMark: 100 },
        { subject: 'Content', A: Number(vb.contentStrength) || 75, benchmark: 65, fullMark: 100 },
        { subject: 'Market', A: Number(vb.marketPosition) || 83, benchmark: 65, fullMark: 100 },
      ];
    }
    const baseScore = Number(filteredReport.overallScore) || 78;
    return [
      { subject: 'Google', A: Math.min(100, baseScore + 6), benchmark: 65, fullMark: 100 },
      { subject: 'SEO', A: baseScore, benchmark: 65, fullMark: 100 },
      { subject: 'Social', A: Math.max(30, baseScore - 8), benchmark: 65, fullMark: 100 },
      { subject: 'Brand', A: Math.max(35, baseScore - 3), benchmark: 65, fullMark: 100 },
      { subject: 'Content', A: Math.max(40, baseScore - 2), benchmark: 65, fullMark: 100 },
    ];
  }, [filteredReport.radarMetrics, filteredReport.categories, filteredReport.visibilityBreakdown, filteredReport.overallScore]);

  const getKeywordCompetition = (term: string) => {
    return filteredReport.keywordAnalysis?.suggestedKeywords?.find(
      sk => sk.term.toLowerCase() === (term || '').toLowerCase()
    )?.competition;
  };

  const keywordCompetitionData = useMemo(() => {
    const keywords = filteredReport.keywordAnalysis?.suggestedKeywords || [];
    return keywords.map(kw => ({
      term: kw.term,
      competitionValue: kw.competition === 'high' ? 3 : kw.competition === 'medium' ? 2 : 1,
      competitionLabel: kw.competition
    }));
  }, [filteredReport.keywordAnalysis?.suggestedKeywords]);

  const socialChartData = useMemo(() => {
    return (filteredReport.socialPresence || []).map(p => {
      const platform = (p.platform || '').toLowerCase();
      return {
        platform: p.platform || 'Unknown',
        score: p.score || 0,
        color: platform.includes('facebook') ? '#1877F2' :
               platform.includes('instagram') ? '#E4405F' :
               platform.includes('linkedin') ? '#0A66C2' :
               platform.includes('twitter') ? '#1DA1F2' :
               platform.includes('google') ? '#4285F4' : '#6366f1'
      };
    });
  }, [filteredReport.socialPresence]);

  const socialTrendData = useMemo(() => {
    const base = filteredReport.overallScore;
    return [
      { name: 'W1', val: base * 0.8 },
      { name: 'W2', val: base * 0.85 },
      { name: 'W3', val: base * 0.92 },
      { name: 'W4', val: base }
    ];
  }, [filteredReport.overallScore]);

  const keywordVolumeTrendData = useMemo(() => {
    // Generate mock data for the last 6 months
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      name: month,
      volume: Math.floor(Math.random() * 5000) + 1000 // Random volume
    }));
  }, []);

  const keywordMatrixData = useMemo(() => {
    const keywords = filteredReport.keywordAnalysis?.suggestedKeywords || [];
    return keywords.map(kw => ({
      name: kw.term,
      difficulty: kw.difficulty || (kw.competition === 'high' ? 80 : kw.competition === 'medium' ? 50 : 20),
      volume: kw.searchVolume || 0,
      impact: kw.impact === 'high' ? 100 : kw.impact === 'medium' ? 60 : 30,
      impactLabel: kw.impact
    }));
  }, [filteredReport.keywordAnalysis?.suggestedKeywords]);

  const treemapData = useMemo(() => {
    return (filteredReport.categories || []).map(c => ({
      name: c.name,
      size: c.score,
      status: c.status
    }));
  }, [filteredReport.categories]);

  const composedSocialData = useMemo(() => {
    return (filteredReport.socialPresence || []).map(p => {
      const reachVal = p.reach === 'high' ? 90 : p.reach === 'medium' ? 60 : 30;
      return {
        name: p.platform,
        score: p.score,
        reach: reachVal,
        activity: p.activity
      };
    });
  }, [filteredReport.socialPresence]);

  const dualRadarData = useMemo(() => {
    if (!selectedCompetitor) return [];
    return safeRadarData.map(m => {
      const rivalMod = (Number(selectedCompetitor.score) || 0) / (Number(filteredReport.overallScore) || 1);
      return {
        ...m,
        B: Math.min(100, (m.A || 50) * (rivalMod || 1))
      };
    });
  }, [selectedCompetitor, safeRadarData, filteredReport.overallScore]);

  const keywordBattleground = useMemo(() => {
    if (!selectedCompetitor) return null;
    const selfKws = filteredReport.keywordAnalysis?.suggestedKeywords || [];
    const rivalKws = selectedCompetitor.keywords || [];
    
    const rivalLower = rivalKws.map((k: string) => (k || '').toLowerCase());

    const overlapping = selfKws.filter(k => rivalLower.includes((k.term || '').toLowerCase()));
    const uniqueToSelf = selfKws.filter(k => !rivalLower.includes((k.term || '').toLowerCase()));
    const uniqueToRival = rivalKws.filter((k: string) => !selfKws.some(sk => (sk.term || '').toLowerCase() === (k || '').toLowerCase()));

    // Calculate top 3 edges: unique to self, sorted by impact and volume
    const topEdges = [...uniqueToSelf]
      .sort((a, b) => {
        const impactOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
        const aImpact = impactOrder[a.impact] || 0;
        const bImpact = impactOrder[b.impact] || 0;
        if (aImpact !== bImpact) {
          return bImpact - aImpact;
        }
        return (b.searchVolume || 0) - (a.searchVolume || 0);
      })
      .slice(0, 3)
      .map(k => k.term);

    return { 
      overlapping: overlapping.map(k => k.term), 
      uniqueToSelf: uniqueToSelf.map(k => k.term), 
      uniqueToRival,
      topEdges
    };
  }, [selectedCompetitor, filteredReport]);

  const dossierTrendData = useMemo(() => {
    const currentScore = Number(report.overallScore) || 75;
    
    // Check if we have history scans matching this business name
    const matchingScans = (historyScans || [])
      .filter(s => s.businessName?.toLowerCase() === report.businessName?.toLowerCase() || (scanId && s.id === scanId))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    if (matchingScans.length >= 3) {
      return matchingScans.slice(-6).map((s, idx, arr) => {
        const dateStr = new Date(s.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const sc = Number(s.score) || Number(s.report?.overallScore) || currentScore;
        const prevSc = idx > 0 ? (Number(arr[idx - 1].score) || Number(arr[idx - 1].report?.overallScore) || sc) : sc;
        const competitors = s.report?.competitorComparison || report.competitorComparison || [];
        const compAvg = competitors.length > 0 
          ? Math.round(competitors.reduce((acc, curr) => acc + (Number(curr.score) || 0), 0) / competitors.length)
          : Math.max(30, Math.min(85, Math.round(sc * 0.82)));

        return {
          period: dateStr,
          score: sc,
          benchmark: compAvg,
          change: sc - prevSc,
        };
      });
    }

    // Default 6-month trend progression leading up to currentScore
    const monthLabels = ['6 Mos Ago', '5 Mos Ago', '4 Mos Ago', '3 Mos Ago', '2 Mos Ago', 'Current'];
    const deltas = [-18, -14, -10, -6, -2, 0];
    
    const competitors = report.competitorComparison || [];
    const baseCompAvg = competitors.length > 0 
      ? Math.round(competitors.reduce((acc, curr) => acc + (Number(curr.score) || 0), 0) / competitors.length)
      : Math.max(30, Math.min(85, Math.round(currentScore * 0.82)));

    return monthLabels.map((label, i) => {
      const delta = deltas[i];
      const sc = Math.min(100, Math.max(10, currentScore + delta));
      const compVal = Math.min(100, Math.max(10, baseCompAvg + Math.round(delta * 0.6)));
      const prevSc = i > 0 ? Math.min(100, Math.max(10, currentScore + deltas[i - 1])) : sc;

      return {
        period: label,
        score: sc,
        benchmark: compVal,
        change: sc - prevSc,
      };
    });
  }, [report, historyScans]);

  const dossierTrendMetrics = useMemo(() => {
    if (!dossierTrendData.length) return { totalGain: 0, avgScore: 0, peakScore: 0, startScore: 0 };
    const startScore = dossierTrendData[0].score;
    const currentScore = dossierTrendData[dossierTrendData.length - 1].score;
    const totalGain = currentScore - startScore;
    const scores = dossierTrendData.map(d => d.score);
    const peakScore = Math.max(...scores);
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    return { totalGain, avgScore, peakScore, startScore };
  }, [dossierTrendData]);

  const handleAudioBriefing = async () => {
    if (!checkCapability('canGenerateAudioBriefing', 'Growth')) return;
    if (isPlayingBriefing) { currentSourceRef.current?.stop(); setIsPlayingBriefing(false); return; }
    setIsBriefingLoading(true);
    try {
      const base64 = await generateAudioBriefing(report.summary);
      if (!base64) throw new Error("No audio data received");
      
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      const audioBuffer = await decodeAudioData(decodeBase64(base64), audioContextRef.current, 24000, 1);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setIsPlayingBriefing(false);
      currentSourceRef.current = source;
      source.start();
      setIsPlayingBriefing(true);
    } catch (err) { setErrorMessage({ title: "Briefing Error", body: "Audio signal lost." }); }
    finally { setIsBriefingLoading(false); }
  };

  const deployVsMission = useCallback(async (competitor: any) => {
    const scans = await storageService.getScans();
    const scanId = scans.find(s => s.businessName === report.businessName)?.id;

    const missionId = 'vs_' + Math.random().toString(36).substr(2, 9);
    const objective = competitor.suggestedObjective || `Directly bypass ${competitor.name}'s search and social presence to recapture local market share.`;
    const missionName = `Vs. ${competitor.name} Domination`;

    const mission: Campaign = {
      id: missionId,
      name: missionName,
      objective: objective,
      targetCompetitor: competitor.name,
      kpi: 'Rival Visibility Delta',
      priority: 'high',
      status: 'active',
      progress: 0,
      isVsMission: true,
      targetMetrics: '',
      notes: '',
      assignee: ''
    };

    // Update local state for immediate UI feedback
    setLocalCampaigns(prev => [mission, ...prev]);

    // Persist to storage only if a scanId is found (logged in user)
    if (scanId) {
      await storageService.addCampaignToScan(scanId, mission);
    }

    setErrorMessage({ title: "Mission Deployed", body: `VS Mission against ${competitor.name} is now active. Tactical analysis starting...` });
    setActiveTab('missions');

    // Auto-generate tactics
    try {
      const tactics = await generateMissionTactics(report.businessName, objective, missionName);
      setLocalCampaigns(prev => prev.map(m => m.id === missionId ? { ...m, tacticalPlan: tactics } : m));
      if (scanId) {
        await storageService.updateCampaign(scanId, missionId, { tacticalPlan: tactics });
      }
    } catch (e) {
      console.error("Auto-tactic generation failed", e);
    }
  }, [report.businessName]);

  const togglePlatformConnection = async (platform: string) => {
    const isConnected = connectedPlatforms.has(platform);
    
    if (isConnected) {
      setConnectedPlatforms(prev => {
        const next = new Set(prev);
        next.delete(platform);
        return next;
      });
      // Also reset handle in local state if unlinking
      setLocalSocialPresence(curr => curr.map(p => p.platform === platform ? { ...p, handle: '@unclaimed' } : p));
      if (scanId) await storageService.updateSocialHandle(scanId, platform, '@unclaimed');
    } else {
      setEditingSocial(platform);
      const currentHandle = localSocialPresence.find(p => p.platform === platform)?.handle;
      setSocialHandleInput(currentHandle && currentHandle !== '@unclaimed' ? currentHandle : '');
    }
  };

  const saveSocialHandle = async (platform: string) => {
    const formattedHandle = socialHandleInput.trim().startsWith('@') ? socialHandleInput.trim() : `@${socialHandleInput.trim()}`;
    
    setLocalSocialPresence(curr => curr.map(p => p.platform === platform ? { ...p, handle: formattedHandle } : p));
    if (scanId) await storageService.updateSocialHandle(scanId, platform, formattedHandle);
    
    setConnectedPlatforms(prev => {
      const next = new Set(prev);
      next.add(platform);
      return next;
    });
    setEditingSocial(null);
    setSocialHandleInput('');
  };

  const handleOpenComposer = (platform: string) => {
    setComposingPlatform(platform);
    setIsComposing(true);
  };

  const handleGeneratePostDraft = async () => {
    if (!checkCapability('canGenerateSocialPosts', 'Growth')) return;
    if (!compositionGoal) return;
    setIsGeneratingPost(true);
    try {
      const content = await generateSocialPost(report.businessName, compositionGoal, composingPlatform);
      setDraftContent(content);
    } catch (e) {
      setErrorMessage({ title: "AI Error", body: "Failed to draft intelligence-backed post." });
    } finally {
      setIsGeneratingPost(false);
    }
  };

  const handlePublishPost = () => {
    if (!draftContent) return;
    const newPost: SocialPostRecord = {
      id: Math.random().toString(36).substr(2, 9),
      platform: composingPlatform,
      content: draftContent,
      timestamp: new Date().toISOString(),
      engagement: {
        likes: Math.floor(Math.random() * 500) + 50,
        shares: Math.floor(Math.random() * 100) + 10,
        comments: Math.floor(Math.random() * 50) + 5
      }
    };
    setPostHistory(prev => [newPost, ...prev]);
    setIsComposing(false);
    setDraftContent('');
    setCompositionGoal('');
    setErrorMessage({ title: "Transmission Sent", body: `Post successfully deployed to ${composingPlatform} signal.` });
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setErrorMessage({ title: "Signal Shared", body: "Intelligence link copied to clipboard." });
  };

  const executeExport = async (type: 'word' | 'pdf' | 'delete') => {
    if (type !== 'delete' && type !== 'pdf' && !checkCapability('canExportReports', 'Dominance')) return;
    if (type === 'delete') {
      if (!scanId) {
        setErrorMessage({ title: "System Error", body: "Intelligence record ID not identified. Try accessing from history." });
        return;
      }
      setDossierToDelete(true);
      return;
    }

    setIsExporting(true);

    const rawLogo = user?.businessDetails?.logo || 
                    report.profileBadge?.logoUrl || 
                    (report as any).logoUrl || 
                    (report.website ? `https://www.google.com/s2/favicons?domain=${report.website}&sz=128` : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.businessDetails?.name || report.businessName)}&background=random&size=128`);

    let logoDataUrl = '';
    if (rawLogo) {
      try {
        logoDataUrl = await getBase64Image(rawLogo);
      } catch {
        logoDataUrl = rawLogo;
      }
    }
    const effectiveLogo = logoDataUrl || rawLogo || '';
    setExportLogoUrl(effectiveLogo);

    setIsDossierVisible(true);
    
    // Wait for the dossier to render and images to load
    let element: HTMLDivElement | null = null;
    for (let i = 0; i < 30; i++) {
      element = dossierRef.current;
      // We expect at least 3 pages based on the layout
      if (element && element.children.length >= 3) {
        break;
      }
      await new Promise(r => setTimeout(r, 200));
    }

    if (element) {
      const imgs = Array.from(element.querySelectorAll('img'));
      await Promise.all(imgs.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(res => {
          img.onload = res;
          img.onerror = res;
        });
      }));
    }
    
    // Add a final small delay to ensure rendering is settled
    await new Promise(r => setTimeout(r, 300));
    
    const fileName = `Ocula-Dossier-${report.businessName.replace(/\s+/g, '-')}`;
    
    try {
      if (type === 'word') {
        const body = `
          <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
          <head>
            <meta charset='utf-8'>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
              h1 { color: #4338ca; border-bottom: 2px solid #4338ca; padding-bottom: 10px; }
              h2 { color: #3730a3; margin-top: 30px; }
              h3 { color: #4f46e5; }
              .score-box { background: #f1f5f9; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0; }
              .score { font-size: 48px; font-weight: bold; color: #312e81; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
              th { background-color: #f8fafc; font-weight: bold; }
              .priority-high { color: #e11d48; font-weight: bold; }
              .priority-medium { color: #d97706; font-weight: bold; }
              .priority-low { color: #059669; font-weight: bold; }
            </style>
          </head>
          <body>
            <div style="text-align: center; margin-bottom: 50px;">
              ${effectiveLogo ? `<div style="text-align: center; margin-bottom: 20px;"><img src="${effectiveLogo}" style="max-height: 90px; max-width: 240px; object-fit: contain;" alt="Brand Logo" /></div>` : ''}
              <h1 style="font-size: 32px; color: ${user?.businessDetails?.brandColor || '#4338ca'}; border: none; margin: 0;">${(user?.businessDetails?.name || report.businessName).toUpperCase()} STRATEGIC DOSSIER</h1>
              <p style="font-size: 18px; color: #64748b;">Intelligence Report for ${user?.businessDetails?.name || report.businessName}</p>
              ${report.focusMode ? `<p style="font-size: 14px; color: ${user?.businessDetails?.brandColor || '#4f46e5'}; font-weight: bold; text-transform: uppercase;">Focus Mode: ${report.focusMode}</p>` : ''}
              <p style="font-size: 12px; color: #94a3b8;">Generated on ${new Date().toLocaleDateString()}</p>
            </div>

            <div class="score-box">
              <div style="font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Overall Visibility Score</div>
              <div class="score">${report.overallScore}</div>
            </div>

            <h2>Executive Summary</h2>
            <p>${report.summary}</p>

            <h2>Visibility Score Trajectory Over Time</h2>
            <table>
              <tr><th>Period</th><th>Visibility Score</th><th>Industry Benchmark</th><th>Change</th></tr>
              ${dossierTrendData.map(d => `
                <tr>
                  <td>${d.period}</td>
                  <td><b>${d.score}%</b></td>
                  <td>${d.benchmark}%</td>
                  <td style="color: ${d.change >= 0 ? '#059669' : '#e11d48'}; font-weight: bold;">
                    ${d.change >= 0 ? '+' : ''}${d.change} pts
                  </td>
                </tr>
              `).join('')}
            </table>

            <h2>Visibility Breakdown</h2>
            <table>
              <tr><th>Category</th><th>Score</th><th>Status</th><th>Assessment</th></tr>
              ${(report.categories || []).map(c => `
                <tr>
                  <td>${c.name}</td>
                  <td>${c.score}%</td>
                  <td>${c.status.toUpperCase()}</td>
                  <td>${c.description}</td>
                </tr>
              `).join('')}
            </table>

            <h2>Strategic SWOT Analysis</h2>
            <table style="width: 100%;">
              <tr>
                <td style="width: 50%; vertical-align: top; background: #f0fdf4;">
                  <h3 style="margin-top: 0; color: #166534;">Strengths</h3>
                  <ul>${(report.swotAnalysis?.strengths || []).map(s => `<li>${s}</li>`).join('')}</ul>
                </td>
                <td style="width: 50%; vertical-align: top; background: #fff1f2;">
                  <h3 style="margin-top: 0; color: #991b1b;">Weaknesses</h3>
                  <ul>${(report.swotAnalysis?.weaknesses || []).map(s => `<li>${s}</li>`).join('')}</ul>
                </td>
              </tr>
              <tr>
                <td style="vertical-align: top; background: #eff6ff;">
                  <h3 style="margin-top: 0; color: #1e40af;">Opportunities</h3>
                  <ul>${(report.swotAnalysis?.opportunities || []).map(s => `<li>${s}</li>`).join('')}</ul>
                </td>
                <td style="vertical-align: top; background: #f8fafc;">
                  <h3 style="margin-top: 0; color: #1e293b;">Threats</h3>
                  <ul>${(report.swotAnalysis?.threats || []).map(s => `<li>${s}</li>`).join('')}</ul>
                </td>
              </tr>
            </table>

            <h2>Keyword Intelligence</h2>
            <table>
              <tr><th>Keyword</th><th>Impact</th><th>Difficulty</th><th>Search Volume</th></tr>
              ${(filteredReport.keywordAnalysis?.suggestedKeywords || []).map(kw => `
                <tr>
                  <td>${kw.term}</td>
                  <td>${kw.impact.toUpperCase()}</td>
                  <td>${kw.difficulty}/100</td>
                  <td>${kw.searchVolume.toLocaleString()}</td>
                </tr>
              `).join('')}
            </table>

            <h2>Competitive Landscape</h2>
            <table>
              <tr><th>Competitor</th><th>Visibility Score</th><th>Trend</th></tr>
              ${(filteredReport.competitorComparison || []).map(comp => `
                <tr>
                  <td>${comp.name}</td>
                  <td>${comp.score}%</td>
                  <td>${(comp.trend || 'stable').toUpperCase()}</td>
                </tr>
              `).join('')}
            </table>

            <h2>Strategic Roadmap</h2>
            <table>
              <tr><th>Priority</th><th>Action Item</th><th>Category</th><th>Expected Impact</th></tr>
              ${(report.recommendations || []).map(rec => `
                <tr>
                  <td class="priority-${rec.priority}">${rec.priority.toUpperCase()}</td>
                  <td>${rec.task}</td>
                  <td>${rec.category}</td>
                  <td>${rec.impact}</td>
                </tr>
              `).join('')}
            </table>

            <div style="margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 10px; color: #94a3b8; text-align: center;">
              This report was generated by Ocula Intelligence. All data is based on real-time market scrying.
            </div>
          </body>
          </html>`;
        const blob = new Blob(['\ufeff', body], { type: 'application/msword' });
        const link = document.createElement('a'); 
        link.href = URL.createObjectURL(blob); 
        link.download = `${fileName}.doc`; 
        link.click();
      } else if (type === 'pdf') {
        const element = dossierRef.current;
        if (!element) {
          throw new Error("Dossier template element not found in DOM");
        }
        
        // Grab the individual page div children
        const pages = Array.from(element.children) as HTMLElement[];
        if (pages.length === 0) {
          throw new Error("No pages found inside dossier template");
        }
        
        // Create an A4 PDF
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        // Loop through each page, capture high-quality PNG with html2canvas and add to PDF
        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];
          let dataUrl = '';

          try {
            const canvas = await html2canvas(page, {
              scale: 2, // High DPI rendering
              useCORS: true,
              allowTaint: true,
              backgroundColor: '#ffffff',
              logging: false,
              ignoreElements: (element) => element.hasAttribute && element.hasAttribute('data-html2canvas-ignore'),
            });
            dataUrl = canvas.toDataURL('image/png', 1.0);
          } catch {
            // Fallback to html-to-image if canvas conversion encounters CORS restrictions
            dataUrl = await toPng(page, {
              quality: 0.95,
              pixelRatio: 2,
              backgroundColor: '#ffffff',
              filter: (node: any) => {
                if (node.hasAttribute && node.hasAttribute('data-html2canvas-ignore')) return false;
                return true;
              }
            });
          }
          
          if (i > 0) {
            pdf.addPage();
          }
          
          pdf.addImage(dataUrl, 'PNG', 0, 0, 210, 297);
        }
        
        pdf.save(`${fileName}.pdf`);
        setErrorMessage({ title: "Success", body: "PDF report downloaded successfully." });
      }
    } catch (err: any) { 
      setErrorMessage({ title: "Export Error", body: `Failed to generate dossier: ${formatErrorMessage(err)}` }); 
    } finally { 
      setIsExporting(false); 
      setIsDossierVisible(false);
    }
  };

  const handleLaunchTactics = useCallback(async (mission: Campaign) => {
    // If we already have a plan, just show it
    if (mission.tacticalPlan && mission.tacticalPlan.length > 0) {
      setActiveTactics({ content: mission.tacticalPlan, task: mission.name, business: report.businessName });
      return;
    }

    setLoadingTactics(true);
    setActiveTactics({ content: [], task: mission.name, business: report.businessName });
    try {
      const tactics = await generateMissionTactics(report.businessName, mission.objective, mission.name);
      
      // Update local state
      setLocalCampaigns(prev => prev.map(m => m.id === mission.id ? { ...m, tacticalPlan: tactics } : m));
      
      // Persist to storage
      if (scanId) {
        await storageService.updateCampaign(scanId, mission.id, { tacticalPlan: tactics });
      }

      setActiveTactics({ content: tactics, task: mission.name, business: report.businessName });
    } catch (e) {
      try {
        const plan = await generateAIFix(report.businessName, mission.objective, mission.name);
        const planArray = [plan];
        
        setLocalCampaigns(prev => prev.map(m => m.id === mission.id ? { ...m, tacticalPlan: planArray } : m));
        if (scanId) {
          await storageService.updateCampaign(scanId, mission.id, { tacticalPlan: planArray });
        }

        setActiveTactics({ content: planArray, task: mission.name, business: report.businessName });
      } catch (err) {
        setErrorMessage({ title: "Tactical Error", body: "Failed to generate action plan." });
      }
    } finally { setLoadingTactics(false); }
  }, [report.businessName, scanId]);

  const handleDeleteMission = (id: string, name: string) => {
    setMissionToDelete({ id, name });
  };

  const confirmDeleteMission = async () => {
    if (!missionToDelete) return;
    await storageService.deleteCampaign(missionToDelete.id);
    setLocalCampaigns(prev => prev.filter(c => c.id !== missionToDelete.id));
    setMissionToDelete(null);
  };

  const handleUpdateProgress = async (id: string, newProgress: number) => {
    await storageService.updateCampaignProgress(id, newProgress);
    setLocalCampaigns(prev => prev.map(c => c.id === id ? { ...c, progress: newProgress } : c));
  };

  const confirmDeleteDossier = async () => {
    if (!scanId) return;
    await storageService.deleteScan(scanId);
    setDossierToDelete(false);
    onReset();
  };

  return (
    <div className="main-dashboard-wrapper">
      {isPrintView && (
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-slate-900/95 dark:bg-[#080808]/95 backdrop-blur-md border-b border-slate-800 text-white px-4 py-3 shadow-2xl flex flex-wrap items-center justify-between gap-4 print:hidden animate-fade-in">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse shrink-0" />
            <span className="text-xs font-black uppercase tracking-wider">Print View Enabled</span>
            <span className="text-slate-400 text-xs hidden md:inline font-mono">| Clean static layout active.</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button 
              onClick={() => {
                try {
                  window.print();
                } catch (err: any) {
                  setErrorMessage({ 
                    title: "Browser Print Restricted", 
                    body: "Browser window.print() is restricted by this sandbox iframe. Please use the 'Download PDF' or 'Export Word' options, which will generate identical documents!" 
                  });
                }
              }} 
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
            >
              <Printer className="w-3.5 h-3.5" />
              Browser Print
            </button>
            <button 
              onClick={() => executeExport('pdf')} 
              disabled={isExporting}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
            >
              {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
              Download PDF
            </button>
            <button 
              onClick={() => executeExport('word')} 
              disabled={isExporting}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
            >
              <FileText className="w-3.5 h-3.5" />
              Export Word
            </button>
            <button 
              onClick={() => setIsPrintView(false)} 
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-black uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all active:scale-95 border border-slate-700/60"
            >
              Exit
            </button>
          </div>
        </div>
      )}

      <div ref={dashboardRef} className={`w-full max-w-full mx-auto px-4 sm:px-4 lg:px-5 py-10 sm:py-5 space-y-4 transition-all duration-700 ${isExporting ? 'bg-white' : ''} ${isPrintView ? 'pt-16 sm:pt-16' : ''}`}>
      </div>
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
      {missionToDelete && (
        <motion.div 
          key="delete-mission-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" 
          data-html2canvas-ignore
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="surface w-full max-w-md p-4 space-y-4 border-l-4 border-rose-500"
          >
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-xl flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Terminate Mission?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                Are you sure you want to permanently delete <span className="text-slate-900 dark:text-white font-bold">"{missionToDelete.name}"</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setMissionToDelete(null)}
                className="flex-1 btn-secondary btn-sm"
              >
                Abort
              </button>
              <button 
                onClick={confirmDeleteMission}
                className="flex-1 btn-base bg-rose-500 text-white shadow-lg hover:bg-rose-600 btn-sm"
              >
                Confirm Deletion
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      <AnimatePresence>
      {dossierToDelete && (
        <motion.div 
          key="delete-dossier-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" 
          data-html2canvas-ignore
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="surface w-full max-w-md p-4 space-y-4 border-l-4 border-rose-500"
          >
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-xl flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Delete Dossier?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                Are you sure you want to permanently delete the intelligence dossier for <span className="text-slate-900 dark:text-white font-bold">"{report.businessName}"</span>?
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setDossierToDelete(false)}
                className="flex-1 btn-secondary btn-sm"
              >
                Abort
              </button>
              <button 
                onClick={confirmDeleteDossier}
                className="flex-1 btn-base bg-rose-500 text-white shadow-lg hover:bg-rose-600 btn-sm"
              >
                Confirm Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      <AnimatePresence>
      {errorMessage && (
        <motion.div 
          key="error-message"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[2100] w-[90%] max-w-md" 
          data-html2canvas-ignore
        >
           <div className="surface p-4 border-l-4 border-rose-500 flex justify-between items-start shadow-2xl">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-1">{errorMessage.title}</p>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  {errorMessage.body}
                </p>
              </div>
              <button onClick={() => setErrorMessage(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <X className="w-4 h-4" />
              </button>
           </div>
        </motion.div>
      )}
      </AnimatePresence>

      <div className="flex flex-col gap-4">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-8 border-b border-slate-200 dark:border-slate-800/60">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white/95 dark:bg-[#080808]/95 backdrop-blur-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-md rounded-none flex flex-col items-center justify-center text-slate-900 dark:text-white relative overflow-hidden group shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{displayScore}</span>
              <span className="text-[8px] sm:text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.25em] mt-2">Score</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                <h1 className="text-2xl font-display sm:text-3xl font-medium tracking-tighter text-slate-900 dark:text-white uppercase break-words leading-tight">{report.businessName}</h1>
                {report.focusMode && (
                  <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-wider border border-indigo-100 dark:border-indigo-800/30 shrink-0 whitespace-nowrap">
                    {report.focusMode === 'standard' ? 'Standard Audit' : 
                     report.focusMode === 'competitor' ? 'Rival Deep-Dive' : 
                     report.focusMode === 'market' ? 'Market Radar' : 
                     report.focusMode === 'social' ? 'Social Pulse' : 
                     report.focusMode === 'gmb' ? 'GMB Focus' : report.focusMode}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-2 px-2 py-1 rounded-md bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 text-emerald-600 dark:text-emerald-400 shrink-0 whitespace-nowrap">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] uppercase tracking-wider font-bold shrink-0">Signal Active</span>
                </span>
                <span className="w-px h-3 bg-slate-300 dark:bg-slate-700 shrink-0 hidden sm:block" />
                <span className="font-mono opacity-60 shrink-0 whitespace-nowrap">ID: {scanId || 'TEMP-' + Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
              </div>
            </div>
          </div>

          {!isPrintView && (
            <div className="flex flex-wrap gap-3">
              <button onClick={onRescan} className="btn-secondary btn-sm gap-2">
                <RefreshCw className="w-4 h-4" />
                Rescan
              </button>
              <button onClick={onReset} className="btn-secondary btn-sm">
                New Scan
              </button>
              {scanId && (
                <button onClick={() => executeExport('delete')} className="btn-danger btn-sm">
                  Delete
                </button>
              )}
              <button onClick={handleAudioBriefing} disabled={isBriefingLoading} className="btn-secondary btn-sm gap-2 rounded-xl">
                {isBriefingLoading ? (
                  <span className="animate-pulse">Loading...</span>
                ) : isPlayingBriefing ? (
                  <><span>Stop</span><span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" /></>
                ) : (
                  <>
                    <Activity className="w-4 h-4" />
                    <span>Audio Brief</span>
                  </>
                )}
              </button>
              <button 
                onClick={handleShare}
                className="btn-secondary btn-sm gap-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
              <button 
                onClick={() => setIsPrintView(true)}
                className="btn-secondary btn-sm gap-2 rounded-xl hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10 border border-slate-200 dark:border-slate-800"
              >
                <Printer className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Print View</span>
              </button>
              <button 
                onClick={() => executeExport('pdf')} 
                disabled={isExporting}
                className="btn-primary btn-sm gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all rounded-xl"
              >
                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                <span>Download Report</span>
              </button>
              <div className="relative">
                <button 
                  onClick={() => executeExport('word')} 
                  disabled={isExporting}
                  className="btn-primary btn-sm gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-slate-900/10 hover:scale-105 active:scale-95 transition-all rounded-xl"
                >
                  {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                  <span>Export Dossier</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        {!isPrintView && (
          <div data-html2canvas-ignore className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-6">
            {[
              { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-3.5 h-3.5" />, permission: Permission.VIEW_DASHBOARD },
              { id: 'executive', label: 'Executive View', icon: <FileText className="w-3.5 h-3.5" />, permission: Permission.VIEW_DASHBOARD },
              { id: 'intelligence', label: 'Intelligence', icon: <Zap className="w-3.5 h-3.5" />, permission: Permission.VIEW_DASHBOARD, tourId: 'intelligence-feed-trigger' },
              { id: 'monitor', label: 'Live Monitor', icon: <Activity className="w-3.5 h-3.5" />, permission: Permission.VIEW_DASHBOARD },
              { id: 'rivals', label: 'Rivals', icon: <Swords className="w-3.5 h-3.5" />, permission: Permission.VIEW_SWOT },
              { id: 'competitors', label: 'Competitor Tracking', icon: <Target className="w-3.5 h-3.5" />, permission: Permission.VIEW_COMPETITORS },
              { id: 'social', label: 'Social', icon: <Share2 className="w-3.5 h-3.5" />, permission: Permission.VIEW_DASHBOARD },
              { id: 'missions', label: 'Missions', icon: <Target className="w-3.5 h-3.5" />, permission: Permission.VIEW_DASHBOARD, tourId: 'nav-missions' },
              { id: 'kpis', label: 'KPIs', icon: <BarChart2 className="w-3.5 h-3.5" />, permission: Permission.VIEW_DASHBOARD }
            ].map((t) => {
              if (!hasPermission(currentUserRole, t.permission)) return null;
              const isActive = activeTab === t.id;
              return (
                <button 
                  key={t.id} 
                  id={t.tourId}
                  onClick={() => setActiveTab(t.id as any)} 
                  className={`relative px-4 py-2.5 rounded-xl transition-all whitespace-nowrap border micro-bounce flex items-center gap-2.5 ${
                    isActive 
                      ? 'text-white dark:text-slate-900 border-transparent shadow-xl shadow-slate-900/10' 
                      : 'surface text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute inset-0 bg-slate-900 dark:bg-white rounded-xl -z-10"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className={`transition-colors ${isActive ? 'text-white dark:text-slate-900' : 'text-slate-400 dark:text-slate-500'}`}>
                    {t.icon}
                  </span>
                  <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.15em] leading-none">{t.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Advanced Filters */}
      {!isPrintView && (
        <div data-html2canvas-ignore className="sticky top-0 z-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-4 lg:px-5 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 py-4 mb-4 transition-all">
          <DashboardFilters 
            competitors={competitorNames}
            onFilterChange={setFilters}
            initialFilters={filters}
          />
        </div>
      )}

      <Suspense fallback={<ComponentLoader />}>
        {activeTab === 'monitor' && (
          <RealTimeDashboard report={filteredReport} isDarkMode={isDarkMode} />
        )}

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-display font-medium text-slate-900 dark:text-white tracking-tight uppercase">
                  Strategic Overview
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">
                  Customizable intelligence feed for <span className="text-indigo-600 dark:text-indigo-400 font-bold">{report.businessName}</span>
                </p>
              </div>
              
              {!isPrintView && (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsCustomizing(!isCustomizing)}
                    className={`btn-sm gap-2 transition-all ${isCustomizing ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    {isCustomizing ? "Save Layout" : "Customize Dashboard"}
                  </button>
                  <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 ml-2 pl-4">
                    <button 
                      onClick={() => handleRefreshInsights()}
                      disabled={isRefreshingInsights}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all font-bold text-xs"
                      title="Refresh AI Insights"
                    >
                      <RefreshCw className={`w-4 h-4 ${isRefreshingInsights ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {isCustomizing && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-indigo-50 dark:bg-indigo-900/10 border-2 border-dashed border-indigo-200 dark:border-indigo-900/30 rounded-2xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Layout Architect Mode</p>
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Drag corners to resize • Drag handles to reorder</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {widgets.map((w) => (
                    <button
                      key={`${w.id}-master-toggle`}
                      onClick={() => toggleWidgetVisibility(w.id)}
                      className={`btn-xs gap-2 rounded-lg transition-all ${w.visible ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 opacity-60'}`}
                    >
                      {w.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span className="font-bold text-[9px] uppercase tracking-wider">{w.name}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <div className="relative">
              <ResponsiveGridLayout
                className="layout"
                layouts={layouts}
                breakpoints={{ xl: 1600, lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ xl: 16, lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                rowHeight={100}
                draggableHandle=".drag-handle"
                onLayoutChange={handleLayoutChange}
                isDraggable={isCustomizing}
                isResizable={isCustomizing}
                margin={[16, 16]}
              >
                {widgets.map((widget) => {
                  if (!widget.visible && !isCustomizing) return null;

                  return (
                    <div key={widget.id} className={`group ${!widget.visible ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                      <div className={`h-full w-full relative transition-all bg-white dark:bg-[#0c0c0c] rounded-2xl border ${isCustomizing ? 'border-indigo-500 shadow-2xl z-50' : 'border-slate-100 dark:border-slate-800 shadow-sm'} overflow-hidden`}>
                        {isCustomizing && (
                          <div className="absolute left-1/2 -translate-x-1/2 top-1 z-[60] p-1.5 bg-indigo-600 text-white rounded-full shadow-xl drag-handle cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                            <GripVertical className="w-3 h-3" />
                          </div>
                        )}

                        <motion.div 
                          className={`h-full w-full ${['overviewStats', 'marketHub', 'profile', 'swot', 'support', 'rivalSnapshot', 'visibilityProjection', 'competitorWatchlist', 'searchVisibility', 'strategicInsights', 'keywords', 'socialIntelligence', 'marketVelocity'].includes(widget.id) ? 'overflow-y-auto custom-scrollbar' : 'overflow-hidden'}`}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                        >
                          {(() => {
                            // WIDGET ROUTING LOGIC
                            if (widget.id === 'overviewStats') {
                              return (
                                <div className="p-3 sm:p-4 h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 bg-slate-50/30 dark:bg-transparent overflow-y-auto custom-scrollbar">
                                  {overviewMetrics.map((met, i) => (
                                    <div key={i} className="flex flex-col justify-between p-3 sm:p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover-lift transition-all">
                                      <div className="flex justify-between items-start">
                                        <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400">
                                          {met.icon}
                                        </div>
                                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                                          met.trend === 'up' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                          met.trend === 'down' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                          'bg-slate-50 text-slate-500 border-slate-100'
                                        }`}>
                                          {met.change}
                                        </div>
                                      </div>
                                      <div className="mt-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{met.label}</p>
                                        <h3 className="text-2xl font-display font-medium text-slate-900 dark:text-white mt-2 tabular-nums">{met.value}{met.label === 'Search Visibility' ? '%' : ''}</h3>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              );
                            }

                            if (widget.id === 'marketVelocity') {
                              return (
                                <div className="p-6 h-full flex flex-col bg-white dark:bg-slate-900">
                                  <div className="flex justify-between items-center mb-6">
                                    <div className="space-y-1">
                                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500">Market Velocity</h3>
                                      <p className="text-[8px] font-bold text-slate-400 uppercase">Growth Trajectory Analysis</p>
                                    </div>
                                    <TrendingUp className="w-4 h-4 text-slate-300" />
                                  </div>
                                  <div className="flex-grow">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <AreaChart data={trendData} margin={{ top: 10, right: 15, left: -20, bottom: 5 }}>
                                        <defs>
                                          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                          </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#1e293b" : "#f1f5f9"} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 800, fill: '#64748b' }} />
                                        <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} />
                                        <Tooltip 
                                          contentStyle={{ backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" name="Ocula Score" />
                                        <Area type="monotone" dataKey="marketAvg" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" fill="transparent" name="Market Avg" />
                                      </AreaChart>
                                    </ResponsiveContainer>
                                  </div>
                                </div>
                              );
                            }

                            if (widget.id === 'competitorWatchlist') {
                              return (
                                <Suspense fallback={<ComponentLoader />}>
                                  <CompetitorWatchlistWidget report={filteredReport} />
                                </Suspense>
                              );
                            }

                            if (widget.id === 'visibilityProjection') {
                              return (
                                <Suspense fallback={<ComponentLoader />}>
                                  <VisibilityProjectionWidget report={filteredReport} isDarkMode={isDarkMode} />
                                </Suspense>
                              );
                            }

                            if (widget.id === 'rivalSnapshot') {
                              return (
                                <div className="p-6 h-full flex flex-col bg-white dark:bg-slate-900">
                                  <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Competitive Snapshot</h3>
                                    <Swords className="w-4 h-4 text-slate-300" />
                                  </div>
                                  <div className="space-y-3 flex-grow overflow-y-auto custom-scrollbar">
                                    {topCompetitors.map((comp, idx) => (
                                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-lg surface flex items-center justify-center font-black text-xs text-slate-400 shadow-sm shrink-0">
                                            {(comp?.name || '').charAt(0)}
                                          </div>
                                          <div>
                                            <p className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-tight truncate max-w-[120px]">{comp.name}</p>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{comp.score} VISIBILITY</p>
                                          </div>
                                        </div>
                                        <TrendBadge trend={comp.trend} />
                                      </div>
                                    ))}
                                    {/* YOU Comparison Row */}
                                    <div className="flex items-center justify-between p-3 bg-indigo-600 rounded-xl border border-indigo-500 text-white shadow-lg">
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-black text-xs shrink-0">
                                          {(report?.businessName || '').charAt(0)}
                                        </div>
                                        <div>
                                          <p className="text-[10px] font-black uppercase tracking-tight">YOU</p>
                                          <p className="text-[8px] font-bold text-indigo-100 uppercase tracking-widest">{report.overallScore} SCORE</p>
                                        </div>
                                      </div>
                                      <Activity className="w-3 h-3 animate-pulse" />
                                    </div>
                                  </div>
                                </div>
                              );
                            }

                            if (widget.id === 'searchVisibility') {
                              return (
                                <div className="h-full scroll-mt-32">
                                  <Suspense fallback={<ComponentLoader />}>
                                    <SearchVisibilityWidget report={report} />
                                  </Suspense>
                                </div>
                              );
                            }

                            if (widget.id === 'strategicInsights') {
                              return (
                                <div className="h-full bg-slate-900 dark:bg-black p-8 text-white flex flex-col relative overflow-hidden dot-grid">
                                  <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] -mr-40 -mt-40"></div>
                                  <div className="relative z-10 flex flex-col h-full">
                                    <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
                                      <div className="flex items-center gap-4">
                                        <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                                          <Shield className="w-6 h-6 text-indigo-400" />
                                        </div>
                                        <div>
                                          <h3 className="stat-value text-white uppercase tracking-tight">Strategic Intel</h3>
                                          <p className="col-header text-indigo-400 mt-1 opacity-100">AI-SCRIED ANALYSIS Alpha v4</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-4">
                                        <div className="text-right">
                                           <div className="col-header">Confidence</div>
                                           <div className="data-value text-emerald-400">98.4%</div>
                                        </div>
                                        <div className="h-8 w-px bg-white/10" />
                                        <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
                                      </div>
                                    </div>
                                    
                                    <div className="flex-grow overflow-y-auto pr-4 custom-scrollbar">
                                      <div className="surface dark-glass p-6 mb-8 border-white/5 bg-white/5">
                                        <div className="section-label mb-4">EXECUTIVE SUMMARY</div>
                                        <p className="text-xl text-slate-300 font-serif italic leading-relaxed">
                                          "{report.strategicInsights?.explanation || 'Strategic insights are being generated for this profile.'}"
                                        </p>
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                          <h4 className="section-label text-emerald-400 flex items-center gap-2">
                                            <Sparkles className="w-4 h-4" /> ASSET OPTIMIZATION
                                          </h4>
                                          <div className="space-y-3">
                                            {(report.strategicInsights?.actionableImprovements || []).map((item, i) => (
                                              <div key={i} className="flex gap-4 items-start p-4 surface border-white/5 bg-white/5 hover:bg-white/10 transition-colors group">
                                                <div className="w-6 h-6 bg-emerald-500/20 rounded flex items-center justify-center text-emerald-400 text-[10px] font-black group-hover:scale-110 transition-transform">{i+1}</div>
                                                <p className="text-sm text-slate-400 font-medium group-hover:text-white transition-colors leading-relaxed">{item}</p>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                        <div className="space-y-6">
                                          <h4 className="section-label text-rose-400 flex items-center gap-2">
                                            <Target className="w-4 h-4" /> THREAT EXPOSURE
                                          </h4>
                                          <div className="space-y-3">
                                            {(report.strategicInsights?.missedOpportunities || []).map((item, i) => (
                                              <div key={i} className="flex gap-4 items-start p-4 surface border-white/5 bg-white/5 hover:bg-white/10 transition-colors group">
                                                <div className="w-6 h-6 bg-rose-500/20 rounded flex items-center justify-center text-rose-400 text-[10px] font-black group-hover:scale-110 transition-transform">!</div>
                                                <p className="text-sm text-slate-400 font-medium group-hover:text-white transition-colors leading-relaxed">{item}</p>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            }

                            // EXISTING WIDGETS
                            if (widget.id === 'marketHub') {
                              return <div className="h-full overflow-y-auto custom-scrollbar p-1"><Suspense fallback={<ComponentLoader />}><MarketDominanceHub scans={historyScans.length > 0 ? historyScans : [{ id: scanId || 'current', businessName: report.businessName, timestamp: new Date().toISOString(), score: report.overallScore, report: report }]} isDarkMode={isDarkMode} /></Suspense></div>;
                            }

                            if (widget.id === 'profile') {
                              const profile = report.profileBadge || { businessName: report.businessName, industry: 'Unknown Industry', location: 'Global', visibilityScore: report.overallScore, visibilityLevel: 'Emerging', tagline: 'Visibility Analysis', logoUrl: '' };
                              const activeBrandColor = user?.businessDetails?.brandColor || '#6366f1';
                              const logoSrc = user?.businessDetails?.logo || profile.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.businessDetails?.name || profile.businessName || report.businessName)}&background=random&size=128`;
                              return (
                                <div className="h-full p-4 sm:p-6 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 overflow-y-auto custom-scrollbar">
                                  <div className="relative mb-3 sm:mb-4">
                                    <div className="absolute inset-0 blur-3xl rounded-full opacity-30" style={{ backgroundColor: activeBrandColor }}></div>
                                    <img src={logoSrc} className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl relative z-10 shadow-2xl border-2 object-cover" style={{ borderColor: activeBrandColor }} alt={profile.businessName} />
                                  </div>
                                  <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white leading-tight">{user?.businessDetails?.name || profile.businessName}</h3>
                                  <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1 sm:mt-2">{user?.businessDetails?.industry || profile.industry}</p>
                                  <div className="mt-3 sm:mt-4 px-4 py-1.5 text-white rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-[0.15em] shadow-lg" style={{ backgroundColor: activeBrandColor }}>
                                    {profile.visibilityLevel} TIER
                                  </div>
                                </div>
                              );
                            }

                            if (widget.id === 'swot') {
                              return <div className="h-full"><Suspense fallback={<ComponentLoader />}><SWOTAnalysis swot={report.swotAnalysis || localSwot} isCompact={true} isDarkMode={isDarkMode} variant="widget" isFullAccess={capabilities.canViewFullSWOT} /></Suspense></div>;
                            }

                            if (widget.id === 'keywords') {
                              return (
                                <div className="p-8 h-full flex flex-col bg-white dark:bg-slate-900">
                                  <div className="flex justify-between items-center mb-8">
                                    <div className="space-y-1">
                                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Keyword Pulse</h3>
                                      <p className="text-[8px] font-bold text-indigo-500 uppercase">Competitive Density</p>
                                    </div>
                                    <BarChart2 className="w-5 h-5 text-slate-200" />
                                  </div>
                                  <div className="flex-grow">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <BarChart data={keywordCompetitionData.slice(0, 6)} layout="vertical">
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="term" type="category" width={100} tick={{ fontSize: 9, fontWeight: 800, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                        <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '10px' }} />
                                        <Bar dataKey="competitionValue" fill="#6366f1" radius={[0, 6, 6, 0]} barSize={16}>
                                          {keywordCompetitionData.slice(0, 6).map((entry, index) => (
                                            <Cell key={`keyword-pulse-cell-${index}-${entry.term}`} fill={entry.competitionValue === 3 ? '#f43f5e' : entry.competitionValue === 2 ? '#fbbf24' : '#10b981'} />
                                          ))}
                                        </Bar>
                                      </BarChart>
                                    </ResponsiveContainer>
                                  </div>
                                </div>
                              );
                            }

                            if (widget.id === 'socialIntelligence') {
                              return (
                                <div className="p-6 h-full flex flex-col bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl relative overflow-hidden group">
                                  <div className="flex justify-between items-start mb-4">
                                    <div className="space-y-1">
                                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Social Intelligence</h3>
                                      <p className="text-[8px] font-black text-pink-500 uppercase tracking-wider">Resonance & Audience Reach</p>
                                    </div>
                                    <div className="p-2 bg-pink-50 dark:bg-pink-950/40 rounded-xl border border-pink-100 dark:border-pink-900">
                                      <Share2 className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                                    </div>
                                  </div>

                                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-4 leading-relaxed font-semibold">
                                    Tracks brand presence via <strong className="text-pink-500">Resonance</strong> (active user engagement rate) and <strong className="text-purple-500">Reach</strong> (potential audience exposure).
                                  </p>

                                  <div className="flex-grow min-h-[140px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <ComposedChart data={composedSocialData} margin={{ top: 10, right: 10, bottom: 5, left: 10 }}>
                                        <XAxis 
                                          dataKey="name" 
                                          tick={{ fontSize: 9, fontWeight: 700, fill: isDarkMode ? '#94a3b8' : '#64748b' }} 
                                          axisLine={false} 
                                          tickLine={false} 
                                        />
                                        <YAxis hide />
                                        <Tooltip 
                                          cursor={{ fill: 'rgba(236, 72, 153, 0.04)' }} 
                                          content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                              const data = payload[0].payload;
                                              return (
                                                <div className="bg-slate-950 text-white p-3 rounded-xl border border-slate-800 text-[10px] shadow-xl space-y-1 font-sans min-w-[160px] z-50">
                                                  <p className="font-extrabold uppercase tracking-wider text-[11px] text-pink-400">{data.name}</p>
                                                  <div className="flex justify-between items-center gap-4 text-slate-200">
                                                    <span>Platform Resonance:</span>
                                                    <span className="font-black text-pink-400">{data.score}/100</span>
                                                  </div>
                                                  <div className="flex justify-between items-center gap-4 text-slate-200">
                                                    <span>Audience Exposure:</span>
                                                    <span className="font-black text-purple-400">
                                                      {data.reach >= 80 ? 'High' : data.reach >= 50 ? 'Medium' : 'Low'} ({data.reach}/100)
                                                    </span>
                                                  </div>
                                                  {data.activity && (
                                                    <div className="pt-1.5 mt-1 border-t border-slate-900 text-[9px] text-slate-400 leading-normal">
                                                      <span className="font-semibold text-slate-500">Post Frequency:</span> {data.activity}
                                                    </div>
                                                  )}
                                                </div>
                                              );
                                            }
                                            return null;
                                          }}
                                        />
                                        <Bar dataKey="score" fill="#ec4899" radius={[4, 4, 0, 0]} barSize={20} />
                                        <Line type="monotone" dataKey="reach" stroke="#a855f7" strokeWidth={2.5} dot={{ r: 3, fill: '#a855f7' }} />
                                      </ComposedChart>
                                    </ResponsiveContainer>
                                  </div>

                                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-center items-center gap-6">
                                    <div className="flex items-center gap-1.5">
                                      <span className="w-2.5 h-2.5 bg-[#ec4899] rounded" />
                                      <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Resonance (Engagement)</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="w-2.5 h-0.5 bg-[#a855f7] rounded" />
                                      <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Audience Reach</span>
                                    </div>
                                  </div>

                                  <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800/50 text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed space-y-1.5">
                                    <p className="font-extrabold text-[9px] text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                      <span>💡 Metric Calibration Key</span>
                                    </p>
                                    <p>• <strong>Resonance</strong>: Measures content interaction strength. Low scores mean brand content is lost to competitors' noise.</p>
                                    <p>• <strong>Audience Exposure & Attenuation</strong>: Measures signal coverage. High Attenuation (Low Exposure) signals that algorithm filters are suppressing posts, demanding higher posting frequency.</p>
                                  </div>
                                </div>
                              );
                            }

                            if (widget.id === 'usage') {
                              const account = user?.account || { tier: 'free', unitsTotal: TIER_CONFIGS['free'].units, unitsUsed: 0, unitsRemaining: TIER_CONFIGS['free'].units, renewalDate: new Date().toISOString() };
                              const usagePercentage = account.unitsTotal > 0 ? Math.min(100, (account.unitsUsed / account.unitsTotal) * 100) : 0;
                              return (
                                <div className="p-6 h-full flex items-center justify-between gap-10 bg-gradient-to-r from-indigo-600/5 to-indigo-700/5 dark:from-indigo-600/10 dark:to-indigo-700/10">
                                  <div className="flex items-center gap-6">
                                    <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-500/20">
                                      <Zap className="w-6 h-6" />
                                    </div>
                                    <div>
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Intelligence Resource</p>
                                      <h3 className="text-2xl font-display font-medium text-slate-900 dark:text-white tabular-nums">{account.unitsRemaining.toLocaleString()} CREDITS</h3>
                                    </div>
                                  </div>
                                  <div className="flex-grow max-w-md hidden sm:block">
                                    <div className="flex justify-between items-end mb-2">
                                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">System Utilization</span>
                                      <span className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-widest">{Math.round(usagePercentage)}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-100 dark:border-slate-700/50">
                                      <div className="h-full bg-indigo-600 rounded-full shimmer-effect" style={{ width: `${usagePercentage}%` }}></div>
                                    </div>
                                  </div>
                                </div>
                              );
                            }

                            if (widget.id === 'radar') {
                              return (
                                <div key="radar" id="widget-radar" className="p-6 h-full flex flex-col bg-white dark:bg-slate-900">
                                  <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                                      <Radar className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                                    </div>
                                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Radar Synthesis</h3>
                                  </div>
                                  
                                  <div className="flex-grow">
                                    <ResponsiveContainer width="100%" height="90%">
                                      <RadarChart data={safeRadarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                                        <PolarGrid stroke={isDarkMode ? "#334155" : "#e2e8f0"} />
                                        <PolarAngleAxis dataKey="subject" tick={{fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 9, fontWeight: 500}} />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                        <RechartsRadar 
                                          name="Your Performance"
                                          dataKey="A" 
                                          stroke={isDarkMode ? "#ffffff" : "#010101"} 
                                          strokeWidth={2}
                                          fill={isDarkMode ? "#ffffff" : "#010101"} 
                                          fillOpacity={0.1} 
                                          isAnimationActive={!isExporting} 
                                        />
                                        <RechartsRadar 
                                          name="Market Benchmark"
                                          dataKey="benchmark" 
                                          stroke="#94a3b8" 
                                          strokeWidth={2}
                                          strokeDasharray="4 4"
                                          fill="#94a3b8" 
                                          fillOpacity={0.1} 
                                          isAnimationActive={!isExporting} 
                                        />
                                        <Tooltip 
                                          contentStyle={{borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', color: isDarkMode ? '#fff' : '#0f172a', padding: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '10px'}}
                                          itemStyle={{ fontSize: '10px', fontWeight: 500, textTransform: 'uppercase' }}
                                          cursor={{ stroke: '#94a3b8', strokeWidth: 1 }}
                                        />
                                        <Legend wrapperStyle={{ paddingTop: '5px', fontSize: '9px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1px' }} />
                                      </RadarChart>
                                    </ResponsiveContainer>
                                  </div>
                                </div>
                              );
                            }

                            if (widget.id === 'keywordMatrix') {
                              return (
                                <div key="keywordMatrix" id="widget-keywordMatrix" className="p-6 h-full flex flex-col bg-white dark:bg-slate-900">
                                  <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                                        <Target className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                                      </div>
                                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Opportunity Matrix</h3>
                                    </div>
                                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">Volume vs Difficulty</span>
                                  </div>
                                  
                                  <div className="flex-grow">
                                    <ResponsiveContainer width="100%" height="85%">
                                      <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#1e293b" : "#f1f5f9"} vertical={false} />
                                        <XAxis 
                                          type="number" 
                                          dataKey="difficulty" 
                                          name="Difficulty" 
                                          unit="%" 
                                          domain={[0, 100]}
                                          tick={{fontSize: 8, fontWeight: 900, fill: '#94a3b8'}}
                                          axisLine={false}
                                          tickLine={false}
                                        />
                                        <YAxis 
                                          type="number" 
                                          dataKey="volume" 
                                          name="Volume" 
                                          tick={{fontSize: 8, fontWeight: 900, fill: '#94a3b8'}}
                                          axisLine={false}
                                          tickLine={false}
                                        />
                                        <ZAxis type="number" dataKey="impact" range={[50, 400]} name="Impact" />
                                        <Tooltip 
                                          cursor={{ strokeDasharray: '3 3' }}
                                          content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                              const data = payload[0].payload;
                                              return (
                                                <div className="surface p-3 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 text-[10px]">
                                                  <p className="font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">{data.name}</p>
                                                  <div className="space-y-1">
                                                    <p className="font-bold text-slate-500">Volume: <span className="text-slate-900 dark:text-white">{data.volume.toLocaleString()}</span></p>
                                                    <p className="font-bold text-slate-500">Difficulty: <span className="text-slate-900 dark:text-white">{data.difficulty}%</span></p>
                                                    <p className="font-bold text-slate-500">Impact: <span className={`uppercase font-black ${data.impactLabel === 'high' ? 'text-emerald-500' : 'text-amber-500'}`}>{data.impactLabel}</span></p>
                                                  </div>
                                                </div>
                                              );
                                            }
                                            return null;
                                          }}
                                        />
                                        <Scatter name="Keywords" data={keywordMatrixData}>
                                          {keywordMatrixData.map((entry, index) => (
                                            <Cell 
                                              key={`keyword-scatter-cell-overview-${index}-${entry.name}`} 
                                              fill={entry.impactLabel === 'high' ? '#10b981' : entry.impactLabel === 'medium' ? '#6366f1' : '#94a3b8'} 
                                              fillOpacity={0.7}
                                              stroke={entry.impactLabel === 'high' ? '#059669' : entry.impactLabel === 'medium' ? '#4f46e5' : '#64748b'}
                                              strokeWidth={2}
                                            />
                                          ))}
                                        </Scatter>
                                      </ScatterChart>
                                    </ResponsiveContainer>
                                  </div>
                                </div>
                              );
                            }

                            if (widget.id === 'marketTreemap') {
                              return (
                                <div key="marketTreemap" id="widget-marketTreemap" className="p-6 h-full flex flex-col bg-white dark:bg-slate-900">
                                  <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                                        <PieChart className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                                      </div>
                                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Market Distribution</h3>
                                    </div>
                                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">Category Weighting</span>
                                  </div>
                                  
                                  <div className="flex-grow overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                                    <ResponsiveContainer width="100%" height="95%">
                                      <Treemap
                                        data={treemapData}
                                        dataKey="size"
                                        nameKey="name"
                                        aspectRatio={4 / 3}
                                        stroke="#fff"
                                        fill="#6366f1"
                                        content={((props: any) => {
                                          const { x, y, width, height, index, payload, name } = props;
                                          const colorsList = ['#4f46e5', '#6366f1', '#8b5cf6', '#ec4899', '#9333ea', '#f59e0b', '#10b981'];
                                          const color = colorsList[index % colorsList.length];
                                          
                                          return (
                                            <g key={`treemap-item-overview-${name || 'node'}-${index}`}>
                                              <rect
                                                x={x}
                                                y={y}
                                                width={width}
                                                height={height}
                                                style={{
                                                  fill: color,
                                                  stroke: isDarkMode ? '#0f172a' : '#fff',
                                                  strokeWidth: 2,
                                                  strokeOpacity: 1,
                                                }}
                                              />
                                              {width > 40 && height > 24 && (
                                                <text
                                                  x={x + width / 2}
                                                  y={y + height / 2}
                                                  textAnchor="middle"
                                                  fill="#fff"
                                                  fontSize={9}
                                                  fontWeight={900}
                                                  className="uppercase tracking-tighter"
                                                >
                                                  {name}
                                                </text>
                                              )}
                                            </g>
                                          );
                                        }) as any}
                                      >
                                        <Tooltip 
                                          contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
                                          itemStyle={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase' }}
                                        />
                                      </Treemap>
                                    </ResponsiveContainer>
                                  </div>
                                </div>
                              );
                                                  if (widget.id === 'support') {
                              return (
                                <div className="h-full w-full bg-slate-950 p-4 sm:p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8 relative overflow-y-auto custom-scrollbar group">
                                  <div className="absolute inset-0 bg-indigo-600 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity duration-1000"></div>
                                  <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 relative z-10 text-center sm:text-left">
                                    <div className="p-3 sm:p-4 bg-white/5 rounded-2xl border border-white/10 group-hover:scale-110 transition-transform duration-500 shrink-0">
                                      <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                    </div>
                                    <div>
                                      <p className="text-[10px] sm:text-xs font-black text-indigo-400 uppercase tracking-[0.3em] sm:tracking-[0.4em] mb-1 sm:mb-2 leading-none">Concierge Support</p>
                                      <h3 className="text-base sm:text-lg md:text-xl font-display font-medium text-white uppercase tracking-tight leading-snug sm:leading-tight">Implement these insights with our experts.</h3>
                                    </div>
                                  </div>
                                  <button onClick={() => setIsBookingOpen(true)} className="btn-base bg-white text-slate-950 hover:bg-indigo-50 px-6 sm:px-10 py-2 sm:py-3 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest relative z-10 shadow-2xl hover:scale-105 transition-all shrink-0">Establish Link</button>
                                </div>
                              );
                            }         }

                            return null;
                          })()}
                        </motion.div>
                      </div>
                    </div>
                  );
                })}
              </ResponsiveGridLayout>
            </div>
          </div>
        )}

        {activeTab === 'executive' && (
          <KeyInsightsDashboard 
            report={filteredReport} 
            kpis={user?.businessDetails?.kpis || []} 
            isDarkMode={isDarkMode} 
            swotFallback={localSwot}
            onDefineKPIs={() => setActiveTab('kpis')}
          />
        )}

        {activeTab === 'kpis' && (
          <KPIDashboard 
            kpis={user?.businessDetails?.kpis || []} 
            businessName={report.businessName}
            industry={report.profileBadge?.industry}
            reportSummary={report.visibilityIndex?.summary}
            suggestedFromReport={report.suggestedKPIs}
            onUpdate={(newKpis) => {
              if (user) {
                onUpdateUser({
                  ...user,
                  businessDetails: {
                    ...(user.businessDetails || { name: report.businessName, industry: report.profileBadge?.industry || '' }),
                    kpis: newKpis
                  }
                });
              }
            }}
            isDarkMode={isDarkMode}
          />
        )}
      </Suspense>

      {activeTab === 'intelligence' && (
        <div className="space-y-4 animate-in fade-in duration-700">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-display font-medium text-slate-900 dark:text-white tracking-tighter uppercase">Intelligence Dossier</h2>
            </div>
            {!isPrintView && (
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsCompact(!isCompact)}
                  className={`btn-sm border ${isCompact ? 'bg-slate-900 text-white border-slate-900' : 'surface text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  {isCompact ? 'Spacious View' : 'Compact View'}
                </button>
                <button 
                  onClick={() => setIsCustomizing(!isCustomizing)}
                  className={`btn-sm border ${isCustomizing ? 'bg-indigo-600 text-white border-indigo-600' : 'surface text-slate-500 hover:text-indigo-600'}`}
                >
                  {isCustomizing ? 'Finish Customizing' : 'Customize Layout'}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Sidebar - Navigation */}
            <div className="lg:col-span-3 space-y-4 sticky top-24 self-start hidden lg:block">
              <div className="surface p-4 rounded-xl space-y-2 border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0c0c0c] shadow-sm">
                <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 px-2">Data Segments</h3>
                {widgets.filter(w => w.visible).map((w) => (
                  <button
                    key={w.id}
                    onClick={() => {
                      const el = document.getElementById(`widget-${w.id}`);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    className="w-full text-left px-4 py-3 rounded-xl text-[11px] font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 transition-all flex items-center justify-between group"
                  >
                    <span>{w.name}</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-600">→</span>
                  </button>
                ))}
              </div>
              
              <div className="bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
                <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-3">AI Insight</h3>
                <p className="text-xs font-medium text-indigo-800 dark:text-indigo-200 leading-relaxed italic">
                  "{report.strategicInsights?.recommendedNextMove || report.recommendations?.[0]?.task || "Focus on increasing search visibility to boost overall score."}"
                </p>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-9 space-y-4">
              {!isPrintView && (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 border border-slate-100 dark:border-slate-800/80 rounded-xl bg-white dark:bg-[#0A0A0A] p-4 transition-all shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                      <LayoutDashboard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Mission Control</h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button 
                      onClick={() => setIsCustomizing(!isCustomizing)}
                      className={`btn-sm ${isCustomizing ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                    >
                      {isCustomizing ? 'Done Customizing' : 'Customize Layout'}
                    </button>
                    <button 
                      onClick={() => setIsCompact(!isCompact)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all font-bold text-xs"
                      title={isCompact ? "Standard View" : "Compact View"}
                    >
                      {isCompact ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {isCustomizing && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 surface border-2 border-dashed border-indigo-200 dark:border-indigo-900/30"
                >
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Widget Visibility</p>
                  <div className="flex flex-wrap gap-3">
                    {widgets.map((w) => (
                      <button
                        key={`${w.id}-toggle`}
                        onClick={() => toggleWidgetVisibility(w.id)}
                        className={`btn-sm gap-2 ${w.visible ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border border-slate-100 dark:border-slate-700 opacity-60'}`}
                      >
                        {w.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {w.name}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

            <div className="relative">
              <ResponsiveGridLayout
                className="layout"
                layouts={layouts}
                breakpoints={{ xl: 1600, lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ xl: 16, lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                rowHeight={100}
                draggableHandle=".drag-handle"
                onLayoutChange={handleLayoutChange}
                isDraggable={isCustomizing}
                isResizable={isCustomizing}
                margin={[16, 16]}
              >
                {widgets.map((widget) => {
                  if (!widget.visible && !isCustomizing) return null;
                  
                  return (
                    <div key={widget.id} className={`group ${!widget.visible ? 'opacity-40 grayscale' : ''}`}>
                      <div className={`h-full w-full relative transition-all ${isCustomizing ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-950 rounded-xl' : ''}`}>
                        {isCustomizing && (
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-[60] p-3 surface rounded-xl shadow-xl text-slate-400 border border-slate-100 dark:border-slate-700 drag-handle cursor-move">
                            <GripVertical className="w-5 h-5" />
                          </div>
                        )}
                        
                        {/* Widget Content Rendering */}
                        <motion.div 
                          className={`h-full w-full ${['overviewStats', 'marketHub', 'profile', 'swot', 'support', 'rivalSnapshot', 'visibilityProjection', 'competitorWatchlist', 'searchVisibility', 'strategicInsights', 'keywords', 'socialIntelligence', 'marketVelocity'].includes(widget.id) ? 'overflow-y-auto custom-scrollbar' : 'overflow-hidden'}`}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                        >
                          {(() => {
                    // --- EXPERT SUPPORT (CTA) ---
                    if (widget.id === 'support') {
                      return (
                        <div id="widget-support" className="h-full w-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4 sm:p-6 rounded-xl shadow-2xl relative overflow-y-auto custom-scrollbar group scroll-mt-32 border border-white/10">
                          <div className="absolute top-0 right-0 w-[500px] h-[280px] bg-indigo-500/10 rounded-full blur-[100px] -mr-32 -mt-32 group-hover:bg-indigo-500/20 transition-all duration-1000"></div>
                          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[80px] -ml-20 -mb-20"></div>
                          
                          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-4 min-h-full">
                            <div className="space-y-4 text-center lg:text-left max-w-2xl">
                              <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10 backdrop-blur-md shadow-sm">
                                <span className="relative flex h-2.5 w-2.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                </span>
                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Priority Access Active</span>
                              </div>
                              
                              <div className="space-y-1">
                                <h3 className="text-xl font-display font-medium text-white tracking-tighter leading-tight uppercase">
                                  Expert Support
                                </h3>
                                <p className="text-slate-300 font-medium text-sm leading-relaxed max-w-xl">
                                  Our elite visibility team can implement every recommendation for you.
                                </p>
                              </div>
                            </div>
                            
                            <button 
                              onClick={() => setIsBookingOpen(true)}
                              className="btn-base bg-white text-slate-900 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 btn-sm gap-3 whitespace-nowrap group/btn shrink-0"
                            >
                              <Calendar className="w-5 h-5 group-hover/btn:text-indigo-600 transition-colors" />
                              <span>Book Strategy Call</span>
                            </button>
                          </div>
                        </div>
                      );
                    }

                    // --- MARKET DOMINANCE HUB ---
                    if (widget.id === 'marketHub') {
                      const scansToUse = historyScans.length > 0 ? historyScans : [{
                        id: scanId || 'current',
                        businessName: report.businessName,
                        timestamp: new Date().toISOString(),
                        score: report.overallScore,
                        report: report
                      }];

                      return (
                        <div key="marketHub" id="widget-marketHub" className="h-full scroll-mt-32">
                          <Suspense fallback={<ComponentLoader />}>
                            <MarketDominanceHub scans={scansToUse} isDarkMode={isDarkMode} />
                          </Suspense>
                        </div>
                      );
                    }

                    // --- PROFILE BADGE ---
                    if (widget.id === 'profile') {
                  const rawProfile = report.profileBadge || {
                    businessName: user?.businessDetails?.name || report.businessName,
                    industry: user?.businessDetails?.industry || 'Unknown Industry',
                    location: 'Global',
                    visibilityScore: report.overallScore,
                    visibilityLevel: report.overallScore > 80 ? 'Dominant' : report.overallScore > 60 ? 'Strong' : report.overallScore > 40 ? 'Emerging' : 'Low',
                    tagline: report.summary ? report.summary.split('.')[0] : 'Visibility Analysis',
                    logoUrl: ''
                  };
                  const activeBrandColor = user?.businessDetails?.brandColor || '#6366f1';
                  const profile = {
                    ...rawProfile,
                    businessName: user?.businessDetails?.name || rawProfile.businessName,
                    industry: user?.businessDetails?.industry || rawProfile.industry,
                    logoUrl: user?.businessDetails?.logo || rawProfile.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.businessDetails?.name || rawProfile.businessName || report.businessName)}&background=random&size=128`
                  };
                  return (
                    <div key="profile" id="widget-profile" className="h-full surface p-4 rounded-xl flex flex-col md:flex-row items-center gap-4 scroll-mt-32 relative overflow-hidden group hover:shadow-professional-hover transition-all duration-500">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 dark:bg-slate-800/50 rounded-bl-[100%] -mr-10 -mt-4 transition-all group-hover:scale-110 duration-700"></div>
                      
                      <div className="relative z-10 shrink-0">
                        {profile.logoUrl ? (
                          <div className="relative group-hover:scale-105 transition-transform duration-500">
                            <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 rounded-full group-hover:opacity-30 transition-opacity"></div>
                            <img 
                              src={profile.logoUrl} 
                              alt="Logo" 
                              className="w-24 h-24 rounded-full object-cover shadow-2xl border-4 border-white dark:border-slate-800 relative z-10 shrink-0"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const fallback = document.getElementById(`logo-fallback-${widget.id}`);
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                          </div>
                        ) : null}
                        <div 
                          id={`logo-fallback-${widget.id}`}
                          className="w-24 h-24 rounded-full shadow-2xl border-4 border-white dark:border-slate-800 bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white text-2xl font-black uppercase tracking-tighter shrink-0"
                          style={{ display: profile.logoUrl ? 'none' : 'flex' }}
                        >
                          {(profile?.businessName || '').charAt(0)}
                        </div>
                      </div>
                      
                      <div className="flex-1 text-center md:text-left space-y-2 relative z-10 min-w-0">
                        <div className="overflow-hidden">
                          <h2 className="text-xl font-display font-medium text-slate-900 dark:text-white tracking-tighter leading-none uppercase truncate">{profile.businessName}</h2>
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 italic mt-1 line-clamp-2">"{profile.tagline}"</p>
                        </div>
                        
                        <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-1">
                          <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">{profile.industry}</span>
                          <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">{profile.location}</span>
                        </div>
                      </div>
                      
                      <div className="text-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl min-w-[140px] border border-slate-100 dark:border-slate-800/50 relative z-10 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors shadow-sm">
                        <div className="text-4xl font-display font-medium text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 mb-1 tracking-tighter leading-none">{profile.visibilityScore}</div>
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{profile.visibilityLevel}</div>
                      </div>
                    </div>
                  );
                }

                // --- OVERVIEW STATS (REPLACED INDEX) ---
                if (widget.id === 'overviewStats') {
                  const index = report.visibilityIndex || {
                    overallScore: Number(report.overallScore) || 0,
                    visibilityLevel: 'Analysis Pending',
                    summary: report.summary,
                    biggestStrength: 'Pending',
                    primaryGap: 'Pending'
                  };
                  return (
                    <div key="index" id="widget-index" className="h-full bg-slate-900 text-white p-4 rounded-xl shadow-2xl relative overflow-y-auto custom-scrollbar scroll-mt-32 group border border-slate-800">
                      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] -mr-40 -mt-40 group-hover:bg-indigo-600/20 transition-all duration-1000"></div>
                      
                      <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                            <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                          </div>
                          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Visibility Index</h3>
                        </div>
                        
                        <div className="flex-grow grid lg:grid-cols-2 gap-8 items-center overflow-visible">
                          <div className="space-y-6">
                            <p className="text-lg font-display font-medium leading-relaxed text-indigo-50/90 border-l-4 border-indigo-500 pl-6 py-1 line-clamp-3">
                              "{index.summary}"
                            </p>
                            
                            <div className="grid sm:grid-cols-2 gap-3">
                              <div className="bg-white/5 p-3 rounded-xl border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors">
                                <p className="text-[8px] font-black uppercase text-emerald-400 mb-1 tracking-widest flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.5)]"></span> Strength
                                </p>
                                <p className="text-sm font-bold text-white truncate">{index.biggestStrength}</p>
                              </div>
                              <div className="bg-white/5 p-3 rounded-xl border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors">
                                <p className="text-[8px] font-black uppercase text-rose-400 mb-1 tracking-widest flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 bg-rose-400 rounded-full shadow-[0_0_8px_rgba(251,113,133,0.5)]"></span> Gap
                                </p>
                                <p className="text-sm font-bold text-white truncate">{index.primaryGap}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex justify-center h-full max-h-56 lg:max-h-64 py-2">
                             <div className="relative aspect-square h-full flex items-center justify-center group/gauge">
                                <div className="absolute inset-0 bg-indigo-500/10 blur-2xl rounded-full group-hover/gauge:bg-indigo-500/20 transition-all duration-700"></div>
                                
                                <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-2xl" viewBox="0 0 100 100">
                                  <circle cx="50" cy="50" r="44" fill="none" stroke="#1e293b" strokeWidth="6" />
                                  <motion.circle 
                                     cx="50" 
                                     cy="50" 
                                     r="44" 
                                     fill="none" 
                                     stroke="url(#gradient-score)" 
                                     strokeWidth="6" 
                                     initial={{ strokeDasharray: `0 ${2 * Math.PI * 44}` }}
                                     animate={{ strokeDasharray: `${2 * Math.PI * 44 * ((Number(index.overallScore) || 0) / 100)} ${2 * Math.PI * 44}` }}
                                     transition={{ duration: 1.5, ease: "easeOut" }}
                                     strokeLinecap="round" 
                                   />
                                  <defs>
                                    <linearGradient id="gradient-score" x1="0%" y1="0%" x2="100%" y2="0%">
                                      <stop offset="0%" stopColor="#6366f1" />
                                      <stop offset="100%" stopColor="#818cf8" />
                                    </linearGradient>
                                  </defs>
                                </svg>
                                <div className="text-center relative z-10">
                                  <div className="text-8xl lg:text-9xl font-black text-white tracking-tighter leading-none drop-shadow-lg">{Number(index.overallScore) || 0}</div>
                                  <div className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.2em] mt-4 bg-indigo-500/10 px-4 py-1.5 rounded-full border border-indigo-500/20">Index Score</div>
                                </div>
                             </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                // --- MARKET VELOCITY (REPLACED BREAKDOWN) ---
                if (widget.id === 'marketVelocity') {
                  const breakdown = report.visibilityBreakdown || {
                    googleMyBusiness: 0,
                    socialPresence: 0,
                    brandAuthority: 0,
                    contentStrength: 0,
                    marketPosition: 0
                  };
                  
                  const metricConfig: Record<string, { icon: any, color: string, bg: string, trend: 'up' | 'down' | 'stable' }> = {
                    googleMyBusiness: { icon: MapPin, color: 'text-indigo-500', bg: 'bg-indigo-500', trend: 'up' },
                    socialPresence: { icon: Share2, color: 'text-purple-500', bg: 'bg-purple-500', trend: 'stable' },
                    brandAuthority: { icon: Shield, color: 'text-emerald-500', bg: 'bg-emerald-500', trend: 'up' },
                    contentStrength: { icon: FileText, color: 'text-amber-500', bg: 'bg-amber-500', trend: 'down' },
                    marketPosition: { icon: Target, color: 'text-indigo-500', bg: 'bg-indigo-500', trend: 'up' }
                  };

                  return (
                    <div key="breakdown" id="widget-breakdown" className="surface p-6 rounded-2xl hover-lift scroll-mt-32">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                            <LayoutDashboard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <h3 className="text-xs font-black uppercase tracking-[0.4em] text-indigo-600 dark:text-indigo-400">Visibility Breakdown</h3>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
                        {Object.entries(breakdown).map(([key, score]) => {
                          const val = score as number;
                          const config = metricConfig[key] || { icon: Activity, color: 'text-slate-500', bg: 'bg-slate-500', trend: 'stable' };
                          const Icon = config.icon;
                          const trend: 'up' | 'down' | 'stable' = val > 75 ? 'up' : val < 40 ? 'down' : 'stable';
                          
                          return (
                            <div key={key} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/50 relative overflow-hidden group">
                              <div className={`absolute top-0 right-0 w-24 h-24 ${config.bg} opacity-5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:opacity-10 transition-opacity`}></div>
                              
                              <div className="flex justify-between items-start mb-6">
                                <div className={`p-3 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 ${config.color}`}>
                                  <Icon className="w-5 h-5" />
                                </div>
                                <TrendBadge trend={trend} />
                              </div>
                              
                              <div className="mb-4">
                                <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-1">
                                  {val}<span className="text-lg text-slate-400">%</span>
                                </div>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}
                                </div>
                              </div>
                              
                              <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${val}%` }}
                                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                                  className={`h-full rounded-full ${config.bg}`}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="h-[300px] w-full bg-slate-50/50 dark:bg-slate-800/30 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart 
                            data={Object.entries(breakdown).map(([name, score]) => ({ 
                              name: name.replace('Visibility', '').replace('Presence', '').replace('Authority', '').replace('Strength', '').replace('Position', '').replace(/([A-Z])/g, ' $1').trim(), 
                              score 
                            }))}
                            margin={{ top: 15, right: 15, left: -20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#1e293b' : '#f1f5f9'} />
                            <XAxis dataKey="name" tick={{fontSize: 9, fontWeight: 900, fill: '#94a3b8'}} axisLine={false} tickLine={false} dy={10} />
                            <YAxis domain={[0, 100]} tick={{fontSize: 9, fontWeight: 700, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                            <Tooltip 
                              contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                              itemStyle={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase' }}
                              cursor={{fill: 'transparent'}}
                            />
                            <Bar dataKey="score" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={24} />
                            <Line type="monotone" dataKey="score" stroke={isDarkMode ? '#818cf8' : '#6366f1'} strokeWidth={3.5} dot={{ r: 5, fill: isDarkMode ? '#818cf8' : '#6366f1', strokeWidth: 3, stroke: isDarkMode ? '#0f172a' : '#fff' }} activeDot={{ r: 7 }} />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  );
                }

                if (widget.id === 'competitorWatchlist') {
                  return (
                    <div key="competitorWatchlist" id="widget-competitorWatchlist" className="h-full w-full">
                      <Suspense fallback={<ComponentLoader />}>
                        <CompetitorWatchlistWidget report={filteredReport} />
                      </Suspense>
                    </div>
                  );
                }

                if (widget.id === 'visibilityProjection') {
                  return (
                    <div key="visibilityProjection" id="widget-visibilityProjection" className="h-full w-full">
                      <Suspense fallback={<ComponentLoader />}>
                        <VisibilityProjectionWidget report={filteredReport} isDarkMode={isDarkMode} />
                      </Suspense>
                    </div>
                  );
                }

                // --- STRATEGIC INSIGHTS (REPLACED INSIGHTS) ---
                if (widget.id === 'strategicInsights') {
                  const baseInsights = report.strategicInsights || {
                    explanation: '',
                    missedOpportunities: [],
                    actionableImprovements: [],
                    recommendedNextMove: ''
                  };
                  const missed = baseInsights.missedOpportunities || [];
                  const improvements = baseInsights.actionableImprovements || report.recommendations?.map(r => r.task) || [];
                  
                  // Intelligence Dossier Fallbacks
                  const finalMissed = missed.length > 0 ? missed : [
                    "Unclaimed competitive search territory detected in regional clusters",
                    "Lower signal frequency compared to top-tier rivals in Google Search",
                    "Missing structured schema validation for enhanced SERP visibility"
                  ];
                  
                  const finalImprovements = improvements.length > 0 ? improvements : [
                    "Sync localized reach campaigns with high-intent regional keywords",
                    "Execute 'Foundational Signal' build to boost baseline authority",
                    "Synchronize social handles across mission-critical platforms"
                  ];

                  const insights = {
                    explanation: baseInsights.explanation || 'Detailed strategic intelligence is being derived from current market signals.',
                    missedOpportunities: finalMissed,
                    actionableImprovements: finalImprovements,
                    recommendedNextMove: baseInsights.recommendedNextMove || report.recommendations?.[0]?.task || 'Initialize signal expansion protocol'
                  };
                  return (
                    <div key="insights" id="widget-insights" className="surface p-4 rounded-xl hover-lift scroll-mt-32">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                          <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 micro-bounce" />
                        </div>
                        <h3 className="text-xs font-black uppercase tracking-[0.4em] text-indigo-600 dark:text-indigo-400">Strategic Insights</h3>
                      </div>

                      <div className="space-y-4">
                        <div className="relative pl-8 border-l-4 border-indigo-500">
                          <p className="text-lg font-medium text-slate-600 dark:text-slate-300 leading-relaxed italic">
                            "{insights.explanation}"
                          </p>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="bg-rose-50 dark:bg-rose-900/10 p-4 rounded-xl border border-rose-100 dark:border-rose-800/20 hover:shadow-md transition-all group">
                            <h4 className="text-[10px] font-black uppercase text-rose-500 mb-4 tracking-widest flex items-center gap-2">
                              <AlertCircle className="w-4 h-4" /> Missed Opportunities
                            </h4>
                            <ul className="space-y-4">
                              {insights.missedOpportunities.map((item, i) => (
                                <li key={`missed-opp-${i}-${item.slice(0, 15)}`} className="flex gap-4 text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:translate-x-1 transition-transform">
                                  <span className="w-1.5 h-1.5 bg-rose-400 rounded-full mt-1.5 shrink-0 shadow-[0_0_8px_rgba(251,113,133,0.6)]"></span> 
                                  <span className="leading-relaxed">{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/20 hover:shadow-md transition-all group">
                            <h4 className="text-[10px] font-black uppercase text-emerald-500 mb-4 tracking-widest flex items-center gap-2">
                              <Sparkles className="w-4 h-4" /> Actionable Improvements
                            </h4>
                            <ul className="space-y-4">
                              {insights.actionableImprovements.map((item, i) => (
                                <li key={`improvement-act-${i}-${item.slice(0, 15)}`} className="flex gap-4 text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:translate-x-1 transition-transform">
                                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1.5 shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></span> 
                                  <span className="leading-relaxed">{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="bg-slate-900 text-white p-4 rounded-xl shadow-xl relative overflow-hidden group border border-slate-800">
                          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:bg-indigo-500/30 transition-all duration-700"></div>
                          <div className="relative z-10">
                            <h4 className="text-[10px] font-black uppercase text-indigo-400 mb-4 tracking-widest flex items-center gap-2">
                              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.8)]"></span>
                              Recommended Next Move
                            </h4>
                            <p className="text-xl font-display sm:text-2xl font-medium text-white leading-tight max-w-3xl">{insights.recommendedNextMove}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                if (widget.id === 'rivalSnapshot') {
                  const topRivals = [...(report.competitorComparison || [])]
                    .sort((a, b) => b.score - a.score);
                  
                  return (
                    <div key="competitorAnalysis" id="widget-competitorAnalysis" className="surface p-6 rounded-xl hover-lift scroll-mt-32">
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-rose-50 dark:bg-rose-900/20 rounded-xl">
                            <Swords className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                          </div>
                          <h3 className="text-xs font-black uppercase tracking-[0.4em] text-rose-600 dark:text-rose-400">Competitor Analysis</h3>
                        </div>
                        <button 
                          onClick={() => setActiveTab('competitors')}
                          className="btn-ghost btn-xs text-slate-400 hover:text-rose-500"
                        >
                          Detail View →
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                        {topRivals.map((rival, i) => (
                          <div key={`rival-snap-${rival.name}-${i}`} className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-rose-500 opacity-5 rounded-full blur-2xl -mr-8 -mt-8 group-hover:opacity-10 transition-opacity"></div>
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-2xl surface flex items-center justify-center text-lg font-black text-slate-400 border border-slate-200 dark:border-slate-700 shrink-0">
                                {(rival?.name || '').charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{rival.name}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{rival.score}</span>
                                  <div className={rival.trend === 'up' ? 'text-rose-500' : rival.trend === 'down' ? 'text-emerald-500' : 'text-slate-400'}>
                                    {rival.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : rival.trend === 'down' ? <TrendingDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="overflow-x-auto -mx-6 px-6">
                        <table className="w-full text-left order-collapse">
                          <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800">
                              <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2">Competitive Benchmarking</th>
                              <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Score</th>
                              <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-6">Core Strength</th>
                              <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-6">Primary Vulnerability</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                            {topRivals.map((rival, i) => (
                              <tr key={i} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
                                <td className="py-4 pl-2">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]' : i === 1 ? 'bg-orange-500' : i === 2 ? 'bg-amber-500' : i === 3 ? 'bg-purple-500' : i === 4 ? 'bg-pink-500' : 'bg-slate-500'}`}></div>
                                    <span className="text-xs font-bold text-slate-900 dark:text-slate-200">{rival.name}</span>
                                  </div>
                                </td>
                                <td className="py-4 text-center">
                                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-black text-slate-700 dark:text-slate-300 tabular-nums">
                                    {rival.score}
                                  </span>
                                </td>
                                <td className="py-4 pl-6">
                                  <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-0.5"></div>
                                    <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 leading-tight">
                                      {rival.strengths?.[0] || 'Analyzing...'}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-4 pl-6">
                                  <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-0.5"></div>
                                    <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 leading-tight">
                                      {rival.weaknesses?.[0] || 'Identifying...'}
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            ))}
                            <tr className="bg-indigo-50/30 dark:bg-indigo-900/10 border-t-2 border-indigo-100 dark:border-indigo-900/30">
                              <td className="py-5 pl-2">
                                <div className="flex items-center gap-3">
                                  <div className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_12px_rgba(99,102,241,0.5)]"></div>
                                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 tracking-tighter uppercase">YOU (Ocula Intelligence)</span>
                                </div>
                              </td>
                              <td className="py-5 text-center">
                                <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums">{report.overallScore}</span>
                              </td>
                              <td className="py-5 pl-6">
                                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest pl-3 border-l border-emerald-200 dark:border-emerald-800">
                                  {report.visibilityIndex?.biggestStrength || 'Signal Active'}
                                </span>
                              </td>
                              <td className="py-5 pl-6">
                                <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest pl-3 border-l border-rose-200 dark:border-rose-800">
                                  {report.visibilityIndex?.primaryGap || 'Monitoring Gaps'}
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                }

                // --- SEARCH VISIBILITY ---
                if (widget.id === 'searchVisibility') {
                  return (
                    <div id="widget-searchVisibility" className="h-full scroll-mt-32">
                      <Suspense fallback={<ComponentLoader />}>
                        <SearchVisibilityWidget report={report} />
                      </Suspense>
                    </div>
                  );
                }

                // --- LEGACY WIDGETS (Radar, SWOT, Keywords, etc.) ---
                if (widget.id === 'radar') {
                    return (
                      <div key="radar" id="widget-radar" className="surface p-6 flex flex-col items-center scroll-mt-32 relative overflow-hidden group">
                        <div className="relative z-10 w-full h-full flex flex-col items-center">
                          <div className="flex items-center gap-3 mb-4 self-start">
                            <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
                              <Radar className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                            </div>
                            <h3 className="text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">Radar Synthesis</h3>
                          </div>
                          
                          <div className="w-full h-[300px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                              <RadarChart data={safeRadarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                                <PolarGrid stroke={isDarkMode ? "#334155" : "#e2e8f0"} />
                                <PolarAngleAxis dataKey="subject" tick={{fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 10, fontWeight: 500}} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <RechartsRadar 
                                  name="Your Performance"
                                  dataKey="A" 
                                  stroke={isDarkMode ? "#ffffff" : "#0f172a"} 
                                  strokeWidth={2}
                                  fill={isDarkMode ? "#ffffff" : "#0f172a"} 
                                  fillOpacity={0.1} 
                                  isAnimationActive={!isExporting} 
                                />
                                <RechartsRadar 
                                  name="Market Benchmark"
                                  dataKey="benchmark" 
                                  stroke="#94a3b8" 
                                  strokeWidth={2}
                                  strokeDasharray="4 4"
                                  fill="#94a3b8" 
                                  fillOpacity={0.1} 
                                  isAnimationActive={!isExporting} 
                                />
                                <Tooltip 
                                  contentStyle={{borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', color: isDarkMode ? '#fff' : '#0f172a', padding: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                                  itemStyle={{ fontSize: '11px', fontWeight: 500, textTransform: 'uppercase' }}
                                  cursor={{ stroke: '#94a3b8', strokeWidth: 1 }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1px' }} />
                              </RadarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    );
                }

                if (widget.id === 'keywordMatrix') {
                  return (
                    <div key="keywordMatrix" id="widget-keywordMatrix" className="surface p-6 scroll-mt-32">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
                            <Target className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                          </div>
                          <h3 className="text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">Opportunity Matrix</h3>
                        </div>
                        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">Volume vs Difficulty</span>
                      </div>
                      
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#1e293b" : "#f1f5f9"} vertical={false} />
                            <XAxis 
                              type="number" 
                              dataKey="difficulty" 
                              name="Difficulty" 
                              unit="%" 
                              domain={[0, 100]}
                              tick={{fontSize: 9, fontWeight: 900, fill: '#94a3b8'}}
                              axisLine={false}
                              tickLine={false}
                              label={{ value: 'Difficulty', position: 'insideBottom', offset: -10, fontSize: 9, fontWeight: 900, fill: '#94a3b8' }}
                            />
                            <YAxis 
                              type="number" 
                              dataKey="volume" 
                              name="Volume" 
                              tick={{fontSize: 9, fontWeight: 900, fill: '#94a3b8'}}
                              axisLine={false}
                              tickLine={false}
                              label={{ value: 'Search Volume', angle: -90, position: 'insideLeft', fontSize: 9, fontWeight: 900, fill: '#94a3b8' }}
                            />
                            <ZAxis type="number" dataKey="impact" range={[100, 800]} name="Impact" />
                            <Tooltip 
                              cursor={{ strokeDasharray: '3 3' }}
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload;
                                  return (
                                    <div className="surface p-4 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800">
                                      <p className="text-xs font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tight">{data.name}</p>
                                      <div className="space-y-1.5">
                                        <p className="text-[10px] font-bold text-slate-500">Volume: <span className="text-slate-900 dark:text-white">{data.volume.toLocaleString()}</span></p>
                                        <p className="text-[10px] font-bold text-slate-500">Difficulty: <span className="text-slate-900 dark:text-white">{data.difficulty}%</span></p>
                                        <p className="text-[10px] font-bold text-slate-500">Impact: <span className={`uppercase ${data.impactLabel === 'high' ? 'text-emerald-500' : 'text-amber-500'}`}>{data.impactLabel}</span></p>
                                      </div>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Scatter name="Keywords" data={keywordMatrixData}>
                              {keywordMatrixData.map((entry, index) => (
                                <Cell 
                                  key={`keyword-scatter-cell-${index}-${entry.name}`} 
                                  fill={entry.impactLabel === 'high' ? '#10b981' : entry.impactLabel === 'medium' ? '#3b82f6' : '#94a3b8'} 
                                  fillOpacity={0.7}
                                  stroke={entry.impactLabel === 'high' ? '#059669' : entry.impactLabel === 'medium' ? '#2563eb' : '#64748b'}
                                  strokeWidth={2}
                                />
                              ))}
                            </Scatter>
                          </ScatterChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-4 flex justify-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-emerald-500/70 border-2 border-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">High Impact</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-indigo-500/70 border-2 border-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.4)]"></div>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Medium Impact</span>
                        </div>
                      </div>
                    </div>
                  );
                }

                if (widget.id === 'marketTreemap') {
                  return (
                    <div key="marketTreemap" id="widget-marketTreemap" className="surface p-6 scroll-mt-32">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
                            <PieChart className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                          </div>
                          <h3 className="text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">Market Distribution</h3>
                        </div>
                        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">Category Weighting</span>
                      </div>
                      
                      <div className="h-[350px] w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                        <ResponsiveContainer width="100%" height="100%">
                          <Treemap
                            data={treemapData}
                            dataKey="size"
                            nameKey="name"
                            aspectRatio={4 / 3}
                            stroke="#fff"
                            fill="#3b82f6"
                            content={((props: any) => {
                              const { x, y, width, height, index, payload, name } = props;
                              const colorsList = ['#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];
                              const color = colorsList[index % colorsList.length];
                              
                              return (
                                <g key={`treemap-item-${name || 'node'}-${index}`}>
                                  <rect
                                    x={x}
                                    y={y}
                                    width={width}
                                    height={height}
                                    style={{
                                      fill: color,
                                      stroke: isDarkMode ? '#0f172a' : '#fff',
                                      strokeWidth: 2,
                                      strokeOpacity: 1,
                                    }}
                                  />
                                  {width > 50 && height > 30 && (
                                    <text
                                      x={x + width / 2}
                                      y={y + height / 2}
                                      textAnchor="middle"
                                      fill="#fff"
                                      fontSize={10}
                                      fontWeight={900}
                                      className="uppercase tracking-tighter"
                                    >
                                      {name}
                                    </text>
                                  )}
                                </g>
                              );
                            }) as any}
                          >
                            <Tooltip 
                              contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                              itemStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                            />
                          </Treemap>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  );
                }
                
                if (widget.id === 'swot') {
                    const swotData = report.swotAnalysis || localSwot;
                    if (!swotData && !isGeneratingSwot) return null;
                    
                    return (
                        <div key="swot" id="widget-swot" className="surface p-6 scroll-mt-32 relative overflow-hidden min-h-[300px]">
                            {isGeneratingSwot && (
                              <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                                <AILoader message="Generating Strategic SWOT..." />
                              </div>
                            )}
                            {swotData && (
                              <Suspense fallback={<ComponentLoader />}>
                          <SWOTAnalysis swot={swotData} isCompact={isCompact} isDarkMode={isDarkMode} variant="widget" isFullAccess={capabilities.canViewFullSWOT} />
                        </Suspense>
                            )}
                        </div>
                    );
                }

                if (widget.id === 'keywords' && report.keywordAnalysis) {
                  return (
                    <div key="keywords" id="widget-keywords" className="surface p-6 scroll-mt-32">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
                            <BarChart2 className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                          </div>
                          <h3 className="text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">Keyword Competition</h3>
                        </div>
                        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">Top 5 Keywords</span>
                      </div>
                      
                      <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart id="keyword-matrix-bar" data={keywordCompetitionData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#1e293b" : "#f1f5f9"} horizontal={true} vertical={false} />
                            <XAxis type="number" hide />
                            <YAxis 
                              dataKey="term" 
                              type="category" 
                              width={100} 
                              tick={{fontSize: 10, fontWeight: 700, fill: isDarkMode ? '#cbd5e1' : '#475569'}} 
                              axisLine={false}
                              tickLine={false}
                            />
                            <Tooltip 
                              cursor={{fill: isDarkMode ? '#1e293b' : '#f8fafc'}}
                              contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                              itemStyle={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase' }}
                            />
                            <Bar dataKey="competitionValue" name="Competition" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={24}>
                                {keywordCompetitionData.map((entry, index) => (
                                    <Cell key={`keyword-matrix-cell-${index}-${entry.term}`} fill={entry.competitionValue === 3 ? '#f43f5e' : entry.competitionValue === 2 ? '#fbbf24' : '#10b981'} />
                                ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  );
                }
                
                if (widget.id === 'socialIntelligence') {
                   return (
                    <div key="socialIntelligence" id="widget-socialIntelligence" className="surface p-6 scroll-mt-32">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
                            <Share2 className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                          </div>
                          <h3 className="text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">Social Intelligence</h3>
                        </div>
                        <div className="flex gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Resonance</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Reach</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={composedSocialData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#1e293b" : "#f1f5f9"} vertical={false} />
                            <XAxis dataKey="name" tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} axisLine={false} tickLine={false} dy={10} />
                            <YAxis hide />
                            <Tooltip 
                              cursor={{fill: 'transparent'}}
                              contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                              itemStyle={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase' }}
                            />
                            <Bar dataKey="score" fill="#ec4899" radius={[6, 6, 0, 0]} barSize={32} />
                            <Line type="monotone" dataKey="reach" stroke="#a855f7" strokeWidth={3} dot={{ r: 5, fill: '#a855f7', strokeWidth: 3, stroke: isDarkMode ? '#0f172a' : '#fff' }} activeDot={{ r: 7 }} />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Competitor Intelligence Profiles Section */}
                      <div className="mt-12 pt-10 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500">Competitor Intelligence Profiles</h4>
                          <span className="text-[8px] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded uppercase">Social Reach Analysis</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {(filteredReport.competitorComparison || []).map((comp, idx) => (
                            <div key={`${comp.name}-${idx}`} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 group hover-lift transition-all">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 surface rounded-lg flex items-center justify-center font-black text-[10px] text-slate-400 border border-slate-100 dark:border-slate-800 shrink-0">
                                  {(comp?.name || '').charAt(0)}
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{comp.name}</span>
                                  <button 
                                    onClick={() => deployVsMission(comp)}
                                    className="btn-primary py-1 px-2.5 text-[8px] h-auto rounded-lg shadow-sm hover:scale-105 active:scale-95 transition-all opacity-0 group-hover:opacity-100 group-hover:animate-pulse-soft"
                                  >
                                    Deploy VS Mission
                                  </button>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <div className="text-[10px] font-mono font-black text-slate-900 dark:text-white">{(comp as any).socialResonance || Math.floor((Number(comp.score) || 0) * 0.8) || 0}</div>
                                  <div className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Resonance</div>
                                </div>
                                <div className="w-12 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-pink-500" 
                                    style={{ width: `${(comp as any).socialResonance || Math.floor((Number(comp.score) || 0) * 0.8) || 0}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                   );
                }

                if (widget.id === 'usage') {
                  const account = user?.account || {
                    tier: 'free',
                    unitsTotal: TIER_CONFIGS['free'].units,
                    unitsUsed: 0,
                    unitsRemaining: TIER_CONFIGS['free'].units,
                    renewalDate: new Date().toISOString()
                  };
                  
                  const tierConfig = TIER_CONFIGS[account.tier];
                  const usagePercentage = account.unitsTotal > 0 
                    ? Math.min(100, (account.unitsUsed / account.unitsTotal) * 100)
                    : 0;
                  
                  // Calculate days until renewal
                  const renewalDate = new Date(account.renewalDate);
                  const today = new Date();
                  const diffTime = Math.max(0, renewalDate.getTime() - today.getTime());
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                  return (
                    <div key="usage" id="widget-usage" className="surface p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 scroll-mt-32 border border-slate-100 dark:border-slate-800 hover-lift transition-all relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-all duration-700"></div>
                      
                      <div className="flex items-center gap-5 relative z-10 w-full sm:w-auto">
                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 group-hover:scale-110 transition-transform duration-500">
                          <Zap className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Intelligence Credits</h3>
                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter border border-slate-200 dark:border-slate-700">
                              {tierConfig.name}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Monthly usage resets in <span className="text-slate-900 dark:text-white font-bold">{diffDays} days</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3 w-full sm:w-auto relative z-10">
                        <div className="flex items-baseline gap-1">
                          <span className="big-stat text-slate-900 dark:text-white">
                            {account.unitsRemaining.toLocaleString()}
                          </span>
                          <span className="text-slate-400 dark:text-slate-500 text-sm font-bold uppercase tracking-widest">
                            / {account.unitsTotal.toLocaleString()} Units
                          </span>
                        </div>
                        
                        <div className="w-full sm:w-48 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${usagePercentage}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className={`h-full rounded-full shimmer-effect ${
                              usagePercentage > 90 ? 'bg-rose-500' : 
                              usagePercentage > 75 ? 'bg-amber-500' : 
                              'bg-indigo-600'
                            }`}
                          />
                        </div>
                        <div className="flex justify-between w-full text-[10px] font-black uppercase tracking-widest text-slate-400">
                          <span>Usage</span>
                          <span>{Math.round(usagePercentage || 0)}%</span>
                        </div>
                      </div>
                    </div>
                  );
                }

                    return null;
                  })()}
                        </motion.div>
                      </div>
                    </div>
                  );
                })}
              </ResponsiveGridLayout>
            </div>
          </div>
        </div>
      </div>
    )}

      {activeTab === 'rivals' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in">
           {(filteredReport.competitorComparison || []).map((comp, i) => (
            <div key={`${comp.name}-${i}`} className={`surface p-4 rounded-xl flex flex-col justify-between min-h-[300px] group transition-all relative overflow-hidden ${
              comp.trend === 'up' ? 'hover:border-emerald-200 dark:hover:border-emerald-900 border-slate-50 dark:border-slate-800' : 
              comp.trend === 'down' ? 'hover:border-rose-200 dark:hover:border-rose-900 border-slate-50 dark:border-slate-800' : 
              'hover:border-indigo-200 dark:hover:border-indigo-900 border-slate-50 dark:border-slate-800'
            }`}>
               <div className={`absolute top-0 left-0 w-full h-1 ${
                 comp.trend === 'up' ? 'bg-emerald-500' : 
                 comp.trend === 'down' ? 'bg-rose-500' : 
                 'bg-slate-400'
               }`}></div>

               <div className="flex justify-between items-start pt-2">
                  <TrendBadge trend={comp.trend} />
                  <div className="flex flex-col items-end">
                    <div className="stat-value text-slate-900 dark:text-white">{comp.score}</div>
                    <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Visibility Index</span>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-2xl font-display font-medium text-slate-900 dark:text-white leading-none group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{comp.name}</h4>
                    <p className={`text-[9px] font-bold ${
                      (filteredReport.overallScore - comp.score) >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {(filteredReport.overallScore - comp.score) >= 0 ? '+' : ''}{filteredReport.overallScore - comp.score}% Visibility Edge
                    </p>
                  </div>
                  
                  <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-1000 ${
                      comp.trend === 'up' ? 'bg-emerald-500' : 
                      comp.trend === 'down' ? 'bg-rose-500' : 
                      'bg-slate-400'
                    }`} style={{ width: `${comp.score}%` }}></div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {comp.keywords?.slice(0, 4).map((kw, k) => {
                      const compLevel = getKeywordCompetition(kw);
                      return (
                        <span 
                          key={`${kw}-${k}`} 
                          className={`text-[7px] font-black px-2 py-0.5 rounded uppercase tracking-wider border transition-colors flex items-center gap-1 ${
                            compLevel === 'high' ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-800/50' :
                            compLevel === 'medium' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800/50' :
                            compLevel === 'low' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50' :
                            'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-700'
                          }`}
                        >
                          {compLevel === 'high' && <Swords className="w-2 h-2" />}
                          {compLevel === 'medium' && <Shield className="w-2 h-2" />}
                          {compLevel === 'low' && <Sparkles className="w-2 h-2" />}
                          {kw}
                        </span>
                      );
                    })}
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-2 pt-6">
                 <button 
                   onClick={() => setSelectedCompetitor(comp)} 
                   className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5"
                 >
                   <Swords className="w-3 h-3" />
                   Compare
                 </button>
                 <button 
                   onClick={() => deployVsMission(comp)} 
                   className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-sm flex items-center justify-center gap-1.5"
                 >
                   <Target className="w-3 h-3" />
                   Deploy
                 </button>
               </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'competitors' && hasPermission(currentUserRole, Permission.VIEW_COMPETITORS) && (
        <Suspense fallback={<ComponentLoader />}>
          <CompetitorTracking 
            report={filteredReport} 
            isDarkMode={isDarkMode} 
            maxCompetitors={TIER_CONFIGS[currentTier].limits.competitors} 
            onDeployVsMission={deployVsMission}
            isDominanceTier={currentTier === 'premium'}
          />
        </Suspense>
      )}

      {activeTab === 'social' && (
        <div className="space-y-6 animate-in">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 surface p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
             <div>
                <h2 className="text-2xl font-display font-medium text-slate-900 dark:text-white tracking-tighter uppercase">Social Command Hub</h2>
                <p className="text-slate-500 dark:text-slate-400 font-bold text-xs mt-0.5">Track brand mentions across Twitter, Facebook, Instagram & Reddit, and manage channel posts.</p>
             </div>

             <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setSocialSubTab('monitoring')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                    socialSubTab === 'monitoring'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Social Listening & Mentions</span>
                </button>
                <button
                  onClick={() => setSocialSubTab('channels')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                    socialSubTab === 'channels'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Channels & Post Dispatcher</span>
                </button>
             </div>
          </div>

          {socialSubTab === 'monitoring' ? (
            <SocialMediaMonitoring
              businessName={report.businessName}
              industry={report.profileBadge?.industry || 'General Business'}
              isDarkMode={isDarkMode}
              onDeployMission={(topic, details) => {
                setActiveTab('missions');
              }}
            />
          ) : (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button onClick={() => setConnectedPlatforms(new Set())} className="btn-ghost text-rose-500 hover:text-rose-700 btn-xs">Clear All Synced Signals</button>
              </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-slate-900 dark:bg-slate-950 p-4 rounded-xl shadow-xl flex flex-col h-[300px] relative overflow-hidden group border border-white/5">
               <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                    style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
               </div>
               
               <div className="relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-center mb-4">
                     <div className="space-y-0.5">
                        <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-400">Platform Resonance</h3>
                        <div className="flex items-center gap-2">
                           <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                           <span className="text-[7px] font-black text-emerald-500/80 uppercase tracking-widest">Live Signal Analysis</span>
                        </div>
                     </div>
                  </div>

                  <div className="flex-grow relative">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart id="social-intelligence-bar" data={socialChartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                          <XAxis 
                            dataKey="platform" 
                            tick={{ fill: '#ffffff40', fontSize: 8, fontWeight: 800 }} 
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis hide domain={[0, 100]} />
                          <Tooltip 
                            cursor={{ fill: 'rgba(255,255,255,0.03)' }} 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-slate-900 p-3 rounded-xl border border-white/10 shadow-2xl">
                                    <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">{payload[0].payload.platform}</p>
                                    <div className="flex items-end gap-1.5">
                                      <span className="text-xl font-mono font-black text-white">{payload[0].value}</span>
                                      <span className="text-[7px] font-bold text-white/40 uppercase mb-0.5">Index</span>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar dataKey="score" radius={[4, 4, 0, 0]} barSize={24}>
                             {socialChartData.map((entry, index) => (
                               <Cell 
                                 key={`social-intelligence-cell-${index}-${entry.platform}`} 
                                 fill={entry.color}
                                 className="transition-all duration-500 hover:opacity-100 opacity-80"
                               />
                             ))}
                          </Bar>
                       </BarChart>
                    </ResponsiveContainer>
                  </div>
               </div>
            </div>

            <div className="surface p-4 rounded-xl flex flex-col h-[300px]">
               <div className="flex justify-between items-start mb-4">
                  <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Reach Trajectory</h3>
                  <TrendBadge trend="up" />
               </div>
               <div className="flex-grow relative">
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={socialTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                       <defs>
                          <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                             <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#ffffff05" : "#00000005"} />
                       <XAxis dataKey="name" hide />
                       <YAxis hide />
                       <Tooltip 
                         content={({ active, payload }) => {
                           if (active && payload && payload.length) {
                             return (
                               <div className="surface p-3 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800">
                                 <p className="text-[10px] font-mono font-black text-slate-900 dark:text-white">{payload[0].value}</p>
                                 <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Reach Index</p>
                               </div>
                             );
                           }
                           return null;
                         }}
                       />
                       <Area type="monotone" dataKey="val" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                    </AreaChart>
                 </ResponsiveContainer>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {localSocialPresence.map((p, i) => (
              <div key={`${p.platform}-${i}`} className="surface p-4 rounded-xl flex flex-col justify-between group hover:border-indigo-200 dark:hover:border-indigo-900 transition-all">
                <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-slate-900 dark:bg-slate-950 text-white rounded-xl flex items-center justify-center font-black text-xs border border-white/5 shrink-0">
                      {(p?.platform || '').charAt(0)}
                    </div>
                    <div className="text-right">
                      <div className="stat-value text-slate-900 dark:text-white">{p.score}</div>
                      <div className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Resonance</div>
                    </div>
                </div>
                <div className="space-y-4">
                    <div>
                       <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{p.platform}</h4>
                       {editingSocial === p.platform ? (
                         <div className="mt-2 flex gap-2">
                           <input 
                             type="text" 
                             value={socialHandleInput}
                             onChange={(e) => setSocialHandleInput(e.target.value)}
                             placeholder="@handle"
                             className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-bold outline-none focus:border-indigo-500"
                             autoFocus
                             onKeyDown={(e) => e.key === 'Enter' && saveSocialHandle(p.platform)}
                           />
                           <button 
                             onClick={() => saveSocialHandle(p.platform)}
                             className="btn-primary btn-xs rounded-lg"
                           >
                             Save
                           </button>
                         </div>
                       ) : (
                         <div className="flex items-center justify-between group/handle">
                           <p className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400">{p.handle || '@unclaimed'}</p>
                           {connectedPlatforms.has(p.platform) && (
                             <button 
                               onClick={() => {
                                 setEditingSocial(p.platform);
                                 setSocialHandleInput(p.handle === '@unclaimed' ? '' : p.handle);
                               }}
                               className="opacity-0 group-hover/handle:opacity-100 btn-ghost text-[7px] p-0"
                             >
                               Edit
                             </button>
                           )}
                         </div>
                       )}
                    </div>
                    
                    <div className="space-y-3 mt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Platform Resonance</span>
                          <span className="text-[10px] font-black text-slate-900 dark:text-white">{p.score}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${p.score}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="h-full bg-slate-900 dark:bg-white rounded-full"
                          />
                        </div>
                    </div>
                    
                    {connectedPlatforms.has(p.platform) ? (
                      <div className="space-y-2">
                         <div className="flex justify-between items-center text-[9px] font-bold text-emerald-500">
                           <span className="flex items-center gap-1.5"><span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></span> Linked</span>
                           <button onClick={() => togglePlatformConnection(p.platform)} className="btn-ghost text-slate-300 hover:text-slate-500 text-[7px] p-0">Unlink</button>
                         </div>
                         <button onClick={() => handleOpenComposer(p.platform)} className="w-full btn-base bg-slate-900 dark:bg-slate-950 text-white hover:bg-black shadow-sm border border-white/5 btn-xs">Deploy Update</button>
                      </div>
                    ) : (
                      editingSocial !== p.platform && (
                        <button onClick={() => togglePlatformConnection(p.platform)} className="w-full btn-secondary btn-xs hover:bg-indigo-600 hover:text-white">Connect Channel</button>
                      )
                    )}
                </div>
              </div>
            ))}
          </div>

          <div className="surface p-4 rounded-xl space-y-4">
             <div className="flex justify-between items-center">
                <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Transmission History</h3>
                <span className="text-[8px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-full">{postHistory.length} Global Signals</span>
             </div>
             
             {postHistory.length > 0 ? (
               <div className="space-y-4">
                 {postHistory.map((post, idx) => (
                   <div key={`${post.id}-${idx}`} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover-lift transition-all">
                      <div className="flex justify-between items-start mb-4">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-xs shrink-0">{(post?.platform || '').charAt(0)}</div>
                            <div>
                               <p className="text-xs font-black text-slate-900">{post.platform} Update</p>
                               <p className="text-[9px] font-bold text-slate-400">{new Date(post.timestamp).toLocaleString()}</p>
                            </div>
                         </div>
                         <div className="flex gap-4">
                            <div className="text-center"><p className="text-base font-black text-slate-900">{post.engagement.likes}</p><p className="text-[8px] font-black text-slate-400 uppercase">Likes</p></div>
                            <div className="text-center"><p className="text-base font-black text-slate-900">{post.engagement.shares}</p><p className="text-[8px] font-black text-slate-400 uppercase">Shares</p></div>
                         </div>
                      </div>
                      <p className="text-sm font-semibold text-slate-600 leading-relaxed italic">"{post.content}"</p>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="py-6 text-center space-y-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-2xl">📡</div>
                  <p className="text-xs font-black text-slate-300 uppercase tracking-widest">No active transmissions identified in history.</p>
               </div>
             )}
          </div>
        </div>
          )}
        </div>
      )}

      {/* Social Composer Modal */}
      <AnimatePresence>
        {isComposing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1300] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-2xl" 
            data-html2canvas-ignore
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="surface w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col"
            >
               <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <div>
                     <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Social Composer</h3>
                     <p className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mt-1">Target: {composingPlatform}</p>
                  </div>
                  <button onClick={() => setIsComposing(false)} className="text-slate-300 hover:text-slate-900 dark:hover:text-white text-2xl font-black p-2">✕</button>
               </div>
               
               <div className="p-4 space-y-4 overflow-y-auto max-h-[70vh]">
                  <div className="space-y-2">
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Mission Objective</label>
                     <textarea 
                       value={compositionGoal} 
                       onChange={e => setCompositionGoal(e.target.value)}
                       placeholder="e.g. Announce a 20% weekend sale..."
                       className="w-full px-4 py-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500/20 outline-none font-bold text-sm h-32 resize-none transition-all dark:text-white"
                     />
                  </div>

                  <button 
                   onClick={handleGeneratePostDraft} 
                   disabled={isGeneratingPost || !compositionGoal}
                   className="w-full btn-base bg-slate-900 dark:bg-slate-950 text-white hover:bg-black shadow-lg btn-sm gap-3 border border-white/5"
                  >
                     {isGeneratingPost ? 'Synthesizing...' : 'Generate AI Signal'}
                  </button>

                  {draftContent && (
                    <div className="space-y-3 animate-in">
                       <div className="flex justify-between items-center">
                          <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Draft Synthesis</h4>
                          <button onClick={() => setDraftContent('')} className="btn-ghost text-rose-500 btn-xs p-0">Clear</button>
                       </div>
                       <div className="p-4 bg-indigo-50/30 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-xl">
                          <textarea 
                            value={draftContent}
                            onChange={e => setDraftContent(e.target.value)}
                            className="w-full bg-transparent border-none outline-none font-semibold text-slate-700 dark:text-slate-300 leading-relaxed min-h-[120px] resize-none text-sm"
                          />
                       </div>
                    </div>
                  )}
               </div>

               <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                  <button 
                   onClick={handlePublishPost} 
                   disabled={!draftContent}
                   className="w-full btn-primary btn-lg text-base rounded-xl"
                  >
                     Deploy Transmission
                  </button>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {activeTab === 'missions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in">
          {(localCampaigns || []).map((m, i) => (
            <div key={`${m.id}-${i}`} className={`surface p-4 rounded-xl flex flex-col justify-between h-[280px] group transition-all relative overflow-hidden ${
              m.isVsMission ? 'border-orange-200 dark:border-orange-900/50' : 'border-slate-100 dark:border-slate-800'
            }`}>
               <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1.5">
                    <div className="flex gap-2">
                      <span className={`text-[7px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${m.priority === 'high' ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'}`}>{m.priority}</span>
                      {m.isVsMission && <span className="text-[7px] font-black px-2 py-0.5 rounded uppercase tracking-widest bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">Versus</span>}
                    </div>
                    <h4 className="text-xl font-black text-slate-900 dark:text-white mt-1 uppercase tracking-tight leading-tight">{m.name}</h4>
                  </div>
                  <div className="flex flex-col items-end">
                    <button 
                      onClick={() => handleDeleteMission(m.id, m.name)}
                      className="btn-icon text-slate-300 hover:text-rose-500 mb-1"
                      title="Delete Mission"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                    <div className="stat-value text-slate-900 dark:text-white">{m.progress}%</div>
                    <div className={`text-[7px] font-black uppercase tracking-widest mt-1 ${
                      m.progress === 100 ? 'text-emerald-500' : 
                      m.progress > 0 ? 'text-indigo-500' : 
                      'text-slate-400'
                    }`}>
                      {m.progress === 100 ? 'Completed' : m.progress > 0 ? 'In Progress' : 'Pending'}
                    </div>
                  </div>
               </div>
               
               <div className="flex-grow">
                 <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 italic leading-relaxed">"{m.objective}"</p>
               </div>

               <div className="space-y-3 mt-4">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Update Progress</label>
                    </div>
                    <div className="relative pt-4 pb-2 group/slider h-12 flex items-center">
                      {/* Progress Tooltip */}
                      <div 
                        className="absolute -top-2 px-2 py-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black rounded-lg opacity-0 group-hover/slider:opacity-100 transition-all pointer-events-none whitespace-nowrap z-20 shadow-sm"
                        style={{ left: `${m.progress}%`, transform: 'translateX(-50%)' }}
                      >
                        {m.progress}%
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-white"></div>
                      </div>

                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full absolute top-1/2 -translate-y-1/2 pointer-events-none overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-75 ${m.isVsMission ? 'bg-orange-500' : 'bg-indigo-500'}`} 
                          style={{ width: `${m.progress}%` }}
                        ></div>
                      </div>
                      <input 
                        type="range"
                        min="0"
                        max="100"
                        value={m.progress}
                        onChange={(e) => handleUpdateProgress(m.id, parseInt(e.target.value) || 0)}
                        className={`w-full h-8 bg-transparent appearance-none cursor-pointer outline-none relative z-10
                          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:h-7 
                          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-4 
                          [&::-webkit-slider-thumb]:shadow-sm hover:[&::-webkit-slider-thumb]:scale-110 
                          transition-all ${m.isVsMission ? '[&::-webkit-slider-thumb]:border-orange-500' : '[&::-webkit-slider-thumb]:border-indigo-600'}`}
                        title="Update Progress"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => handleLaunchTactics(m)} 
                      className="w-full btn-primary btn-xs flex items-center justify-center gap-2" 
                      data-html2canvas-ignore
                    >
                      <Zap className="w-3 h-3" />
                      {m.tacticalPlan ? 'View Tactical Plan' : 'Generate Tactics'}
                    </button>
                  </div>

                  {m.tacticalPlan && (
                    <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-3 h-3 text-indigo-500" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Tactical Steps</span>
                      </div>
                      <div className="space-y-2">
                        {m.tacticalPlan.slice(0, 3).map((step, idx) => (
                          <div key={`${step}-${idx}`} className="flex gap-2 items-start">
                            <div className="w-1 h-1 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                            <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium leading-tight line-clamp-2">{step}</p>
                          </div>
                        ))}
                        {m.tacticalPlan.length > 3 && (
                          <button 
                            onClick={() => handleLaunchTactics(m)}
                            className="text-[9px] font-bold text-indigo-500 hover:underline pt-1"
                          >
                            + {m.tacticalPlan.length - 3} more steps
                          </button>
                        )}
                      </div>
                    </div>
                  )}
               </div>
            </div>
          ))}
          {localCampaigns.length === 0 && (
            <div className="col-span-full py-6 text-center space-y-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800">
               <div className="text-2xl">🚀</div>
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">No active mission objectives identified.</p>
            </div>
          )}
        </div>
      )}

      <PopupModal
        url="https://calendly.com/teamflokker/new-meeting"
        onModalClose={() => setIsBookingOpen(false)}
        open={isBookingOpen}
        rootElement={document.getElementById("root")!}
      />

      <AnimatePresence mode="wait">
            {selectedCompetitor && (
        <motion.div 
          key="comparison-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 z-[1200] flex items-center justify-center bg-slate-950/95 backdrop-blur-3xl ${isFullscreen ? 'p-0' : 'p-4'}`} 
          data-html2canvas-ignore
        >
           <motion.div 
             initial={{ scale: 0.95, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             exit={{ scale: 0.95, opacity: 0 }}
             className={`surface w-full flex flex-col overflow-hidden relative transition-all duration-500 ${
               isFullscreen 
                 ? 'h-full rounded-none border-0' 
                 : 'max-w-7xl h-[94vh] rounded-xl sm:rounded-xl shadow-2xl border-4 sm:border-8 border-slate-100 dark:border-slate-800'
             }`}
           >
              {/* Header */}
              <div className="px-4 py-4 sm:px-10 sm:py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center surface z-10">
                  <div className="flex items-center gap-4 sm:gap-4">
                    <div className="w-12 h-12 sm:w-12 sm:h-12 ocula-gradient-bg rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                      <Swords className="w-6 h-6 sm:w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Bench Scry: Versus</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 rounded text-[9px] sm:text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{report.businessName}</span>
                        <span className="text-[8px] font-black text-slate-300 dark:text-slate-600 animate-pulse-soft">VS</span>
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[9px] sm:text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">{selectedCompetitor.name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4">
                    <button
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      className="p-2 sm:p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all"
                      title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                    >
                      {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                    </button>
                    <button 
                      disabled={isComparingExporting}
                      onClick={async () => {
                        setIsComparingExporting(true);
                        try {
                          const delta = report.overallScore - selectedCompetitor.score;
                          const deltaText = delta >= 0 ? `+${delta} points lead` : `${delta} points gap`;

                          const body = `
                            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
                            <head>
                              <meta charset='utf-8'>
                              <style>
                                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1e293b; padding: 20px; }
                                .container { width: 100%; max-width: 800px; margin: 0 auto; }
                                .header { text-align: center; margin-bottom: 45px; padding-bottom: 25px; border-bottom: 4px solid #3b82f6; }
                                .title { font-size: 28px; font-weight: 800; color: #0f172a; text-transform: uppercase; margin: 0; }
                                .subtitle { font-size: 14px; color: #64748b; font-weight: 500; margin-top: 5px; }
                                .meta { font-size: 11px; color: #94a3b8; font-weight: bold; margin-top: 10px; text-transform: uppercase; letter-spacing: 1px; }
                                
                                h2 { color: #1e3a8a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 40px; text-transform: uppercase; font-size: 18px; letter-spacing: 1px; }
                                h3 { color: #1e40af; margin-top: 25px; font-size: 14px; text-transform: uppercase; }
                                
                                .verdict-box { background-color: #f0f7ff; border-left: 6px solid #3b82f6; padding: 20px; border-radius: 8px; margin: 25px 0; }
                                .verdict-text { font-size: 16px; font-style: italic; font-weight: 500; color: #1e3a8a; line-height: 1.7; margin: 0 0 15px 0; }
                                
                                .grid-moves { margin-top: 15px; }
                                .move-card { background-color: #ffffff; border: 1px solid #bfdbfe; padding: 15px; border-radius: 6px; margin-bottom: 12px; }
                                .move-num { font-size: 10px; font-weight: bold; color: #3b82f6; text-transform: uppercase; letter-spacing: 1px; }
                                .move-text { font-size: 12px; color: #1e293b; margin-top: 4px; margin-bottom: 0; }
                                
                                .versus-section { background: #f8fafc; border: 1px solid #e2e8f0; padding: 25px; border-radius: 12px; margin: 30px 0; }
                                .versus-title { font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; color: #64748b; text-align: center; margin-bottom: 15px; }
                                
                                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                                th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; font-size: 12px; }
                                th { background-color: #f1f5f9; font-weight: bold; color: #1e293b; text-transform: uppercase; font-size: 10px; letter-spacing: 1px; }
                                
                                .bullet-item { margin-bottom: 8px; font-size: 12px; line-height: 1.5; color: #334155; }
                              </style>
                            </head>
                            <body>
                              <div class="container">
                                <div class="header">
                                  <div class="title">Ocula Bench Scry Report</div>
                                  <div class="subtitle">Competitive Intelligence & Versus Benchmark Analysis</div>
                                  <div class="meta">Generated for ${report.businessName} • Versus ${selectedCompetitor.name} • ${new Date().toLocaleDateString()}</div>
                                </div>

                                <div class="verdict-box">
                                  <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; color: #2563eb; margin-bottom: 6px;">Ocula Strategic Verdict</div>
                                  <p class="verdict-text">"${comparisonVerdict?.verdict || "Analyzing competitive signals..."}"</p>
                                  
                                  <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; color: #475569; border-top: 1px solid #bfdbfe; padding-top: 15px; margin-top: 15px; margin-bottom: 10px;">Tactical Battle Plan</div>
                                  <div class="grid-moves">
                                    ${(comparisonVerdict?.battlePlan || []).map((move, i) => `
                                      <div class="move-card">
                                        <div class="move-num">Move 0${i+1}</div>
                                        <p class="move-text">${move}</p>
                                      </div>
                                    `).join('')}
                                  </div>
                                </div>

                                <h2>Performance Comparison Dashboard</h2>
                                <div class="versus-section">
                                  <div class="versus-title">Overall Market Visibility Strength</div>
                                  <table style="width: 100%; border: none; border-collapse: collapse; margin: 0;">
                                    <tr style="border: none;">
                                      <td style="width: 45%; border: none; text-align: center; background: #3b82f6; padding: 20px; color: #ffffff; border-radius: 8px;">
                                        <div style="font-size: 10px; text-transform: uppercase; font-weight: bold; opacity: 0.9; letter-spacing: 1px;">YOUR BUSINESS (SELF)</div>
                                        <div style="font-size: 36px; font-weight: 900; margin-top: 5px; color: #ffffff;">${report.overallScore}%</div>
                                        <div style="font-size: 11px; margin-top: 5px; opacity: 0.85;">${report.businessName}</div>
                                      </td>
                                      <td style="width: 10%; border: none; text-align: center; font-size: 20px; font-weight: bold; color: #64748b; vertical-align: middle;">
                                        VS
                                      </td>
                                      <td style="width: 45%; border: none; text-align: center; background: #f97316; padding: 20px; color: #ffffff; border-radius: 8px;">
                                        <div style="font-size: 10px; text-transform: uppercase; font-weight: bold; opacity: 0.9; letter-spacing: 1px;">RIVAL SIGNAL (COMPETITOR)</div>
                                        <div style="font-size: 36px; font-weight: 900; margin-top: 5px; color: #ffffff;">${selectedCompetitor.score}%</div>
                                        <div style="font-size: 11px; margin-top: 5px; opacity: 0.85;">${selectedCompetitor.name} (Trend: ${(selectedCompetitor.trend || 'stable').toUpperCase()})</div>
                                      </td>
                                    </tr>
                                  </table>
                                  <div style="margin-top: 20px; font-size: 14px; font-weight: bold; text-align: center; color: #1e3a8a;">
                                    Strategic Lead Indicator: ${deltaText}
                                  </div>
                                </div>

                                <h2>Pillar-by-Pillar Visibility Matrix</h2>
                                <table>
                                  <thead>
                                    <tr>
                                      <th>Visibility Pillar</th>
                                      <th>Your Score</th>
                                      <th>Rival Score</th>
                                      <th>Comparative Assessment</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    ${dualRadarData.map(metric => {
                                      const diff = Math.round(metric.A || 0) - Math.round(metric.B || 0);
                                      const assessment = diff > 8 ? "Significant Advantage" : diff > 0 ? "Slight Lead" : diff < -8 ? "Vulnerable Gaps" : diff < 0 ? "Slightly Outperformed" : "Parity Established";
                                      return `
                                        <tr>
                                          <td style="font-weight: bold;">${metric.subject}</td>
                                          <td style="color: #2563eb; font-weight: bold;">${Math.round(metric.A || 0)}%</td>
                                          <td style="color: #ea580c; font-weight: bold;">${Math.round(metric.B || 0)}%</td>
                                          <td>${assessment} (${diff >= 0 ? '+' : ''}${diff}%)</td>
                                        </tr>
                                      `;
                                    }).join('')}
                                  </tbody>
                                </table>

                                <h2>Historical Scores Timeline</h2>
                                <table>
                                  <thead>
                                    <tr>
                                      <th>Timeline Position</th>
                                      <th>Your Performance</th>
                                      <th>Rival Performance</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    ${(selectedCompetitor.historicalScores || [40, 45, 50, 55, 60]).map((score: number, i: number) => {
                                      const selfScore = Math.max(0, report.overallScore - (4 - i) * 2);
                                      return `
                                        <tr>
                                          <td>Month ${i + 1}</td>
                                          <td>${selfScore}%</td>
                                          <td>${score}%</td>
                                        </tr>
                                      `;
                                    }).join('')}
                                  </tbody>
                                </table>

                                <h2>Competitor Intelligence Profile: ${selectedCompetitor.name}</h2>
                                <table style="width: 100%; border: none;">
                                  <tr style="border: none;">
                                    <td style="width: 33%; vertical-align: top; background: #f0fdf4; padding: 15px; border-radius: 8px; border: 1px solid #dcfce7;">
                                      <div style="font-weight: bold; color: #166534; font-size: 11px; text-transform: uppercase; margin-bottom: 10px; border-bottom: 1px solid #bbf7d0; padding-bottom: 5px;">🔥 Core Strengths</div>
                                      <ul style="margin: 0; padding-left: 15px;">
                                        ${(selectedCompetitor.strengths || []).map(s => `<li class="bullet-item">${s}</li>`).join('') || '<li class="bullet-item" style="color:#888;">No known strengths recorded.</li>'}
                                      </ul>
                                    </td>
                                    <td style="width: 33%; vertical-align: top; background: #fff1f2; padding: 15px; border-radius: 8px; border: 1px solid #ffe4e6;">
                                      <div style="font-weight: bold; color: #991b1b; font-size: 11px; text-transform: uppercase; margin-bottom: 10px; border-bottom: 1px solid #fecdd3; padding-bottom: 5px;">🎯 Exploitable Gaps</div>
                                      <ul style="margin: 0; padding-left: 15px;">
                                        ${(selectedCompetitor.weaknesses || []).map(w => `<li class="bullet-item">${w}</li>`).join('') || '<li class="bullet-item" style="color:#888;">No known weaknesses recorded.</li>'}
                                      </ul>
                                    </td>
                                    <td style="width: 33%; vertical-align: top; background: #eff6ff; padding: 15px; border-radius: 8px; border: 1px solid #dbeafe;">
                                      <div style="font-weight: bold; color: #1e40af; font-size: 11px; text-transform: uppercase; margin-bottom: 10px; border-bottom: 1px solid #bfdbfe; padding-bottom: 5px;">📡 Recent Signals</div>
                                      <ul style="margin: 0; padding-left: 15px;">
                                        ${(selectedCompetitor.recentActivities || []).map(a => `<li class="bullet-item">${a}</li>`).join('') || '<li class="bullet-item" style="color:#888;">No recent signals detected.</li>'}
                                      </ul>
                                    </td>
                                  </tr>
                                </table>

                                <h2>Keyword Battleground Intelligence</h2>
                                ${keywordBattleground && keywordBattleground.topEdges.length > 0 ? `
                                  <div style="background: #fdf2f8; border: 1px solid #fbcfe8; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                                    <p style="margin: 0; font-size: 12px; font-weight: bold; color: #db2777; text-transform: uppercase; letter-spacing: 1px;">Top Actionable Keyword Edges (Your Unique Advantages):</p>
                                    <ul style="margin: 10px 0 0 20px; font-size: 12px; font-weight: bold;">
                                      ${keywordBattleground.topEdges.map(edge => `<li style="color:#be185d; margin-bottom: 4px;">${edge}</li>`).join('')}
                                    </ul>
                                  </div>
                                ` : ''}

                                <table style="width: 100%;">
                                  <thead>
                                    <tr>
                                      <th style="width: 33%; background-color: #eff6ff; color: #1e40af;">Your Unique Keywords</th>
                                      <th style="width: 33%; background-color: #f5f3ff; color: #6d28d9;">Shared Battleground Keywords</th>
                                      <th style="width: 33%; background-color: #fff7ed; color: #c2410c;">Rival-Exclusive Keywords</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr>
                                      <td style="vertical-align: top;">
                                        <ul style="margin: 0; padding-left: 15px;">
                                          ${(keywordBattleground?.uniqueToSelf || []).slice(0, 15).map(k => `<li class="bullet-item">${k}</li>`).join('') || '<li class="bullet-item" style="color:#8c9ba5;">None.</li>'}
                                        </ul>
                                      </td>
                                      <td style="vertical-align: top;">
                                        <ul style="margin: 0; padding-left: 15px;">
                                          ${(keywordBattleground?.overlapping || []).slice(0, 15).map(k => `<li class="bullet-item">${k}</li>`).join('') || '<li class="bullet-item" style="color:#8c9ba5;">None.</li>'}
                                        </ul>
                                      </td>
                                      <td style="vertical-align: top;">
                                        <ul style="margin: 0; padding-left: 15px;">
                                          ${(keywordBattleground?.uniqueToRival || []).slice(0, 15).map(k => `<li class="bullet-item">${k}</li>`).join('') || '<li class="bullet-item" style="color:#8c9ba5;">None.</li>'}
                                        </ul>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>

                                <div style="margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 25px; font-size: 11px; color: #94a3b8; text-align: center;">
                                  This report was generated by Ocula Intelligence. All comparative metrics are sourced from real-time digital authority scraping.
                                </div>
                              </div>
                            </body>
                            </html>
                          `;

                          const fileName = `Ocula-Comparison-${report.businessName.replace(/\s+/g, '-')}-vs-${selectedCompetitor.name.replace(/\s+/g, '-')}`;
                          const blob = new Blob(['\ufeff', body], { type: 'application/msword' });
                          const link = document.createElement('a'); 
                          link.href = URL.createObjectURL(blob); 
                          link.download = `${fileName}.doc`; 
                          link.click();
                        } catch (err: any) {
                          console.error("Comparison export failed", err);
                          setErrorMessage({ title: "Export Error", body: `Failed to generate Word document: ${formatErrorMessage(err)}` });
                        } finally {
                          setIsComparingExporting(false);
                        }
                      }}
                      className="hidden md:flex btn-secondary btn-sm gap-2 rounded-xl disabled:opacity-50"
                    >
                      {isComparingExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                      {isComparingExporting ? 'Generating...' : 'Download Word Dossier'}
                    </button>
                    <button 
                      onClick={() => deployVsMission(selectedCompetitor)}
                      className="hidden sm:flex btn-primary btn-sm gap-2 rounded-xl"
                    >
                      <Target className="w-4 h-4" />
                      <span className="hidden lg:inline">Deploy VS Mission</span>
                      <span className="lg:hidden">Deploy</span>
                    </button>
                    <button onClick={() => setSelectedCompetitor(null)} className="text-slate-300 hover:text-slate-900 dark:hover:text-white hover:rotate-90 transition-all duration-300 p-4 sm:p-4">
                      <X className="w-6 h-6 sm:w-8 h-8" />
                    </button>
                  </div>
              </div>

              <div id="comparison-overlay-content" className="flex-grow overflow-y-auto p-4 space-y-4 sm:space-y-12 bg-slate-50/30 dark:bg-slate-950/30">
                 {/* Strategic Verdict Section */}
                 <div className="relative group">
                   <div className="relative surface p-6 space-y-6">
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl flex items-center justify-center">
                           <Sparkles className="w-5 h-5" />
                         </div>
                         <h4 className="text-xs font-medium text-slate-900 dark:text-white uppercase tracking-wider">Ocula Strategic Verdict</h4>
                       </div>
                       {/* AI Loading handled below in content area */}
                     </div>
                     
                       <div className="min-h-[100px] space-y-4">
                         {isGeneratingVerdict ? (
                           <AILoader message="Scrying competitive signals..." className="p-4" />
                         ) : (
                           <>
                             <p className="text-lg sm:text-xl font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                               "{comparisonVerdict?.verdict || "Analyzing competitive signals..."}"
                             </p>
                             {comparisonVerdict?.battlePlan && (
                               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                                 {comparisonVerdict.battlePlan.map((move, i) => (
                                   <div key={`${move}-${i}`} className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3 group/move hover:border-slate-300 transition-colors">
                                     <div className="flex items-center gap-2">
                                       <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest">Move 0{i+1}</span>
                                       <div className="h-px flex-grow bg-slate-200 dark:bg-slate-700"></div>
                                     </div>
                                     <p className="text-[12px] font-medium text-slate-700 dark:text-slate-300 leading-snug group-hover/move:text-slate-900 dark:group-hover/move:text-white transition-colors">{move}</p>
                                   </div>
                                 ))}
                               </div>
                             )}
                           </>
                         )}
                       </div>

                     <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-4 items-center justify-between">
                       <div className="flex items-center gap-4">
                         <div className="space-y-1">
                           <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Visibility Delta</span>
                           <div className="flex items-center gap-2">
                             <span className={`stat-value ${report.overallScore >= selectedCompetitor.score ? 'text-emerald-600' : 'text-rose-600'}`}>
                               {report.overallScore >= selectedCompetitor.score ? '+' : ''}{report.overallScore - selectedCompetitor.score}
                             </span>
                             <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase">Points</span>
                           </div>
                         </div>
                         <div className="w-px h-10 bg-slate-200 dark:bg-slate-700"></div>
                         <div className="space-y-1">
                           <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rival Momentum</span>
                           <div className="flex items-center gap-2">
                             <TrendBadge trend={selectedCompetitor.trend} />
                           </div>
                         </div>
                       </div>
                     </div>
                   </div>
                 </div>

                 {/* Battle Visualization */}
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                    <div className="relative">
                      <div className="relative flex items-center justify-center gap-4 sm:gap-16">
                         <div className="text-center space-y-4 group">
                            <div className="relative">
                              <div className="w-28 h-28 sm:w-44 sm:h-44 bg-slate-900 dark:bg-white rounded-2xl flex flex-col items-center justify-center text-white dark:text-slate-900 shadow-sm relative">
                                <span className="big-stat"><AnimatedCounter value={Number(report.overallScore) || 0} /></span>
                                <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider mt-1 opacity-60">Score</span>
                              </div>
                            </div>
                            <p className="text-xs font-medium uppercase text-slate-600 dark:text-slate-400 tracking-wider">Your Business</p>
                         </div>
                         
                         <div className="flex flex-col items-center gap-4">
                           <div className="h-px w-8 sm:w-12 bg-slate-200 dark:bg-slate-700"></div>
                           <div className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 font-medium text-xs">VS</div>
                           <div className="h-px w-8 sm:w-12 bg-slate-200 dark:bg-slate-700"></div>
                         </div>

                         <div className="text-center space-y-4 group">
                            <div className="relative">
                              <div className="w-28 h-28 sm:w-44 sm:h-44 bg-slate-100 dark:bg-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-900 dark:text-white shadow-sm relative border border-slate-200 dark:border-slate-700">
                                <span className="big-stat">{selectedCompetitor.score}</span>
                                <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider mt-1 opacity-60">Score</span>
                              </div>
                            </div>
                            <p className="text-xs font-medium uppercase text-slate-600 dark:text-slate-400 tracking-wider">Rival Signal</p>
                         </div>
                      </div>
                    </div>

                    <div className="surface p-6 h-[300px] sm:h-[480px] relative overflow-hidden group">
                        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center pointer-events-none z-10">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse-soft"></div>
                            <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider truncate max-w-[120px]" title={report?.businessName || "Self"}>
                              {report?.businessName || "Self"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                            <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider truncate max-w-[120px]" title={selectedCompetitor?.name || "Rival"}>
                              {selectedCompetitor?.name || "Rival"}
                            </span>
                          </div>
                        </div>
                        <ResponsiveContainer width="100%" height="90%">
                           <RadarChart 
                             data={dualRadarData}
                             onMouseMove={(state) => {
                               if (state && state.activeLabel) {
                                 setHoveredRadarMetric(state.activeLabel);
                               }
                             }}
                             onMouseLeave={() => setHoveredRadarMetric(null)}
                           >
                              <PolarGrid stroke={isDarkMode ? "#334155" : "#cbd5e0"} />
                              <PolarAngleAxis dataKey="subject" tick={{fill: isDarkMode ? '#94a3b8' : '#475569', fontSize: 10, fontWeight: 900, letterSpacing: 1}} />
                              <RechartsRadar name={report?.businessName || "Self"} dataKey="A" stroke="#6366f1" strokeWidth={3} fill="#6366f1" fillOpacity={0.4} />
                              <RechartsRadar name={selectedCompetitor?.name || "Rival"} dataKey="B" stroke="#f97316" strokeWidth={3} fill="#f97316" fillOpacity={0.2} />
                              <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', color: isDarkMode ? '#fff' : '#0f172a', padding: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                itemStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                              />
                           </RadarChart>
                        </ResponsiveContainer>
                    </div>
                 </div>

                 {/* Visibility Breakdown Section */}
                 <div className="space-y-10">
                   <div className="flex items-center gap-4">
                     <div className="h-px flex-grow bg-slate-100 dark:bg-slate-800"></div>
                     <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 dark:text-slate-500">Visibility Breakdown</h3>
                     <div className="h-px flex-grow bg-slate-100 dark:bg-slate-800"></div>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {dualRadarData.map((metric, i) => (
                       <div 
                         key={`${metric.subject}-${i}`}
                         className={`p-4 rounded-xl border transition-all duration-300 ${
                           hoveredRadarMetric === metric.subject 
                             ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 shadow-lg scale-[1.02]' 
                             : 'surface border-slate-100 dark:border-slate-800 shadow-sm'
                         }`}
                       >
                         <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">{metric.subject}</h4>
                         <div className="space-y-4">
                           <div className="flex justify-between items-end">
                             <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase">Self</span>
                             <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">{Math.round(metric.A || 0)}%</span>
                           </div>
                           <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                             <div 
                               className="h-full bg-indigo-500 rounded-full transition-all duration-1000" 
                               style={{ width: `${metric.A || 0}%` }}
                             ></div>
                           </div>
                           
                           <div className="flex justify-between items-end">
                             <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase">Rival</span>
                             <span className="text-sm font-black text-orange-500">{Math.round(metric.B || 0)}%</span>
                           </div>
                           <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                             <div 
                               className="h-full bg-orange-500 rounded-full transition-all duration-1000" 
                               style={{ width: `${metric.B || 0}%` }}
                             ></div>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>

                 {/* Historical Momentum Section */}
                 <div className="space-y-10">
                   <div className="flex items-center gap-4">
                     <div className="h-px flex-grow bg-slate-100 dark:bg-slate-800"></div>
                     <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 dark:text-slate-500">Historical Momentum</h3>
                     <div className="h-px flex-grow bg-slate-100 dark:bg-slate-800"></div>
                   </div>
                   
                   <div className="surface p-4 h-[350px]">
                     <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={(selectedCompetitor.historicalScores || [40, 45, 50, 55, 60]).map((score: number, i: number) => ({
                         name: `Month ${i + 1}`,
                         self: Math.max(0, report.overallScore - (4 - i) * 2),
                         rival: score
                       }))}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#1e293b" : "#f1f5f9"} />
                         <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: isDarkMode ? '#94a3b8' : '#475569', fontSize: 10, fontWeight: 800}} />
                         <YAxis axisLine={false} tickLine={false} tick={{fill: isDarkMode ? '#94a3b8' : '#475569', fontSize: 10, fontWeight: 800}} />
                         <Tooltip 
                           contentStyle={{ backgroundColor: isDarkMode ? '#0f172a' : '#fff', border: isDarkMode ? '1px solid #1e293b' : '1px solid #f1f5f9', borderRadius: '1rem' }}
                           itemStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                         />
                         <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px', fontSize: '10px', fontWeight: 'black', textTransform: 'uppercase' }} />
                         <Line type="monotone" dataKey="self" name="Self" stroke="#3b82f6" strokeWidth={4} dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: isDarkMode ? '#0f172a' : '#fff' }} activeDot={{ r: 8 }} />
                         <Line type="monotone" dataKey="rival" name="Rival" stroke="#f97316" strokeWidth={4} dot={{ r: 6, fill: '#f97316', strokeWidth: 2, stroke: isDarkMode ? '#0f172a' : '#fff' }} activeDot={{ r: 8 }} />
                       </LineChart>
                     </ResponsiveContainer>
                   </div>
                 </div>

                 {/* Competitor Intelligence Profile */}
                 <div className="space-y-10">
                   <div className="flex items-center gap-4">
                     <div className="h-px flex-grow bg-slate-100 dark:bg-slate-800"></div>
                     <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 dark:text-slate-500">Intelligence Profile</h3>
                     <div className="h-px flex-grow bg-slate-100 dark:bg-slate-800"></div>
                   </div>
                   
                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                     <div className="surface p-4 hover:shadow-md transition-shadow space-y-4">
                       <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center text-lg">💪</div>
                           <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Core Strengths</h4>
                         </div>
                         <span className="text-[8px] font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded uppercase">Active</span>
                       </div>
                       <ul className="space-y-4">
                         {selectedCompetitor.strengths?.map((s: string, idx: number) => (
                           <li key={`${s}-${idx}`} className="flex gap-4 items-start group">
                             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 group-hover:scale-150 transition-transform"></div>
                             <p className="text-[12px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed">{s}</p>
                           </li>
                         )) || <li className="text-[10px] font-bold text-slate-400 italic">No strength data identified.</li>}
                       </ul>
                     </div>

                     <div className="surface p-4 hover:shadow-md transition-shadow space-y-4">
                       <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center text-lg">🎯</div>
                           <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Exploitable Gaps</h4>
                         </div>
                         <span className="text-[8px] font-black text-rose-500 bg-rose-50 dark:bg-rose-900/30 px-2 py-1 rounded uppercase">Priority</span>
                       </div>
                       <ul className="space-y-4">
                         {selectedCompetitor.weaknesses?.map((w: string, idx: number) => (
                           <li key={`${w}-${idx}`} className="flex gap-4 items-start group">
                             <div className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-1.5 group-hover:scale-150 transition-transform"></div>
                             <p className="text-[12px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed">{w}</p>
                           </li>
                         )) || <li className="text-[10px] font-bold text-slate-400 italic">No weakness data identified.</li>}
                       </ul>
                     </div>

                     <div className="bg-slate-900 dark:bg-slate-950 p-4 rounded-xl sm:rounded-xl shadow-2xl space-y-4 border-4 border-slate-800 dark:border-slate-900 relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full"></div>
                       <div className="flex items-center justify-between relative">
                         <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center text-lg">📡</div>
                           <h4 className="text-xs font-black text-white/60 uppercase tracking-widest">Recent Signals</h4>
                         </div>
                         <div className="flex gap-1">
                           <div className="w-1 h-1 bg-indigo-400 rounded-full animate-pulse"></div>
                           <div className="w-1 h-1 bg-indigo-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                           <div className="w-1 h-1 bg-indigo-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                         </div>
                       </div>
                       <ul className="space-y-4 relative">
                         {selectedCompetitor.recentActivities?.map((a: string, idx: number) => (
                           <li key={`${a}-${idx}`} className="flex gap-4 items-start group">
                             <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5 group-hover:scale-150 transition-transform"></div>
                             <p className="text-[12px] font-bold text-slate-300 dark:text-slate-400 leading-relaxed">{a}</p>
                           </li>
                         )) || <li className="text-[10px] font-bold text-slate-500 italic">No recent activity detected.</li>}
                       </ul>
                     </div>
                   </div>
                 </div>

                 {/* Keyword Battleground Section */}
                 <div className="space-y-10">
                   <div className="flex items-center gap-4">
                     <div className="h-px flex-grow bg-slate-100 dark:bg-slate-800"></div>
                     <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 dark:text-slate-500">Keyword Battleground</h3>
                     <div className="h-px flex-grow bg-slate-100 dark:bg-slate-800"></div>
                   </div>
                   
                   <div className="text-center space-y-4">
                     {keywordBattleground && keywordBattleground.topEdges.length > 0 && (
                       <div className="flex flex-col items-center gap-4 animate-in slide-in-from-bottom duration-700">
                         <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em] bg-emerald-50 dark:bg-emerald-900/20 px-4 py-1.5 rounded-full">Top 3 Visibility Edges Identified</span>
                         <div className="flex flex-wrap justify-center gap-4">
                           {keywordBattleground.topEdges.map((kw, i) => (
                             <div key={`${kw}-${i}`} className="px-4 sm:px-5 py-3 surface border-2 border-emerald-100 dark:border-emerald-800/50 rounded-xl flex items-center gap-3 shadow-md hover:scale-105 transition-transform cursor-default">
                               <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-[10px]">⚡</div>
                               <span className="text-[12px] sm:text-[13px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{kw}</span>
                             </div>
                           ))}
                         </div>
                       </div>
                     )}
                   </div>
                   
                   {keywordBattleground && (
                     <div className="surface p-4">
                       <Suspense fallback={<ComponentLoader />}>
                         <KeywordVenn 
                           uniqueToSelf={keywordBattleground.uniqueToSelf}
                           overlapping={keywordBattleground.overlapping}
                           uniqueToRival={keywordBattleground.uniqueToRival}
                           selfName="Self"
                           rivalName={selectedCompetitor.name}
                         />
                       </Suspense>
                     </div>
                   )}
                 </div>
              </div>
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 surface flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => setSelectedCompetitor(null)} 
                  className="flex-1 btn-secondary btn-md sm:py-4 rounded-[1.5rem] sm:rounded-xl"
                >
                  Close Overlay
                </button>
                <button 
                  onClick={() => {
                    deployVsMission(selectedCompetitor);
                    setSelectedCompetitor(null);
                  }}
                  className="flex-[2] btn-primary btn-md sm:py-4 rounded-[1.5rem] sm:rounded-xl"
                >
                  Launch Domination Mission
                </button>
              </div>
           </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      <AnimatePresence>
        {activeTactics && (
          <motion.div 
            key="tactics-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1300] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-3xl" 
            data-html2canvas-ignore
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="surface w-full max-w-2xl rounded-xl sm:rounded-xl shadow-2xl overflow-hidden border-4 sm:border-8 border-slate-100 dark:border-slate-800"
            >
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center surface">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 ocula-gradient-bg rounded-lg flex items-center justify-center text-white">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">{activeTactics.task}</h3>
                  </div>
                  <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest ml-11">{activeTactics.business}</p>
                </div>
                <button 
                  onClick={() => setActiveTactics(null)} 
                  className="text-slate-300 hover:text-slate-900 dark:hover:text-white hover:rotate-90 transition-all duration-300 p-4"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            <div className="p-4 max-h-[70vh] overflow-y-auto bg-slate-50/30 dark:bg-slate-950/30">
              {loadingTactics ? (
                <AILoader message="Decoding Strategy..." />
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-10">
                  <div className="prose prose-slate dark:prose-invert max-w-none">
                    {Array.isArray(activeTactics.content) ? (
                      <ul className="space-y-4 list-none pl-0">
                        {activeTactics.content.map((step: string, idx: number) => (
                          <li key={`${step}-${idx}`} className="flex gap-4 items-start p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-colors group">
                            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-black shrink-0 mt-0.5 group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-sm">
                              {idx + 1}
                            </div>
                            <span className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed text-base">{step}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 font-bold leading-relaxed text-lg sm:text-xl italic">
                        {activeTactics.content}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => setActiveTactics(null)} 
                    className="w-full btn-primary btn-xl text-lg rounded-xl"
                  >
                    Confirm Deployment
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      <div className="h-14 sm:hidden"></div>

      {/* Hidden Dossier for Export */}
      {isDossierVisible && (
        <div className="absolute top-0 left-[-9999px] z-[-1] bg-white">
          <div ref={dossierRef} className="w-[210mm] mx-auto bg-white text-slate-900 p-0 font-sans">
            {/* Page 1: Cover */}
            <div className="h-[297mm] flex flex-col justify-between p-20 border-[20px] border-slate-900 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 ocula-gradient-bg opacity-10 rounded-bl-full"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 ocula-gradient-bg opacity-5 rounded-tr-full"></div>
              
              <div className="space-y-10 relative z-10">
                <div className="flex items-center gap-4">
                  {(exportLogoUrl || user?.businessDetails?.logo || report.profileBadge?.logoUrl) ? (
                    <img 
                      src={exportLogoUrl || user?.businessDetails?.logo || report.profileBadge?.logoUrl} 
                      className="w-14 h-14 object-contain rounded-xl border border-slate-200 shrink-0" 
                      alt="Brand Logo" 
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <OculaLogo className="w-12 h-12 text-slate-900 shrink-0" />
                  )}
                  <span className="text-2xl font-black tracking-tighter text-slate-900">
                    {user?.businessDetails?.name || report.businessName || 'ocula'}
                  </span>
                </div>
                <div 
                  className="h-1.5 w-32 rounded-full" 
                  style={{ backgroundColor: user?.businessDetails?.brandColor || '#6366f1' }}
                />
                <h1 className="text-7xl font-black tracking-tighter leading-none text-slate-900 uppercase">Strategic<br/>Visibility<br/>Dossier</h1>
              </div>

              <div className="space-y-4 relative z-10">
                <div className="space-y-4">
                  <p className="text-xs font-black uppercase tracking-[0.4em] text-indigo-600">Intelligence Target</p>
                  <h2 className="text-2xl font-black text-slate-900">{report.businessName}</h2>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-32 h-32 ocula-gradient-bg rounded-xl flex flex-col items-center justify-center text-white shadow-2xl">
                    <span className="text-2xl font-black">{report.overallScore}</span>
                    <span className="text-[8px] font-bold uppercase tracking-widest opacity-60">Index</span>
                  </div>
                  {report.focusMode && (
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-2">Focus: {report.focusMode}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Page 2: Executive Summary & SWOT */}
            <div className="min-h-[297mm] p-20 space-y-12 border-t border-slate-100 bg-white">
              {/* Running Header */}
              <div className="flex items-center justify-between pb-6 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  {(exportLogoUrl || user?.businessDetails?.logo || report.profileBadge?.logoUrl) ? (
                    <img 
                      src={exportLogoUrl || user?.businessDetails?.logo || report.profileBadge?.logoUrl} 
                      className="w-10 h-10 object-contain rounded-lg border border-slate-200 shrink-0" 
                      alt="Brand Logo" 
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <OculaLogo className="w-8 h-8 text-slate-900 shrink-0" />
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-900 uppercase tracking-tight">
                      {user?.businessDetails?.name || report.businessName}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      {user?.businessDetails?.industry || report.profileBadge?.industry || 'Executive Brief'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: user?.businessDetails?.brandColor || '#6366f1' }} />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Section 01 - 02</span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-indigo-600">01. Executive Summary</h3>
                <div className="h-px w-full bg-slate-100"></div>
                <p className="text-lg font-medium text-slate-700 leading-relaxed italic">"{report.summary}"</p>
              </div>

              <div className="space-y-10">
                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-indigo-600">02. Market Intelligence (SWOT)</h3>
                <Suspense fallback={<ComponentLoader />}>
                  <SWOTAnalysis swot={report.swotAnalysis} variant="dossier" isFullAccess={capabilities.canViewFullSWOT} />
                </Suspense>
              </div>
            </div>

            {/* Page 3: Visibility Score Trend & Category Breakdown */}
            <div className="min-h-[297mm] p-20 space-y-10 border-t border-slate-100 bg-white">
              {/* Running Header */}
              <div className="flex items-center justify-between pb-6 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  {(exportLogoUrl || user?.businessDetails?.logo || report.profileBadge?.logoUrl) ? (
                    <img 
                      src={exportLogoUrl || user?.businessDetails?.logo || report.profileBadge?.logoUrl} 
                      className="w-10 h-10 object-contain rounded-lg border border-slate-200 shrink-0" 
                      alt="Brand Logo" 
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <OculaLogo className="w-8 h-8 text-slate-900 shrink-0" />
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-900 uppercase tracking-tight">
                      {user?.businessDetails?.name || report.businessName}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Visibility Trajectory & Category Index</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: user?.businessDetails?.brandColor || '#6366f1' }} />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Section 03</span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-indigo-600">03. Visibility Score Trajectory & Category Breakdown</h3>
                <div className="h-px w-full bg-slate-100"></div>
              </div>

              {/* Recharts Visibility Score Trend Visualization Chart */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-6 space-y-5 shadow-xs">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/80 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <h4 className="text-base font-black text-slate-900 tracking-tight uppercase">Score Trajectory Over Time</h4>
                    </div>
                    <p className="text-xs font-bold text-slate-500 mt-1">6-Month historical performance trend vs industry benchmark</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase text-slate-400">Trajectory Gain:</span>
                      <span className={`text-xs font-black ${dossierTrendMetrics.totalGain >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {dossierTrendMetrics.totalGain >= 0 ? `+${dossierTrendMetrics.totalGain} pts` : `${dossierTrendMetrics.totalGain} pts`}
                      </span>
                    </div>
                    <div className="bg-slate-900 text-white px-3.5 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-sm">
                      <span className="text-[9px] uppercase tracking-wider text-slate-400">Current Score:</span>
                      <span className="text-indigo-400">{report.overallScore}%</span>
                    </div>
                  </div>
                </div>

                <div className="h-[210px] w-full pt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dossierTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="dossierScoreGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis 
                        dataKey="period" 
                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} 
                        axisLine={{ stroke: '#cbd5e1' }}
                        tickLine={false}
                      />
                      <YAxis 
                        domain={[0, 100]} 
                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} 
                        axisLine={{ stroke: '#cbd5e1' }}
                        tickLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#0f172a', 
                          borderRadius: '12px', 
                          border: 'none', 
                          color: '#fff', 
                          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="score" 
                        name="Visibility Score" 
                        stroke="#4f46e5" 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill="url(#dossierScoreGrad)" 
                        dot={{ r: 4, fill: '#4f46e5', stroke: '#ffffff', strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: '#4f46e5', stroke: '#ffffff', strokeWidth: 3 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="benchmark" 
                        name="Industry Benchmark" 
                        stroke="#94a3b8" 
                        strokeWidth={2} 
                        strokeDasharray="4 4" 
                        dot={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-200/80">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                    <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Baseline Score</p>
                    <p className="text-sm font-black text-slate-800">{dossierTrendMetrics.startScore}%</p>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                    <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Average Index</p>
                    <p className="text-sm font-black text-indigo-600">{dossierTrendMetrics.avgScore}%</p>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                    <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Historical Peak</p>
                    <p className="text-sm font-black text-emerald-600">{dossierTrendMetrics.peakScore}%</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(report.categories || []).map((cat, i) => (
                  <div key={`${cat.name}-${i}`} className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm space-y-4">
                    <div className="flex justify-between items-start">
                      <h4 className="text-lg font-black text-slate-900">{cat.name}</h4>
                      <div className="text-right">
                        <p className="text-2xl font-black text-slate-900">{cat.score}%</p>
                        <p className={`text-[8px] font-black uppercase tracking-widest ${cat.status === 'good' ? 'text-emerald-500' : 'text-indigo-500'}`}>{cat.status}</p>
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full ocula-gradient-bg" style={{ width: `${cat.score}%` }}></div>
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 leading-relaxed italic">"{cat.description}"</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Page 4: Keyword Intelligence */}
            <div className="min-h-[297mm] p-20 space-y-12 border-t border-slate-100 bg-white">
              {/* Running Header */}
              <div className="flex items-center justify-between pb-6 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  {(exportLogoUrl || user?.businessDetails?.logo || report.profileBadge?.logoUrl) ? (
                    <img 
                      src={exportLogoUrl || user?.businessDetails?.logo || report.profileBadge?.logoUrl} 
                      className="w-10 h-10 object-contain rounded-lg border border-slate-200 shrink-0" 
                      alt="Brand Logo" 
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <OculaLogo className="w-8 h-8 text-slate-900 shrink-0" />
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-900 uppercase tracking-tight">
                      {user?.businessDetails?.name || report.businessName}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Keyword Intelligence</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: user?.businessDetails?.brandColor || '#6366f1' }} />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Section 04</span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-indigo-600">04. Keyword Intelligence</h3>
                <div className="h-px w-full bg-slate-100"></div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-4 hover-lift transition-all">
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest text-center">Competitive Landscape Analysis</h4>
                <div className="h-[300px] w-full">
                <div className="min-w-[600px] space-y-4">
                  <div className="grid grid-cols-4 gap-4 px-4 py-4 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">
                    <span>Keyword Term</span>
                    <span className="text-center">Impact</span>
                    <span className="text-center">Difficulty</span>
                    <span className="text-right">Volume</span>
                  </div>
                  {(report.keywordAnalysis?.suggestedKeywords || []).map((kw, i) => (
                    <div key={`${kw.term}-${i}`} className="grid grid-cols-4 gap-4 px-4 py-4 bg-white border border-slate-100 rounded-xl items-center">
                      <span className="text-sm font-black text-slate-900">{kw.term}</span>
                      <div className="text-center">
                        <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${kw.impact === 'high' ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'}`}>{kw.impact}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500" style={{ width: `${kw.difficulty}%` }}></div>
                        </div>
                        <span className="text-[10px] font-black text-slate-600">{kw.difficulty}</span>
                      </div>
                      <span className="text-right text-xs font-black text-slate-900">{kw.searchVolume.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Page 5: Strategic Roadmap */}
            <div className="min-h-[297mm] p-20 space-y-12 border-t border-slate-100 bg-white">
              {/* Running Header */}
              <div className="flex items-center justify-between pb-6 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  {(exportLogoUrl || user?.businessDetails?.logo || report.profileBadge?.logoUrl) ? (
                    <img 
                      src={exportLogoUrl || user?.businessDetails?.logo || report.profileBadge?.logoUrl} 
                      className="w-10 h-10 object-contain rounded-lg border border-slate-200 shrink-0" 
                      alt="Brand Logo" 
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <OculaLogo className="w-8 h-8 text-slate-900 shrink-0" />
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-900 uppercase tracking-tight">
                      {user?.businessDetails?.name || report.businessName}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Strategic Action Roadmap</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: user?.businessDetails?.brandColor || '#6366f1' }} />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Section 05</span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-indigo-600">05. Strategic Roadmap</h3>
                <div className="h-px w-full bg-slate-100"></div>
              </div>

              <div className="space-y-4">
                {(report.recommendations || []).map((rec, i) => (
                  <div key={`${rec.task}-${i}`} className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl flex gap-4 items-start hover-lift transition-all">
                    <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center text-white shrink-0 ${rec.priority === 'high' ? 'bg-rose-500' : rec.priority === 'medium' ? 'bg-orange-500' : 'bg-indigo-500'}`}>
                      {rec.priority === 'high' && <div className="w-2 h-2 bg-white rounded-full animate-pulse mb-1"></div>}
                      <span className="text-xs font-black uppercase tracking-widest">{rec.priority}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] font-black text-indigo-600 uppercase tracking-[0.2em]">{rec.category}</span>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Impact: {rec.impact}</span>
                      </div>
                      <h4 className="text-xl font-black text-slate-900">{rec.task}</h4>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-20 text-center space-y-4">
                {(exportLogoUrl || user?.businessDetails?.logo || report.profileBadge?.logoUrl) ? (
                  <img 
                    src={exportLogoUrl || user?.businessDetails?.logo || report.profileBadge?.logoUrl} 
                    className="w-12 h-12 object-contain rounded-xl mx-auto border border-slate-200 shadow-sm" 
                    alt="Brand Logo" 
                    crossOrigin="anonymous"
                  />
                ) : (
                  <OculaLogo className="w-10 h-10 text-slate-200 mx-auto" />
                )}
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.5em]">
                  End of Strategic Dossier • {user?.businessDetails?.name || report.businessName}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
