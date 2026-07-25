
import React, { useMemo, useState, useEffect } from 'react';
import { Target, TrendingUp, TrendingDown, Minus, ArrowRight, Shield, ChevronUp, ChevronDown, Loader2, Bot, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { VisibilityReport } from '../types';
import { generateCompetitorSummary } from '../services/aiService';

interface CompetitorAnalysisWidgetProps {
  report: VisibilityReport;
}

const CompetitorAnalysisWidget: React.FC<CompetitorAnalysisWidgetProps> = ({ report }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [summaries, setSummaries] = useState<Record<string, string>>({});
  const [loadingSummaries, setLoadingSummaries] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [watchlist, setWatchlist] = useState<string[]>([]);

  // Refs for tracking summaries and loading state synchronously to avoid stale closures and infinite loop dependencies.
  const summariesRef = React.useRef<Record<string, string>>({});
  const loadingSummariesRef = React.useRef<Record<string, boolean>>({});

  // Watchlist synchronization
  useEffect(() => {
    const load = () => {
      try {
        const stored = localStorage.getItem('ocula_competitor_watchlist');
        setWatchlist(stored ? JSON.parse(stored) : []);
      } catch (e) {
        console.error(e);
      }
    };
    load();
    window.addEventListener('ocula_watchlist_changed', load);
    return () => window.removeEventListener('ocula_watchlist_changed', load);
  }, []);

  const toggleWatchlist = (name: string) => {
    try {
      const stored = localStorage.getItem('ocula_competitor_watchlist');
      let current: string[] = stored ? JSON.parse(stored) : [];
      if (current.includes(name)) {
        current = current.filter(x => x !== name);
      } else {
        current.push(name);
      }
      localStorage.setItem('ocula_competitor_watchlist', JSON.stringify(current));
      setWatchlist(current);
      window.dispatchEvent(new Event('ocula_watchlist_changed'));
    } catch (e) {
      console.error(e);
    }
  };

  const sortedAllCompetitors = useMemo(() => {
	return [...(report.competitorComparison || [])]
       .sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0));
  }, [report.competitorComparison]);

  const itemsPerPage = isExpanded ? 4 : 3;
  const totalPages = Math.ceil(sortedAllCompetitors.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [isExpanded, sortedAllCompetitors.length]);

  const competitors = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedAllCompetitors.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedAllCompetitors, currentPage, itemsPerPage]);

  // Derive a primitive representing of the current competitors to use in the dependency array
  const competitorsNamesKey = useMemo(() => {
    return competitors.map(c => c.name).join(',');
  }, [competitors]);

  useEffect(() => {
    if (isExpanded) {
      competitors.forEach(async (comp) => {
        const name = comp.name;
        if (!comp.summary && !summariesRef.current[name] && !loadingSummariesRef.current[name]) {
          loadingSummariesRef.current[name] = true;
          setLoadingSummaries(prev => ({ ...prev, [name]: true }));
          try {
            const summary = await generateCompetitorSummary(
              report.businessName,
              report.overallScore,
              name,
              comp.score,
              comp.strengths || [],
              comp.weaknesses || []
            );
            summariesRef.current[name] = summary;
            setSummaries(prev => ({ ...prev, [name]: summary }));
          } catch (error) {
            console.error("Failed to generate competitor summary in analysis widget:", error);
            const fallback = `Summary: "${name}" presents steady competition with visibility score of ${comp.score}. Strengths lie in target regional exposure, and opportunities are ripe to outperform them with strategic content scaling.`;
            summariesRef.current[name] = fallback;
            setSummaries(prev => ({ ...prev, [name]: fallback }));
          } finally {
            loadingSummariesRef.current[name] = false;
            setLoadingSummaries(prev => ({ ...prev, [name]: false }));
          }
        }
      });
    }
  }, [isExpanded, competitorsNamesKey, report.businessName, report.overallScore]);

  if (competitors.length === 0) {
    return (
      <div className="surface p-6 border border-slate-100 dark:border-slate-800 text-center space-y-4">
        <Target className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No Competitors Detected Yet</p>
      </div>
    );
  }

  return (
    <motion.div 
      layout
      className={`surface p-6 h-full flex flex-col border border-slate-100 dark:border-slate-800 relative overflow-hidden group transition-all duration-500 ${isExpanded ? 'ring-2 ring-indigo-500/20' : ''}`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-indigo-500/10" />
      
      <div className="flex justify-between items-center mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
            <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Competitor Analysis</h3>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Benchmark Intelligence</p>
          </div>
        </div>
        {isExpanded && (
          <button 
            onClick={() => setIsExpanded(false)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ChevronUp className="w-4 h-4 text-slate-400" />
          </button>
        )}
      </div>

      <div className="flex-grow overflow-y-auto custom-scrollbar pr-1 relative z-10">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-50 dark:border-slate-800/50">
              <th className="pb-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Rival</th>
              <th className="pb-3 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">Score</th>
              <th className="pb-3 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">Growth</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
            {competitors.map((comp, idx) => (
              <React.Fragment key={idx}>
                <tr className="group/row transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-black text-slate-400 border border-slate-200 dark:border-slate-700">
                        {(comp?.name || '').charAt(0)}
                      </div>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{comp?.name || 'Competitor'}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWatchlist(comp.name);
                        }}
                        className="p-1 rounded-md text-slate-300 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all cursor-pointer select-none"
                        title={watchlist.includes(comp.name) ? 'Remove from Watchlist' : 'Add to Watchlist'}
                      >
                        <Star className={`w-3.5 h-3.5 ${watchlist.includes(comp.name) ? 'text-amber-500 fill-amber-500' : 'text-slate-300 dark:text-slate-600'}`} />
                      </button>
                    </div>
                  </td>
                  <td className="py-3 text-center">
                    <span className="text-sm font-black text-slate-900 dark:text-white">{comp.score}</span>
                  </td>
                  <td className="py-3 text-right">
                    <div className={`inline-flex items-center gap-1 ${comp.trend === 'up' ? 'text-emerald-500' : comp.trend === 'down' ? 'text-rose-500' : 'text-slate-400'}`}>
                      {comp.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : comp.trend === 'down' ? <TrendingDown className="w-3 h-3 rotate-180" /> : <Minus className="w-3 h-3" />}
                    </div>
                  </td>
                </tr>
                {isExpanded && (
                  <tr className="bg-slate-50/30 dark:bg-slate-900/10">
                    <td colSpan={3} className="px-3 pb-4">
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3"
                      >
                        {loadingSummaries[comp.name] ? (
                          <div className="flex items-center gap-2 py-2 text-slate-500 dark:text-slate-400">
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                            <span className="text-[10px] uppercase font-bold tracking-wider">Awaiting positioning scry...</span>
                          </div>
                        ) : (comp.summary || summaries[comp.name]) ? (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed italic border-l-2 border-indigo-500 pl-3">
                            {comp.summary || summaries[comp.name]}
                          </p>
                        ) : null}
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h5 className="text-[8px] font-black uppercase tracking-wider text-emerald-500 mb-2">Key Advantages</h5>
                            <ul className="space-y-1">
                              {(comp.strengths && comp.strengths.length > 0 ? comp.strengths : ["Consistent regional visibility", "Digital presence foundations", "Active regional search index"]).slice(0, 3).map((s, i) => (
                                <li key={i} className="text-[10px] text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                                  <div className="w-1 h-1 rounded-full bg-emerald-500" /> {s}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h5 className="text-[8px] font-black uppercase tracking-wider text-rose-500 mb-2">Exploitable Gaps</h5>
                            <ul className="space-y-1">
                              {(comp.weaknesses && comp.weaknesses.length > 0 ? comp.weaknesses : ["Content coverage gaps", "Metadata search optimize opportunities", "Social engagement signal expansion"]).slice(0, 3).map((w, i) => (
                                <li key={i} className="text-[10px] text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                                  <div className="w-1 h-1 rounded-full bg-rose-500" /> {w}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </motion.div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            
            {/* YOU Row */}
            <tr className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-500/20">
              <td className="py-3.5 px-3 rounded-l-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-[10px] font-black tracking-widest text-white border border-white/30">
                    O
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest truncate max-w-[130px]">{report.businessName || 'Your Business'}</span>
                </div>
              </td>
              <td className="py-3.5 text-center">
                <span className="text-sm font-black bg-white/20 px-2.5 py-1 rounded-lg border border-white/25">{report.overallScore}</span>
              </td>
              <td className="py-3.5 pr-4 text-right rounded-r-xl">
                <div className="inline-flex items-center gap-1.5 bg-white/15 px-2.5 py-1 rounded-full border border-white/20">
                  <Shield className="w-3.5 h-3.5 text-white animate-pulse" />
                  <span className="text-[8px] font-black uppercase tracking-widest hidden sm:inline">Active</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-800 flex flex-row items-center justify-between gap-4 relative z-10 select-none">
        {totalPages > 1 ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1 px-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 disabled:opacity-40 disabled:pointer-events-none transition-colors border border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1 cursor-pointer"
              id="competitor-pag-prev"
            >
              <ChevronLeft className="w-3 h-3" />
              <span>Back</span>
            </button>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1 px-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 disabled:opacity-40 disabled:pointer-events-none transition-colors border border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1 cursor-pointer"
              id="competitor-pag-next"
            >
              <span>Next</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400/75 select-none text-left">
            Benchmarked against {sortedAllCompetitors.length} rivals
          </div>
        )}

        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest group/btn hover:translate-x-1 transition-all"
        >
          {isExpanded ? 'Close Analysis' : 'Rival Deep-Dive'} 
          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
        </button>
      </div>
    </motion.div>
  );
};

export default CompetitorAnalysisWidget;
