import React, { useState, useEffect, useRef } from 'react';
import OculaLogo from './OculaLogo';
import BusinessNameInput from './BusinessNameInput';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  Scan, BarChart3, Globe, ArrowRight, ShieldCheck, Zap, Target, Activity, Users, 
  ChevronDown, Check, MessageSquare, Play, Star, Sparkles, Clock, ArrowUpRight, 
  Lock, Eye, Search, Share2, Sliders, Database, Cpu, Mail, MapPin, TrendingUp, Smile,
  ExternalLink
} from 'lucide-react';
import { INDUSTRIES, COMPANY_SIZES } from '../src/constants/industries';

interface LandingPageProps {
  user: any;
  onStartAudit: (businessName?: string, industry?: string, companySize?: string) => void;
  onLogin: () => void;
  onViewPricing: () => void;
  onGoToDashboard: () => void;
  onViewLegal?: () => void;
  onGiveFeedback?: () => void;
  onGoToFlokker?: () => void;
}

// Subcomponent: Count Up Timer / Stats Animate
const AnimatedCounter: React.FC<{ value: string; duration?: number }> = ({ value, duration = 2 }) => {
  const [count, setCount] = useState('0');
  const numericPart = value.replace(/[^0-9.]/g, '');
  const prefix = value.match(/^[^0-9]*/)?.[0] || '';
  const suffix = value.match(/[0-9.]*$/)?.[0] === value ? '' : value.replace(prefix, '').replace(numericPart, '');

  useEffect(() => {
    let start = 0;
    const end = parseFloat(numericPart);
    if (isNaN(end)) {
      setCount(value);
      return;
    }
    const totalFrames = 60 * duration;
    let frame = 0;

    const counter = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      // Ease out quad
      const currentVal = start + (end - start) * (progress * (2 - progress));
      
      if (frame >= totalFrames) {
        clearInterval(counter);
        setCount(value);
      } else {
        if (value.includes('.')) {
          setCount(`${prefix}${currentVal.toFixed(1)}${suffix}`);
        } else {
          setCount(`${prefix}${Math.floor(currentVal).toLocaleString()}${suffix}`);
        }
      }
    }, 1000 / 60);

    return () => clearInterval(counter);
  }, [value, numericPart, prefix, suffix, duration]);

  return <span>{count}</span>;
};

// Subcomponent: Custom Waveform SVG (glowing audio/sentiment bar wave)
const SentimentWave: React.FC<{ active: boolean }> = ({ active }) => {
  return (
    <div className="flex items-end gap-1.5 h-16 px-4 py-2 bg-[#FAFBFF] border border-[#E7ECF5] rounded-xl">
      {[40, 75, 55, 90, 60, 45, 80, 50, 70, 95, 65, 85, 40, 55, 75].map((height, i) => (
        <motion.div
          key={i}
          className={`w-1 rounded-full ${i % 3 === 0 ? 'bg-[#5B5FFF]' : i % 3 === 1 ? 'bg-[#8B5CF6]' : 'bg-[#22C55E]'}`}
          animate={active ? {
            height: [
              `${height * 0.3}%`,
              `${height * 1.1}%`,
              `${height * 0.6}%`,
              `${height * 0.3}%`
            ]
          } : { height: `${height * 0.4}%` }}
          transition={{
            duration: 1.5 + (i * 0.1),
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ transformOrigin: 'bottom' }}
        />
      ))}
    </div>
  );
};

export const LandingPage: React.FC<LandingPageProps> = ({ 
  user, onStartAudit, onLogin, onViewPricing, onGoToDashboard, onViewLegal, onGiveFeedback, onGoToFlokker 
}) => {
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [activeNetworkNode, setActiveNetworkNode] = useState<string>('core');
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [activeStoryIdx, setActiveStoryIdx] = useState(0);
  const [activeTestimonialIdx, setActiveTestimonialIdx] = useState(0);

  // Monitor scroll for sticky header blur
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleStartScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (businessName.trim()) {
      onStartAudit(businessName, industry, companySize);
    } else {
      onStartAudit();
    }
  };

  const handleOpenCalendly = () => {
    window.open('https://calendly.com/teamflokker/new-meeting', '_blank');
  };

  // Timeline list for Section 5
  const timelineSteps = [
    { title: 'Connect', label: 'Auth Integration', desc: 'Securely authenticate your existing digital directories, Google Business, and social APIs with zero configuration.' },
    { title: 'Scan', label: 'Deep Synaptic Sweep', desc: 'Ocula launches neural crawling across search engines, review hubs, map layers, and 150+ global directory points.' },
    { title: 'Analyze', label: 'Cognitive Diagnosis', desc: 'Our multi-agent visibility model maps your discoverability rank, competitor overlap vectors, and citation health.' },
    { title: 'Recommend', label: 'Continuous Blueprint', desc: 'Generates an actionable daily priority queue with AI blueprints, copy recommendations, and technical tasks.' },
    { title: 'Improve', label: 'Single-Click Sync', desc: 'Instantly push updates, respond to reviews, resolve directory disputes, and update business coordinates.' },
    { title: 'Monitor', label: '24/7 Sentinel Guard', desc: 'Ongoing autonomous surveillance signals shifts in competitor rank, review anomalies, and search index changes.' }
  ];

  // Why Ocula Cards
  const whyOculaFeatures = [
    {
      id: 'vis',
      title: 'AI Visibility Intelligence',
      desc: 'Deep analytical indexation of every digital node representing your brand. Detects visibility gaps, catalog discrepancies, and search engine crawl errors automatically.',
      icon: <Eye className="w-6 h-6 text-[#5B5FFF]" />,
      stat: '98.4%',
      statLabel: 'Listing Coherence'
    },
    {
      id: 'comp',
      title: 'Competitor Monitoring',
      desc: 'Real-time competitive overlap map across target channels. See exactly where competitors outrank you, capture their keywords, and displace their map prominence.',
      icon: <Target className="w-6 h-6 text-[#8B5CF6]" />,
      stat: '#1 Rank',
      statLabel: 'Target Displaced'
    },
    {
      id: 'rev',
      title: 'Review Intelligence',
      desc: 'Consolidated review dashboard with real-time semantic analysis. Auto-draft contextual high-intent replies using secure, brand-aligned LLM logic.',
      icon: <MessageSquare className="w-6 h-6 text-[#22C55E]" />,
      stat: '4.9★',
      statLabel: 'Average Rating'
    },
    {
      id: 'search',
      title: 'Search Intelligence',
      desc: 'Optimized for LLM retrieval. Tracks how artificial intelligence search engines like ChatGPT, Gemini, and Perplexity parse, credit, and cite your brand.',
      icon: <Search className="w-6 h-6 text-[#5B5FFF]" />,
      stat: '8.4x',
      statLabel: 'AI Citation Share'
    },
    {
      id: 'citation',
      title: 'Citation Tracking',
      desc: 'Automates directory alignment. Continuously audits and enforces Name, Address, and Phone (NAP) parity across 150+ high-authority global channels.',
      icon: <Share2 className="w-6 h-6 text-[#8B5CF6]" />,
      stat: '0 Error',
      statLabel: 'Citation Drift'
    },
    {
      id: 'growth',
      title: 'Growth Recommendations',
      desc: 'Context-rich, prioritized playbook updated daily. Turn unstructured search trends and map coordinate gaps into actionable step-by-step instructions.',
      icon: <TrendingUp className="w-6 h-6 text-[#22C55E]" />,
      stat: '+42%',
      statLabel: 'Organic Conversion'
    }
  ];

  // Interactive network nodes state
  const networkNodes = {
    core: {
      title: 'Ocula AI Core',
      metric: 'Active Sync',
      desc: 'The central engine coordinating real-time data ingest, vector embedding, and multi-agent visibility evaluations across the absolute digital grid.',
      color: 'bg-[#5B5FFF]'
    },
    google: {
      title: 'Google Search Engine',
      metric: '98.9% Health',
      desc: 'Audits SERP placements, rich snippet visibility, schema structured data, and keyword index health directly against algorithmic fluctuations.',
      color: 'bg-blue-500'
    },
    maps: {
      title: 'Neural Maps Layer',
      metric: '12 Locations Synced',
      desc: 'Maintains geographic pinning precision, real-time local search coordinate resonance, and multi-sector visibility across Google & Apple Maps.',
      color: 'bg-emerald-500'
    },
    reviews: {
      title: 'Consolidated Reviews',
      metric: '4.8★ Sentiment Score',
      desc: 'Continuous ingestion of feedback streams. Powered by semantic vector clustering to classify user intent, star rating trends, and alert on reviews.',
      color: 'bg-[#8B5CF6]'
    },
    ai_search: {
      title: 'AI Search Engines (LLMs)',
      metric: 'High Cite Rate',
      desc: 'Monitors brand citation rates in conversational queries on Google Overviews, Perplexity, and ChatGPT. Optimize source materials for AI scrapers.',
      color: 'bg-indigo-600'
    },
    social: {
      title: 'Social Signals Tracker',
      metric: 'Active Feed Sweep',
      desc: 'Aggregates brand prominence and user-generated mention velocities across Meta, LinkedIn, Instagram, and key vertical forums.',
      color: 'bg-purple-500'
    },
    website: {
      title: 'Core Technical Audit',
      metric: '99/100 Core Web Vitals',
      desc: 'Evaluates crawl depth, response latency, structural indexability, and visual load times to secure flawless search landing experiences.',
      color: 'bg-[#22C55E]'
    },
    competitors: {
      title: 'Competitor Overlap Map',
      metric: '5 Rivals Tracked',
      desc: 'Analyzes competitive ranking gaps, duplicate directory claims, organic keyword share-of-voice, and geographic conquest pathways.',
      color: 'bg-amber-500'
    },
    directories: {
      title: 'Global Directories Grid',
      metric: '150+ Ingest Points',
      desc: 'Enforces flawless Name, Address, and Phone (NAP) uniformity across authoritative databases, business registries, and local listing nodes.',
      color: 'bg-pink-500'
    }
  };

  // Customer stories (Before/After)
  const customerStories = [
    {
      company: 'Apex Logistics',
      logoText: 'APEX',
      industry: 'Enterprise Supply Chain',
      growth: '+184%',
      metricLabel: 'Local Map Actions',
      summary: 'Apex possessed 42 hub locations with heavily fragmented directory records and drifting map pins. Ocula synchronized all coordinates and citation fields.',
      before: { score: 62, reviews: '3.6★', citations: '41%' },
      after: { score: 96, reviews: '4.7★', citations: '99%' }
    },
    {
      company: 'Novis Health',
      logoText: 'NOVIS',
      industry: 'Multi-Location Medicine',
      growth: '+220%',
      metricLabel: 'AI Search Citations',
      summary: 'Novis required visibility for 180 specialist practitioners. Ocula optimized practitioner citation pages for conversational search engines and local maps.',
      before: { score: 48, reviews: '4.1★', citations: '32%' },
      after: { score: 94, reviews: '4.9★', citations: '97%' }
    },
    {
      company: 'Horizon Realty',
      logoText: 'HORIZON',
      industry: 'Real Estate Networks',
      growth: '3.5x',
      metricLabel: 'Organic Search Lead Volume',
      summary: 'Horizon brokers were losing local search ground to massive aggregators. Ocula deployed geo-targeted keyword conquest maps for every agent node.',
      before: { score: 55, reviews: '4.2★', citations: '53%' },
      after: { score: 91, reviews: '4.8★', citations: '95%' }
    }
  ];

  // Testimonials
  const testimonials = [
    {
      quote: "Ocula BI fundamentally replaced three separate enterprise search tools. We now monitor 80 physical retail branches with a precision that was previously impossible. It is the absolute gold standard.",
      author: "Marcus Vance",
      role: "VP of Growth, RetailGroup International",
      avatarBg: "from-[#5B5FFF] to-[#8B5CF6]",
      initials: "MV",
      logo: "RETAIL_INTL"
    },
    {
      quote: "With the rise of Gemini and Perplexity search, traditional SEO tools failed us. Ocula was the only system that mapped our citation velocity across conversational engines. Our conversion is up 42%.",
      author: "Leah K. Somba",
      role: "Digital Director, Africa-First Fintech",
      avatarBg: "from-[#8B5CF6] to-[#22C55E]",
      initials: "LS",
      logo: "AFF_FINTECH"
    },
    {
      quote: "Managing listings, duplicate maps, and continuous competitor sweeps was a full-time job. Ocula's automated growth playbook has freed our strategy team while adding double-digit rank increases.",
      author: "Julien Mercer",
      role: "Founder, Zenith Hospitality",
      avatarBg: "from-[#22C55E] to-[#5B5FFF]",
      initials: "JM",
      logo: "ZEN_HOSP"
    }
  ];

  // FAQs
  const faqs = [
    { q: "What does Autonomous Visibility Intelligence actually mean?", a: "Unlike static auditing tools, Ocula continuously crawls and queries search engines, reviews, maps, and local directory networks. It runs background AI agents to reconcile data, calculate competitor displacement, draft replies, and instantly deploy corrections without human manual work." },
    { q: "How does Ocula track visibility across AI search engines like Perplexity?", a: "Traditional search monitors track static text queries. Ocula integrates vector embeddings to monitor brand citations, semantic context, and recommendation ratios within LLM response spaces including OpenAI SearchGPT, Google Gemini Overviews, Anthropic Claude citations, and Perplexity." },
    { q: "Can we manage multi-location structures with hundreds of nodes?", a: "Yes. Ocula BI is engineered for high-concurrency enterprise structures. You can map, filter, and audit regional nodes, assign permissions, track competitor displacement globally, and set localized rules for local branch managers." },
    { q: "How does the single-click synchronization process function?", a: "Once Ocula identifies listing drift, NAP errors, or missing directory syncs, it uses direct API channels to broadcast authoritative metadata to all high-authority indexes, coordinates platforms, and social platforms instantly, overriding third-party drift." },
    { q: "What is the continuous Africa Digital Index citation structure?", a: "Through our parent framework Flokker, Ocula maintains deep local listing arrays and directory indexing tailored for emerging and complex market structures across African digital ecosystems, ensuring high local authority where global tools lack depth." }
  ];

  // Rotating orbit rings helper
  const orbitSizes = [140, 220, 300, 380];

  return (
    <div className="bg-[#FAFBFF] text-[#09111F] selection:bg-[#5B5FFF]/20 overflow-hidden font-sans min-h-screen relative antialiased">
      
      {/* Background Decorative Mesh Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-300px] left-[15%] w-[800px] h-[800px] bg-gradient-to-tr from-[#5B5FFF]/10 via-[#8B5CF6]/5 to-transparent rounded-full blur-[140px]" />
        <div className="absolute top-[800px] right-[-200px] w-[600px] h-[600px] bg-gradient-to-br from-[#22C55E]/5 via-[#5B5FFF]/5 to-transparent rounded-full blur-[120px]" />
        <div className="absolute bottom-[200px] left-[-300px] w-[700px] h-[700px] bg-gradient-to-tr from-[#8B5CF6]/5 via-[#5B5FFF]/10 to-transparent rounded-full blur-[150px]" />
        
        {/* Crisp grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{ 
          backgroundImage: 'radial-gradient(#09111F 1px, transparent 1px)', 
          backgroundSize: '24px 24px' 
        }} />
      </div>

      {/* STICKY HEADER NAVIGATION */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/70 backdrop-blur-xl border-b border-[#E7ECF5] py-3 shadow-[0_2px_20px_-10px_rgba(9,17,31,0.05)]' : 'bg-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-12 flex items-center justify-between">
          
          {/* Left Brand */}
          <div className="flex items-center gap-2.5 group cursor-pointer" onClick={onGoToDashboard}>
            <OculaLogo className="w-7 h-7 text-[#5B5FFF]" />
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black tracking-tight text-[#09111F]">ocula</span>
              <span className="text-[10px] font-extrabold bg-[#5B5FFF]/10 text-[#5B5FFF] px-1.5 py-0.5 rounded-md border border-[#5B5FFF]/20">BI</span>
            </div>
            {onGoToFlokker && (
              <button 
                onClick={(e) => { e.stopPropagation(); onGoToFlokker(); }}
                className="hidden md:inline-flex items-center gap-1 ml-3 text-[9px] font-mono font-black text-[#64748B] hover:text-[#5B5FFF] transition-colors bg-white border border-[#E7ECF5] px-2 py-0.5 rounded-full"
              >
                <span>BY FLOKKER</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </button>
            )}
          </div>

          {/* Center Links */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-bold text-[#64748B] uppercase tracking-wider">
            {['Platform', 'Solutions', 'Pricing', 'Resources', 'Developers', 'Company'].map((link) => (
              <a 
                key={link} 
                href={link === 'Pricing' ? '#pricing' : '#'} 
                onClick={(e) => {
                  if (link === 'Pricing') {
                    e.preventDefault();
                    onViewPricing();
                  }
                }}
                className="hover:text-[#09111F] transition-colors relative group py-2"
              >
                {link}
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#5B5FFF] transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-4">
            {user ? (
              <button 
                onClick={onGoToDashboard} 
                className="px-5 py-2.5 text-xs font-extrabold uppercase tracking-widest text-[#09111F] hover:text-[#5B5FFF] transition-colors flex items-center gap-1"
              >
                <span>Dashboard</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button 
                  onClick={onLogin} 
                  className="hidden sm:inline-block text-xs font-extrabold uppercase tracking-widest text-[#64748B] hover:text-[#09111F] transition-colors px-4 py-2"
                >
                  Log In
                </button>
                <button 
                  onClick={() => onStartAudit()} 
                  className="px-5 py-3 rounded-full bg-[#5B5FFF] hover:bg-[#4b4edd] text-white text-[11px] font-black uppercase tracking-wider transition-all shadow-[0_4px_14px_rgba(91,95,255,0.25)] hover:shadow-[0_6px_20px_rgba(91,95,255,0.35)] active:scale-95"
                >
                  Start Free Scan
                </button>
              </>
            )}
          </div>

        </div>
      </header>

      {/* SECTION 1: HERO */}
      <section className="relative min-h-screen pt-32 pb-24 px-6 sm:px-12 flex items-center">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Column */}
          <div className="lg:col-span-6 space-y-8 text-left relative z-10">
            
            {/* Pill */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#E7ECF5] shadow-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22C55E]"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#64748B]">
                Autonomous Visibility Intelligence
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-6xl font-black text-[#09111F] tracking-tight leading-[1.08] max-w-xl"
            >
              AI That Understands <br className="hidden sm:block" />
              How Customers <br />
              <motion.span 
                animate={{ backgroundPosition: ["0% center", "200% center"] }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                className="bg-gradient-to-r from-[#5B5FFF] via-[#8B5CF6] to-[#5B5FFF] bg-[length:200%_auto] bg-clip-text text-transparent"
              >
                Actually Find You.
              </motion.span>
            </motion.h1>

            {/* Supporting Copy */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-[#64748B] text-base sm:text-lg font-medium leading-relaxed max-w-lg"
            >
              Ocula continuously monitors Google Business, AI search engines, maps, websites, reviews, competitors, directories, and social platforms to uncover visibility opportunities before your competitors do.
            </motion.p>

            {/* Form & Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-4 pt-2"
            >
              <form onSubmit={handleStartScanSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg">
                <div className="flex-1 min-w-[240px]">
                  <BusinessNameInput 
                    value={businessName}
                    onChange={setBusinessName}
                    placeholder="Enter Business Name..."
                    size="lg"
                    required={false}
                    inputClassName="bg-white border-[#E7ECF5] text-[#09111F] font-bold shadow-sm"
                  />
                </div>
                <button 
                  type="submit"
                  className="h-14 px-8 rounded-xl bg-[#5B5FFF] hover:bg-[#4b4edd] text-white text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-[0_4px_14px_rgba(91,95,255,0.25)] hover:translate-y-[-1px] shrink-0"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Start Free Scan</span>
                </button>
              </form>

              <div className="flex items-center gap-6 pt-2">
                <button 
                  onClick={handleOpenCalendly}
                  className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#09111F] hover:text-[#5B5FFF] transition-all"
                >
                  <span>Book Demo Session</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>

            {/* Trust Row */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="pt-8 border-t border-[#E7ECF5] max-w-lg"
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-[#64748B] mb-4 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="ml-1">Trusted by modern businesses</span>
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-3 items-center opacity-60">
                {['Google', 'Meta', 'Apple Maps', 'Microsoft', 'OpenStreetMap'].map((name) => (
                  <span key={name} className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#09111F]">
                    {name}
                  </span>
                ))}
              </div>
            </motion.div>

          </div>

          {/* Right Column: AI Command Center (Glass Dashboard with Africa Centered Globe) */}
          <div className="lg:col-span-6 relative flex justify-center">
            
            {/* Floating Glow Sphere Behind Dashboard */}
            <div className="absolute w-[400px] h-[400px] bg-gradient-to-tr from-[#5B5FFF]/15 to-[#8B5CF6]/15 rounded-full blur-[80px] pointer-events-none" />

            {/* Holographic Radar Base Frame */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative w-full max-w-lg h-[500px] bg-white/40 backdrop-blur-md border border-white/80 rounded-3xl p-6 shadow-[0_25px_60px_-15px_rgba(9,17,31,0.08)] flex flex-col justify-between overflow-hidden group"
            >
              {/* Glass Reflection Highlight */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/30 pointer-events-none" />

              {/* Header inside the Glass Frame */}
              <div className="flex justify-between items-center z-10 border-b border-[#E7ECF5]/40 pb-4">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#5B5FFF] animate-spin" />
                  <span className="text-[10px] font-mono font-bold text-[#64748B] uppercase tracking-wider">
                    Core Satellite Grid // Node_01
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#22C55E] rounded-full animate-ping" />
                  <span className="text-[9px] font-mono font-bold text-[#22C55E] uppercase tracking-widest">
                    LIVE_TRANSMITTING
                  </span>
                </div>
              </div>

              {/* 3D Holographic Globe Centered on Africa */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                
                {/* Orbital Sweep Arc */}
                <div className="absolute w-[280px] h-[280px] border border-[#5B5FFF]/20 rounded-full animate-[spin_10s_linear_infinite]" />
                <div className="absolute w-[340px] h-[340px] border border-dashed border-[#8B5CF6]/15 rounded-full animate-[spin_20s_linear_infinite_reverse]" />

                {/* Radar Sweep Arc inside the inner circle */}
                <div className="absolute w-[220px] h-[220px] rounded-full overflow-hidden bg-gradient-to-t from-[#5B5FFF]/5 to-transparent flex items-center justify-center border border-[#5B5FFF]/10">
                  {/* Glowing core line sweep */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#5B5FFF]/10 via-[#8B5CF6]/5 to-transparent origin-center animate-[spin_6s_linear_infinite]" />
                </div>

                {/* SVG African Continent Globe Design Centered */}
                <svg className="w-48 h-48 text-[#5B5FFF]/20 drop-shadow-[0_0_15px_rgba(91,95,255,0.2)] z-10" viewBox="0 0 100 100" fill="currentColor">
                  {/* Africa Silhouette Centered */}
                  <path d="M 44.5 28.5 C 47.5 28.0, 49.5 29.5, 51.5 30.5 C 53.5 31.5, 55.5 30.5, 57.5 32.5 C 58.5 33.5, 59.5 34.5, 60.5 34.5 C 61.5 35.5, 62.5 37.0, 63.5 38.5 C 64.5 40.0, 64.0 41.5, 63.5 43.0 C 63.0 44.5, 62.0 45.5, 62.0 47.0 C 62.0 48.5, 61.5 50.0, 60.5 51.5 C 59.5 53.0, 58.0 54.5, 56.5 56.0 C 55.0 57.5, 54.5 59.5, 53.5 61.5 C 52.5 63.5, 52.5 65.5, 51.5 67.5 C 51.0 68.5, 50.5 69.5, 50.0 70.5 C 49.5 71.5, 48.5 72.5, 48.0 73.5 C 47.5 74.5, 46.5 75.0, 46.0 74.0 C 45.5 73.0, 45.0 71.5, 45.0 70.0 C 45.0 68.5, 44.0 67.0, 43.5 65.5 C 43.0 64.0, 42.0 62.5, 41.5 61.0 C 41.0 59.5, 41.5 58.0, 41.5 56.5 C 41.5 55.0, 40.0 54.5, 39.0 54.0 C 38.0 53.5, 37.0 53.5, 36.5 52.5 C 36.0 51.5, 36.5 50.5, 36.0 49.5 C 35.5 48.5, 34.0 48.5, 33.0 48.0 C 32.0 47.5, 31.0 46.5, 31.0 45.5 C 31.0 44.5, 30.0 44.0, 29.5 43.0 C 29.0 42.0, 29.5 41.0, 30.0 40.0 C 30.5 39.0, 31.5 38.0, 32.5 37.5 C 33.5 37.0, 34.5 36.0, 35.5 35.5 C 36.5 35.0, 37.5 34.0, 38.5 33.5 C 39.5 33.0, 40.5 31.5, 41.5 30.5 C 42.5 29.5, 43.5 29.0, 44.5 28.5 Z" />
                  
                  {/* Pulsing Coordinates in Key Cities of Africa */}
                  {/* Lagos */}
                  <circle cx="36" cy="48" r="1.5" fill="#5B5FFF" className="animate-ping" />
                  <circle cx="36" cy="48" r="0.75" fill="#5B5FFF" />
                  
                  {/* Johannesburg */}
                  <circle cx="49" cy="69" r="1.5" fill="#8B5CF6" className="animate-ping" />
                  <circle cx="49" cy="69" r="0.75" fill="#8B5CF6" />

                  {/* Nairobi */}
                  <circle cx="53" cy="51" r="1.5" fill="#22C55E" className="animate-ping" />
                  <circle cx="53" cy="51" r="0.75" fill="#22C55E" />

                  {/* Cairo */}
                  <circle cx="54" cy="32" r="1.5" fill="#5B5FFF" className="animate-ping" />
                  <circle cx="54" cy="32" r="0.75" fill="#5B5FFF" />

                  {/* Casablanca */}
                  <circle cx="30" cy="32" r="1.5" fill="#8B5CF6" className="animate-ping" />
                  <circle cx="30" cy="32" r="0.75" fill="#8B5CF6" />
                </svg>
              </div>

              {/* Center Holographic HUD Score: 94 */}
              <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10 flex flex-col items-center">
                <p className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-[#64748B]">
                  Visibility Score
                </p>
                <div className="flex items-baseline justify-center">
                  <span className="text-5xl font-black text-[#09111F] tracking-tighter filter drop-shadow-sm select-none">
                    <AnimatedCounter value="94" />
                  </span>
                  <span className="text-[#64748B] text-sm font-bold">/100</span>
                </div>
                <div className="mt-1 px-2.5 py-0.5 rounded-full bg-[#22C55E]/10 text-[#22C55E] text-[8px] font-mono font-black uppercase tracking-wider border border-[#22C55E]/20">
                  OPTIMAL
                </div>
              </div>

              {/* Floating Insight Cards (Absolutely positioned, floating gently) */}
              
              {/* Google Business (98%) */}
              <motion.div 
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[18%] left-[6%] z-20 bg-white/90 backdrop-blur-md border border-[#E7ECF5] rounded-xl p-2.5 shadow-md flex items-center gap-2 max-w-[130px]"
              >
                <div className="w-5 h-5 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-mono font-black text-blue-600">G</span>
                </div>
                <div className="text-left">
                  <p className="text-[7px] font-mono text-[#64748B] uppercase tracking-wider">GBP Health</p>
                  <p className="text-xs font-black text-[#09111F]">98%</p>
                </div>
              </motion.div>

              {/* SEO Visibility (91%) */}
              <motion.div 
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[22%] right-[6%] z-20 bg-white/90 backdrop-blur-md border border-[#E7ECF5] rounded-xl p-2.5 shadow-md flex items-center gap-2 max-w-[130px]"
              >
                <div className="w-5 h-5 bg-[#5B5FFF]/10 rounded-lg flex items-center justify-center shrink-0 text-[#5B5FFF]">
                  <Activity className="w-3 h-3" />
                </div>
                <div className="text-left">
                  <p className="text-[7px] font-mono text-[#64748B] uppercase tracking-wider">SEO Rate</p>
                  <p className="text-xs font-black text-[#09111F]">91%</p>
                </div>
              </motion.div>

              {/* Reviews (4.8★) */}
              <motion.div 
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-[28%] left-[4%] z-20 bg-white/90 backdrop-blur-md border border-[#E7ECF5] rounded-xl p-2.5 shadow-md flex items-center gap-2 max-w-[125px]"
              >
                <div className="w-5 h-5 bg-amber-100 rounded-lg flex items-center justify-center shrink-0 text-amber-500">
                  <Star className="w-3 h-3 fill-current" />
                </div>
                <div className="text-left">
                  <p className="text-[7px] font-mono text-[#64748B] uppercase tracking-wider">Reviews</p>
                  <p className="text-xs font-black text-[#09111F]">4.8★</p>
                </div>
              </motion.div>

              {/* Competitor Rank (#2) */}
              <motion.div 
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-[32%] right-[4%] z-20 bg-white/90 backdrop-blur-md border border-[#E7ECF5] rounded-xl p-2.5 shadow-md flex items-center gap-2 max-w-[125px]"
              >
                <div className="w-5 h-5 bg-red-100 rounded-lg flex items-center justify-center shrink-0 text-red-500">
                  <Target className="w-3 h-3" />
                </div>
                <div className="text-left">
                  <p className="text-[7px] font-mono text-[#64748B] uppercase tracking-wider">Competitors</p>
                  <p className="text-xs font-black text-[#09111F]">#2 Avg</p>
                </div>
              </motion.div>

              {/* Search Intent (Growing) */}
              <motion.div 
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-[10%] left-[10%] z-20 bg-white/90 backdrop-blur-md border border-[#E7ECF5] rounded-xl p-2.5 shadow-md flex items-center gap-2 max-w-[130px]"
              >
                <div className="w-5 h-5 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0 text-emerald-500">
                  <TrendingUp className="w-3 h-3" />
                </div>
                <div className="text-left">
                  <p className="text-[7px] font-mono text-[#64748B] uppercase tracking-wider">Intent Stream</p>
                  <p className="text-xs font-black text-[#09111F]">Growing</p>
                </div>
              </motion.div>

              {/* AI Visibility (94%) */}
              <motion.div 
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 4.7, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-[12%] right-[10%] z-20 bg-white/90 backdrop-blur-md border border-[#E7ECF5] rounded-xl p-2.5 shadow-md flex items-center gap-2 max-w-[130px]"
              >
                <div className="w-5 h-5 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0 text-indigo-500">
                  <Cpu className="w-3 h-3" />
                </div>
                <div className="text-left">
                  <p className="text-[7px] font-mono text-[#64748B] uppercase tracking-wider">AI Engines</p>
                  <p className="text-xs font-black text-[#09111F]">94%</p>
                </div>
              </motion.div>

              {/* Footer Inside the Glass Frame */}
              <div className="flex justify-between items-center z-10 border-t border-[#E7ECF5]/40 pt-4 text-[9px] font-mono text-[#64748B]">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#5B5FFF]" />
                  <span>Cycle latency: 45ms</span>
                </div>
                <div>SECURE_CONNECT // ON</div>
              </div>

            </motion.div>

          </div>

        </div>
      </section>

      {/* SECTION 2: AI VISIBILITY NETWORK */}
      <section className="py-24 px-6 sm:px-12 bg-white relative border-y border-[#E7ECF5]">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-20">
            <h2 className="text-3xl sm:text-4xl font-black text-[#09111F] tracking-tight">
              The AI Visibility Network
            </h2>
            <p className="text-base text-[#64748B] font-medium">
              Hover over individual digital touchpoints to explore how Ocula continuous scanning synchronizes your local presence autonomously.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Interactive Graph Box (Lefthand/Center block) */}
            <div className="lg:col-span-7 flex justify-center items-center h-[460px] bg-[#FAFBFF] border border-[#E7ECF5] rounded-3xl relative overflow-hidden p-6 shadow-inner">
              
              {/* Radial Sweep Waves */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute w-[180px] h-[180px] border border-[#5B5FFF]/10 rounded-full animate-ping" style={{ animationDuration: '4s' }} />
                <div className="absolute w-[320px] h-[320px] border border-[#8B5CF6]/5 rounded-full animate-ping" style={{ animationDuration: '6s' }} />
              </div>

              {/* Connecting paths (Rendered as static SVG lines for performance and crisp visual layout) */}
              <svg className="absolute inset-0 w-full h-full text-[#E7ECF5]/80 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                {/* Lines radiating from center 50% 50% */}
                {/* Google Node (40%, 15%) */}
                <line x1="50%" y1="50%" x2="50%" y2="15%" stroke={activeNetworkNode === 'google' ? '#5B5FFF' : 'currentColor'} strokeWidth={activeNetworkNode === 'google' ? '2' : '1'} className="transition-all" />
                {/* Maps Node (85%, 25%) */}
                <line x1="50%" y1="50%" x2="85%" y2="25%" stroke={activeNetworkNode === 'maps' ? '#22C55E' : 'currentColor'} strokeWidth={activeNetworkNode === 'maps' ? '2' : '1'} className="transition-all" />
                {/* Reviews Node (85%, 75%) */}
                <line x1="50%" y1="50%" x2="85%" y2="75%" stroke={activeNetworkNode === 'reviews' ? '#8B5CF6' : 'currentColor'} strokeWidth={activeNetworkNode === 'reviews' ? '2' : '1'} className="transition-all" />
                {/* AI Search Node (50%, 85%) */}
                <line x1="50%" y1="50%" x2="50%" y2="85%" stroke={activeNetworkNode === 'ai_search' ? '#5B5FFF' : 'currentColor'} strokeWidth={activeNetworkNode === 'ai_search' ? '2' : '1'} className="transition-all" />
                {/* Social Node (15%, 75%) */}
                <line x1="50%" y1="50%" x2="15%" y2="75%" stroke={activeNetworkNode === 'social' ? '#8B5CF6' : 'currentColor'} strokeWidth={activeNetworkNode === 'social' ? '2' : '1'} className="transition-all" />
                {/* Website Node (15%, 25%) */}
                <line x1="50%" y1="50%" x2="15%" y2="25%" stroke={activeNetworkNode === 'website' ? '#22C55E' : 'currentColor'} strokeWidth={activeNetworkNode === 'website' ? '2' : '1'} className="transition-all" />
                {/* Competitors Node (80%, 50%) */}
                <line x1="50%" y1="50%" x2="80%" y2="50%" stroke={activeNetworkNode === 'competitors' ? '#F59E0B' : 'currentColor'} strokeWidth={activeNetworkNode === 'competitors' ? '2' : '1'} className="transition-all" />
                {/* Directories Node (20%, 50%) */}
                <line x1="50%" y1="50%" x2="20%" y2="50%" stroke={activeNetworkNode === 'directories' ? '#EC4899' : 'currentColor'} strokeWidth={activeNetworkNode === 'directories' ? '2' : '1'} className="transition-all" />
              </svg>

              {/* CORE HUB - Center */}
              <div 
                className="absolute z-30 cursor-pointer" 
                onClick={() => setActiveNetworkNode('core')}
                onMouseEnter={() => setActiveNetworkNode('core')}
              >
                <div className={`w-16 h-16 rounded-full bg-white border-2 flex items-center justify-center transition-all shadow-lg ${
                  activeNetworkNode === 'core' ? 'border-[#5B5FFF] scale-110 shadow-[#5B5FFF]/10' : 'border-[#E7ECF5]'
                }`}>
                  <OculaLogo className="w-8 h-8 text-[#5B5FFF]" />
                </div>
                <div className="absolute top-[108%] left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#09111F] text-white text-[8px] font-mono font-black uppercase tracking-widest px-2 py-0.5 rounded shadow">
                  Ocula Core
                </div>
              </div>

              {/* Surrounding Nodes */}

              {/* Node 1: Google (Top Center) */}
              <div 
                className="absolute top-[8%] left-[50%] -translate-x-1/2 z-20 cursor-pointer text-center group"
                onMouseEnter={() => setActiveNetworkNode('google')}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all bg-white border ${
                  activeNetworkNode === 'google' ? 'border-[#5B5FFF] scale-110 shadow-md' : 'border-[#E7ECF5]'
                }`}>
                  <span className="text-[#09111F] font-black text-sm font-mono">G</span>
                </div>
                <p className="text-[9px] font-black uppercase tracking-wider text-[#64748B] mt-1 group-hover:text-[#5B5FFF]">Google</p>
              </div>

              {/* Node 2: Maps (Top Right) */}
              <div 
                className="absolute top-[20%] left-[85%] -translate-x-1/2 z-20 cursor-pointer text-center group"
                onMouseEnter={() => setActiveNetworkNode('maps')}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all bg-white border ${
                  activeNetworkNode === 'maps' ? 'border-[#22C55E] scale-110 shadow-md' : 'border-[#E7ECF5]'
                }`}>
                  <MapPin className="w-5 h-5 text-[#22C55E]" />
                </div>
                <p className="text-[9px] font-black uppercase tracking-wider text-[#64748B] mt-1 group-hover:text-[#22C55E]">Maps</p>
              </div>

              {/* Node 3: Competitors (Middle Right) */}
              <div 
                className="absolute top-[45%] left-[80%] -translate-x-1/2 z-20 cursor-pointer text-center group"
                onMouseEnter={() => setActiveNetworkNode('competitors')}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all bg-white border ${
                  activeNetworkNode === 'competitors' ? 'border-amber-500 scale-110 shadow-md' : 'border-[#E7ECF5]'
                }`}>
                  <Target className="w-5 h-5 text-amber-500" />
                </div>
                <p className="text-[9px] font-black uppercase tracking-wider text-[#64748B] mt-1 group-hover:text-amber-500">Rivals</p>
              </div>

              {/* Node 4: Reviews (Bottom Right) */}
              <div 
                className="absolute top-[70%] left-[85%] -translate-x-1/2 z-20 cursor-pointer text-center group"
                onMouseEnter={() => setActiveNetworkNode('reviews')}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all bg-white border ${
                  activeNetworkNode === 'reviews' ? 'border-[#8B5CF6] scale-110 shadow-md' : 'border-[#E7ECF5]'
                }`}>
                  <MessageSquare className="w-5 h-5 text-[#8B5CF6]" />
                </div>
                <p className="text-[9px] font-black uppercase tracking-wider text-[#64748B] mt-1 group-hover:text-[#8B5CF6]">Reviews</p>
              </div>

              {/* Node 5: AI Search (Bottom Center) */}
              <div 
                className="absolute top-[80%] left-[50%] -translate-x-1/2 z-20 cursor-pointer text-center group"
                onMouseEnter={() => setActiveNetworkNode('ai_search')}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all bg-white border ${
                  activeNetworkNode === 'ai_search' ? 'border-indigo-500 scale-110 shadow-md' : 'border-[#E7ECF5]'
                }`}>
                  <Cpu className="w-5 h-5 text-indigo-500" />
                </div>
                <p className="text-[9px] font-black uppercase tracking-wider text-[#64748B] mt-1 group-hover:text-indigo-500">AI Search</p>
              </div>

              {/* Node 6: Social (Bottom Left) */}
              <div 
                className="absolute top-[70%] left-[15%] -translate-x-1/2 z-20 cursor-pointer text-center group"
                onMouseEnter={() => setActiveNetworkNode('social')}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all bg-white border ${
                  activeNetworkNode === 'social' ? 'border-purple-500 scale-110 shadow-md' : 'border-[#E7ECF5]'
                }`}>
                  <Share2 className="w-5 h-5 text-purple-500" />
                </div>
                <p className="text-[9px] font-black uppercase tracking-wider text-[#64748B] mt-1 group-hover:text-purple-500">Social</p>
              </div>

              {/* Node 7: Directories (Middle Left) */}
              <div 
                className="absolute top-[45%] left-[20%] -translate-x-1/2 z-20 cursor-pointer text-center group"
                onMouseEnter={() => setActiveNetworkNode('directories')}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all bg-white border ${
                  activeNetworkNode === 'directories' ? 'border-pink-500 scale-110 shadow-md' : 'border-[#E7ECF5]'
                }`}>
                  <Database className="w-5 h-5 text-pink-500" />
                </div>
                <p className="text-[9px] font-black uppercase tracking-wider text-[#64748B] mt-1 group-hover:text-pink-500">Directories</p>
              </div>

              {/* Node 8: Website (Top Left) */}
              <div 
                className="absolute top-[20%] left-[15%] -translate-x-1/2 z-20 cursor-pointer text-center group"
                onMouseEnter={() => setActiveNetworkNode('website')}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all bg-white border ${
                  activeNetworkNode === 'website' ? 'border-[#22C55E] scale-110 shadow-md' : 'border-[#E7ECF5]'
                }`}>
                  <Globe className="w-5 h-5 text-[#22C55E]" />
                </div>
                <p className="text-[9px] font-black uppercase tracking-wider text-[#64748B] mt-1 group-hover:text-[#22C55E]">Websites</p>
              </div>

            </div>

            {/* Explanatory Node Card (Righthand block) */}
            <div className="lg:col-span-5 space-y-6 text-left">
              <AnimatePresence mode="wait">
                {Object.entries(networkNodes).map(([key, data]) => {
                  if (activeNetworkNode !== key) return null;
                  return (
                    <motion.div 
                      key={key}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white border border-[#E7ECF5] rounded-3xl p-8 shadow-xl relative overflow-hidden"
                    >
                      {/* Decorative corner tag color */}
                      <div className={`absolute top-0 right-0 w-24 h-24 ${data.color} opacity-[0.03] rounded-bl-full`} />
                      
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${data.color} animate-pulse`} />
                        <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#64748B]">
                          {data.metric}
                        </span>
                      </div>

                      <h3 className="text-2xl font-black text-[#09111F] tracking-tight mt-3">
                        {data.title}
                      </h3>

                      <p className="text-[#64748B] text-sm leading-relaxed font-medium mt-4">
                        {data.desc}
                      </p>

                      <div className="border-t border-[#E7ECF5] pt-6 mt-8 space-y-4">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#64748B] font-bold">Scanning Frequency</span>
                          <span className="text-[#09111F] font-mono font-black">24/7 Continuous</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#64748B] font-bold">Sync Method</span>
                          <span className="text-[#5B5FFF] font-mono font-black uppercase tracking-wider">REST Node API</span>
                        </div>
                      </div>

                      <div className="pt-6">
                        <button 
                          onClick={() => onStartAudit()}
                          className="px-6 py-3 rounded-xl bg-[#FAFBFF] hover:bg-[#5B5FFF]/5 text-[#5B5FFF] font-extrabold text-xs uppercase tracking-wider border border-[#E7ECF5] hover:border-[#5B5FFF]/30 flex items-center gap-2 transition-all w-full justify-center"
                        >
                          <span>Deploy Node Scan</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 3: WHY OCULA */}
      <section className="py-24 px-6 sm:px-12 bg-[#FAFBFF] relative">
        <div className="max-w-7xl mx-auto space-y-16">
          
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black text-[#09111F] tracking-tight">
              Why Ocula BI
            </h2>
            <p className="text-base text-[#64748B] font-medium leading-relaxed">
              We coordinate deep search crawling, reviews analysis, maps synchronization, and conversational engines auditing into a single cohesive system.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {whyOculaFeatures.map((feat) => (
              <motion.div
                key={feat.id}
                whileHover={{ y: -5, boxShadow: '0 20px 40px -15px rgba(9,17,31,0.06)' }}
                className="bg-white border border-[#E7ECF5] p-8 rounded-3xl text-left transition-all relative flex flex-col justify-between group"
              >
                <div className="space-y-6">
                  {/* Icon Area */}
                  <div className="w-12 h-12 rounded-2xl bg-[#FAFBFF] border border-[#E7ECF5] flex items-center justify-center transition-colors group-hover:bg-[#5B5FFF]/5 group-hover:border-[#5B5FFF]/20">
                    {feat.icon}
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-lg font-black text-[#09111F] tracking-tight">
                      {feat.title}
                    </h4>
                    <p className="text-xs text-[#64748B] font-medium leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                </div>

                {/* Micro stat bottom strip */}
                <div className="border-t border-[#E7ECF5] pt-4 mt-6 flex justify-between items-center">
                  <span className="text-[10px] font-mono text-[#64748B] font-bold uppercase tracking-wider">
                    {feat.statLabel}
                  </span>
                  <span className="text-xs font-black text-[#09111F]">
                    {feat.stat}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION 4: PLATFORM DASHBOARD PREVIEW */}
      <section className="py-24 px-6 sm:px-12 bg-white relative border-y border-[#E7ECF5]">
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-[10px] font-mono font-black uppercase tracking-[0.25em] text-[#5B5FFF]">
              Autonomous Control Panel
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#09111F] tracking-tight">
              Pristine Enterprise Workspace
            </h2>
            <p className="text-base text-[#64748B] font-medium leading-relaxed">
              Experience a dark-mode luxury analytics viewport. Full capability to oversee global branch locations, competitive displacement, and indexation drift.
            </p>
          </div>

          {/* Interactive Workspace Mock Container */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-5xl mx-auto bg-[#09111F] border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl text-left text-slate-300 relative overflow-hidden"
          >
            {/* Top Toolbar */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-800 mb-6">
              {/* Dots */}
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <span className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest ml-4">
                  Ocular_Sentinel_v3.2_Active
                </span>
              </div>
              {/* Stats pill */}
              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="hidden sm:flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full text-slate-400">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span>Grid Sync: 99.8%</span>
                </div>
                <button 
                  onClick={onGoToDashboard}
                  className="px-4 py-1.5 rounded-full bg-white text-[#09111F] font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-colors"
                >
                  Launch Live Demo
                </button>
              </div>
            </div>

            {/* Dashboard Mock Body */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Left sidebar nav */}
              <div className="md:col-span-3 space-y-6 hidden md:block border-r border-slate-800/80 pr-4">
                <div className="space-y-1">
                  <p className="text-[9px] font-mono font-black text-slate-600 uppercase tracking-widest mb-2 pl-2">Visibility System</p>
                  {[
                    { label: 'Control Desk', act: true, icon: <Activity className="w-3.5 h-3.5" /> },
                    { label: 'Map Resonance', act: false, icon: <MapPin className="w-3.5 h-3.5" /> },
                    { label: 'AI Retrieval Audit', act: false, icon: <Cpu className="w-3.5 h-3.5" /> },
                    { label: 'Review Sentinels', act: false, icon: <MessageSquare className="w-3.5 h-3.5" /> },
                    { label: 'Competitors Space', act: false, icon: <Target className="w-3.5 h-3.5" /> },
                    { label: 'Uniform NAP Sync', act: false, icon: <Database className="w-3.5 h-3.5" /> }
                  ].map((it) => (
                    <div 
                      key={it.label} 
                      onClick={onGoToDashboard}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-extrabold cursor-pointer transition-all ${
                        it.act ? 'bg-white/10 text-white border-l-2 border-[#5B5FFF]' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
                      }`}
                    >
                      {it.icon}
                      <span>{it.label}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-8 border-t border-slate-800">
                  <p className="text-[9px] font-mono font-black text-slate-600 uppercase tracking-widest mb-2 pl-2">Regional Scopes</p>
                  <div className="space-y-1.5 text-xs font-mono font-bold text-slate-500 pl-2">
                    <div className="flex items-center gap-2 text-[#22C55E]">
                      <span className="w-1.5 h-1.5 bg-[#22C55E] rounded-full" />
                      <span>Sub-Saharan Grid</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-slate-600 rounded-full" />
                      <span>North Africa Hub</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-slate-600 rounded-full" />
                      <span>SADC Sector Grid</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main dashboard widgets area */}
              <div className="md:col-span-9 space-y-6">
                
                {/* 3 top mini-metric cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
                    <div>
                      <p className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Crawl Coverage</p>
                      <h4 className="text-xl font-black text-white mt-1">99.4%</h4>
                    </div>
                    <span className="text-[9px] text-[#22C55E] font-bold flex items-center gap-1 mt-2">
                      <span>● Active Sweep</span>
                    </span>
                  </div>

                  <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
                    <div>
                      <p className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">NAP PARITY</p>
                      <h4 className="text-xl font-black text-white mt-1">100% Uniform</h4>
                    </div>
                    <span className="text-[9px] text-[#22C55E] font-bold flex items-center gap-1 mt-2">
                      <span>✓ Fully Confirmed</span>
                    </span>
                  </div>

                  <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
                    <div>
                      <p className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Competitor Delta</p>
                      <h4 className="text-xl font-black text-white mt-1">+24.8%</h4>
                    </div>
                    <span className="text-[9px] text-[#5B5FFF] font-bold flex items-center gap-1 mt-2">
                      <span>↑ Net Displacement</span>
                    </span>
                  </div>
                </div>

                {/* Interactive Chart Workspace Visualizer */}
                <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 space-y-6">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <div>
                      <h4 className="text-sm font-black text-white">Search Citation Resonance</h4>
                      <p className="text-[10px] text-slate-500">Live indexed share against major national players.</p>
                    </div>
                    {/* Fake Chart legend */}
                    <div className="flex items-center gap-4 text-[10px] font-mono">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-[#5B5FFF] rounded-full" />
                        <span>Ocula BI</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-slate-600 rounded-full" />
                        <span>Main Competitor</span>
                      </span>
                    </div>
                  </div>

                  {/* Gorgeous Vector Custom Chart */}
                  <div className="h-44 relative flex items-end">
                    
                    {/* Grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-[0.05]">
                      <div className="border-b border-white w-full" />
                      <div className="border-b border-white w-full" />
                      <div className="border-b border-white w-full" />
                      <div className="border-b border-white w-full" />
                    </div>

                    {/* SVG Graphic Line of Ocula vs competitors */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 150" fill="none" preserveAspectRatio="none">
                      {/* Gradient definition */}
                      <defs>
                        <linearGradient id="oculaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#5B5FFF" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#5B5FFF" stopOpacity="0" />
                        </linearGradient>
                      </defs>

                      {/* Competitor Line (lower, volatile) */}
                      <path 
                        d="M0,110 L100,105 L200,115 L300,95 L400,105 L500,90" 
                        stroke="#475569" 
                        strokeWidth="1.5" 
                        strokeDasharray="4 4"
                      />

                      {/* Ocula Line (Rising, glowing) */}
                      <path 
                        d="M0,120 L100,80 L200,75 L300,45 L400,25 L500,10" 
                        stroke="#5B5FFF" 
                        strokeWidth="3.5" 
                        strokeLinecap="round" 
                        className="drop-shadow-[0_0_8px_rgba(91,95,255,0.5)]"
                      />

                      {/* Filled area */}
                      <path 
                        d="M0,120 L100,80 L200,75 L300,45 L400,25 L500,10 L500,150 L0,150 Z" 
                        fill="url(#oculaGrad)" 
                      />

                      {/* Pulsing indicator node on current */}
                      <circle cx="500" cy="10" r="4.5" fill="#5B5FFF" />
                      <circle cx="500" cy="10" r="1.5" fill="#FAFBFF" />
                    </svg>

                    {/* Chart axis markings */}
                    <div className="absolute bottom-1 w-full flex justify-between text-[8px] font-mono text-slate-600 px-1">
                      <span>JAN 26</span>
                      <span>MAR 26</span>
                      <span>MAY 26</span>
                      <span>JULY 26 (CURRENT)</span>
                    </div>

                  </div>
                </div>

                {/* Bottom detail row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Semantic Feedback Engine</span>
                      <span className="text-[10px] text-[#22C55E] font-bold">4.8★ Avg</span>
                    </div>
                    <SentimentWave active={true} />
                    <p className="text-[10px] text-slate-400">
                      Ocula multi-channel sentiment analysis mapped 48 reviews today. Automatically grouped into 3 sentiment vectors.
                    </p>
                  </div>

                  <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Competitor Displacement Log</span>
                      <span className="text-[9px] font-mono text-slate-600">Sync: 12m ago</span>
                    </div>
                    <div className="space-y-2 text-[11px]">
                      <div className="flex justify-between items-center bg-slate-950/40 px-3 py-1.5 rounded-lg">
                        <span className="text-slate-300 font-bold">1. Zenith competitor displaced on Map</span>
                        <span className="text-[#22C55E] font-mono">+1 Rank</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-950/40 px-3 py-1.5 rounded-lg">
                        <span className="text-slate-300 font-bold">2. Local citation parity confirmed</span>
                        <span className="text-[#5B5FFF] font-mono">100% Ok</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Auto-transmitting displaced rivals signal to your core marketing strategies module.
                    </p>
                  </div>
                </div>

              </div>

            </div>

          </motion.div>

        </div>
      </section>

      {/* SECTION 5: HOW OCULA WORKS (Timeline with progress line) */}
      <section className="py-24 px-6 sm:px-12 bg-[#FAFBFF] relative">
        <div className="max-w-7xl mx-auto space-y-16">
          
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-[10px] font-mono font-black uppercase tracking-[0.25em] text-[#5B5FFF]">
              Integration Protocol
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#09111F] tracking-tight">
              Six Steps to Total Local Authority
            </h2>
            <p className="text-base text-[#64748B] font-medium leading-relaxed">
              Ocula coordinates complex digital footprint mapping into a completely streamlined, automated workflow.
            </p>
          </div>

          {/* Timeline Process */}
          <div className="relative max-w-4xl mx-auto pt-8">
            
            {/* Background progress vertical line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-[2px] bg-[#E7ECF5] -translate-x-1/2 pointer-events-none" />

            {/* Step Nodes */}
            <div className="space-y-12">
              {timelineSteps.map((step, idx) => {
                const isLeft = idx % 2 === 0;
                return (
                  <div key={idx} className="relative flex flex-col md:flex-row items-start md:items-center">
                    
                    {/* Node marker */}
                    <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white border-2 border-[#5B5FFF] shadow-md z-10 flex items-center justify-center text-xs font-black text-[#5B5FFF]">
                      {idx + 1}
                    </div>

                    {/* Left space for desktop layout */}
                    <div className={`w-full md:w-1/2 pl-14 md:pl-0 md:pr-12 text-left md:text-right ${isLeft ? 'block' : 'md:invisible md:h-0 md:overflow-hidden'}`}>
                      <span className="text-[9px] font-mono font-black text-[#5B5FFF] uppercase tracking-widest block mb-1">
                        {step.label}
                      </span>
                      <h4 className="text-lg font-black text-[#09111F] tracking-tight">
                        {step.title}
                      </h4>
                      <p className="text-xs text-[#64748B] font-medium mt-1 leading-relaxed max-w-md md:ml-auto">
                        {step.desc}
                      </p>
                    </div>

                    {/* Right space for desktop layout */}
                    <div className={`w-full md:w-1/2 pl-14 md:pl-12 text-left ${!isLeft ? 'block' : 'md:invisible md:h-0 md:overflow-hidden'}`}>
                      <span className="text-[9px] font-mono font-black text-[#5B5FFF] uppercase tracking-widest block mb-1">
                        {step.label}
                      </span>
                      <h4 className="text-lg font-black text-[#09111F] tracking-tight">
                        {step.title}
                      </h4>
                      <p className="text-xs text-[#64748B] font-medium mt-1 leading-relaxed max-w-md">
                        {step.desc}
                      </p>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 6: RESULTS (Large metrics with animated count-up) */}
      <section className="py-24 px-6 sm:px-12 bg-white relative border-y border-[#E7ECF5]">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 divide-y sm:divide-y-0 lg:divide-x divide-[#E7ECF5]">
            
            {/* Metric 1 */}
            <div className="pt-6 sm:pt-0 lg:px-8 text-center sm:text-left space-y-2">
              <p className="text-4xl sm:text-5xl font-black text-[#5B5FFF] tracking-tighter">
                <AnimatedCounter value="50M+" />
              </p>
              <div>
                <h5 className="text-sm font-black text-[#09111F]">Visibility Signals</h5>
                <p className="text-xs text-[#64748B] font-medium">Scanned and verified continuously across global sectors.</p>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="pt-6 sm:pt-0 lg:px-8 text-center sm:text-left space-y-2">
              <p className="text-4xl sm:text-5xl font-black text-[#8B5CF6] tracking-tighter">
                <AnimatedCounter value="150K+" />
              </p>
              <div>
                <h5 className="text-sm font-black text-[#09111F]">Scans Run</h5>
                <p className="text-xs text-[#64748B] font-medium">Unique business entities analyzed for visibility parity.</p>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="pt-6 sm:pt-0 lg:px-8 text-center sm:text-left space-y-2">
              <p className="text-4xl sm:text-5xl font-black text-[#22C55E] tracking-tighter">
                <AnimatedCounter value="97%" />
              </p>
              <div>
                <h5 className="text-sm font-black text-[#09111F]">AI Accuracy</h5>
                <p className="text-xs text-[#64748B] font-medium">Precise semantic categorization and correction sync rates.</p>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="pt-6 sm:pt-0 lg:px-8 text-center sm:text-left space-y-2">
              <p className="text-4xl sm:text-5xl font-black text-[#09111F] tracking-tighter">
                24/7
              </p>
              <div>
                <h5 className="text-sm font-black text-[#09111F]">Continuous Guard</h5>
                <p className="text-xs text-[#64748B] font-medium">Uninterrupted satellite sweeps to protect your local rank.</p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 7: CUSTOMER STORIES */}
      <section className="py-24 px-6 sm:px-12 bg-[#FAFBFF] relative">
        <div className="max-w-7xl mx-auto space-y-16">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-[10px] font-mono font-black uppercase tracking-[0.25em] text-[#5B5FFF]">
              Proven Performance
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#09111F] tracking-tight">
              Enterprise Success Blueprints
            </h2>
            <p className="text-base text-[#64748B] font-medium leading-relaxed">
              Explore concrete Before vs. After results achieved by major multi-location networks utilizing Ocula BI.
            </p>
          </div>

          {/* Interactive Case study cards selector */}
          <div className="flex justify-center gap-3 flex-wrap">
            {customerStories.map((st, idx) => (
              <button
                key={st.company}
                onClick={() => setActiveStoryIdx(idx)}
                className={`px-5 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all border ${
                  activeStoryIdx === idx 
                    ? 'bg-[#09111F] text-white border-[#09111F] shadow-md' 
                    : 'bg-white text-[#64748B] border-[#E7ECF5] hover:border-[#64748B]/30'
                }`}
              >
                {st.company}
              </button>
            ))}
          </div>

          {/* Content display area */}
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              {customerStories.map((st, idx) => {
                if (idx !== activeStoryIdx) return null;
                return (
                  <motion.div
                    key={st.company}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white border border-[#E7ECF5] rounded-3xl p-6 sm:p-10 shadow-lg grid grid-cols-1 md:grid-cols-12 gap-8 items-center text-left"
                  >
                    {/* Story Details (6 cols) */}
                    <div className="md:col-span-7 space-y-6">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-full bg-[#5B5FFF]/10 text-[#5B5FFF] font-mono text-[9px] font-black uppercase tracking-wider">
                          {st.industry}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 font-extrabold">CASE_0{idx + 1}</span>
                      </div>

                      <h3 className="text-2xl font-black text-[#09111F] tracking-tight">
                        How {st.company} Scaled Local Search Authority
                      </h3>

                      <p className="text-xs text-[#64748B] font-medium leading-relaxed">
                        {st.summary}
                      </p>

                      {/* Main result big metric */}
                      <div className="flex items-center gap-4 bg-[#FAFBFF] border border-[#E7ECF5] p-4 rounded-2xl">
                        <p className="text-4xl font-black text-[#22C55E] tracking-tight">
                          {st.growth}
                        </p>
                        <div>
                          <p className="text-xs font-black text-[#09111F]">{st.metricLabel}</p>
                          <p className="text-[10px] text-[#64748B] font-medium">Increment within 45 scan cycles</p>
                        </div>
                      </div>
                    </div>

                    {/* Stats Comparison Grid (5 cols) */}
                    <div className="md:col-span-5 bg-[#FAFBFF] border border-[#E7ECF5] rounded-2xl p-6 space-y-6">
                      <p className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest text-center">
                        Audited Performance Comparison
                      </p>

                      {/* BEFORE */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-1.5 text-[9px] font-mono font-black text-[#64748B] uppercase tracking-wider">
                          <span className="w-2 h-2 rounded-full bg-red-400" />
                          <span>Pre-Ocula Drift</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-white border border-[#E7ECF5] p-2.5 rounded-xl text-center">
                            <p className="text-[8px] font-mono text-slate-400 uppercase">Score</p>
                            <p className="text-sm font-black text-slate-500">{st.before.score}%</p>
                          </div>
                          <div className="bg-white border border-[#E7ECF5] p-2.5 rounded-xl text-center">
                            <p className="text-[8px] font-mono text-slate-400 uppercase">Reviews</p>
                            <p className="text-sm font-black text-slate-500">{st.before.reviews}</p>
                          </div>
                          <div className="bg-white border border-[#E7ECF5] p-2.5 rounded-xl text-center">
                            <p className="text-[8px] font-mono text-slate-400 uppercase">Citations</p>
                            <p className="text-sm font-black text-slate-500">{st.before.citations}</p>
                          </div>
                        </div>
                      </div>

                      {/* AFTER */}
                      <div className="space-y-3 pt-4 border-t border-[#E7ECF5]">
                        <div className="flex items-center gap-1.5 text-[9px] font-mono font-black text-[#22C55E] uppercase tracking-wider">
                          <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
                          <span>Ocula Autonomous Sync</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-white border border-emerald-100 p-2.5 rounded-xl text-center shadow-sm">
                            <p className="text-[8px] font-mono text-emerald-500 uppercase">Score</p>
                            <p className="text-sm font-black text-emerald-600">{st.after.score}%</p>
                          </div>
                          <div className="bg-white border border-emerald-100 p-2.5 rounded-xl text-center shadow-sm">
                            <p className="text-[8px] font-mono text-emerald-500 uppercase">Reviews</p>
                            <p className="text-sm font-black text-emerald-600">{st.after.reviews}</p>
                          </div>
                          <div className="bg-white border border-emerald-100 p-2.5 rounded-xl text-center shadow-sm">
                            <p className="text-[8px] font-mono text-emerald-500 uppercase">Citations</p>
                            <p className="text-sm font-black text-emerald-600">{st.after.citations}</p>
                          </div>
                        </div>
                      </div>

                    </div>

                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

        </div>
      </section>

      {/* SECTION 8: TESTIMONIALS (Carousel Style) */}
      <section className="py-24 px-6 sm:px-12 bg-white relative border-y border-[#E7ECF5]">
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black text-[#09111F] tracking-tight">
              Endorsed by Growth Pioneers
            </h2>
            <p className="text-base text-[#64748B] font-medium leading-relaxed">
              Read how enterprise growth officers utilize Ocula BI to displace competition and secure digital authority.
            </p>
          </div>

          {/* Carousel Testimonial view */}
          <div className="max-w-3xl mx-auto relative">
            <AnimatePresence mode="wait">
              {testimonials.map((test, idx) => {
                if (idx !== activeTestimonialIdx) return null;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.4 }}
                    className="bg-[#FAFBFF] border border-[#E7ECF5] rounded-3xl p-8 sm:p-12 shadow-md text-center relative"
                  >
                    {/* Quotation icon */}
                    <span className="text-6xl text-[#5B5FFF]/10 font-serif absolute top-4 left-6 leading-none">“</span>
                    
                    <p className="text-base sm:text-lg font-bold text-[#09111F] italic leading-relaxed relative z-10">
                      "{test.quote}"
                    </p>

                    {/* Author Details */}
                    <div className="mt-8 flex flex-col items-center gap-3">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-tr ${test.avatarBg} flex items-center justify-center text-white text-xs font-black shadow-inner`}>
                        {test.initials}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-[#09111F]">{test.author}</h4>
                        <p className="text-[10px] font-mono text-[#64748B] font-extrabold uppercase mt-0.5">{test.role}</p>
                      </div>
                      {/* Fake company text marker */}
                      <span className="text-[10px] font-mono font-bold text-slate-400 mt-2 uppercase tracking-[0.25em]">
                        {test.logo}
                      </span>
                    </div>

                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Controls */}
            <div className="flex justify-center gap-3 mt-8">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonialIdx(i)}
                  className={`w-3.5 h-3.5 rounded-full transition-all border ${
                    activeTestimonialIdx === i 
                      ? 'bg-[#5B5FFF] border-[#5B5FFF] scale-110' 
                      : 'bg-white border-[#E7ECF5] hover:border-[#64748B]/30'
                  }`}
                />
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 9: FAQ (Accordion) */}
      <section className="py-24 px-6 sm:px-12 bg-[#FAFBFF] relative" id="faq">
        <div className="max-w-4xl mx-auto space-y-16">
          
          <div className="text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black text-[#09111F] tracking-tight">
              Platform FAQ
            </h2>
            <p className="text-base text-[#64748B] font-medium leading-relaxed">
              Find technical answers about Ocula's automated network mapping and integration layers.
            </p>
          </div>

          {/* Accordion container */}
          <div className="space-y-4 text-left">
            {faqs.map((faq, idx) => {
              const isOpen = faqOpen === idx;
              return (
                <div 
                  key={idx} 
                  className="bg-white border border-[#E7ECF5] rounded-2xl overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setFaqOpen(isOpen ? null : idx)}
                    className="w-full px-6 py-5 flex justify-between items-center text-left font-black text-[#09111F] text-sm sm:text-base hover:text-[#5B5FFF] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${isOpen ? 'rotate-180 text-[#5B5FFF]' : ''}`} />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 text-xs sm:text-sm text-[#64748B] font-medium leading-relaxed border-t border-[#E7ECF5] pt-4">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* SECTION 10: FINAL CTA (Large gradient section with stars) */}
      <section className="py-24 px-6 sm:px-12 text-center" id="pricing">
        <div className="max-w-5xl mx-auto bg-gradient-to-tr from-[#09111F] via-[#111936] to-[#09111F] rounded-3xl p-8 sm:p-20 relative overflow-hidden border border-slate-800 shadow-2xl">
          
          {/* Animated decorative star glow particles inside the card */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
            <div className="absolute top-[20%] left-[10%] w-1.5 h-1.5 bg-white rounded-full animate-ping" style={{ animationDuration: '3s' }} />
            <div className="absolute bottom-[20%] right-[10%] w-1.5 h-1.5 bg-white rounded-full animate-ping" style={{ animationDuration: '4s' }} />
            <div className="absolute top-[60%] right-[30%] w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDuration: '5s' }} />
            {/* Subtle rotating circular grid line */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white/5 rounded-full animate-[spin_40s_linear_infinite]" />
          </div>

          <div className="relative z-10 space-y-8 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white font-mono text-[9px] font-black uppercase tracking-wider border border-white/10">
              <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>LAUNCH OCULA TODAY</span>
            </span>

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.1]">
              Ready to See Your Business Clearly?
            </h2>

            <p className="text-sm sm:text-base text-slate-400 font-medium leading-relaxed">
              Ocula coordinates all digital footprints, maps, citations, reviews, and search opportunities automatically. Experience premium visibility.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button 
                onClick={() => onStartAudit()}
                className="px-8 py-4 rounded-xl bg-[#5B5FFF] hover:bg-[#4b4edd] text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-[#5B5FFF]/20 hover:translate-y-[-1px] cursor-pointer"
              >
                Start Free Scan
              </button>
              <button 
                onClick={handleOpenCalendly}
                className="px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-black uppercase tracking-widest transition-all cursor-pointer"
              >
                Book Demo Session
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-16 px-6 sm:px-12 bg-[#FAFBFF] border-t border-[#E7ECF5] relative z-10">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 border-b border-[#E7ECF5] pb-12">
            
            {/* Column 1: Brand & Desc */}
            <div className="md:col-span-4 space-y-4 text-left">
              <div className="flex items-center gap-2.5">
                <OculaLogo className="w-6 h-6 text-[#5B5FFF]" />
                <span className="text-xl font-black text-[#09111F] tracking-tight">ocula</span>
                <span className="text-[9px] font-mono font-black bg-[#5B5FFF]/10 text-[#5B5FFF] px-1.5 py-0.5 rounded-md">BI</span>
              </div>
              <p className="text-xs text-[#64748B] font-medium leading-relaxed max-w-xs">
                The definitive AI Visibility Operating System for modern businesses. Centered tracking of directories, review metrics, competitive displacement, and conversational search.
              </p>
              <p className="text-[10px] font-mono text-slate-400">
                © {new Date().getFullYear()} Ocula Intelligence. All rights reserved.
              </p>
            </div>

            {/* Column 2: Platform */}
            <div className="md:col-span-2 space-y-3 text-left">
              <h5 className="text-[9px] font-mono font-black uppercase tracking-wider text-[#5B5FFF]">Platform</h5>
              <ul className="space-y-2 text-xs font-bold text-[#64748B]">
                <li><button onClick={() => onStartAudit()} className="hover:text-[#09111F] transition-colors cursor-pointer">Live Scanner</button></li>
                <li><button onClick={onGoToDashboard} className="hover:text-[#09111F] transition-colors cursor-pointer">Control Desk</button></li>
                <li><button onClick={onViewPricing} className="hover:text-[#09111F] transition-colors cursor-pointer">Pricing Packages</button></li>
                <li><button onClick={onGoToDashboard} className="hover:text-[#09111F] transition-colors cursor-pointer">Integrations</button></li>
              </ul>
            </div>

            {/* Column 3: Solutions */}
            <div className="md:col-span-2 space-y-3 text-left">
              <h5 className="text-[9px] font-mono font-black uppercase tracking-wider text-[#8B5CF6]">Solutions</h5>
              <ul className="space-y-2 text-xs font-bold text-[#64748B]">
                <li><button onClick={() => onStartAudit()} className="hover:text-[#09111F] transition-colors cursor-pointer">Local Citations</button></li>
                <li><button onClick={onGoToDashboard} className="hover:text-[#09111F] transition-colors cursor-pointer">Competitor Audits</button></li>
                <li><button onClick={onGoToDashboard} className="hover:text-[#09111F] transition-colors cursor-pointer">AI Retrieval Rank</button></li>
                <li><button onClick={onGoToDashboard} className="hover:text-[#09111F] transition-colors cursor-pointer">Enterprise API</button></li>
              </ul>
            </div>

            {/* Column 4: Resources */}
            <div className="md:col-span-2 space-y-3 text-left">
              <h5 className="text-[9px] font-mono font-black uppercase tracking-wider text-[#22C55E]">Resources</h5>
              <ul className="space-y-2 text-xs font-bold text-[#64748B]">
                <li><a href="#faq" className="hover:text-[#09111F] transition-colors">Support FAQ</a></li>
                <li><button onClick={handleOpenCalendly} className="hover:text-[#09111F] transition-colors cursor-pointer">Consultation</button></li>
                <li><button onClick={onGiveFeedback} className="hover:text-[#09111F] transition-colors cursor-pointer">In-App Feedback</button></li>
                <li><button onClick={() => onStartAudit()} className="hover:text-[#09111F] transition-colors cursor-pointer">Footprint Sweep</button></li>
              </ul>
            </div>

            {/* Column 5: Developers & Legal */}
            <div className="md:col-span-2 space-y-3 text-left">
              <h5 className="text-[9px] font-mono font-black uppercase tracking-wider text-[#09111F]">Company</h5>
              <ul className="space-y-2 text-xs font-bold text-[#64748B]">
                <li><button onClick={onViewLegal} className="hover:text-[#09111F] transition-colors cursor-pointer">Legal Protocols</button></li>
                <li><button onClick={onLogin} className="hover:text-[#09111F] transition-colors cursor-pointer">Member Login</button></li>
                <li><button onClick={onGoToFlokker} className="hover:text-[#09111F] transition-colors cursor-pointer">Parent Flokker</button></li>
                <li><a href="#faq" className="hover:text-[#09111F] transition-colors">Africa Digital Index</a></li>
              </ul>
            </div>

          </div>

          {/* Bottom strip */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-mono text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Ocula System parity: Online</span>
              <span>• latency: 14ms</span>
            </div>
            <div>
              Design language coordinated alongside OpenAI, Stripe, and Vercel structures.
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
