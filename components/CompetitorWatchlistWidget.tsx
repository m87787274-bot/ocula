import React, { useState, useEffect, useMemo } from 'react';
import { Star, Shield, TrendingUp, TrendingDown, Minus, Swords, Trash2, Plus, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { VisibilityReport } from '../types';

interface CompetitorWatchlistWidgetProps {
  report: VisibilityReport;
}

export const CompetitorWatchlistWidget: React.FC<CompetitorWatchlistWidgetProps> = ({ report }) => {
  const [watchlist, setWatchlist] = useState<string[]>([]);

  // Function to load watchlist from localStorage
  const loadWatchlist = () => {
    try {
      const stored = localStorage.getItem('ocula_competitor_watchlist');
      if (stored) {
        setWatchlist(JSON.parse(stored));
      } else {
        // Pre-populate with first rival if empty just for user delight
        const rivals = report?.competitorComparison || [];
        if (rivals.length > 0 && rivals[0]?.name) {
          const initial = [rivals[0].name];
          localStorage.setItem('ocula_competitor_watchlist', JSON.stringify(initial));
          setWatchlist(initial);
        }
      }
    } catch (e) {
      console.error("Failed to load competitor watchlist", e);
    }
  };

  // Sync state on mount and register listener for update events
  useEffect(() => {
    loadWatchlist();

    const handleSync = () => {
      loadWatchlist();
    };

    window.addEventListener('ocula_watchlist_changed', handleSync);
    return () => {
      window.removeEventListener('ocula_watchlist_changed', handleSync);
    };
  }, [report.businessName]);

  // Handle adding to watchlist
  const handleAddToWatchlist = (name: string) => {
    try {
      const stored = localStorage.getItem('ocula_competitor_watchlist');
      let current: string[] = stored ? JSON.parse(stored) : [];
      if (!current.includes(name)) {
        current.push(name);
        localStorage.setItem('ocula_competitor_watchlist', JSON.stringify(current));
        setWatchlist(current);
        window.dispatchEvent(new Event('ocula_watchlist_changed'));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle removing from watchlist
  const handleRemoveFromWatchlist = (name: string) => {
    try {
      const stored = localStorage.getItem('ocula_competitor_watchlist');
      let current: string[] = stored ? JSON.parse(stored) : [];
      current = current.filter(item => item !== name);
      localStorage.setItem('ocula_competitor_watchlist', JSON.stringify(current));
      setWatchlist(current);
      window.dispatchEvent(new Event('ocula_watchlist_changed'));
    } catch (e) {
      console.error(e);
    }
  };

  // Extract all competitors matching watchlist names
  const watchlistedCompetitors = useMemo(() => {
    const all = report?.competitorComparison || [];
    return all.filter(c => c && c.name && watchlist.includes(c.name));
  }, [report?.competitorComparison, watchlist]);

  // Non-watchlisted competitors for the quick-add option
  const availableRivals = useMemo(() => {
    const all = report?.competitorComparison || [];
    return all.filter(c => c && c.name && !watchlist.includes(c.name));
  }, [report?.competitorComparison, watchlist]);

  return (
    <div className="p-6 h-full flex flex-col bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl relative overflow-hidden group">
      {/* Background radial accent */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none group-hover:bg-indigo-500/10 transition-all duration-700" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900">
            <Star className="w-5 h-5 text-indigo-600 dark:text-indigo-400 fill-indigo-500/10" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase flex items-center gap-2">
              Rival Watchlist
              <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-full tracking-normal">
                {watchlistedCompetitors.length} Active
              </span>
            </h3>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
              Side-by-Side Performance Radar
            </p>
          </div>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto custom-scrollbar space-y-6 pr-1 relative z-10">
        
        {/* Watchlist empty state */}
        {watchlistedCompetitors.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30">
            <Swords className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3 animate-pulse" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Watchlist is Empty</h4>
            <p className="text-xs text-slate-400 max-w-[280px] mt-1 mb-4 leading-normal">
              Pin specific competitors to trigger instant side-by-side scoring, gap analysis, and trend overlays.
            </p>

            {availableRivals.length > 0 && (
              <div className="w-full max-w-sm space-y-2 mt-2">
                <p className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest text-left mb-1">
                  Add Available Rivals From Scan:
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {availableRivals.map((rival, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 text-left hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                    >
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate pr-2">{rival.name}</span>
                      <button
                        onClick={() => handleAddToWatchlist(rival.name)}
                        className="flex items-center gap-1 text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest cursor-pointer px-2 py-1 bg-indigo-50 dark:bg-indigo-950/50 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/80 transition-colors select-none"
                      >
                        <Plus className="w-3 h-3" /> Pin
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Quick add / management rail */}
            {availableRivals.length > 0 && (
              <div className="p-3 bg-slate-50/50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-4">
                <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                  Available to track:
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 select-none no-scrollbar">
                  {availableRivals.slice(0, 3).map((rival, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAddToWatchlist(rival.name)}
                      className="flex items-center gap-1 text-[9px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider px-2 py-1 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 rounded border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all cursor-pointer truncate max-w-[120px]"
                    >
                      <Plus className="w-2.5 h-2.5" /> {rival.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Side-by-Side Comparison Grid */}
            <div className="space-y-4">
              {watchlistedCompetitors.map((comp, idx) => {
                const scoreDiff = report.overallScore - comp.score;
                const isUserAhead = scoreDiff >= 0;

                return (
                  <motion.div
                    key={comp.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/20 relative group/card hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-300"
                  >
                    {/* Card heading / controls */}
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <div>
                        <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
                          {comp.name}
                          <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[8px] font-black tracking-wider uppercase ${
                            comp.trend === 'up' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' :
                            comp.trend === 'down' ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400' :
                            'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}>
                            {comp.trend === 'up' ? <TrendingUp className="w-2.5 h-2.5" /> : comp.trend === 'down' ? <TrendingDown className="w-2.5 h-2.5" /> : <Minus className="w-2.5 h-2.5" />}
                            {comp.trend || 'Stable'}
                          </span>
                        </h4>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">Benchmarked Rival</p>
                      </div>
                      <button
                        onClick={() => handleRemoveFromWatchlist(comp.name)}
                        className="p-1 px-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-rose-500 opacity-60 hover:opacity-100 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-black text-[9px] uppercase tracking-wider cursor-pointer duration-200"
                        title="Remove PIN"
                      >
                        Unpin
                      </button>
                    </div>

                    {/* Side by Side Score comparison visual bar */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100/80 dark:border-slate-800/80 mb-4">
                      {/* User score */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-400">
                          <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                            <Shield className="w-3.5 h-3.5 text-indigo-500" />
                            {report.businessName} (YOU)
                          </span>
                          <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{report.overallScore}</span>
                        </div>
                        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                          <div 
                            className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full" 
                            style={{ width: `${report.overallScore}%` }}
                          />
                        </div>
                      </div>

                      {/* Rival score */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-400">
                          <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                            <Swords className="w-3.5 h-3.5 text-indigo-500" />
                            {comp.name}
                          </span>
                          <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{comp.score}</span>
                        </div>
                        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                          <div 
                            className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full" 
                            style={{ width: `${comp.score}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Comparative Gap Indicators */}
                    <div className="flex items-center justify-between py-1.5 px-3 mb-4 rounded-lg bg-slate-100/50 dark:bg-slate-800/30 text-xs">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Differential:</span>
                      <span className={`font-black uppercase text-[10px] tracking-wider ${isUserAhead ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {isUserAhead ? `+${scoreDiff} Ahead` : `${scoreDiff} Behind`}
                      </span>
                    </div>

                    {/* side-by-side attributes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                      <div>
                        <h5 className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-2 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                          RIVAL CAPABILITY
                        </h5>
                        <ul className="space-y-1">
                          {(comp.strengths && comp.strengths.length > 0 ? comp.strengths : ["Steady regional keywords", "Established site listing", "Positive local score feedback"]).slice(0, 2).map((s, i) => (
                            <li key={i} className="text-[10px] text-slate-600 dark:text-slate-400 flex items-start gap-1">
                              <span className="text-indigo-500 font-extrabold select-none shrink-0">•</span>
                              <span className="truncate">{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-2 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                          EXPLOITABLE PATHS
                        </h5>
                        <ul className="space-y-1">
                          {(comp.weaknesses && comp.weaknesses.length > 0 ? comp.weaknesses : ["Content gap optimization", "Meta category listings", "Structured business markers"]).slice(0, 2).map((w, i) => (
                            <li key={i} className="text-[10px] text-slate-600 dark:text-slate-400 flex items-start gap-1">
                              <span className="text-rose-500 font-extrabold select-none shrink-0">•</span>
                              <span className="truncate">{w}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* AI Smart Insight callout badge */}
                    <div className="mt-3.5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                      <div className="p-1 bg-violet-50 dark:bg-violet-950/40 rounded border border-violet-100 dark:border-indigo-950">
                        <Sparkles className="w-3 h-3 text-violet-600 dark:text-violet-400" />
                      </div>
                      <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-snug">
                        {isUserAhead 
                          ? `Leverage your +${scoreDiff} edge by prioritizing content depth on their key advantages.` 
                          : `Close the ${Math.abs(scoreDiff)} score deficit. Focus immediate SEO optimizations on their weaknesses.`
                        }
                      </span>
                    </div>

                  </motion.div>
                );
              })}
            </div>
            
          </div>
        )}

      </div>
    </div>
  );
};

export default CompetitorWatchlistWidget;
