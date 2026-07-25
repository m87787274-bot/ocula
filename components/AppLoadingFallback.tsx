
import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Activity, Target, PieChart, Layers, Search, MapPin, Globe } from 'lucide-react';

const AppLoadingFallback: React.FC = () => {
  return (
    <div className="w-full h-full min-h-[100vh] flex flex-col p-6 space-y-8 animate-in fade-in duration-700 bg-slate-50/50 dark:bg-[#050505]/50">
      {/* Top Header Skeleton */}
      <div className="flex justify-between items-end mb-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-indigo-600/10 dark:bg-white/10 animate-pulse flex items-center justify-center">
                <Search className="w-4 h-4 text-indigo-600 dark:text-indigo-400 opacity-20" />
             </div>
             <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
          </div>
          <div className="h-3 w-40 bg-slate-100 dark:bg-slate-900 rounded-full animate-pulse ml-11" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
          <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
        </div>
      </div>

      {/* Hero Stats Skeleton Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Activity, color: 'text-indigo-500' },
          { icon: Globe, color: 'text-emerald-500' },
          { icon: Target, color: 'text-rose-500' },
          { icon: Layers, color: 'text-amber-500' }
        ].map((config, i) => (
          <div key={i} className="surface p-6 space-y-4 border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-slate-100 dark:bg-slate-800/50 rounded-bl-full opacity-50" />
            <div className="flex justify-between items-start relative z-10">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse flex items-center justify-center">
                <config.icon className={`w-5 h-5 ${config.color} opacity-20`} />
              </div>
              <div className="w-12 h-4 bg-slate-50 dark:bg-slate-900 rounded-full animate-pulse" />
            </div>
            <div className="space-y-2 relative z-10">
              <div className="h-3 w-16 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse" />
              <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Skeleton Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="surface h-[400px] border border-slate-100 dark:border-slate-800 relative overflow-hidden">
             {/* Abstract Chart Skeleton */}
             <div className="absolute inset-0 p-8 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
                      <div className="h-4 w-4 bg-slate-100 dark:bg-slate-900 rounded-full animate-pulse" />
                      <div className="h-4 w-24 bg-slate-100 dark:bg-slate-900 rounded-full animate-pulse" />
                   </div>
                   <div className="flex gap-2">
                       <div className="h-2 w-8 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse" />
                       <div className="h-2 w-8 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
                   </div>
                </div>
                <div className="flex-1 flex items-end gap-3 pt-12">
                   {[40, 70, 45, 90, 65, 30, 85, 40, 60, 75, 55, 95].map((h, idx) => (
                     <motion.div 
                        key={idx}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ duration: 1.2, delay: idx * 0.04, ease: "easeOut" }}
                        className="flex-1 bg-gradient-to-t from-slate-100/50 to-slate-200 dark:from-slate-800/50 dark:to-slate-700 rounded-t-lg relative"
                     >
                        <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 dark:bg-white/5 rounded-full" />
                     </motion.div>
                   ))}
                </div>
             </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="surface h-48 border border-slate-100 dark:border-slate-800 p-6 space-y-4">
                 <div className="flex items-center gap-2">
                    <div className="w-1 h-4 bg-indigo-500 rounded-full" />
                    <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
                 </div>
                 <div className="space-y-3">
                    <div className="h-3 w-full bg-slate-100 dark:bg-slate-900 rounded-full animate-pulse" />
                    <div className="h-3 w-full bg-slate-100 dark:bg-slate-900 rounded-full animate-pulse" />
                    <div className="h-3 w-2/3 bg-slate-100 dark:bg-slate-900 rounded-full animate-pulse" />
                 </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="surface p-6 border border-slate-100 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
               <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
               <div className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse" />
            </div>
            <div className="space-y-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 animate-pulse shrink-0 flex items-center justify-center">
                     <LayoutDashboard className="w-4 h-4 text-slate-300 dark:text-slate-700" />
                  </div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 w-2/3 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-900 rounded-full animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="surface p-6 border border-slate-100 dark:border-slate-800 bg-gradient-to-br from-indigo-50/30 to-slate-50/30 dark:from-indigo-900/10 dark:to-slate-900/10">
             <div className="flex items-center gap-2 mb-6">
                <PieChart className="w-4 h-4 text-indigo-500 opacity-30" />
                <div className="h-4 w-32 bg-indigo-200 dark:bg-indigo-800 rounded-full animate-pulse" />
             </div>
             <div className="aspect-square rounded-full border-8 border-slate-100 dark:border-slate-800 relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 border-[16px] border-indigo-500/10 rounded-full animate-spin-slow" />
                <div className="w-1/2 h-1/2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 animate-pulse shadow-inner" />
             </div>
          </div>
        </div>
      </div>
      
      {/* Floating loading indicator */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-8 right-8 flex items-center gap-3 glass dark:dark-glass px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden group"
      >
        <div className="absolute inset-0 bg-indigo-500/5 group-hover:bg-indigo-500/10 transition-colors" />
        <div className="relative flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">Synchronizing Ocula Intelligence</span>
        </div>
      </motion.div>
    </div>
  );
};

export default AppLoadingFallback;
