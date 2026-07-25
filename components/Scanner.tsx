
import React, { useState, useEffect } from 'react';
import OculaLogo from './OculaLogo';
import { motion } from 'framer-motion';
import { Scan, Activity, Database, Globe, Shield, Cpu, AlertCircle, RefreshCw, Clock, Timer } from 'lucide-react';
import { ScanStatus, ScanStep } from '../types';

interface ScannerProps {
  status: ScanStatus;
  step: ScanStep;
  message: string;
  error: string | null;
  entityCount?: number;
  focusMode?: string;
  onRetry?: () => void;
  onClose?: () => void;
  onSelectKey?: () => void;
}

const Scanner: React.FC<ScannerProps> = ({ 
  status, 
  step, 
  message: statusMessage, 
  error, 
  entityCount = 1, 
  focusMode = 'Standard',
  onRetry,
  onClose,
  onSelectKey
}) => {
  const [displayedProgress, setDisplayedProgress] = useState(0);
  const [startTime] = useState<number>(() => Date.now());
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);

  const steps = [
    { id: ScanStep.FINDING_BUSINESS, label: 'Sensor Calibration', icon: <Activity className="w-4 h-4" />, sub: 'Aligning intelligence arrays...' },
    { id: ScanStep.LOCAL_PRESENCE, label: 'Market Scouring', icon: <Globe className="w-4 h-4" />, sub: 'Crawling digital footprint...' },
    { id: ScanStep.SOCIAL_SIGNALS, label: 'Ground Signal Trace', icon: <Scan className="w-4 h-4" />, sub: 'Verifying local presence signals...' },
    { id: ScanStep.CONTENT_ANALYSIS, label: 'Rival Recon', icon: <Shield className="w-4 h-4" />, sub: 'Mapping competitor dominance...' },
    { id: ScanStep.GENERATING_REPORT, label: 'Intelligence Sync', icon: <Database className="w-4 h-4" />, sub: 'Synthesizing data clusters...' },
    { id: ScanStep.COMPLETE, label: 'Dossier Assembly', icon: <Cpu className="w-4 h-4" />, sub: 'Formatting strategic report...' },
  ];

  // Derived progress based on state
  const stepNum = Number(step);
  const targetProgress = status === 'success' ? 100 : ((isNaN(stepNum) ? 0 : stepNum) / 6) * 100;

  // Smooth number transitions
  useEffect(() => {
    const timer = setInterval(() => {
      setDisplayedProgress(prev => {
        if (prev < targetProgress) {
          return Math.min(targetProgress, prev + 0.5);
        } else if (prev > targetProgress && status !== 'success') {
          return Math.max(targetProgress, prev - 1);
        }
        return prev;
      });
    }, 20);
    return () => clearInterval(timer);
  }, [targetProgress, status]);

  // Dynamic Time Remaining calculation
  useEffect(() => {
    if (status === 'error') {
      setSecondsRemaining(null);
      return;
    }

    if (status === 'success' || step === ScanStep.COMPLETE || displayedProgress >= 100) {
      setSecondsRemaining(0);
      return;
    }

    const calculateTimeRemaining = () => {
      const elapsed = Math.max(0, (Date.now() - startTime) / 1000);
      
      const focusMultiplier = (focusMode.toLowerCase().includes('competitor') || 
                               focusMode.toLowerCase().includes('market') || 
                               focusMode.toLowerCase().includes('deep')) ? 1.3 : 1.0;
      const totalBaselineSec = Math.round(25 * entityCount * focusMultiplier);

      if (displayedProgress <= 2) {
        setSecondsRemaining(totalBaselineSec);
        return;
      }

      const currentRate = displayedProgress / 100;
      const dynamicTotalSec = elapsed / Math.max(currentRate, 0.02);

      const blendWeight = Math.min(1, displayedProgress / 35);
      const estimatedTotalSec = (1 - blendWeight) * totalBaselineSec + blendWeight * dynamicTotalSec;

      const remainingSec = Math.max(1, Math.round(estimatedTotalSec - elapsed));
      setSecondsRemaining(remainingSec);
    };

    calculateTimeRemaining();
    const timer = setInterval(calculateTimeRemaining, 1000);
    return () => clearInterval(timer);
  }, [displayedProgress, status, step, startTime, entityCount, focusMode]);

  const formatTimeRemaining = (seconds: number | null): string => {
    if (seconds === null) return 'N/A';
    if (seconds <= 0 || status === 'success' || step === ScanStep.COMPLETE) return 'Finalizing...';
    if (seconds < 60) return `~${seconds}s remaining`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `~${mins}m ${secs}s remaining`;
  };

  // Circular progress calculations
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const rawOffset = circumference - ((displayedProgress || 0) / 100) * circumference;
  const strokeDashoffset = isNaN(rawOffset) ? circumference : rawOffset;

  if (status === 'error') {
    const isApiKeyError = error?.includes("API Key required");

    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="surface p-10 text-center relative overflow-hidden backdrop-blur-sm border-rose-200/50 dark:border-rose-800/50 shadow-2xl rounded-[2rem]">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] dark:opacity-[0.05]"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center mb-6 shadow-sm border border-rose-100 dark:border-rose-800/50">
              {isApiKeyError ? (
                <Shield className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
              ) : (
                <AlertCircle className="w-10 h-10 text-rose-600 dark:text-rose-400" />
              )}
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">
              {isApiKeyError ? "Encryption Key Required" : "Vision Scry Scrambled"}
            </h2>
            
            <div className="w-full max-w-md p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 mb-8 text-left">
              <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Shield className={`w-3 h-3 ${isApiKeyError ? "text-indigo-500" : "text-rose-500"}`} />
                {isApiKeyError ? "Authentication Block" : "Interference Log"}
              </p>
              <p className="text-xs font-mono font-medium text-slate-600 dark:text-slate-400 leading-relaxed break-words overflow-auto max-h-48 custom-scrollbar">
                {isApiKeyError 
                  ? "Deep scrying requires a valid API Key to power the intelligence engines. Please authorize your session to continue."
                  : error || "Signal lost in the digital ether. Recalibration required."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              {isApiKeyError && onSelectKey ? (
                <button 
                  onClick={onSelectKey}
                  className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  <Cpu className="w-5 h-5" />
                  Connect API Key
                </button>
              ) : (
                onRetry && (
                  <button 
                    onClick={onRetry}
                    className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Attempt Recalibration
                  </button>
                )
              )}
              {onClose && (
                <button 
                  onClick={onClose}
                  className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
                >
                  Terminate Link
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentStepData = steps.find(s => s.id === step) || steps[0];

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 animate-in fade-in zoom-in-95 duration-700">
       <div className="surface p-10 text-center relative overflow-hidden backdrop-blur-sm border-slate-200/50 dark:border-slate-800/50 shadow-2xl rounded-[2rem]">
          {/* Ambient Background Effects */}
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] dark:opacity-[0.05]"></div>
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.15, 0.1]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -top-32 -right-32 w-80 h-80 bg-indigo-500 rounded-full blur-[120px]"
          />
          <motion.div 
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.05, 0.1, 0.05]
            }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute -bottom-32 -left-32 w-80 h-80 bg-slate-500 rounded-full blur-[120px]"
          />
          
          <div className="relative z-10 flex flex-col items-center">
            {/* Status Badge & Time Remaining */}
            <div className="mb-8 flex items-center justify-center gap-3 flex-wrap">
              <span className="px-5 py-2 bg-slate-900/5 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-full text-[10px] font-mono font-black uppercase tracking-[0.2em] border border-slate-200/50 dark:border-white/10 backdrop-blur-md inline-flex items-center gap-3">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                Active Scanning Network
              </span>

              {status !== 'error' && (
                <span className="px-4 py-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 rounded-full text-[10px] font-mono font-black uppercase tracking-wider border border-indigo-200/60 dark:border-indigo-500/30 backdrop-blur-md inline-flex items-center gap-2 shadow-2xs">
                  <Clock className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                  Est. Time: <span className="font-extrabold text-indigo-700 dark:text-indigo-300">{formatTimeRemaining(secondsRemaining)}</span>
                </span>
              )}
            </div>

            {/* Central Analysis Hub */}
            <div className="relative w-48 h-48 mb-10 flex items-center justify-center">
              {/* Circular Progress Ring */}
              <svg className="absolute inset-0 w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
                {/* Background Track */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  className="text-slate-100 dark:text-slate-800/50"
                />
                {/* Progress Circle */}
                <motion.circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeDasharray={circumference}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  strokeLinecap="round"
                  fill="transparent"
                  className="text-indigo-600 dark:text-indigo-500"
                />
              </svg>

              {/* Decorative Outer Ring */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-full opacity-40"
              />

              {/* Core Component */}
              <div className="relative z-20 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-xl border border-slate-100 dark:border-slate-800 mb-1">
                   <OculaLogo className="w-10 h-10 text-indigo-600 dark:text-white" />
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xl font-mono font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                    {Math.floor(displayedProgress)}%
                  </span>
                  <span className="text-[7px] font-mono font-bold uppercase tracking-widest text-slate-400 mt-0.5">analyzing</span>
                  {status !== 'error' && (
                    <span className="text-[8px] font-mono font-extrabold text-indigo-500 dark:text-indigo-400 mt-1 tracking-tight flex items-center gap-1">
                      <Timer className="w-2.5 h-2.5 text-indigo-500" />
                      {secondsRemaining !== null && secondsRemaining > 0 ? `~${secondsRemaining}s left` : secondsRemaining === 0 ? 'Done' : 'Estimating...'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Content Display */}
             <div className="max-w-md mx-auto mb-12">
               <motion.h2 
                 key={statusMessage}
                 initial={{ opacity: 0, y: 5 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="text-xl font-display font-black text-slate-900 dark:text-white tracking-tight uppercase mb-2"
               >
                 {statusMessage}
               </motion.h2>
               <motion.p 
                 key={currentStepData.sub}
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 0.6 }}
                 className="text-[10px] font-mono font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest"
               >
                 {currentStepData.sub}
               </motion.p>
            </div>

            {/* Progress Visualization */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full text-left">
               {steps.map((s) => {
                 const isActive = step === s.id;
                 const isDone = step > s.id;
                 return (
                   <div 
                     key={s.id} 
                     className={`relative p-4 rounded-2xl border transition-all duration-500 group overflow-hidden ${
                       isActive 
                         ? 'bg-indigo-600/5 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30' 
                         : isDone 
                           ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20' 
                           : 'bg-white dark:bg-slate-900/50 border-slate-100 dark:border-slate-800'
                     }`}
                   >
                     {isActive && (
                       <motion.div 
                         layoutId="active-step-glow"
                         className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none"
                       />
                     )}
                     <div className="flex items-center gap-3 relative z-10">
                       <div className={`p-2 rounded-xl transition-all duration-300 ${
                         isActive 
                           ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                           : isDone 
                             ? 'bg-emerald-500 text-white' 
                             : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                       }`}>
                          {isDone ? <span className="text-xs font-bold w-4 h-4 flex items-center justify-center">✓</span> : s.icon}
                       </div>
                       <div className="flex flex-col min-w-0">
                         <span className={`text-[9px] font-mono font-black uppercase tracking-wider truncate transition-colors ${
                           isActive ? 'text-indigo-600 dark:text-indigo-400' : isDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-600'
                         }`}>
                           {s.label}
                         </span>
                         {isActive && (
                            <span className="text-[7px] font-mono font-bold text-indigo-400 truncate animate-pulse uppercase tracking-tight">Processing...</span>
                         )}
                       </div>
                     </div>
                   </div>
                 );
               })}
            </div>

            {/* Focus Information */}
            <div className="w-full mt-10 pt-8 border-t border-slate-100 dark:border-slate-800/50 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-6 flex-wrap justify-center sm:justify-start">
                <div className="flex flex-col items-start gap-1">
                  <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest">Targets</span>
                  <span className="text-xs font-mono font-black text-slate-900 dark:text-white uppercase">{entityCount} Entity Detected</span>
                </div>
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 hidden sm:block" />
                <div className="flex flex-col items-start gap-1">
                  <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest">Protocol</span>
                  <span className="text-xs font-mono font-black text-indigo-600 dark:text-indigo-400 uppercase">{focusMode}</span>
                </div>
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 hidden sm:block" />
                <div className="flex flex-col items-start gap-1">
                  <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5 text-indigo-500" /> Est. Remaining
                  </span>
                  <span className="text-xs font-mono font-black text-indigo-600 dark:text-indigo-400 uppercase">
                    {formatTimeRemaining(secondsRemaining)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 group cursor-help">
                <Shield className="w-3 h-3 text-emerald-500" />
                <span className="text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest group-hover:text-emerald-500 transition-colors">Encrypted Scry Path Established</span>
              </div>
            </div>
          </div>
       </div>
    </div>
  );
};

export default Scanner;
