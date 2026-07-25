
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { SavedScan, User, VisibilityReport, KPI, SubscriptionTier } from '../types';
import { storageService } from '../services/storageService';
import { TIER_CONFIGS, SUPPORTED_CURRENCIES } from '../src/constants/pricing';
import NotificationCenter from './NotificationCenter';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { Info, Bell, Target, Sun, Moon, GripVertical, Eye, EyeOff, Settings, LayoutDashboard, RefreshCw, X, Loader2, FileText, Share2, Calendar, AlertCircle, Search, MapPin, Swords, TrendingUp, TrendingDown, Minus, Shield } from 'lucide-react';
import RealTimeDashboard from './RealTimeDashboard';
import KPIDashboard from './KPIDashboard';
import KeyInsightsDashboard from './KeyInsightsDashboard';
import MarketDominanceHub from './MarketDominanceHub';
import ScanHistory from './ScanHistory';
import CompetitorTracking from './CompetitorTracking';
import SearchVisibilityWidget from './SearchVisibilityWidget';
import CompetitorAnalysisWidget from './CompetitorAnalysisWidget';
import PricingTiers from './PricingTiers';
import PaymentModal from './PaymentModal';
import CompetitorWatchlistWidget from './CompetitorWatchlistWidget';
import { generateSWOTAnalysis } from '../services/aiService';

const InfoTooltip = ({ content }: { content: string }) => (
  <span className="group relative inline-flex items-center ml-1.5 align-middle">
    <Info className="w-3 h-3 text-slate-400 hover:text-indigo-500 cursor-help transition-colors" />
    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-slate-900 text-white text-[10px] leading-relaxed rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl border border-slate-700 font-medium whitespace-normal">
      {content}
      <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></span>
    </span>
  </span>
);

interface UserDashboardProps {
  user: User;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onLogout: () => void;
  onSelectScan: (report: VisibilityReport, tab?: 'overview' | 'intelligence' | 'missions', id?: string) => void;
  onNewScan: () => void;
  onRescan: (report: VisibilityReport, scanId: string) => void;
  onGoToMissions: () => void;
  onNavigate?: (view: 'dashboard' | 'history' | 'missions' | 'pricing' | 'compare' | 'help' | 'settings' | 'users' | 'legal' | 'home') => void;
  onUpdateUser: (user: User) => void;
}

const CustomRadarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 dark:bg-slate-800 p-4 rounded-xl shadow-xl border border-slate-700 min-w-[200px]">
        <p className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-3 border-b border-slate-700 pb-2">{label}</p>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => {
            let trendStr = null;
            let trendColor = '';
            if (index === 0 && payload.length > 1) {
              const diff = entry.value - payload[1].value;
              if (diff > 0) {
                trendStr = `+${diff}`;
                trendColor = 'text-emerald-400';
              } else if (diff < 0) {
                trendStr = `${diff}`;
                trendColor = 'text-rose-400';
              } else {
                trendStr = '0';
                trendColor = 'text-slate-400';
              }
            }

            return (
              <div key={index} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                  <span className={`text-[10px] font-bold ${index === 0 ? 'text-white' : 'text-slate-400'}`}>
                    {entry.name} {index === 0 && '(Current)'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-black ${index === 0 ? 'text-white' : 'text-slate-300'}`}>{entry.value}</span>
                  {index === 0 && trendStr && (
                    <span className={`text-[9px] font-bold ${trendColor}`}>{trendStr}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

import { Responsive, WidthProvider } from 'react-grid-layout/legacy';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const DEFAULT_WIDGET_CONFIGS = [
  { id: 'marketHub', name: 'Market Dominance', x: 0, y: 0, w: 6, h: 4, minW: 3, minH: 3 },
  { id: 'insights', name: 'Intelligence Insights', x: 6, y: 0, w: 6, h: 4, minW: 3, minH: 3 },
  { id: 'trajectory', name: 'Market Trajectory', x: 0, y: 4, w: 8, h: 4, minW: 3, minH: 3 },
  { id: 'searchVisibility', name: 'Search Visibility', x: 8, y: 4, w: 4, h: 4, minW: 2, minH: 2 },
  { id: 'competitorAnalysis', name: 'Competitor Analysis', x: 0, y: 8, w: 6, h: 5, minW: 3, minH: 3 },
  { id: 'stats', name: 'Performance Stats', x: 6, y: 8, w: 6, h: 3, minW: 3, minH: 2 },
  { id: 'kpis', name: 'KPI Intelligence', x: 0, y: 13, w: 12, h: 5, minW: 4, minH: 3 },
  { id: 'competitors', name: 'Competitor Tracking', x: 0, y: 18, w: 12, h: 5, minW: 4, minH: 3 },
  { id: 'competitorWatchlist', name: 'Rival Watchlist', x: 0, y: 23, w: 12, h: 5, minW: 4, minH: 3 },
];

const DEFAULT_WIDGET_VISIBILITY = {
  marketHub: true,
  insights: true,
  trajectory: true,
  searchVisibility: true,
  competitorAnalysis: true,
  stats: true,
  kpis: true,
  competitors: false,
  competitorWatchlist: true,
};

const UserDashboard: React.FC<UserDashboardProps> = ({ user, isDarkMode, onToggleDarkMode, onLogout, onSelectScan, onNewScan, onRescan, onGoToMissions, onUpdateUser, onNavigate }) => {
  const [scans, setScans] = useState<SavedScan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'monitor'>('list');
  const [isManagingSubscription, setIsManagingSubscription] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingTier, setPendingTier] = useState<SubscriptionTier | null>(null);

  const [viewingBusiness, setViewingBusiness] = useState<string | null>(null);

  const [isCustomizing, setIsCustomizing] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanToDelete, setScanToDelete] = useState<{ id: string; name: string } | null>(null);
  const [selectedScanIds, setSelectedScanIds] = useState<Set<string>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);
  
  const [layouts, setLayouts] = useState<any>({
    lg: DEFAULT_WIDGET_CONFIGS.map(w => ({ i: w.id, ...w })),
  });
  
  const [visibleWidgets, setVisibleWidgets] = useState<Record<string, boolean>>(DEFAULT_WIDGET_VISIBILITY);

  useEffect(() => {
    const loadLayout = async () => {
      const saved = await storageService.getLayout() as any;
      if (!saved) return;
      
      if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
        if (saved.layouts) {
          setLayouts(saved.layouts);
        }
        if (saved.visibleWidgets) {
          setVisibleWidgets(saved.visibleWidgets);
        }
      } else if (Array.isArray(saved)) {
        // Migration from old array-based layout
        const visibility: Record<string, boolean> = { ...DEFAULT_WIDGET_VISIBILITY };
        saved.forEach((w: any) => {
          if (w.id) visibility[w.id] = w.visible !== false;
        });
        setVisibleWidgets(visibility);
      }
    };
    loadLayout();
  }, []);

  const resetLayout = () => {
    setLayouts({ lg: DEFAULT_WIDGET_CONFIGS.map(w => ({ i: w.id, ...w })) });
    setVisibleWidgets(DEFAULT_WIDGET_VISIBILITY);
  };

  const handleLayoutChange = (currentLayout: any, allLayouts: any) => {
    setLayouts(allLayouts);
    storageService.setLayout({ layouts: allLayouts, visibleWidgets });
  };

  const handleScanAction = (action: 'new' | 'rescan', report?: VisibilityReport, scanId?: string) => {
    const tierConfig = TIER_CONFIGS[user.account.tier];
    const currentScanCount = user.account.tier === 'free' ? (user.account.totalScans || 0) : scans.length;
    
    if (currentScanCount >= tierConfig.limits.scans) {
      setScanError(`Scan Limit Reached. The ${tierConfig.name} tier is limited to ${tierConfig.limits.scans} scan(s). Please upgrade to continue.`);
      setTimeout(() => {
        setScanError(null);
        setIsManagingSubscription(true);
      }, 3000);
      return;
    }

    if ((user.account.unitsRemaining || 0) < 2.0) {
      setScanError("Insufficient Intelligence Units. Please top up or upgrade your plan to perform more scans.");
      setTimeout(() => {
        setScanError(null);
        setIsManagingSubscription(true);
      }, 3000);
      return;
    }

    if (action === 'new') {
      onNewScan();
    } else if (action === 'rescan' && report && scanId) {
      onRescan(report, scanId);
    }
  };

  const toggleWidgetVisibility = (id: string) => {
    const next = { ...visibleWidgets, [id]: !visibleWidgets[id] };
    setVisibleWidgets(next);
    storageService.setLayout({ layouts, visibleWidgets: next });
  };

  const [displayUser, setDisplayUser] = useState(user);
  const [businessSwots, setBusinessSwots] = useState<Record<string, any>>({});
  const [isGeneratingSwot, setIsGeneratingSwot] = useState(false);
  const [selectedScanId, setSelectedScanId] = useState<string | null>(null);

  const businessScans = useMemo(() => {
    if (!viewingBusiness) return [];
    return scans.filter(s => s.businessName === viewingBusiness);
  }, [scans, viewingBusiness]);

  const activeScan = useMemo(() => {
    if (!businessScans || businessScans.length === 0) return null;
    if (selectedScanId) {
      const found = businessScans.find(s => s.id === selectedScanId);
      if (found) return found;
    }
    return businessScans[0];
  }, [businessScans, selectedScanId]);

  useEffect(() => {
    if (viewingBusiness && businessScans.length > 0) {
      const report = businessScans[0].report;
      if (!report.swotAnalysis && !businessSwots[viewingBusiness] && !isGeneratingSwot) {
        const fetchSwot = async () => {
          setIsGeneratingSwot(true);
          try {
            const swot = await generateSWOTAnalysis(viewingBusiness, report.summary || "General business visibility analysis");
            setBusinessSwots(prev => ({ ...prev, [viewingBusiness]: swot }));
          } catch (e) {
            console.error("Failed to generate SWOT", e);
            setBusinessSwots(prev => ({
              ...prev,
              [viewingBusiness]: {
                strengths: ["Strong digital foundations", "Growth opportunities defined", "Visibility scanning enabled"],
                weaknesses: ["Competitive local space", "Authority index optimization required", "Conversion signal volume"],
                opportunities: ["Local market capture", "Structured KPI measurement", "SEO authority alignment"],
                threats: ["Dynamic position volatility", "Aggressive competitor campaigns", "Algorithm param shifts"]
              }
            }));
          } finally {
            setIsGeneratingSwot(false);
          }
        };
        fetchSwot();
      }
    }
  }, [viewingBusiness, businessScans, businessSwots, isGeneratingSwot]);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [editForm, setEditForm] = useState({
    industry: user.businessDetails?.industry || 'other',
    companySize: user.businessDetails?.companySize || '1-10',
    businessGoals: user.businessDetails?.businessGoals || ''
  });

  useEffect(() => {
    setDisplayUser(user);
    setEditForm({
        industry: user.businessDetails?.industry || 'other',
        companySize: user.businessDetails?.companySize || '1-10',
        businessGoals: user.businessDetails?.businessGoals || ''
    });
  }, [user]);

  const handleSaveProfile = async () => {
    const updatedUser = {
      ...displayUser,
      businessDetails: {
        ...displayUser.businessDetails,
        industry: editForm.industry,
        companySize: editForm.companySize,
        businessGoals: editForm.businessGoals
      }
    };
    setDisplayUser(updatedUser);
    await storageService.setUser(updatedUser);
    setIsEditingProfile(false);
  };

  const processTierUpdate = async (newTier: SubscriptionTier) => {
    const newConfig = TIER_CONFIGS[newTier];
    const updatedUser: User = {
      ...displayUser,
      account: {
        ...displayUser.account,
        tier: newTier,
        unitsTotal: newConfig.units,
        unitsRemaining: newConfig.units, // Resetting for simplicity and immediate benefit
        unitsUsed: 0,
        renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // Reset renewal date
      }
    };
    
    setDisplayUser(updatedUser);
    onUpdateUser(updatedUser);
    await storageService.setUser(updatedUser);
    setIsManagingSubscription(false);
    setShowPaymentModal(false);
    setPendingTier(null);
  };

  const handleTierChange = (newTier: SubscriptionTier) => {
    const currentTier = displayUser.account.tier;
    const tierOrder: Record<SubscriptionTier, number> = { free: 0, growth: 1, premium: 2 };

    // If upgrading to a paid tier
    if (tierOrder[newTier] > tierOrder[currentTier] && newTier !== 'free') {
      setPendingTier(newTier);
      setShowPaymentModal(true);
    } else {
      // Downgrade or switch to free - immediate
      processTierUpdate(newTier);
    }
  };

  useEffect(() => {
    // Simulate initial data fetch for perceived performance
    const timer = setTimeout(async () => {
      const loadedScans = await storageService.getScans();
      setScans(loadedScans);
      setIsLoading(false);
      
      // Default to the most recent business if not set
      if (loadedScans.length > 0 && !viewingBusiness) {
        setViewingBusiness(loadedScans[0].businessName);
      }

      // Load notifications count
      const notifs = await storageService.getNotifications();
      setUnreadNotifications(notifs.filter(n => !n.read).length);

      // Add a demo notification if none exist
      if (notifs.length === 0) {
        await storageService.addNotification({
          title: 'Strategic Anomaly Detected',
          message: 'Competitor "Nexus" has increased their search visibility by 14% in the last 24 hours.',
          type: 'anomaly'
        });
        await storageService.addNotification({
          title: 'System Initialized',
          message: 'Ocula Intelligence Engine is now monitoring your market position.',
          type: 'info'
        });
        setUnreadNotifications(2);
      }
    }, 1200);

    // Live Notification Simulator
    const liveNotifTimer = setInterval(async () => {
      if (Math.random() > 0.6) { // 40% chance every minute to get a signal
        const signals = [
          { title: 'Market Vector Shift', message: 'Regional search volume for your primary sector has surged by 8% in the last hour.', type: 'info' as const },
          { title: 'Competitor Aggression', message: 'A market rival has initiated a high-velocity campaign targeting your key demographics.', type: 'warning' as const },
          { title: 'Visibility Milestone', message: 'Your business has achieved a top-3 resonance score in the local authority index.', type: 'success' as const },
          { title: 'Algorithm Flux Detected', message: 'Search engine parameters are shifting. We are recalibrating your visibility model.', type: 'anomaly' as const }
        ];
        const signal = signals[Math.floor(Math.random() * signals.length)];
        await storageService.addNotification(signal);
        
        // Refresh unread count
        const notifs = await storageService.getNotifications();
        setUnreadNotifications(notifs.filter(n => !n.read).length);
      }
    }, 60000);

    return () => {
      clearTimeout(timer);
      clearInterval(liveNotifTimer);
    };
  }, []);

  // Update viewing business if scans change and we don't have one selected (e.g. after delete)
  useEffect(() => {
    if (scans.length > 0 && !viewingBusiness) {
      setViewingBusiness(scans[0].businessName);
    } else if (scans.length === 0) {
      setViewingBusiness(null);
    }
  }, [scans]);

  const uniqueBusinesses = useMemo(() => {
    return Array.from(new Set(scans.map(s => s.businessName)));
  }, [scans]);

  const handleDelete = (id: string, businessName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setScanToDelete({ id, name: businessName });
  };

  const confirmDelete = async () => {
    if (!scanToDelete) return;
    const updated = await storageService.deleteScan(scanToDelete.id);
    setScans(updated);
    
    // If we deleted the last scan of the viewing business, switch to another
    const remainingForBusiness = updated.filter(s => s.businessName === scanToDelete.name);
    if (remainingForBusiness.length === 0 && viewingBusiness === scanToDelete.name) {
       const nextBusiness = updated.length > 0 ? updated[0].businessName : null;
       setViewingBusiness(nextBusiness);
    }

    setSelectedScanIds(prev => {
      const next = new Set(prev);
      next.delete(scanToDelete.id);
      return next;
    });
    setScanToDelete(null);
  };

  const handleBulkDelete = () => {
    setIsBulkDeleting(true);
  };

  const confirmBulkDelete = async () => {
    const updated = await storageService.deleteScans(Array.from(selectedScanIds));
    setScans(updated);
    setSelectedScanIds(new Set());
    setIsBulkDeleting(false);
    
    // Re-evaluate viewing business
    if (viewingBusiness && !updated.some(s => s.businessName === viewingBusiness)) {
        setViewingBusiness(updated.length > 0 ? updated[0].businessName : null);
    }
  };

  const handleClearAll = () => {
    setIsClearingAll(true);
  };

  const confirmClearAll = async () => {
    await storageService.clearAllScans();
    setScans([]);
    setSelectedScanIds(new Set());
    setIsClearingAll(false);
    setViewingBusiness(null);
  };

  const toggleScanSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelected = new Set(selectedScanIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      if (newSelected.size < 4) {
        newSelected.add(id);
      } else {
        alert("Maximum 4 scans can be compared at once.");
      }
    }
    setSelectedScanIds(newSelected);
  };

  const telemetryData = useMemo(() => {
    // Use businessScans instead of all scans for the chart
    return [...businessScans].reverse().map(s => ({
      date: new Date(s.timestamp || 0).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: s.score || 0,
      business: s.businessName || 'Unknown'
    }));
  }, [businessScans]);

  const allCampaignsCount = useMemo(() => {
    return businessScans.reduce((acc, scan) => acc + (scan.report.campaigns?.length || 0), 0);
  }, [businessScans]);

  const maxScore = useMemo(() => {
    if (businessScans.length === 0) return -1;
    return Math.max(...businessScans.map(s => s.score));
  }, [businessScans]);

  const avgScore = useMemo(() => {
    if (businessScans.length === 0) return 0;
    const sum = businessScans.reduce((acc, s) => acc + (Number(s.score) || 0), 0);
    const avg = sum / businessScans.length;
    return isNaN(avg) ? 0 : Math.round(avg);
  }, [businessScans]);

  const growthMetrics = useMemo(() => {
    // Calculate a dynamic growth potential based on average score
    // If avgScore is low, potential is high. If avgScore is high, potential is optimization.
    const potentialScore = Math.max(0, 100 - avgScore);
    
    let potentialLabel = "Moderate";
    if (potentialScore > 70) potentialLabel = "High";
    else if (potentialScore < 30) potentialLabel = "Optimization";

    return {
      label: "Growth Potential",
      icon: "🚀",
      kpis: [
        { name: "Untapped Potential", value: `${potentialScore}%`, trend: potentialLabel, color: "text-indigo-500" },
        { name: "Market Resonance", value: `${avgScore}%`, trend: "Current", color: "text-indigo-500" },
        { name: "Expansion Velocity", value: "High", trend: "Projected", color: "text-emerald-500" }
      ],
      insight: `Based on your current visibility score of ${avgScore}%, there is a ${potentialScore}% untapped market potential available for capture through strategic optimization.`
    };
  }, [avgScore]);

  const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={`animate-pulse bg-slate-100 dark:bg-slate-800 rounded-xl ${className}`} {...props} />
  );

  const renderWidget = (id: string) => {
    if (!viewingBusiness || businessScans.length === 0) return null;
    const report = activeScan?.report || businessScans[0].report;

    switch (id) {
      case 'marketHub':
        return <MarketDominanceHub scans={businessScans} isDarkMode={isDarkMode} />;
      case 'insights':
        return viewMode === 'monitor' ? (
          <RealTimeDashboard report={report} isDarkMode={isDarkMode} />
        ) : (
          <KeyInsightsDashboard 
            report={report} 
            kpis={displayUser.businessDetails?.kpis || []} 
            isDarkMode={isDarkMode} 
            swotFallback={viewingBusiness ? businessSwots[viewingBusiness] : undefined}
          />
        );
      case 'trajectory':
        return (
          <div className="surface p-6 flex flex-col min-h-[400px]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-display font-medium text-slate-900 dark:text-white tracking-tight">Market Trajectory</h3>
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-1">Visibility Resonance Over Time</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/20"></div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Score</span>
                </div>
              </div>
            </div>
            <div className="flex-grow">
              {businessScans.length > 1 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={telemetryData}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#1e293b" : "#f1f5f9"} />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: isDarkMode ? '#64748b' : '#94a3b8', fontWeight: 500 }}
                      dy={10}
                    />
                    <YAxis 
                      hide 
                      domain={[0, 100]}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', 
                        borderColor: isDarkMode ? '#1e293b' : '#f1f5f9',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#6366f1" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorScore)" 
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-200 dark:text-slate-800 font-black uppercase text-[10px] tracking-[0.3em] text-center px-4" id="trajectory-placeholder">
                  {businessScans.length === 1 ? "Capture more data points to visualize market trajectory." : "No market data identified."}
                </div>
              )}
            </div>
          </div>
        );
      case 'searchVisibility':
        return <SearchVisibilityWidget report={report} />;
      case 'competitorAnalysis':
        return (
          <div id="competitor-analysis-widget">
            <CompetitorAnalysisWidget report={report} />
          </div>
        );
      case 'competitorWatchlist':
        return (
          <div id="competitor-watchlist-widget" className="h-full">
            <CompetitorWatchlistWidget report={report} />
          </div>
        );
      case 'stats':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Command Log Widget */}
            <div className="bg-slate-900 dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-800 flex flex-col min-h-[200px]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[10px] font-medium text-indigo-400 uppercase tracking-widest">Command Log</h3>
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              </div>
              <div className="space-y-3 flex-grow overflow-y-auto no-scrollbar">
                {report.campaigns?.slice(0, 5).map((c, i) => (
                  <div key={i} className="flex items-start gap-3 group">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0 group-hover:scale-150 transition-transform"></div>
                    <p className="text-[11px] font-medium text-slate-300 leading-relaxed">{c.name}</p>
                  </div>
                ))}
              </div>
              <button 
                onClick={onGoToMissions} 
                className="mt-4 btn-base bg-white dark:bg-indigo-600 text-slate-900 dark:text-white btn-sm shadow-xl font-mono text-[10px] tracking-widest"
              >
                UNIFIED COMMAND →
              </button>
            </div>

            {/* Intelligence Performance Widget */}
            <div className="surface p-6 flex flex-col justify-between col-span-1 md:col-span-2 min-h-[200px] border-l-4 border-indigo-500">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Intelligence Efficiency</h4>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{avgScore}%</span>
                    <span className="text-xs font-bold text-emerald-500 uppercase">Optimal</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-right">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Stability</p>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">99.4%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Signals</p>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{unreadNotifications} Live</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex items-center gap-4">
                <div className="flex-grow h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                  <div className="h-full bg-indigo-500" style={{ width: `${avgScore}%` }}></div>
                  <div className="h-full bg-indigo-300 dark:bg-indigo-700 opacity-30" style={{ width: `${100 - avgScore}%` }}></div>
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Index</span>
              </div>
            </div>
          </div>
        );
      case 'kpis':
        return TIER_CONFIGS[displayUser.account.tier].capabilities.canViewKPIs ? (
          <KPIDashboard 
            kpis={displayUser.businessDetails?.kpis || []} 
            businessName={viewingBusiness || displayUser.businessDetails?.name || displayUser.name}
            industry={displayUser.businessDetails?.industry}
            reportSummary={businessScans[0]?.report?.summary || businessScans[0]?.report?.visibilityIndex?.summary}
            suggestedFromReport={businessScans[0]?.report?.suggestedKPIs}
            onUpdate={(newKpis) => {
              const updatedUser = {
                ...displayUser,
                businessDetails: {
                  ...(displayUser.businessDetails || { name: '', industry: '' }),
                  kpis: newKpis
                }
              };
              setDisplayUser(updatedUser);
              onUpdateUser(updatedUser);
            }}
            isDarkMode={isDarkMode}
          />
        ) : (
          <div className="surface p-12 relative overflow-hidden group text-center border-2 border-dashed border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10">
              <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-sm border border-indigo-100 dark:border-indigo-800/50">
                      <Shield className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-4 uppercase">KPI Intelligence Locked</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-bold mb-8 leading-relaxed">
                      Advanced Performance Intelligence requires a higher clearance level. Upgrade to Growth or Dominance to unlock custom KPI tracking and strategic forecasting.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button 
                        onClick={() => setIsManagingSubscription(true)}
                        className="btn-primary btn-lg bg-indigo-600 shadow-xl shadow-indigo-600/20 w-full sm:w-auto"
                    >
                        View Upgrade Options
                    </button>
                    <button 
                        onClick={() => setViewMode('monitor')}
                        className="btn-secondary btn-lg w-full sm:w-auto bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    >
                        Back to Monitor
                    </button>
                  </div>
              </div>
          </div>
        );
      case 'competitors':
        return <CompetitorTracking report={report} isDarkMode={isDarkMode} />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-4 py-5 space-y-4">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 surface p-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <Skeleton className="w-28 h-28 rounded-xl" />
            <div className="space-y-3">
              <Skeleton className="w-48 h-10" />
              <Skeleton className="w-32 h-4" />
            </div>
          </div>
          <div className="flex gap-4">
            <Skeleton className="w-32 h-14 rounded-[1.5rem]" />
            <Skeleton className="w-32 h-14 rounded-[1.5rem]" />
          </div>
        </div>

        {/* Bento Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="md:col-span-2 lg:col-span-3 h-[300px] rounded-xl" />
          <div className="grid grid-cols-1 gap-4">
            <Skeleton className="h-[190px] rounded-xl" />
            <Skeleton className="h-[190px] rounded-xl" />
          </div>
        </div>

        {/* Industry Dashboard Skeleton */}
        <Skeleton className="h-[280px] rounded-xl" />

        {/* History List Skeleton */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="w-64 h-10" />
            <Skeleton className="w-48 h-10" />
          </div>
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-4 py-5 animate-fadeIn space-y-4">
      {/* Delete Confirmation Modals Removed */}
      
      <AnimatePresence>
        {scanError && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[1100] w-full max-w-md px-4"
          >
            <div className="bg-rose-500 text-white p-4 rounded-xl shadow-2xl flex items-center gap-3 border border-rose-400">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <p className="text-sm font-bold leading-tight">{scanError}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <NotificationCenter 
        isOpen={showNotifications}
        onClose={async () => {
          setShowNotifications(false);
          const notifs = await storageService.getNotifications();
          setUnreadNotifications(notifs.filter(n => !n.read).length);
        }}
        isDarkMode={isDarkMode}
      />

      {/* Floating Action Bar Removed */}

      {/* Header Profile Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 flex flex-col md:flex-row justify-between items-center gap-4 surface p-4">
          <div className="flex flex-col md:flex-row items-center text-center md:text-left space-y-4 md:space-y-0 md:space-x-8 w-full md:w-auto">
            <div className="relative group shrink-0">
              <div className="w-28 h-28 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 relative transition-transform hover:scale-[1.02]">
                <img src={displayUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayUser.name)}&background=random`} className="w-full h-full object-cover" alt={displayUser.name} />
              </div>
            </div>
            <div className="space-y-4 w-full md:w-auto">
              <div className="space-y-1">
                <h2 className="text-2xl font-display md:text-2xl font-medium text-slate-900 dark:text-white tracking-tight">{displayUser.name.split(' ')[0]}</h2>
                <p className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Vision Profile Active</p>
              </div>

              {isEditingProfile ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div className="space-y-1 text-left">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                      Industry
                      <InfoTooltip content="Used to benchmark your performance against sector-specific standards and identify relevant competitors." />
                    </label>
                    <select 
                      value={editForm.industry}
                      onChange={(e) => setEditForm({...editForm, industry: e.target.value})}
                      className="w-full surface rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                    >
                      <option value="technology">Technology</option>
                      <option value="retail">Retail</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="finance">Finance</option>
                      <option value="education">Education</option>
                      <option value="manufacturing">Manufacturing</option>
                      <option value="realestate">Real Estate</option>
                      <option value="hospitality">Hospitality</option>
                      <option value="professional">Professional Services</option>
                      <option value="marketing">Marketing</option>
                      <option value="nonprofit">Non-profit</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-1 text-left">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                      Company Size
                      <InfoTooltip content="Helps calibrate your growth potential score by comparing your visibility against businesses of similar scale." />
                    </label>
                    <select 
                      value={editForm.companySize}
                      onChange={(e) => setEditForm({...editForm, companySize: e.target.value})}
                      className="w-full surface rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                    >
                      <option value="1-10">1-10 Employees</option>
                      <option value="11-50">11-50 Employees</option>
                      <option value="51-200">51-200 Employees</option>
                      <option value="201-500">201-500 Employees</option>
                      <option value="500+">500+ Employees</option>
                    </select>
                  </div>
                  <div className="space-y-1 text-left sm:col-span-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                      Business Goals
                      <InfoTooltip content="Your primary objectives and what you hope to achieve." />
                    </label>
                    <textarea 
                      value={editForm.businessGoals}
                      onChange={(e) => setEditForm({...editForm, businessGoals: e.target.value})}
                      placeholder="Describe your primary business goals..."
                      className="w-full surface rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-indigo-500 text-slate-900 dark:text-white min-h-[80px] resize-none"
                    />
                  </div>
                  <div className="col-span-1 sm:col-span-2 flex gap-2 pt-2">
                    <button onClick={handleSaveProfile} className="flex-1 btn-primary btn-sm bg-indigo-600 hover:bg-indigo-700">Save</button>
                    <button onClick={() => setIsEditingProfile(false)} className="flex-1 btn-secondary btn-sm">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4 items-center justify-center md:justify-start">
                  <div className="flex flex-wrap gap-4 items-center justify-center md:justify-start">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                      <span className="text-lg">🏢</span>
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5 flex items-center">
                          Industry
                          <InfoTooltip content="Used to benchmark your performance against sector-specific standards and identify relevant competitors." />
                        </p>
                        <p className="text-xs font-bold text-slate-900 dark:text-white leading-none capitalize">{displayUser.businessDetails?.industry || 'Not Set'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                      <span className="text-lg">👥</span>
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5 flex items-center">
                          Size
                          <InfoTooltip content="Helps calibrate your growth potential score by comparing your visibility against businesses of similar scale." />
                        </p>
                        <p className="text-xs font-bold text-slate-900 dark:text-white leading-none">{displayUser.businessDetails?.companySize || 'Not Set'}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsEditingProfile(true)}
                      className="btn-icon w-8 h-8 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                      title="Edit Profile"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button 
                      id="intelligence-feed-trigger"
                      onClick={() => setShowNotifications(true)}
                      className="btn-icon w-8 h-8 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 relative group/bell"
                      title="Intelligence Feed"
                    >
                      <Bell className={`w-4 h-4 transition-transform group-hover/bell:scale-110 ${unreadNotifications > 0 ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
                      {unreadNotifications > 0 && (
                        <>
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900 z-10" />
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping opacity-75" />
                        </>
                      )}
                    </button>
                    <button 
                      onClick={() => setIsCustomizing(!isCustomizing)}
                      className={`btn-icon w-8 h-8 border-slate-200 dark:border-slate-700 ${isCustomizing ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-100 dark:bg-slate-800'}`}
                      title="Customize Layout"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={onToggleDarkMode}
                      className="btn-icon w-8 h-8 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                      title={isDarkMode ? "Light Mode" : "Dark Mode"}
                    >
                      {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => handleScanAction('new')}
                      className="btn-primary btn-sm bg-indigo-600 hover:bg-indigo-700 ml-2"
                    >
                      Scry
                    </button>
                  </div>
                  {displayUser.businessDetails?.businessGoals && (
                    <div className="w-full max-w-2xl bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700 text-left">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center">
                        <Target className="w-3 h-3 mr-1.5" />
                        Business Goals
                      </p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {displayUser.businessDetails.businessGoals}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-[1.5rem] mr-4 shadow-inner">
              <button 
                onClick={() => setViewMode('list')}
                className={`btn-sm rounded-[1.2rem] ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-md text-slate-900 dark:text-white scale-105' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
              >
                List View
              </button>
              <button 
                onClick={() => setViewMode('monitor')}
                className={`btn-sm rounded-[1.2rem] flex items-center gap-2 ${viewMode === 'monitor' ? 'bg-white dark:bg-slate-700 shadow-md text-indigo-600 dark:text-indigo-400 scale-105' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
              >
                {viewMode === 'monitor' && <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />}
                Live Monitor
              </button>
            </div>
            <button onClick={onLogout} className="btn-secondary btn-md rounded-[1.5rem] hover:text-red-500">Sign Out</button>
          </div>
        </div>

        {/* Subscription & Units Card */}
        <div className="bg-slate-900 dark:bg-slate-800 p-4 rounded-xl shadow-sm text-white relative overflow-hidden border border-slate-800">
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[10px] font-medium text-indigo-400 uppercase tracking-widest mb-1">Subscription Tier</p>
                <h3 className="text-2xl font-display font-medium tracking-tight capitalize">{TIER_CONFIGS[user.account?.tier || 'free'].name}</h3>
              </div>
              <div className="px-3 py-1 bg-slate-800 dark:bg-slate-700 rounded-lg border border-slate-700 dark:border-slate-600">
                <span className="text-[9px] font-medium text-indigo-400 uppercase tracking-widest">Active</span>
              </div>
            </div>

            <div className="space-y-4 mb-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-1">Available Units</p>
                  <div className="flex items-baseline gap-2">
                    <span className="stat-value text-slate-900 dark:text-white">{user.account?.unitsRemaining || 0}</span>
                    <span className="text-xs font-medium text-slate-500">Units / {user.account?.unitsTotal || 0} Total</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-1">Renewal</p>
                  <p className="text-xs font-medium">{new Date(user.account?.renewalDate || '').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                </div>
              </div>
              <div className="h-2.5 bg-slate-800 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 rounded-full transition-all duration-1000" 
                  style={{ width: `${((user.account?.unitsRemaining || 0) / (user.account?.unitsTotal || 1)) * 100}%` }}
                ></div>
              </div>
            </div>

            <button 
              onClick={() => setIsManagingSubscription(true)}
              className="w-full btn-base bg-white text-slate-900 btn-md shadow-sm"
            >
              Manage Subscription →
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Widgets with Customization */}
      {viewingBusiness && businessScans.length > 0 && (
        <div className="space-y-6">
          <AnimatePresence>
            {isCustomizing && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800 flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-800 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Settings className="w-5 h-5 animate-spin-slow" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">Layout Customization</h4>
                      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Drag widgets to reorder or toggle visibility</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {DEFAULT_WIDGET_CONFIGS.map(w => (
                      <button
                        key={w.id}
                        onClick={() => toggleWidgetVisibility(w.id)}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border flex items-center gap-2 ${
                          visibleWidgets[w.id] 
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20' 
                            : 'surface text-slate-400 border-slate-200 dark:border-slate-700 opacity-60'
                        }`}
                      >
                        {visibleWidgets[w.id] ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {w.name}
                      </button>
                    ))}
                    <button 
                      onClick={resetLayout}
                      className="px-4 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                    >
                      Reset
                    </button>
                    <button 
                      onClick={() => setIsCustomizing(false)}
                      className="px-4 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-transform"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
            {DEFAULT_WIDGET_CONFIGS.filter(w => visibleWidgets[w.id] || isCustomizing).map((config) => {
              const id = config.id;
              return (
                <div key={id} className={`group ${!visibleWidgets[id] ? 'opacity-40 grayscale' : ''}`}>
                  <div className={`h-full w-full relative ${isCustomizing ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-950 rounded-xl' : ''}`}>
                    {isCustomizing && (
                      <div className="absolute top-2 right-2 z-[60] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="drag-handle p-1.5 bg-white dark:bg-slate-800 rounded-md shadow-md border border-slate-200 dark:border-slate-700 cursor-move">
                          <GripVertical className="w-3 h-3 text-slate-400" />
                        </div>
                        <button 
                          onClick={() => toggleWidgetVisibility(id)}
                          className={`p-1.5 rounded-md shadow-md transition-colors ${visibleWidgets[id] ? 'bg-rose-500 text-white hover:bg-rose-600' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
                        >
                          {visibleWidgets[id] ? <X className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                      </div>
                    )}
                    <div className="h-full w-full overflow-hidden">
                      {renderWidget(id)}
                    </div>
                  </div>
                </div>
              );
            })}
          </ResponsiveGridLayout>
        </div>
      )}

      {/* Business Selector */}
      {uniqueBusinesses.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-4 overflow-x-auto pb-1 scrollbar-hide">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap shrink-0">Active Entity:</span>
            {uniqueBusinesses.map((b) => (
              <button
                key={b}
                onClick={() => {
                  setViewingBusiness(b);
                  setSelectedScanId(null);
                }}
                className={`btn-sm rounded-xl whitespace-nowrap border ${
                  viewingBusiness === b
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg scale-105'
                    : 'surface text-slate-500 border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {b}
              </button>
            ))}
          </div>

          {/* Scan Dossiers for Active Entity */}
          {viewingBusiness && businessScans.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap mr-1">
                Scan Types for {viewingBusiness} ({businessScans.length}):
              </span>
              {businessScans.map((scan) => {
                const mode = scan.report?.focusMode || 'standard';
                const label = mode === 'competitor' ? '⚔️ Rival Analysis' :
                              mode === 'market' ? '📡 Market Radar' :
                              mode === 'social' ? '💬 Social Pulse' :
                              mode === 'gmb' ? '📍 GMB Focus' :
                              '⚡ Standard Scry';
                const isSelected = activeScan?.id === scan.id;
                const formattedDate = new Date(scan.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                return (
                  <button
                    key={scan.id}
                    onClick={() => setSelectedScanId(scan.id)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border flex items-center gap-2 ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105'
                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:border-blue-400'
                    }`}
                  >
                    <span>{label}</span>
                    <span className="opacity-70 font-mono text-[9px]">({formattedDate})</span>
                    <span className="px-1.5 py-0.5 bg-black/10 dark:bg-white/10 rounded-md font-mono text-[9px]">
                      {scan.score} PTS
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Scan History */}
      <ScanHistory 
        user={user} 
        isDarkMode={isDarkMode} 
        onSelectScan={onSelectScan} 
        onRescan={onRescan} 
        onNewScan={onNewScan} 
      />
      {/* Subscription Management Modal */}
      <AnimatePresence>
        {isManagingSubscription && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="surface w-full max-w-5xl p-4 relative my-8"
            >
              <button 
                onClick={() => setIsManagingSubscription(false)}
                className="btn-icon absolute top-4 right-6 w-10 h-10 bg-slate-100 dark:bg-slate-800"
              >
                ✕
              </button>
              
              <div className="text-center mb-4">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Manage Subscription</h3>
                <p className="text-slate-500 dark:text-slate-400 font-bold">Upgrade or downgrade your plan instantly. Changes apply immediately.</p>
              </div>

              <PricingTiers 
                currentTier={displayUser.account.tier}
                onSelectTier={handleTierChange}
                showTitle={false}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Modal for Upgrades */}
      {showPaymentModal && pendingTier && (
        <PaymentModal 
          tier={pendingTier} 
          currency={SUPPORTED_CURRENCIES[0]} // Default to USD for dashboard upgrades
          onClose={() => setShowPaymentModal(false)} 
          onSuccess={() => processTierUpdate(pendingTier)} 
        />
      )}
    </div>
  );
};

export default UserDashboard;
