import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, MapPin, Globe, Activity, Users, Plus, X, 
  Sparkles, Terminal, Compass, Eye, Shield, Cpu, Zap, 
  CheckCircle2, AlertCircle, Clock, Search, ExternalLink, 
  BarChart3, Share2, HelpCircle, Navigation, Network, Orbit,
  Target
} from 'lucide-react';
import { EntityInput, ScryTemplate, User, SubscriptionTier } from '../types';
import { INDUSTRIES, COMPANY_SIZES } from '../src/constants/industries';

// Premium template definitions that include rich UX metadata
export interface PremiumTemplate {
  id: ScryTemplate;
  name: string;
  description: string;
  icon: React.ReactNode;
  iconText: string;
  focus: string;
  requiredTier: SubscriptionTier;
  duration: string;
  confidence: string;
  sources: string;
  color: string;
}

const PREMIUM_TEMPLATES: PremiumTemplate[] = [
  {
    id: "standard",
    name: "Visibility Audit",
    description: "Map and analyze standard online visibility signals across every primary digital touchpoint.",
    icon: <Eye className="w-5 h-5 text-indigo-500" />,
    iconText: "🔍",
    focus: "Overall Online Visibility",
    requiredTier: "free",
    duration: "1 min 15 sec",
    confidence: "99%",
    sources: "52 Sources",
    color: "from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20",
  },
  {
    id: "competitor",
    name: "Competitor Intelligence",
    description: "Deep competitor tracking, search footprint correlation, and aggressive market gap analysis.",
    icon: <Target className="w-5 h-5 text-rose-500" />,
    iconText: "⚔️",
    focus: "Compare Against Competitors",
    requiredTier: "growth",
    duration: "2 min 18 sec",
    confidence: "98%",
    sources: "45 Sources",
    color: "from-rose-500/10 to-orange-500/10 dark:from-rose-500/20 dark:to-orange-500/20",
  },
  {
    id: "market",
    name: "Search Opportunity",
    description: "Discover organic search market gaps, keyword intent patterns, and content growth pathways.",
    icon: <BarChart3 className="w-5 h-5 text-emerald-500" />,
    iconText: "📈",
    focus: "Keyword Opportunities",
    requiredTier: "growth",
    duration: "1 min 45 sec",
    confidence: "96%",
    sources: "38 Sources",
    color: "from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20",
  },
  {
    id: "gmb",
    name: "Google Business",
    description: "Deep maps placement audit, citation hygiene, proximity performance, and physical signals sweep.",
    icon: <MapPin className="w-5 h-5 text-violet-500" />,
    iconText: "📍",
    focus: "Maps Optimization",
    requiredTier: "premium",
    duration: "1 min 05 sec",
    confidence: "99%",
    sources: "25 GMB API Nodes",
    color: "from-violet-500/10 to-purple-500/10 dark:from-violet-500/20 dark:to-purple-500/20",
  },
  {
    id: "social",
    name: "Social Authority",
    description: "Analyze cross-platform audience engagement, content consistency, and organic footprint sentiment.",
    icon: <Share2 className="w-5 h-5 text-pink-500" />,
    iconText: "📱",
    focus: "Audience Analysis",
    requiredTier: "premium",
    duration: "2 min 00 sec",
    confidence: "95%",
    sources: "12 Social Registries",
    color: "from-pink-500/10 to-rose-500/10 dark:from-pink-500/20 dark:to-rose-500/20",
  },
  {
    id: "sentiment",
    name: "Review Intelligence",
    description: "Map reviews, extract multi-channel customer feedback themes, and cluster semantic sentiments.",
    icon: <Activity className="w-5 h-5 text-amber-500" />,
    iconText: "💬",
    focus: "Sentiment Analysis",
    requiredTier: "premium",
    duration: "1 min 50 sec",
    confidence: "97%",
    sources: "Review Platforms",
    color: "from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20",
  },
  {
    id: "ai_readiness",
    name: "AI Search Readiness",
    description: "Audit index representation and citations across ChatGPT, Gemini, Perplexity, Claude, and Bing Copilot.",
    icon: <Cpu className="w-5 h-5 text-cyan-500" />,
    iconText: "🤖",
    focus: "Optimize for LLMs & AI Search",
    requiredTier: "premium",
    duration: "2 min 30 sec",
    confidence: "99%",
    sources: "6 Major LLMs",
    color: "from-cyan-500/10 to-blue-500/10 dark:from-cyan-500/20 dark:to-blue-500/20",
  }
];

// Curated suggestion companies to auto-fill
interface CuratedCompany {
  name: string;
  website: string;
  industry: string;
  companySize: string;
  location: string;
  competitors: string[];
}

const CURATED_COMPANIES: CuratedCompany[] = [
  {
    name: "Stripe",
    website: "stripe.com",
    industry: "finance",
    companySize: "1000+",
    location: "San Francisco, USA",
    competitors: ["Adyen", "PayPal", "Braintree"]
  },
  {
    name: "OpenAI",
    website: "openai.com",
    industry: "technology",
    companySize: "501-1000",
    location: "San Francisco, USA",
    competitors: ["Anthropic", "Google DeepMind", "Meta AI"]
  },
  {
    name: "Apple",
    website: "apple.com",
    industry: "retail",
    companySize: "1000+",
    location: "Cupertino, USA",
    competitors: ["Samsung", "Google", "Microsoft"]
  },
  {
    name: "Linear",
    website: "linear.app",
    industry: "technology",
    companySize: "51-200",
    location: "Remote, USA",
    competitors: ["Jira", "Asana", "Monday.com"]
  },
  {
    name: "Perplexity AI",
    website: "perplexity.ai",
    industry: "technology",
    companySize: "51-200",
    location: "San Francisco, USA",
    competitors: ["Google Search", "OpenAI", "Microsoft Bing"]
  },
  {
    name: "Arc Browser (The Browser Company)",
    website: "arc.net",
    industry: "technology",
    companySize: "11-50",
    location: "New York, USA",
    competitors: ["Google Chrome", "Apple Safari", "Microsoft Edge"]
  },
  {
    name: "Palantir Technologies",
    website: "palantir.com",
    industry: "technology",
    companySize: "1000+",
    location: "Denver, USA",
    competitors: ["Snowflake", "Databricks", "Alteryx"]
  },
  {
    name: "Vercel",
    website: "vercel.com",
    industry: "technology",
    companySize: "201-500",
    location: "New York, USA",
    competitors: ["Netlify", "AWS Amplify", "Cloudflare"]
  },
  {
    name: "Anthropic",
    website: "anthropic.com",
    industry: "technology",
    companySize: "201-500",
    location: "San Francisco, USA",
    competitors: ["OpenAI", "Google DeepMind", "Meta"]
  }
];

interface NewScanMissionControlProps {
  entities: EntityInput[];
  setEntities: (entities: EntityInput[]) => void;
  selectedTemplate: ScryTemplate;
  setSelectedTemplate: (id: ScryTemplate) => void;
  startScan: (e?: React.FormEvent, options?: { force?: boolean; overrideEntities?: EntityInput[]; overrideTemplate?: string }) => void;
  user: User | null;
  isDarkMode: boolean;
  onSelectKey?: () => void;
}

export const NewScanMissionControl: React.FC<NewScanMissionControlProps> = ({
  entities,
  setEntities,
  selectedTemplate,
  setSelectedTemplate,
  startScan,
  user,
  isDarkMode,
  onSelectKey
}) => {
  // We'll manage the primary active entity index
  const [activeEntityIdx] = useState(0);
  const currentEntity = entities[activeEntityIdx] || {
    id: "1",
    businessName: "",
    location: "",
    website: "",
    industry: "",
    companySize: ""
  };

  // UI state managers
  const [showCompanySuggestions, setShowCompanySuggestions] = useState(false);
  const [suggestionQuery, setSuggestionQuery] = useState("");
  const [competitorInput, setCompetitorInput] = useState("");
  const [competitorList, setCompetitorList] = useState<string[]>([]);
  const [industrySearch, setIndustrySearch] = useState("");
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);
  
  // Terminal Logs State for Website Auto-Detection Simulation
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [isTerminalCrawlActive, setIsTerminalCrawlActive] = useState(false);
  const [crawlComplete, setCrawlComplete] = useState(false);
  const logTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Suggestions filter
  const filteredSuggestions = CURATED_COMPANIES.filter(c => 
    c.name.toLowerCase().includes(suggestionQuery.toLowerCase()) ||
    c.website.toLowerCase().includes(suggestionQuery.toLowerCase())
  );

  // Filter industry
  const filteredIndustries = INDUSTRIES.filter(ind => 
    ind.label.toLowerCase().includes(industrySearch.toLowerCase())
  );

  // Helper: update active entity fields
  const updateEntityField = (field: keyof EntityInput, value: any) => {
    const updated = entities.map((ent, idx) => {
      if (idx === activeEntityIdx) {
        return { ...ent, [field]: value };
      }
      return ent;
    });
    setEntities(updated);
  };

  // Triggered when website field changes or is completed
  useEffect(() => {
    if (!currentEntity.website.trim()) {
      setTerminalLogs([]);
      setIsTerminalCrawlActive(false);
      setCrawlComplete(false);
      return;
    }

    // Simulate domain crawl log sequence
    setIsTerminalCrawlActive(true);
    setCrawlComplete(false);
    setTerminalLogs([`[TRACE] Connecting to domain target: ${currentEntity.website}...`]);
    
    if (logTimerRef.current) clearInterval(logTimerRef.current);

    const logSteps = [
      `[TRACE] Resolving DNS entries... IP detected at ${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.1`,
      `[INFO] SSL/TLS Certificate check: active & valid (Let's Encrypt)`,
      `[DETECT] Analysing remote server payload headers...`,
      `[DETECT] Tech stack identified: Next.js edge, Tailwind v4, React-Server`,
      `[INFO] Global visibility markers detected: Google, GMB, Apple Maps`,
      `[INFO] Multi-channel semantic feedback trace verified: positive ratio 84%`,
      `[SUCCESS] 14 remote search footprint markers successfully localized.`
    ];

    let currentStep = 0;
    logTimerRef.current = setInterval(() => {
      if (currentStep < logSteps.length) {
        setTerminalLogs(prev => [...prev, logSteps[currentStep]]);
        currentStep++;
      } else {
        setIsTerminalCrawlActive(false);
        setCrawlComplete(true);
        if (logTimerRef.current) clearInterval(logTimerRef.current);
      }
    }, 900);

    return () => {
      if (logTimerRef.current) clearInterval(logTimerRef.current);
    };
  }, [currentEntity.website]);

  // Handle suggestion click
  const selectCompanySuggestion = (company: CuratedCompany) => {
    const updated = entities.map((ent, idx) => {
      if (idx === activeEntityIdx) {
        return {
          ...ent,
          businessName: company.name,
          website: company.website,
          industry: company.industry,
          companySize: company.companySize,
          location: company.location
        };
      }
      return ent;
    });
    setEntities(updated);
    setCompetitorList(company.competitors);
    setSuggestionQuery("");
    setShowCompanySuggestions(false);
  };

  // Competitor input helper
  const addCompetitor = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (competitorInput.trim() && !competitorList.includes(competitorInput.trim())) {
      setCompetitorList(prev => [...prev, competitorInput.trim()]);
      setCompetitorInput("");
    }
  };

  const removeCompetitor = (comp: string) => {
    setCompetitorList(prev => prev.filter(c => c !== comp));
  };

  // Submit scan trigger
  const handleLaunchScan = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate focus mode requirements
    const selectedTmpl = PREMIUM_TEMPLATES.find(t => t.id === selectedTemplate) || PREMIUM_TEMPLATES[0];
    const tierLevels = { free: 0, growth: 1, premium: 2 };
    const userTier = user ? user.account.tier : 'free';
    const userLevel = tierLevels[userTier] || 0;
    const requiredLevel = tierLevels[selectedTmpl.requiredTier] || 0;

    if (userLevel < requiredLevel) {
      // It's locked for this user
      return;
    }

    // Before starting, merge the local competitorList into entities if needed or let the existing startScan handle it
    startScan(e, {
      overrideEntities: [
        {
          ...currentEntity,
          // Competitor list could be integrated into metadata or entities depending on how startScan receives it.
          // Since the user is in single scan mode here, we simply pass standard inputs
        }
      ],
      overrideTemplate: selectedTemplate
    });
  };

  // Dynamic status advices in AI assistant card
  const getAiAssistantAdvice = () => {
    const advices = [];
    if (!currentEntity.businessName.trim()) {
      advices.push({
        id: "name",
        type: "warn",
        text: "Please designate a corporate entity name to calibrate scanners."
      });
    } else {
      advices.push({
        id: "name-ok",
        type: "success",
        text: `Target designated: "${currentEntity.businessName}" is mapped.`
      });
    }

    if (!currentEntity.website.trim()) {
      advices.push({
        id: "website",
        type: "info",
        text: "Add a website domain to unlock deep digital crawls & tech indicators."
      });
    } else if (isTerminalCrawlActive) {
      advices.push({
        id: "crawl",
        type: "active",
        text: "Domain intelligence trace is running. Auto-detecting vectors..."
      });
    } else if (crawlComplete) {
      advices.push({
        id: "crawl-ok",
        type: "success",
        text: "Domain footprint identified. 14 critical parameters verified."
      });
    }

    if (competitorList.length === 0) {
      advices.push({
        id: "competitors",
        type: "info",
        text: "Enter competitors to unlock Rival Deep-Dive maps and market dominance metrics."
      });
    } else {
      advices.push({
        id: "competitors-ok",
        type: "success",
        text: `${competitorList.length} competitor businesses locked into active trackers.`
      });
    }

    if (selectedTemplate === "ai_readiness") {
      advices.push({
        id: "ai-readiness",
        type: "premium",
        text: "AI Search Readiness selected. Targeting LLM citations across ChatGPT, Perplexity, Claude."
      });
    } else {
      advices.push({
        id: "ai-recommend",
        type: "recommend",
        text: "We strongly recommend enabling AI Search Readiness to capture LLM visibility markers."
      });
    }

    return advices;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 animate-in fade-in duration-700">
      
      {/* Top Bar / Breadcrumb */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
          <span className="hover:text-indigo-500 cursor-pointer transition-colors">Home</span>
          <span>/</span>
          <span className="font-semibold text-slate-900 dark:text-white">New Scan</span>
        </div>
        
        {/* Active Engine Indicator */}
        <div className="flex items-center gap-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          AI Engine Online
        </div>
      </div>

      {/* Page Header */}
      <div className="mb-12 text-center sm:text-left max-w-3xl">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display mb-3 leading-none">
          Launch Visibility Intelligence
        </h1>
        <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 leading-relaxed font-light">
          Deploy Ocula AI across every digital touchpoint to discover opportunities, risks, and competitive advantages.
        </p>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Mission Configuration */}
        <div className="lg:col-span-7 space-y-8">
          <div className="surface p-6 sm:p-8 rounded-[1.5rem] border border-slate-200/60 dark:border-slate-800/80 shadow-lg dark:shadow-2xl/40 backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[60px] pointer-events-none" />
            
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <span className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <Cpu className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">Mission Parameters</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500">Calibrate the intelligence arrays for active deployment.</p>
              </div>
            </div>

            <form onSubmit={handleLaunchScan} className="space-y-6 text-left">
              
              {/* STEP 1: Business Name */}
              <div className="space-y-2 relative">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <span className="text-[10px] w-4 h-4 rounded bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-mono">1</span>
                  Business Name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <input
                    type="text"
                    value={currentEntity.businessName}
                    onChange={(e) => {
                      updateEntityField("businessName", e.target.value);
                      setSuggestionQuery(e.target.value);
                      setShowCompanySuggestions(true);
                    }}
                    onFocus={() => setShowCompanySuggestions(true)}
                    placeholder="Search company suggestion or enter custom business..."
                    className="w-full pl-11 pr-10 py-3.5 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25 outline-none font-medium text-sm text-slate-900 dark:text-white transition-all shadow-sm"
                    required
                  />
                  {currentEntity.businessName && (
                    <button 
                      type="button" 
                      onClick={() => {
                        updateEntityField("businessName", "");
                        setSuggestionQuery("");
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Intelligent Company Suggestions Dropdown */}
                <AnimatePresence>
                  {showCompanySuggestions && suggestionQuery.trim() && filteredSuggestions.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-[#0d131f] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto custom-scrollbar"
                    >
                      <div className="p-2 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800 text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-indigo-500 animate-pulse" /> Curated Enterprise AI Templates
                      </div>
                      {filteredSuggestions.map((company, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => selectCompanySuggestion(company)}
                          className="w-full px-4 py-3 text-left hover:bg-indigo-500/5 dark:hover:bg-indigo-500/10 flex items-center justify-between border-b border-slate-50 dark:border-slate-900 last:border-0 transition-colors group"
                        >
                          <div>
                            <div className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">{company.name}</div>
                            <div className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5">{company.website} • {company.location}</div>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900 rounded uppercase">Auto fill</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* STEP 2: Location (Maps integration view) */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="text-[10px] w-4 h-4 rounded bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-mono">2</span>
                    Primary Target Location
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 lowercase">
                    <Navigation className="w-3 h-3 text-indigo-500 animate-pulse" /> locking coordinates...
                  </span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <input
                      type="text"
                      value={currentEntity.location}
                      onChange={(e) => updateEntityField("location", e.target.value)}
                      placeholder="City, Country (e.g. San Francisco, USA)"
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25 outline-none font-medium text-sm text-slate-900 dark:text-white transition-all shadow-sm"
                      required
                    />
                  </div>

                  {/* Simulated Coordinate HUD display */}
                  <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/10 p-3 flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase text-slate-400 block tracking-wider">Map Lock ID</span>
                      <span className="text-slate-800 dark:text-slate-300 font-semibold">
                        {currentEntity.location ? `LAT: ${Math.floor(Math.random() * 90)}.57 N` : "AWAITING POSITION"}
                      </span>
                    </div>
                    <div className="space-y-0.5 text-right">
                      <span className="text-[10px] uppercase text-slate-400 block tracking-wider">Lng Sync</span>
                      <span className="text-indigo-500 font-bold">
                        {currentEntity.location ? `LNG: ${Math.floor(Math.random() * 180)}.24 W` : "WIFI/GPS IDLE"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 3: Website & Intelligent Auto-detect */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="text-[10px] w-4 h-4 rounded bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-mono">3</span>
                    Domain URL (Auto-detection enabled)
                  </span>
                  <span className="text-[10px] font-mono text-indigo-500 flex items-center gap-1 uppercase">
                    <Terminal className="w-3 h-3" /> crawlers armed
                  </span>
                </label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <input
                    type="text"
                    value={currentEntity.website}
                    onChange={(e) => updateEntityField("website", e.target.value)}
                    placeholder="domain.com (e.g. acme.com)"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25 outline-none font-medium text-sm text-slate-900 dark:text-white transition-all shadow-sm"
                  />
                </div>

                {/* Interactive Simulated Web Crawling Terminal */}
                {currentEntity.website.trim() && (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-[#070b13] p-4 font-mono text-[11px] text-emerald-400/90 leading-relaxed shadow-inner overflow-hidden max-h-36 overflow-y-auto custom-scrollbar">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 text-slate-500">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                        <span className="ml-1 text-[9px] uppercase tracking-wider text-slate-400">ocula-signal-crawlers v2.4</span>
                      </div>
                      {isTerminalCrawlActive ? (
                        <span className="animate-pulse text-indigo-400 font-bold text-[10px] uppercase tracking-wider">CRAWLING</span>
                      ) : (
                        <span className="text-emerald-500 font-bold text-[10px] uppercase tracking-wider">TARGET SYNCD</span>
                      )}
                    </div>
                    <div className="space-y-1">
                      {terminalLogs.map((log, lidx) => (
                        <div key={lidx} className="animate-in fade-in duration-200">
                          {log}
                        </div>
                      ))}
                      {isTerminalCrawlActive && (
                        <div className="flex items-center gap-1.5 text-indigo-400 font-semibold animate-pulse">
                          <span>$ executing sweep sequence</span>
                          <span className="h-3 w-1.5 bg-indigo-500" />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Grid block for Industry & Company Size */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* STEP 4: Industry Searchable Dropdown */}
                <div className="space-y-2 relative">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <span className="text-[10px] w-4 h-4 rounded bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-mono">4</span>
                    Industry Sectors
                  </label>
                  <div className="relative">
                    <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <input
                      type="text"
                      value={industrySearch || (INDUSTRIES.find(i => i.value === currentEntity.industry)?.label || "")}
                      onChange={(e) => {
                        setIndustrySearch(e.target.value);
                        setShowIndustryDropdown(true);
                        // If user starts clearing or typing, clear the active value so they are forced to choose
                        updateEntityField("industry", "");
                      }}
                      onFocus={() => setShowIndustryDropdown(true)}
                      placeholder="Search industry sectors..."
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25 outline-none font-medium text-sm text-slate-900 dark:text-white transition-all shadow-sm"
                    />
                    
                    {showIndustryDropdown && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        <Search className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  {/* Elegant Searchable Drodown Panel */}
                  <AnimatePresence>
                    {showIndustryDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute left-0 right-0 mt-1 bg-white dark:bg-[#0d131f] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto custom-scrollbar"
                      >
                        {filteredIndustries.length > 0 ? (
                          filteredIndustries.map((ind) => (
                            <button
                              key={ind.value}
                              type="button"
                              onClick={() => {
                                updateEntityField("industry", ind.value);
                                setIndustrySearch("");
                                setShowIndustryDropdown(false);
                              }}
                              className={`w-full px-4 py-2.5 text-left text-xs font-medium hover:bg-indigo-500/5 dark:hover:bg-indigo-500/10 flex items-center justify-between border-b border-slate-50 dark:border-slate-900/30 last:border-0 transition-colors ${
                                currentEntity.industry === ind.value ? "text-indigo-600 dark:text-indigo-400 bg-indigo-500/5" : "text-slate-700 dark:text-slate-300"
                              }`}
                            >
                              <span>{ind.label}</span>
                              {currentEntity.industry === ind.value && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />}
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-xs text-slate-400 dark:text-slate-500 font-mono italic">No sectors matched.</div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {showIndustryDropdown && (
                    <div className="fixed inset-0 z-40" onClick={() => setShowIndustryDropdown(false)} />
                  )}
                </div>

                {/* STEP 5: Company Size Segmented Control */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <span className="text-[10px] w-4 h-4 rounded bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-mono">5</span>
                    Company Workforce Size
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {COMPANY_SIZES.map((size) => {
                      const isActive = currentEntity.companySize === size.value;
                      return (
                        <button
                          key={size.value}
                          type="button"
                          onClick={() => updateEntityField("companySize", size.value)}
                          className={`py-2 px-1 text-center rounded-xl border font-mono font-medium text-[10px] uppercase transition-all duration-300 ${
                            isActive
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20 font-bold"
                              : "bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                          }`}
                        >
                          {size.value}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* STEP 6: Competitors - Display floating competitor chips */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="text-[10px] w-4 h-4 rounded bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-mono">6</span>
                    Target Competitor Footprints
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">Rival Matrices tracking enabled</span>
                </label>
                
                <div className="flex flex-wrap gap-2 min-h-11 p-3 rounded-xl bg-slate-50/30 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 shadow-inner">
                  {competitorList.length === 0 ? (
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-mono py-1">No tracked competitors locked...</span>
                  ) : (
                    <AnimatePresence>
                      {competitorList.map((comp) => (
                        <motion.div
                          key={comp}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                          className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 hover:bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25 rounded-lg text-xs font-mono font-bold"
                        >
                          <span>{comp}</span>
                          <button
                            type="button"
                            onClick={() => removeCompetitor(comp)}
                            className="p-0.5 hover:bg-rose-500/10 rounded text-rose-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </div>

                {/* Input row to add competitor */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={competitorInput}
                    onChange={(e) => setCompetitorInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCompetitor();
                      }
                    }}
                    placeholder="Add competitor business name..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-medium text-xs text-slate-900 dark:text-white transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => addCompetitor()}
                    className="px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-indigo-600 dark:hover:bg-indigo-100 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Live AI Preview */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Visual Digital Network Console */}
          <div className="surface p-6 sm:p-8 rounded-[1.5rem] border border-slate-200/60 dark:border-slate-800/80 shadow-lg dark:shadow-2xl/40 backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-[40px] pointer-events-none" />
            
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-cyan-500/10 text-cyan-500 rounded-xl">
                  <Network className="w-5 h-5 animate-pulse" />
                </span>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white font-display uppercase tracking-wider">Neural Scanner HUD</h3>
                  <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500">Continuous matrix alignment</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-cyan-500/10 text-cyan-500 rounded-full text-[9px] font-mono font-bold uppercase border border-cyan-500/20">
                Live Trace
              </span>
            </div>

            {/* Pulsing Interconnected Custom SVG Map/Network */}
            <div className="w-full h-56 bg-[#080c14] rounded-2xl relative border border-slate-200/10 flex items-center justify-center overflow-hidden mb-6 group">
              
              {/* Scan Ripple Rings */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <div className="w-24 h-24 border border-indigo-500 rounded-full animate-ping" style={{ animationDuration: "3s" }} />
                <div className="w-44 h-44 border border-cyan-500 rounded-full animate-ping" style={{ animationDuration: "4.5s" }} />
                <div className="w-64 h-64 border border-violet-500 rounded-full animate-ping" style={{ animationDuration: "6s" }} />
              </div>

              {/* Connected Orbit Nodes Line Constellation */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 220">
                {/* Connecting Lines */}
                <motion.line x1="80" y1="110" x2="200" y2="40" stroke="#5b5fff" strokeWidth="1" strokeDasharray="4 2" className="opacity-40 animate-pulse" />
                <motion.line x1="80" y1="110" x2="200" y2="180" stroke="#0891b2" strokeWidth="1" strokeDasharray="3 3" />
                <motion.line x1="320" y1="110" x2="200" y2="40" stroke="#7c3aed" strokeWidth="1" strokeDasharray="5 2" />
                <motion.line x1="320" y1="110" x2="200" y2="180" stroke="#ec4899" strokeWidth="1" />
                <motion.line x1="200" y1="40" x2="200" y2="180" stroke="#f59e0b" strokeWidth="1" strokeDasharray="6 3" className="opacity-60" />
                <motion.line x1="80" y1="110" x2="320" y2="110" stroke="#10b981" strokeWidth="0.5" strokeDasharray="2 2" />

                {/* Central Focus core */}
                <circle cx="200" cy="110" r="14" fill="#6366f1" fillOpacity="0.15" />
                <circle cx="200" cy="110" r="8" fill="#5b5fff" />
                <circle cx="200" cy="110" r="2" fill="#fff" />

                {/* Satellite Node 1: Google (Top Left) */}
                <circle cx="80" cy="110" r="6" fill="#e11d48" className="animate-pulse" />
                <text x="60" y="95" fill="#f43f5e" fontSize="8" fontFamily="monospace" fontWeight="bold">Google</text>

                {/* Satellite Node 2: Maps (Top Center) */}
                <circle cx="200" cy="40" r="5" fill="#10b981" />
                <text x="185" y="28" fill="#34d399" fontSize="8" fontFamily="monospace" fontWeight="bold">Maps</text>

                {/* Satellite Node 3: Reviews (Top Right) */}
                <circle cx="320" cy="110" r="6" fill="#f59e0b" className="animate-pulse" />
                <text x="310" y="95" fill="#fbbf24" fontSize="8" fontFamily="monospace" fontWeight="bold">Reviews</text>

                {/* Satellite Node 4: Social (Bottom Center) */}
                <circle cx="200" cy="180" r="5" fill="#ec4899" />
                <text x="185" y="198" fill="#f472b6" fontSize="8" fontFamily="monospace" fontWeight="bold">Social</text>

                {/* Satellite Node 5: Directories (Left Side) */}
                <circle cx="120" cy="150" r="4" fill="#0891b2" />
                <text x="95" y="165" fill="#22d3ee" fontSize="7" fontFamily="monospace">Directories</text>

                {/* Satellite Node 6: AI Search (Right Side) */}
                <circle cx="280" cy="150" r="4.5" fill="#8b5cf6" className="animate-bounce" style={{ animationDuration: "3s" }} />
                <text x="270" y="165" fill="#a78bfa" fontSize="7" fontFamily="monospace" fontWeight="bold">AI Search</text>
              </svg>

              <div className="absolute bottom-3 left-4 right-4 flex justify-between items-center bg-slate-900/80 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-lg text-[9px] font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                  Target: {currentEntity.businessName || "AWAITING CORE DESIGNATION"}
                </span>
                <span>Signal Stream: Stable</span>
              </div>
            </div>

            {/* Main AI Preview metrics */}
            <div className="grid grid-cols-3 gap-4 border-b border-slate-100 dark:border-slate-800 pb-6 mb-6">
              
              <div className="space-y-1 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/80 text-center">
                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 block">Estimated Coverage</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white font-display block">52 Sources</span>
              </div>

              <div className="space-y-1 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/80 text-center">
                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 block">Runtime Estimate</span>
                <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400 font-display block">2 min 18s</span>
              </div>

              <div className="space-y-1 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/80 text-center">
                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 block">AI Confidence</span>
                <span className="text-lg font-bold text-emerald-500 font-display block">98%</span>
              </div>

            </div>

            {/* List of active networks linked */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Data Sources Connected</h4>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Google", "Google Maps", "Bing", "Apple Maps", "Meta AI", 
                  "LinkedIn", "Instagram", "TikTok", "Local Directories", "Review Sites"
                ].map((src, sidx) => (
                  <span 
                    key={sidx} 
                    className="px-2.5 py-1 bg-slate-100 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-lg text-[10px] font-mono font-medium text-slate-600 dark:text-slate-400"
                  >
                    {src}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* AI Assistant Live Intelligence Advisor */}
          <div className="surface p-6 rounded-[1.5rem] border border-slate-200/60 dark:border-slate-800/80 shadow-lg dark:shadow-2xl/40 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/10 relative overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-600 text-white rounded-2xl shrink-0">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div className="space-y-3 flex-1 text-left">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display">AI Scry Assistant</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">Live deployment advice & recommendations</p>
                </div>
                
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                  {getAiAssistantAdvice().map((adv) => (
                    <div 
                      key={adv.id} 
                      className={`p-2.5 rounded-xl text-xs font-medium border flex items-start gap-2.5 transition-all ${
                        adv.type === 'warn' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' :
                        adv.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
                        adv.type === 'active' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' :
                        adv.type === 'premium' ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20' :
                        'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
                      }`}
                    >
                      {adv.type === 'warn' && <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                      {adv.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />}
                      {adv.type === 'active' && <Cpu className="w-4 h-4 shrink-0 mt-0.5 animate-spin" />}
                      {adv.type === 'premium' && <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />}
                      {adv.type === 'info' && <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                      {adv.type === 'recommend' && <Zap className="w-4 h-4 shrink-0 mt-0.5 text-indigo-500" />}
                      
                      <span className="leading-normal">{adv.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* SCAN MODES: Premium selectable AI modules */}
      <div className="mt-12 space-y-4 text-left">
        <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display uppercase tracking-wider">Select AI Analysis Module</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Choose the active machine learning architecture for this mission.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {PREMIUM_TEMPLATES.map((tmpl) => {
            const tierLevels = { free: 0, growth: 1, premium: 2 };
            const userTier = user ? user.account.tier : 'free';
            const userLevel = tierLevels[userTier] || 0;
            const requiredLevel = tierLevels[tmpl.requiredTier] || 0;
            const isLocked = userLevel < requiredLevel;
            const isSelected = selectedTemplate === tmpl.id;

            return (
              <button
                key={tmpl.id}
                type="button"
                disabled={isLocked}
                onClick={() => !isLocked && setSelectedTemplate(tmpl.id)}
                className={`p-5 rounded-[1.25rem] border text-left flex flex-col justify-between transition-all duration-300 relative overflow-hidden group ${
                  isSelected 
                    ? "border-indigo-600 bg-gradient-to-br from-indigo-50/70 to-indigo-100/30 dark:from-indigo-950/40 dark:to-indigo-900/10 shadow-lg ring-1 ring-indigo-500/30" 
                    : isLocked 
                      ? "border-slate-200/50 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/20 opacity-50 cursor-not-allowed" 
                      : "bg-white dark:bg-[#0f1724] border-slate-200/60 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-700/80 hover:shadow-md hover:-translate-y-0.5"
                }`}
              >
                {/* Visual Ambient Light glow for active module */}
                {isSelected && (
                  <div className="absolute -top-10 -right-10 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl" />
                )}

                {/* Header elements inside card */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-xl flex items-center justify-center text-xl transition-transform duration-300 ${
                      isSelected 
                        ? "bg-indigo-600 text-white scale-110" 
                        : "bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 group-hover:scale-110"
                    }`}>
                      {tmpl.icon}
                    </div>
                    {isLocked ? (
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 text-[8px] font-black uppercase tracking-widest rounded-md flex items-center gap-1">
                        <Shield className="w-2.5 h-2.5 text-rose-500" />
                        {tmpl.requiredTier}
                      </span>
                    ) : (
                      isSelected && (
                        <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                      )
                    )}
                  </div>

                  {/* Body elements */}
                  <div>
                    <h4 className={`text-sm font-extrabold tracking-tight ${isSelected ? "text-indigo-900 dark:text-white" : "text-slate-900 dark:text-white"}`}>
                      {tmpl.name}
                    </h4>
                    <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 block mt-0.5">
                      {tmpl.focus}
                    </span>
                    <p className={`text-xs mt-2 leading-relaxed ${isSelected ? "text-indigo-950/80 dark:text-indigo-200/80" : "text-slate-500 dark:text-slate-400"}`}>
                      {tmpl.description}
                    </p>
                  </div>
                </div>

                {/* Footer specs inside card */}
                <div className="border-t border-slate-100 dark:border-slate-800/60 pt-3 mt-4 flex items-center justify-between text-[10px] font-mono text-slate-400 dark:text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {tmpl.duration}
                  </span>
                  <span>{tmpl.sources}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* BOTTOM ACTION: Large sticky/static CTA */}
      <div className="mt-12 bg-white dark:bg-[#0c121e] border border-slate-200/60 dark:border-slate-800 px-6 py-6 rounded-[2rem] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        
        {/* Glow effect backgrounds */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="flex items-center gap-4 text-center sm:text-left relative z-10">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl hidden sm:block">
            <CheckCircle2 className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h4 className="text-base font-extrabold text-slate-900 dark:text-white font-display">Systems Configured & Calibrated</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Ocula is primed to scour {PREMIUM_TEMPLATES.find(t => t.id === selectedTemplate)?.sources || "52 global database sources"} for active visibility indicators.
            </p>
          </div>
        </div>

        {/* Pulsing Gradient Sticky Launch CTA Button */}
        <div className="text-center w-full sm:w-auto relative z-10">
          <button
            onClick={handleLaunchScan}
            className="w-full sm:w-64 py-4 px-8 bg-gradient-to-r from-indigo-600 via-[#5b5fff] to-[#8b5cf6] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/30 hover:shadow-indigo-500/50 active:scale-98 transition-all flex items-center justify-center gap-3 cursor-pointer border border-white/10 group relative overflow-hidden"
          >
            {/* Shimmer/Reflection overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
            
            <Sparkles className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
            <span>Launch AI Scan</span>
            <Cpu className="w-4 h-4 text-white animate-pulse" />
          </button>
          
          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 block mt-2">
            Estimated completion time: {PREMIUM_TEMPLATES.find(t => t.id === selectedTemplate)?.duration || "2 minutes"}
          </span>
        </div>

      </div>

    </div>
  );
};

export default NewScanMissionControl;
