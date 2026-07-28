import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Globe, TrendingUp, Layers, Award, Shield, ArrowRight, Check, 
  CheckCircle2, ChevronDown, ChevronUp, Mail, Calendar, MapPin, Activity, 
  BarChart3, Users, Smartphone, Search, Share2, Code, Target, Cpu, 
  Brain, Briefcase, Clock, Star, Sliders, X, Lock, ExternalLink, HelpCircle
} from 'lucide-react';
import { OculaLogo } from './OculaLogo';
import { FlokkerLogo } from './FlokkerLogo';

interface FlokkerPreLandingProps {
  user?: any;
  onLaunchOculaBI: (businessName?: string, industry?: string) => void;
  onLaunchUserDashboard?: () => void;
  onLaunchAdminDashboard?: () => void;
  onToggleDarkMode?: () => void;
  onLogin?: () => void;
  onGoToDashboard?: () => void;
  onViewPricing?: () => void;
  onViewLegal?: () => void;
  onGiveFeedback?: () => void;
  isDarkMode?: boolean;
}

// Global visual assets
const AFRICA_MAP_DOTS = [
  { x: 135, y: 100 }, { x: 145, y: 98 }, { x: 155, y: 96 }, { x: 165, y: 95 }, { x: 175, y: 93 }, { x: 185, y: 95 }, { x: 195, y: 98 }, { x: 205, y: 102 }, { x: 215, y: 106 }, { x: 225, y: 110 },
  { x: 115, y: 110 }, { x: 125, y: 108 }, { x: 135, y: 110 }, { x: 145, y: 112 }, { x: 155, y: 114 }, { x: 165, y: 112 }, { x: 175, y: 110 }, { x: 185, y: 108 }, { x: 195, y: 110 }, { x: 205, y: 114 },
  { x: 105, y: 120 }, { x: 115, y: 122 }, { x: 125, y: 124 }, { x: 135, y: 124 }, { x: 145, y: 126 }, { x: 155, y: 128 }, { x: 165, y: 126 }, { x: 175, y: 124 }, { x: 185, y: 122 }, { x: 195, y: 124 },
  { x: 80, y: 135 }, { x: 90, y: 134 }, { x: 100, y: 135 }, { x: 110, y: 136 }, { x: 120, y: 138 }, { x: 130, y: 140 }, { x: 140, y: 138 }, { x: 150, y: 136 }, { x: 160, y: 138 }, { x: 170, y: 140 },
  { x: 75, y: 145 }, { x: 85, y: 146 }, { x: 95, y: 148 }, { x: 105, y: 150 }, { x: 115, y: 152 }, { x: 125, y: 154 }, { x: 135, y: 152 }, { x: 145, y: 150 }, { x: 155, y: 152 }, { x: 165, y: 154 },
  { x: 90, y: 160 }, { x: 100, y: 162 }, { x: 110, y: 164 }, { x: 120, y: 166 }, { x: 130, y: 164 }, { x: 140, y: 162 }, { x: 150, y: 164 }, { x: 165, y: 166 }, { x: 175, y: 168 }, { x: 185, y: 170 },
  { x: 135, y: 174 }, { x: 145, y: 176 }, { x: 155, y: 178 }, { x: 165, y: 180 }, { x: 175, y: 182 }, { x: 185, y: 184 }, { x: 195, y: 186 }, { x: 205, y: 188 }, { x: 215, y: 190 }, { x: 225, y: 192 },
  { x: 140, y: 186 }, { x: 150, y: 188 }, { x: 160, y: 190 }, { x: 170, y: 192 }, { x: 185, y: 194 }, { x: 195, y: 196 }, { x: 205, y: 198 }, { x: 215, y: 200 }, { x: 225, y: 202 }, { x: 235, y: 204 },
  { x: 145, y: 198 }, { x: 155, y: 200 }, { x: 165, y: 202 }, { x: 175, y: 204 }, { x: 185, y: 206 }, { x: 195, y: 208 }, { x: 205, y: 210 }, { x: 215, y: 212 }, { x: 225, y: 214 }, { x: 235, y: 216 },
  { x: 150, y: 210 }, { x: 160, y: 212 }, { x: 170, y: 214 }, { x: 180, y: 216 }, { x: 190, y: 218 }, { x: 200, y: 220 }, { x: 210, y: 222 }, { x: 220, y: 224 },
  { x: 155, y: 222 }, { x: 165, y: 224 }, { x: 175, y: 226 }, { x: 180, y: 228 }, { x: 190, y: 230 }, { x: 200, y: 232 }, { x: 210, y: 234 },
  { x: 160, y: 234 }, { x: 170, y: 236 }, { x: 180, y: 238 }, { x: 190, y: 240 }, { x: 200, y: 242 },
  { x: 165, y: 246 }, { x: 175, y: 248 }, { x: 180, y: 250 }, { x: 190, y: 252 }, { x: 195, y: 254 },
  { x: 170, y: 258 }, { x: 175, y: 260 }, { x: 180, y: 262 }, { x: 185, y: 264 },
  { x: 175, y: 270 }, { x: 180, y: 272 },
  { x: 178, y: 280 }
];

const HUB_HUBS = [
  { name: 'Lagos', x: 120, y: 166, color: '#6C63FF' },
  { name: 'Nairobi', x: 215, y: 190, color: '#8B5CF6' },
  { name: 'Cape Town', x: 178, y: 280, color: '#FDBA2D' },
  { name: 'Cairo', x: 195, y: 110, color: '#4F8BFF' }
];

const GLOW_PARTICLES = Array.from({ length: 25 }).map((_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2 + 0.8,
  duration: Math.random() * 14 + 6,
  delay: Math.random() * -10,
}));

export const FlokkerPreLanding: React.FC<FlokkerPreLandingProps> = ({
  user,
  onLaunchOculaBI,
  onLaunchUserDashboard,
  onLaunchAdminDashboard
}) => {
  // Navigation & Interactive states
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [dashboardTab, setDashboardTab] = useState<'visibility' | 'keywords' | 'competitors'>('visibility');
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailSender, setEmailSender] = useState('');
  const [emailSuccess, setEmailSuccess] = useState(false);

  // Pricing Builder State
  const [selectedServices, setSelectedServices] = useState<string[]>(['ocula']);
  const [businessSize, setBusinessSize] = useState<'startup' | 'growth' | 'enterprise'>('growth');
  const [targetRegion, setTargetRegion] = useState<'national' | 'continental' | 'global'>('continental');
  const [campaignTimeline, setCampaignTimeline] = useState<'3months' | '6months' | '12months'>('6months');

  // Interactive Price calculation logic
  const calculatedInvestment = useMemo(() => {
    let base = 350;
    
    // Services base cost
    if (selectedServices.includes('ocula')) base += 150;
    if (selectedServices.includes('seo')) base += 450;
    if (selectedServices.includes('social')) base += 350;
    if (selectedServices.includes('web')) base += 600;
    if (selectedServices.includes('local')) base += 250;

    // Multipliers
    const sizeMultiplier = businessSize === 'startup' ? 0.85 : businessSize === 'growth' ? 1.2 : 2.5;
    const regionMultiplier = targetRegion === 'national' ? 1.0 : targetRegion === 'continental' ? 1.4 : 2.0;
    const timelineDiscount = campaignTimeline === '3months' ? 1.0 : campaignTimeline === '6months' ? 0.9 : 0.8;

    return Math.round(base * sizeMultiplier * regionMultiplier * timelineDiscount);
  }, [selectedServices, businessSize, targetRegion, campaignTimeline]);

  const handleOpenCalendly = () => {
    window.open('https://calendly.com/flokker/strategy', '_blank');
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailSender) return;
    setEmailSuccess(true);
    setTimeout(() => {
      setEmailSuccess(false);
      setEmailModalOpen(false);
      setEmailSender('');
      setEmailBody('');
    }, 2000);
  };

  const toggleServiceBuilder = (serviceId: string) => {
    if (selectedServices.includes(serviceId)) {
      if (selectedServices.length > 1) {
        setSelectedServices(selectedServices.filter(s => s !== serviceId));
      }
    } else {
      setSelectedServices([...selectedServices, serviceId]);
    }
  };

  return (
    <div className="dark bg-[#070B1A] text-[#F8FAFC] min-h-screen font-sans selection:bg-[#6C63FF]/30 overflow-x-hidden relative">
      
      {/* BACKGROUND DECORATIVE GRID & ORBITS */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Subtle geometric layout grid */}
        <div 
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px), 
                              linear-gradient(90deg, rgba(255, 255, 255, 0.12) 1px, transparent 1px)`,
            backgroundSize: '54px 54px',
          }}
        />

        {/* Ambient Neon Lighting & Particle field */}
        <motion.div 
          className="absolute top-[-10%] left-[-10%] w-[55%] h-[55%] bg-[#6C63FF]/12 rounded-full blur-[180px]"
          animate={{ scale: [1, 1.08, 1], opacity: [0.8, 0.95, 0.8] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-[25%] right-[-10%] w-[65%] h-[65%] bg-[#8B5CF6]/10 rounded-full blur-[200px]"
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.7, 0.9, 0.7] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-[30%] left-[15%] w-[45%] h-[45%] bg-[#4F8BFF]/6 rounded-full blur-[160px]"
        />

        {/* Floating Ambient Points */}
        {GLOW_PARTICLES.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-indigo-400/20"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
            }}
            animate={{ y: [0, -100], opacity: [0, 0.75, 0] }}
            transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }}
          />
        ))}

        {/* Ultra-soft elegant noise texture overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.015] mix-blend-overlay">
          <filter id="gentleNoise">
            <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#gentleNoise)" />
        </svg>
      </div>

      {/* TOP NOTIFICATION SYSTEM BAR */}
      <div className="relative z-50 bg-[#070B1A]/80 border-b border-white/5 text-[11px] font-mono py-2.5 px-4 text-center flex items-center justify-center gap-3">
        <span className="px-2 py-0.5 bg-[#6C63FF]/15 text-[#6C63FF] rounded-full font-bold uppercase tracking-wider border border-[#6C63FF]/20 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#FDBA2D] animate-spin" /> PLATFORM IN BRIEF
        </span>
        <span className="text-[#94A3B8] hidden md:inline">
          Ocula BI has finished indexing regional commerce sectors. Next-generation growth pipelines active.
        </span>
        <div className="flex items-center gap-2.5 font-bold">
          <button onClick={handleOpenCalendly} className="text-[#FDBA2D] hover:text-white transition-colors flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Book Call
          </button>
          <span className="text-slate-800">•</span>
          <button onClick={() => { setEmailSubject('Consulting Request'); setEmailModalOpen(true); }} className="text-[#6C63FF] hover:text-white transition-colors flex items-center gap-1">
            <Mail className="w-3.5 h-3.5" /> Contact Sales
          </button>
        </div>
      </div>

      {/* NAVIGATION HERO */}
      <header className="sticky top-0 z-40 bg-[#070B1A]/70 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 h-20 flex items-center justify-between">
          {/* Logo Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <FlokkerLogo className="h-9 w-auto text-[#6C63FF]" />
          </div>

          {/* Links Center */}
          <nav className="hidden lg:flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest text-[#94A3B8]">
            <a href="#services" className="hover:text-white transition-colors relative py-1.5 group">
              Services
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#6C63FF] transition-all group-hover:w-full" />
            </a>
            <a href="#platform" className="hover:text-white transition-colors relative py-1.5 group">
              Solutions
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#6C63FF] transition-all group-hover:w-full" />
            </a>
            <button onClick={() => onLaunchOculaBI()} className="hover:text-white transition-colors flex items-center gap-1.5 text-[#6C63FF] py-1.5 group font-extrabold">
              <OculaLogo className="w-4 h-4 text-[#6C63FF] group-hover:rotate-12 duration-300" />
              <span>Ocula BI</span>
            </button>
            <a href="#results" className="hover:text-white transition-colors relative py-1.5 group">
              Case Studies
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#6C63FF] transition-all group-hover:w-full" />
            </a>
            <a href="#pricing" className="hover:text-white transition-colors relative py-1.5 group">
              Pricing
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#6C63FF] transition-all group-hover:w-full" />
            </a>
            <a href="#faq" className="hover:text-white transition-colors relative py-1.5 group">
              About
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#6C63FF] transition-all group-hover:w-full" />
            </a>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-4">
            <button onClick={() => onLaunchOculaBI()} className="text-xs font-bold uppercase tracking-widest text-[#94A3B8] hover:text-white transition-colors px-4 py-2">
              Log In
            </button>
            <button 
              onClick={handleOpenCalendly} 
              className="px-5 py-2.5 rounded-full bg-[#6C63FF] hover:bg-[#5a52e0] text-white font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-[#6C63FF]/15 hover:shadow-[#6C63FF]/30 hover:scale-[1.02]"
            >
              Book Strategy Call
            </button>
          </div>
        </div>
      </header>

      {/* SECTION 1: HERO CONTAINER */}
      <section className="relative pt-16 pb-24 px-6 sm:px-8 overflow-hidden z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Content */}
          <div className="lg:col-span-6 space-y-8 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/60 border border-[#6C63FF]/20 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#6C63FF] animate-ping" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
                ● Africa's AI Digital Growth Platform
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl xl:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
              We Build, <br />
              Scale & Accelerate <br />
              <span className="bg-gradient-to-r from-[#6C63FF] via-[#8B5CF6] to-[#FDBA2D] bg-clip-text text-transparent">
                Digital Brands.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#94A3B8] font-light leading-relaxed max-w-xl">
              Flokker combines AI visibility intelligence, search marketing, digital strategy, websites, and execution into one complete growth platform.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <button
                onClick={handleOpenCalendly}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#6C63FF] hover:bg-[#5a52e0] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#6C63FF]/20 flex items-center justify-center gap-2 group hover:shadow-xl hover:shadow-[#6C63FF]/30"
              >
                <span>Book Strategy Call</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={() => onLaunchOculaBI()}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-[#F8FAFC] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <OculaLogo className="w-4 h-4 text-[#8B5CF6]" />
                <span>Explore Ocula BI</span>
              </button>
            </div>

            {/* Small Trust Line */}
            <div className="pt-4 border-t border-white/5 flex flex-wrap sm:items-center gap-y-2 gap-x-6 text-[11px] font-mono text-[#94A3B8]">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Response within 24 hours
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#8B5CF6]" /> Senior Growth Strategists
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#FDBA2D]" /> Trusted across Africa
              </span>
            </div>
          </div>

          {/* Right Content: Immersive Interactive Globe Visualization */}
          <div className="lg:col-span-6 relative w-full aspect-square max-w-[500px] lg:max-w-none mx-auto flex items-center justify-center">
            
            {/* Globe frame container */}
            <div className="relative w-[330px] h-[330px] sm:w-[380px] sm:h-[380px] flex items-center justify-center">
              
              {/* Backglows */}
              <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-[#6C63FF]/10 to-[#8B5CF6]/15 blur-2xl pointer-events-none" />
              <div className="absolute -inset-6 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

              {/* Grid concentric rings */}
              <div className="absolute -inset-8 border border-white/5 rounded-full pointer-events-none flex items-center justify-center">
                <div className="w-[102%] h-[102%] border border-dashed border-[#6C63FF]/10 rounded-full animate-[spin_100s_linear_infinite]" />
              </div>

              {/* Stylized Africa coordinate mesh */}
              <svg className="absolute inset-0 w-full h-full z-10 overflow-visible" viewBox="0 0 300 300">
                <defs>
                  <linearGradient id="neonGlowLine" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6C63FF" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.1" />
                  </linearGradient>
                  <radialGradient id="globeSphere" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#0B132B" stopOpacity="1" />
                    <stop offset="85%" stopColor="#070B1A" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.15" />
                  </radialGradient>
                </defs>

                {/* Main Globe Sphere */}
                <circle cx="150" cy="150" r="110" fill="url(#globeSphere)" stroke="#8B5CF6" strokeWidth="0.5" strokeOpacity="0.25" />

                {/* Animated Orbits */}
                <motion.ellipse 
                  cx="150" cy="150" rx="135" ry="38" 
                  stroke="#6C63FF" strokeWidth="1" strokeOpacity="0.4" fill="none"
                  transform="rotate(-25 150 150)"
                  strokeDasharray="6 8"
                  animate={{ strokeDashoffset: [0, -40] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />
                <motion.ellipse 
                  cx="150" cy="150" rx="125" ry="50" 
                  stroke="#8B5CF6" strokeWidth="1" strokeOpacity="0.2" fill="none"
                  transform="rotate(35 150 150)"
                  strokeDasharray="4 8"
                  animate={{ strokeDashoffset: [0, 40] }}
                  transition={{ duration: 11, repeat: Infinity, ease: "linear" }}
                />

                {/* Connected Neon lines */}
                <path d="M 15 15 Q 80 80 120 166" fill="none" stroke="url(#neonGlowLine)" strokeWidth="1" strokeOpacity="0.5" />
                <path d="M 285 15 Q 230 100 215 190" fill="none" stroke="url(#neonGlowLine)" strokeWidth="1" strokeOpacity="0.5" />
                <path d="M 285 150 Q 240 160 215 190" fill="none" stroke="url(#neonGlowLine)" strokeWidth="1" strokeOpacity="0.5" />

                {/* Africa Map points */}
                {AFRICA_MAP_DOTS.map((dot, idx) => (
                  <circle key={idx} cx={dot.x} cy={dot.y} r="1.1" fill="#6C63FF" fillOpacity="0.4" />
                ))}

                {/* Pulsating Major Hub indicators */}
                {HUB_HUBS.map((hub, idx) => (
                  <g key={idx}>
                    <motion.circle
                      cx={hub.x}
                      cy={hub.y}
                      r="6"
                      stroke={hub.color}
                      strokeWidth="1"
                      fill="none"
                      animate={{ scale: [0.8, 2.2, 0.8], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2.5, repeat: Infinity, delay: idx * 0.4 }}
                    />
                    <circle cx={hub.x} cy={hub.y} r="2.5" fill={hub.color} />
                  </g>
                ))}
              </svg>

              {/* Floating linked cards connected to the globe */}
              {/* Card 1: Ocula BI (Top Left) */}
              <motion.div 
                className="absolute top-[4%] left-[-2%] z-20 w-[130px] bg-[#101828]/70 backdrop-blur-md border border-white/10 rounded-xl p-2.5 shadow-xl hover:border-[#6C63FF]/40 cursor-pointer"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                onClick={() => onLaunchOculaBI()}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="p-1 rounded-lg bg-[#6C63FF]/10 text-[#6C63FF]">
                    <Brain className="w-3 h-3" />
                  </div>
                  <span className="text-[9px] font-mono font-bold text-white tracking-wider">OCULA BI</span>
                </div>
                <p className="text-[9px] text-[#94A3B8] font-light leading-tight">AI Visibility Insights.</p>
              </motion.div>

              {/* Card 2: SEO Intelligence (Top Right) */}
              <motion.div 
                className="absolute top-[2%] right-[-2%] z-20 w-[130px] bg-[#101828]/70 backdrop-blur-md border border-white/10 rounded-xl p-2.5 shadow-xl hover:border-[#8B5CF6]/40 cursor-pointer"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                onClick={() => { setEmailSubject('SEO / SEM Services'); setEmailModalOpen(true); }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="p-1 rounded-lg bg-[#8B5CF6]/10 text-[#8B5CF6]">
                    <Search className="w-3 h-3" />
                  </div>
                  <span className="text-[9px] font-mono font-bold text-white tracking-wider">SEO INTEL</span>
                </div>
                <p className="text-[9px] text-[#94A3B8] font-light leading-tight">Rank higher on maps.</p>
              </motion.div>

              {/* Card 3: Social Media (Middle Right) */}
              <motion.div 
                className="absolute top-[45%] right-[-8%] z-20 w-[125px] bg-[#101828]/70 backdrop-blur-md border border-white/10 rounded-xl p-2.5 shadow-xl hover:border-[#4F8BFF]/40 cursor-pointer"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
                onClick={() => { setEmailSubject('Social Media Management'); setEmailModalOpen(true); }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="p-1 rounded-lg bg-[#4F8BFF]/10 text-[#4F8BFF]">
                    <Share2 className="w-3 h-3" />
                  </div>
                  <span className="text-[9px] font-mono font-bold text-white tracking-wider">SOCIAL</span>
                </div>
                <p className="text-[9px] text-[#94A3B8] font-light leading-tight">Build digital gravity.</p>
              </motion.div>

              {/* Card 4: Web Development (Bottom Right) */}
              <motion.div 
                className="absolute bottom-[2%] right-[-2%] z-20 w-[130px] bg-[#101828]/70 backdrop-blur-md border border-white/10 rounded-xl p-2.5 shadow-xl hover:border-emerald-500/40 cursor-pointer"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.9 }}
                onClick={() => { setEmailSubject('Website Development'); setEmailModalOpen(true); }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Code className="w-3 h-3" />
                  </div>
                  <span className="text-[9px] font-mono font-bold text-white tracking-wider">WEB DEV</span>
                </div>
                <p className="text-[9px] text-[#94A3B8] font-light leading-tight">High-performance sites.</p>
              </motion.div>

              {/* Card 5: Local Activation (Bottom Left) */}
              <motion.div 
                className="absolute bottom-[0%] left-[-2%] z-20 w-[135px] bg-[#101828]/70 backdrop-blur-md border border-white/10 rounded-xl p-2.5 shadow-xl hover:border-[#FDBA2D]/40 cursor-pointer"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
                onClick={() => { setEmailSubject('Local Market Activation'); setEmailModalOpen(true); }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="p-1 rounded-lg bg-[#FDBA2D]/10 text-[#FDBA2D]">
                    <Target className="w-3 h-3" />
                  </div>
                  <span className="text-[9px] font-mono font-bold text-white tracking-wider">LOCAL ACTV</span>
                </div>
                <p className="text-[9px] text-[#94A3B8] font-light leading-tight">Dominate your offline region.</p>
              </motion.div>

            </div>
          </div>

        </div>
      </section>

      {/* SECTION 2: METRICS CONTAINER */}
      <section className="relative py-12 px-6 sm:px-8 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#101828]/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 divide-y lg:divide-y-0 lg:divide-x divide-white/5">
              
              {/* Metric 1 */}
              <div className="flex flex-col items-center text-center p-4 first:pt-0 lg:first:pt-4">
                <div className="w-12 h-12 rounded-2xl bg-[#6C63FF]/10 border border-[#6C63FF]/20 flex items-center justify-center mb-4 text-[#6C63FF]">
                  <TrendingUp className="w-6 h-6 animate-pulse" />
                </div>
                <span className="text-4xl md:text-5xl font-display font-black text-white tracking-tight">$120M+</span>
                <span className="text-[10px] font-mono font-bold text-[#94A3B8] uppercase tracking-widest mt-2">Revenue Influenced</span>
              </div>

              {/* Metric 2 */}
              <div className="flex flex-col items-center text-center p-4 pt-8 lg:pt-4">
                <div className="w-12 h-12 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center mb-4 text-[#8B5CF6]">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <span className="text-4xl md:text-5xl font-display font-black text-white tracking-tight">350+</span>
                <span className="text-[10px] font-mono font-bold text-[#94A3B8] uppercase tracking-widest mt-2">Projects Delivered</span>
              </div>

              {/* Metric 3 */}
              <div className="flex flex-col items-center text-center p-4 pt-8 lg:pt-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400">
                  <Award className="w-6 h-6" />
                </div>
                <span className="text-4xl md:text-5xl font-display font-black text-white tracking-tight">99.4%</span>
                <span className="text-[10px] font-mono font-bold text-[#94A3B8] uppercase tracking-widest mt-2">Client Satisfaction</span>
              </div>

              {/* Metric 4 */}
              <div className="flex flex-col items-center text-center p-4 pt-8 lg:pt-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FDBA2D]/10 border border-[#FDBA2D]/20 flex items-center justify-center mb-4 text-[#FDBA2D]">
                  <Layers className="w-6 h-6" />
                </div>
                <span className="text-4xl md:text-5xl font-display font-black text-[#FDBA2D] tracking-tight">5 Core</span>
                <span className="text-[10px] font-mono font-bold text-[#94A3B8] uppercase tracking-widest mt-2">Growth Services</span>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: TRUSTED BY SECTION */}
      <section className="relative py-12 px-6 sm:px-8 z-10 border-b border-white/5">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-[10px] font-mono font-bold text-[#94A3B8] uppercase tracking-widest mb-8">
            TRUSTED BY LEADERS IN ENTERPRISE COMMERCE & DIGITAL FINANCE
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-9 gap-8 items-center opacity-30 select-none">
            <span className="text-sm font-black font-mono tracking-tight text-white hover:opacity-100 transition-opacity">PAYSTACK</span>
            <span className="text-sm font-black font-mono tracking-tight text-white hover:opacity-100 transition-opacity">FLUTTERWAVE</span>
            <span className="text-sm font-black font-mono tracking-tight text-white hover:opacity-100 transition-opacity">MONIEPOINT</span>
            <span className="text-sm font-black font-mono tracking-tight text-white hover:opacity-100 transition-opacity">KUDA BANK</span>
            <span className="text-sm font-black font-mono tracking-tight text-white hover:opacity-100 transition-opacity">OPAY</span>
            <span className="text-sm font-black font-mono tracking-tight text-white hover:opacity-100 transition-opacity">JUMIA</span>
            <span className="text-sm font-black font-mono tracking-tight text-white hover:opacity-100 transition-opacity">ETRANZACT</span>
            <span className="text-sm font-black font-mono tracking-tight text-white hover:opacity-100 transition-opacity">GTBANK</span>
            <span className="text-sm font-black font-mono tracking-tight text-white hover:opacity-100 transition-opacity">ACCESS BANK</span>
          </div>
        </div>
      </section>

      {/* SECTION 4: THE FLOKKER PLATFORM ECOSYSTEM VISUALIZATION */}
      <section id="platform" className="relative py-24 px-6 sm:px-8 z-10 bg-slate-950/20">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6C63FF]">
              SYSTEM TOPOLOGY
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              The Flokker Digital Growth Engine
            </h2>
            <p className="text-sm text-[#94A3B8] font-light leading-relaxed">
              Every marketing action requires exact market data. Our service layer connects directly with Ocula BI to deploy hyper-targeted local visibility operations.
            </p>
          </div>

          {/* Interactive Topology Graph */}
          <div className="relative border border-white/5 rounded-3xl bg-[#101828]/25 p-8 md:p-12 min-h-[460px] flex items-center justify-center overflow-hidden">
            
            {/* SVG Connector Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 400" preserveAspectRatio="none">
              <defs>
                <linearGradient id="glowG" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6C63FF" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              {/* Lines from center to outer orbits */}
              <line x1="400" y1="200" x2="180" y2="100" stroke="url(#glowG)" strokeWidth="1" strokeDasharray="5 5" />
              <line x1="400" y1="200" x2="620" y2="100" stroke="url(#glowG)" strokeWidth="1" strokeDasharray="5 5" />
              <line x1="400" y1="200" x2="180" y2="300" stroke="url(#glowG)" strokeWidth="1" strokeDasharray="5 5" />
              <line x1="400" y1="200" x2="620" y2="300" stroke="url(#glowG)" strokeWidth="1" strokeDasharray="5 5" />

              <line x1="400" y1="200" x2="400" y2="60" stroke="url(#glowG)" strokeWidth="1" strokeDasharray="5 5" />
              <line x1="400" y1="200" x2="400" y2="340" stroke="url(#glowG)" strokeWidth="1" strokeDasharray="5 5" />
            </svg>

            <div className="grid grid-cols-1 md:grid-cols-3 w-full max-w-5xl gap-12 items-center relative z-10">
              
              {/* Left Orbit Nodes */}
              <div className="space-y-6">
                <div className="bg-[#101828]/80 border border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:border-[#6C63FF]/30 transition-colors">
                  <div className="p-2.5 rounded-xl bg-[#6C63FF]/15 text-[#6C63FF]">
                    <Search className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-mono font-bold text-white uppercase">SEO Node</h4>
                    <p className="text-[10px] text-[#94A3B8]">Automatic Map Rank Optimization</p>
                  </div>
                </div>

                <div className="bg-[#101828]/80 border border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:border-[#6C63FF]/30 transition-colors">
                  <div className="p-2.5 rounded-xl bg-[#8B5CF6]/15 text-[#8B5CF6]">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-mono font-bold text-white uppercase">Social Feed Node</h4>
                    <p className="text-[10px] text-[#94A3B8]">Algorithmic Audience Generation</p>
                  </div>
                </div>
              </div>

              {/* CENTER HUB: Ocula BI */}
              <div className="flex flex-col items-center">
                <div className="relative group cursor-pointer" onClick={() => onLaunchOculaBI()}>
                  {/* Outer Pulsing Orbs */}
                  <div className="absolute -inset-6 rounded-full bg-[#6C63FF]/10 blur-xl animate-pulse" />
                  <div className="absolute -inset-4 border border-[#8B5CF6]/30 rounded-full animate-ping pointer-events-none" />
                  
                  <div className="w-32 h-32 rounded-full bg-[#111827] border-2 border-[#6C63FF] flex flex-col items-center justify-center p-4 text-center shadow-2xl transition-transform duration-300 group-hover:scale-105">
                    <OculaLogo className="w-12 h-12 text-[#6C63FF] mb-2 animate-spin-slow" />
                    <span className="text-xs font-black uppercase tracking-widest text-white">OCULA BI</span>
                    <span className="text-[8px] font-mono text-[#6C63FF]">INTELLIGENCE CORE</span>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <span className="text-[10px] font-mono font-bold bg-[#6C63FF]/10 text-[#6C63FF] px-2.5 py-1 rounded-full border border-[#6C63FF]/20">
                    Active Data Interlink
                  </span>
                </div>
              </div>

              {/* Right Orbit Nodes */}
              <div className="space-y-6">
                <div className="bg-[#101828]/80 border border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:border-[#6C63FF]/30 transition-colors">
                  <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400">
                    <Code className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-mono font-bold text-white uppercase">Web Engine Node</h4>
                    <p className="text-[10px] text-[#94A3B8]">Vercel-backed edge performance</p>
                  </div>
                </div>

                <div className="bg-[#101828]/80 border border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:border-[#6C63FF]/30 transition-colors">
                  <div className="p-2.5 rounded-xl bg-[#FDBA2D]/15 text-[#FDBA2D]">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-mono font-bold text-white uppercase">Local Activation Node</h4>
                    <p className="text-[10px] text-[#94A3B8]">Geo-spatial regional campaigns</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Core Philosophy Banner */}
          <div className="mt-12 text-center">
            <h3 className="text-xl sm:text-2xl font-light text-[#94A3B8] leading-relaxed italic">
              "We don't sell marketing. <span className="text-white font-extrabold not-italic">We build digital growth systems.</span>"
            </h3>
            <p className="text-[11px] font-mono text-[#6C63FF] uppercase tracking-widest mt-2">
              Every asset operates directly through our state-of-the-art regional data loop.
            </p>
          </div>

        </div>
      </section>

      {/* SECTION 5: CORE SERVICES - FIVE PREMIUM HORIZONTAL CARDS */}
      <section id="services" className="relative py-24 px-6 sm:px-8 z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6C63FF]">
                OUR CAPABILITIES
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
                Core Digital Growth Services
              </h2>
            </div>
            <p className="text-sm text-[#94A3B8] max-w-md font-light leading-relaxed">
              Unrivaled strategic engineering for ambitious brands scaling across Lagos, Nairobi, Johannesburg, Cairo, and Accra.
            </p>
          </div>

          {/* 5 Premium Horizontal Cards */}
          <div className="space-y-6">
            
            {/* Card 1: Ocula BI */}
            <div className="group relative rounded-3xl bg-[#101828]/40 border border-white/5 p-8 md:p-10 flex flex-col lg:flex-row gap-8 justify-between items-start lg:items-center hover:border-[#6C63FF]/30 hover:bg-[#101828]/65 transition-all">
              <div className="space-y-4 max-w-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-[#6C63FF]/10 border border-[#6C63FF]/20 text-[#6C63FF]">
                    <Brain className="w-6 h-6 animate-pulse" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white">Ocula BI (AI Visibility Intelligence)</h3>
                </div>
                <p className="text-xs sm:text-sm text-[#94A3B8] font-light leading-relaxed">
                  Our core intelligence platform that audits your local digital footprints, analyzes real-time competitor density, maps regional visibility clusters, and exposes clear local growth opportunities.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="text-[10px] font-mono bg-white/5 text-white px-2.5 py-1 rounded-md">Real-time Audits</span>
                  <span className="text-[10px] font-mono bg-white/5 text-white px-2.5 py-1 rounded-md">Competitor Density Mapping</span>
                  <span className="text-[10px] font-mono bg-white/5 text-white px-2.5 py-1 rounded-md">Predictive Search Modeling</span>
                </div>
              </div>
              <button onClick={() => onLaunchOculaBI()} className="w-full lg:w-auto px-6 py-3.5 rounded-full bg-[#6C63FF] hover:bg-[#5a52e0] text-white font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-[#6C63FF]/10 flex items-center justify-center gap-2 group-hover:translate-x-1">
                <span>Access Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Card 2: SEO / SEM */}
            <div className="group relative rounded-3xl bg-[#101828]/40 border border-white/5 p-8 md:p-10 flex flex-col lg:flex-row gap-8 justify-between items-start lg:items-center hover:border-[#8B5CF6]/30 hover:bg-[#101828]/65 transition-all">
              <div className="space-y-4 max-w-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 text-[#8B5CF6]">
                    <Search className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white">SEO / SEM Intelligence</h3>
                </div>
                <p className="text-xs sm:text-sm text-[#94A3B8] font-light leading-relaxed">
                  Stop chasing raw clicks. We construct local map SEO authority networks and high-conversion paid channels backed by absolute regional search volume metrics.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="text-[10px] font-mono bg-white/5 text-white px-2.5 py-1 rounded-md">Local Map Grid Dominance</span>
                  <span className="text-[10px] font-mono bg-white/5 text-white px-2.5 py-1 rounded-md">Paid Funnel Engineering</span>
                  <span className="text-[10px] font-mono bg-white/5 text-white px-2.5 py-1 rounded-md">Map Pack Optimization</span>
                </div>
              </div>
              <button onClick={() => { setEmailSubject('SEO / SEM Request'); setEmailModalOpen(true); }} className="w-full lg:w-auto px-6 py-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-[#F8FAFC] font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                <span>Grow Search</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Card 3: Social Media */}
            <div className="group relative rounded-3xl bg-[#101828]/40 border border-white/5 p-8 md:p-10 flex flex-col lg:flex-row gap-8 justify-between items-start lg:items-center hover:border-[#4F8BFF]/30 hover:bg-[#101828]/65 transition-all">
              <div className="space-y-4 max-w-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-[#4F8BFF]/10 border border-[#4F8BFF]/20 text-[#4F8BFF]">
                    <Share2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white">Social Media Management</h3>
                </div>
                <p className="text-xs sm:text-sm text-[#94A3B8] font-light leading-relaxed">
                  Engineered storytelling to capture high-value awareness, build audience cohorts, and maintain consistent, premium attention across modern networks.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="text-[10px] font-mono bg-white/5 text-white px-2.5 py-1 rounded-md">Creative Brand Narrative</span>
                  <span className="text-[10px] font-mono bg-white/5 text-white px-2.5 py-1 rounded-md">Audience Retention Analytics</span>
                  <span className="text-[10px] font-mono bg-white/5 text-white px-2.5 py-1 rounded-md">Conversion Retargeting</span>
                </div>
              </div>
              <button onClick={() => { setEmailSubject('Social Media Inquiry'); setEmailModalOpen(true); }} className="w-full lg:w-auto px-6 py-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-[#F8FAFC] font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                <span>Capture Attention</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Card 4: Web Development */}
            <div className="group relative rounded-3xl bg-[#101828]/40 border border-white/5 p-8 md:p-10 flex flex-col lg:flex-row gap-8 justify-between items-start lg:items-center hover:border-emerald-500/30 hover:bg-[#101828]/65 transition-all">
              <div className="space-y-4 max-w-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <Code className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white">Website Development & Engineering</h3>
                </div>
                <p className="text-xs sm:text-sm text-[#94A3B8] font-light leading-relaxed">
                  We deploy lightning-fast web architectures engineered with Next.js, React, Tailwind, and Vercel. Pristine responsiveness, high SEO fidelity, and conversions integrated natively.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="text-[10px] font-mono bg-white/5 text-white px-2.5 py-1 rounded-md">Custom Next.js Systems</span>
                  <span className="text-[10px] font-mono bg-white/5 text-white px-2.5 py-1 rounded-md">99+ Mobile Lighthouse Scores</span>
                  <span className="text-[10px] font-mono bg-white/5 text-white px-2.5 py-1 rounded-md">Pristine Conversions</span>
                </div>
              </div>
              <button onClick={() => { setEmailSubject('Web Development Request'); setEmailModalOpen(true); }} className="w-full lg:w-auto px-6 py-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-[#F8FAFC] font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                <span>Deploy Engine</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Card 5: Local Activation */}
            <div className="group relative rounded-3xl bg-[#101828]/40 border border-white/5 p-8 md:p-10 flex flex-col lg:flex-row gap-8 justify-between items-start lg:items-center hover:border-[#FDBA2D]/30 hover:bg-[#101828]/65 transition-all">
              <div className="space-y-4 max-w-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-[#FDBA2D]/10 border border-[#FDBA2D]/20 text-[#FDBA2D]">
                    <Target className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white">Local Market Activation</h3>
                </div>
                <p className="text-xs sm:text-sm text-[#94A3B8] font-light leading-relaxed">
                  Bridge the gap between digital indicators and real-world activation. We build localized field visibility, physical map presence, and local campaigns designed to win major cities.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="text-[10px] font-mono bg-white/5 text-white px-2.5 py-1 rounded-md">Physical Store Optimization</span>
                  <span className="text-[10px] font-mono bg-white/5 text-white px-2.5 py-1 rounded-md">Geo-Targeted Local Marketing</span>
                  <span className="text-[10px] font-mono bg-white/5 text-white px-2.5 py-1 rounded-md">Offline-to-Online Funnels</span>
                </div>
              </div>
              <button onClick={() => { setEmailSubject('Local Market Activation Inquiry'); setEmailModalOpen(true); }} className="w-full lg:w-auto px-6 py-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-[#F8FAFC] font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                <span>Own Your City</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 6: INTERACTIVE DEMO ANALYTICAL DASHBOARD */}
      <section className="relative py-24 px-6 sm:px-8 z-10 bg-slate-950/40">
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6C63FF]">
              SYSTEM PREVIEW
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              Ocula Intelligence Dashboard
            </h2>
            <p className="text-sm text-[#94A3B8] font-light leading-relaxed">
              Explore the exact regional datasets generated by Ocula BI to track keyword dominance, map search coordinates, and outperform market rivals.
            </p>
          </div>

          {/* Large Enterprise Dashboard Container */}
          <div className="border border-white/5 rounded-3xl bg-[#101828]/40 shadow-2xl overflow-hidden backdrop-blur-xl">
            
            {/* Window Header */}
            <div className="bg-[#111827]/80 px-6 py-4 border-b border-white/5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-[11px] font-mono font-bold text-[#94A3B8] tracking-widest uppercase">
                  Ocula BI • Interactive Simulator
                </span>
              </div>

              {/* Mini Tabs */}
              <div className="flex bg-slate-900/80 rounded-xl p-1 border border-white/5 text-xs font-bold font-mono">
                <button 
                  onClick={() => setDashboardTab('visibility')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${dashboardTab === 'visibility' ? 'bg-[#6C63FF] text-white shadow-sm' : 'text-[#94A3B8] hover:text-white'}`}
                >
                  Visibility Metrics
                </button>
                <button 
                  onClick={() => setDashboardTab('keywords')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${dashboardTab === 'keywords' ? 'bg-[#6C63FF] text-white shadow-sm' : 'text-[#94A3B8] hover:text-white'}`}
                >
                  Keyword Growth
                </button>
                <button 
                  onClick={() => setDashboardTab('competitors')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${dashboardTab === 'competitors' ? 'bg-[#6C63FF] text-white shadow-sm' : 'text-[#94A3B8] hover:text-white'}`}
                >
                  Competitor Grid
                </button>
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="p-6 md:p-8 space-y-6">
              
              <AnimatePresence mode="wait">
                
                {dashboardTab === 'visibility' && (
                  <motion.div 
                    key="visibility"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                  >
                    {/* Stat Card 1 */}
                    <div className="bg-[#111827]/60 border border-white/5 rounded-2xl p-5 space-y-2">
                      <span className="text-[9px] font-mono font-bold text-[#94A3B8] uppercase">SEARCH VISIBILITY</span>
                      <div className="flex items-baseline justify-between">
                        <span className="text-3xl font-black text-white">88.4%</span>
                        <span className="text-xs font-bold text-emerald-400 font-mono">+12.5%</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] rounded-full w-[88%]" />
                      </div>
                      <p className="text-[10px] text-[#94A3B8] font-light">Leading local commerce segment density.</p>
                    </div>

                    {/* Stat Card 2 */}
                    <div className="bg-[#111827]/60 border border-white/5 rounded-2xl p-5 space-y-2">
                      <span className="text-[9px] font-mono font-bold text-[#94A3B8] uppercase">MAP PACK APPEARANCES</span>
                      <div className="flex items-baseline justify-between">
                        <span className="text-3xl font-black text-white">12.4K</span>
                        <span className="text-xs font-bold text-[#6C63FF] font-mono">+8.2%</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#4F8BFF] rounded-full w-[72%]" />
                      </div>
                      <p className="text-[10px] text-[#94A3B8] font-light">Organic discovery counts in target regions.</p>
                    </div>

                    {/* Stat Card 3 */}
                    <div className="bg-[#111827]/60 border border-white/5 rounded-2xl p-5 space-y-2">
                      <span className="text-[9px] font-mono font-bold text-[#94A3B8] uppercase">OVERALL INTEGRITY SCORE</span>
                      <div className="flex items-baseline justify-between">
                        <span className="text-3xl font-black text-[#FDBA2D]">94/100</span>
                        <span className="text-xs font-bold text-[#FDBA2D] font-mono">Strong</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#4F8BFF] to-[#FDBA2D] rounded-full w-[94%]" />
                      </div>
                      <p className="text-[10px] text-[#94A3B8] font-light">Calculated brand footprint alignment score.</p>
                    </div>

                    {/* Interactive Heatmap visualizer */}
                    <div className="md:col-span-3 bg-[#111827]/30 border border-white/5 rounded-2xl p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                          National Map Visibility Grid (Simulated Sector Heatmap)
                        </h4>
                        <span className="text-[10px] font-mono text-emerald-400">● 14 Scan points active</span>
                      </div>

                      {/* Mock Grid Matrix */}
                      <div className="grid grid-cols-7 gap-2.5">
                        {Array.from({ length: 14 }).map((_, i) => {
                          const value = Math.round(Math.sin(i * 0.4) * 45 + 55);
                          return (
                            <div 
                              key={i} 
                              className="aspect-square rounded-lg flex flex-col justify-between p-2 relative group cursor-pointer transition-transform hover:scale-105"
                              style={{ 
                                background: `rgba(108, 99, 255, ${value / 130})`,
                                border: '1px solid rgba(255, 255, 255, 0.05)'
                              }}
                            >
                              <span className="text-[8px] font-mono text-[#94A3B8]">#0{i+1}</span>
                              <span className="text-xs font-black text-white text-right">{value}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}

                {dashboardTab === 'keywords' && (
                  <motion.div 
                    key="keywords"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div className="bg-[#111827]/40 border border-white/5 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-xs font-mono font-bold text-white uppercase">Top Keyword Growth Index</h4>
                        <span className="text-[10px] font-mono text-indigo-400">Updated 4h ago</span>
                      </div>

                      <div className="space-y-4">
                        {[
                          { term: 'Fintech platforms Nigeria', volume: '18.4K/mo', growth: '+45%', share: 72 },
                          { term: 'SaaS solutions Kenya', volume: '8.2K/mo', growth: '+88%', share: 58 },
                          { term: 'Local map optimization Cape Town', volume: '5.5K/mo', growth: '+12%', share: 91 },
                          { term: 'Africa business intelligence tools', volume: '3.1K/mo', growth: '+120%', share: 44 }
                        ].map((kw, i) => (
                          <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-900/60 rounded-xl border border-white/5 gap-4">
                            <div className="space-y-1">
                              <span className="text-xs font-bold text-white font-mono">"{kw.term}"</span>
                              <div className="flex items-center gap-3 text-[10px] text-[#94A3B8]">
                                <span>Vol: {kw.volume}</span>
                                <span className="text-emerald-400">{kw.growth} growth</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 w-full sm:w-1/3">
                              <div className="h-2 bg-white/5 rounded-full overflow-hidden w-full">
                                <div className="h-full bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] rounded-full" style={{ width: `${kw.share}%` }} />
                              </div>
                              <span className="text-xs font-mono font-bold text-white whitespace-nowrap">{kw.share}% Share</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {dashboardTab === 'competitors' && (
                  <motion.div 
                    key="competitors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    <div className="bg-[#111827]/40 border border-white/5 rounded-2xl p-6 space-y-4">
                      <h4 className="text-xs font-mono font-bold text-white uppercase">Competitor Overlap Density</h4>
                      
                      <div className="space-y-4">
                        {[
                          { name: 'Local Rival A', overlap: 'High Overlap', score: 64, color: 'bg-rose-500' },
                          { name: 'Market Competitor B', overlap: 'Moderate Overlap', score: 52, color: 'bg-amber-500' },
                          { name: 'Search Disruptor C', overlap: 'Emerging Threat', score: 38, color: 'bg-indigo-400' }
                        ].map((comp, i) => (
                          <div key={i} className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-white">{comp.name}</span>
                              <span className="text-[#94A3B8] font-mono text-[10px]">{comp.overlap} • {comp.score}%</span>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                              <div className={`h-full ${comp.color}`} style={{ width: `${comp.score}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-[#111827]/40 border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
                      <div className="space-y-2">
                        <span className="text-[9px] font-mono font-bold text-[#6C63FF] uppercase">AI STRATEGIC INSIGHT</span>
                        <h4 className="text-base font-bold text-white">Vulnerability detected in West-Lagos Map Packs.</h4>
                        <p className="text-xs text-[#94A3B8] font-light leading-relaxed">
                          Your main rival lacks keyword compliance for local search tags. Rebuilding the map anchor strategy will result in a 24-30% organic visibility gain.
                        </p>
                      </div>

                      <button onClick={() => onLaunchOculaBI()} className="mt-4 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border border-white/10">
                        <span>Deploy SEO Shield</span>
                        <ArrowRight className="w-4 h-4 text-[#8B5CF6]" />
                      </button>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>

            </div>

          </div>

        </div>
      </section>

      {/* SECTION 7: HOW FLOKKER WORKS - FIVE TIMELINE CARDS */}
      <section className="relative py-24 px-6 sm:px-8 z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6C63FF]">
              OUR METHODOLOGY
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              The Path to Market Dominance
            </h2>
            <p className="text-sm text-[#94A3B8] font-light leading-relaxed">
              We deploy our custom growth pipeline through five sequential stages, securing persistent visibility from audit to scale.
            </p>
          </div>

          {/* Timeline Cards connected by animation lines */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
            
            {/* Timeline cards */}
            {[
              { num: '01', title: 'Discover', desc: 'Identify baseline visibility indicators, organic map footprints, and audit target commerce zones.' },
              { num: '02', title: 'Analyze', desc: 'Isolate regional competitor overlap, map-pack clusters, and keyword traffic opportunities.' },
              { num: '03', title: 'Recommend', desc: 'Formulate predictive growth models, map action targets, and outline custom local blueprints.' },
              { num: '04', title: 'Execute', desc: 'Deploy high-performance web systems, build map-pack authority, and run field campaigns.' },
              { num: '05', title: 'Scale', desc: 'Track traffic expansion, capture local markets, and continuously scale search prominence.' }
            ].map((step, idx) => (
              <div key={idx} className="bg-[#101828]/40 border border-white/5 rounded-2xl p-6 space-y-4 hover:border-[#6C63FF]/30 transition-all relative group">
                <span className="text-4xl font-display font-black bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] bg-clip-text text-transparent opacity-80 group-hover:scale-105 duration-300 block">
                  {step.num}
                </span>
                <h4 className="text-base font-bold text-white">{step.title}</h4>
                <p className="text-xs text-[#94A3B8] font-light leading-relaxed">{step.desc}</p>
              </div>
            ))}

          </div>

        </div>
      </section>

      {/* SECTION 8: CASE STUDIES - THREE PREMIUM SHOWCASE CARDS */}
      <section id="results" className="relative py-24 px-6 sm:px-8 z-10 border-t border-white/5 bg-slate-950/20">
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6C63FF]">
                PROOF OF CAPABILITY
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
                Proven Growth Metrics
              </h2>
            </div>
            <button onClick={handleOpenCalendly} className="w-full md:w-auto px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-widest border border-white/10 transition-colors">
              Request Growth Blueprint
            </button>
          </div>

          {/* Three Premium Case Study Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Case Study 1 */}
            <div className="bg-[#101828]/30 border border-white/5 rounded-3xl p-6 hover:border-[#6C63FF]/30 transition-all flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold bg-[#6C63FF]/10 text-[#6C63FF] px-2.5 py-1 rounded-md">FINTECH LEADER</span>
                  <span className="text-[10px] font-mono text-[#94A3B8]">Lagos, NG</span>
                </div>
                
                <div className="space-y-2">
                  <span className="text-3xl font-display font-black text-white">+142%</span>
                  <h4 className="text-base font-bold text-white">Map Pack Dominance Achieved</h4>
                  <p className="text-xs text-[#94A3B8] font-light leading-relaxed">
                    Overhauled GMB footprints across 12 physical branch locations to secure organic top-spot authority.
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 mt-6 flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-500">CONSUMER FINTECH</span>
                <button onClick={() => { setEmailSubject('Lagos Case Study Request'); setEmailModalOpen(true); }} className="text-xs font-bold text-[#6C63FF] hover:text-white transition-colors flex items-center gap-1.5">
                  <span>Read Case Study</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Case Study 2 */}
            <div className="bg-[#101828]/30 border border-white/5 rounded-3xl p-6 hover:border-[#8B5CF6]/30 transition-all flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold bg-[#8B5CF6]/10 text-[#8B5CF6] px-2.5 py-1 rounded-md">PROPTECH PLATFORM</span>
                  <span className="text-[10px] font-mono text-[#94A3B8]">Nairobi, KE</span>
                </div>

                <div className="space-y-2">
                  <span className="text-3xl font-display font-black text-white">4.8X</span>
                  <h4 className="text-base font-bold text-white">Organic Direct Conversions</h4>
                  <p className="text-xs text-[#94A3B8] font-light leading-relaxed">
                    Constructed a Next.js web application coupled with regional keyword landing funnels, securing inbound leads.
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 mt-6 flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-500">REAL ESTATE SYSTEMS</span>
                <button onClick={() => { setEmailSubject('Nairobi Case Study Request'); setEmailModalOpen(true); }} className="text-xs font-bold text-[#8B5CF6] hover:text-white transition-colors flex items-center gap-1.5">
                  <span>Read Case Study</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Case Study 3 */}
            <div className="bg-[#101828]/30 border border-white/5 rounded-3xl p-6 hover:border-[#FDBA2D]/30 transition-all flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold bg-[#FDBA2D]/10 text-[#FDBA2D] px-2.5 py-1 rounded-md">COMMERCE COHORT</span>
                  <span className="text-[10px] font-mono text-[#94A3B8]">Johannesburg, ZA</span>
                </div>

                <div className="space-y-2">
                  <span className="text-3xl font-display font-black text-white">$14M+</span>
                  <h4 className="text-base font-bold text-white">New Organic Channel Sales</h4>
                  <p className="text-xs text-[#94A3B8] font-light leading-relaxed">
                    Designed localized city-activation strategies coupled with search engine retargeting cohorts.
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 mt-6 flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-500">RETAIL ENTERPRISE</span>
                <button onClick={() => { setEmailSubject('Johannesburg Case Study Request'); setEmailModalOpen(true); }} className="text-xs font-bold text-[#FDBA2D] hover:text-white transition-colors flex items-center gap-1.5">
                  <span>Read Case Study</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 9: INDUSTRIES WE SERVE */}
      <section className="relative py-24 px-6 sm:px-8 z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6C63FF]">
              MARKET ADAPTABILITY
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              Sectors Under Management
            </h2>
            <p className="text-sm text-[#94A3B8] font-light leading-relaxed">
              We deploy custom-tailored search optimization blueprints for high-stakes business landscapes.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {[
              { name: 'Healthcare Systems', icon: Brain, color: 'text-indigo-400' },
              { name: 'Real Estate Platforms', icon: MapPin, color: 'text-[#8B5CF6]' },
              { name: 'Hospitality Networks', icon: Star, color: 'text-[#FDBA2D]' },
              { name: 'E-commerce Retail', icon: Smartphone, color: 'text-emerald-400' },
              { name: 'Higher Education', icon: Award, color: 'text-[#4F8BFF]' },
              { name: 'Professional Services', icon: Briefcase, color: 'text-indigo-400' },
              { name: 'SaaS Platforms', icon: Cpu, color: 'text-rose-400' },
              { name: 'Logistics Operators', icon: Globe, color: 'text-emerald-400' }
            ].map((ind, i) => (
              <div key={i} className="bg-[#101828]/40 border border-white/5 rounded-2xl p-5 flex items-center gap-4 hover:border-white/10 transition-colors">
                <div className={`p-2.5 rounded-xl bg-white/5 ${ind.color}`}>
                  <ind.icon className="w-5 h-5" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-white">{ind.name}</span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION 10: WHY FLOKKER */}
      <section className="relative py-24 px-6 sm:px-8 z-10 border-t border-white/5 bg-slate-950/20">
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6C63FF]">
              THE FLOKKER ADVANTAGE
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              Why High-Growth Brands Select Us
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="bg-[#101828]/30 border border-white/5 rounded-3xl p-8 space-y-4 hover:border-white/10 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#6C63FF]/10 border border-[#6C63FF]/25 flex items-center justify-center text-[#6C63FF]">
                <Cpu className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white">AI-Powered Intelligence</h4>
              <p className="text-xs text-[#94A3B8] font-light leading-relaxed">
                We do not guess. Our proprietary Ocula BI software scans, monitors, and evaluates search coordinates and competitor grids to expose genuine market voids.
              </p>
            </div>

            <div className="bg-[#101828]/30 border border-white/5 rounded-3xl p-8 space-y-4 hover:border-white/10 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/25 flex items-center justify-center text-[#8B5CF6]">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white">Senior Domain Experts</h4>
              <p className="text-xs text-[#94A3B8] font-light leading-relaxed">
                No junior account managers. You negotiate directly with battle-tested growth strategists who have built systems processing millions of page visits.
              </p>
            </div>

            <div className="bg-[#101828]/30 border border-white/5 rounded-3xl p-8 space-y-4 hover:border-white/10 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white">Absolute Execution</h4>
              <p className="text-xs text-[#94A3B8] font-light leading-relaxed">
                Pristine Next.js web applications, complex local activation operations, and robust SEO blueprints engineered to yield maximum conversions.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 11: TESTIMONIALS - CAROUSEL STYLE CARDS */}
      <section className="relative py-24 px-6 sm:px-8 z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6C63FF]">
              PARTNER VOICES
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              Feedback From Ambitious Founders
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            
            {/* Testimonial 1 */}
            <div className="bg-[#101828]/40 border border-white/5 rounded-3xl p-8 space-y-6 flex flex-col justify-between">
              <p className="text-sm text-[#94A3B8] font-light leading-relaxed italic">
                "We had three marketing agencies failing to move our local map ranking in Lagos. Flokker deployed Ocula BI, isolated three competitor coordinate errors, and boosted our local search leads by 120% inside of 90 days. Their system is absolutely precise."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#6C63FF]/20 flex items-center justify-center font-bold text-white border border-[#6C63FF]/30">
                  EA
                </div>
                <div>
                  <h5 className="text-sm font-bold text-white">Emeka Anyaoku</h5>
                  <p className="text-[10px] text-slate-500 font-mono">FOUNDER, LAGOS COMMERCE COHORT</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-[#101828]/40 border border-white/5 rounded-3xl p-8 space-y-6 flex flex-col justify-between">
              <p className="text-sm text-[#94A3B8] font-light leading-relaxed italic">
                "Their custom website development speed was incredible. Our Next.js proptech platform went live in three weeks, scoring 98 on Lighthouse, and organic search leads grew 4.8X in Cairo and Nairobi. Best growth engineering on the continent."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center font-bold text-white border border-[#8B5CF6]/30">
                  WM
                </div>
                <div>
                  <h5 className="text-sm font-bold text-white">Wanjiku Mwangi</h5>
                  <p className="text-[10px] text-slate-500 font-mono">PRODUCT DIRECT, PORTAL KE</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 12: PRICING PREVIEW - INTERACTIVE PACKAGE BUILDER */}
      <section id="pricing" className="relative py-24 px-6 sm:px-8 z-10 border-t border-white/5 bg-slate-950/20">
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6C63FF]">
              INVESTMENT ESTIMATOR
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              Construct Your Custom Plan
            </h2>
            <p className="text-sm text-[#94A3B8] font-light leading-relaxed">
              Select your required growth modules, state your business parameters, and view a dynamic estimated monthly campaign investment.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-5xl mx-auto">
            
            {/* Interactive Selectors Left */}
            <div className="lg:col-span-7 space-y-8 bg-[#101828]/35 border border-white/5 rounded-3xl p-6 sm:p-8">
              
              {/* Option 1: Services */}
              <div className="space-y-3">
                <label className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Select Growth Services
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'ocula', name: 'Ocula BI Core', desc: 'Required database audit' },
                    { id: 'seo', name: 'SEO & Search Engine', desc: 'Traffic & rankings' },
                    { id: 'social', name: 'Social Management', desc: 'Story & cohorts' },
                    { id: 'web', name: 'Custom Next.js Web', desc: 'Lightning-fast conversion' },
                    { id: 'local', name: 'Local City Activation', desc: 'Field visibility' }
                  ].map((srv) => (
                    <button
                      key={srv.id}
                      onClick={() => toggleServiceBuilder(srv.id)}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        selectedServices.includes(srv.id)
                          ? 'border-[#6C63FF] bg-[#6C63FF]/10 text-white'
                          : 'border-white/5 bg-slate-900/60 hover:border-white/10 text-[#94A3B8]'
                      }`}
                    >
                      <span className="text-xs font-bold block">{srv.name}</span>
                      <span className="text-[9px] font-light text-slate-500 mt-1">{srv.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Option 2: Business Size */}
              <div className="space-y-3">
                <label className="text-xs font-mono font-bold text-white uppercase tracking-wider block">
                  Business Scale
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'startup', name: 'Startup', desc: 'Local' },
                    { id: 'growth', name: 'Growth', desc: 'Multi-city' },
                    { id: 'enterprise', name: 'Enterprise', desc: 'Continental' }
                  ].map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setBusinessSize(size.id as any)}
                      className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center ${
                        businessSize === size.id
                          ? 'border-[#8B5CF6] bg-[#8B5CF6]/10 text-white'
                          : 'border-white/5 bg-slate-900/60 hover:border-white/10 text-[#94A3B8]'
                      }`}
                    >
                      <span className="text-xs font-bold block">{size.name}</span>
                      <span className="text-[9px] font-light text-slate-500 mt-1">{size.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Option 3: Campaign Target Region */}
              <div className="space-y-3">
                <label className="text-xs font-mono font-bold text-white uppercase tracking-wider block">
                  Target Geographic Scope
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'national', name: 'National', desc: '1 Country' },
                    { id: 'continental', name: 'Continental', desc: 'Pan-African' },
                    { id: 'global', name: 'Global', desc: 'International' }
                  ].map((region) => (
                    <button
                      key={region.id}
                      onClick={() => setTargetRegion(region.id as any)}
                      className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center ${
                        targetRegion === region.id
                          ? 'border-[#4F8BFF] bg-[#4F8BFF]/10 text-white'
                          : 'border-white/5 bg-slate-900/60 hover:border-white/10 text-[#94A3B8]'
                      }`}
                    >
                      <span className="text-xs font-bold block">{region.name}</span>
                      <span className="text-[9px] font-light text-slate-500 mt-1">{region.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Price Output Display Right */}
            <div className="lg:col-span-5 flex flex-col justify-between bg-gradient-to-br from-[#101828] to-[#111827] border border-white/5 rounded-3xl p-8 text-center space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#6C63FF]/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="space-y-2">
                <span className="text-[9px] font-mono font-bold bg-[#6C63FF]/15 text-[#6C63FF] px-2.5 py-1 rounded-full border border-[#6C63FF]/20 uppercase">
                  Simulated Pricing Estimates
                </span>
                <p className="text-xs text-[#94A3B8] font-light pt-2">Your bespoke digital pipeline value is approximately:</p>
                
                <div className="pt-4">
                  <span className="text-5xl font-display font-black text-white">${calculatedInvestment.toLocaleString()}</span>
                  <span className="text-xs font-bold text-[#94A3B8]"> / month</span>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5 text-left text-xs font-light text-[#94A3B8] space-y-2.5">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Includes full dashboard and continuous audit core.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Monthly reporting with custom visibility metrics.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>No lock-in terms. Modify campaign parameters easily.</span>
                </div>
              </div>

              <button 
                onClick={handleOpenCalendly}
                className="w-full py-4 rounded-full bg-[#6C63FF] hover:bg-[#5a52e0] text-white font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-[#6C63FF]/20"
              >
                Book Growth Consultation
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 13: FAQ - SMOOTH MINIMAL ACCORDIONS */}
      <section id="faq" className="relative py-24 px-6 sm:px-8 z-10 border-t border-white/5">
        <div className="max-w-4xl mx-auto space-y-16">
          
          <div className="text-center space-y-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6C63FF]">
              SUPPORT CENTER
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "What is Ocula BI and how does it power your marketing services?",
                a: "Ocula BI is our proprietary local visibility software. Rather than guessing keyword rankings, Ocula runs massive daily local map and search engine audits, calculates competitor overlapping densities, and uncovers physical search coordinates. Our growth specialists use this live data to deploy targeted marketing efforts."
              },
              {
                q: "Do you offer localized marketing outside of Lagos and Nairobi?",
                a: "Yes. Our local activation pipelines cover major sub-Saharan metropolitan commerce centers, including Accra, Cairo, Johannesburg, Cape Town, and Abidjan. We customize operations to align directly with localized regional search nuances."
              },
              {
                q: "Can I use Ocula BI independently of consulting packages?",
                a: "Absolutely. Ocula BI is a stand-alone visibility platform. Ambitious brands can register to audit, map, and track competitor footprints independently."
              },
              {
                q: "What is your typical campaign deployment timeline?",
                a: "Initial Ocula visibility auditing begins immediately. Service blueprints are formulated and deployed within 14-21 days of strategy confirmation."
              },
              {
                q: "How does the campaign estimator calculate investment?",
                a: "Our estimator tracks baseline asset development costs (such as Next.js app construction or physical visibility tags) relative to chosen target geographical scopes and multi-location multipliers."
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-[#101828]/40 border border-white/5 rounded-2xl overflow-hidden transition-all hover:border-white/10">
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-white text-sm sm:text-base"
                >
                  <span>{item.q}</span>
                  {activeFaq === idx ? <ChevronUp className="w-5 h-5 text-[#6C63FF]" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                </button>
                
                <AnimatePresence>
                  {activeFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/5 bg-slate-950/20"
                    >
                      <p className="p-6 text-xs sm:text-sm text-[#94A3B8] font-light leading-relaxed">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* FINAL CTA: PREMIUM GRADIENT HERO */}
      <section className="relative py-24 px-6 sm:px-8 z-10 border-t border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#6C63FF]/15 via-transparent to-[#8B5CF6]/5 pointer-events-none" />
        
        <div className="max-w-5xl mx-auto bg-[#101828]/40 border border-white/5 rounded-3xl p-8 md:p-16 text-center space-y-8 relative overflow-hidden">
          <div className="absolute -inset-10 bg-gradient-to-r from-[#6C63FF]/5 to-[#8B5CF6]/5 rounded-3xl blur-2xl pointer-events-none animate-pulse" />
          
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-6xl font-black text-white tracking-tight leading-[1.1]">
              Ready to Build Your Next Growth Engine?
            </h2>
            <p className="text-sm sm:text-base text-[#94A3B8] font-light leading-relaxed">
              Connect with senior digital growth strategists and map out your custom Ocula Visibility audit report.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleOpenCalendly}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#6C63FF] hover:bg-[#5a52e0] text-white font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-[#6C63FF]/20"
            >
              Book Strategy Call
            </button>
            <button
              onClick={() => { setEmailSubject('General Inquiry'); setEmailModalOpen(true); }}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-[#F8FAFC] font-bold text-xs uppercase tracking-widest transition-all"
            >
              Contact Sales
            </button>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative bg-[#070B1A] border-t border-white/5 py-16 px-6 sm:px-8 z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 border-b border-white/5 pb-12">
          
          {/* Logo & Description */}
          <div className="md:col-span-4 space-y-6">
            <FlokkerLogo className="h-8 w-auto text-[#6C63FF]" />
            <p className="text-xs text-[#94A3B8] font-light leading-relaxed max-w-sm">
              Flokker builds digital growth pipelines. We combine proprietary Ocula BI intelligence with pristine search and web execution for ambitious enterprises.
            </p>
            <div className="text-[10px] font-mono text-slate-500">
              © {new Date().getFullYear()} Flokker Digital Ltd. All rights reserved.
            </div>
          </div>

          {/* Links Multi-column */}
          <div className="md:col-span-2 space-y-4">
            <h5 className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6C63FF]">
              Products
            </h5>
            <ul className="space-y-2 text-xs font-light text-[#94A3B8]">
              <li><button onClick={() => onLaunchOculaBI()} className="hover:text-white transition-colors">Ocula BI</button></li>
              <li><button onClick={() => onLaunchOculaBI()} className="hover:text-white transition-colors">Visibility Audits</button></li>
              <li><button onClick={() => onLaunchOculaBI()} className="hover:text-white transition-colors">Competitor Overlap</button></li>
              <li><button onClick={() => onLaunchOculaBI()} className="hover:text-white transition-colors">API Access</button></li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-4">
            <h5 className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8B5CF6]">
              Solutions
            </h5>
            <ul className="space-y-2 text-xs font-light text-[#94A3B8]">
              <li><a href="#services" className="hover:text-white transition-colors">SEO & SEM</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Social Management</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Next.js Web Dev</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">City Activation</a></li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-4">
            <h5 className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FDBA2D]">
              Resources
            </h5>
            <ul className="space-y-2 text-xs font-light text-[#94A3B8]">
              <li><a href="#results" className="hover:text-white transition-colors">Case Studies</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing Builder</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">Support FAQ</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">Africa Digital Index</a></li>
            </ul>
          </div>

          {/* Legal / Social */}
          <div className="md:col-span-2 space-y-4">
            <h5 className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
              Corporate
            </h5>
            <ul className="space-y-2 text-xs font-light text-[#94A3B8]">
              <li><a href="#faq" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-mono text-slate-600">
          <div>
            System status: <span className="text-emerald-400 font-bold">● Operational</span> • Latency: 12ms
          </div>
          <div>
            Design Language v2.1 • Crafted alongside Stripe & Vercel paradigms.
          </div>
        </div>
      </footer>

      {/* EMAIL MODAL COMPONENT */}
      <AnimatePresence>
        {emailModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEmailModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-[#101828] border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6 z-10"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[#6C63FF]" />
                  <h3 className="text-lg font-bold text-white">Contact Ocula / Flokker</h3>
                </div>
                <button onClick={() => setEmailModalOpen(false)} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                  <X className="w-4 h-4 text-slate-500 hover:text-white" />
                </button>
              </div>

              {emailSuccess ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full mx-auto flex items-center justify-center border border-emerald-500/20">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-white">Message Dispatched</h4>
                  <p className="text-xs text-[#94A3B8]">A senior growth strategist will contact you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSendEmail} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-500 block">Your Email</label>
                    <input 
                      type="email" 
                      required 
                      value={emailSender}
                      onChange={(e) => setEmailSender(e.target.value)}
                      placeholder="e.g. emeka@company.com" 
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-[#6C63FF] focus:ring-0 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-500 block">Subject</label>
                    <input 
                      type="text" 
                      required 
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-[#6C63FF] focus:ring-0 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-500 block">Strategic Growth Scope</label>
                    <textarea 
                      rows={4} 
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      placeholder="Briefly state your target locations, market blockers, or business size..." 
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-[#6C63FF] focus:ring-0 outline-none resize-none"
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-3.5 rounded-xl bg-[#6C63FF] hover:bg-[#5a52e0] text-white text-xs font-bold uppercase tracking-widest transition-all"
                  >
                    Submit Scope Inquiry
                  </button>
                </form>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default FlokkerPreLanding;
