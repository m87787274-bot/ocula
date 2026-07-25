
import React from 'react';

interface KeywordVennProps {
  uniqueToSelf: string[];
  overlapping: string[];
  uniqueToRival: string[];
  selfName: string;
  rivalName: string;
}

const KeywordVenn: React.FC<KeywordVennProps> = ({ 
  uniqueToSelf, 
  overlapping, 
  uniqueToRival,
  selfName,
  rivalName
}) => {
  return (
    <div className="w-full py-5">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-11 gap-4 items-stretch">
        
        {/* Self Territory */}
        <div className="lg:col-span-4 surface/50 border border-indigo-100 dark:border-indigo-900/30 rounded-xl p-4 flex flex-col transition-all hover:shadow-xl hover:border-indigo-200 dark:hover:border-indigo-800/50 group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 to-indigo-600 opacity-50"></div>
          <div className="absolute -right-10 -top-4 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="mb-4 relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.6)] ring-2 ring-indigo-100 dark:ring-indigo-900"></div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">{selfName}</h4>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">{uniqueToSelf.length}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unique Signals</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 overflow-y-auto custom-scrollbar max-h-[280px] content-start relative z-10 pr-2">
            {uniqueToSelf.length > 0 ? uniqueToSelf.map((kw) => (
              <span key={kw} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold rounded-lg border border-indigo-100 dark:border-indigo-800 hover:scale-105 transition-transform cursor-default break-words max-w-full">
                {kw}
              </span>
            )) : (
              <div className="flex flex-col items-center justify-center py-5 w-full opacity-40">
                <div className="w-12 h-12 border-2 border-dashed border-indigo-300 rounded-full mb-3"></div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">No Unique Data</p>
              </div>
            )}
          </div>
        </div>

        {/* Overlap Area (Battleground) */}
        <div className="lg:col-span-3 lg:-mx-6 z-20 bg-slate-900 dark:bg-black shadow-2xl shadow-slate-900/50 rounded-xl flex flex-col p-1 border-[6px] border-white dark:border-slate-800 animate-scaleIn ring-1 ring-slate-200 dark:ring-slate-700 min-h-[600px] relative">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 rounded-xl"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-950 rounded-xl"></div>
          
          <div className="relative z-10 flex flex-col h-full p-4">
            <div className="text-center mb-4 relative">
              <div className="absolute -top-14 left-1/2 -translate-x-1/2 w-12 h-12 bg-slate-900 dark:bg-black border-[6px] border-white dark:border-slate-800 rounded-xl flex items-center justify-center shadow-xl rotate-45 z-30">
                <div className="-rotate-45">
                  <span className="text-white text-sm font-black tracking-tighter">VS</span>
                </div>
              </div>
              
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full mb-4 border border-white/10 mt-4 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></span>
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Battleground</span>
              </div>
              
              <h4 className="text-lg font-black text-white uppercase tracking-[0.3em] mb-2">Contested</h4>
              <div className="h-1 w-12 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 mx-auto rounded-full mb-4"></div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{overlapping.length} Active Conflicts</p>
            </div>
            
            <div className="flex flex-col gap-2 overflow-y-auto custom-scrollbar flex-grow px-1 content-start -mx-2">
              {overlapping.length > 0 ? overlapping.map((kw) => (
                <div 
                  key={kw} 
                  className="group/kw relative px-4 py-3 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[10px] font-bold rounded-xl border border-white/5 hover:border-white/20 transition-all cursor-default flex items-center gap-3 break-words backdrop-blur-sm"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-rose-500 shrink-0 shadow-[0_0_8px_rgba(168,85,247,0.5)]"></div>
                  <span className="leading-relaxed">{kw}</span>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center h-full w-full text-center space-y-4 opacity-30">
                  <div className="w-12 h-12 border-2 border-dashed border-slate-600 rounded-full flex items-center justify-center">
                    <span className="text-slate-500 text-xl font-black">?</span>
                  </div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">No Direct Conflicts</p>
                </div>
              )}
            </div>
            
            <div className="mt-4 pt-6 border-t border-white/5 text-center">
              <div className="flex justify-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">You</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Rival</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rival Territory */}
        <div className="lg:col-span-4 surface/50 border border-rose-100 dark:border-rose-900/30 rounded-xl p-4 flex flex-col items-end text-right transition-all hover:shadow-xl hover:border-rose-200 dark:hover:border-rose-800/50 group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-400 to-rose-600 opacity-50"></div>
          <div className="absolute -left-10 -top-4 w-40 h-40 bg-rose-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="mb-4 relative z-10">
            <div className="flex items-center gap-3 justify-end mb-3">
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">{rivalName}</h4>
              <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.6)] ring-2 ring-rose-100 dark:ring-rose-900"></div>
            </div>
            <div className="flex items-baseline gap-2 justify-end">
              <span className="text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tighter">{uniqueToRival.length}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rival Signals</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 justify-end overflow-y-auto custom-scrollbar max-h-[280px] content-start relative z-10 pl-2">
            {uniqueToRival.length > 0 ? uniqueToRival.map((kw) => (
              <span key={kw} className="px-3 py-1.5 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 text-[10px] font-bold rounded-lg border border-rose-100 dark:border-rose-800 hover:scale-105 transition-transform cursor-default break-words max-w-full">
                {kw}
              </span>
            )) : (
              <div className="flex flex-col items-center justify-center py-5 w-full opacity-40">
                <div className="w-12 h-12 border-2 border-dashed border-rose-300 rounded-full mb-3"></div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400">No Unique Data</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default KeywordVenn;
