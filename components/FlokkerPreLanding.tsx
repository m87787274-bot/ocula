import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, 
  Search, 
  Share2, 
  Code, 
  Zap, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  BarChart3, 
  Rocket, 
  ArrowRight, 
  CheckCircle2, 
  ChevronRight, 
  Users, 
  MessageSquare, 
  Layers, 
  Award, 
  Star, 
  PhoneCall, 
  Mail,
  ExternalLink, 
  Eye, 
  Target, 
  Check,
  Activity,
  Flame,
  ArrowUpRight,
  Calculator,
  Calendar,
  X,
  Send,
  LayoutDashboard
} from 'lucide-react';
import OculaLogo from './OculaLogo';

interface FlokkerPreLandingProps {
  user: any;
  onLaunchOculaBI: (businessName?: string, industry?: string, companySize?: string) => void;
  onLogin: () => void;
  onGoToDashboard?: () => void;
  onViewPricing?: () => void;
  onViewLegal?: () => void;
  onGiveFeedback?: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const FlokkerPreLanding: React.FC<FlokkerPreLandingProps> = ({
  user,
  onLaunchOculaBI,
  onLogin,
  onGoToDashboard,
  onViewPricing,
  onViewLegal,
  onGiveFeedback,
  isDarkMode = true,
}) => {
  const [heroBusinessName, setHeroBusinessName] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'ocula' | 'seo' | 'social' | 'web' | 'activation'>('all');
  
  // Interactive Contact & Booking State
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedServiceForModal, setSelectedServiceForModal] = useState<string>('General Inquiry');
  const [modalEmail, setModalEmail] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);

  // Proposal Calculator State
  const [selectedServices, setSelectedServices] = useState<string[]>(['ocula', 'seo', 'web']);
  const [companyTier, setCompanyTier] = useState<string>('growth');
  const [timeline, setTimeline] = useState<string>('quarterly');

  const handleOpenCalendly = () => {
    window.open('https://calendly.com/teamflokker/new-meeting', '_blank');
  };

  const handleOpenEmailModal = (serviceName: string = 'General Inquiry') => {
    setSelectedServiceForModal(serviceName);
    setIsContactModalOpen(true);
    setIsEmailSent(false);
  };

  const handleSendEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalEmail) return;
    setIsEmailSent(true);
    setTimeout(() => {
      // Also open mailto as fallback
      window.location.href = `mailto:hello@flokker.com?subject=Flokker Inquiry: ${encodeURIComponent(selectedServiceForModal)}&body=${encodeURIComponent(`Client Email: ${modalEmail}\n\nMessage:\n${modalMessage}`)}`;
    }, 800);
  };

  const handleServiceToggle = (id: string) => {
    if (selectedServices.includes(id)) {
      if (selectedServices.length > 1) {
        setSelectedServices(selectedServices.filter(s => s !== id));
      }
    } else {
      setSelectedServices([...selectedServices, id]);
    }
  };

  const estimatedPriceRange = () => {
    let base = 2500;
    if (selectedServices.includes('ocula')) base += 1500;
    if (selectedServices.includes('seo')) base += 2000;
    if (selectedServices.includes('social')) base += 1800;
    if (selectedServices.includes('web')) base += 3500;
    if (selectedServices.includes('activation')) base += 2800;

    if (companyTier === 'enterprise') base *= 1.8;
    if (companyTier === 'startup') base *= 0.85;

    return Math.round(base);
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      
      {/* TOP ANNOUNCEMENT BAR */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-950 text-xs font-medium py-2.5 px-4 border-b border-indigo-500/20 text-center flex items-center justify-center gap-3">
        <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider border border-indigo-400/30 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-300" /> FLOKKER
        </span>
        <span className="text-slate-200 hidden sm:inline">
          Ready to scale your business? Book a strategy call or get a tailored growth scope today.
        </span>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleOpenCalendly} 
            className="font-bold text-amber-300 hover:text-white transition-colors flex items-center gap-1 text-xs"
          >
            <Calendar className="w-3 h-3" /> Book Call
          </button>
          <span className="text-slate-600">•</span>
          <button 
            onClick={() => handleOpenEmailModal('General Inquiry')} 
            className="font-bold text-indigo-300 hover:text-white transition-colors flex items-center gap-1 text-xs"
          >
            <Mail className="w-3 h-3" /> Send Email
          </button>
        </div>
      </div>

      {/* HEADER NAVIGATION */}
      <header className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          
          {/* LOGO */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-amber-400 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-display font-black text-white text-xl tracking-tighter">
                F
              </div>
            </div>
            <div>
              <span className="text-2xl font-display font-black tracking-tight text-white">FLOKKER</span>
              <p className="text-[10px] font-mono text-indigo-400 -mt-1 tracking-widest uppercase font-bold">
                Digital Growth Agency
              </p>
            </div>
          </div>

          {/* DESKTOP NAV LINKS */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-slate-300">
            <a href="#services" className="hover:text-indigo-400 transition-colors">Our Services</a>
            <a href="#ocula-bi" className="hover:text-indigo-400 transition-colors flex items-center gap-1.5 text-indigo-300">
              <OculaLogo className="w-3.5 h-3.5 text-indigo-400" /> OCULA BI
            </a>
            <a href="#calculator" className="hover:text-indigo-400 transition-colors">Scope Estimator</a>
            <a href="#why-flokker" className="hover:text-indigo-400 transition-colors">Why Flokker</a>
          </nav>

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleOpenEmailModal('Header Contact')} 
              className="hidden sm:inline-flex px-4 py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-all items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5 text-indigo-400" />
              <span>Send Email</span>
            </button>

            <button 
              onClick={handleOpenCalendly} 
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Book a Call</span>
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 px-4 sm:px-8 overflow-hidden">
        {/* BACKGROUND GLOWS */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[350px] h-[350px] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* BADGE */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 border border-indigo-500/30 shadow-xl backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-300">
                FLOKKER • FULL-SPECTRUM DIGITAL SERVICES
              </span>
            </div>
          </div>

          {/* MAIN HEADLINE */}
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <h1 className="text-4xl sm:text-7xl font-display font-extrabold tracking-tight text-white leading-[1.08]">
              We Build, Scale & Accelerate <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-amber-300 bg-clip-text text-transparent">
                Digital Brands.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-400 font-light max-w-2xl mx-auto leading-relaxed">
              Flokker delivers high-impact digital services — from our signature <strong>OCULA BI</strong> intelligence platform to full SEO/SEM, Social Media Management, Custom Web Development, and Product/Market Activation.
            </p>

            {/* DIRECT HERO CTAs */}
            <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto">
              <button
                onClick={handleOpenCalendly}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm uppercase tracking-wider transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2.5 group"
              >
                <PhoneCall className="w-4 h-4 text-amber-300" />
                <span>Book a Strategy Call</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => handleOpenEmailModal('Hero Section')}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-white font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2.5"
              >
                <Mail className="w-4 h-4 text-indigo-400" />
                <span>Send Us an Email</span>
              </button>
            </div>

            <p className="text-xs text-slate-500 font-mono pt-2">
              ✓ Direct Access to Senior Growth Strategists • Response within 24 hours
            </p>
          </div>

          {/* LIVELY METRICS HIGHLIGHT */}
          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 text-center backdrop-blur-md">
              <p className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">$120M+</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Client Revenue Driven</p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 text-center backdrop-blur-md">
              <p className="text-3xl sm:text-4xl font-display font-bold text-indigo-400 tracking-tight">350+</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Successful Projects</p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 text-center backdrop-blur-md">
              <p className="text-3xl sm:text-4xl font-display font-bold text-purple-400 tracking-tight">99.4%</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Client Satisfaction</p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 text-center backdrop-blur-md">
              <p className="text-3xl sm:text-4xl font-display font-bold text-amber-400 tracking-tight">5 Services</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Unified Growth Partner</p>
            </div>
          </div>

        </div>
      </section>

      {/* 5 CORE FLOKKER SERVICES SECTION */}
      <section id="services" className="py-20 px-4 sm:px-8 bg-slate-900/40 border-t border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono font-bold uppercase tracking-widest mb-3">
                <Layers className="w-3.5 h-3.5" /> What We Do
              </div>
              <h2 className="text-3xl sm:text-5xl font-display font-bold text-white tracking-tight">
                Flokker’s 5 Core Services
              </h2>
              <p className="text-slate-400 text-sm max-w-xl mt-2 font-light">
                Explore our full suite of digital capabilities. Click any service to book a call or send an email directly to our team.
              </p>
            </div>

            {/* FILTER TABS */}
            <div className="flex flex-wrap gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
              {[
                { id: 'all', label: 'All Services' },
                { id: 'ocula', label: 'OCULA BI', icon: OculaLogo },
                { id: 'seo', label: 'SEO / SEM' },
                { id: 'social', label: 'Social Media' },
                { id: 'web', label: 'Web Dev' },
                { id: 'activation', label: 'Activation' },
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                  >
                    {IconComponent && <IconComponent className="w-3 h-3" />}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SERVICE CARDS GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* SERVICE 1: OCULA BI */}
            {(activeTab === 'all' || activeTab === 'ocula') && (
              <div id="ocula-bi" className="lg:col-span-2 bg-gradient-to-br from-indigo-950/90 via-slate-900 to-purple-950/90 border-2 border-indigo-500/40 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl group hover:border-indigo-400 transition-all flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center shadow-inner">
                        <OculaLogo className="w-7 h-7 text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-display font-bold text-white tracking-tight flex items-center gap-2">
                          OCULA BI
                          <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30">
                            Service 01
                          </span>
                        </h3>
                        <p className="text-xs font-mono text-indigo-300 uppercase tracking-widest">
                          Strategic Visibility Intelligence & Market Analysis
                        </p>
                      </div>
                    </div>
                    <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold uppercase tracking-wider border border-indigo-500/30">
                      Popular
                    </span>
                  </div>

                  <p className="text-slate-300 text-sm leading-relaxed">
                    OCULA BI gives your business deep clarity into market positioning, competitor visibility gaps, search ranking performance, and growth tactics in one comprehensive analysis.
                  </p>

                  {/* FEATURE BULLETS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="bg-slate-950/70 border border-indigo-500/20 p-3 rounded-xl flex items-center gap-3">
                      <BarChart3 className="w-5 h-5 text-indigo-400 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-white">360° Visibility Audit</p>
                        <p className="text-[10px] text-slate-400">Complete analysis across search & digital touchpoints</p>
                      </div>
                    </div>
                    <div className="bg-slate-950/70 border border-indigo-500/20 p-3 rounded-xl flex items-center gap-3">
                      <Target className="w-5 h-5 text-purple-400 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-white">Competitor Benchmarking</p>
                        <p className="text-[10px] text-slate-400">Discover where rivals are outranking your brand</p>
                      </div>
                    </div>
                    <div className="bg-slate-950/70 border border-indigo-500/20 p-3 rounded-xl flex items-center gap-3">
                      <Zap className="w-5 h-5 text-amber-400 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-white">Actionable Strategy Roadmap</p>
                        <p className="text-[10px] text-slate-400">Step-by-step priority guide to capture market share</p>
                      </div>
                    </div>
                    <div className="bg-slate-950/70 border border-indigo-500/20 p-3 rounded-xl flex items-center gap-3">
                      <Globe className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-white">Live App Demo Access</p>
                        <p className="text-[10px] text-slate-400">Test drive the interactive OCULA dashboard online</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTAs FOR OCULA BI */}
                <div className="pt-8 border-t border-indigo-500/20 mt-6 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={handleOpenCalendly}
                      className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center gap-2"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Book a Call</span>
                    </button>
                    <button
                      onClick={() => handleOpenEmailModal('OCULA BI Service')}
                      className="px-5 py-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-200 hover:text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2"
                    >
                      <Mail className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Send an Email</span>
                    </button>
                  </div>

                  <button
                    onClick={() => onLaunchOculaBI()}
                    className="px-4 py-3 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 border border-indigo-500/30"
                  >
                    <span>Try OCULA App</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* SERVICE 2: SEO & SEM */}
            {(activeTab === 'all' || activeTab === 'seo') && (
              <div className="bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all group">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <Search className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest">
                      Service 02
                    </span>
                    <h3 className="text-xl font-display font-bold text-white tracking-tight mt-0.5">
                      SEO & SEM Growth
                    </h3>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Search engine optimization, technical web authority building, and targeted Google Ads campaigns to get your business to the top of high-intent search results.
                  </p>

                  <div className="space-y-2 pt-2 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>Commercial Keyword Ranking Strategy</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>Technical & On-Page Audit & Fixes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>High-ROI Pay-Per-Click (PPC) Management</span>
                    </div>
                  </div>
                </div>

                {/* SERVICE CTAs */}
                <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-2">
                  <button 
                    onClick={handleOpenCalendly} 
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Book a Call</span>
                  </button>
                  <button 
                    onClick={() => handleOpenEmailModal('SEO / SEM Service')} 
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                  >
                    <Mail className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Send Email</span>
                  </button>
                </div>
              </div>
            )}

            {/* SERVICE 3: SOCIAL MEDIA MANAGEMENT */}
            {(activeTab === 'all' || activeTab === 'social') && (
              <div className="bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all group">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <Share2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest">
                      Service 03
                    </span>
                    <h3 className="text-xl font-display font-bold text-white tracking-tight mt-0.5">
                      Social Media Management
                    </h3>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    End-to-end social media management, content creation, brand voice curation, audience engagement, and campaign scheduling across LinkedIn, Twitter/X, Instagram & Meta.
                  </p>

                  <div className="space-y-2 pt-2 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>Custom Content Calendar & Graphics</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>Brand Sentiment & Audience Growth</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>Executive & Thought Leadership Curation</span>
                    </div>
                  </div>
                </div>

                {/* SERVICE CTAs */}
                <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-2">
                  <button 
                    onClick={handleOpenCalendly} 
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Book a Call</span>
                  </button>
                  <button 
                    onClick={() => handleOpenEmailModal('Social Media Management Service')} 
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                  >
                    <Mail className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Send Email</span>
                  </button>
                </div>
              </div>
            )}

            {/* SERVICE 4: WEBSITE DEVELOPMENT */}
            {(activeTab === 'all' || activeTab === 'web') && (
              <div className="bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all group">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Code className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest">
                      Service 04
                    </span>
                    <h3 className="text-xl font-display font-bold text-white tracking-tight mt-0.5">
                      Website & App Development
                    </h3>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Custom web apps, responsive marketing sites, e-commerce stores, and high-performance web experiences designed for conversion and lightning-fast speeds.
                  </p>

                  <div className="space-y-2 pt-2 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Modern React, Vite & Tailwind Tech Stack</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Mobile-First & High Conversion UX Design</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Sub-second Speed & SEO Architecture</span>
                    </div>
                  </div>
                </div>

                {/* SERVICE CTAs */}
                <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-2">
                  <button 
                    onClick={handleOpenCalendly} 
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Book a Call</span>
                  </button>
                  <button 
                    onClick={() => handleOpenEmailModal('Website Development Service')} 
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                  >
                    <Mail className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Send Email</span>
                  </button>
                </div>
              </div>
            )}

            {/* SERVICE 5: PRODUCT & MARKET ACTIVATION */}
            {(activeTab === 'all' || activeTab === 'activation') && (
              <div className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all group">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Rocket className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">
                      Service 05
                    </span>
                    <h3 className="text-xl font-display font-bold text-white tracking-tight mt-0.5">
                      Product & Market Activation
                    </h3>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Go-To-Market (GTM) launch strategies, product positioning, user acquisition campaigns, and market entry activation sprints to turn new offerings into market successes.
                  </p>

                  <div className="space-y-2 pt-2 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Go-To-Market (GTM) Launch Sprints</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Brand Value Proposition & Positioning</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Customer Onboarding & Conversion Funnels</span>
                    </div>
                  </div>
                </div>

                {/* SERVICE CTAs */}
                <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-2">
                  <button 
                    onClick={handleOpenCalendly} 
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Book a Call</span>
                  </button>
                  <button 
                    onClick={() => handleOpenEmailModal('Product & Market Activation Service')} 
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                  >
                    <Mail className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Send Email</span>
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      </section>

      {/* INTERACTIVE PROPOSAL & SCOPE CALCULATOR */}
      <section id="calculator" className="py-20 px-4 sm:px-8 relative">
        <div className="max-w-5xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-8 relative z-10">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono font-bold uppercase tracking-widest">
                <Calculator className="w-3.5 h-3.5" /> Scope Estimator
              </div>
              <h2 className="text-2xl sm:text-4xl font-display font-bold text-white tracking-tight">
                Estimate Your Growth Package
              </h2>
              <p className="text-slate-400 text-xs">
                Select the Flokker services you need to estimate your monthly scope and book a discussion.
              </p>
            </div>

            {/* SERVICE SELECTION BOXES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { id: 'ocula', label: 'OCULA BI Intelligence', badge: 'Intelligence', icon: OculaLogo },
                { id: 'seo', label: 'SEO & SEM Growth', badge: 'Search Engine', icon: Search },
                { id: 'social', label: 'Social Media Management', badge: 'Social Media', icon: Share2 },
                { id: 'web', label: 'Website & App Dev', badge: 'Web Development', icon: Code },
                { id: 'activation', label: 'Product & Market Activation', badge: 'Market Activation', icon: Rocket },
              ].map((srv) => {
                const isSelected = selectedServices.includes(srv.id);
                const IconComponent = srv.icon;
                return (
                  <button
                    key={srv.id}
                    type="button"
                    onClick={() => handleServiceToggle(srv.id)}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 relative overflow-hidden ${
                      isSelected 
                        ? 'border-indigo-500 bg-indigo-950/40 ring-1 ring-indigo-500/50' 
                        : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1 pr-6">
                      <p className="text-xs font-bold text-white">{srv.label}</p>
                      <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">{srv.badge}</span>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center absolute top-4 right-4 ${isSelected ? 'bg-indigo-600 border-indigo-400 text-white' : 'border-slate-700'}`}>
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* COMPANY SCALE SELECTOR */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  Business Scale
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'startup', label: 'Startup / Early' },
                    { id: 'growth', label: 'Growth Phase' },
                    { id: 'enterprise', label: 'Enterprise' },
                  ].map((tier) => (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setCompanyTier(tier.id)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        companyTier === tier.id 
                          ? 'border-indigo-500 bg-indigo-600/20 text-white' 
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      {tier.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  Engagement Model
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'monthly', label: 'Monthly Retainer' },
                    { id: 'quarterly', label: '90-Day Sprint' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTimeline(t.id)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        timeline === t.id 
                          ? 'border-indigo-500 bg-indigo-600/20 text-white' 
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ESTIMATED OUTPUT & CTA */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Estimated Monthly Scope</p>
                <p className="text-3xl font-display font-bold text-white mt-0.5">
                  ${estimatedPriceRange().toLocaleString()} <span className="text-xs text-slate-400 font-sans font-normal">/ month starting</span>
                </p>
                <p className="text-xs text-indigo-400 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Tailored execution plan & dedicated account strategist
                </p>
              </div>

              <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={handleOpenCalendly}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xl flex items-center justify-center gap-2"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Book Strategy Call</span>
                </button>
                <button
                  onClick={() => handleOpenEmailModal(`Custom Package ($${estimatedPriceRange()}/mo)`)}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4 text-indigo-400" />
                  <span>Email Scope</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* WHY FLOKKER? */}
      <section id="why-flokker" className="py-20 px-4 sm:px-8 bg-slate-900/40 border-t border-slate-800">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest">
              The Flokker Standard
            </span>
            <h2 className="text-3xl sm:text-5xl font-display font-bold text-white tracking-tight">
              Why Partner With Flokker?
            </h2>
            <p className="text-slate-400 text-sm font-light">
              We bring strategic depth, modern design, and dedicated execution to every client engagement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Data-Informed Precision</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                We combine thorough analytics with competitive intelligence to uncover exact growth levers for your brand.
              </p>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Dedicated Execution Team</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Work directly with senior strategists, developers, and marketers who take complete ownership of your milestones.
              </p>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Turnkey Implementation</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                From launching high-performing websites to managing social platforms and GTM sprints, we handle execution end-to-end.
              </p>
            </div>
          </div>

          {/* BOTTOM CALL TO ACTION BANNER */}
          <div className="bg-gradient-to-r from-indigo-900/60 via-purple-900/60 to-indigo-950/60 border border-indigo-500/30 rounded-3xl p-8 text-center space-y-6">
            <h3 className="text-2xl sm:text-4xl font-display font-bold text-white">
              Ready to grow your digital presence with Flokker?
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto font-light">
              Schedule a strategy call or send us your project brief. We respond to all inquiries within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleOpenCalendly}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Book a Strategy Call</span>
              </button>
              <button
                onClick={() => handleOpenEmailModal('Bottom Banner')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-200 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4 text-indigo-400" />
                <span>Send Us an Email</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12 px-4 sm:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-black text-white text-sm">
              F
            </div>
            <div>
              <p className="font-display font-bold text-white text-sm">FLOKKER</p>
              <p className="text-[10px] font-mono text-slate-400">Digital Growth Agency & Services</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 font-medium text-slate-400">
            <a href="#services" className="hover:text-white transition-colors">Services</a>
            <button onClick={handleOpenCalendly} className="hover:text-amber-300 transition-colors flex items-center gap-1 text-slate-300">
              <Calendar className="w-3 h-3 text-amber-300" /> Book Call
            </button>
            <button onClick={() => handleOpenEmailModal('Footer')} className="hover:text-indigo-400 transition-colors flex items-center gap-1 text-slate-300">
              <Mail className="w-3 h-3 text-indigo-400" /> Send Email
            </button>
            {onViewPricing && <button onClick={onViewPricing} className="hover:text-white transition-colors">Pricing</button>}
            {onViewLegal && <button onClick={onViewLegal} className="hover:text-white transition-colors">Legal & Privacy</button>}
          </div>

          <p className="text-[11px] font-mono text-slate-400">
            © 2026 Flokker. All rights reserved.
          </p>
        </div>
      </footer>

      {/* MODAL FOR SENDING EMAIL */}
      <AnimatePresence>
        {isContactModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative"
            >
              <button
                onClick={() => setIsContactModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold text-white">Contact Flokker</h3>
                    <p className="text-xs text-indigo-400 font-mono">Inquiry regarding: {selectedServiceForModal}</p>
                  </div>
                </div>

                {isEmailSent ? (
                  <div className="py-8 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                      <Check className="w-6 h-6" />
                    </div>
                    <h4 className="text-lg font-bold text-white">Opening Email Client...</h4>
                    <p className="text-xs text-slate-400">
                      Your message to <strong>hello@flokker.com</strong> is being sent. You can also reach us directly at <a href="mailto:hello@flokker.com" className="text-indigo-400 underline">hello@flokker.com</a>.
                    </p>
                    <button
                      onClick={() => setIsContactModalOpen(false)}
                      className="mt-4 px-6 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs uppercase tracking-wider"
                    >
                      Close Window
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSendEmailSubmit} className="space-y-4 pt-2">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
                        Your Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={modalEmail}
                        onChange={(e) => setModalEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-sm text-white placeholder-slate-600 outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
                        Project Details / Message
                      </label>
                      <textarea
                        rows={4}
                        value={modalMessage}
                        onChange={(e) => setModalMessage(e.target.value)}
                        placeholder="Tell us about your project goals or requirements..."
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-sm text-white placeholder-slate-600 outline-none transition-colors"
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="submit"
                        className="flex-1 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg"
                      >
                        <Send className="w-4 h-4" />
                        <span>Send Email Message</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleOpenCalendly}
                        className="py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                      >
                        <PhoneCall className="w-3.5 h-3.5 text-amber-300" />
                        <span>Book Call</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default FlokkerPreLanding;
