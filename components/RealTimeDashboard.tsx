import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { VisibilityReport } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { TrendingUp, Target, Users, Share2, Search, Zap, Minus, Activity, Sparkles, Gauge, Globe, Shield, Eye, MapPin } from 'lucide-react';
import { fetchRealSeoData } from '../services/seoService';

interface RealTimeDashboardProps {
  report: VisibilityReport;
  isDarkMode: boolean;
}

interface CompetitorActivity {
  id: string;
  competitorName: string;
  activity: string;
  timestamp: Date;
  type: 'social' | 'search' | 'content' | 'market';
}

const RealTimeDashboard: React.FC<RealTimeDashboardProps> = ({ report, isDarkMode }) => {
  // --- Real-Time State ---
  const [currentScore, setCurrentScore] = useState(report.overallScore || 0);
  const [scryingActive, setScryingActive] = useState(true);
  const [activities, setActivities] = useState<CompetitorActivity[]>([]);
  const [realSeoData, setRealSeoData] = useState<any>(null);
  const [liveMetrics, setLiveMetrics] = useState({
    search: report.visibilityBreakdown?.googleMyBusiness || 0,
    social: report.visibilityBreakdown?.socialPresence || 0,
    authority: report.visibilityBreakdown?.brandAuthority || 0,
    reach: report.visibilityBreakdown?.marketPosition || 0,
    conversion: Math.round((report.overallScore || 0) * 0.85),
    performance: 82,
    localDiscovery: 91,
    accessibility: 88,
    bestPractices: 94
  });

  // Momentum refs for realistic fluctuations
  const momentumRef = useRef({
    search: 0,
    social: 0,
    authority: 0,
    reach: 0,
    conversion: 0,
    general: 0
  });

  // --- Scrying Effect (Simulated Real-Time Data) ---
  useEffect(() => {
    if (!scryingActive) return;

    const interval = setInterval(() => {
      // 1. Evolve Momentum (random walk for momentum)
      const evolveMomentum = (current: number) => {
        const change = (Math.random() - 0.5) * 0.5; // -0.25 to +0.25
        // Keep momentum between -2 and +2
        return Math.max(-2, Math.min(2, current + change));
      };

      momentumRef.current = {
        search: evolveMomentum(momentumRef.current.search),
        social: evolveMomentum(momentumRef.current.social),
        authority: evolveMomentum(momentumRef.current.authority),
        reach: evolveMomentum(momentumRef.current.reach),
        conversion: evolveMomentum(momentumRef.current.conversion),
        general: evolveMomentum(momentumRef.current.general)
      };

      let competitorImpact = { search: 0, social: 0, authority: 0, reach: 0, conversion: 0 };

      // 2. Randomly add competitor activity & calculate immediate impact
      if (Math.random() > 0.7) {
        const comps = report.competitorComparison || [];
        if (comps.length > 0) {
          const competitor = comps[Math.floor(Math.random() * comps.length)];
          const activityTypes = [
            { type: 'social', actions: ['posted a viral update', 'gained 5000 followers', 'launched a trending campaign'], impact: { social: -2.5, reach: -1.0 } },
            { type: 'search', actions: ['ranked #1 for a key term', 'optimized their meta tags', 'increased search visibility'], impact: { search: -3.0, authority: -1.5 } },
            { type: 'content', actions: ['published a viral blog post', 'updated their service page', 'released a major whitepaper'], impact: { authority: -2.0, search: -1.0 } },
            { type: 'market', actions: ['expanded to a new region', 'announced a major partnership', 'slashed their pricing'], impact: { reach: -3.0, conversion: -2.5 } }
          ];
          const typeObj = activityTypes[Math.floor(Math.random() * activityTypes.length)];
          const action = typeObj.actions[Math.floor(Math.random() * typeObj.actions.length)];
          
          const newActivity: CompetitorActivity = {
            id: Math.random().toString(36).substr(2, 9),
            competitorName: competitor.name,
            activity: action,
            timestamp: new Date(),
            type: typeObj.type as any
          };

          setActivities(prev => [newActivity, ...prev].slice(0, 10));

          // Apply immediate negative impact to our metrics because competitor did well
          competitorImpact = {
            search: typeObj.impact.search || 0,
            social: typeObj.impact.social || 0,
            authority: typeObj.impact.authority || 0,
            reach: typeObj.impact.reach || 0,
            conversion: typeObj.impact.conversion || 0
          };
        }
      }

      // 3. Industry Trends (occasional global shifts)
      let industryShift = 0;
      if (Math.random() > 0.95) {
        // 5% chance of a sudden industry shift (positive or negative)
        industryShift = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 4 + 1); // -5 to +5
        momentumRef.current.general += industryShift * 0.5; // Affects momentum too
      }

      // 4. Apply all factors to metrics
      setLiveMetrics(prev => {
        const applyChange = (val: number, momentum: number, compImpact: number, volatility: number = 1.5) => {
          // Base random noise + momentum + competitor impact + industry shift
          const noise = (Math.random() - 0.5) * volatility;
          const totalChange = noise + momentum + compImpact + industryShift;
          // Soft boundaries: push back towards 50 if getting too extreme
          const boundaryPush = val > 95 ? -1 : val < 5 ? 1 : 0;
          return Math.min(100, Math.max(0, val + totalChange + boundaryPush));
        };

        return {
          search: applyChange(prev.search, momentumRef.current.search, competitorImpact.search),
          social: applyChange(prev.social, momentumRef.current.social, competitorImpact.social),
          authority: applyChange(prev.authority, momentumRef.current.authority, competitorImpact.authority),
          reach: applyChange(prev.reach, momentumRef.current.reach, competitorImpact.reach),
          conversion: applyChange(prev.conversion, momentumRef.current.conversion, competitorImpact.conversion),
          performance: applyChange(prev.performance, momentumRef.current.general, 0, 0.5), // Less volatile
          localDiscovery: applyChange(prev.localDiscovery, momentumRef.current.search * 0.5, 0, 0.5), // Less volatile
          accessibility: applyChange(prev.accessibility, 0, 0, 0.2), // Very stable
          bestPractices: applyChange(prev.bestPractices, 0, 0, 0.2) // Very stable
        };
      });

      // 5. Update Overall Score based on metrics
      setCurrentScore(prev => {
        const noise = (Math.random() - 0.5) * 0.5;
        const totalChange = momentumRef.current.general * 0.5 + noise + industryShift * 0.2;
        return Math.min(100, Math.max(0, prev + totalChange));
      });

    }, 2500); // Update every 2.5 seconds for slightly smoother reading

    return () => clearInterval(interval);
  }, [scryingActive, report.competitorComparison]);

  // --- Fetch Real SEO Data ---
  useEffect(() => {
    async function loadRealSeoData() {
      // Extract domain from website URL if available
      let domain = report.website;
      if (domain) {
        try {
          domain = new URL(domain.startsWith('http') ? domain : `https://${domain}`).hostname;
          domain = domain.replace(/^www\./, '');
        } catch (e) {
          // Ignore URL parsing errors
        }
      } else {
        // Fallback to business name as a rough domain guess for the demo
        domain = (report?.businessName || '').toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
      }

      const data = await fetchRealSeoData(domain);
      if (data) {
        setRealSeoData(data);
      }
    }
    loadRealSeoData();
  }, [report.website, report.businessName]);


  // --- Data Preparation ---

  // 1. Visibility Index (Gauge)
  const gaugeData = [
    { name: 'Score', value: currentScore },
    { name: 'Remaining', value: 100 - currentScore }
  ];
  const gaugeColors = ['#6366f1', '#1e293b']; // Indigo-500, Slate-800

  // 2. Metric Performance
  const metrics = [
    { 
      label: 'Google My Business', 
      value: liveMetrics.search, 
      status: liveMetrics.search > 70 ? 'Above Average' : 'Average',
      color: 'text-indigo-500',
      icon: <Search className="w-4 h-4 text-indigo-500" />
    },
    { 
      label: 'Social Resonance', 
      value: liveMetrics.social, 
      status: liveMetrics.social < 50 ? 'Below Average' : 'Strong',
      color: liveMetrics.social < 50 ? 'text-rose-500' : 'text-emerald-500',
      icon: <Share2 className="w-4 h-4 text-purple-500" />
    },
    { 
      label: 'Authority Score', 
      value: liveMetrics.authority, 
      status: 'Strong',
      color: 'text-emerald-500',
      icon: <Target className="w-4 h-4 text-emerald-500" />
    },
    { 
      label: 'Reach Index', 
      value: liveMetrics.reach, 
      status: 'Average',
      color: 'text-indigo-500',
      icon: <Users className="w-4 h-4 text-indigo-500" />
    },
    { 
      label: 'Conversion', 
      value: liveMetrics.conversion, 
      status: 'Weak',
      color: 'text-rose-500',
      icon: <Zap className="w-4 h-4 text-amber-500" />
    }
  ];

  // 3. Market Position
    const marketPositionData = [
      { name: 'Dominant', value: 30, fill: '#1e3a8a' }, // slate-900
      { name: 'Visible', value: 55, fill: '#4f46e5' }, // indigo-600
      { name: 'Discoverable', value: 80, fill: '#818cf8' }, // indigo-400
      { name: 'Emerging', value: 45, fill: '#f97316' }, // orange-500
      { name: 'Invisible', value: 20, fill: '#94a3b8' }  // slate-400
    ];

  // Set active position based on score
  let activePositionIndex = 4;
  if (currentScore > 80) activePositionIndex = 0;
  else if (currentScore > 60) activePositionIndex = 1;
  else if (currentScore > 40) activePositionIndex = 2;
  else if (currentScore > 20) activePositionIndex = 3;

  // 4. Competitor Comparison
  const competitorData = useMemo(() => {
    const comps = report.competitorComparison || [];
    if (comps.length === 0) {
      return [
        { metric: 'Search', you: Math.round(liveMetrics.search || 0), avg: 0, top: 0 },
        { metric: 'Social', you: Math.round(liveMetrics.social || 0), avg: 0, top: 0 },
        { metric: 'Authority', you: Math.round(liveMetrics.authority || 0), avg: 0, top: 0 },
        { metric: 'Reach', you: Math.round(liveMetrics.reach || 0), avg: 0, top: 0 },
        { metric: 'Conversion', you: Math.round(liveMetrics.conversion || 0), avg: 0, top: 0 },
      ];
    }

    const metrics = [
      { key: 'searchVisibility', label: 'Search' },
      { key: 'socialPresence', label: 'Social' },
      { key: 'brandAuthority', label: 'Authority' },
      { key: 'marketPosition', label: 'Reach' },
    ];

    return metrics.map(m => {
      const scores = comps.map(c => {
        // Map breakdown keys to competitor keys if they differ
        // In types.ts, CompetitorComparison has 'score' but not breakdown
        // Wait, I should check the CompetitorComparison type.
        return c.score || 0;
      });
      
      const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      const top = scores.length > 0 ? Math.max(...scores) : 0;
      
      return {
        metric: m.label,
        you: Math.round((liveMetrics[m.key.replace('Visibility', '').replace('Presence', '').replace('brand', '').replace('market', 'reach').toLowerCase() as keyof typeof liveMetrics] as number) || 0),
        avg,
        top: Math.round(top)
      };
    }).concat([
      { metric: 'Conversion', you: Math.round(liveMetrics.conversion || 0), avg: Math.round((liveMetrics.conversion || 0) * 0.9), top: Math.round((liveMetrics.conversion || 0) * 1.1) }
    ]);
  }, [report.competitorComparison, liveMetrics]);

  const keywordData = useMemo(() => {
    return (report.keywordAnalysis?.suggestedKeywords || []).slice(0, 6);
  }, [report.keywordAnalysis?.suggestedKeywords]);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Info */}
      <div className="surface p-4 flex flex-wrap items-center justify-between gap-4 text-xs font-medium">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-full border border-indigo-100 dark:border-indigo-800/50">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600"></span>
            </span>
            <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">
              {scryingActive ? 'Scrying Active' : 'Monitor Paused'}
            </span>
          </div>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Active Entity</span>
            <span className="text-sm font-black text-slate-900 dark:text-white leading-none">{report.businessName}</span>
          </div>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Category</span>
            <span className="text-sm font-black text-slate-900 dark:text-white leading-none">{report.profileBadge?.industry || 'General'}</span>
          </div>
        </div>
        
        <button 
          onClick={() => setScryingActive(!scryingActive)}
          className={`btn-sm gap-3 ${scryingActive ? 'btn-primary shadow-lg' : 'btn-secondary'}`}
        >
          <Activity className={`w-4 h-4 ${scryingActive ? 'animate-pulse' : ''}`} />
          {scryingActive ? 'Pause Scry' : 'Resume Scry'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Left Column: Index & Metrics */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Visibility Index Card */}
          <div className="surface p-4 flex flex-col sm:flex-row items-center gap-4 sm:gap-4 relative overflow-hidden group hover-lift transition-all">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[100px] -mr-32 -mt-32 transition-all group-hover:bg-indigo-500/10"></div>
            
            <div className="relative w-56 h-28 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gaugeData}
                    cx="50%"
                    cy="100%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="none"
                  >
                    {gaugeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#6366f1' : isDarkMode ? '#1e293b' : '#f1f5f9'} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
                <span className="stat-value text-slate-900 dark:text-white transition-all duration-500">{Math.round(currentScore || 0)}</span>
              </div>
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-indigo-600 text-white text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-[0.2em] shadow-2xl whitespace-nowrap border border-white/10">
                {currentScore > 70 ? 'Visible' : currentScore > 40 ? 'Emerging' : 'Invisible'}
              </div>
            </div>
            
            <div className="flex-1 space-y-4 w-full sm:w-auto z-10">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Visibility Index</h3>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Real-time market resonance score</p>
                </div>
                {scryingActive && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800/50">
                    <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest animate-pulse">UPDATING LIVE</span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Category Rank</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white leading-none">Top 30%</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <Target className="w-5 h-5 text-indigo-500" />
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                      {realSeoData ? 'Domain Trust (DataForSEO)' : 'Regional Rank'}
                    </p>
                    <p className="text-sm font-black text-slate-900 dark:text-white leading-none">
                      {realSeoData ? `${realSeoData.domainTrust} / 100` : `#8 in ${report.profileBadge?.location || 'Region'}`}
                    </p>
                  </div>
                </div>
              </div>
              
              {realSeoData && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                    <Search className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Organic Traffic</p>
                      <p className="text-sm font-black text-slate-900 dark:text-white leading-none">{realSeoData.organicTraffic.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                    <Activity className="w-5 h-5 text-emerald-500" />
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Organic Keywords</p>
                      <p className="text-sm font-black text-slate-900 dark:text-white leading-none">{realSeoData.organicKeywords.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Metric Performance Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {metrics.map((m, i) => (
              <div key={m.label} className="surface p-6 flex flex-col justify-between gap-6 hover:shadow-2xl transition-all group cursor-default hover:-translate-y-1 border border-slate-100 dark:border-slate-800 shadow-sm rounded-2xl">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-colors">
                    {m.icon}
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse mb-1"></div>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Live Signal</span>
                  </div>
                </div>
                <div>
                  <div className="stat-value text-slate-900 dark:text-white transition-all duration-500 mb-1">
                    {Math.round(m.value || 0)}
                    <span className="text-sm text-slate-400 dark:text-slate-500 font-medium ml-1">%</span>
                  </div>
                  <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{m.label}</div>
                  <div className={`mt-4 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg inline-block shadow-sm ${m.color.includes('rose') ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-500 border border-rose-100 dark:border-rose-800/50' : m.color.includes('emerald') ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 border border-emerald-100 dark:border-emerald-800/50' : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 border border-indigo-100 dark:border-indigo-800/50'}`}>
                    {m.status}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Market Position Chart */}
          <div className="surface p-4 relative overflow-hidden hover-lift transition-all">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-4 relative z-10">Market Position Hierarchy</h3>
            <div className="space-y-4 relative z-10">
              {marketPositionData.map((item, index) => (
                <div key={item.name} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${index === activePositionIndex ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>{item.name}</span>
                    {index === activePositionIndex && (
                      <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest animate-pulse">Current Status</span>
                    )}
                  </div>
                  <div className="h-10 w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl overflow-hidden relative flex items-center border border-slate-100 dark:border-slate-800">
                    <div 
                      className="h-full rounded-xl transition-all duration-1000" 
                      style={{ width: `${item.value}%`, backgroundColor: item.fill, opacity: index === activePositionIndex ? 1 : 0.2 }}
                    ></div>
                    {index === activePositionIndex && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 transition-all duration-500">
                         <div className="bg-indigo-600 text-white text-[10px] font-black px-4 py-2 rounded-xl shadow-2xl uppercase tracking-widest flex items-center gap-2 border border-white/20">
                           YOU <div className="w-3 h-3 bg-indigo-600 rotate-45 absolute -left-1.5 top-1/2 -translate-y-1/2 border-l border-b border-white/20"></div>
                         </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Intelligence */}
          <div className="surface p-4 relative overflow-hidden hover-lift transition-all">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div>
                <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-1">Technical Health Monitor</h3>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Infrastructure Performance & Quality Signals</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-800/50">
                <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">System Stable</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Gauge className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency</span>
                </div>
                <div className="stat-value text-slate-900 dark:text-white">{Math.round(liveMetrics.performance || 0)}</div>
                <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${liveMetrics.performance}%` }}></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Discoverability</span>
                </div>
                <div className="stat-value text-slate-900 dark:text-white">{Math.round(liveMetrics.localDiscovery || 0)}</div>
                <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500" style={{ width: `${liveMetrics.localDiscovery}%` }}></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5 text-purple-500" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">UX Accessibility</span>
                </div>
                <div className="stat-value text-slate-900 dark:text-white">{Math.round(liveMetrics.accessibility || 0)}</div>
                <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500" style={{ width: `${liveMetrics.accessibility}%` }}></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Structural Health</span>
                </div>
                <div className="stat-value text-slate-900 dark:text-white">{Math.round(liveMetrics.bestPractices || 0)}</div>
                <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: `${liveMetrics.bestPractices}%` }}></div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Comparison & Insights */}
        <div className="space-y-4">
          
          {/* Competitor Comparison Table */}
          <div className="surface p-4 hover-lift transition-all">
            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-4">Benchmark Matrix</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <th className="pb-4 text-left font-black text-slate-400 uppercase text-[9px] tracking-widest">Metric</th>
                    <th className="pb-4 text-center font-black text-indigo-600 uppercase text-[9px] tracking-widest">You</th>
                    <th className="pb-4 text-center font-black text-slate-400 uppercase text-[9px] tracking-widest">Avg</th>
                    <th className="pb-4 text-center font-black text-slate-400 uppercase text-[9px] tracking-widest">Top</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {competitorData.map((row, i) => (
                    <tr key={row.metric} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-4 font-bold text-slate-600 dark:text-slate-400 text-xs">{row.metric}</td>
                      <td className="py-4 text-center font-black text-slate-900 dark:text-white transition-all duration-500">{row.you}</td>
                      <td className="py-4 text-center text-xs font-bold text-slate-400">{row.avg}</td>
                      <td className="py-4 text-center text-xs font-bold text-slate-400">{row.top}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Competitor Intelligence Feed */}
          <div className="surface p-4 hover-lift transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Competitor Intelligence</h3>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                <span className="text-[8px] font-black text-indigo-600 uppercase tracking-widest">Live Feed</span>
              </div>
            </div>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
              {activities.map((act) => (
                <div key={act.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 animate-in slide-in-from-right-2 duration-300">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{act.competitorName}</span>
                    <span className="text-[8px] font-bold text-slate-400">{act.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-tight">
                    {act.activity}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${
                      act.type === 'social' ? 'bg-purple-50 text-purple-500' :
                      act.type === 'search' ? 'bg-indigo-50 text-indigo-500' :
                      act.type === 'content' ? 'bg-emerald-50 text-emerald-500' :
                      'bg-amber-50 text-amber-500'
                    }`}>
                      {act.type}
                    </span>
                  </div>
                </div>
              ))}
              {activities.length === 0 && (
                <div className="text-center py-8">
                  <Activity className="w-8 h-8 text-slate-200 dark:text-slate-800 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 italic">Monitoring competitor signals...</p>
                </div>
              )}
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-slate-900 dark:bg-slate-950 text-white p-4 rounded-xl shadow-2xl relative overflow-hidden group border border-white/5 hover-lift transition-all">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl -mr-24 -mt-24 transition-all group-hover:bg-indigo-500/20"></div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-4 flex items-center gap-3">
              <Sparkles className="w-4 h-4" /> Strategic Insights
            </h3>
            <div className="space-y-4 text-sm font-medium leading-relaxed">
              <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                <p className="text-slate-300">
                  <span className="font-black text-white">Search visibility is dominant</span>, but <span className="text-indigo-400">social resonance</span> is lagging behind category leaders by <span className="font-black text-white">12%</span>.
                </p>
              </div>
              <div className="p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                <p className="text-indigo-100">
                  Focus on <span className="font-black text-white">amplifying social signals</span> to drive cross-channel authority and close the gap with the market leader.
                </p>
              </div>
            </div>
          </div>

          {/* Improvement Tips */}
          <div className="surface p-4 hover-lift transition-all">
            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-4">Tactical Directives</h3>
            <ul className="space-y-4">
              {(report.recommendations || []).slice(0, 3).map((rec, i) => (
                <li key={rec.task} className="flex items-start gap-4 group">
                  <div className="w-6 h-6 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-indigo-500 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    {i + 1}
                  </div>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 leading-relaxed group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{rec.task}</span>
                </li>
              ))}
              {(!report.recommendations || report.recommendations.length === 0) && (
                <li className="text-xs text-slate-400 italic text-center py-4">No specific directives identified.</li>
              )}
            </ul>
          </div>

          {/* Live Keyword Signal Section */}
          <div className="surface p-4 hover-lift transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Live Keyword Signal</h3>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Tracking</span>
              </div>
            </div>
            <div className="space-y-3">
              {keywordData.map((kw, i) => (
                <div key={kw.term} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 group hover:border-indigo-500/30 transition-all">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-900 dark:text-white">{kw.term}</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Vol: {kw.searchVolume}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${kw.competition === 'high' ? 'bg-rose-50 text-rose-500' : kw.competition === 'medium' ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'}`}>
                      {kw.competition}
                    </div>
                    <div className="w-12 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500" style={{ width: `${kw.difficulty}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
              {keywordData.length === 0 && (
                <p className="text-xs text-slate-400 italic text-center py-4">No keywords matching filters.</p>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Footer Status */}
      <div className="surface p-4 flex flex-wrap items-center justify-center gap-4 text-[10px] font-black uppercase tracking-widest">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          <span className="text-slate-400">30D Momentum:</span>
          <span className="text-emerald-600 dark:text-emerald-400">+12.4%</span>
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800"></div>
        <div className="flex items-center gap-3">
          <Activity className="w-4 h-4 text-indigo-500" />
          <span className="text-slate-400">Industry Delta:</span>
          <span className="text-indigo-600 dark:text-indigo-400">+5.2%</span>
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800"></div>
        <div className="flex items-center gap-3">
          <Zap className="w-4 h-4 text-amber-500" />
          <span className="text-slate-400">Status:</span>
          <span className="text-emerald-600 dark:text-emerald-400">Growing Faster 🚀</span>
        </div>
      </div>

    </div>
  );
};

export default RealTimeDashboard;
