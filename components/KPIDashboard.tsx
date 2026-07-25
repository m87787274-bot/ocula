import React, { useState, useRef, useEffect } from 'react';
import { KPI } from '../types';
import { Plus, Trash2, Edit2, TrendingUp, TrendingDown, Minus, Check, X, Sparkles, Zap, Loader2, Lightbulb, Target, Download, FileText, Table, FileCode, Eye, EyeOff, AlertCircle, LayoutGrid, List, ArrowUpDown, Filter, Settings, Activity } from 'lucide-react';
import AILoader from './AILoader';
import { generateKPIIntelligence, suggestKPIs } from '../services/aiService';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
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



interface KPIDashboardProps {
  kpis: KPI[];
  onUpdate: (kpis: KPI[]) => void;
  isDarkMode: boolean;
  businessName: string;
  industry?: string;
  reportSummary?: string;
  suggestedFromReport?: Partial<KPI>[];
}

const KPIDashboard: React.FC<KPIDashboardProps> = ({ kpis, onUpdate, isDarkMode, businessName, industry, reportSummary, suggestedFromReport }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempKPI, setTempKPI] = useState<KPI | null>(null);
  const [loadingIntelligence, setLoadingIntelligence] = useState<string | null>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [intelligenceError, setIntelligenceError] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [kpiToDelete, setKpiToDelete] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showChartDots, setShowChartDots] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterTrend, setFilterTrend] = useState<'all' | 'up' | 'down' | 'stable'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'value' | 'trend'>('name');

  const [layouts, setLayouts] = useState<ResponsiveLayouts>(() => {
    const kpiLayouts = kpis.map((kpi, i) => ({
      i: kpi.id,
      x: (i * 4) % 12,
      y: Math.floor(i / 3) * 4,
      w: 4,
      h: 4,
      minW: 3,
      minH: 3
    }));

    const suggestionLayouts = (suggestedFromReport || []).map((s, i) => ({
      i: `suggested-report-${i}`,
      x: ((kpis.length + i) * 4) % 12,
      y: Infinity,
      w: 4,
      h: 4,
      minW: 3,
      minH: 3
    }));

    return {
      lg: [...kpiLayouts, ...suggestionLayouts]
    };
  });

  const [isCustomizing, setIsCustomizing] = useState(false);
  const { width, containerRef, mounted } = useContainerWidth();

  const kpiIdsString = kpis.map(k => k.id).join(',');
  const suggestedNamesString = (suggestedFromReport || []).map(s => s.name || '').join(',');

  useEffect(() => {
    setLayouts(prev => {
      const currentLg = prev.lg || [];
      const newKpiLayouts = kpis.map((kpi, i) => {
        const existing = currentLg.find(l => l.i === kpi.id);
        if (existing) return existing;
        return {
          i: kpi.id,
          x: (i * 4) % 12,
          y: Infinity,
          w: 4,
          h: 4,
          minW: 3,
          minH: 3
        };
      });

      const newSuggestionLayouts = (suggestedFromReport || []).map((s, i) => {
        const id = `suggested-report-${i}`;
        const existing = currentLg.find(l => l.i === id);
        if (existing) return existing;
        return {
          i: id,
          x: ((kpis.length + i) * 4) % 12,
          y: Infinity,
          w: 4,
          h: 4,
          minW: 3,
          minH: 3
        };
      });

      return { ...prev, lg: [...newKpiLayouts, ...newSuggestionLayouts] };
    });
  }, [kpiIdsString, suggestedNamesString]);

  const handleLayoutChange = (layout: Layout, allLayouts: ResponsiveLayouts) => {
    setLayouts(allLayouts);
  };

  const filteredKPIs = kpis
    .filter(k => filterTrend === 'all' || k.trend === filterTrend)
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'value') return b.value - a.value;
      if (sortBy === 'trend') return a.trend.localeCompare(b.trend);
      return 0;
    });

  const handleExportCSV = () => {
    try {
      const headers = ['KPI Name', 'Current Value', 'Target', 'Unit', 'Trend', 'AI Insight'];
      const rows = kpis.map(k => [
        k.name,
        k.value,
        k.target,
        k.unit || '',
        k.trend,
        k.intelligence?.replace(/,/g, ';') || ''
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(r => r.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${businessName}_Performance_Report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('CSV Export failed:', error);
    }
  };

  const handleExportWord = () => {
    if (kpis.length === 0) return;
    setIsExporting(true);

    try {
      const date = new Date().toLocaleDateString();
      let html = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>KPI Report - ${businessName}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
          h1 { color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px; }
          .kpi-card { border: 1px solid #e2e8f0; padding: 20px; margin-bottom: 20px; border-radius: 10px; }
          .kpi-name { font-size: 18px; font-weight: bold; color: #0f172a; }
          .kpi-meta { color: #64748b; font-size: 12px; margin-bottom: 10px; }
          .kpi-value { font-size: 24px; font-weight: 900; color: #1e40af; }
          .kpi-intelligence { background: #f3f4f6; padding: 15px; border-radius: 8px; font-style: italic; margin-top: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
          th { background: #f8fafc; }
        </style>
        </head>
        <body>
          <h1>Performance Intelligence Report: ${businessName}</h1>
          <p>Generated on: ${date}</p>
          <p>Industry: ${industry || 'General'}</p>
          
          <div class="content">
            ${kpis.map(k => `
              <div class="kpi-card">
                <div class="kpi-name">${k.name}</div>
                <div class="kpi-meta">Target: ${k.target} ${k.unit || ''} | Trend: ${k.trend}</div>
                <div class="kpi-value">${k.value} ${k.unit || ''}</div>
                ${k.intelligence ? `<div class="kpi-intelligence">AI Insight: ${k.intelligence}</div>` : ''}
                
                <h3>Historical Data</h3>
                <table>
                  <thead>
                    <tr><th>Date</th><th>Value</th></tr>
                  </thead>
                  <tbody>
                    ${(k.history || []).map(h => `<tr><td>${new Date(h.date).toLocaleDateString()}</td><td>${h.value}</td></tr>`).join('')}
                  </tbody>
                </table>
              </div>
            `).join('')}
          </div>
        </body>
        </html>
      `;

      const blob = new Blob(['\ufeff', html], {
        type: 'application/msword'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${businessName}_KPI_Report_${new Date().toISOString().split('T')[0]}.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Word Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const validate = (kpi: KPI): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    if (!kpi.name.trim()) newErrors.name = "Name is required";
    if (isNaN(kpi.value)) newErrors.value = "Must be a number";
    if (isNaN(kpi.target)) newErrors.target = "Must be a number";
    if (kpi.target === 0 && kpi.value !== 0) newErrors.target = "Target cannot be zero if value is non-zero";
    return newErrors;
  };

  const handleGenerateIntelligence = async (kpi: KPI) => {
    if (!businessName) {
      setIntelligenceError(prev => ({ ...prev, [kpi.id]: "Business name is missing. Please update your profile." }));
      return;
    }

    setLoadingIntelligence(kpi.id);
    setIntelligenceError(prev => ({ ...prev, [kpi.id]: '' }));
    try {
      const insight = await generateKPIIntelligence(businessName, kpi);
      onUpdate(kpis.map(k => k.id === kpi.id ? { ...k, intelligence: insight } : k));
    } catch (error: any) {
      console.error("Intelligence failure:", error);
      
      let message = "Failed to generate insight. Please try again.";
      
      if (!navigator.onLine) {
        message = "You are currently offline. Please check your internet connection.";
      } else if (error.message?.includes("RESELECT_KEY")) {
        message = "Your API key is invalid or has expired. Please re-select it.";
      } else if (error.message?.includes("429") || error.message?.includes("Quota")) {
        message = "Rate limit exceeded. Please wait a moment before trying again.";
      } else if (error.message?.includes("Safety")) {
        message = "The content was flagged by safety filters. Please try a different metric name.";
      } else if (error.message?.includes("Vision Failure")) {
        message = "The AI signal is weak. Please check your connection and try again.";
      }
      
      setIntelligenceError(prev => ({ ...prev, [kpi.id]: message }));
    } finally {
      setLoadingIntelligence(null);
    }
  };

  const handleSuggest = async () => {
    setLoadingSuggestions(true);
    try {
      const suggestions = await suggestKPIs(
        businessName, 
        industry || 'General Business', 
        reportSummary || 'Standard visibility analysis'
      );
      
      const newKPIs = suggestions.map((s: any) => ({
        ...s,
        id: 'suggested_' + Math.random().toString(36).substr(2, 9),
        intelligence: s.intelligence || 'AI Suggested Metric',
        value: 0,
        trend: 'stable',
        history: []
      }));

      onUpdate([...kpis, ...newKPIs]);
    } catch (error) {
      console.error("Suggestion failure:", error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleStartEdit = (kpi: KPI) => {
    setEditingId(kpi.id);
    setTempKPI({ ...kpi });
    setErrors({});
  };

  const handleStartAdd = () => {
    const newId = 'new_' + Math.random().toString(36).substr(2, 9);
    const newKPI: KPI = {
      id: newId,
      name: '',
      value: 0,
      target: 100,
      trend: 'stable',
      unit: ''
    };
    setEditingId(newId);
    setTempKPI(newKPI);
    setErrors({});
  };

  const handleCancel = () => {
    setEditingId(null);
    setTempKPI(null);
    setErrors({});
  };

  const handleSave = () => {
    if (!tempKPI) return;
    
    const validationErrors = validate(tempKPI);
    if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
    }

    if (kpis.some(k => k.id === tempKPI.id)) {
      onUpdate(kpis.map(k => {
        if (k.id === tempKPI.id) {
          // Get existing history
          const existingHistory = k.history || [];
          const lastEntry = existingHistory[existingHistory.length - 1];
          
          // If value changed, append to history
          let newHistory = [...existingHistory];
          if (!lastEntry || lastEntry.value !== tempKPI.value) {
             newHistory.push({ date: new Date().toISOString(), value: tempKPI.value });
          }
          
          return { ...tempKPI, history: newHistory };
        }
        return k;
      }));
    } else {
      // New KPI
      const newKPI = { 
        ...tempKPI, 
        history: [{ date: new Date().toISOString(), value: tempKPI.value }] 
      };
      onUpdate([...kpis, newKPI]);
    }
    setEditingId(null);
    setTempKPI(null);
    setErrors({});
  };

  const handleInputChange = (field: keyof KPI, value: any) => {
    if (!tempKPI) return;
    const updated = { ...tempKPI, [field]: value };
    setTempKPI(updated);
    
    // Real-time validation
    const validationErrors = validate(updated);
    setErrors(validationErrors);
  };

  const handleDeleteIntelligence = (kpiId: string) => {
    onUpdate(kpis.map(k => k.id === kpiId ? { ...k, intelligence: undefined } : k));
  };

  const confirmDelete = () => {
    if (kpiToDelete) {
      onUpdate(kpis.filter(k => k.id !== kpiToDelete));
      setKpiToDelete(null);
    }
  };

  const getTrendIcon = (trend: KPI['trend']) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-emerald-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-rose-500" />;
      default: return <Minus className="w-4 h-4 text-slate-400" />;
    }
  };

  const getProgressColor = (value: number, target: number) => {
    const percentage = target === 0 ? 0 : (value / target) * 100;
    if (percentage >= 100) return 'bg-emerald-500';
    if (percentage >= 75) return 'bg-indigo-500';
    if (percentage >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const renderEditCard = (kpi: KPI, index?: number) => (
    <div key={index !== undefined ? `${kpi.id}-${index}-edit` : `${kpi.id}-edit`} className={`surface p-4 border-2 ${Object.keys(errors).length > 0 ? 'border-rose-500 shadow-rose-500/10' : 'border-indigo-500 shadow-2xl'} relative animate-in fade-in zoom-in-95 duration-200 h-full`}>
      <div className="absolute top-4 right-6 flex gap-2">
        <button onClick={handleCancel} className="btn-icon bg-slate-100 dark:bg-slate-700 text-slate-500" title="Cancel">
          <X className="w-4 h-4" />
        </button>
        <button 
          onClick={handleSave} 
          className={`btn-icon text-white shadow-lg ${Object.keys(errors).length > 0 ? 'bg-slate-300 dark:bg-slate-600 cursor-not-allowed' : 'btn-primary'}`} 
          title="Save"
          disabled={Object.keys(errors).length > 0}
        >
          <Check className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4 mt-4">
        <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Metric Identity</label>
                {errors.name && <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest">{errors.name}</span>}
            </div>
            <input 
              type="text" 
              value={kpi.name}
              onChange={e => handleInputChange('name', e.target.value)}
              className={`w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border outline-none font-black text-sm transition-all dark:text-white ${errors.name ? 'border-rose-500 focus:border-rose-600' : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'}`}
              placeholder="e.g. Monthly Active Users"
              autoFocus
            />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current</label>
                    {errors.value && <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest">{errors.value}</span>}
                </div>
                <input 
                  type="number" 
                  value={kpi.value}
                  onChange={e => handleInputChange('value', parseFloat(e.target.value))}
                  className={`w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border outline-none font-black text-sm transition-all dark:text-white ${errors.value ? 'border-rose-500 focus:border-rose-600' : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'}`}
                />
            </div>
            <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target</label>
                    {errors.target && <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest">{errors.target}</span>}
                </div>
                <input 
                  type="number" 
                  value={kpi.target}
                  onChange={e => handleInputChange('target', parseFloat(e.target.value))}
                  className={`w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border outline-none font-black text-sm transition-all dark:text-white ${errors.target ? 'border-rose-500 focus:border-rose-600' : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'}`}
                />
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit</label>
                <input 
                  type="text" 
                  value={kpi.unit || ''}
                  onChange={e => handleInputChange('unit', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none font-black text-sm focus:border-indigo-500 transition-all dark:text-white"
                  placeholder="e.g. %"
                />
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Trend Signal</label>
                <div className="flex bg-slate-50 dark:bg-slate-900 rounded-xl p-1.5 border border-slate-200 dark:border-slate-700">
                    {(['up', 'stable', 'down'] as const).map(t => (
                        <button
                            key={t}
                            onClick={() => handleInputChange('trend', t)}
                            className={`flex-1 btn-sm ${kpi.trend === t ? 'bg-white dark:bg-slate-700 shadow-md' : 'btn-ghost text-slate-400'}`}
                        >
                            {t === 'up' && <TrendingUp className={`w-4 h-4 ${kpi.trend === t ? 'text-emerald-500' : ''}`} />}
                            {t === 'stable' && <Minus className={`w-4 h-4 ${kpi.trend === t ? 'text-indigo-500' : ''}`} />}
                            {t === 'down' && <TrendingDown className={`w-4 h-4 ${kpi.trend === t ? 'text-rose-500' : ''}`} />}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );

  const renderViewCard = (kpi: KPI, index: number) => {
    if (viewMode === 'list') {
      return (
        <div key={`${kpi.id}-${index}`} className="surface p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all group/card relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
           <div className="flex items-center gap-4 flex-1 w-full sm:w-auto">
             <div className={`p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shrink-0`}>
                {getTrendIcon(kpi.trend)}
             </div>
             <div className="min-w-0">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight truncate">{kpi.name}</h4>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Target: {kpi.target} {kpi.unit}
                </div>
             </div>
           </div>

           <div className="flex items-center gap-4 flex-1 justify-end w-full sm:w-auto">
              <div className="text-right flex-1 sm:flex-none flex justify-between sm:block items-center w-full sm:w-auto">
                 <span className="stat-value text-slate-900 dark:text-white block">
                    {kpi.value} <span className="text-sm text-slate-400 font-medium">{kpi.unit}</span>
                 </span>
                 <span className={`text-[9px] font-bold px-2 py-1 rounded-lg ml-3 ${
                    kpi.value >= kpi.target ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                 }`}>
                    {kpi.target === 0 ? '0%' : `${Math.round((kpi.value / kpi.target) * 100) || 0}%`}
                 </span>
              </div>
              
              <div className="flex gap-2 opacity-100 sm:opacity-0 group-hover/card:opacity-100 transition-opacity">
                <button onClick={() => handleGenerateIntelligence(kpi)} className="btn-icon w-8 h-8 bg-slate-50 dark:bg-slate-800 hover:text-purple-500" title="AI Insight">
                    {loadingIntelligence === kpi.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                </button>
                <button onClick={() => handleStartEdit(kpi)} className="btn-icon w-8 h-8 bg-slate-50 dark:bg-slate-800 hover:text-indigo-500" title="Edit">
                    <Edit2 className="w-3 h-3" />
                </button>
                <button onClick={() => setKpiToDelete(kpi.id)} className="btn-icon w-8 h-8 bg-slate-50 dark:bg-slate-800 hover:text-rose-500" title="Delete">
                    <Trash2 className="w-3 h-3" />
                </button>
              </div>
           </div>
           
           {/* Intelligence Preview in List View */}
           {kpi.intelligence && (
             <div className="w-full sm:w-auto sm:max-w-xs text-[10px] text-slate-500 italic hidden lg:block truncate border-l border-slate-100 dark:border-slate-800 pl-4">
               "{kpi.intelligence}"
             </div>
           )}
        </div>
      );
    }

    return (
    <div key={`${kpi.id}-${index}`} className="surface p-6 hover:shadow-md transition-all group/card relative flex flex-col justify-between overflow-hidden h-full">
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover/card:opacity-100 transition-all translate-y-2 group-hover/card:translate-y-0 z-20">
            <button 
              onClick={() => handleGenerateIntelligence(kpi)} 
              disabled={!!loadingIntelligence}
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 dark:bg-slate-800 hover:text-purple-500 border border-slate-200 dark:border-slate-700 transition-all" 
              title="Generate Intelligence"
            >
              {loadingIntelligence === kpi.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            </button>
            <button onClick={() => handleStartEdit(kpi)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 dark:bg-slate-800 hover:text-indigo-500 border border-slate-200 dark:border-slate-700 transition-all" title="Edit">
              <Edit2 className="w-4 h-4" />
            </button>
            <button onClick={() => setKpiToDelete(kpi.id)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 dark:bg-slate-800 hover:text-rose-500 border border-slate-200 dark:border-slate-700 transition-all" title="Delete">
              <Trash2 className="w-4 h-4" />
            </button>
        </div>

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
              <div className="space-y-2">
                <h4 className="text-2xl font-display font-medium text-slate-900 dark:text-white tracking-tight">{kpi.name}</h4>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                    Benchmark: {kpi.target} {kpi.unit}
                </div>
              </div>
              <div className={`p-4 rounded-xl bg-slate-50 dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700`}>
                {getTrendIcon(kpi.trend)}
              </div>
          </div>

          <div className="space-y-4 mb-4">
              <div className="flex justify-between items-baseline">
                <span className="stat-value text-slate-900 dark:text-white">
                    {kpi.value} <span className="text-xl text-slate-400 dark:text-slate-500 font-medium ml-1">{kpi.unit}</span>
                </span>
                <span className={`text-[10px] font-bold px-4 py-2 rounded-xl shadow-sm ${
                    kpi.value >= kpi.target ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                }`}>
                    {kpi.target === 0 ? '0%' : `${Math.round((kpi.value / kpi.target) * 100) || 0}%`}
                </span>
              </div>
              <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700/50">
                <div 
                    className={`h-full rounded-full transition-all duration-1000 ${getProgressColor(kpi.value, kpi.target)}`} 
                    style={{ width: `${Math.min(kpi.target === 0 ? 0 : (kpi.value / kpi.target) * 100, 100)}%` }}
                ></div>
              </div>

              {/* Historical Trend Chart */}
              {kpi.history && kpi.history.length > 1 && (
                <div className="h-12 w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={kpi.history}>
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke={kpi.trend === 'up' ? '#10b981' : kpi.trend === 'down' ? '#f43f5e' : '#6366f1'} 
                        strokeWidth={2} 
                        dot={showChartDots ? { r: 3, strokeWidth: 2, fill: isDarkMode ? '#0f172a' : '#fff' } : false}
                        activeDot={{ r: 5, strokeWidth: 0 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#0f172a', 
                          border: 'none', 
                          borderRadius: '8px', 
                          color: '#fff',
                          fontSize: '10px',
                          fontWeight: 'bold'
                        }}
                        itemStyle={{ color: '#fff' }}
                        labelStyle={{ display: 'none' }}
                        formatter={(value: number) => [`${value} ${kpi.unit || ''}`, '']}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
          </div>
        </div>

        {/* Intelligence Section */}
        {kpi.intelligence && (
          <div className="mt-4 p-4 bg-purple-50/50 dark:bg-purple-900/10 rounded-xl border border-purple-100/50 dark:border-purple-800/30 animate-in fade-in slide-in-from-top-2 relative z-10 shadow-sm group/intel">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
                  <Zap className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 fill-purple-400" />
                </div>
                <span className="text-[9px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-[0.3em]">Strategic Intelligence</span>
              </div>
              <button 
                onClick={() => handleDeleteIntelligence(kpi.id)}
                className="opacity-0 group-hover/intel:opacity-100 transition-opacity p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg"
                title="Delete Intelligence"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed italic">
              "{kpi.intelligence}"
            </p>
          </div>
        )}
        
        {!kpi.intelligence && !loadingIntelligence && (
          <button 
            onClick={() => handleGenerateIntelligence(kpi)}
            className="mt-4 btn-ghost btn-xs text-purple-500 hover:text-purple-600 gap-2 opacity-0 group-hover/card:opacity-100 hover:translate-x-1"
          >
            <Sparkles className="w-3 h-3" /> Generate Intelligence
          </button>
        )}

        {loadingIntelligence === kpi.id && (
          <div className="mt-4">
            <AILoader message="Scrying Signals..." className="p-2" />
          </div>
        )}
        
        {intelligenceError[kpi.id] && (
          <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-900/10 rounded-xl border border-rose-100 dark:border-rose-800/30 text-[10px] font-bold text-rose-600 dark:text-rose-400 flex items-start gap-2 animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" /> 
            <span>{intelligenceError[kpi.id]}</span>
          </div>
        )}
    </div>
    );
  };

  return (
    <div className="surface p-6 md:p-10 relative overflow-hidden group">
       {/* Delete Confirmation Modal */}
       {kpiToDelete && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="surface w-full max-w-md rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-8">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-xl flex items-center justify-center mx-auto text-2xl">🗑️</div>
              <div className="space-y-2">
                <h3 className="text-xl font-medium text-slate-900 dark:text-white tracking-tight">Delete Metric?</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed text-sm">
                  Are you sure you want to permanently delete this performance metric? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setKpiToDelete(null)} className="flex-1 btn-secondary btn-sm">Abort</button>
              <button onClick={confirmDelete} className="flex-1 btn-danger btn-sm shadow-xl">Confirm Delete</button>
            </div>
          </div>
        </div>
      )}

       <div className="relative z-10">
          {/* Performance Intelligence Summary Section */}
          {(kpis.length > 0 || (suggestedFromReport && suggestedFromReport.length > 0)) && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
              <div className="lg:col-span-2 flex flex-col justify-center">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center shadow-inner">
                    <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-medium text-slate-900 dark:text-white tracking-tight">Performance Intelligence</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">Strategic Market Resonance</p>
                  </div>
                </div>
                <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-2xl leading-relaxed font-medium">
                  Deep analysis of your market resonance across critical performance vectors. These metrics represent the primary signals of your digital authority and strategic growth potential.
                </p>
                
                <div className="flex flex-wrap items-center gap-4 mt-8">
                  <div className="flex items-center gap-2 px-4 py-2 surface shadow-sm">
                    <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{kpis.length} Active Metrics</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 surface shadow-sm">
                    <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {kpis.filter(k => k.value >= k.target).length} Targets Met
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-inner">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                      <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Strategic Insights</h4>
                      <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">AI-Powered Rationale</p>
                    </div>
                  </div>
                </div>

                {loadingSuggestions ? (
                  <div className="py-8">
                    <AILoader message="Generating KPI Suggestions..." />
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2 no-scrollbar">
                  {kpis.filter(k => k.intelligence).length > 0 ? (
                    kpis.filter(k => k.intelligence).slice(0, 5).map((kpi, idx) => (
                      <div key={idx} className="p-3 surface group hover:border-purple-200 dark:hover:border-purple-900/30 transition-all shadow-sm relative">
                        <div className="flex justify-between items-start mb-1.5">
                          <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest truncate max-w-[150px]">{kpi.name}</span>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleDeleteIntelligence(kpi.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-rose-500"
                              title="Delete Intelligence"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></div>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed italic line-clamp-2">
                          "{kpi.intelligence}"
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No intelligence identified</p>
                      <button 
                        onClick={handleSuggest}
                        className="mt-4 text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:underline"
                      >
                        Generate Insights
                      </button>
                    </div>
                  )}
                </div>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-medium text-slate-900 dark:text-white tracking-tight">Performance Intelligence</h3>
                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mt-1">AI-Enhanced Strategic Monitoring</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
            {/* View Controls */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl shadow-inner">
              <button 
                onClick={() => setIsCustomizing(!isCustomizing)}
                className={`btn-icon w-10 h-10 shadow-sm transition-all mr-1 ${isCustomizing ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shadow-md scale-105' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                title="Customize Layout"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className={`btn-icon w-10 h-10 shadow-sm transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-md scale-105' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`btn-icon w-10 h-10 shadow-sm transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-md scale-105' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Filter & Sort */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl shadow-inner gap-1">
               <div className="relative group">
                 <button className="btn-icon w-10 h-10 bg-white dark:bg-slate-700 text-slate-500 hover:text-purple-500 shadow-sm">
                   <Filter className="w-4 h-4" />
                 </button>
                 <div className="absolute top-full right-0 mt-2 w-48 surface rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 p-2 hidden group-hover:block z-50">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-3 py-2">Filter By Trend</p>
                   {['all', 'up', 'down', 'stable'].map(t => (
                     <button 
                       key={t}
                       onClick={() => setFilterTrend(t as any)}
                       className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold capitalize hover:bg-slate-50 dark:hover:bg-slate-700 ${filterTrend === t ? 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' : 'text-slate-600 dark:text-slate-300'}`}
                     >
                       {t}
                     </button>
                   ))}
                 </div>
               </div>
               <div className="relative group">
                 <button className="btn-icon w-10 h-10 bg-white dark:bg-slate-700 text-slate-500 hover:text-purple-500 shadow-sm">
                   <ArrowUpDown className="w-4 h-4" />
                 </button>
                 <div className="absolute top-full right-0 mt-2 w-48 surface rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 p-2 hidden group-hover:block z-50">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-3 py-2">Sort By</p>
                   {['name', 'value', 'trend'].map(s => (
                     <button 
                       key={s}
                       onClick={() => setSortBy(s as any)}
                       className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold capitalize hover:bg-slate-50 dark:hover:bg-slate-700 ${sortBy === s ? 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' : 'text-slate-600 dark:text-slate-300'}`}
                     >
                       {s}
                     </button>
                   ))}
                 </div>
               </div>
            </div>

            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 mx-2 hidden xl:block"></div>

            {/* Actions */}
            <div className="flex gap-3 ml-auto xl:ml-0">
               <button 
                 onClick={handleExportWord}
                 disabled={kpis.length === 0 || isExporting}
                 className="btn-icon w-10 h-10 surface text-slate-600 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 disabled:opacity-50 transition-all rounded-lg"
                 title="Export Report"
               >
                 {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
               </button>
               <button 
                 onClick={handleExportCSV}
                 disabled={kpis.length === 0}
                 className="btn-icon w-10 h-10 surface text-slate-600 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all rounded-lg"
                 title="Export CSV"
               >
                 <Table className="w-4 h-4" />
               </button>
               <button 
                 onClick={handleSuggest}
                 disabled={loadingSuggestions || !!editingId}
                 className={`btn-base surface text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 btn-md shadow-sm gap-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg ${loadingSuggestions ? 'opacity-50' : ''}`}
               >
                 {loadingSuggestions ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lightbulb className="w-4 h-4" />}
                 <span className="hidden sm:inline">Suggest</span>
               </button>
               <button 
                 onClick={handleStartAdd}
                 disabled={!!editingId}
                 className="btn-base bg-slate-900 dark:bg-white text-white dark:text-slate-900 btn-md shadow-sm gap-2 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors rounded-lg"
               >
                 <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add Metric</span>
               </button>
            </div>
          </div>
        </div>

        <div ref={containerRef}>
          {viewMode === 'grid' ? (
            mounted && (
              <Responsive
                width={width}
                className="layout"
              layouts={layouts}
              breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
              cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
              rowHeight={150}
              margin={[16, 16]}
              onLayoutChange={handleLayoutChange}
              isDraggable={isCustomizing}
              isResizable={isCustomizing}
            >
              {/* Render New KPI Card if adding */}
              {editingId && tempKPI && !kpis.find(k => k.id === editingId) && (
                <div key={editingId} data-grid={{ x: 0, y: 0, w: 4, h: 2 }}>
                  {renderEditCard(tempKPI)}
                </div>
              )}

              {/* Render Existing KPIs */}
              {filteredKPIs.map((kpi, index) => (
                <div key={kpi.id} className={`h-full ${isCustomizing ? 'cursor-move ring-2 ring-purple-400/50 rounded-xl' : ''}`}>
                  {editingId === kpi.id && tempKPI ? renderEditCard(tempKPI, index) : renderViewCard(kpi, index)}
                </div>
              ))}

              {/* Render Suggested from Report */}
              {suggestedFromReport && suggestedFromReport.length > 0 && suggestedFromReport
                .filter(s => !kpis.some(k => k.name.toLowerCase() === s.name?.toLowerCase()))
                .map((s, idx) => (
                  <div key={`suggested-report-${idx}`} data-grid={{ x: (idx * 4) % 12, y: Infinity, w: 4, h: 2 }} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border-2 border-dashed border-purple-200 dark:border-purple-900/30 relative flex flex-col justify-between group/suggested animate-in fade-in slide-in-from-bottom-4 h-full">
                    <div className="absolute top-4 right-6">
                      <button 
                        onClick={() => {
                          const newKpi: KPI = {
                            id: 'suggested_' + Math.random().toString(36).substr(2, 9),
                            name: s.name || 'New Metric',
                            value: 0,
                            target: s.target || 100,
                            unit: s.unit || (s.name?.toLowerCase().includes('rate') || s.name?.toLowerCase().includes('conversion') || s.name?.toLowerCase().includes('%') ? '%' : ''),
                            trend: 'stable',
                            intelligence: s.intelligence
                          };
                          onUpdate([...kpis, newKpi]);
                        }}
                        className="btn-icon bg-purple-600 text-white shadow-lg hover:bg-purple-700 hover:scale-110 transition-all"
                        title="Add to Dashboard"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                        <span className="text-[9px] font-black text-purple-500 uppercase tracking-widest">AI Suggested</span>
                      </div>
                      <h4 className="font-black text-slate-900 dark:text-white text-lg tracking-tight mb-1">{s.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Target: {s.target} {s.unit}</p>
                      <div className="p-4 surface border-purple-100 dark:border-purple-900/30">
                        <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed italic line-clamp-3">"{s.intelligence}"</p>
                      </div>
                    </div>
                  </div>
                ))
              }
            </Responsive>
            )
          ) : (
            <div className="grid gap-4 grid-cols-1">
              {/* Render New KPI Card if adding */}
              {editingId && tempKPI && !kpis.find(k => k.id === editingId) && renderEditCard(tempKPI)}

              {/* Render Existing KPIs */}
              {filteredKPIs.map((kpi, index) => (
                  editingId === kpi.id && tempKPI ? renderEditCard(tempKPI, index) : renderViewCard(kpi, index)
              ))}

              {/* Render Suggested from Report */}
              {suggestedFromReport && suggestedFromReport.length > 0 && suggestedFromReport
                .filter(s => !kpis.some(k => k.name.toLowerCase() === s.name?.toLowerCase()))
                .map((s, idx) => (
                  <div key={`suggested-report-${idx}`} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border-2 border-dashed border-purple-200 dark:border-purple-900/30 relative flex flex-col justify-between group/suggested animate-in fade-in slide-in-from-bottom-4">
                    <div className="absolute top-4 right-6">
                      <button 
                        onClick={() => {
                          const newKpi: KPI = {
                            id: 'suggested_' + Math.random().toString(36).substr(2, 9),
                            name: s.name || 'New Metric',
                            value: 0,
                            target: s.target || 100,
                            unit: s.unit || (s.name?.toLowerCase().includes('rate') || s.name?.toLowerCase().includes('conversion') || s.name?.toLowerCase().includes('%') ? '%' : ''),
                            trend: 'stable',
                            intelligence: s.intelligence
                          };
                          onUpdate([...kpis, newKpi]);
                        }}
                        className="btn-icon bg-purple-600 text-white shadow-lg hover:bg-purple-700 hover:scale-110 transition-all"
                        title="Add to Dashboard"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                        <span className="text-[9px] font-black text-purple-500 uppercase tracking-widest">AI Suggested</span>
                      </div>
                      <h4 className="font-black text-slate-900 dark:text-white text-lg tracking-tight mb-1">{s.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Target: {s.target} {s.unit}</p>
                      <div className="p-4 surface border-purple-100 dark:border-purple-900/30">
                        <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed italic">"{s.intelligence}"</p>
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          )}
            
            {/* Empty State */}
            {kpis.length === 0 && !editingId && (
                <div className="col-span-full text-center py-6 bg-slate-50 dark:bg-slate-800/30 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 group/empty hover:border-indigo-400 transition-all">
                    <div className="w-14 h-14 surface rounded-xl flex items-center justify-center mx-auto mb-4 shadow-xl group-hover/empty:scale-110 transition-all">
                      <Target className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                    </div>
                    <p className="text-slate-400 dark:text-slate-500 font-black text-sm mb-4 uppercase tracking-widest">No intelligence metrics tracked yet.</p>
                    <button 
                      onClick={handleStartAdd}
                      className="btn-primary btn-md shadow-lg"
                    >
                      Create your first KPI
                    </button>
                </div>
            )}
        </div>
       </div>
    </div>
  );
};

export default KPIDashboard;
