import React, { useState, useEffect, useRef } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout/legacy';
import type { Layout, LayoutItem, ResponsiveLayouts } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const useContainerWidth = () => {
  const [width, setWidth] = useState(1200);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return { width, containerRef, mounted };
};
import { KPI } from '../types';
import { Sparkles, TrendingUp, TrendingDown, Minus, Edit2, Trash2, Loader2, Plus, LayoutGrid, Settings } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, Tooltip } from 'recharts';



interface MetricsDashboardProps {
  kpis: KPI[];
  onUpdate: (kpis: KPI[]) => void;
  isDarkMode: boolean;
  onGenerateIntelligence: (kpi: KPI) => void;
  loadingIntelligence: string | null;
  intelligenceError: Record<string, string>;
  onEdit: (kpi: KPI) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

const MetricsDashboard: React.FC<MetricsDashboardProps> = ({
  kpis,
  onUpdate,
  isDarkMode,
  onGenerateIntelligence,
  loadingIntelligence,
  intelligenceError,
  onEdit,
  onDelete,
  onAdd
}) => {
  const [layouts, setLayouts] = useState<ResponsiveLayouts>({
    lg: kpis.map((kpi, i) => ({
      i: kpi.id,
      x: (i * 4) % 12,
      y: Math.floor(i / 3) * 2,
      w: 4,
      h: 2,
      minW: 3,
      minH: 2
    }))
  });

  const [isCustomizing, setIsCustomizing] = useState(false);
  const { width, containerRef, mounted } = useContainerWidth();

  const kpiIdsString = kpis.map(k => k.id).join(',');

  // Sync layouts when new KPIs are added
  useEffect(() => {
    setLayouts(prev => {
      const currentLg = prev.lg || [];
      const newLg = kpis.map((kpi, i) => {
        const existing = currentLg.find(l => l.i === kpi.id);
        if (existing) return existing;
        return {
          i: kpi.id,
          x: (i * 4) % 12,
          y: Infinity, // puts it at the bottom
          w: 4,
          h: 2,
          minW: 3,
          minH: 2
        };
      });
      return { ...prev, lg: newLg };
    });
  }, [kpiIdsString]);

  const handleLayoutChange = (layout: Layout, allLayouts: ResponsiveLayouts) => {
    setLayouts(allLayouts);
    // Optionally save layouts to user preferences here
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-5 h-5 text-emerald-500" />;
      case 'down': return <TrendingDown className="w-5 h-5 text-rose-500" />;
      default: return <Minus className="w-5 h-5 text-slate-400" />;
    }
  };

  const getProgressColor = (value: number, target: number) => {
    if (target === 0) return 'bg-slate-300 dark:bg-slate-600';
    const percent = value / target;
    if (percent >= 1) return 'bg-emerald-500';
    if (percent >= 0.75) return 'bg-indigo-500';
    if (percent >= 0.5) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="surface p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
            <LayoutGrid className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white tracking-tight">Customizable Metrics</h3>
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mt-1">Drag & Resize Widgets</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsCustomizing(!isCustomizing)}
            className={`btn-sm flex items-center gap-2 rounded-xl transition-all ${isCustomizing ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800' : 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
          >
            <Settings className="w-4 h-4" />
            {isCustomizing ? 'Done Editing' : 'Customize Layout'}
          </button>
          <button 
            onClick={onAdd}
            className="btn-primary btn-sm gap-2"
          >
            <Plus className="w-4 h-4" /> Add Metric
          </button>
        </div>
      </div>

      <div className="relative z-10 -mx-4" ref={containerRef}>
        {mounted && (
          <Responsive
            width={width}
            className="layout"
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={120}
          margin={[16, 16]}
          onLayoutChange={handleLayoutChange}
          isDraggable={isCustomizing}
          isResizable={isCustomizing}
        >
          {kpis.map((kpi) => (
            <div key={kpi.id} className={`surface border ${isCustomizing ? 'border-indigo-400 dark:border-indigo-500 ring-2 ring-indigo-400/20 cursor-move' : 'border-slate-200 dark:border-slate-800 hover:shadow-md'} shadow-sm transition-shadow flex flex-col overflow-hidden group relative`}>
              
              {isCustomizing && (
                <div className="absolute top-2 right-2 z-20 flex gap-1">
                  <button onClick={(e) => { e.stopPropagation(); onEdit(kpi); }} className="p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:text-indigo-500">
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); onDelete(kpi.id); }} className="p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:text-rose-500">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}

              <div className="p-4 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div className="pr-12">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{kpi.name}</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider truncate">Target: {kpi.target} {kpi.unit}</p>
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg shrink-0">
                    {getTrendIcon(kpi.trend)}
                  </div>
                </div>

                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{kpi.value}</span>
                  <span className="text-xs font-medium text-slate-500">{kpi.unit}</span>
                </div>

                <div className="mt-auto">
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                    <div 
                      className={`h-full rounded-full ${getProgressColor(kpi.value, kpi.target)}`} 
                      style={{ width: `${Math.min(kpi.target === 0 ? 0 : (kpi.value / kpi.target) * 100, 100)}%` }}
                    ></div>
                  </div>
                  
                  {kpi.history && kpi.history.length > 1 ? (
                    <div className="h-10 w-full opacity-60 group-hover:opacity-100 transition-opacity">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={kpi.history}>
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke={kpi.trend === 'up' ? '#10b981' : kpi.trend === 'down' ? '#f43f5e' : '#6366f1'} 
                            strokeWidth={2} 
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-10 flex items-center justify-between">
                      <span className="text-[9px] text-slate-400">No history</span>
                      {!kpi.intelligence && !loadingIntelligence && !isCustomizing && (
                        <button 
                          onClick={() => onGenerateIntelligence(kpi)}
                          className="text-[9px] font-bold text-purple-500 hover:text-purple-600 flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" /> Analyze
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Intelligence Overlay */}
              {kpi.intelligence && !isCustomizing && (
                <div className="absolute inset-x-0 bottom-0 p-3 bg-purple-50/95 dark:bg-purple-900/95 backdrop-blur-sm border-t border-purple-100 dark:border-purple-800 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
                  <p className="text-[10px] font-medium text-purple-900 dark:text-purple-100 line-clamp-3 leading-relaxed">
                    {kpi.intelligence}
                  </p>
                </div>
              )}
              
              {loadingIntelligence === kpi.id && (
                <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-10">
                  <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
                </div>
              )}
            </div>
          ))}
        </Responsive>
        )}
      </div>
    </div>
  );
};

export default MetricsDashboard;
