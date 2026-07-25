
import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search, CheckCircle2, ArrowRight, Target, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, Globe, Shield } from 'lucide-react';
import { VisibilityReport } from '../types';

interface SearchVisibilityWidgetProps {
  report: VisibilityReport;
  compact?: boolean;
}

const SearchVisibilityWidget: React.FC<SearchVisibilityWidgetProps> = ({ report, compact = false }) => {
  const [showDeepDive, setShowDeepDive] = useState(false);
  const gmbScore = report.visibilityBreakdown?.googleMyBusiness || 0;
  
  const mapInsights = useMemo<string[]>(() => {
    if (!report) return [];

    const categories = Array.isArray(report.categories) ? report.categories : [];
    const gmbCategory = categories.find(c => 
      c && typeof c.name === 'string' && (
        c.name.toLowerCase().includes('google my business') || 
        c.name.toLowerCase().includes('local') ||
        c.name.toLowerCase().includes('maps')
      )
    );
    
    let insights: string[] = [];
    if (gmbCategory?.details) {
      if (Array.isArray(gmbCategory.details)) {
        insights = gmbCategory.details.filter(d => typeof d === 'string');
      } else if (typeof gmbCategory.details === 'string') {
        insights = [gmbCategory.details];
      }
    }

    if (insights.length < 3) {
      const actionable = report.strategicInsights?.actionableImprovements;
      let extraInsights: string[] = [];
      if (Array.isArray(actionable)) {
        extraInsights = actionable.filter(tip => 
          typeof tip === 'string' && (
            tip.toLowerCase().includes('google') || 
            tip.toLowerCase().includes('local') || 
            tip.toLowerCase().includes('map') || 
            tip.toLowerCase().includes('gmb')
          )
        );
      } else if (typeof actionable === 'string') {
        extraInsights = [actionable];
      }
      
      insights = Array.from(new Set([...insights, ...extraInsights]));
    }
    
    if (insights.length < 3) {
      const fallbacks = [
        "Optimize business description with local high-intent keywords",
        "Upload high-resolution business photos weekly to increase engagement",
        "Respond to all reviews (positive and negative) within 24 hours"
      ];
      insights = Array.from(new Set([...insights, ...fallbacks]));
    }

    return insights.slice(0, 3);
  }, [report]);

  const topCompetitors = useMemo(() => {
    const list = Array.isArray(report?.competitorComparison) ? report.competitorComparison : [];
    return [...list]
      .sort((a, b) => (Number(b?.score) || 0) - (Number(a?.score) || 0))
      .slice(0, 2);
  }, [report]);

  return (
    <div className={`surface p-6 relative overflow-hidden group border border-slate-100 dark:border-slate-800 transition-all duration-500 ${showDeepDive ? 'ring-2 ring-emerald-500/20' : ''}`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-emerald-500/10" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
            <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Search Visibility</h3>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">GMB Signal Strength</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{gmbScore}%</div>
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Market Match</p>
        </div>
      </div>

      <div className="space-y-6 relative z-10">
        {/* Map Insights Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-3 h-3 text-indigo-500" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Map Insights Summary</p>
          </div>
          <div className="space-y-3">
            {mapInsights.map((tip, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-start gap-3 group/tip"
              >
                <div className="mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 opacity-60 group-hover/tip:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400 leading-relaxed group-hover/tip:text-slate-900 dark:group-hover/tip:text-white transition-colors">
                  {tip}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Competitor Analysis Section */}
        <div className="space-y-3 border-t border-slate-50 dark:border-slate-800 pt-4">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-3 h-3 text-rose-500" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Competitor Benchmarking</p>
          </div>
          
          {topCompetitors.length > 0 ? (
            <div className="grid grid-cols-1 gap-2">
              {topCompetitors.map((comp, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-white dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-100 dark:border-slate-700">
                      {(comp?.name || '').charAt(0)}
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[150px]">{comp?.name || 'Competitor'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-slate-900 dark:text-white">{comp.score}</span>
                    <div className={`inline-flex items-center gap-1 ${comp.trend === 'up' ? 'text-emerald-500' : comp.trend === 'down' ? 'text-rose-500' : 'text-slate-400'}`}>
                      {comp.trend === 'up' ? <TrendingUp className="w-2.5 h-2.5" /> : comp.trend === 'down' ? <TrendingDown className="w-2.5 h-2.5 rotate-180" /> : <Minus className="w-2.5 h-2.5" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[10px] font-bold text-slate-400 uppercase italic">No regional rivals detected in this scan.</p>
          )}
        </div>

        {/* Deep Dive Toggle */}
        <AnimatePresence>
          {showDeepDive && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-slate-50 dark:border-slate-800 pt-4"
            >
              <div className="space-y-6">
                <div className="p-4 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                  <h4 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Shield className="w-3 h-3" /> Strategic Intelligence
                  </h4>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed italic">
                    "{report.strategicInsights?.recommendedNextMove || 'Focus on local signal propagation to bridge the market gap.'}"
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 dark:border-slate-800 pb-2">Full Rival Assessment</p>
                  <table className="w-full text-left">
                    <thead>
                      <tr>
                        <th className="pb-2 text-[9px] font-black text-slate-400 uppercase">Entity</th>
                        <th className="pb-2 text-center text-[9px] font-black text-slate-400 uppercase">Score</th>
                        <th className="pb-2 text-right text-[9px] font-black text-slate-400 uppercase">Trend</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                      {Array.isArray(report?.competitorComparison) && report.competitorComparison.map((comp, idx) => (
                        <tr key={idx} className="group/row">
                          <td className="py-2">
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{comp.name}</span>
                          </td>
                          <td className="py-2 text-center">
                            <span className="text-xs font-black text-slate-900 dark:text-white">{comp.score}</span>
                          </td>
                          <td className="py-2 text-right">
                             <div className={`inline-flex items-center gap-1 ${comp.trend === 'up' ? 'text-emerald-500' : comp.trend === 'down' ? 'text-rose-500' : 'text-slate-400'}`}>
                               {comp.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : comp.trend === 'down' ? <TrendingDown className="w-3 h-3 rotate-180" /> : <Minus className="w-3 h-3" />}
                             </div>
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-emerald-500/10">
                        <td className="py-2 pl-2 rounded-l-lg">
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tighter">YOU</span>
                        </td>
                        <td className="py-2 text-center">
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{report.overallScore}</span>
                        </td>
                        <td className="py-2 pr-2 text-right rounded-r-lg">
                          <Shield className="w-3 h-3 text-emerald-500" />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="space-y-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Visibility Breakdown</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="surface p-2 border border-slate-100 dark:border-slate-800">
                      <p className="text-[8px] font-black text-slate-400 uppercase">Brand Authority</p>
                      <p className="text-sm font-black text-slate-900 dark:text-white">{report.visibilityBreakdown?.brandAuthority || 0}%</p>
                    </div>
                    <div className="surface p-2 border border-slate-100 dark:border-slate-800">
                      <p className="text-[8px] font-black text-slate-400 uppercase">Content Strength</p>
                      <p className="text-sm font-black text-slate-900 dark:text-white">{report.visibilityBreakdown?.contentStrength || 0}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center relative z-10">
        <div className="flex -space-x-2">
          {topCompetitors.map((_, i) => (
            <div key={i} className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center">
              <Search className="w-3 h-3 text-slate-400" />
            </div>
          ))}
        </div>
        <button 
          onClick={() => setShowDeepDive(!showDeepDive)}
          className="flex items-center gap-2 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest group/btn transition-colors hover:text-emerald-700"
        >
          {showDeepDive ? 'Minimize View' : 'Execute Deep Dive'} 
          {showDeepDive ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3 animate-bounce" />}
        </button>
      </div>
    </div>
  );
};

export default SearchVisibilityWidget;
