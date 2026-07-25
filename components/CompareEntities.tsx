import { formatErrorMessage } from '../src/lib/errorUtils';
import React, { useState, useMemo, useEffect } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SavedScan, VisibilityReport, ScryTemplate, User, EntityInput } from '../types';
import AILoader from './AILoader';
import BusinessNameInput from './BusinessNameInput';
import { analyzeBusinessVisibility } from '../services/aiService';
import { storageService } from '../services/storageService';
import { INDUSTRIES, COMPANY_SIZES } from '../src/constants/industries';
import { Search, MapPin, Globe, ArrowRight, Loader2, Plus, X, Activity, BarChart2, Users, TrendingUp, Calendar } from 'lucide-react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  Radar, 
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';

interface CompareEntitiesProps {
  user: User | null;
  isDarkMode: boolean;
  onBack: () => void;
  onUpdateUser: (user: User) => void;
  initialReports?: VisibilityReport[];
}

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CompareEntities: React.FC<CompareEntitiesProps> = ({ user, isDarkMode, onBack, onUpdateUser, initialReports }) => {
  const [entities, setEntities] = useState<EntityInput[]>(
    initialReports && initialReports.length > 0
      ? initialReports.map(r => ({ id: `entity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, businessName: r.businessName, location: r.profileBadge?.location || '', website: r.website || '' }))
      : [
          { id: '1', businessName: '', location: '', website: '', industry: '', companySize: '' },
          { id: '2', businessName: '', location: '', website: '', industry: '', companySize: '' }
        ]
  );
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<VisibilityReport[]>(initialReports || []);
  const [allSavedScans, setAllSavedScans] = useState<SavedScan[]>([]);
  
  useEffect(() => {
    const fetchAllScans = async () => {
      if (user) {
        const scans = await storageService.getScans();
        setAllSavedScans(scans);
      }
    };
    fetchAllScans();
  }, [user, reports]);

  const trendChartData = useMemo(() => {
    if (reports.length === 0) return [];
    
    const businessNames = reports.map(r => r.businessName.toLowerCase());
    
    // If not logged in, we at least show the current report data points
    if (!user && reports.length > 0) {
      return [{
        date: 'Current',
        ...reports.reduce((acc, r) => ({ ...acc, [r.businessName]: r.overallScore }), {})
      }];
    }

    const relevantScans = allSavedScans.filter(s => 
      businessNames.includes(s.businessName.toLowerCase())
    );
    
    const sortedScans = [...relevantScans].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    const dataByDate: Record<string, any> = {};
    
    sortedScans.forEach(scan => {
      const dateStr = new Date(scan.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      if (!dataByDate[dateStr]) {
        dataByDate[dateStr] = { date: dateStr };
      }
      dataByDate[dateStr][scan.businessName] = scan.score;
    });
    
    // Add current reports if they aren't in allSavedScans yet (though handleCompare saves them)
    // But sometimes storageService.getScans might be slightly behind if not awaited properly or if it's firestore sync timing
    
    return Object.values(dataByDate);
  }, [allSavedScans, reports, user]);

  const handleAddEntity = () => {
    if (entities.length < 4) {
      setEntities([...entities, { id: `entity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, businessName: '', location: '', website: '', industry: '', companySize: '' }]);
    }
  };

  const handleRemoveEntity = (id: string) => {
    if (entities.length > 1) {
      setEntities(entities.filter(e => e.id !== id));
    }
  };

  const handleRemoveReport = (indexToRemove: number) => {
    setReports(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleChange = (id: string, field: keyof EntityInput, value: string) => {
    setEntities(entities.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validEntities = entities.filter(e => e.businessName.trim() !== '');
    if (validEntities.length < 2) {
      setError("Please enter at least two entities to compare.");
      return;
    }

    if (user && user.account) {
      const scanCost = 50 * validEntities.length; // 50 units per scan
      if (user.account.unitsRemaining < scanCost) {
        setError(`Insufficient Units. Comparing ${validEntities.length} entities requires ${scanCost} Units. You have ${user.account.unitsRemaining} Units remaining.`);
        return;
      }
    }

    setIsScanning(true);
    setError(null);
    setReports([]);

    try {
      const promises = validEntities.map(entity => 
        analyzeBusinessVisibility(entity.businessName, entity.location, entity.website, 'standard', entity.industry, entity.companySize)
      );
      
      const results = await Promise.all(promises);
      
      if (user) {
        const scanCost = 50 * validEntities.length;
        await storageService.updateUserUnits(scanCost, validEntities.length);
        
        // Re-fetch user data to reflect updated unit count
        const refreshedUser = await storageService.getUser();
        if (refreshedUser) onUpdateUser(refreshedUser);
        
        for (const report of results) {
          await storageService.saveScan(report.businessName, report.overallScore, report);
        }
      }
      
      setReports(results);
    } catch (err: any) {
      setError(formatErrorMessage(err, "Failed to compare entities."));
    } finally {
      setIsScanning(false);
    }
  };

  const comparisonData = useMemo(() => {
    if (reports.length === 0) return [];
    
    const metrics = [
      { key: 'searchVisibility', label: 'Search' },
      { key: 'socialPresence', label: 'Social' },
      { key: 'brandAuthority', label: 'Authority' },
      { key: 'contentStrength', label: 'Content' },
      { key: 'marketPosition', label: 'Market' }
    ];

    return metrics.map(metric => {
      const row: any = { subject: metric.label };
      reports.forEach((report, idx) => {
        row[`score${idx}`] = report.visibilityBreakdown[metric.key as keyof typeof report.visibilityBreakdown] || 0;
      });
      return row;
    });
  }, [reports]);

  const colors = ['#6366f1', '#f97316', '#10b981', '#8b5cf6'];

  return (
    <div className="pt-32 sm:pt-40 pb-20 px-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-2xl sm:text-2xl font-display font-bold text-slate-900 dark:text-white tracking-tighter">
            Compare <span className="text-indigo-600 dark:text-indigo-500">Entities</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Analyze trends and identify key differences side-by-side.</p>
        </div>
        <button onClick={onBack} className="btn-secondary btn-sm">
          Back to Dashboard
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 rounded-xl text-rose-600 dark:text-rose-400 font-medium text-center text-sm flex items-center justify-center gap-2">
          <Activity className="w-4 h-4" />
          {error}
        </div>
      )}

      {isScanning ? (
        <div className="surface p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none min-h-[400px] flex items-center justify-center">
          <AILoader message="Cross-referencing market data..." />
        </div>
      ) : reports.length === 0 ? (
        <form onSubmit={handleCompare} className="surface p-6 shadow-2xl space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {entities.map((entity, idx) => (
              <div key={entity.id} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 relative group">
                {entities.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => handleRemoveEntity(entity.id)}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">Entity {idx + 1}</h3>
                <div className="space-y-4">
                  <BusinessNameInput
                    value={entity.businessName}
                    onChange={val => handleChange(entity.id, 'businessName', val)}
                    placeholder="e.g. Acme Corp"
                    label="Business Name"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <MapPin className="w-3 h-3" /> Location
                      </label>
                      <input 
                        type="text" 
                        value={entity.location} 
                        onChange={e => handleChange(entity.id, 'location', e.target.value)} 
                        placeholder="City, Country" 
                        className="w-full px-5 py-3 rounded-xl surface focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none font-medium text-sm shadow-inner dark:text-white transition-all" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Globe className="w-3 h-3" /> Website
                      </label>
                      <input 
                        type="text" 
                        value={entity.website} 
                        onChange={e => handleChange(entity.id, 'website', e.target.value)} 
                        placeholder="domain.com" 
                        className="w-full px-5 py-3 rounded-xl surface focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none font-medium text-sm shadow-inner dark:text-white transition-all" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Activity className="w-3 h-3" /> Industry
                      </label>
                      <select 
                        value={entity.industry || ''} 
                        onChange={e => handleChange(entity.id, 'industry', e.target.value)} 
                        className="w-full px-5 py-3 rounded-xl surface focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none font-medium text-sm shadow-inner dark:text-white transition-all"
                      >
                        <option value="" disabled>Select Industry</option>
                        {INDUSTRIES.map(ind => (
                          <option key={ind.value} value={ind.value}>{ind.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Users className="w-3 h-3" /> Company Size
                      </label>
                      <select 
                        value={entity.companySize || ''} 
                        onChange={e => handleChange(entity.id, 'companySize', e.target.value)} 
                        className="w-full px-5 py-3 rounded-xl surface focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none font-medium text-sm shadow-inner dark:text-white transition-all"
                      >
                        <option value="" disabled>Select Size</option>
                        {COMPANY_SIZES.map(size => (
                          <option key={size.value} value={size.value}>{size.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button 
              type="button" 
              onClick={handleAddEntity}
              disabled={entities.length >= 4}
              className={`btn-secondary btn-sm gap-2 ${entities.length >= 4 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Plus className="w-4 h-4" /> Add Entity
            </button>
            <button 
              type="submit" 
              disabled={isScanning} 
              className="btn-primary btn-md gap-3 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg"
            >
              {isScanning ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Scanning...</>
              ) : (
                <>Compare Entities <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4 animate-in fade-in duration-500">
          <div className="flex justify-end">
             <button onClick={() => setReports([])} className="btn-secondary btn-sm gap-2">
               <Plus className="w-4 h-4" /> New Comparison
             </button>
          </div>

          {/* Side-by-Side Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reports.map((report, idx) => (
              <div key={idx} className="surface p-6 space-y-4 relative overflow-hidden group shadow-xl">
                <div className={`absolute top-0 right-0 w-12 h-12 opacity-5 rounded-full blur-2xl -mr-12 -mt-12`} style={{ backgroundColor: colors[idx % colors.length] }}></div>
                <div className="flex justify-between items-start relative z-10">
                  <div className="space-y-1 pr-6">
                    <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Entity {idx + 1}</p>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white line-clamp-1">{report.businessName}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: colors[idx % colors.length] }}></div>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveReport(idx)}
                      className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 p-1 rounded-md transition-colors"
                      title="Close entity field"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex items-baseline gap-2 relative z-10">
                  <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{report.overallScore}</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Index</span>
                </div>
                <div className="pt-2 relative z-10">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Visibility Level</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{report.visibilityIndex?.visibilityLevel || 'Emerging'}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Radar Chart Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
            <div className="surface p-6 h-[320px] shadow-xl relative overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={comparisonData}>
                  <PolarGrid stroke={isDarkMode ? "#ffffff10" : "#00000010"} />
                  <PolarAngleAxis dataKey="subject" tick={{fill: isDarkMode ? '#ffffff40' : '#00000040', fontSize: 10, fontWeight: 800}} />
                  {reports.map((report, idx) => (
                    <Radar 
                      key={idx}
                      name={report.businessName} 
                      dataKey={`score${idx}`} 
                      stroke={colors[idx % colors.length]} 
                      fill={colors[idx % colors.length]} 
                      fillOpacity={0.3} 
                    />
                  ))}
                  <Tooltip 
                    contentStyle={{ backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', border: 'none', borderRadius: '16px', color: isDarkMode ? '#fff' : '#000', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
                    itemStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Dossier Comparison Matrix</h4>
              <div className="grid grid-cols-1 gap-4">
                {reports.map((report, idx) => (
                  <div key={idx} className="flex items-center justify-between surface p-4 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: colors[idx % colors.length] }}></div>
                      <div>
                        <p className="text-lg font-black text-slate-900 dark:text-white">{report.businessName}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 max-w-xs">{report.visibilityIndex.summary}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">{report.overallScore}</p>
                      <p className="text-[7px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Overall Index</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Heatmap Comparison */}
          <div className="surface p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Performance Heatmap</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Visual intensity of scores across all analyzed dimensions.</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-rose-500/20 rounded-sm"></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Low</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-indigo-500 rounded-sm"></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">High</span>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                <div className="grid grid-cols-[150px_repeat(auto-fit,minmax(100px,1fr))] gap-2">
                  {/* Header */}
                  <div className="p-2"></div>
                  {reports.map((report, idx) => (
                    <div key={idx} className="p-2 text-center">
                      <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest truncate">{report.businessName}</p>
                    </div>
                  ))}

                  {/* Rows */}
                  {comparisonData.map((row, i) => (
                    <React.Fragment key={i}>
                      <div className="p-3 flex items-center text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                        {row.subject}
                      </div>
                      {reports.map((_, idx) => {
                        const score = row[`score${idx}`];
                        // Calculate color intensity
                        const opacity = Math.max(0.1, score / 100);
                        const isLow = score < 50;
                        
                        return (
                          <div 
                            key={idx} 
                            className="relative group h-12 rounded-lg flex items-center justify-center transition-all hover:scale-[1.02] cursor-default"
                            style={{ 
                              backgroundColor: isLow 
                                ? `rgba(244, 63, 94, ${opacity * 0.8})` // Rose for low scores
                                : `rgba(79, 70, 229, ${opacity})`    // Indigo for high scores
                            }}
                          >
                            <span className={cn(
                              "text-sm font-black transition-all",
                              score > 60 ? "text-white" : "text-slate-900 dark:text-white"
                            )}>
                              {score}
                            </span>
                            
                            {/* Tooltip on hover */}
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                              {row.subject}: {score}/100
                            </div>
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Historical Trend Chart */}
          {trendChartData.length > 1 && (
            <div className="surface p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 flex items-center gap-2">
                    <TrendingUp className="w-3 h-3" /> Historical Visibility Trends
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Timeline of overall indexing across multiple scrying sessions.</p>
                </div>
                {!user && (
                   <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                     <Calendar className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                     <span className="text-[8px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">Sign in for Full History</span>
                   </div>
                )}
              </div>
              
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#ffffff05" : "#00000005"} />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: isDarkMode ? '#ffffff40' : '#00000040', fontSize: 10, fontWeight: 800}}
                      dy={10}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: isDarkMode ? '#ffffff40' : '#00000040', fontSize: 10, fontWeight: 800}}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', border: 'none', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                    />
                    <Legend 
                      verticalAlign="top" 
                      align="right" 
                      iconType="circle"
                      wrapperStyle={{ paddingBottom: '20px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                    />
                    {reports.map((report, idx) => (
                      <Line 
                        key={idx}
                        type="monotone" 
                        dataKey={report.businessName} 
                        stroke={colors[idx % colors.length]} 
                        strokeWidth={4}
                        dot={{ r: 4, strokeWidth: 2, fill: isDarkMode ? '#0f172a' : '#fff' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                        animationDuration={1500}
                        animationBegin={idx * 200}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Detailed Metrics Table */}
          <div className="surface p-6 shadow-xl">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 mb-4">Signal Breakdown</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr>
                    <th className="p-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">Metric Category</th>
                    {reports.map((report, idx) => (
                      <th key={idx} className="p-4 text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">{report.businessName}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-4 text-sm font-black text-slate-900 dark:text-white border-b border-slate-50 dark:border-slate-800/50">{row.subject}</td>
                      {reports.map((_, idx) => (
                        <td key={idx} className="p-4 border-b border-slate-50 dark:border-slate-800/50">
                          <div className="flex items-center gap-3">
                            <div className="flex-grow h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden max-w-[100px]">
                              <div 
                                className="h-full" 
                                style={{ width: `${row[`score${idx}`]}%`, backgroundColor: colors[idx % colors.length] }}
                              ></div>
                            </div>
                            <span className="text-xs font-black text-slate-700 dark:text-slate-300">{row[`score${idx}`]}</span>
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr>
                    <td className="p-4 text-sm font-black text-slate-900 dark:text-white border-b border-slate-50 dark:border-slate-800/50">Biggest Strength</td>
                    {reports.map((report, idx) => (
                      <td key={idx} className="p-4 border-b border-slate-50 dark:border-slate-800/50">
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                          {report.visibilityIndex.biggestStrength}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 text-sm font-black text-slate-900 dark:text-white">Primary Gap</td>
                    {reports.map((report, idx) => (
                      <td key={idx} className="p-4">
                        <span className="text-xs font-medium text-rose-600 dark:text-rose-400">
                          {report.visibilityIndex.primaryGap}
                        </span>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompareEntities;
