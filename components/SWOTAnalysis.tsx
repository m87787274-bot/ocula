import React from 'react';
import { SWOTAnalysis as SWOTType } from '../types';

interface SWOTAnalysisProps {
  swot: SWOTType | undefined;
  isCompact?: boolean;
  isDarkMode?: boolean;
  variant?: 'widget' | 'dossier';
  isFullAccess?: boolean;
}

const SWOTAnalysis: React.FC<SWOTAnalysisProps> = React.memo(({ swot, isCompact = false, isDarkMode = false, variant = 'widget', isFullAccess = true }) => {
  if (!swot) return null;

  const categories = [
    {
      key: 'strengths',
      label: 'Strengths',
      short: 'S',
      icon: '✓',
      color: 'emerald',
      bg: 'bg-emerald-50 dark:bg-emerald-900/10',
      border: 'border-emerald-100 dark:border-emerald-800/30',
      text: 'text-emerald-700 dark:text-emerald-400',
      bullet: 'text-emerald-500',
      dossierBg: 'bg-emerald-50/50 dark:bg-emerald-900/10',
      dossierBorder: 'border-emerald-100 dark:border-emerald-800/30',
      dossierText: 'text-emerald-700 dark:text-emerald-400',
      dossierIndicator: 'bg-emerald-500',
      svgIcon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )
    },
    {
      key: 'weaknesses',
      label: 'Weaknesses',
      short: 'W',
      icon: '!',
      color: 'rose',
      bg: 'bg-rose-50 dark:bg-rose-900/10',
      border: 'border-rose-100 dark:border-rose-800/30',
      text: 'text-rose-700 dark:text-rose-400',
      bullet: 'text-rose-500',
      dossierBg: 'bg-rose-50/50 dark:bg-rose-900/10',
      dossierBorder: 'border-rose-100 dark:border-rose-800/30',
      dossierText: 'text-rose-700 dark:text-rose-400',
      dossierIndicator: 'bg-rose-500',
      svgIcon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    {
      key: 'opportunities',
      label: 'Opportunities',
      short: 'O',
      icon: '→',
      color: 'indigo',
      bg: 'bg-indigo-50 dark:bg-indigo-900/10',
      border: 'border-indigo-100 dark:border-indigo-800/30',
      text: 'text-indigo-700 dark:text-indigo-400',
      bullet: 'text-indigo-500',
      dossierBg: 'bg-indigo-50/50 dark:bg-indigo-900/10',
      dossierBorder: 'border-indigo-100 dark:border-indigo-800/30',
      dossierText: 'text-indigo-700 dark:text-indigo-400',
      dossierIndicator: 'bg-indigo-500',
      svgIcon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    },
    {
      key: 'threats',
      label: 'Threats',
      short: 'T',
      icon: '×',
      color: 'slate',
      bg: 'bg-slate-100 dark:bg-slate-800/30',
      border: 'border-slate-200 dark:border-slate-700/50',
      text: 'text-slate-600 dark:text-slate-400',
      bullet: 'text-slate-500',
      dossierBg: 'bg-slate-100/50 dark:bg-slate-800/30',
      dossierBorder: 'border-slate-200 dark:border-slate-700/50',
      dossierText: 'text-slate-600 dark:text-slate-400',
      dossierIndicator: 'bg-slate-500',
      svgIcon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )
    }
  ];

  if (variant === 'dossier') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat) => {
          const items = swot[cat.key as keyof SWOTType] || [];
          const displayedItems = isFullAccess ? items : items.slice(0, 2);
          
          return (
            <div key={cat.key} className={`p-4 rounded-xl border ${cat.dossierBorder} ${cat.dossierBg} relative overflow-hidden transition-all hover:shadow-lg group`}>
              <div className={`absolute top-0 right-0 p-4 text-9xl font-black opacity-5 pointer-events-none select-none ${cat.dossierText}`}>
                {cat.short}
              </div>
              
              <div className="relative z-10">
                <h4 className={`text-xs font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-3 ${cat.dossierText}`}>
                  <span className={`w-2 h-2 rounded-full ${cat.dossierIndicator} shadow-sm`}></span>
                  {cat.label}
                </h4>
                
                <ul className="space-y-4">
                  {displayedItems.map((item, idx) => (
                    <li key={`${item}-${idx}`} className="flex items-start gap-4 group/item">
                      <div className={`mt-0.5 p-1.5 rounded-lg bg-white/50 dark:bg-black/20 ${cat.bullet} transition-colors group-hover/item:bg-white dark:group-hover/item:bg-black/40`}>
                        {cat.svgIcon}
                      </div>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed">{item}</span>
                    </li>
                  ))}
                  {!isFullAccess && items.length > 2 && (
                    <li className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-4 flex items-center gap-2 pl-2">
                      <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                      Upgrade to unlock {items.length - 2} more insights
                    </li>
                  )}
                  {displayedItems.length === 0 && (
                    <li className="text-xs italic text-slate-400 py-2">No {cat.label.toLowerCase()} identified.</li>
                  )}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`grid ${isCompact ? 'grid-cols-2 sm:grid-cols-4 gap-3' : 'grid-cols-1 sm:grid-cols-2 gap-4'}`}>
      {categories.map((cat) => {
        const items = swot[cat.key as keyof SWOTType] || [];
        const displayedItems = isFullAccess ? items : items.slice(0, 2);
        
        return (
          <div key={cat.key} className={`p-4 rounded-xl border ${cat.border} ${cat.bg} transition-all hover:shadow-md group/swot hover:-translate-y-0.5`}>
            <div className="flex items-center justify-between mb-4">
              <span className={`text-[10px] font-black uppercase tracking-widest ${cat.text}`}>{cat.label}</span>
              <span className={`${cat.bullet} opacity-50 group-hover/swot:opacity-100 transition-opacity`}>{cat.svgIcon}</span>
            </div>
            
            {!isCompact ? (
              <ul className="space-y-3">
                {displayedItems.map((item, idx) => (
                  <li key={`${item}-${idx}`} className="flex items-start gap-2.5">
                    <span className={`mt-1.5 w-1 h-1 rounded-full ${cat.dossierIndicator} shrink-0 opacity-60`}></span>
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 leading-snug">{item}</span>
                  </li>
                ))}
                {!isFullAccess && items.length > 2 && (
                  <li className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-3 pl-3.5">
                    + {items.length - 2} more
                  </li>
                )}
                {displayedItems.length === 0 && (
                  <li className="text-[10px] italic text-slate-400">None identified</li>
                )}
              </ul>
            ) : (
              <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-black ${cat.text}`}>{items.length}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Items</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});

export default SWOTAnalysis;
