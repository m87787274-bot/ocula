import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, MapPin, Globe, Activity, Users, Plus, X, 
  Sparkles, Shield, Cpu, Zap, CheckCircle2, AlertCircle, 
  Clock, Search, HelpCircle, Layers, ShieldAlert,
  ArrowRight, Apple, Facebook, Linkedin, Instagram, Video, Link
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
    icon: <Layers className="w-4 h-4 text-slate-500" />,
    iconText: "🔍",
    focus: "Overall Online Visibility",
    requiredTier: "free",
    duration: "1m 15s",
    confidence: "99%",
    sources: "52 Sources",
    color: "from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20",
  },
  {
    id: "competitor",
    name: "Competitor Intelligence",
    description: "Deep competitor tracking, search footprint correlation, and aggressive market gap analysis.",
    icon: <Users className="w-4 h-4 text-slate-500" />,
    iconText: "⚔️",
    focus: "Compare Against Competitors",
    requiredTier: "growth",
    duration: "2m 18s",
    confidence: "98%",
    sources: "45 Sources",
    color: "from-rose-500/10 to-orange-500/10 dark:from-rose-500/20 dark:to-orange-500/20",
  },
  {
    id: "market",
    name: "Search Opportunity",
    description: "Discover organic search market gaps, keyword intent patterns, and content growth pathways.",
    icon: <Activity className="w-4 h-4 text-slate-500" />,
    iconText: "📈",
    focus: "Keyword Opportunities",
    requiredTier: "growth",
    duration: "1m 45s",
    confidence: "96%",
    sources: "38 Sources",
    color: "from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20",
  },
  {
    id: "gmb",
    name: "Google Business",
    description: "Deep maps placement audit, citation hygiene, proximity performance, and physical signals sweep.",
    icon: <MapPin className="w-4 h-4 text-slate-500" />,
    iconText: "📍",
    focus: "Maps Optimization",
    requiredTier: "premium",
    duration: "1m 05s",
    confidence: "99%",
    sources: "25 GMB Nodes",
    color: "from-violet-500/10 to-purple-500/10 dark:from-violet-500/20 dark:to-purple-500/20",
  },
  {
    id: "social",
    name: "Social Authority",
    description: "Analyze cross-platform audience engagement, content consistency, and organic footprint sentiment.",
    icon: <Globe className="w-4 h-4 text-slate-500" />,
    iconText: "📱",
    focus: "Audience Analysis",
    requiredTier: "premium",
    duration: "2m 00s",
    confidence: "95%",
    sources: "12 Registries",
    color: "from-pink-500/10 to-rose-500/10 dark:from-pink-500/20 dark:to-rose-500/20",
  },
  {
    id: "sentiment",
    name: "Review Intelligence",
    description: "Map reviews, extract multi-channel customer feedback themes, and cluster semantic sentiments.",
    icon: <Activity className="w-4 h-4 text-slate-500" />,
    iconText: "💬",
    focus: "Sentiment Analysis",
    requiredTier: "premium",
    duration: "1m 50s",
    confidence: "97%",
    sources: "Review Sites",
    color: "from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20",
  },
  {
    id: "ai_readiness",
    name: "AI Search Readiness",
    description: "Audit index representation and citations across ChatGPT, Gemini, Perplexity, Claude, and Bing Copilot.",
    icon: <Cpu className="w-4 h-4 text-slate-500" />,
    iconText: "🤖",
    focus: "LLM & AI Search Audit",
    requiredTier: "premium",
    duration: "2m 30s",
    confidence: "99%",
    sources: "6 LLM Nodes",
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
    competitors: ["OpenAI", "Google DeepMind", "Meta AI"]
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

  // Submit scan trigger
  const handleLaunchScan = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedTmpl = PREMIUM_TEMPLATES.find(t => t.id === selectedTemplate) || PREMIUM_TEMPLATES[0];
    const tierLevels = { free: 0, growth: 1, premium: 2 };
    const userTier = user ? user.account.tier : 'free';
    const userLevel = tierLevels[userTier] || 0;
    const requiredLevel = tierLevels[selectedTmpl.requiredTier] || 0;

    if (userLevel < requiredLevel) {
      return; // Locked for this user
    }

    startScan(e, {
      overrideEntities: [
        {
          ...currentEntity,
        }
      ],
      overrideTemplate: selectedTemplate
    });
  };

  return (
    <div id="new-scan-mission-control-root" className="w-full max-w-6xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      
      {/* Premium Minimal Header */}
      <div id="dashboard-header" className="flex flex-col items-start gap-2 mb-10">
        <div id="breadcrumb-container" className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 dark:text-slate-500">
          <span className="hover:text-[#5b5fff] cursor-pointer transition-colors">Platform</span>
          <span>/</span>
          <span className="font-semibold text-slate-800 dark:text-slate-300">New Scan</span>
        </div>
        <h1 id="main-heading" className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Visibility Scan
        </h1>
        <p id="sub-heading" className="text-[13px] text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed">
          Map, index, and analyze brand visibility markers across key search engines, directories, and LLM providers.
        </p>
      </div>

      {/* Two Column Layout: Apple/Linear HUD */}
      <div id="dashboard-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Input form (60% narrower feel) */}
        <div id="left-column" className="lg:col-span-7 space-y-6">
          <div id="input-parameters-card" className="bg-white dark:bg-[#0A0D14] p-6 rounded-[20px] border border-[#E8EAF2] dark:border-slate-800/80 shadow-sm relative">
            <h2 id="section-title" className="text-[14px] font-semibold text-slate-800 dark:text-slate-200 mb-6 font-mono tracking-tight flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5b5fff]" />
              Configuration
            </h2>

            <form id="launch-scan-form" onSubmit={handleLaunchScan} className="space-y-5">
              
              {/* Business Name Field */}
              <div id="business-field-container" className="space-y-2 relative">
                <label id="business-label" className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  Business Name
                </label>
                <div id="business-input-wrapper" className="relative">
                  <Building2 id="building-icon" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <input
                    id="business-input"
                    type="text"
                    value={currentEntity.businessName}
                    onChange={(e) => {
                      updateEntityField("businessName", e.target.value);
                      setSuggestionQuery(e.target.value);
                      setShowCompanySuggestions(true);
                    }}
                    onFocus={() => setShowCompanySuggestions(true)}
                    placeholder="Search curated templates or enter business name..."
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-50/50 dark:bg-slate-950/40 border border-[#E8EAF2] dark:border-slate-800/60 focus:border-[#5b5fff] focus:ring-1 focus:ring-[#5b5fff] outline-none text-[13px] text-slate-900 dark:text-white transition-all shadow-none"
                    required
                  />
                  {currentEntity.businessName && (
                    <button 
                      id="clear-business-btn"
                      type="button" 
                      onClick={() => {
                        updateEntityField("businessName", "");
                        setSuggestionQuery("");
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400"
                    >
                      <X id="clear-business-icon" className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Company Suggestions Dropdown */}
                <AnimatePresence>
                  {showCompanySuggestions && suggestionQuery.trim() && filteredSuggestions.length > 0 && (
                    <motion.div 
                      id="suggestions-dropdown"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      className="absolute left-0 right-0 mt-1 bg-white dark:bg-[#0E121B] border border-[#E8EAF2] dark:border-slate-800 rounded-xl shadow-lg z-50 overflow-hidden max-h-48 overflow-y-auto"
                    >
                      {filteredSuggestions.map((company, index) => (
                        <button
                          id={`suggestion-item-${index}`}
                          key={index}
                          type="button"
                          onClick={() => selectCompanySuggestion(company)}
                          className="w-full px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center justify-between border-b border-slate-50 dark:border-slate-900/40 last:border-0 transition-colors group"
                        >
                          <div>
                            <div id={`suggestion-name-${index}`} className="font-medium text-[12px] text-slate-800 dark:text-slate-200 group-hover:text-[#5b5fff] transition-colors">{company.name}</div>
                            <div id={`suggestion-meta-${index}`} className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{company.website} • {company.location}</div>
                          </div>
                          <span id={`suggestion-badge-${index}`} className="text-[9px] font-mono px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded">Auto fill</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Company Size Selector (Segmented look) */}
              <div id="company-size-container" className="space-y-2">
                <label id="company-size-label" className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  Company Workforce Size
                </label>
                <div id="company-size-grid" className="grid grid-cols-3 gap-2">
                  {COMPANY_SIZES.map((size) => {
                    const isActive = currentEntity.companySize === size.value;
                    return (
                      <button
                        id={`size-btn-${size.value}`}
                        key={size.value}
                        type="button"
                        onClick={() => updateEntityField("companySize", size.value)}
                        className={`py-2 px-1 text-center rounded-xl border text-[11px] font-medium transition-all duration-200 ${
                          isActive
                            ? "bg-[#5b5fff] text-white border-[#5b5fff] shadow-sm font-semibold"
                            : "bg-slate-50/50 dark:bg-slate-950/20 border-[#E8EAF2] dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                        }`}
                      >
                        {size.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Location (Optional) */}
              <div id="location-field-container" className="space-y-2">
                <label id="location-label" className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  Location <span className="text-[10px] font-normal lowercase italic text-slate-400 dark:text-slate-600">(Optional)</span>
                </label>
                <div id="location-input-wrapper" className="relative">
                  <MapPin id="location-icon" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <input
                    id="location-input"
                    type="text"
                    value={currentEntity.location}
                    onChange={(e) => updateEntityField("location", e.target.value)}
                    placeholder="e.g. San Francisco, USA or Remote"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50/50 dark:bg-slate-950/40 border border-[#E8EAF2] dark:border-slate-800/60 focus:border-[#5b5fff] focus:ring-1 focus:ring-[#5b5fff] outline-none text-[13px] text-slate-900 dark:text-white transition-all shadow-none"
                  />
                </div>
              </div>

              {/* Website (Optional) */}
              <div id="website-field-container" className="space-y-2">
                <label id="website-label" className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  Domain URL <span className="text-[10px] font-normal lowercase italic text-slate-400 dark:text-slate-600">(Optional)</span>
                </label>
                <div id="website-input-wrapper" className="relative">
                  <Globe id="website-icon" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <input
                    id="website-input"
                    type="text"
                    value={currentEntity.website}
                    onChange={(e) => updateEntityField("website", e.target.value)}
                    placeholder="e.g. stripe.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50/50 dark:bg-slate-950/40 border border-[#E8EAF2] dark:border-slate-800/60 focus:border-[#5b5fff] focus:ring-1 focus:ring-[#5b5fff] outline-none text-[13px] text-slate-900 dark:text-white transition-all shadow-none"
                  />
                </div>
              </div>

              {/* Industry Selection */}
              <div id="industry-field-container" className="space-y-2 relative">
                <label id="industry-label" className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  Industry Sector
                </label>
                <div id="industry-input-wrapper" className="relative">
                  <Activity id="industry-icon" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <input
                    id="industry-input"
                    type="text"
                    value={industrySearch || (INDUSTRIES.find(i => i.value === currentEntity.industry)?.label || "")}
                    onChange={(e) => {
                      setIndustrySearch(e.target.value);
                      setShowIndustryDropdown(true);
                      updateEntityField("industry", "");
                    }}
                    onFocus={() => setShowIndustryDropdown(true)}
                    placeholder="Select or search industry sector..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50/50 dark:bg-slate-950/40 border border-[#E8EAF2] dark:border-slate-800/60 focus:border-[#5b5fff] focus:ring-1 focus:ring-[#5b5fff] outline-none text-[13px] text-slate-900 dark:text-white transition-all shadow-none"
                  />
                </div>

                <AnimatePresence>
                  {showIndustryDropdown && (
                    <motion.div
                      id="industry-dropdown"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      className="absolute left-0 right-0 mt-1 bg-white dark:bg-[#0E121B] border border-[#E8EAF2] dark:border-slate-800 rounded-xl shadow-lg z-50 max-h-40 overflow-y-auto"
                    >
                      {filteredIndustries.length > 0 ? (
                        filteredIndustries.map((ind) => (
                          <button
                            id={`industry-item-${ind.value}`}
                            key={ind.value}
                            type="button"
                            onClick={() => {
                              updateEntityField("industry", ind.value);
                              setIndustrySearch("");
                              setShowIndustryDropdown(false);
                            }}
                            className={`w-full px-4 py-2.5 text-left text-[12px] hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center justify-between border-b border-slate-50 dark:border-slate-900/30 last:border-0 transition-colors ${
                              currentEntity.industry === ind.value ? "text-[#5b5fff] font-medium bg-[#5b5fff]/5" : "text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            <span>{ind.label}</span>
                          </button>
                        ))
                      ) : (
                        <div id="no-industry" className="px-4 py-3 text-xs text-slate-400 italic">No industry sector matched.</div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
                {showIndustryDropdown && (
                  <div id="industry-dropdown-overlay" className="fixed inset-0 z-40" onClick={() => setShowIndustryDropdown(false)} />
                )}
              </div>

              {/* Action Button: One large primary button */}
              <div id="action-btn-container" className="pt-2">
                <button
                  id="start-visibility-scan-btn"
                  type="submit"
                  className="w-full py-3.5 px-6 bg-[#5b5fff] hover:bg-[#4a4deb] text-white rounded-xl font-medium text-[13px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-indigo-500/15"
                >
                  <Sparkles id="sparkles-icon" className="w-4 h-4 text-white" />
                  <span>Start Visibility Scan</span>
                </button>
              </div>

            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Visual Constellation HUD */}
        <div id="right-column" className="lg:col-span-5 space-y-6">
          
          {/* Network visualization card */}
          <div id="network-visualizer-card" className="bg-[#0A0D14] p-6 rounded-[20px] border border-slate-900 shadow-xl relative overflow-hidden">
            <div id="visual-header" className="flex items-center justify-between mb-6 border-b border-slate-900 pb-4">
              <span id="visual-title" className="text-[11px] font-mono font-semibold tracking-wider text-slate-400 uppercase">
                Active Constellation Map
              </span>
              <span id="live-trace-badge" className="px-2.5 py-0.5 bg-[#5b5fff]/10 text-[#5b5fff] rounded-full text-[9px] font-mono font-bold border border-[#5b5fff]/20">
                Active Node
              </span>
            </div>

            {/* Premium Network Visualization */}
            <div id="canvas-container" className="w-full h-52 bg-[#06080F] rounded-2xl relative border border-slate-900 flex items-center justify-center overflow-hidden mb-6 group">
              
              {/* Soft Pulsing Ambient Rays */}
              <div id="pulse-layer" className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <div id="pulse-circle-1" className="w-20 h-20 border border-[#5b5fff]/30 rounded-full animate-ping" style={{ animationDuration: "3.5s" }} />
                <div id="pulse-circle-2" className="w-40 h-40 border border-[#5b5fff]/20 rounded-full animate-ping" style={{ animationDuration: "5s" }} />
              </div>

              {/* Minimal SVG Constellation */}
              <svg id="constellation-svg" className="absolute inset-0 w-full h-full" viewBox="0 0 320 180">
                {/* Connection lines from central node */}
                <line id="line-google" x1="160" y1="90" x2="80" y2="45" stroke="#334155" strokeWidth="0.75" />
                <line id="line-maps" x1="160" y1="90" x2="240" y2="45" stroke="#334155" strokeWidth="0.75" />
                <line id="line-reviews" x1="160" y1="90" x2="80" y2="135" stroke="#334155" strokeWidth="0.75" />
                <line id="line-directories" x1="160" y1="90" x2="240" y2="135" stroke="#334155" strokeWidth="0.75" />

                {/* Animated moving pulses on lines */}
                <circle id="pulse-node-1" r="2" fill="#5b5fff">
                  <animateMotion dur="2.8s" repeatCount="indefinite" path="M 160 90 L 80 45" />
                </circle>
                <circle id="pulse-node-2" r="2" fill="#5b5fff">
                  <animateMotion dur="3.2s" repeatCount="indefinite" path="M 160 90 L 240 45" />
                </circle>
                <circle id="pulse-node-3" r="2" fill="#5b5fff">
                  <animateMotion dur="2.4s" repeatCount="indefinite" path="M 160 90 L 80 135" />
                </circle>
                <circle id="pulse-node-4" r="2" fill="#5b5fff">
                  <animateMotion dur="3s" repeatCount="indefinite" path="M 160 90 L 240 135" />
                </circle>

                {/* Satellite Node 1: Google */}
                <g id="node-g-google" className="group/node cursor-pointer">
                  <circle cx="80" cy="45" r="4" fill="#64748B" className="group-hover/node:fill-[#5b5fff] transition-colors" />
                  <text id="node-lbl-google" x="80" y="30" textAnchor="middle" fill="#94A3B8" fontSize="8" fontFamily="monospace" className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">Google</text>
                </g>

                {/* Satellite Node 2: Maps */}
                <g id="node-g-maps" className="group/node cursor-pointer">
                  <circle cx="240" cy="45" r="4" fill="#64748B" className="group-hover/node:fill-[#5b5fff] transition-colors" />
                  <text id="node-lbl-maps" x="240" y="30" textAnchor="middle" fill="#94A3B8" fontSize="8" fontFamily="monospace" className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">Maps</text>
                </g>

                {/* Satellite Node 3: Reviews */}
                <g id="node-g-reviews" className="group/node cursor-pointer">
                  <circle cx="80" cy="135" r="4" fill="#64748B" className="group-hover/node:fill-[#5b5fff] transition-colors" />
                  <text id="node-lbl-reviews" x="80" y="152" textAnchor="middle" fill="#94A3B8" fontSize="8" fontFamily="monospace" className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">Reviews</text>
                </g>

                {/* Satellite Node 4: Directories */}
                <g id="node-g-directories" className="group/node cursor-pointer">
                  <circle cx="240" cy="135" r="4" fill="#64748B" className="group-hover/node:fill-[#5b5fff] transition-colors" />
                  <text id="node-lbl-directories" x="240" y="152" textAnchor="middle" fill="#94A3B8" fontSize="8" fontFamily="monospace" className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">Directories</text>
                </g>

                {/* Central Center node: Glowing Focus Core */}
                <circle id="core-outer-ring" cx="160" cy="90" r="12" fill="#5b5fff" fillOpacity="0.1" />
                <circle id="core-inner-ring" cx="160" cy="90" r="6" fill="#5b5fff" />
                <circle id="core-dot" cx="160" cy="90" r="1.5" fill="#fff" />
              </svg>

              <div id="hint-hud" className="absolute bottom-3 left-4 right-4 flex justify-between items-center text-[9px] font-mono text-slate-500">
                <span id="hint-target" className="truncate max-w-[150px]">Target: {currentEntity.businessName || "No active business"}</span>
                <span id="hover-instruction" className="text-[8px] tracking-wider uppercase text-slate-600">Hover nodes to reveal</span>
              </div>
            </div>

            {/* Three clean metric cards: Sources, Estimated Time, Confidence */}
            <div id="metrics-horizontal-grid" className="grid grid-cols-3 gap-3">
              
              <div id="metric-card-sources" className="bg-[#0e121b] p-3.5 rounded-xl border border-slate-900 text-center flex flex-col justify-center items-center gap-1">
                <Layers id="sources-icon" className="w-3.5 h-3.5 text-slate-500" />
                <span id="sources-val" className="text-xl font-semibold text-white tracking-tight mt-1">52</span>
                <span id="sources-lbl" className="text-[9px] text-slate-500 font-mono tracking-wider uppercase">Sources</span>
              </div>

              <div id="metric-card-time" className="bg-[#0e121b] p-3.5 rounded-xl border border-slate-900 text-center flex flex-col justify-center items-center gap-1">
                <Clock id="time-icon" className="w-3.5 h-3.5 text-slate-500" />
                <span id="time-val" className="text-xl font-semibold text-white tracking-tight mt-1">2m 18s</span>
                <span id="time-lbl" className="text-[9px] text-slate-500 font-mono tracking-wider uppercase">Est. Time</span>
              </div>

              <div id="metric-card-confidence" className="bg-[#0e121b] p-3.5 rounded-xl border border-slate-900 text-center flex flex-col justify-center items-center gap-1">
                <CheckCircle2 id="confidence-icon" className="w-3.5 h-3.5 text-slate-500" />
                <span id="confidence-val" className="text-xl font-semibold text-white tracking-tight mt-1">98%</span>
                <span id="confidence-lbl" className="text-[9px] text-slate-500 font-mono tracking-wider uppercase">Confidence</span>
              </div>

            </div>

          </div>

          {/* Premium Connected Sources Panel */}
          <div id="connected-sources-panel" className="bg-white dark:bg-[#0A0D14] p-6 rounded-3xl border border-[#E8EAF2] dark:border-slate-800/80 shadow-sm relative overflow-hidden">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                  <Link className="w-5 h-5" />
                </div>
                <div>
                  <h4 id="connected-sources-title" className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                    Connected Sources
                  </h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    52 channels indexed
                  </p>
                </div>
              </div>
            </div>
            
            <div id="sources-icon-buttons" className="grid grid-cols-4 gap-4">
              {[
                { 
                  name: "Google", 
                  desc: "Core Search", 
                  icon: (
                    <svg viewBox="0 0 24 24" className="w-8 h-8">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  )
                },
                { 
                  name: "Maps", 
                  desc: "Map Pack", 
                  icon: (
                    <svg viewBox="0 0 24 24" className="w-8 h-8">
                      <path d="M12.5 2C8.3 2 4.9 5.4 4.9 9.6c0 1.8.6 3.4 1.7 4.7L12.5 22l5.9-7.7c1.1-1.3 1.7-2.9 1.7-4.7C20.1 5.4 16.7 2 12.5 2zm0 10.8c-1.8 0-3.2-1.4-3.2-3.2s1.4-3.2 3.2-3.2s3.2 1.4 3.2 3.2s-1.4 3.2-3.2 3.2z" fill="#EA4335" />
                      <path d="M12.5 2c-4.2 0-7.6 3.4-7.6 7.6c0 1.8.6 3.4 1.7 4.7l5.9 7.7V2z" fill="#4285F4" />
                      <path d="M12.5 22s1.8-2.4 3.5-4.6c1.1-1.3 1.7-2.9 1.7-4.7c0-4.2-3.4-7.6-7.6-7.6v20.1z" fill="#34A853" />
                      <path d="M12.5 15.4c-3.2 0-5.8-2.6-5.8-5.8c0-1.8.8-3.4 2.1-4.5L12.5 9.7v5.7z" fill="#FBBC05" />
                      <circle cx="12.5" cy="9.6" r="3.2" fill="#1A73E8" />
                      <circle cx="12.5" cy="9.6" r="1.5" fill="#FFF" />
                    </svg>
                  )
                },
                { 
                  name: "Bing", 
                  desc: "Microsoft Network", 
                  icon: (
                    <svg viewBox="0 0 128 128" className="w-8 h-8">
                      <path d="M22.5 11l41 14.8V111L22.5 86.8V11z" fill="#0078d4" />
                      <path d="M63.5 25.8l42-14.8v75.8L63.5 111V25.8z" fill="#00a4ef" />
                      <path d="M63.5 111l42-24.2V61.5L63.5 86.2V111z" fill="#005a9e" />
                    </svg>
                  )
                },
                { 
                  name: "Apple", 
                  desc: "Apple Maps", 
                  icon: (
                    <svg viewBox="0 0 170 170" className="w-8 h-8" fill="currentColor">
                      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.13-1.93-14.37-6.23-3.41-2.87-7.23-7.58-11.47-14.12-7.85-12.12-14.07-25.75-18.66-40.93-4.59-15.17-6.88-29.35-6.88-42.53 0-14.83 3.65-26.6 10.95-35.31 7.3-8.71 16.32-13.11 27.06-13.22 5.56 0 11.45 1.54 17.67 4.64 6.22 3.1 10.45 4.65 12.69 4.65 1.78 0 6.07-1.54 12.87-4.65 6.8-3.1 12.44-4.54 16.92-4.3 11.8.47 21.05 4.79 27.76 12.95 6.7 8.16 10 18.27 9.87 30.34-1.41 10.51-6.13 19.38-14.17 26.6-8.04 7.23-17.21 11.22-27.53 11.96 1.48 5.64 4.02 11.48 7.6 17.51 3.58 6.03 7.02 10.74 10.33 14.12zM119.22 32.22c0-7.3 2.61-13.88 7.82-19.74 5.21-5.86 11.45-9.13 18.72-9.8 1.4 7.74-1.12 14.8-7.56 21.17-6.44 6.37-13.06 9.61-18.98 9.72-.11-1.35-.11-2.45-.11-3.6z" className="text-slate-900 dark:text-white" />
                    </svg>
                  )
                },
                { 
                  name: "Meta", 
                  desc: "Local Pages", 
                  icon: (
                    <svg viewBox="0 0 24 24" className="w-8 h-8">
                      <path d="M16.5 6c-2.3 0-4.3 1.3-5.5 3.3C9.8 7.3 7.8 6 5.5 6C2.5 6 0 8.5 0 11.5S2.5 17 5.5 17c2.3 0 4.3-1.3 5.5-3.3c1.2 2 3.2 3.3 5.5 3.3c3 0 5.5-2.5 5.5-5.5S19.5 6 16.5 6zm-11 8.5c-1.7 0-3-1.3-3-3s1.3-3 3-3s3 1.3 3 3s-1.3 3-3 3zm11 0c-1.7 0-3-1.3-3-3s1.3-3 3-3s3 1.3 3 3s-1.3 3-3 3z" fill="#0064E0"/>
                    </svg>
                  )
                },
                { 
                  name: "LinkedIn", 
                  desc: "B2B Signals", 
                  icon: (
                    <svg viewBox="0 0 24 24" className="w-8 h-8">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" fill="#0077B5" />
                    </svg>
                  )
                },
                { 
                  name: "Instagram", 
                  desc: "Social Signals", 
                  icon: (
                    <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none">
                      <defs>
                        <radialGradient id="ig-grad" cx="20%" cy="110%" r="130%" fx="20%" fy="110%">
                          <stop offset="0" stopColor="#FED373" />
                          <stop offset="0.12" stopColor="#F15245" />
                          <stop offset="0.3" stopColor="#D92E7F" />
                          <stop offset="0.5" stopColor="#9B36B7" />
                          <stop offset="0.75" stopColor="#515ECF" />
                        </radialGradient>
                      </defs>
                      <rect width="20" height="20" x="2" y="2" rx="5.5" stroke="url(#ig-grad)" strokeWidth="2.2" />
                      <circle cx="12" cy="12" r="4.5" stroke="url(#ig-grad)" strokeWidth="2.2" />
                      <circle cx="17.5" cy="6.5" r="1.25" fill="url(#ig-grad)" />
                    </svg>
                  )
                },
                { 
                  name: "TikTok", 
                  desc: "Video Search", 
                  icon: (
                    <svg viewBox="0 0 24 24" className="w-8 h-8">
                      <path d="M12.5 3v11.5c0 1.9-1.6 3.5-3.5 3.5S5.5 16.4 5.5 14.5s1.6-3.5 3.5-3.5c.5 0 1 .1 1.4.3V7.1C9.6 7 8.8 7 8 7c-4.4 0-8 3.6-8 8s3.6 8 8 8s8-3.6 8-8V8.5c1.5 1.1 3.4 1.7 5.5 1.7V6.1c-1.6 0-3.1-.6-4.2-1.6c-.6-.6-1.1-1.3-1.4-2.1l-1.4.9z" fill="currentColor" className="text-slate-900 dark:text-white" />
                    </svg>
                  )
                }
              ].map((src, idx) => (
                <div 
                  id={`source-item-${src.name.toLowerCase().replace(' ', '-')}`}
                  key={idx}
                  className="bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-850 border border-slate-100 dark:border-slate-800/60 hover:border-slate-200 dark:hover:border-slate-700 rounded-2xl p-4 text-center transition-all cursor-pointer group flex flex-col items-center justify-center gap-3 shadow-sm hover:shadow-md"
                  title={`${src.name} - ${src.desc}`}
                >
                  <div id={`source-logo-${src.name}`} className="flex items-center justify-center w-10 h-10 group-hover:scale-105 transition-transform duration-200">
                    {src.icon}
                  </div>
                  <div id={`source-symbol-${src.name}`} className="text-slate-700 dark:text-slate-300 font-semibold text-xs tracking-tight whitespace-nowrap">
                    {src.name}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex justify-between items-center">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>52 channels indexed</span>
              </div>
              <button 
                type="button" 
                className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-full text-[11px] font-bold flex items-center gap-1 transition-all"
              >
                <span>+12 more</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* MODULE SELECTION SECTION: Styled super flat and clean */}
      <div id="module-selection-container" className="mt-12 space-y-5 text-left border-t border-[#E8EAF2] dark:border-slate-800/85 pt-10">
        <div id="module-header">
          <h3 id="module-heading" className="text-[14px] font-semibold text-slate-800 dark:text-slate-200 font-mono tracking-tight flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5b5fff]" />
            AI Scan Engine Modules
          </h3>
          <p id="module-description" className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
            Choose the specific AI model behavior and parameters for mapping brand signals.
          </p>
        </div>

        <div id="modules-list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {PREMIUM_TEMPLATES.map((tmpl) => {
            const tierLevels = { free: 0, growth: 1, premium: 2 };
            const userTier = user ? user.account.tier : 'free';
            const userLevel = tierLevels[userTier] || 0;
            const requiredLevel = tierLevels[tmpl.requiredTier] || 0;
            const isLocked = userLevel < requiredLevel;
            const isSelected = selectedTemplate === tmpl.id;

            return (
              <button
                id={`module-card-${tmpl.id}`}
                key={tmpl.id}
                type="button"
                disabled={isLocked}
                onClick={() => !isLocked && setSelectedTemplate(tmpl.id)}
                className={`p-5 rounded-[16px] border text-left flex flex-col justify-between transition-all duration-200 relative group ${
                  isSelected 
                    ? "border-[#5b5fff] bg-white dark:bg-[#0A0D14] ring-1 ring-[#5b5fff]/30 shadow-sm" 
                    : isLocked 
                      ? "border-[#E8EAF2]/50 dark:border-slate-900 bg-slate-50/20 dark:bg-slate-950/10 opacity-40 cursor-not-allowed" 
                      : "bg-white dark:bg-[#0A0D14] border-[#E8EAF2] dark:border-slate-800/80 hover:border-[#5b5fff]/50 hover:shadow-sm"
                }`}
              >
                <div id={`module-body-${tmpl.id}`} className="space-y-3">
                  <div id={`module-top-${tmpl.id}`} className="flex items-center justify-between">
                    <div id={`module-icon-box-${tmpl.id}`} className={`p-2 rounded-lg ${
                      isSelected 
                        ? "bg-[#5b5fff]/10 text-[#5b5fff]" 
                        : "bg-slate-50 dark:bg-slate-900 text-slate-500"
                    }`}>
                      {tmpl.icon}
                    </div>
                    {isLocked ? (
                      <span id={`lock-badge-${tmpl.id}`} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-[#E8EAF2] dark:border-slate-700 text-slate-400 text-[8px] font-mono rounded uppercase flex items-center gap-1">
                        <ShieldAlert id={`lock-icon-${tmpl.id}`} className="w-2.5 h-2.5 text-rose-500" />
                        {tmpl.requiredTier}
                      </span>
                    ) : (
                      isSelected && (
                        <span id={`active-indicator-${tmpl.id}`} className="h-1.5 w-1.5 rounded-full bg-[#5b5fff]" />
                      )
                    )}
                  </div>

                  <div id={`module-content-${tmpl.id}`}>
                    <h4 id={`module-name-${tmpl.id}`} className={`text-[13px] font-semibold tracking-tight ${isSelected ? "text-slate-900 dark:text-white" : "text-slate-800 dark:text-slate-200"}`}>
                      {tmpl.name}
                    </h4>
                    <span id={`module-focus-${tmpl.id}`} className="text-[9px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 block mt-0.5">
                      {tmpl.focus}
                    </span>
                    <p id={`module-desc-${tmpl.id}`} className="text-xs mt-2 text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                      {tmpl.description}
                    </p>
                  </div>
                </div>

                <div id={`module-footer-${tmpl.id}`} className="border-t border-[#E8EAF2]/60 dark:border-slate-900/60 pt-3 mt-4 flex items-center justify-between text-[9px] font-mono text-slate-400">
                  <span id={`module-duration-${tmpl.id}`} className="flex items-center gap-1">
                    <Clock id={`clock-icon-${tmpl.id}`} className="w-3 h-3" /> {tmpl.duration}
                  </span>
                  <span id={`module-sources-${tmpl.id}`}>{tmpl.sources}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default NewScanMissionControl;
