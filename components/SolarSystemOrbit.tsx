import React, { useMemo, useState } from 'react';
import { VisibilityReport } from '../types';
import { Sun, Orbit, MapPin, Share2, Shield, Zap, TrendingUp, Sparkles, RefreshCw, PieChart } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

interface SolarSystemOrbitProps {
  report: VisibilityReport;
  isDarkMode: boolean;
}

interface SolarPlanet {
  id: string;
  name: string;
  shortName: string;
  score: number;
  orbitRadius: number;
  angleDeg: number;
  color: string;
  borderColor: string;
  glowColor: string;
  bgGradient: string;
  icon: React.ReactNode;
  status: string;
  insight: string;
}

export const SolarSystemOrbit: React.FC<SolarSystemOrbitProps> = ({ report, isDarkMode }) => {
  const [viewMode, setViewMode] = useState<'solar' | 'radar'>('solar');
  const [activePlanet, setActivePlanet] = useState<SolarPlanet | null>(null);
  const [isRotating, setIsRotating] = useState<boolean>(true);

  const breakdown = useMemo(() => {
    return report?.visibilityBreakdown || {
      googleMyBusiness: 75,
      socialPresence: 68,
      brandAuthority: 82,
      contentStrength: 70,
      marketPosition: 80
    };
  }, [report]);

  const planets = useMemo<SolarPlanet[]>(() => {
    const gmb = breakdown.googleMyBusiness || 70;
    const social = breakdown.socialPresence || 65;
    const brand = breakdown.brandAuthority || 80;
    const content = breakdown.contentStrength || 72;
    const market = breakdown.marketPosition || 78;

    return [
      {
        id: 'gmb',
        name: 'Google & Local Maps Orbit',
        shortName: 'GMB Maps',
        score: gmb,
        orbitRadius: 65,
        angleDeg: 15,
        color: '#38bdf8',
        borderColor: 'border-sky-400',
        glowColor: 'rgba(56, 189, 248, 0.4)',
        bgGradient: 'from-sky-500 to-blue-600',
        icon: <MapPin className="w-3.5 h-3.5 text-white" />,
        status: gmb >= 75 ? 'Strong Gravitational Anchor' : 'Low Local Density',
        insight: `GMB Local Presence operating at ${gmb}% visibility.`
      },
      {
        id: 'social',
        name: 'Social Media Constellation',
        shortName: 'Social Signals',
        score: social,
        orbitRadius: 98,
        angleDeg: 88,
        color: '#10b981',
        borderColor: 'border-emerald-400',
        glowColor: 'rgba(16, 185, 129, 0.4)',
        bgGradient: 'from-emerald-400 to-teal-600',
        icon: <Share2 className="w-3.5 h-3.5 text-white" />,
        status: social >= 70 ? 'High Engagement Orbit' : 'Sub-Optimal Frequency',
        insight: `Social footprint index calculated at ${social}%.`
      },
      {
        id: 'brand',
        name: 'Brand Authority Core',
        shortName: 'Brand Equity',
        score: brand,
        orbitRadius: 130,
        angleDeg: 160,
        color: '#f59e0b',
        borderColor: 'border-amber-400',
        glowColor: 'rgba(245, 158, 11, 0.4)',
        bgGradient: 'from-amber-400 to-orange-600',
        icon: <Shield className="w-3.5 h-3.5 text-white" />,
        status: brand >= 80 ? 'Dominant Solar Zenith' : 'Moderate Authority',
        insight: `Domain & brand recognition score at ${brand}%.`
      },
      {
        id: 'content',
        name: 'Content & Search Belt',
        shortName: 'Content SEO',
        score: content,
        orbitRadius: 162,
        angleDeg: 235,
        color: '#a855f7',
        borderColor: 'border-purple-400',
        glowColor: 'rgba(168, 85, 247, 0.4)',
        bgGradient: 'from-purple-500 to-indigo-600',
        icon: <Zap className="w-3.5 h-3.5 text-white" />,
        status: content >= 75 ? 'Optimal Relevance Field' : 'Requires Semantic Booster',
        insight: `Search index & content authority rating: ${content}%.`
      },
      {
        id: 'market',
        name: 'Market Position Sector',
        shortName: 'Market Share',
        score: market,
        orbitRadius: 195,
        angleDeg: 310,
        color: '#f43f5e',
        borderColor: 'border-rose-400',
        glowColor: 'rgba(244, 63, 94, 0.4)',
        bgGradient: 'from-rose-500 to-pink-600',
        icon: <TrendingUp className="w-3.5 h-3.5 text-white" />,
        status: market >= 75 ? 'High Velocity Trajectory' : 'Competitive Friction',
        insight: `Market dominance positioning index: ${market}%.`
      }
    ];
  }, [breakdown]);

  const radarData = useMemo(() => {
    return [
      { subject: 'GMB Maps', A: breakdown.googleMyBusiness || 0, fullMark: 100 },
      { subject: 'Social', A: breakdown.socialPresence || 0, fullMark: 100 },
      { subject: 'Brand', A: breakdown.brandAuthority || 0, fullMark: 100 },
      { subject: 'Content', A: breakdown.contentStrength || 0, fullMark: 100 },
      { subject: 'Market', A: breakdown.marketPosition || 0, fullMark: 100 },
    ];
  }, [breakdown]);

  return (
    <div className="surface p-4 sm:p-5 rounded-2xl shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 relative overflow-hidden group transition-all">
      {/* Cosmic background effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Card Header & Controls */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20">
            <Orbit className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase flex items-center gap-2">
              <span>Solar Intelligence System</span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
                Live Orbital Map
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {report.businessName || 'Business Core'} • Planetary Footprint Orbits
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {viewMode === 'solar' && (
            <button
              onClick={() => setIsRotating(!isRotating)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all border ${
                isRotating 
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
              title={isRotating ? "Pause Planetary Rotation" : "Resume Rotation"}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isRotating ? 'Orbiting' : 'Paused'}</span>
            </button>
          )}

          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-900/80 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <button
              onClick={() => setViewMode('solar')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'solar'
                  ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <Orbit className="w-3.5 h-3.5" />
              <span>Solar</span>
            </button>
            <button
              onClick={() => setViewMode('radar')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'radar'
                  ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <PieChart className="w-3.5 h-3.5" />
              <span>Radar</span>
            </button>
          </div>
        </div>
      </div>

      {/* View Container */}
      {viewMode === 'solar' ? (
        <div className="relative z-10 pt-4 flex flex-col xl:flex-row items-center justify-between gap-6 min-h-[380px]">
          
          {/* Solar System Interactive Canvas */}
          <div className="relative w-full max-w-[420px] aspect-square mx-auto flex items-center justify-center shrink-0 select-none overflow-hidden rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950/90 border border-slate-800/80 shadow-2xl">
            
            {/* Background Stardust Particles */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />
            
            {/* Outer Constellation Ring Glow */}
            <div className="absolute inset-4 rounded-full border border-indigo-500/10 pointer-events-none" />

            {/* Central Sun Core */}
            <div className="relative z-20 flex flex-col items-center justify-center">
              <motion.div 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center text-center cursor-pointer shadow-[0_0_50px_rgba(99,102,241,0.5)] border-2 border-amber-300/60 bg-gradient-to-tr from-amber-500 via-indigo-600 to-violet-700 text-white"
              >
                {/* Solar Flare Corona */}
                <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-md animate-pulse" />
                <div className="relative z-10 flex flex-col items-center">
                  <Sun className="w-5 h-5 text-amber-200 animate-spin-slow mb-0.5" />
                  <span className="text-3xl sm:text-4xl font-black tracking-tight drop-shadow-md">
                    {report.overallScore}
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-200/90">
                    Index Score
                  </span>
                </div>
              </motion.div>

              <div className="mt-2 text-center">
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  {report.profileBadge?.visibilityLevel || 'Emerging'} System
                </span>
              </div>
            </div>

            {/* Orbital Rings & Planets Container */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Concentric Orbital Paths */}
              {[65, 98, 130, 162].map((radius, idx) => (
                <div
                  key={idx}
                  style={{ width: radius * 2, height: radius * 2 }}
                  className="absolute rounded-full border border-indigo-400/15 dark:border-indigo-500/20 border-dashed pointer-events-none"
                />
              ))}

              {/* Rotating System Container */}
              <motion.div
                animate={isRotating ? { rotate: 360 } : { rotate: 0 }}
                transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {planets.map((planet) => {
                  const rad = (planet.angleDeg * Math.PI) / 180;
                  const x = Math.cos(rad) * planet.orbitRadius;
                  const y = Math.sin(rad) * planet.orbitRadius;
                  const isSelected = activePlanet?.id === planet.id;

                  return (
                    <div
                      key={planet.id}
                      style={{
                        transform: `translate(${x}px, ${y}px)`
                      }}
                      className="absolute z-30 cursor-pointer group"
                      onClick={() => setActivePlanet(isSelected ? null : planet)}
                      onMouseEnter={() => setActivePlanet(planet)}
                    >
                      {/* Counter-rotate inner planet content so text stays upright */}
                      <motion.div
                        animate={isRotating ? { rotate: -360 } : { rotate: 0 }}
                        transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
                        className="relative flex items-center justify-center"
                      >
                        {/* Orbital Halo */}
                        <div 
                          style={{ boxShadow: `0 0 20px ${planet.glowColor}` }}
                          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-gradient-to-tr ${planet.bgGradient} border-2 ${planet.borderColor} shadow-lg transition-transform group-hover:scale-125 ${isSelected ? 'scale-125 ring-4 ring-white/30' : ''}`}
                        >
                          {planet.icon}
                        </div>

                        {/* Label Badge */}
                        <div className="absolute top-11 whitespace-nowrap bg-slate-900/90 backdrop-blur-md px-2 py-0.5 rounded-full border border-slate-700/80 shadow-md text-[9px] font-bold text-white flex items-center gap-1 group-hover:scale-110 transition-all pointer-events-none">
                          <span style={{ color: planet.color }}>●</span>
                          <span>{planet.shortName}</span>
                          <span className="text-slate-400 font-mono">({planet.score})</span>
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
              </motion.div>
            </div>
          </div>

          {/* Orbital Telemetry & Channel Breakdown Sidebar */}
          <div className="flex-1 w-full flex flex-col justify-between space-y-4 min-w-0">
            
            {/* Active Planet Telemetry Card */}
            <AnimatePresence mode="wait">
              {activePlanet ? (
                <motion.div
                  key={activePlanet.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 rounded-xl bg-slate-900 text-white border border-slate-800 shadow-xl space-y-3 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-20 pointer-events-none" style={{ backgroundColor: activePlanet.color }} />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${activePlanet.color}20` }}>
                        {activePlanet.icon}
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-white uppercase tracking-tight">{activePlanet.name}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{activePlanet.status}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-white">{activePlanet.score}</span>
                      <span className="text-xs text-slate-400 font-normal">/100</span>
                    </div>
                  </div>

                  {/* Score Progress Bar */}
                  <div className="space-y-1">
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-700" 
                        style={{ width: `${activePlanet.score}%`, backgroundColor: activePlanet.color }}
                      />
                    </div>
                    <p className="text-xs text-slate-300 font-medium leading-relaxed pt-1">{activePlanet.insight}</p>
                  </div>
                </motion.div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>Planetary Telemetry Active</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                    {report.visibilityIndex?.summary || 'Hover over any satellite planet to inspect channel gravity, score breakdown, and visibility telemetry.'}
                  </p>
                </div>
              )}
            </AnimatePresence>

            {/* Planets Mini Grid List */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Orbital Systems Telemetry</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {planets.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setActivePlanet(p)}
                    onMouseEnter={() => setActivePlanet(p)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      activePlanet?.id === p.id 
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-800 ring-2 ring-indigo-500/20' 
                        : 'bg-white dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{p.shortName}</span>
                    </div>
                    <span className="text-xs font-black text-slate-900 dark:text-white shrink-0 font-mono">{p.score}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Strength / Gap summary */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between gap-2 overflow-hidden">
                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase shrink-0">Strength</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate text-right">{report.visibilityIndex?.biggestStrength || 'GMB Maps'}</span>
              </div>
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-between gap-2 overflow-hidden">
                <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase shrink-0">Gap</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate text-right">{report.visibilityIndex?.primaryGap || 'Social Signals'}</span>
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* Classic Radar Fallback View */
        <div className="relative z-10 pt-4 flex flex-col xl:flex-row items-center xl:items-start gap-6">
          <div className="flex flex-col items-center text-center shrink-0">
            <div className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="transparent"
                  stroke={isDarkMode ? "#1e293b" : "#f1f5f9"}
                  strokeWidth="11"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="transparent"
                  stroke="url(#indigoGradient)"
                  strokeWidth="11"
                  strokeDasharray={565}
                  strokeDashoffset={565 - (565 * (Number(report?.overallScore) || 0)) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="indigoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b8eff" />
                    <stop offset="100%" stopColor="#5b5fff" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">{report.overallScore}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Index Score</span>
              </div>
            </div>
            <div className="mt-3 flex flex-col gap-2">
              <div className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-full border border-indigo-100 dark:border-indigo-800">
                <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest whitespace-nowrap">{(report.profileBadge?.visibilityLevel || 'Emerging')} Presence</span>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4 items-start min-w-0">
            <div className="space-y-3 min-w-0">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-tight">Radar Assessment</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-bold leading-relaxed line-clamp-3">
                {report.visibilityIndex?.summary || 'Comprehensive multi-channel visibility assessment across key digital parameters.'}
              </p>
            </div>
            <div className="h-[200px] sm:h-[220px] w-full min-w-0 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="55%" data={radarData}>
                  <PolarGrid stroke={isDarkMode ? "#1e293b" : "#f1f5f9"} />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 10, fontWeight: 800 }} />
                  <Radar
                    name="Intelligence"
                    dataKey="A"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.25}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
