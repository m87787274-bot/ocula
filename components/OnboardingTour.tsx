import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Check, ArrowRight, LayoutDashboard, Shield, Target, Zap, Swords, Search } from 'lucide-react';
import { ScryTemplate } from '../types';

interface Widget {
  id: string;
  name: string;
  visible: boolean;
}

interface OnboardingTourProps {
  onComplete: () => void;
  widgets: Widget[];
  setWidgets: (widgets: Widget[]) => void;
  selectedTemplate?: string;
  onSetTemplate?: (template: ScryTemplate) => void;
  currentView?: string;
  setView: (view: any) => void;
  user?: any;
}

export default function OnboardingTour({ onComplete, widgets, setWidgets, selectedTemplate, onSetTemplate, currentView, setView, user }: OnboardingTourProps) {
  const [step, setStep] = useState(0);
  const [tooltipPos, setTooltipPos] = useState<{ top: number, left: number, width: number, height: number } | null>(null);
  const tourRef = useRef<HTMLDivElement>(null);

  const toggleWidget = (id: string) => {
    const newWidgets = widgets.map(w => 
      w.id === id ? { ...w, visible: !w.visible } : w
    );
    setWidgets(newWidgets);
  };

  const nextStep = () => setStep(s => s + 1);
  
  const handleComplete = () => {
    localStorage.setItem('ocula_onboarding_complete', 'true');
    onComplete();
  };

  const allSteps = [
    {
      id: 'welcome',
      title: "Welcome to Ocula",
      subtitle: "Your AI-Powered Visibility Intelligence Engine",
      icon: <Eye className="w-12 h-12 text-blue-500" />,
      content: (
        <div className="space-y-4 text-center">
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            Ocula scries the digital ether to reveal your brand's true visibility. 
            We analyze market signals, competitor movements, and search patterns to give you a strategic edge.
          </p>
        </div>
      )
    },
    {
      id: 'new-scan',
      targetId: 'scan-initiation-form',
      title: "Initiate Intelligence",
      subtitle: "Map your digital footprint",
      icon: <Search className="w-12 h-12 text-blue-500" />,
      content: (
        <div className="space-y-4 text-center">
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            Enter your business details to begin a <strong>Vision Scry</strong>. Ocula will crawl the digital landscape to gather intelligence on your brand.
          </p>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800/50">
            <p className="text-[10px] text-blue-700 dark:text-blue-400 font-bold uppercase tracking-wider">
              System Action: Rival Analysis pre-selected
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'focus-modes',
      targetId: 'focus-modes-container',
      title: "Mission Profile",
      subtitle: "Tailor your intelligence gathering",
      icon: <Zap className="w-12 h-12 text-amber-500" />,
      content: (
        <div className="space-y-4 text-center">
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            Choose a <strong>Focus Mode</strong> to prioritize specific intelligence streams like SEO, Market Trends, or Rival Analysis.
          </p>
        </div>
      )
    },
    {
      id: 'dashboard-overview',
      targetId: 'nav-dashboard',
      requiredView: 'dashboard',
      protected: true,
      title: "Strategic Overview",
      subtitle: "Your Command Center",
      icon: <LayoutDashboard className="w-12 h-12 text-blue-500" />,
      content: (
        <div className="space-y-4 text-center">
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            The <strong>Dashboard</strong> provides a high-level view of your entire visibility profile. Track your scores, monitor trends, and access all your scry reports in one place.
          </p>
        </div>
      )
    },
    {
      id: 'competitor-analysis',
      targetId: 'competitor-analysis-widget',
      requiredView: 'dashboard',
      protected: true,
      title: "Rival Analysis",
      subtitle: "Outmaneuver the Competition",
      icon: <Swords className="w-12 h-12 text-rose-500" />,
      content: (
        <div className="space-y-4 text-center">
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            Dive deep into your competitor's strategies. Identify their weaknesses and capture their market share using our <strong>Competitor Analysis</strong> tools.
          </p>
        </div>
      )
    },
    {
      id: 'mission-control',
      targetId: 'nav-missions',
      title: "Mission Control",
      subtitle: "Tactical Execution Hub",
      icon: <Target className="w-12 h-12 text-emerald-500" />,
      content: (
        <div className="space-y-4 text-center">
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            This is where you manage your <strong>Missions</strong>. 
            Missions are AI-generated action plans designed to boost your visibility score immediately.
          </p>
        </div>
      )
    },
    {
      id: 'intelligence-feed',
      targetId: 'intelligence-feed-trigger',
      requiredView: 'dashboard',
      protected: true,
      title: "Intelligence Feed",
      subtitle: "Real-time Strategic Updates",
      icon: <LayoutDashboard className="w-12 h-12 text-indigo-500" />,
      content: (
        <div className="space-y-4 text-center">
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            Keep an eye on the <strong>Intelligence Feed</strong> for real-time updates on market anomalies, competitor moves, and system alerts.
          </p>
        </div>
      )
    },
    {
      id: 'setup',
      title: "Configure Your HUD",
      subtitle: "Select the intelligence streams you want to monitor.",
      protected: true,
      icon: <LayoutDashboard className="w-12 h-12 text-indigo-500" />,
      content: (
        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
            {widgets.map(w => (
              <button
                key={w.id}
                onClick={() => toggleWidget(w.id)}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  w.visible 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
                    : 'surface border-slate-100 dark:border-slate-700 opacity-60 hover:opacity-100'
                }`}
              >
                <span className={`text-[10px] font-black uppercase tracking-wider ${w.visible ? 'text-blue-700 dark:text-blue-300' : 'text-slate-400 dark:text-slate-500'}`}>{w.name}</span>
                {w.visible ? <Eye className="w-4 h-4 text-blue-500" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center italic">You can always adjust this later in Mission Control.</p>
        </div>
      )
    }
  ];

  const steps = allSteps.filter(s => !s.protected || user);

  useEffect(() => {
    const currentStep = steps[step];
    if (!currentStep) return;
    
    // Handle view navigation if required
    if (currentStep.requiredView && currentView !== currentStep.requiredView) {
      setView(currentStep.requiredView);
      // Give some time for the view to render before finding the element
      return;
    }

    if (currentStep.id === 'new-scan' && onSetTemplate) {
      onSetTemplate('competitor');
    }

    if (currentStep.targetId) {
      const el = document.getElementById(currentStep.targetId);
      if (el) {
        const rect = el.getBoundingClientRect();
        setTooltipPos({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        });
        
        // Scroll to element if needed
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        setTooltipPos(null);
      }
    } else {
      setTooltipPos(null);
    }
  }, [step, currentView]);

  const currentStepData = steps[step];
  const isLastStep = step === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm pointer-events-none">
      <div className="absolute inset-0 pointer-events-auto cursor-pointer" onClick={handleComplete} title="Click to skip tour" />
      
      <AnimatePresence mode="wait">
        <motion.div 
          key={step}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ 
            opacity: 1, 
            y: 0, 
            scale: 1,
            ...(tooltipPos ? {
              position: 'fixed',
              top: Math.min(window.innerHeight - 450, Math.max(20, tooltipPos.top + tooltipPos.height + 20)),
              left: Math.min(window.innerWidth - 420, Math.max(20, tooltipPos.left + tooltipPos.width / 2 - 200)),
              width: '400px',
              zIndex: 2001
            } : {})
          }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className={`surface w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 relative pointer-events-auto flex flex-col max-h-[90vh] ${tooltipPos ? 'shadow-[0_0_50px_rgba(37,99,235,0.3)]' : ''}`}
          ref={tourRef}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Highlight Ring for Tooltip */}
          {tooltipPos && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="fixed border-4 border-blue-500 rounded-xl pointer-events-none z-[2000]"
              style={{
                top: tooltipPos.top - 8,
                left: tooltipPos.left - 8,
                width: tooltipPos.width + 16,
                height: tooltipPos.height + 16,
                boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.75)'
              }}
            />
          )}

          {/* Progress Bar */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100 dark:bg-slate-800">
            <motion.div 
              className="h-full bg-blue-600"
              initial={{ width: 0 }}
              animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="p-6 pt-10 flex flex-col h-full overflow-hidden">
            <div className="flex flex-col items-center text-center mb-6 shrink-0">
              <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-full shadow-sm border border-slate-100 dark:border-slate-700">
                {currentStepData.icon}
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">
                {currentStepData.title}
              </h2>
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                {currentStepData.subtitle}
              </p>
            </div>

            <div className="mb-8 flex-1 overflow-y-auto min-h-[100px] flex items-center justify-center px-2 custom-scrollbar">
              {currentStepData.content}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex gap-1.5">
                {steps.map((_, i) => (
                  <div 
                    key={steps[i].id} 
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === step ? 'bg-blue-600 w-4' : 'bg-slate-200 dark:bg-slate-700'}`}
                  />
                ))}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleComplete}
                  className="px-4 py-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-[10px] uppercase tracking-widest transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={isLastStep ? handleComplete : nextStep}
                  className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  {isLastStep ? 'Launch' : 'Next'}
                  {isLastStep ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

