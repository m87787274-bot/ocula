import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, Users, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface FilterState {
  keywordSearch: string;
  keywordDifficulty: 'all' | 'high' | 'medium' | 'low';
  selectedCompetitors: string[];
  dateRange: '7d' | '30d' | '90d' | 'all';
}

interface DashboardFiltersProps {
  competitors: string[];
  onFilterChange: (filters: FilterState) => void;
  initialFilters?: Partial<FilterState>;
}

const DashboardFilters: React.FC<DashboardFiltersProps> = React.memo(({ 
  competitors, 
  onFilterChange,
  initialFilters 
}) => {
  const [filters, setFilters] = useState<FilterState>({
    keywordSearch: initialFilters?.keywordSearch || '',
    keywordDifficulty: initialFilters?.keywordDifficulty || 'all',
    selectedCompetitors: initialFilters?.selectedCompetitors || [],
    dateRange: initialFilters?.dateRange || 'all',
  });

  const [isCompetitorDropdownOpen, setIsCompetitorDropdownOpen] = useState(false);

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleKeywordSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, keywordSearch: e.target.value }));
  };

  const handleDifficultyChange = (difficulty: FilterState['keywordDifficulty']) => {
    setFilters(prev => ({ ...prev, keywordDifficulty: difficulty }));
  };

  const toggleCompetitor = (competitor: string) => {
    setFilters(prev => {
      const current = prev.selectedCompetitors;
      const isSelected = current.includes(competitor);
      let newSelected;
      if (isSelected) {
        newSelected = current.filter(c => c !== competitor);
      } else {
        newSelected = [...current, competitor];
      }
      return { ...prev, selectedCompetitors: newSelected };
    });
  };

  const handleDateRangeChange = (range: FilterState['dateRange']) => {
    setFilters(prev => ({ ...prev, dateRange: range }));
  };

  const clearFilters = () => {
    setFilters({
      keywordSearch: '',
      keywordDifficulty: 'all',
      selectedCompetitors: [],
      dateRange: 'all',
    });
  };

  const activeFilterCount = (filters.keywordSearch ? 1 : 0) + 
    (filters.keywordDifficulty !== 'all' ? 1 : 0) + 
    (filters.selectedCompetitors.length > 0 ? 1 : 0) + 
    (filters.dateRange !== 'all' ? 1 : 0);

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        
        {/* Left: Search & Primary Filters */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          
          {/* Keyword Search */}
          <div className="relative group w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Filter keywords..."
              value={filters.keywordSearch}
              onChange={handleKeywordSearchChange}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
            />
            {filters.keywordSearch && (
              <button 
                onClick={() => setFilters(prev => ({ ...prev, keywordSearch: '' }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Difficulty Filter */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {(['all', 'high', 'medium', 'low'] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => handleDifficultyChange(diff)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  filters.keywordDifficulty === diff
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Advanced Filters */}
        <div className="flex flex-wrap gap-3 w-full lg:w-auto items-center">
          
          {/* Competitor Selector */}
          <div className="relative">
            <button
              onClick={() => setIsCompetitorDropdownOpen(!isCompetitorDropdownOpen)}
              className={`btn-secondary btn-sm gap-2 ${
                filters.selectedCompetitors.length > 0
                  ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white'
                  : ''
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Competitors</span>
              {filters.selectedCompetitors.length > 0 && (
                <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {filters.selectedCompetitors.length}
                </span>
              )}
            </button>

            <AnimatePresence>
              {isCompetitorDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsCompetitorDropdownOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-64 surface rounded-xl shadow-xl z-50 p-2"
                  >
                    <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-1">
                      {competitors.map((comp) => (
                        <button
                          key={comp}
                          onClick={() => toggleCompetitor(comp)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                            filters.selectedCompetitors.includes(comp)
                              ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span className="truncate">{comp}</span>
                          {filters.selectedCompetitors.includes(comp) && (
                            <Check className="w-3 h-3" />
                          )}
                        </button>
                      ))}
                      {competitors.length === 0 && (
                        <div className="px-3 py-4 text-center text-xs text-slate-400">
                          No competitors found
                        </div>
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Date Range */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
            {(['7d', '30d', '90d', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => handleDateRangeChange(range)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  filters.dateRange === range
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Clear Filters */}
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="btn-ghost btn-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

export default DashboardFilters;
