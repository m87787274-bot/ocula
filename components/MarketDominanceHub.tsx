
import React, { useMemo } from 'react';
import { SavedScan, VisibilityReport } from '../types';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, Legend } from 'recharts';
import { Shield, Target, Zap, TrendingUp, Award, Globe, ArrowUpRight } from 'lucide-react';

interface MarketDominanceHubProps {
  scans: SavedScan[];
  isDarkMode: boolean;
}

const MarketDominanceHub: React.FC<MarketDominanceHubProps> = ({ scans, isDarkMode }) => {
  const stats = useMemo(() => {
    if (!scans || scans.length === 0) return null;

    // Sort by date descending to get the latest scan
    const sortedScans = [...scans].sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
    const latestScan = sortedScans[0];
    if (!latestScan) return null;
    
    // Use latest scan for metrics
    const avgScore = latestScan.score ?? latestScan.report?.overallScore ?? 0;
    const topBusiness = latestScan;
    
    // Radar from latest scan categories, radarMetrics, or visibilityBreakdown
    let radarData: any[] = [];
    const report = latestScan.report;
    if (Array.isArray(report?.radarMetrics) && report.radarMetrics.length > 0) {
      radarData = report.radarMetrics.map(r => ({
        subject: r.subject || 'Metric',
        A: Number(r.A) || 0,
        benchmark: 65,
        fullMark: 100
      }));
    } else if (Array.isArray(report?.categories) && report.categories.length > 0) {
      radarData = report.categories.map(cat => ({
        subject: cat.name ? cat.name.split(' ')[0] : 'Metric',
        A: Number(cat.score) || 0,
        benchmark: 65,
        fullMark: 100
      }));
    } else if (report?.visibilityBreakdown) {
      const vb = report.visibilityBreakdown;
      radarData = [
        { subject: 'Google', A: Number(vb.googleMyBusiness) || 75, benchmark: 65, fullMark: 100 },
        { subject: 'Social', A: Number(vb.socialPresence) || 70, benchmark: 65, fullMark: 100 },
        { subject: 'Brand', A: Number(vb.brandAuthority) || 76, benchmark: 65, fullMark: 100 },
        { subject: 'Content', A: Number(vb.contentStrength) || 75, benchmark: 65, fullMark: 100 },
        { subject: 'Market', A: Number(vb.marketPosition) || 83, benchmark: 65, fullMark: 100 },
      ];
    } else {
      const baseScore = Number(latestScan.score ?? report?.overallScore ?? 78);
      radarData = [
        { subject: 'Google', A: Math.min(100, baseScore + 6), benchmark: 65, fullMark: 100 },
        { subject: 'SEO', A: baseScore, benchmark: 65, fullMark: 100 },
        { subject: 'Social', A: Math.max(30, baseScore - 8), benchmark: 65, fullMark: 100 },
        { subject: 'Brand', A: Math.max(35, baseScore - 3), benchmark: 65, fullMark: 100 },
        { subject: 'Content', A: Math.max(40, baseScore - 2), benchmark: 65, fullMark: 100 },
      ];
    }

    // Market Comparison (Simulated market average for context)
    const marketAvg = 65;
    const dominanceGap = avgScore - marketAvg;

    return {
      avgScore,
      topBusiness,
      radarData,
      dominanceGap,
      marketAvg,
      timestamp: latestScan.timestamp || new Date().toISOString()
    };
  }, [scans]);

  const marketPulse = [
    { label: 'Market Volatility', value: 'Low', color: 'text-emerald-500' },
    { label: 'Consumer Sentiment', value: 'Positive', color: 'text-indigo-500' },
    { label: 'Competitor Activity', value: 'High', color: 'text-rose-500' },
    { label: 'Search Trends', value: 'Rising', color: 'text-amber-500' }
  ];

  if (!stats) return null;

  return (
    <div className="space-y-4">
      {/* Market Pulse Ticker */}
      <div className="surface border-y border-slate-100 dark:border-slate-800 py-4 overflow-hidden relative">
        <div className="flex items-center gap-4 animate-marquee whitespace-nowrap">
          {[...marketPulse, ...marketPulse].map((pulse, idx) => (
            <div key={`${pulse.label}-${idx}`} className="flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{pulse.label}:</span>
              <span className={`text-[10px] font-black uppercase tracking-widest ${pulse.color}`}>{pulse.value}</span>
              <div className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700"></div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Dominance Radar */}
      <div className="lg:col-span-1 surface p-4 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Dominance Radar</h3>
          <Shield className="w-4 h-4 text-indigo-500" />
        </div>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={stats.radarData}>
              <PolarGrid stroke={isDarkMode ? "#1e293b" : "#f1f5f9"} />
              <PolarAngleAxis dataKey="subject" tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 10, fontWeight: 800 }} />
              <Radar
                name="Your Performance"
                dataKey="A"
                stroke="#6366f1"
                strokeWidth={3}
                fill="#6366f1"
                fillOpacity={0.3}
              />
              <Radar
                name="Market Average"
                dataKey="benchmark"
                stroke="#94a3b8"
                strokeWidth={2}
                strokeDasharray="4 4"
                fill="#94a3b8"
                fillOpacity={0.1}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: isDarkMode ? '#0f172a' : '#fff', border: 'none', borderRadius: '12px', fontSize: '10px' }}
              />
              <Legend wrapperStyle={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-4 text-center">
          Latest Analysis: {new Date(stats.timestamp).toLocaleDateString()}
        </p>
      </div>

      {/* Market Position Hub */}
      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Market Dominance Score */}
        <div className="bg-slate-900 dark:bg-slate-950 p-4 rounded-xl shadow-2xl text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-500/20 rounded-xl">
                  <Globe className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="text-lg font-black tracking-tight uppercase">Market Dominance</h3>
              </div>
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-7xl font-black tracking-tighter">{stats.avgScore}</span>
                <span className="text-indigo-400 font-black text-xl">/ 100</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${stats.dominanceGap >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                  {stats.dominanceGap >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
                  {Math.abs(stats.dominanceGap)}% vs Market Avg
                </div>
              </div>
            </div>
            <div className="mt-4 pt-8 border-t border-white/10">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Primary Entity</p>
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-100">{stats.topBusiness.businessName}</span>
                <span className="text-xs font-black text-indigo-400">{stats.topBusiness.score} PTS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Strategic Intelligence Feed */}
        <div className="surface p-4 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Intelligence Feed</h3>
            <Zap className="w-4 h-4 text-yellow-500" />
          </div>
          
          <div className="space-y-4 flex-grow">
            {(scans || []).slice(0, 2).map((scan, idx) => (
              <div key={idx} className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{scan.businessName || 'Entity Scan'}</span>
                </div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed italic">
                  "{scan.report?.strategicInsights?.recommendedNextMove || scan.report?.recommendations?.[0]?.task || "Focus on increasing search visibility to boost overall score."}"
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Growth Vector</p>
                <p className="text-xs font-black text-slate-900 dark:text-white">Optimize Local Signal Strength</p>
              </div>
            </div>
          </div>
        </div>

      </div>
      </div>
    </div>
  );
};

export default MarketDominanceHub;
