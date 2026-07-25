import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Star, Swords, CheckCircle2 } from 'lucide-react';
import { storageService } from '../services/storageService';
import { VisibilityReport, User, SavedScan } from '../types';

interface ScanHistoryProps {
  user: User;
  isDarkMode: boolean;
  onSelectScan: (report: VisibilityReport, tab?: any, scanId?: string) => void;
  onRescan: (report: VisibilityReport, scanId: string) => void;
  onNewScan: () => void;
}

const ScanHistory: React.FC<ScanHistoryProps> = ({ user, isDarkMode, onSelectScan, onRescan, onNewScan }) => {
  const [scans, setScans] = useState<SavedScan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'businessName' | 'score' | 'timestamp'>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedScanType, setSelectedScanType] = useState<string>('all');
  const [selectedScanIds, setSelectedScanIds] = useState<Set<string>>(new Set());
  const [showComparison, setShowComparison] = useState(false);
  const [scanToDelete, setScanToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadWatchlist = () => {
      try {
        const stored = localStorage.getItem('ocula_competitor_watchlist');
        setWatchlist(stored ? JSON.parse(stored) : []);
      } catch (e) {
        console.error('Failed to load watchlist in ScanHistory:', e);
      }
    };
    loadWatchlist();

    window.addEventListener('ocula_watchlist_changed', loadWatchlist);
    return () => window.removeEventListener('ocula_watchlist_changed', loadWatchlist);
  }, []);

  const toggleWatchlist = (name: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const stored = localStorage.getItem('ocula_competitor_watchlist');
      let current: string[] = stored ? JSON.parse(stored) : [];
      const isAlreadyIn = current.includes(name);
      if (isAlreadyIn) {
        current = current.filter(x => x !== name);
        setToastMessage(`Removed "${name}" from Watchlist`);
      } else {
        current.push(name);
        setToastMessage(`Pinned "${name}" to Watchlist`);
      }
      localStorage.setItem('ocula_competitor_watchlist', JSON.stringify(current));
      setWatchlist(current);
      window.dispatchEvent(new Event('ocula_watchlist_changed'));

      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error('Failed to toggle watchlist item:', err);
    }
  };

  const isBookmarked = (name: string) => watchlist.includes(name);

  useEffect(() => {
    const fetchScans = async () => {
      const loadedScans = await storageService.getScans();
      setScans(loadedScans);
      setIsLoading(false);
    };
    fetchScans();
  }, []);

  const handleDelete = (id: string, businessName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setScanToDelete({ id, name: businessName });
  };

  const confirmDelete = async () => {
    if (!scanToDelete) return;
    const updated = await storageService.deleteScan(scanToDelete.id);
    setScans(updated);
    setScanToDelete(null);
    setSelectedScanIds(prev => {
      const next = new Set(prev);
      next.delete(scanToDelete.id);
      return next;
    });
  };

  const confirmBulkDelete = async () => {
    const updated = await storageService.deleteScans(Array.from(selectedScanIds));
    setScans(updated);
    setSelectedScanIds(new Set());
    setIsBulkDeleting(false);
  };

  const handleClearAll = async () => {
    setIsClearingAll(true);
  };

  const confirmClearAll = async () => {
    await storageService.clearAllScans();
    setScans([]);
    setSelectedScanIds(new Set());
    setIsClearingAll(false);
  };

  const toggleScanSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedScanIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredAndSortedScans = useMemo(() => {
    let result = [...scans];
    
    if (selectedScanType !== 'all') {
      result = result.filter(s => (s.report?.focusMode || 'standard') === selectedScanType);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => {
        const nameMatch = s.businessName.toLowerCase().includes(q);
        const mode = (s.report?.focusMode || 'standard').toLowerCase();
        const modeMatch = mode.includes(q) ||
          (mode === 'competitor' && ('rival analysis'.includes(q) || 'competitor'.includes(q))) ||
          (mode === 'market' && ('market radar'.includes(q) || 'market'.includes(q))) ||
          (mode === 'social' && ('social pulse'.includes(q) || 'social'.includes(q))) ||
          (mode === 'gmb' && ('gmb focus'.includes(q) || 'google my business'.includes(q))) ||
          (mode === 'standard' && ('standard scry'.includes(q) || 'standard'.includes(q)));
        return nameMatch || modeMatch;
      });
    }

    return result.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];
      
      if (sortField === 'score') {
        valA = Number(a.score) || 0;
        valB = Number(b.score) || 0;
      } else if (sortField === 'businessName') {
        valA = (valA || '').toLowerCase();
        valB = (valB || '').toLowerCase();
      } else if (sortField === 'timestamp') {
        valA = new Date(valA || 0).getTime();
        valB = new Date(valB || 0).getTime();
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [scans, searchQuery, selectedScanType, sortField, sortDirection]);

  const maxScore = useMemo(() => {
    if (filteredAndSortedScans.length === 0) return 0;
    return Math.max(...filteredAndSortedScans.map(s => Number(s.score) || 0));
  }, [filteredAndSortedScans]);

  const scanTypeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: scans.length };
    scans.forEach(s => {
      const mode = s.report?.focusMode || 'standard';
      counts[mode] = (counts[mode] || 0) + 1;
    });
    return counts;
  }, [scans]);

  const SCAN_TYPE_TABS = [
    { id: 'all', label: 'All Scan Types', icon: '🌐' },
    { id: 'standard', label: 'Standard Scry', icon: '⚡' },
    { id: 'competitor', label: 'Rival Analysis', icon: '⚔️' },
    { id: 'market', label: 'Market Radar', icon: '📡' },
    { id: 'social', label: 'Social Pulse', icon: '💬' },
    { id: 'gmb', label: 'GMB Focus', icon: '📍' },
  ];

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-5 space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl w-64"></div>
          <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-5 animate-fadeIn space-y-4">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 right-6 z-[1100] px-4 py-3 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white shadow-2xl border border-slate-700/80 flex items-center gap-3"
          >
            <div className="p-1 bg-amber-500/20 text-amber-400 rounded-lg">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
            <span className="text-xs font-bold tracking-wide">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modals */}
      <AnimatePresence>
        {scanToDelete && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="surface w-full max-w-md p-4 space-y-4"
            >
              <div className="text-center space-y-4">
                <div className="w-14 h-14 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-full flex items-center justify-center mx-auto text-2xl">⚠️</div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Delete Dossier?</h3>
                <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                  Are you sure you want to permanently delete the intelligence dossier for <span className="text-slate-900 dark:text-white font-black">"{scanToDelete.name}"</span>?
                </p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setScanToDelete(null)} className="flex-1 btn-secondary btn-sm">Abort</button>
                <button onClick={confirmDelete} className="flex-1 btn-base bg-rose-500 text-white shadow-sm hover:bg-rose-600 btn-sm">Confirm Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {isBulkDeleting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="surface w-full max-w-md p-4 space-y-4"
            >
              <div className="text-center space-y-4">
                <div className="w-14 h-14 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-full flex items-center justify-center mx-auto text-2xl">⚠️</div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Delete {selectedScanIds.size} Dossiers?</h3>
                <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                  Are you sure you want to permanently delete the selected intelligence dossiers? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setIsBulkDeleting(false)} className="flex-1 btn-secondary btn-sm">Abort</button>
                <button onClick={confirmBulkDelete} className="flex-1 btn-base bg-rose-500 text-white shadow-sm hover:bg-rose-600 btn-sm">Confirm Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {isClearingAll && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="surface w-full max-w-md p-4 space-y-4"
            >
              <div className="text-center space-y-4">
                <div className="w-14 h-14 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-full flex items-center justify-center mx-auto text-2xl">⚠️</div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Clear All History?</h3>
                <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                  Are you sure you want to permanently delete ALL intelligence dossiers? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setIsClearingAll(false)} className="flex-1 btn-secondary btn-sm">Abort</button>
                <button onClick={confirmClearAll} className="flex-1 btn-base bg-rose-500 text-white shadow-sm hover:bg-rose-600 btn-sm">Confirm Clear All</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Bar for Selection */}
      <AnimatePresence>
        {selectedScanIds.size > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-slate-900 dark:bg-slate-800 text-white px-6 py-4 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-black text-sm">
                {selectedScanIds.size}
              </div>
              <span className="text-sm font-bold tracking-wide">Dossiers Selected</span>
            </div>
            <div className="w-px h-8 bg-slate-700"></div>
            <div className="flex items-center gap-3">
              {selectedScanIds.size >= 2 && selectedScanIds.size <= 4 && (
                <button 
                  onClick={() => setShowComparison(true)}
                  className="btn-primary btn-sm bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20"
                >
                  Compare
                </button>
              )}
              <button 
                onClick={() => setIsBulkDeleting(true)}
                className="btn-secondary btn-sm bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border-rose-500/20"
              >
                Delete Selected
              </button>
              <button 
                onClick={() => setSelectedScanIds(new Set())}
                className="btn-secondary btn-sm text-slate-400 hover:text-white"
              >
                Clear Selection
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
         <div className="flex flex-col md:flex-row md:items-center gap-4">
           <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
               <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             </div>
             <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight shrink-0">
               Scan History
             </h3>
           </div>
           <div className="h-1 flex-grow bg-slate-100 dark:bg-slate-800 rounded-full hidden md:block"></div>
           
           {/* Search Bar */}
           <div className="relative w-full md:w-64 group">
             <input
               type="text"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               placeholder="Search dossiers..."
               className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500/30 outline-none transition-all placeholder:text-slate-400"
             />
             <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
             </svg>
           </div>

           {/* Sorting Controls */}
           <div className="flex flex-wrap items-center gap-3">
             <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
               <span className="pl-2 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest hidden sm:inline">Sort By:</span>
               {[
                 { id: 'timestamp', label: 'Date' },
                 { id: 'businessName', label: 'Name' },
                 { id: 'score', label: 'Score' }
               ].map((f) => (
                 <button
                   key={f.id}
                   onClick={() => {
                     if (sortField === f.id) {
                       setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                     } else {
                       setSortField(f.id as any);
                       setSortDirection('desc');
                     }
                   }}
                   className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${sortField === f.id ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                 >
                   {f.label}
                 </button>
               ))}
             </div>
             
             <button
               onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
               className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-all flex items-center gap-2 shadow-sm"
               title={sortDirection === 'asc' ? 'Switch to Descending' : 'Switch to Ascending'}
             >
               <svg className={`w-4 h-4 transition-transform duration-300 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
               </svg>
               {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
             </button>
           </div>

           {scans.length > 0 && (
              <button 
                onClick={handleClearAll} 
                className="flex items-center gap-2 px-4 py-2 bg-rose-50 dark:bg-rose-900/20 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-rose-100 dark:border-rose-900/30 group/clear"
              >
                <svg className="w-3.5 h-3.5 transition-transform group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear All Scans
              </button>
           )}
           <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest shrink-0">{scans.length} Dossiers</p>
         </div>

         {/* Scan Type Filter Tabs */}
         {scans.length > 0 && (
           <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
             <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest shrink-0 mr-1">Filter Type:</span>
             {SCAN_TYPE_TABS.map(tab => {
               const count = scanTypeCounts[tab.id] || 0;
               const isActive = selectedScanType === tab.id;
               return (
                 <button
                   key={tab.id}
                   onClick={() => setSelectedScanType(tab.id)}
                   className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 border ${
                     isActive
                       ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20 scale-105'
                       : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-100 dark:border-slate-800 hover:border-blue-300'
                   }`}
                 >
                   <span>{tab.icon}</span>
                   <span>{tab.label}</span>
                   <span className={`px-1.5 py-0.2 rounded-md text-[8px] font-mono ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                     {count}
                   </span>
                 </button>
               );
             })}
           </div>
         )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {filteredAndSortedScans.length > 0 ? filteredAndSortedScans.map((scan, idx) => {
              const isTopPerformer = scan.score === maxScore && maxScore > 0;
              const isSelected = selectedScanIds.has(scan.id);
              return (
                <div 
                  key={scan.id} 
                  onClick={() => onSelectScan(scan.report, 'overview', scan.id)} 
                  className={`surface p-4 rounded-xl shadow-sm border flex flex-col md:flex-row items-center justify-between group transition-all hover:shadow-md cursor-pointer relative overflow-hidden ${isSelected ? 'border-blue-500 ring-2 ring-blue-50 dark:ring-blue-900/20' : isTopPerformer ? 'border-emerald-200 dark:border-emerald-900/30' : 'border-slate-200 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800'}`}
                >
                  {isTopPerformer && (
                    <div className="absolute top-0 right-0 z-20">
                      <div className="bg-emerald-500 text-white text-[8px] font-black px-4 py-2 rounded-bl-3xl uppercase tracking-[0.2em] shadow-sm flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                        Top Performer
                      </div>
                    </div>
                  )}
                  <div className="flex items-center space-x-8 mb-4 md:mb-0 w-full md:w-auto relative z-10">
                    <div 
                      onClick={(e) => toggleScanSelection(scan.id, e)}
                      className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-transparent hover:border-blue-300'}`}
                    >
                      <span className="text-xs font-black">✓</span>
                    </div>
                    <div className={`w-14 h-14 rounded-[1.5rem] flex flex-col items-center justify-center font-black transition-all border ${isTopPerformer ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50' : 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 group-hover:bg-slate-100 dark:group-hover:bg-slate-700 border-slate-200 dark:border-slate-700'}`}>
                       <span className="stat-value text-slate-900 dark:text-white">{Number(scan.score) || 0}</span>
                       <span className="text-[7px] uppercase tracking-tighter opacity-40">INDEX</span>
                    </div>
                    <div className="text-left">
                       <div className="flex items-center gap-2 flex-wrap">
                         <h4 className={`text-2xl font-black tracking-tight transition-colors ${isTopPerformer ? 'text-emerald-900 dark:text-emerald-300' : 'text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`}>{scan.businessName}</h4>
                         <button
                           type="button"
                           onClick={(e) => toggleWatchlist(scan.businessName, e)}
                           className={`p-1.5 px-2.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 text-[10px] font-bold ${
                             isBookmarked(scan.businessName)
                               ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 dark:bg-amber-500/20 shadow-2xs'
                               : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 border-slate-200 dark:border-slate-700'
                           }`}
                           title={isBookmarked(scan.businessName) ? `Unpin ${scan.businessName} from Watchlist` : `Bookmark ${scan.businessName} to Watchlist`}
                         >
                           <Bookmark className={`w-3.5 h-3.5 ${isBookmarked(scan.businessName) ? 'fill-amber-500 text-amber-500' : ''}`} />
                           <span className="text-[9px] font-black uppercase tracking-wider">
                             {isBookmarked(scan.businessName) ? 'Pinned' : 'Pin'}
                           </span>
                         </button>
                       </div>
                       <div className="flex flex-wrap items-center gap-2 mt-2">
                         <span className={`text-[8px] font-black uppercase px-2.5 py-1 rounded-lg border flex items-center gap-1.5 shadow-xs ${
                           scan.report.focusMode === 'competitor' ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800' :
                           scan.report.focusMode === 'market' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800' :
                           scan.report.focusMode === 'social' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800' :
                           scan.report.focusMode === 'gmb' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' :
                           'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                         }`}>
                           <span>
                             {scan.report.focusMode === 'competitor' ? '⚔️' :
                              scan.report.focusMode === 'market' ? '📡' :
                              scan.report.focusMode === 'social' ? '💬' :
                              scan.report.focusMode === 'gmb' ? '📍' :
                              '⚡'}
                           </span>
                           <span>
                             {scan.report.focusMode === 'competitor' ? 'Rival Analysis' :
                              scan.report.focusMode === 'market' ? 'Market Radar' :
                              scan.report.focusMode === 'social' ? 'Social Pulse' :
                              scan.report.focusMode === 'gmb' ? 'GMB Focus' :
                              'Standard Scry'}
                           </span>
                         </span>
                         <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                           {new Date(scan.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                         </p>
                       </div>

                       {/* Competitor Entity Bookmark Chips */}
                       {scan.report.competitorComparison && scan.report.competitorComparison.length > 0 && (
                         <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                           <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1">
                             <Swords className="w-2.5 h-2.5 text-indigo-500" /> Rivals:
                           </span>
                           {scan.report.competitorComparison.slice(0, 3).map((comp, cIdx) => {
                             const bookmarked = isBookmarked(comp.name);
                             return (
                               <button
                                 key={cIdx}
                                 type="button"
                                 onClick={(e) => toggleWatchlist(comp.name, e)}
                                 className={`px-2 py-0.5 rounded-md text-[9px] font-bold flex items-center gap-1 border transition-all cursor-pointer ${
                                   bookmarked 
                                     ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' 
                                     : 'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700/80 hover:border-amber-400'
                                 }`}
                                 title={bookmarked ? `Unpin ${comp.name} from Watchlist` : `Bookmark ${comp.name} to Watchlist`}
                               >
                                 <Bookmark className={`w-2.5 h-2.5 ${bookmarked ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
                                 <span className="truncate max-w-[90px]">{comp.name}</span>
                               </button>
                             );
                           })}
                           {scan.report.competitorComparison.length > 3 && (
                             <span className="text-[8px] font-mono text-slate-400 dark:text-slate-500">
                               +{scan.report.competitorComparison.length - 3} more
                             </span>
                           )}
                         </div>
                       )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-12 w-full md:w-auto justify-end relative z-10">
                    <div className="flex flex-col items-end space-y-3">
                       <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest"><span className="font-mono">{(scan.report.campaigns?.length || 0)}</span> Missions Active</span>
                       <div className="flex -space-x-2">
                          {(scan.report.campaigns || []).slice(0, 5).map((m, i) => (
                            <div key={i} className="w-6 h-6 rounded-lg border-2 border-white dark:border-slate-900 bg-blue-600 shadow-sm" title={m.name}></div>
                          ))}
                          {(scan.report.campaigns?.length || 0) > 5 && (
                            <div className="w-6 h-6 rounded-lg border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700 text-[8px] font-black flex items-center justify-center text-slate-600 dark:text-slate-300 font-mono">
                              +{(scan.report.campaigns?.length || 0) - 5}
                            </div>
                          )}
                       </div>
                    </div>

                    {/* Rescan Button */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); onRescan(scan.report, scan.id); }} 
                      className="btn-icon p-4 rounded-xl hover:bg-blue-500 hover:text-white"
                      title="Rescan with same parameters"
                    >
                       <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                       </svg>
                    </button>

                    {/* Prominent Delete Button */}
                    <button 
                      onClick={(e) => handleDelete(scan.id, scan.businessName, e)} 
                      className="btn-icon p-4 rounded-xl hover:bg-rose-500 hover:text-white"
                      title="Delete Intelligence Record"
                    >
                       <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                       </svg>
                    </button>
                  </div>
                </div>
              );
            }) : (
              <div className="py-32 text-center surface border-4 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center space-y-4 animate-in">
                 <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-2xl shadow-inner">🗂️</div>
                 <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.4em]">No Vision Scry records identified.</p>
                    <p className="text-slate-400 dark:text-slate-500 font-medium">Clear your schedule and scry your first market.</p>
                 </div>
                 <button 
                  onClick={() => onNewScan()} 
                  className="btn-primary btn-lg bg-[#1e40af] dark:bg-blue-600"
                 >
                   Scry
                 </button>
              </div>
            )}
         </div>
      </div>

      {/* Comparison Modal */}
      <AnimatePresence>
        {showComparison && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-2xl"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="surface w-full max-w-7xl flex flex-col h-[90vh] overflow-hidden"
            >
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                  <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em]">Cross-Dossier Benchmark Analysis</p>
                </div>
                <h3 className="text-2xl font-display font-medium text-slate-900 dark:text-white tracking-tight">Comparing {selectedScanIds.size} Entities</h3>
              </div>
              <button 
                onClick={() => setShowComparison(false)}
                className="btn-icon p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from(selectedScanIds).map(id => {
                  const scan = scans.find(s => s.id === id);
                  if (!scan) return null;
                  return (
                    <div key={scan.id} className="surface p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col h-full">
                      <div className="mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                        <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-2">{scan.businessName}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-3xl font-black text-blue-600 dark:text-blue-400">{Number(scan.score) || 0}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Score</span>
                        </div>
                      </div>
                      <div className="space-y-4 flex-1">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Key Strengths</p>
                          <ul className="space-y-2">
                            {scan.report.swotAnalysis?.strengths.slice(0, 3).map((s, i) => (
                              <li key={i} className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-start gap-2">
                                <span className="text-emerald-500 mt-0.5">✓</span>
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Vulnerabilities</p>
                          <ul className="space-y-2">
                            {scan.report.swotAnalysis?.weaknesses.slice(0, 3).map((w, i) => (
                              <li key={i} className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-start gap-2">
                                <span className="text-rose-500 mt-0.5">!</span>
                                {w}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <button 
                        onClick={() => { setShowComparison(false); onSelectScan(scan.report, 'overview', scan.id); }}
                        className="mt-6 w-full btn-secondary btn-sm"
                      >
                        View Full Dossier
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScanHistory;
