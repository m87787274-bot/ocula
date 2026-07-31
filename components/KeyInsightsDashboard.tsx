
import React, { useMemo } from 'react';
import { VisibilityReport, KPI } from '../types';
import { TrendingUp, TrendingDown, Target, Zap, Shield, AlertCircle, ArrowRight, BarChart3, PieChart, Activity } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip } from 'recharts';
import SWOTAnalysis from './SWOTAnalysis';

interface KeyInsightsDashboardProps {
  report: VisibilityReport;
  kpis: KPI[];
  isDarkMode: boolean;
  swotFallback?: any;
  onDefineKPIs?: () => void;
}

const KeyInsightsDashboard: React.FC<KeyInsightsDashboardProps> = React.memo(({ report, kpis, isDarkMode, swotFallback, onDefineKPIs }) => {
  const swotData = report.swotAnalysis || swotFallback;
  const radarData = useMemo(() => {
    const breakdown = report?.visibilityBreakdown || {
      googleMyBusiness: 0,
      socialPresence: 0,
      brandAuthority: 0,
      contentStrength: 0,
      marketPosition: 0
    };
    return [
      { subject: 'GMB', A: breakdown.googleMyBusiness || 0, fullMark: 100 },
      { subject: 'Social', A: breakdown.socialPresence || 0, fullMark: 100 },
      { subject: 'Brand', A: breakdown.brandAuthority || 0, fullMark: 100 },
      { subject: 'Content', A: breakdown.contentStrength || 0, fullMark: 100 },
      { subject: 'Market', A: breakdown.marketPosition || 0, fullMark: 100 },
    ];
  }, [report]);

  const kpiSummary = useMemo(() => {
    if (kpis.length === 0) return null;
    const onTrack = kpis.filter(k => k.value >= k.target).length;
    const total = kpis.length;
    const percentage = Math.round((onTrack / total) * 100);
    return { onTrack, total, percentage };
  }, [kpis]);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Top Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Visibility Index Card */}
        <div className="lg:col-span-2 surface p-4 rounded-xl sm:rounded-xl shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 relative overflow-hidden group hover-lift transition-all">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] -mr-48 -mt-48 transition-all group-hover:bg-indigo-500/10"></div>
          <div className="relative z-10 flex flex-col xl:flex-row items-center xl:items-start gap-6">
            <div className="flex flex-col items-center text-center shrink-0">
              <div className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="transparent"
                    stroke={isDarkMode ? "#1e293b" : "#f1f5f9"}
                    strokeWidth="11"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="transparent"
                    stroke="url(#indigoGradient)"
                    strokeWidth="11"
                    strokeDasharray={565}
                    strokeDashoffset={565 - (565 * (Number(report?.overallScore) || 0)) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="indigoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8b8eff" />
                      <stop offset="100%" stopColor="#5b5fff" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">{report.overallScore}</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Index Score</span>
                </div>
              </div>
              <div className="mt-3 flex flex-col gap-2">
                <div className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-full border border-indigo-100 dark:border-indigo-800">
                  <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest whitespace-nowrap">{(report.profileBadge?.visibilityLevel || 'Emerging')} Presence</span>
                </div>
                {report.overallScore >= 85 && (
                  <div className="px-4 py-1.5 bg-amber-50 dark:bg-amber-900/30 rounded-full border border-amber-100 dark:border-amber-800 flex items-center gap-1.5 justify-center animate-bounce">
                    <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest text-center whitespace-nowrap">Top Performer</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4 items-start min-w-0">
              <div className="space-y-3 min-w-0">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-tight">Intelligence Score</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-bold leading-relaxed line-clamp-2">
                  {report.visibilityIndex?.summary || 'No summary available.'}
                </p>
                <div className="flex flex-col gap-2 pt-1">
                  <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between gap-2 overflow-hidden">
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase shrink-0 whitespace-nowrap">Strength</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate text-right">{report.visibilityIndex?.biggestStrength || 'Not Available'}</span>
                  </div>
                  <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-between gap-2 overflow-hidden">
                    <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase shrink-0 whitespace-nowrap">Gap</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate text-right">{report.visibilityIndex?.primaryGap || 'Not Available'}</span>
                  </div>
                </div>
              </div>
              <div className="h-[180px] sm:h-[200px] w-full min-w-0 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="48%" data={radarData}>
                    <PolarGrid stroke={isDarkMode ? "#1e293b" : "#f1f5f9"} />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 9, fontWeight: 800 }} />
                    <Radar
                      name="Intelligence"
                      dataKey="A"
                      stroke="#6366f1"
                      fill="#6366f1"
                      fillOpacity={0.25}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Next Move Card */}
        <div className="bg-slate-900 dark:bg-indigo-950 p-4 rounded-xl sm:rounded-xl shadow-2xl text-white relative overflow-hidden group border border-white/5 hover-lift transition-all">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-400/10 rounded-full blur-[80px] -mr-32 -mt-32 transition-all group-hover:bg-indigo-400/20"></div>
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                  <Zap className="w-5 h-5 text-indigo-400 fill-indigo-400" />
                </div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.3em]">Strategic Priority</span>
              </div>
              <h4 className="text-2xl font-display font-medium tracking-tight mb-4 leading-tight">Recommended Next Move</h4>
              <p className="text-indigo-100/70 font-medium leading-relaxed mb-4 text-lg">
                {report.strategicInsights?.recommendedNextMove || report.recommendations?.[0]?.task || "Focus on increasing search visibility to boost overall score."}
              </p>
            </div>
            <button className="w-full py-4 bg-white text-slate-900 rounded-xl font-bold shadow-xl flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all hover:scale-[1.02] active:scale-[0.98]">
              Execute Mission <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Middle Row: KPI Summary */}
      <div className="grid grid-cols-1 gap-4">
        {/* KPI Health Monitor */}
        <div className="surface p-4 border border-slate-100 dark:border-slate-800 flex flex-col hover-lift transition-all">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-1">Performance Monitor</h3>
              <p className="text-2xl font-display font-medium text-slate-900 dark:text-white tracking-tight">KPI Health Summary</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <Target className="w-6 h-6 text-purple-500" />
            </div>
          </div>

          {kpiSummary ? (
            <div className="flex-grow flex flex-col justify-center space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90">
                    <circle
                      cx="72"
                      cy="72"
                      r="62"
                      fill="transparent"
                      stroke={isDarkMode ? "#1e293b" : "#f1f5f9"}
                      strokeWidth="8"
                    />
                    <circle
                      cx="72"
                      cy="72"
                      r="62"
                      fill="transparent"
                      stroke={kpiSummary.percentage >= 70 ? "#10b981" : kpiSummary.percentage >= 40 ? "#f59e0b" : "#ef4444"}
                      strokeWidth="8"
                      strokeDasharray={390}
                      strokeDashoffset={390 - (390 * (Number(kpiSummary?.percentage) || 0)) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="stat-value text-slate-900 dark:text-white">{kpiSummary.percentage}%</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="stat-value text-slate-900 dark:text-white">
                    {kpiSummary.onTrack} <span className="text-xl text-slate-400 font-medium">/ {kpiSummary.total}</span>
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Metrics on Track</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Active Monitoring</p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">System Nominal</span>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Last Sync</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Real-time</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-4 space-y-4">
              <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-2xl grayscale opacity-50">🎯</div>
              <p className="text-slate-400 dark:text-slate-500 font-bold text-sm max-w-[200px]">
                No performance metrics identified for monitoring.
              </p>
              <button 
                onClick={onDefineKPIs}
                className="btn-ghost btn-xs text-indigo-500 hover:text-indigo-600 hover:translate-x-1 transition-all"
              >
                Define KPIs
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Strategic SWOT Analysis */}
      {swotData && (
        <div className="surface p-4 hover-lift transition-all">
          <div className="flex items-center gap-4 mb-12">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
              <Shield className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-2xl font-display font-medium text-slate-900 dark:text-white tracking-tight">Strategic SWOT Analysis</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Internal and external visibility factors</p>
            </div>
          </div>
          <SWOTAnalysis swot={swotData} isDarkMode={isDarkMode} variant="dossier" />
        </div>
      )}

      {/* Strategic Insights Breakdown */}
      <div className="surface p-4 hover-lift transition-all">
        <div className="flex items-center gap-4 mb-12">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
            <BarChart3 className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="text-2xl font-display font-medium text-slate-900 dark:text-white tracking-tight">Strategic Intelligence Breakdown</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Deep-dive into actionable market signals</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-rose-500 uppercase tracking-[0.3em] flex items-center gap-2">
              <TrendingDown className="w-4 h-4" /> Missed Opportunities
            </h4>
            <div className="space-y-4">
              {(report.strategicInsights?.missedOpportunities || []).map((opt, idx) => (
                <div key={idx} className="flex gap-4 p-4 bg-rose-50/20 dark:bg-rose-950/5 rounded-xl border border-rose-100/30 dark:border-rose-900/10">
                  <div className="w-7 h-7 rounded-full bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center text-rose-600 dark:text-rose-400 text-xs font-bold shrink-0">{idx + 1}</div>
                  <p className="text-base font-medium text-slate-600 dark:text-slate-400 leading-relaxed">{opt}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.3em] flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Actionable Improvements
            </h4>
            <div className="space-y-4">
              {(report.strategicInsights?.actionableImprovements || []).map((imp, idx) => (
                <div key={idx} className="flex gap-4 p-4 bg-emerald-50/20 dark:bg-emerald-950/5 rounded-xl border border-emerald-100/30 dark:border-emerald-800/10">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-xs font-bold shrink-0">{idx + 1}</div>
                  <p className="text-base font-medium text-slate-600 dark:text-slate-400 leading-relaxed">{imp}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default KeyInsightsDashboard;
