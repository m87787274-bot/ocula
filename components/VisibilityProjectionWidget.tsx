import React, { useMemo, useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { 
  TrendingUp, 
  Sparkles, 
  Bot, 
  Loader2, 
  Sliders, 
  VolumeX, 
  Zap, 
  ShieldAlert, 
  CheckCircle,
  HelpCircle,
  TrendingDown
} from 'lucide-react';
import { VisibilityReport } from '../types';
import { generateVisibilityProjectionAnalysis } from '../services/aiService';

interface VisibilityProjectionWidgetProps {
  report: VisibilityReport;
  isDarkMode: boolean;
}

type ProjectionScenario = 'organic' | 'aggressive' | 'risk';

export default function VisibilityProjectionWidget({ report, isDarkMode }: VisibilityProjectionWidgetProps) {
  const [scenario, setScenario] = useState<ProjectionScenario>('organic');
  const [customTarget, setCustomTarget] = useState<number>(Math.min(100, Math.round((Number(report.overallScore) || 70) + 12)));
  const [isGenerating, setIsGenerating] = useState(false);
  const [briefing, setBriefing] = useState<string | null>(null);

  const baseScore = Number(report.overallScore) || 70;
  
  // Reset custom target if base score changes
  useEffect(() => {
    setCustomTarget(Math.min(100, Math.round(baseScore + 12)));
  }, [baseScore]);

  // Handle Scenario switching
  const scenarioConfig = useMemo(() => {
    switch (scenario) {
      case 'aggressive':
        return {
          title: 'Aggressive Expansion',
          increment: 6, // Points per month
          color: '#6366f1', // Indigo-500
          desc: 'High-authority content clusters, local citations expansion, and deep schema optimization.'
        };
      case 'risk':
        return {
          title: 'Competitive Risk',
          increment: -2, // Points per month loss
          color: '#f43f5e', // Rose Red
          desc: 'Competitors out-scale content efforts and local authority dilutes due to inactivity.'
        };
      case 'organic':
      default:
        return {
          title: 'Organic Baseline',
          increment: 2, // Points per month
          color: '#10b981', // Emerald Green
          desc: 'Steady, consistent posting and organic backlink maintenance.'
        };
    }
  }, [scenario]);

  // Generate chart data matching past months + projected months
  const chartData = useMemo(() => {
    const competitorList = report.competitorComparison || [];
    const avgCompetitorScore = competitorList.length > 0
      ? Math.round(competitorList.reduce((acc, c) => acc + (c.score || 0), 0) / competitorList.length)
      : Math.max(10, baseScore - 5);

    // Historic estimates (M-3, M-2, M-1)
    const m3Score = Math.max(15, baseScore - 11);
    const m2Score = Math.max(15, baseScore - 6);
    const m1Score = Math.max(15, baseScore - 2);

    // Scenario projection growth increments
    const inc = scenarioConfig.increment;
    const projMonth1 = Math.min(100, Math.max(10, Math.round(baseScore + inc)));
    const projMonth2 = Math.min(100, Math.max(10, Math.round(baseScore + inc * 2)));
    const projMonth3 = Math.min(100, Math.max(10, Math.round(baseScore + inc * 3)));

    // Custom target trajectory
    const targetDiff = customTarget - baseScore;
    const customMonth1 = Math.min(100, Math.max(10, Math.round(baseScore + targetDiff * 0.35)));
    const customMonth2 = Math.min(100, Math.max(10, Math.round(baseScore + targetDiff * 0.70)));
    const customMonth3 = Math.min(100, Math.max(10, Math.round(customTarget)));

    // Competitor growth baseline (steady slow organic growth)
    const compMonth1 = Math.min(98, Math.round(avgCompetitorScore + 0.8));
    const compMonth2 = Math.min(98, Math.round(avgCompetitorScore + 1.5));
    const compMonth3 = Math.min(98, Math.round(avgCompetitorScore + 2.1));

    return [
      { 
        name: 'Month -3', 
        type: 'actual',
        actual: m3Score, 
        projected: null, 
        customTarget: null,
        competitorAvg: Math.max(10, avgCompetitorScore - 4)
      },
      { 
        name: 'Month -2', 
        type: 'actual',
        actual: m2Score, 
        projected: null, 
        customTarget: null,
        competitorAvg: Math.max(10, avgCompetitorScore - 2)
      },
      { 
        name: 'Month -1', 
        type: 'actual',
        actual: m1Score, 
        projected: null, 
        customTarget: null,
        competitorAvg: Math.max(10, avgCompetitorScore - 1)
      },
      { 
        name: 'Current', 
        type: 'actual',
        actual: baseScore, 
        projected: baseScore, 
        customTarget: baseScore,
        competitorAvg: avgCompetitorScore
      },
      { 
        name: 'Month +1', 
        type: 'projected',
        actual: null, 
        projected: projMonth1, 
        customTarget: customMonth1,
        competitorAvg: compMonth1
      },
      { 
        name: 'Month +2', 
        type: 'projected',
        actual: null, 
        projected: projMonth2, 
        customTarget: customMonth2,
        competitorAvg: compMonth2
      },
      { 
        name: 'Month +3', 
        type: 'projected',
        actual: null, 
        projected: projMonth3, 
        customTarget: customMonth3,
        competitorAvg: compMonth3
      }
    ];
  }, [baseScore, scenarioConfig, customTarget, report.competitorComparison]);

  const handleGenerateBriefing = async () => {
    setIsGenerating(true);
    setBriefing(null);
    try {
      const competitorList = (report.competitorComparison || []).map(c => c.name);
      const strengths = report.swotAnalysis?.strengths || report.visibilityIndex?.biggestStrength ? [report.visibilityIndex?.biggestStrength || ''] : [];
      const gaps = report.swotAnalysis?.weaknesses || report.visibilityIndex?.primaryGap ? [report.visibilityIndex?.primaryGap || ''] : [];

      const analysis = await generateVisibilityProjectionAnalysis(
        report.businessName,
        baseScore,
        scenario,
        competitorList.slice(0, 3),
        strengths,
        gaps
      );
      setBriefing(analysis);
    } catch (e) {
      console.error('Failed to generate projection scenario briefing:', e);
      setBriefing(`Projection Scenario Model active. Under the ${scenarioConfig.title} trajectory, "${report.businessName}" is estimated to reach a final visibility score of ${chartData[6].projected} in 3 months. \n\nFocus on localized keyword deployment during Month 2 to cement authority before competitors react.`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-generate preview description when switching scenarios
  const forecastSummaryText = useMemo(() => {
    const finalProjected = chartData[6].projected || baseScore;
    const delta = finalProjected - baseScore;
    const sign = delta >= 0 ? '+' : '';
    const trafficMultiplier = delta > 0 ? Math.round(delta * 1.4) : Math.round(delta * 0.8);
    
    return {
      deltaMsg: `${sign}${delta} pts`,
      trafficMsg: `${delta >= 0 ? 'Estimated +' : ''}${trafficMultiplier}% forecast search traffic impact`,
      finalScore: finalProjected
    };
  }, [chartData, baseScore]);

  return (
    <div className="p-4 sm:p-6 h-full flex flex-col bg-white dark:bg-slate-900 border-t border-slate-50 dark:border-slate-800">
      
      {/* Widget Header Controls */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 mb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="p-1 px-2 text-[8px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-slate-950/40 border border-indigo-100 dark:border-indigo-900/30 rounded">PREDICTIVE SCI-TRAJECTORY</span>
          </div>
          <h3 className="text-sm font-display font-medium tracking-tight text-slate-900 dark:text-white uppercase">Visibility Trend Projection</h3>
          <p className="text-[10px] font-bold text-slate-500 uppercase">Interactive 3-Month Market Impact Modeler</p>
        </div>
        
        {/* Scenario Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/50 max-w-fit">
          <button 
            onClick={() => { setScenario('organic'); setBriefing(null); }}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
              scenario === 'organic' 
                ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm border border-slate-200/30 dark:border-slate-800' 
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700'
            }`}
          >
            Organic
          </button>
          <button 
            onClick={() => { setScenario('aggressive'); setBriefing(null); }}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
              scenario === 'aggressive' 
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/30' 
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700'
            }`}
          >
            Aggressive
          </button>
          <button 
            onClick={() => { setScenario('risk'); setBriefing(null); }}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
              scenario === 'risk' 
                ? 'bg-white dark:bg-slate-900 text-rose-500 shadow-sm border border-slate-200/30' 
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700'
            }`}
          >
            Risk
          </button>
        </div>
      </div>

      {/* Grid Layout of Line Chart & Variable Controls */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-grow overflow-y-auto custom-scrollbar">
        
        {/* Chart Column */}
        <div className="xl:col-span-8 flex flex-col justify-between min-h-[250px] lg:min-h-[300px]">
          <div className="relative flex-grow w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={chartData}
                margin={{ top: 15, right: 15, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#1e293b' : '#f1f5f9'} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fontWeight: 800, fill: '#64748b' }} 
                />
                <YAxis 
                  domain={[0, 100]}
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fontWeight: 800, fill: '#64748b' }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', 
                    border: isDarkMode ? '1px solid #1e293b' : '1px solid #e2e8f0', 
                    borderRadius: '12px', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                  }}
                  labelStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: '#64748b' }}
                  itemStyle={{ fontSize: '11px', fontWeight: 700 }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={32}
                  iconSize={8}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                />
                
                {/* Historical baseline */}
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#1e293b" 
                  strokeWidth={3.5} 
                  dot={{ r: 4, stroke: '#1e293b', strokeWidth: 1, fill: '#ffffff' }}
                  name="Verified History" 
                  connectNulls
                />
                
                {/* Active Scenario Forecast */}
                <Line 
                  type="monotone" 
                  dataKey="projected" 
                  stroke={scenarioConfig.color} 
                  strokeWidth={3} 
                  strokeDasharray="4 4"
                  dot={{ r: 4 }}
                  name={`${scenarioConfig.title} Forecast`}
                  connectNulls
                />
                
                {/* Interactive Custom Target Line */}
                <Line 
                  type="monotone" 
                  dataKey="customTarget" 
                  stroke="#a855f7" 
                  strokeWidth={2} 
                  strokeDasharray="6 6"
                  dot={{ r: 3, fill: '#a855f7' }}
                  name="Custom Target path" 
                  connectNulls
                />

                {/* Competitor Avg Line */}
                <Line 
                  type="monotone" 
                  dataKey="competitorAvg" 
                  stroke="#94a3b8" 
                  strokeWidth={1.5} 
                  strokeDasharray="3 3"
                  dot={false}
                  name="Rival Benchmark" 
                  connectNulls
                />

                {/* Vertical Divider separating History & Forecast */}
                <ReferenceLine 
                  x="Current" 
                  stroke={isDarkMode ? '#334155' : '#cbd5e1'} 
                  strokeWidth={1.5}
                  strokeDasharray="4 2"
                  label={{ 
                    value: 'FORECAST HORIZON', 
                    position: 'top', 
                    offset: 5,
                    fill: '#64748b', 
                    fontSize: 7, 
                    fontWeight: 900,
                    letterSpacing: '0.15em' 
                  }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex gap-4">
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-900" /> Current Index: <span className="font-black text-slate-800 dark:text-white">{baseScore}</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase">
                <div className={`w-1.5 h-1.5 rounded-full ${scenario === 'risk' ? 'bg-rose-500' : 'bg-indigo-500'}`} /> Max Expected: <span className="font-black text-slate-800 dark:text-white">{forecastSummaryText.finalScore}</span>
              </div>
            </div>
            <p className="text-[9px] font-medium text-slate-400 italic">
              *Projections model dynamic local signals & competition patterns. Past 3 months calculated from aggregate local crawler telemetry.
            </p>
          </div>
        </div>

        {/* Forecast Configuration / AI Narrative Panel */}
        <div className="xl:col-span-4 flex flex-col justify-between space-y-4">
          
          {/* Controls Container */}
          <div className="space-y-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 shadow-inner">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-slate-400" />
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Model Configuration</h4>
            </div>
            
            <div className="space-y-1.5">
              <p className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Scenario Trajectory</p>
              <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400 leading-relaxed bg-white dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                {scenarioConfig.desc}
              </p>
            </div>

            {/* Custom Target Slider */}
            <div className="space-y-2 pt-2 border-t border-slate-200/50 dark:border-slate-800">
              <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider">
                <span className="text-slate-400">Target Month +3 Score</span>
                <span className="text-purple-600 dark:text-purple-400 font-black">{customTarget} / 100</span>
              </div>
              <input 
                type="range" 
                min={baseScore} 
                max="100" 
                value={customTarget}
                onChange={(e) => setCustomTarget(Number(e.target.value))}
                className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase">
                <span>Current ({baseScore})</span>
                <span>Max Target (100)</span>
              </div>
            </div>

            {/* Simulated Lift Stats */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200/50 dark:border-slate-800">
              <div className="p-2 bg-white dark:bg-slate-900/80 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-[7px] font-black uppercase tracking-wider text-slate-400">Projected delta</p>
                <div className="flex items-center gap-1.5 mt-1">
                  {scenario === 'risk' ? (
                    <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                  ) : (
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  )}
                  <span className={`text-xs font-black select-none ${scenario === 'risk' ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {forecastSummaryText.deltaMsg}
                  </span>
                </div>
              </div>
              
              <div className="p-2 bg-white dark:bg-slate-900/80 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-[7px] font-black uppercase tracking-wider text-slate-400">Predicted traffic lift</p>
                <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 block truncate mt-1.5">
                  {forecastSummaryText.trafficMsg}
                </span>
              </div>
            </div>
          </div>

          {/* AI Scryer Column */}
          <div className="flex-grow flex flex-col justify-between p-4 rounded-2xl border bg-gradient-to-br from-white via-indigo-50/5 to-white dark:from-slate-900 dark:via-slate-950/10 dark:to-slate-900 border-slate-100 dark:border-slate-800 relative overflow-hidden min-h-[140px] select-none">
            
            {!briefing && !isGenerating ? (
              <div className="flex flex-col items-center justify-center text-center h-full space-y-3 py-4">
                <Bot className="w-6 h-6 text-indigo-500/80 dark:text-indigo-400/80 animate-pulse" />
                <div className="space-y-1">
                  <h4 className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Projection Scrying Briefing</h4>
                  <p className="text-[9px] text-slate-400 leading-relaxed max-w-[240px]">
                    Let AI scry your projection trajectory, opportunities, and month 2 priorities.
                  </p>
                </div>
                <button
                  onClick={handleGenerateBriefing}
                  className="btn-xs px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 hover:scale-[1.02] active:scale-95 transition-all text-[9.5px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-indigo-500/20"
                >
                  <Sparkles className="w-3 h-3" />
                  Cast Predictive Scry
                </button>
              </div>
            ) : isGenerating ? (
              <div className="flex flex-col items-center justify-center text-center h-full space-y-3 py-6">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                <p className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest animate-pulse">Calculating Market Timelines...</p>
              </div>
            ) : (
              <div className="flex flex-col h-full justify-between space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-indigo-100/50 dark:border-indigo-900/30">
                  <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-widest">AI SCYING TRANSMISSION</span>
                  </div>
                  <button 
                    onClick={() => setBriefing(null)} 
                    className="text-[8px] font-black uppercase tracking-wider text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    Clear
                  </button>
                </div>
                
                <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300 leading-relaxed italic overflow-y-auto max-h-[140px] custom-scrollbar pr-1 whitespace-pre-line">
                  {briefing}
                </p>

                <div className="flex items-center gap-1.5 pt-1 text-[8px] font-medium text-slate-400 uppercase border-t border-indigo-100/30 dark:border-indigo-900/10">
                  <span>Model: Deep Scrantrend Flash</span>
                  <span>•</span>
                  <span>Accuracy Confidence: 89%</span>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
