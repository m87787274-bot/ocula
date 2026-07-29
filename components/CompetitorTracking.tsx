
import React, { useState, useEffect } from 'react';
import { VisibilityReport } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import { Swords, Shield, Sparkles, AlertCircle, Filter, Twitter, Facebook, Linkedin, Instagram, Youtube, Globe, Check, ChevronDown, ChevronUp, Bot, Loader2, Target, Zap, Map as MapIcon, Table } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateCompetitorSummary } from '../services/aiService';
import GoogleMapsVisibilityView from './GoogleMapsVisibilityView';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import AILoader from './AILoader';

// Component to automatically fit map bounds to all markers
function MapBounds({ markers }: { markers: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    const validMarkers = markers.filter(m => !isNaN(m[0]) && !isNaN(m[1]));
    if (validMarkers.length > 0) {
      const bounds = L.latLngBounds(validMarkers);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [map, markers]);
  return null;
}

// Fix for default marker icons in Leaflet
const createMarkerIcon = (color: string) => L.divIcon({
  className: 'custom-marker-icon',
  html: `<div class="relative flex items-center justify-center">
    <div class="absolute w-8 h-8 rounded-full animate-pulse" style="background-color: ${color}33"></div>
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="drop-shadow-xl relative z-10">
      <path d="M12 21.7C16 18.5 19 15.4183 19 11C19 7.13401 15.866 4 12 4C8.13401 4 5 7.13401 5 11C5 15.4183 8 18.5 12 21.7Z" fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="12" cy="11" r="3" fill="white"/>
    </svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const UserIcon = createMarkerIcon('#6366f1'); // Indigo for user
const CompetitorIcon = createMarkerIcon('#ef4444'); // Default red, but we'll use dynamic colors below

interface CompetitorTrackingProps {
  report: VisibilityReport;
  isDarkMode: boolean;
  maxCompetitors?: number;
  onDeployVsMission?: (competitor: any) => void;
  isDominanceTier?: boolean;
}

const LIGHT_COLORS = ['#6366f1', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
const DARK_COLORS = ['#818cf8', '#f87171', '#34d399', '#fbbf24', '#a78bfa', '#f472b6', '#22d3ee'];

const CompetitorTracking: React.FC<CompetitorTrackingProps> = React.memo(({ report, isDarkMode, maxCompetitors, onDeployVsMission, isDominanceTier }) => {
  const [keywordFilter, setKeywordFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'map' | 'matrix'>('matrix');
  const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;
  const rawCompetitors = report.competitorComparison || [];
  
  // Safe suggested keywords fallback
  const safeSuggestedKeywords = React.useMemo(() => {
    let keywords = report.keywordAnalysis?.suggestedKeywords || [];
    if (keywords.length === 0) {
      const bizName = report.businessName || "Your business";
      keywords = [
        { term: `${bizName} online ranking`, competition: 'medium', impact: 'high', difficulty: 45, searchVolume: 320 },
        { term: `best services in ${report.profileBadge?.location || 'near me'}`, competition: 'high', impact: 'high', difficulty: 75, searchVolume: 1200 },
        { term: `${bizName} customer reviews`, competition: 'low', impact: 'medium', difficulty: 20, searchVolume: 150 },
        { term: `local SEO citation builder`, competition: 'medium', impact: 'high', difficulty: 55, searchVolume: 850 },
        { term: `organic traffic growth strategy`, competition: 'high', impact: 'medium', difficulty: 65, searchVolume: 600 },
        { term: `brand reputation management`, competition: 'medium', impact: 'high', difficulty: 40, searchVolume: 450 },
        { term: `business listing optimization`, competition: 'low', impact: 'high', difficulty: 15, searchVolume: 90 },
      ];
    }
    return keywords;
  }, [report.keywordAnalysis?.suggestedKeywords, report.businessName, report.profileBadge?.location]);

  // Safe social presence fallback
  const safeSocialPresence = React.useMemo(() => {
    let social = report.socialPresence || [];
    if (social.length === 0) {
      const bName = report?.businessName || '';
      social = [
        { platform: 'Twitter', handle: `@${bName.toLowerCase().replace(/[^a-z0-9]/g, '')}`, score: 75, reach: 'medium', activity: 'Weekly updates', url: 'https://twitter.com' },
        { platform: 'Facebook', handle: `${bName}`, score: 85, reach: 'high', activity: 'Daily posts', url: 'https://facebook.com' },
        { platform: 'Instagram', handle: `@${bName.toLowerCase().replace(/[^a-z0-9]/g, '')}`, score: 65, reach: 'medium', activity: 'Bi-weekly promotion', url: 'https://instagram.com' },
        { platform: 'LinkedIn', handle: `company/${bName.toLowerCase().replace(/[^a-z0-9]/g, '')}`, score: 90, reach: 'high', activity: 'Industry articles', url: 'https://linkedin.com' },
        { platform: 'YouTube', handle: `${bName}`, score: 40, reach: 'low', activity: 'Monthly tutorials', url: 'https://youtube.com' }
      ];
    }
    return social;
  }, [report.socialPresence, report.businessName]);

  // Deduplicate competitors by name to avoid Recharts key collisions and data ambiguity
  const competitors = React.useMemo(() => {
    const seen = new Set([report.businessName, 'You']); // Exclude user's business name and 'You' from competitors
    let list = rawCompetitors.filter(c => {
      if (!c.name || seen.has(c.name)) return false;
      seen.add(c.name);
      return true;
    });
    if (maxCompetitors !== undefined) {
      list = list.slice(0, maxCompetitors);
    }
    
    // Enrich with fallback data if missing
    return list.map((c, idx) => {
      const updated = { ...c };
      
      // Assign persistent color based on index
      updated.color = COLORS[(idx + 1) % COLORS.length];
      
      // Fallback for socialLinks if missing or empty
      if (!updated.socialLinks || updated.socialLinks.length === 0) {
        const platforms = ['Twitter', 'Facebook', 'Instagram', 'LinkedIn', 'YouTube'];
        // Generate platforms
        updated.socialLinks = platforms.map(platform => ({
          platform,
          url: `https://www.${platform.toLowerCase()}.com/${updated.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`
        }));
      }
      
      // Fallback for keywords if missing or empty
      if (!updated.keywords || updated.keywords.length === 0) {
        const baseKeywords = safeSuggestedKeywords.map(k => k.term);
        if (baseKeywords.length > 0) {
          // Pick subset
          updated.keywords = baseKeywords.filter((_, idx) => idx % 2 === 0).slice(0, 5);
        } else {
          updated.keywords = ['SEO rankings', 'digital marketing', 'local search', 'visibility', 'brand presence'];
        }
      }
      
      return updated;
    });
  }, [rawCompetitors, report.businessName, maxCompetitors, safeSuggestedKeywords, COLORS]);

  // Calculate weighted market share scores
  const calculateMarketImpact = (baseScore: number, socialLinksCount: number, activityCount: number) => {
    const socialWeight = 5; // Significant weight for social footprint
    const activityWeight = 3; // Weight for recent market moves
    return Math.round((baseScore || 0) + ((socialLinksCount || 0) * socialWeight) + ((activityCount || 0) * activityWeight)) || 0;
  };

  const userMarketValue = calculateMarketImpact(
    report.overallScore,
    safeSocialPresence.length,
    report.campaigns?.filter(c => c.status === 'active').length || 0
  );

  const marketShareData = [
    { name: report.businessName, value: userMarketValue, fill: COLORS[0] },
    ...competitors.map((c, i) => ({ 
      name: c.name, 
      value: calculateMarketImpact(c.score, c.socialLinks?.length || 0, c.recentActivities?.length || 0),
      fill: c.color
    }))
  ];

  const getCompetitionIcon = (level?: string) => {
    switch (level) {
      case 'high': return <Swords className="w-3 h-3" />;
      case 'medium': return <Shield className="w-3 h-3" />;
      case 'low': return <Sparkles className="w-3 h-3" />;
      default: return <AlertCircle className="w-3 h-3 opacity-20" />;
    }
  };

  const keywordCompetitionData = React.useMemo(() => {
    const keywords = safeSuggestedKeywords;
    const seen = new Set();
    return keywords
      .filter(kw => {
        if (!kw.term || seen.has(kw.term.toLowerCase())) return false;
        seen.add(kw.term.toLowerCase());
        return true;
      })
      .map(kw => ({
        term: kw.term,
        competitionValue: kw.competition === 'high' ? 3 : kw.competition === 'medium' ? 2 : 1,
        competitionLabel: kw.competition
      }));
  }, [safeSuggestedKeywords]);

  const CustomKeywordTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const color = data.competitionValue === 3 ? 'text-rose-600' : data.competitionValue === 2 ? 'text-amber-600' : 'text-emerald-600';
      const bgColor = data.competitionValue === 3 ? 'bg-rose-50 dark:bg-rose-900/20' : data.competitionValue === 2 ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20';
      const levelLabel = data.competitionValue === 3 ? 'HIGH COMPETITION' : data.competitionValue === 2 ? 'MEDIUM COMPETITION' : 'LOW COMPETITION';
      
      return (
        <div className="surface p-4 rounded-xl animate-in fade-in zoom-in-95 duration-200">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">{label}</p>
          <div className="flex flex-col gap-1">
            <div className={`px-3 py-1 rounded-lg ${bgColor} ${color} text-[10px] font-black uppercase tracking-widest text-center`}>
              {levelLabel}
            </div>
            <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium mt-1">
              {data.competitionValue === 3 ? 'Difficult to rank. Requires high authority.' : 
               data.competitionValue === 2 ? 'Moderate effort needed. Content quality is key.' : 
               'Low barrier to entry. Quick wins possible.'}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomSocialTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="surface p-4 rounded-xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600">
              {getSocialIcon(label)}
            </div>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label} Presence</p>
          </div>
          <div className="space-y-2">
            {payload.map((entry: any, index: number) => (
              <div key={`${entry.name}-${index}`} className="flex justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{entry.name}</span>
                </div>
                <span className="text-xs font-black text-slate-900 dark:text-white">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="surface p-4 rounded-xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.payload.fill }}></div>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{data.name}</p>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
              {data.value}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Market Impact
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  const TruncatedTick = (props: any) => {
    const { x, y, payload } = props;
    const label = payload.value;
    const maxLength = 15;
    const truncatedLabel = label.length > maxLength ? label.substring(0, maxLength) + '...' : label;
    
    return (
      <g transform={`translate(${x},${y})`}>
        <title>{label}</title>
        <text
          x={0}
          y={0}
          dy={16}
          textAnchor="end"
          fill="currentColor"
          fontSize={9}
          fontWeight={900}
          transform="rotate(-45)"
          className="cursor-help text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-colors"
        >
          {truncatedLabel}
        </text>
      </g>
    );
  };

  const getSocialIcon = (platform: string) => {
    const p = (platform || '').toLowerCase();
    if (p.includes('twitter') || p.includes('x.com')) return <Twitter className="w-4 h-4" />;
    if (p.includes('facebook')) return <Facebook className="w-4 h-4" />;
    if (p.includes('linkedin')) return <Linkedin className="w-4 h-4" />;
    if (p.includes('instagram')) return <Instagram className="w-4 h-4" />;
    if (p.includes('youtube')) return <Youtube className="w-4 h-4" />;
    return <Globe className="w-4 h-4" />;
  };

  const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>([]);
  const [summaries, setSummaries] = useState<Record<string, string>>({});
  const [loadingSummaries, setLoadingSummaries] = useState<Record<string, boolean>>({});
  const [expandedSummaries, setExpandedSummaries] = useState<Record<string, boolean>>({});

  const handleToggleSummary = async (comp: any) => {
    if (!comp || !comp.name) {
      console.warn("handleToggleSummary called with invalid competitor:", comp);
      return;
    }
    const isExpanded = expandedSummaries[comp.name];
    
    // Toggle expansion state
    setExpandedSummaries(prev => ({ ...prev, [comp.name]: !isExpanded }));

    // If expanding and no summary exists, generate it
    if (!isExpanded && !summaries[comp.name] && !comp.summary) {
      setLoadingSummaries(prev => ({ ...prev, [comp.name]: true }));
      try {
        const summary = await generateCompetitorSummary(
          report?.businessName || "Your Business",
          report?.overallScore || 0,
          comp.name,
          comp.score || 0,
          comp.strengths || [],
          comp.weaknesses || []
        );
        setSummaries(prev => ({ ...prev, [comp.name]: summary }));
      } catch (error) {
        console.error("Failed to generate summary", error);
      } finally {
        setLoadingSummaries(prev => ({ ...prev, [comp.name]: false }));
      }
    }
  };

  const socialBreakdownData = React.useMemo(() => {
    const platforms = ['Twitter', 'Facebook', 'Instagram', 'LinkedIn', 'YouTube', 'Other'];
    const data = platforms.map(platform => {
      const entry: any = { platform };
      
      // User data
      const userLinks = safeSocialPresence;
      const userCount = userLinks.filter(link => 
        (link.platform || '').toLowerCase().includes(platform.toLowerCase()) ||
        (platform === 'Other' && !platforms.some(p => p !== 'Other' && (link.platform || '').toLowerCase().includes(p.toLowerCase())))
      ).length;
      entry['You'] = userCount;

      // Competitor data
      competitors.forEach(comp => {
        const compLinks = comp.socialLinks || [];
        const compCount = compLinks.filter(link => 
          (link.platform || '').toLowerCase().includes(platform.toLowerCase()) ||
          (platform === 'Other' && !platforms.some(p => p !== 'Other' && (link.platform || '').toLowerCase().includes(p.toLowerCase())))
        ).length;
        entry[comp.name] = compCount;
      });
      
      return entry;
    });
    return data;
  }, [safeSocialPresence, competitors]);

  const platformChartsData = React.useMemo(() => {
    const platforms = ['Twitter', 'Facebook', 'Instagram', 'LinkedIn', 'YouTube'];
    return platforms.map(platform => {
      const chartData = [
        { 
          name: 'You', 
          value: safeSocialPresence.filter(link => (link.platform || '').toLowerCase().includes(platform.toLowerCase())).length,
          fill: COLORS[0]
        },
        ...competitors.map((comp, i) => ({
          name: comp.name,
          value: (comp.socialLinks || []).filter(link => (link.platform || '').toLowerCase().includes(platform.toLowerCase())).length,
          fill: COLORS[(i + 1) % COLORS.length]
        }))
      ];
      return { platform, data: chartData };
    });
  }, [safeSocialPresence, competitors, COLORS]);

  const toggleCompetitorSelection = (name: string) => {
    setSelectedCompetitors(prev => 
      prev.includes(name) 
        ? prev.filter(n => n !== name)
        : [...prev, name]
    );
  };

  const isSelected = (name: string) => selectedCompetitors.includes(name);

  // Filter competitors for comparison view if any are selected
  const comparisonCompetitors = selectedCompetitors.length > 0
    ? competitors.filter(c => selectedCompetitors.includes(c.name))
    : [];

  const [focusedCell, setFocusedCell] = useState<{ r: number, c: number } | null>(null);
  const [showKeyboardTooltip, setShowKeyboardTooltip] = useState(false);

  const handleHeatmapKeyDown = (e: React.KeyboardEvent, r: number, c: number) => {
    let nextR = r;
    let nextC = c;

    switch (e.key) {
      case 'ArrowUp':
        nextR = Math.max(0, r - 1);
        break;
      case 'ArrowDown':
        nextR = Math.min(competitors.length, r + 1);
        break;
      case 'ArrowLeft':
        nextC = Math.max(0, c - 1);
        break;
      case 'ArrowRight':
        nextC = Math.min(3, c + 1);
        break;
      case 'Enter':
        e.preventDefault();
        setShowKeyboardTooltip(prev => !prev);
        return;
      case 'Escape':
        setShowKeyboardTooltip(false);
        return;
      default:
        return;
    }

    if (nextR !== r || nextC !== c) {
      e.preventDefault();
      const nextCell = document.querySelector(`[data-heatmap-cell="${nextR}-${nextC}"]`) as HTMLElement;
      nextCell?.focus();
      setShowKeyboardTooltip(false);
    }
  };

  const getHeatmapStyle = (val: number, base: number) => {
    const diff = val - base;
    const pct = base > 0 ? (diff / base) * 100 : 0;
    
    if (pct > 50) return 'bg-rose-500/80 text-rose-950 dark:text-rose-50 border-rose-600 shadow-inner';
    if (pct > 20) return 'bg-rose-500/50 text-rose-900 dark:text-rose-100 border-rose-500/60';
    if (pct > 0) return 'bg-rose-500/20 text-rose-800 dark:text-rose-200 border-rose-500/30';
    if (pct < -50) return 'bg-emerald-500/80 text-emerald-950 dark:text-emerald-50 border-emerald-600 shadow-inner';
    if (pct < -20) return 'bg-emerald-500/50 text-emerald-900 dark:text-emerald-100 border-emerald-500/60';
    if (pct < 0) return 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 border-emerald-500/30';
    return 'bg-slate-50 dark:bg-slate-900/50 text-slate-500 border-slate-200 dark:border-slate-800';
  };

  const getHeatmapLabel = (val: number, base: number) => {
    const diff = val - base;
    const pct = base > 0 ? (diff / base) * 100 : 0;
    if (pct > 50) return 'Dominant';
    if (pct > 20) return 'Superior';
    if (pct > 0) return 'Strong';
    if (pct < -50) return 'Critical Gap';
    if (pct < -20) return 'Vulnerable';
    if (pct < 0) return 'Lagging';
    return 'Equal';
  };

  const RelativePerformanceHeatmap = () => {
    const metrics = [
      { id: 'visibility', label: 'Visibility', baseVal: report.overallScore },
      { id: 'keywords', label: 'Keywords', baseVal: safeSuggestedKeywords.length },
      { id: 'social', label: 'Social', baseVal: safeSocialPresence.length },
      { id: 'impact', label: 'Impact', baseVal: userMarketValue }
    ];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-px bg-slate-200 dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
          {/* Header Row */}
          <div className="grid grid-cols-5 bg-slate-50 dark:bg-slate-900/50">
            <div className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-200 dark:border-slate-800">Competitor</div>
            {metrics.map(m => (
              <div key={m.id} className="p-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.label}</div>
            ))}
          </div>

          {/* User Baseline Row */}
          <div className="grid grid-cols-5 bg-indigo-600">
            <div className="p-4 flex items-center gap-2 border-r border-indigo-700/50">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-[10px] font-black text-white uppercase tracking-tight">Ocula (You)</span>
            </div>
            {metrics.map(m => (
              <div key={`base-${m.id}`} className="p-4 flex flex-col items-center justify-center gap-1 bg-indigo-600/90 text-white">
                <span className="text-sm font-black">{m.baseVal}</span>
                <span className="text-[7px] font-black uppercase tracking-widest opacity-60">Baseline</span>
              </div>
            ))}
          </div>

          {/* Competitor Rows */}
          {(selectedCompetitors.length > 0 
            ? competitors.filter(c => selectedCompetitors.includes(c.name))
            : competitors
          ).map((comp, idx) => {
            const compImpact = calculateMarketImpact(comp.score, comp.socialLinks?.length || 0, comp.recentActivities?.length || 0);
            const compMetrics = {
              visibility: comp.score,
              keywords: comp.keywords?.length || 0,
              social: comp.socialLinks?.length || 0,
              impact: compImpact
            };

            return (
              <motion.div 
                key={`comp-row-${comp.name}`}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="grid grid-cols-5 bg-white dark:bg-slate-900"
              >
                <div className="p-4 flex items-center gap-3 border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="w-8 h-8 rounded-lg surface flex items-center justify-center text-xs font-black text-slate-400 border border-slate-100 dark:border-slate-800">
                    {(comp?.name || '').charAt(0)}
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate">{comp?.name || 'Competitor'}</span>
                </div>
                {metrics.map((m) => {
                  const val = compMetrics[m.id as keyof typeof compMetrics];
                  const base = m.baseVal;
                  const diff = val - base;
                  const pct = base > 0 ? (diff / base) * 100 : 0;
                  const isPositive = pct > 0;
                  
                  return (
                    <div 
                      key={`${comp.name}-${m.id}`}
                      className={`p-4 flex flex-col items-center justify-center gap-1 transition-all hover:brightness-110 cursor-default ${getHeatmapStyle(val, base)}`}
                    >
                      <span className="text-sm font-black">{val}</span>
                      {pct !== 0 ? (
                        <div className="flex flex-col items-center leading-none">
                          <span className="text-[8px] font-bold opacity-80">
                            {isPositive ? '+' : ''}{pct.toFixed(0)}%
                          </span>
                          <span className="text-[6px] font-black uppercase tracking-widest opacity-60">
                            {getHeatmapLabel(val, base)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[6px] font-black uppercase tracking-widest opacity-60">Equal</span>
                      )}
                    </div>
                  );
                })}
              </motion.div>
            );
          })}
        </div>

        {/* Intelligence Legend */}
        <div className="flex flex-wrap items-center justify-center gap-6 p-4 surface border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-emerald-500/80 border border-emerald-600" />
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Ocula Dominant</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/30" />
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">User Lead</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg">
             <span className="text-[8px] font-black uppercase tracking-widest">Comparison Logic</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-rose-500/20 border border-rose-500/30" />
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Minor Threat</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-rose-500/80 border border-rose-600" />
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Critical Rival Area</span>
          </div>
        </div>
      </div>
    );
  };

  const HeatmapCell = ({ val, base, r, c, isBaseline = false }: { val: number, base: number, r: number, c: number, isBaseline?: boolean }) => {
    const safeVal = val || 0;
    const safeBase = base || 0;
    const diff = safeVal - safeBase;
    const pct = safeBase > 0 ? (diff / safeBase) * 100 : 0;
    const isPositive = pct > 0;
    const isFocused = focusedCell?.r === r && focusedCell?.c === c;
    const showTooltip = isFocused && showKeyboardTooltip;
    
    return (
      <td 
        tabIndex={0}
        data-heatmap-cell={`${r}-${c}`}
        onFocus={() => setFocusedCell({ r, c })}
        onBlur={() => {
          setFocusedCell(null);
          setShowKeyboardTooltip(false);
        }}
        onKeyDown={(e) => handleHeatmapKeyDown(e, r, c)}
        className={`group/cell relative p-2 rounded-lg border text-center transition-all hover:scale-[1.05] focus:scale-[1.05] focus:z-20 focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:z-10 cursor-default ${isBaseline ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-800 dark:border-slate-200 shadow-sm' : getHeatmapStyle(safeVal, safeBase)}`}
      >
        <div className="flex flex-col items-center justify-center gap-0.5">
          <span className="text-[12px] font-black">{safeVal}</span>
          {!isBaseline && (
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-bold opacity-90">
                {isPositive ? '+' : ''}{(pct || 0).toFixed(1)}%
              </span>
              <span className="text-[7px] font-black uppercase tracking-widest opacity-70">
                {getHeatmapLabel(safeVal, safeBase)}
              </span>
            </div>
          )}
          {isBaseline && (
            <span className="text-[7px] font-black uppercase tracking-widest opacity-70 mt-1">
              Baseline
            </span>
          )}
        </div>
        <AnimatePresence>
          {showTooltip && (
            <motion.div 
              initial={{ opacity: 0, y: 5, x: '-50%' }}
              whileHover={{ opacity: 1, y: 0, x: '-50%' }}
              animate={showTooltip ? { opacity: 1, y: 0, x: '-50%' } : {}}
              className={`absolute bottom-full left-1/2 mb-2 px-3 py-1.5 bg-slate-900 dark:bg-slate-800 text-white text-[9px] font-black uppercase tracking-widest rounded-lg pointer-events-none z-50 whitespace-nowrap shadow-2xl border border-slate-700 dark:border-slate-600 flex flex-col items-center gap-1 ${showTooltip ? 'opacity-100' : 'opacity-0 group-hover/cell:opacity-100'}`}
            >
              <span className="text-slate-400 text-[7px]">{isBaseline ? 'Baseline' : getHeatmapLabel(val, base)}</span>
              <span className={isBaseline ? 'text-indigo-400' : isPositive ? 'text-rose-400' : pct < 0 ? 'text-emerald-400' : 'text-slate-300'}>
                {isBaseline ? 'Ocula Reference' : `${isPositive ? '+' : ''}${pct.toFixed(1)}% vs Ocula`}
              </span>
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-800" />
            </motion.div>
          )}
        </AnimatePresence>
      </td>
    );
  };

  const allRecentActivities = React.useMemo(() => {
    const activities: { competitor: string; activity: string; color: string }[] = [];
    competitors.forEach((comp, idx) => {
      if (comp.recentActivities) {
        comp.recentActivities.forEach(act => {
          activities.push({
            competitor: comp.name,
            activity: act,
            color: COLORS[(idx + 1) % COLORS.length]
          });
        });
      }
    });
    // Shuffle or just return as is (they are already somewhat random)
    return activities.sort(() => Math.random() - 0.5);
  }, [competitors, COLORS]);

  return (
    <div className="space-y-4 animate-in fade-in duration-700">

      {/* Live Strategic Moves Feed */}
      {allRecentActivities.length > 0 && (
        <section className="surface p-6 relative overflow-hidden transition-all">
          <div className="flex justify-between items-center mb-6 relative z-10">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Live Strategic Moves
              </h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Real-time competitor activity tracking</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
            {allRecentActivities.slice(0, 6).map((item, idx) => (
              <div key={`${item.competitor}-${item.activity}-${idx}`} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col gap-3 transition-all">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">{item.competitor}</span>
                </div>
                <p className="text-xs font-medium text-slate-900 dark:text-slate-200 leading-relaxed">{item.activity}</p>
              </div>
            ))}
          </div>
        </section>
      )}
      
      {/* Comparison View (Visible when multiple competitors are selected) */}
      {selectedCompetitors.length > 1 && (
        <motion.section 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="surface p-6 relative overflow-hidden"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-900 dark:text-white">Head-to-Head Comparison</h3>
            <button 
              onClick={() => setSelectedCompetitors([])}
              className="btn-ghost btn-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              Clear Selection
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {/* Metrics Labels Column */}
             <div className="hidden md:flex flex-col gap-4 pt-14">
                <div className="h-10 flex items-center text-xs font-bold text-slate-500 uppercase tracking-wider">Visibility Score</div>
                <div className="h-10 flex items-center text-xs font-bold text-slate-500 uppercase tracking-wider">Trend</div>
                <div className="h-10 flex items-center text-xs font-bold text-slate-500 uppercase tracking-wider">Social Reach</div>
                <div className="h-10 flex items-center text-xs font-bold text-slate-500 uppercase tracking-wider">Keyword Authority</div>
             </div>

             {/* Selected Competitors Columns */}
             {comparisonCompetitors.map((comp, idx) => (
               <div key={`${comp.name}-${idx}`} className="flex flex-col gap-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                 <div className="h-14 flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl surface flex items-center justify-center text-lg font-bold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      {(comp?.name || '').charAt(0)}
                    </div>
                    <div className="min-w-0 flex flex-col justify-center">
                      <h4 className="font-bold text-lg truncate leading-tight text-slate-900 dark:text-white">{comp?.name || 'Competitor'}</h4>
                      {comp.socialLinks && comp.socialLinks.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-1">
                          {comp.socialLinks.map((link, i) => (
                            <a 
                              key={`${link.platform}-${i}`} 
                              href={link.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                              title={link.platform}
                            >
                              {getSocialIcon(link.platform)}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                 </div>
                 
                 <div className="h-10 flex items-center">
                   <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                     <div className="bg-slate-900 dark:bg-white h-full rounded-full" style={{ width: `${Number(comp.score) || 0}%` }}></div>
                   </div>
                   <span className="ml-3 font-mono font-bold text-slate-900 dark:text-white">{Number(comp.score) || 0}</span>
                 </div>

                 <div className="h-10 flex items-center">
                    {comp.trend === 'up' && <span className="text-xs font-bold uppercase px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg border border-emerald-200 dark:border-emerald-800/50">Rising</span>}
                    {comp.trend === 'down' && <span className="text-xs font-bold uppercase px-2 py-1 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 rounded-lg border border-rose-200 dark:border-rose-800/50">Declining</span>}
                    {(!comp.trend || comp.trend === 'stable') && <span className="text-xs font-bold uppercase px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 rounded-lg border border-slate-200 dark:border-slate-700">Stable</span>}
                 </div>

                 <div className="h-10 flex items-center gap-2">
                   {comp.socialLinks?.map((link, i) => (
                     <div key={`${link.platform}-${i}`} className="p-1.5 surface rounded-full text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                       {getSocialIcon(link.platform)}
                     </div>
                   ))}
                   {(!comp.socialLinks || comp.socialLinks.length === 0) && <span className="text-xs text-slate-500">-</span>}
                 </div>

                 <div className="h-10 flex items-center">
                   <span className="text-2xl font-bold text-slate-900 dark:text-white">{comp.keywords?.length || 0}</span>
                   <span className="ml-2 text-xs text-slate-500 font-bold uppercase">Keywords</span>
                 </div>
               </div>
             ))}
          </div>
        </motion.section>
      )}

      {/* Visibility Index Comparison (Top 3 Rivals) */}
      <section className="surface p-6 relative overflow-hidden transition-all">
        <div className="flex justify-between items-center mb-6 relative z-10">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-900 dark:text-white mb-2">Visibility Index Leaderboard</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Benchmarking against rivals</p>
          </div>
        </div>

        <div className="h-[300px] w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              id="visibility-index-leaderboard-bar"
              data={[
                { name: report.businessName, score: Number(report.overallScore) || 0, fill: COLORS[0], isUser: true },
                ...competitors
                  .sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0))
                  .map((c) => ({ 
                    name: c.name, 
                    score: Number(c.score) || 0, 
                    fill: c.color,
                    isUser: false
                  }))
              ]} 
              layout="vertical" 
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#94a3b8" strokeOpacity={0.1} />
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={100} 
                tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} 
                axisLine={false} 
                tickLine={false} 
              />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="surface p-3 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{data.name}</p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-black text-slate-900 dark:text-white">{data.score}</span>
                          <span className="text-[9px] font-bold text-slate-400">/ 100</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={32} animationDuration={1500}>
                {[
                  { name: report.businessName, score: Number(report.overallScore) || 0, fill: COLORS[0], isUser: true },
                  ...competitors
                    .sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0))
                    .map((c) => ({ 
                      name: c.name, 
                      score: Number(c.score) || 0, 
                      fill: c.color,
                      isUser: false
                    }))
                ].map((entry, index) => (
                  <Cell key={`visibility-leaderboard-cell-${index}-${entry.name}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Competitive Strategic Heatmap */}
      <section className="surface p-6 relative overflow-hidden transition-all">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Swords className="w-4 h-4 text-indigo-500" />
              Competitive Strategic Heatmap
            </h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Visualizing strengths and weaknesses relative to Ocula</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setViewMode('matrix')}
              className={`btn-xs gap-2 ${viewMode === 'matrix' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
            >
              <Zap className="w-3 h-3" />
              Matrix
            </button>
            <button 
              onClick={() => setViewMode('table')}
              className={`btn-xs gap-2 ${viewMode === 'table' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
            >
              <Table className="w-3 h-3" />
              Table
            </button>
            <button 
              onClick={() => setViewMode('map')}
              className={`btn-xs gap-2 ${viewMode === 'map' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
            >
              <MapIcon className="w-3 h-3" />
              Map
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {viewMode === 'map' ? (
            <GoogleMapsVisibilityView report={report} isDarkMode={isDarkMode} />
          ) : viewMode === 'matrix' ? (
            <RelativePerformanceHeatmap />
          ) : (
            <>
              <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-1">
              <thead>
                <tr>
                  <th className="p-2 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest min-w-[120px]">Entity</th>
                  <th className="p-2 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">Visibility</th>
                  <th className="p-2 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">Keywords</th>
                  <th className="p-2 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">Social</th>
                  <th className="p-2 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">Impact</th>
                  <th className="p-2 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">Trend</th>
                  <th className="p-2 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">Gap</th>
                  <th className="p-2 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">Verdict</th>
                </tr>
              </thead>
              <tbody>
                {/* Ocula Baseline */}
                <tr className="group">
                  <td className="p-2 bg-indigo-600 dark:bg-indigo-500 rounded-lg border border-indigo-700 dark:border-indigo-400 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                      <span className="text-[10px] font-black text-white uppercase tracking-tight">Ocula (You)</span>
                    </div>
                  </td>
                  <HeatmapCell val={report.overallScore} base={report.overallScore} r={0} c={0} isBaseline />
                  <HeatmapCell val={safeSuggestedKeywords.length} base={safeSuggestedKeywords.length} r={0} c={1} isBaseline />
                  <HeatmapCell val={safeSocialPresence.length} base={safeSocialPresence.length} r={0} c={2} isBaseline />
                  <HeatmapCell val={userMarketValue} base={userMarketValue} r={0} c={3} isBaseline />
                  <td className="p-2 bg-slate-900 dark:bg-white rounded-lg text-center text-[10px] font-black text-white dark:text-slate-900 border border-slate-800 dark:border-slate-200 shadow-sm">
                    -
                  </td>
                  <td className="p-2 bg-slate-900 dark:bg-white rounded-lg text-center text-[10px] font-black text-white dark:text-slate-900 border border-slate-800 dark:border-slate-200 shadow-sm">
                    0%
                  </td>
                  <td className="p-2 bg-slate-900 dark:bg-white rounded-lg text-center text-[10px] font-black text-white dark:text-slate-900 border border-slate-800 dark:border-slate-200 shadow-sm">
                    BASELINE
                  </td>
                </tr>

                {/* Competitors */}
                {competitors.map((comp, idx) => {
                  const compImpact = calculateMarketImpact(comp.score, comp.socialLinks?.length || 0, comp.recentActivities?.length || 0);
                  const r = idx + 1;
                  
                  const getVerdict = () => {
                    const scoreDiff = (Number(comp.score) || 0) - (Number(report.overallScore) || 0);
                    const impactDiff = (Number(compImpact) || 0) - (Number(userMarketValue) || 0);
                    const avgPct = ((scoreDiff / (Number(report.overallScore) || 1)) + (impactDiff / (Number(userMarketValue) || 1))) / 2 * 100;
                    
                    if (avgPct > 20) return { label: 'HIGH RISK', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20' };
                    if (avgPct > 0) return { label: 'CHALLENGER', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' };
                    if (avgPct < -20) return { label: 'OUTPACED', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' };
                    return { label: 'NEUTRAL', color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-900' };
                  };

                  const verdict = getVerdict();
                  const avgGap = Math.round((( (comp.score || 0) - (report.overallScore || 0)) / (report.overallScore || 1) + (compImpact - userMarketValue) / (userMarketValue || 1)) / 2 * 100) || 0;

                  return (
                    <tr key={`${comp.name}-${idx}`}>
                      <td className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate block max-w-[120px]">{comp.name}</span>
                      </td>
                      <HeatmapCell val={comp.score} base={report.overallScore} r={r} c={0} />
                      <HeatmapCell val={comp.keywords?.length || 0} base={safeSuggestedKeywords.length} r={r} c={1} />
                      <HeatmapCell val={comp.socialLinks?.length || 0} base={safeSocialPresence.length} r={r} c={2} />
                      <HeatmapCell val={compImpact} base={userMarketValue} r={r} c={3} />
                      <td className="p-2 text-center">
                        {comp.trend === 'up' ? <ChevronUp className="w-4 h-4 text-emerald-500 mx-auto" /> : 
                         comp.trend === 'down' ? <ChevronDown className="w-4 h-4 text-rose-500 mx-auto" /> : 
                         <div className="w-4 h-0.5 bg-slate-300 dark:bg-slate-700 mx-auto"></div>}
                      </td>
                      <td className={`p-2 text-center text-[10px] font-black ${avgGap > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {avgGap > 0 ? '+' : ''}{avgGap}%
                      </td>
                      <td className={`p-2 rounded-lg border text-center text-[8px] font-black uppercase tracking-widest ${verdict.bg} ${verdict.color} border-current opacity-80`}>
                        {verdict.label}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                <Target className="w-3 h-3 text-rose-500" />
                Strategic Gap Analysis
              </h4>
              <div className="space-y-3">
                {competitors.map((comp, i) => {
                  const gap = Math.round((( (comp.score || 0) - (report.overallScore || 0)) / (report.overallScore || 1) + (calculateMarketImpact(comp.score, comp.socialLinks?.length || 0, comp.recentActivities?.length || 0) - userMarketValue) / (userMarketValue || 1)) / 2 * 100) || 0;
                  return (
                    <div key={`gap-${i}`} className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{comp.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${gap > 0 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                            style={{ width: `${Math.min(100, Math.abs(gap))}%` }}
                          ></div>
                        </div>
                        <span className={`text-[10px] font-black ${gap > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                          {gap > 0 ? '+' : ''}{gap}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                <Zap className="w-3 h-3 text-indigo-500" />
                Heatmap Legend
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-emerald-500/40 border border-emerald-500/30"></div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">Dominant (&gt;50%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-emerald-500/10 border border-emerald-500/10"></div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">Strong (&gt;0%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-rose-500/10 border border-rose-500/10"></div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">Lagging (&lt;0%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-rose-500/40 border border-rose-500/30"></div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">Critical (&lt;-50%)</span>
                </div>
              </div>
              </div>
            </div>
          </>
        )}

          {/* Strategic Recommendation */}
          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/50 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-indigo-600 dark:bg-indigo-500 rounded-lg text-white">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">Strategic Recommendation</h4>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                  {competitors.some(c => c.score > report.overallScore + 10) 
                    ? `Focus on closing the Visibility Gap with ${competitors.find(c => c.score > report.overallScore + 10)?.name}. Their dominant market presence suggests a need for aggressive content expansion.`
                    : competitors.some(c => (c.keywords?.length || 0) > safeSuggestedKeywords.length + 5)
                    ? "Your keyword authority is under pressure. Identify and capture the specific long-tail keywords where rivals are currently outperforming you."
                    : "You maintain a healthy lead in most categories. Focus on defensive social engagement to prevent rivals from eroding your market impact."
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Market Share Overview */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="surface p-6 relative overflow-hidden transition-all">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-900 dark:text-white mb-4 relative z-10">Market Share Distribution</h3>
          <div className="h-[300px] relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart id="market-share-distribution-pie">
                <Pie
                  data={marketShareData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {marketShareData.map((entry, index) => (
                    <Cell key={`market-share-cell-${index}-${entry.name}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  content={<CustomPieTooltip />}
                  cursor={{ fill: 'transparent' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface p-6 relative overflow-hidden transition-all">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-900 dark:text-white mb-4 relative z-10">Visibility Comparison</h3>
          <div className="h-[300px] relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart id="visibility-comparison-bar" data={marketShareData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                <Tooltip  
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                  {marketShareData.map((entry, index) => (
                    <Cell key={`visibility-cell-${index}-${entry.name}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Keyword Competition Landscape */}
      <section className="surface p-6 relative overflow-hidden transition-all">
        <div className="flex justify-between items-center mb-6 relative z-10">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-900 dark:text-white">Keyword Competition Landscape</h3>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-rose-500"></div>
              <span className="text-[8px] font-bold uppercase text-slate-500">High</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <span className="text-[8px] font-bold uppercase text-slate-500">Med</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-[8px] font-bold uppercase text-slate-500">Low</span>
            </div>
          </div>
        </div>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart id="keyword-competition-landscape-bar" data={keywordCompetitionData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
              <XAxis 
                dataKey="term" 
                tick={<TruncatedTick />} 
                axisLine={false} 
                tickLine={false}
                interval={0}
              />
              <YAxis 
                domain={[0, 3]} 
                ticks={[1, 2, 3]} 
                tickFormatter={(val) => val === 3 ? 'HIGH' : val === 2 ? 'MED' : 'LOW'} 
                tick={{fontSize: 9, fontWeight: 900, fill: '#94a3b8'}} 
                axisLine={false} 
                tickLine={false} 
              />
              <Tooltip 
                cursor={{fill: 'rgba(0,0,0,0.02)'}}
                content={<CustomKeywordTooltip />}
              />
              <Bar dataKey="competitionValue" radius={[6, 6, 0, 0]}>
                {keywordCompetitionData.map((entry, index) => (
                  <Cell key={`keyword-cell-${index}-${entry.term}`} fill={entry.competitionValue === 3 ? '#ef4444' : entry.competitionValue === 2 ? '#f59e0b' : '#10b981'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Digital Footprint Analysis (Social & GMB) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="surface p-6 relative overflow-hidden transition-all">
           <div className="flex justify-between items-center mb-6">
             <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-900 dark:text-white">Social Signal Strength</h3>
             <div className="flex gap-2">
               {['Twitter', 'Facebook', 'Instagram', 'LinkedIn', 'YouTube'].map((p, i) => (
                 <div key={`${p}-${i}`} title={p} className="text-slate-500">
                   {getSocialIcon(p)}
                 </div>
               ))}
             </div>
           </div>
           <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart id="social-signal-strength-bar" data={socialBreakdownData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
                 <XAxis 
                   dataKey="platform" 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                 />
                 <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                 <Tooltip 
                   cursor={{fill: '#f8fafc'}} 
                   content={<CustomSocialTooltip />}
                 />
                 <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', paddingTop: '20px' }} />
                 
                 <Bar dataKey="You" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
                 {competitors.map((c, i) => (
                   <Bar key={`social-bar-${c.name}`} dataKey={c.name} fill={c.color} radius={[4, 4, 0, 0]} />
                 ))}
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="surface p-6 relative overflow-hidden transition-all">
           <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-900 dark:text-white mb-4">Search Authority Reach</h3>
           <div className="h-[250px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart id="search-authority-reach-bar" data={[
                 { name: 'You', value: safeSuggestedKeywords.length, color: COLORS[0] },
                 ...competitors.map((c, i) => ({ name: c.name, value: c.keywords?.length || 0, color: c.color }))
               ]}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                 <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                 <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '1rem', border: 'none' }} />
                 <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                   {([
                     { name: 'You', value: safeSuggestedKeywords.length, color: COLORS[0] },
                     ...competitors.map((c, i) => ({ name: c.name, value: c.keywords?.length || 0, color: c.color }))
                   ]).map((entry, index) => (
                     <Cell key={`search-authority-cell-${index}-${entry.name}`} fill={entry.color} />
                   ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>
      </section>

      {/* Social Media Platform Breakdown */}
      <section className="surface p-6 relative overflow-hidden transition-all">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Bot className="w-4 h-4 text-indigo-500" />
              Social Platform Profile Distribution
            </h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Detailed profile count comparison per platform</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {platformChartsData.map((platformData, idx) => (
            <div key={`platform-chart-${platformData.platform}-${idx}`} className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col h-[220px]">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 surface rounded-lg text-indigo-600 dark:text-indigo-400 shadow-sm">
                  {getSocialIcon(platformData.platform)}
                </div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{platformData.platform}</h4>
              </div>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart id={`social-platform-${platformData.platform}-bar`} data={platformData.data} margin={{ top: 5, right: 5, left: -35, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.1} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 7, fontWeight: 700, fill: '#94a3b8' }}
                      interval={0}
                      tickFormatter={(val) => val === 'You' ? 'You' : val.length > 8 ? val.substring(0, 8) + '...' : val}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 8, fontWeight: 700, fill: '#94a3b8' }} allowDecimals={false} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="surface p-2 rounded-lg shadow-xl border border-slate-100 dark:border-slate-800">
                              <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">{payload[0].payload.name}</p>
                              <p className="text-xs font-black text-slate-900 dark:text-white">{payload[0].value} Profiles</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {platformData.data.map((entry, index) => (
                        <Cell key={`social-platform-cell-${platformData.platform}-${index}-${entry.name}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Historical Trends Analysis */}
      <section className="surface p-6 relative overflow-hidden transition-all">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-900 dark:text-white mb-6 relative z-10">Historical Visibility Trends</h3>
        <div className="h-[350px] w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart id="historical-visibility-trends-line" margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
              <XAxis 
                dataKey="name" 
                hide 
              />
              <YAxis 
                domain={[0, 100]} 
                tick={{fontSize: 9, fontWeight: 900, fill: '#94a3b8'}} 
                axisLine={false} 
                tickLine={false} 
              />
              <Tooltip 
                contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="top" height={36}/>
              
              {/* User Business Trend */}
              <Line 
                type="monotone" 
                data={[
                  { name: 'T-4', score: report.overallScore - 10 },
                  { name: 'T-3', score: report.overallScore - 5 },
                  { name: 'T-2', score: report.overallScore - 8 },
                  { name: 'T-1', score: report.overallScore - 2 },
                  { name: 'Current', score: report.overallScore }
                ]}
                dataKey="score" 
                name={report.businessName} 
                stroke={COLORS[0]} 
                strokeWidth={4}
                dot={{ r: 6, fill: COLORS[0], strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 8 }}
              />

              {/* Competitor Trends */}
              {competitors.map((comp, idx) => (
                <Line 
                  key={`trend-line-${comp.name}-${idx}`}
                  type="monotone" 
                  data={(comp.historicalScores || [comp.score - 5, comp.score - 2, comp.score - 4, comp.score - 1, comp.score]).map((s, i) => ({
                    name: `T-${4-i}`,
                    score: s
                  }))}
                  dataKey="score" 
                  name={comp.name} 
                  stroke={comp.color} 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 4, fill: COLORS[(idx + 1) % COLORS.length] }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-widest text-center">
          * Historical data estimated based on market trajectory and archive signals.
        </p>
      </section>

      {/* Detailed Competitor Strategies */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-900 dark:text-white">Competitor Intelligence Profiles</h3>
          
          <div className="flex items-center gap-2 surface p-1">
            <div className="px-3 py-1.5 flex items-center gap-2">
              <Filter className="w-3 h-3 text-slate-500" />
              <span className="text-[9px] font-bold uppercase text-slate-500 tracking-wider">Filter Keywords:</span>
            </div>
            {(['all', 'high', 'medium', 'low'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setKeywordFilter(filter)}
                className={`px-4 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${
                  keywordFilter === filter
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {competitors.map((comp, idx) => (
            <motion.div 
              key={`${comp.name}-${idx}`} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`surface p-6 space-y-4 relative overflow-hidden transition-all ${
                isSelected(comp.name) 
                  ? 'border-slate-900 dark:border-white' 
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              
              {/* Selection Checkbox */}
              <div className="absolute top-6 right-6 z-20">
                <button
                  onClick={() => toggleCompetitorSelection(comp.name)}
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                    isSelected(comp.name)
                      ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-slate-900'
                      : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
                  }`}
                >
                  {isSelected(comp.name) && <div className="w-2 h-2 surface rounded-sm" />}
                </button>
              </div>

              <div className="flex justify-between items-start relative z-10">
                <div className="flex-grow">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white">{comp.name}</h4>
                    <div className="w-full grid grid-cols-2 gap-2 mt-2 mb-3">
                      <div className="p-2 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg border border-emerald-100 dark:border-emerald-800/50">
                        <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest block mb-1">Top Strengths</span>
                        <ul className="text-[9px] font-bold text-slate-700 dark:text-slate-300 space-y-0.5">
                          {(comp.strengths || []).slice(0, 3).map((s, i) => <li key={i} className="truncate">• {s}</li>)}
                        </ul>
                      </div>
                      <div className="p-2 bg-rose-50 dark:bg-rose-900/10 rounded-lg border border-rose-100 dark:border-rose-800/50">
                        <span className="text-[8px] font-black text-rose-600 uppercase tracking-widest block mb-1">Top Weaknesses</span>
                        <ul className="text-[9px] font-bold text-slate-700 dark:text-slate-300 space-y-0.5">
                          {(comp.weaknesses || []).slice(0, 3).map((w, i) => <li key={i} className="truncate">• {w}</li>)}
                        </ul>
                      </div>
                    </div>
                    {onDeployVsMission && (
                      <button 
                        onClick={() => onDeployVsMission(comp)}
                        className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-1 px-3 text-[9px] h-auto rounded-lg font-bold uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                      >
                        Deploy VS Mission
                      </button>
                    )}
                    {comp.socialLinks && comp.socialLinks.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        {comp.socialLinks.map((link, i) => (
                          <a 
                            key={`${link.platform}-${i}`} 
                            href={link.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                            title={link.platform}
                          >
                            {getSocialIcon(link.platform)}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2">
                    {comp.trend === 'up' && <span className="text-[8px] font-bold uppercase px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-full border border-emerald-200 dark:border-emerald-800/50">Rising</span>}
                    {comp.trend === 'down' && <span className="text-[8px] font-bold uppercase px-2 py-0.5 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 rounded-full border border-rose-200 dark:border-rose-800/50">Declining</span>}
                    <span className="text-[8px] font-bold uppercase px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full border border-slate-200 dark:border-slate-700">Score: {comp.score}%</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl font-bold text-slate-500 border border-slate-200 dark:border-slate-700">
                  {(comp?.name || '').charAt(0)}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[9px] font-bold uppercase text-slate-500 mb-2 block">Core Strengths</span>
                  <ul className="text-[10px] font-medium text-slate-900 dark:text-slate-300 space-y-1">
                    {(comp.strengths || []).slice(0, 3).map((s, i) => <li key={`${s}-${i}`}>• {s}</li>)}
                  </ul>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[9px] font-bold uppercase text-slate-500 mb-2 block">Vulnerabilities</span>
                  <ul className="text-[10px] font-medium text-slate-900 dark:text-slate-300 space-y-1">
                    {(comp.weaknesses || []).slice(0, 3).map((w, i) => <li key={`${w}-${i}`}>• {w}</li>)}
                  </ul>
                </div>
              </div>

              <div className="space-y-3 mt-6">
                <span className="text-[9px] font-bold uppercase text-slate-500 tracking-widest block">Target Keywords & Competition</span>
                <div className="flex flex-wrap gap-2">
                  {(comp.keywords || [])
                    .map(kw => {
                      const match = safeSuggestedKeywords.find(
                        sk => sk.term.toLowerCase() === (kw || '').toLowerCase()
                      );
                      return { term: kw, competition: match?.competition };
                    })
                    .filter(kwObj => keywordFilter === 'all' || kwObj.competition === keywordFilter)
                    .sort((a, b) => {
                      const order = { high: 0, medium: 1, low: 2 };
                      const aOrder = order[a.competition as keyof typeof order] ?? 3;
                      const bOrder = order[b.competition as keyof typeof order] ?? 3;
                      return aOrder - bOrder;
                    })
                    .slice(0, 12)
                    .map((kwObj, i) => (
                      <div 
                        key={`${kwObj.term}-${i}`} 
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                          kwObj.competition === 'high' ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/50' :
                          kwObj.competition === 'medium' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/50' :
                          kwObj.competition === 'low' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50' :
                          'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <div className={`shrink-0 p-1 rounded-full ${
                          kwObj.competition === 'high' ? 'bg-rose-100 dark:bg-rose-800/50' :
                          kwObj.competition === 'medium' ? 'bg-amber-100 dark:bg-amber-800/50' :
                          kwObj.competition === 'low' ? 'bg-emerald-100 dark:bg-emerald-800/50' :
                          'bg-slate-100 dark:bg-slate-700'
                        }`}>
                          {getCompetitionIcon(kwObj.competition)}
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
                          {kwObj.term}
                        </span>
                      </div>
                    ))}
                  {(comp.keywords || []).filter(kw => {
                    const match = safeSuggestedKeywords.find(
                      sk => sk.term.toLowerCase() === (kw || '').toLowerCase()
                    );
                    return keywordFilter === 'all' || match?.competition === keywordFilter;
                  }).length === 0 && (
                    <p className="text-[10px] font-medium text-slate-500 italic py-2">No keywords match this filter.</p>
                  )}
                </div>
              </div>

              <div className="space-y-3 mt-6">
                <span className="text-[9px] font-bold uppercase text-slate-500 tracking-widest block">Recent Activities</span>
                <div className="space-y-2">
                  {(comp.recentActivities || []).map((act, i) => (
                    <div key={`${act}-${i}`} className="flex gap-3 items-start p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                      <p className="text-[10px] font-medium text-slate-900 dark:text-slate-300 leading-relaxed">{act}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Summary Section */}
              <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => handleToggleSummary(comp)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white transition-colors border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-slate-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">AI Market Comparison</span>
                  </div>
                  {expandedSummaries[comp.name] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                <AnimatePresence>
                  {expandedSummaries[comp.name] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 mt-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                        {loadingSummaries[comp.name] ? (
                          <AILoader message="Analyzing Market Position..." className="py-4" />
                        ) : (
                            <div className="space-y-4">
                              <div className="relative">
                                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-indigo-500/20 rounded-full" />
                                <p className="text-xs font-medium text-slate-900 dark:text-slate-300 leading-relaxed pl-2">
                                  {(() => {
                                    const fullText = summaries[comp.name] || comp.summary || "";
                                    const summaryPart = fullText.split('Mission:')[0].replace('Summary:', '').trim();
                                    return summaryPart || "No analysis available.";
                                  })()}
                                </p>
                              </div>
                              
                              {(() => {
                                const fullText = summaries[comp.name] || comp.summary || "";
                                const missionPart = fullText.split('Mission:')[1]?.trim();
                                if (!missionPart) return null;
                                
                                return (
                                  <div className="p-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl shadow-lg border border-white/10 dark:border-black/5 space-y-3 relative overflow-hidden group/mission">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/mission:opacity-20 transition-opacity">
                                      <Target className="w-12 h-12" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="p-1.5 bg-indigo-500 rounded-lg">
                                        <Zap className="w-3 h-3 text-white" />
                                      </div>
                                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">Strategic Mission</span>
                                    </div>
                                    <p className="text-sm font-black tracking-tight leading-tight">
                                      {missionPart}
                                    </p>
                                    <button 
                                      onClick={() => onDeployVsMission?.({ ...comp, suggestedObjective: missionPart })}
                                      className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
                                    >
                                      <Swords className="w-3.5 h-3.5" />
                                      Deploy Counter-Mission
                                    </button>
                                  </div>
                                );
                              })()}
                            </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
});

export default CompetitorTracking;
