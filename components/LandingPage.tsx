
import React, { useState } from 'react';
import OculaLogo from './OculaLogo';
import BusinessNameInput from './BusinessNameInput';
import { motion } from 'framer-motion';
import { Scan, BarChart3, Globe, ArrowRight, ShieldCheck, Zap, Target, Activity, Users } from 'lucide-react';
import { INDUSTRIES, COMPANY_SIZES } from '../src/constants/industries';

interface LandingPageProps {
  user: any;
  onStartAudit: (businessName?: string, industry?: string, companySize?: string) => void;
  onLogin: () => void;
  onViewPricing: () => void;
  onGoToDashboard: () => void;
  onViewLegal?: () => void;
  onGiveFeedback?: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ user, onStartAudit, onLogin, onViewPricing, onGoToDashboard, onViewLegal, onGiveFeedback }) => {
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');

  const handleStartScan = (e: React.FormEvent) => {
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

  return (
    <div className="bg-slate-50 dark:bg-[#050505] overflow-hidden selection:bg-indigo-500/30 transition-colors duration-300 font-sans min-h-screen">
      
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-12 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <OculaLogo className="w-6 h-6 text-slate-900 dark:text-white" />
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-display font-bold tracking-tighter text-slate-900 dark:text-white">ocula</span>
              <span className="text-[9px] font-black bg-indigo-600/10 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded uppercase tracking-widest">AI</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <button onClick={onGoToDashboard} className="btn-primary btn-sm font-mono">Dashboard</button>
            ) : (
              <>
                <button onClick={onLogin} className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">Log in</button>
                <button onClick={() => onStartAudit()} className="btn-primary btn-sm font-mono">Get Started</button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative min-h-screen pt-32 pb-20 px-4 sm:px-12 flex items-center dot-grid">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
           <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-indigo-500/5 rounded-full blur-[120px]"></div>
           <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10 w-full">
          {/* Left Hero Content */}
          <div className="flex-1 space-y-10 text-center lg:text-left">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-3 px-3 py-1.5 rounded-lg bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-md shadow-sm"
            >
              <div className="relative flex h-2 w-2">
                <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></div>
                <div className="relative inline-flex rounded-full h-2 w-2 bg-indigo-400"></div>
              </div>
              <span className="section-label mb-0 leading-none">Autonomous AI Engine // Active</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl sm:text-7xl lg:text-9xl font-display font-extrabold tracking-tight leading-[0.85] text-slate-900 dark:text-white"
            >
              AI-Powered <br />
              <span className="text-glow">Local Market</span> <br />
              Dominance.
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg sm:text-xl text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              Deep cognitive mapping and real-time local search intelligence. Ocula puts advanced intelligence at the helm of your digital authority. <br className="hidden sm:block" />
              <span className="text-slate-900 dark:text-white font-bold decoration-indigo-500/30 decoration-4 underline-offset-4 underline">AI Mapping. Core AI Analysis. Market Dominance.</span>
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="pt-4 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              {user ? (
                <button 
                  onClick={onGoToDashboard}
                  className="btn-base bg-indigo-600 text-white btn-lg font-mono shadow-xl hover:shadow-2xl group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    Go to Dashboard <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              ) : (
                <button 
                  onClick={() => onStartAudit()}
                  className="btn-primary btn-lg font-mono group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    Launch AI Scan <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                </button>
              )}
              
              <button 
                onClick={onViewPricing}
                className="btn-base bg-transparent border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white btn-lg font-mono hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                View Protocols
              </button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="pt-8 flex items-center justify-center lg:justify-start gap-4 opacity-40 grayscale hover:grayscale-0 transition-all duration-500"
            >
              {['Google', 'Meta', 'Yelp', 'Bing'].map((brand) => (
                <span key={brand} className="text-lg font-display font-bold text-slate-400 dark:text-slate-600">{brand}</span>
              ))}
            </motion.div>
          </div>

          {/* Right Hero Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-md relative group"
          >
            <div className="surface-tech p-8 relative shadow-2xl shadow-indigo-500/10 border-slate-200/50 dark:border-white/5">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                 <OculaLogo className="w-48 h-48" />
               </div>
               
               <div className="space-y-8 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-center border border-slate-200 dark:border-white/10">
                      <Scan className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="col-header">Visibility Node 01</div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="section-label">AUDIT PROTOCOL</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed">
                      Initialize AI-driven analysis across 50+ digital touchpoints.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 py-2">
                    {[
                      { label: 'GMB', val: '98%' },
                      { label: 'Social', val: '84%' },
                      { label: 'Local', val: '92%' }
                    ].map((stat, i) => (
                      <div key={i} className="p-3 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 group-hover:border-indigo-500/50 transition-colors text-center">
                        <div className="col-header mb-1">{stat.label}</div>
                        <div className="data-value text-xl text-slate-900 dark:text-white">{stat.val}</div>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleStartScan} className="space-y-4" id="scan-initiation-form">
                    <div className="space-y-4">
                      <BusinessNameInput 
                        value={businessName}
                        onChange={setBusinessName}
                        placeholder="Business Name (e.g. Acme Corp)"
                        size="lg"
                        inputClassName="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 font-sans font-bold tracking-tight"
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                           <select 
                            value={industry} 
                            onChange={e => setIndustry(e.target.value)}
                            className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none font-display font-bold text-xs uppercase tracking-widest dark:text-white transition-all appearance-none cursor-pointer"
                          >
                            <option value="" disabled>Industry</option>
                            {INDUSTRIES.map(ind => (
                              <option key={ind.value} value={ind.value}>{ind.label}</option>
                            ))}
                          </select>
                          <Activity className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                        
                        <div className="relative">
                          <select 
                            value={companySize} 
                            onChange={e => setCompanySize(e.target.value)}
                            className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none font-display font-bold text-xs uppercase tracking-widest dark:text-white transition-all appearance-none cursor-pointer"
                          >
                            <option value="" disabled>Size</option>
                            {COMPANY_SIZES.map(size => (
                              <option key={size.value} value={size.value}>{size.label}</option>
                            ))}
                          </select>
                          <Users className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    <button type="submit" className="w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-display font-black uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-3 hover:-translate-y-1 hover:shadow-xl transition-all active:scale-[0.98]">
                       <Zap className="w-5 h-5 fill-current" />
                       Initialize Scan
                    </button>
                  </form>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CORE SERVICES GRID */}
      <section className="py-32 px-4 sm:px-12 bg-slate-50 dark:bg-[#050505] relative border-t border-slate-200 dark:border-slate-900">
        <div className="max-w-7xl mx-auto space-y-20">
           <div className="text-center max-w-3xl mx-auto space-y-4">
              <h2 className="text-2xl sm:text-2xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
                 AI-Driven Visibility Command
              </h2>
              <p className="text-lg text-slate-500 dark:text-slate-400 font-light">
                We automate search, maps, and local authority with next-gen generative AI algorithms.
              </p>
           </div>
           
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Digital Visibility Card */}
              <div className="surface p-6 shadow-sm hover:shadow-md transition-all group">
                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-850 rounded-xl flex items-center justify-center mb-6 border border-slate-200 dark:border-slate-800">
                  <Globe className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    AI Digital Signal
                  </h4>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                    Dominate AI-generated search results, organic feeds, and map coordinates. We optimize your local signal autonomously.
                  </p>
                  <ul className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                    {['Generative SEO Mastery', 'Neural Map Resonance', 'AI-Optimized Socials'].map((item, idx) => (
                      <li key={`${item}-${idx}`} className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-3">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* E-Commerce Card */}
              <div className="surface p-6 shadow-sm hover:shadow-md transition-all group">
                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-850 rounded-xl flex items-center justify-center mb-6 border border-slate-200 dark:border-slate-800">
                  <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    AI Commerce Flow
                  </h4>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                    Convert search intent into pure foot-traffic and orders. Our intelligence engine recommends custom growth paths.
                  </p>
                  <ul className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                    {['Conversational CTR Boost', 'Predictive Stock Velocity', 'AI Pricing Optimization'].map((item, idx) => (
                      <li key={`${item}-${idx}`} className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-3">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Offline Visibility Card */}
              <div className="surface p-6 shadow-sm hover:shadow-md transition-all group">
                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-850 rounded-xl flex items-center justify-center mb-6 border border-slate-200 dark:border-slate-800">
                  <Target className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    AI Spatial Presence
                  </h4>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                    Bridge the gap between virtual AI queries and brick-and-mortar customers. Master geo-fenced coordinates.
                  </p>
                  <ul className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                    {['Automated GBP Audit', 'AI Competitor Displacement', 'Geo-Targeted Conquests'].map((item, idx) => (
                      <li key={`${item}-${idx}`} className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-3">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
           </div>
        </div>
      </section>

      {/* WHY CHOOSE SECTION */}
      <section className="py-32 px-4 sm:px-12 surface border-y border-slate-100 dark:border-slate-900">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
          <div className="flex-1 space-y-10">
            <h2 className="text-3xl font-display sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
              AI Command <br />
              <span className="text-slate-500 dark:text-slate-400">Without The Guesswork.</span>
            </h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              Ocula coordinates advanced machine intelligence and live local database feeds so you always see exactly how, where, and why your business stands out.
            </p>
            
            <div className="space-y-6">
              {[
                { title: 'Proactive AI Sweeps', desc: 'Continuous AI-powered mapping scans your market landscape 24/7.', icon: <ShieldCheck className="w-5 h-5" /> },
                { title: 'Cognitive SWOT Competitor Mapping', desc: 'Identify and dismantle rival presence using autonomous displacement strategies.', icon: <Target className="w-5 h-5" /> },
                { title: 'AI-Generated Growth roadmaps', desc: 'Convert insight to action instantly with personalized steps and automated social blueprints.', icon: <BarChart3 className="w-5 h-5" /> }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700 transition-colors group-hover:bg-slate-100 dark:group-hover:bg-slate-700">
                    {item.icon}
                  </div>
                  <div className="space-y-1 mt-1">
                     <h4 className="text-base font-bold text-slate-900 dark:text-white capitalize">{item.title}</h4>
                     <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex-1 relative">
            <div className="surface p-6 relative">
               <div className="space-y-6">
                  <div className="flex justify-between items-center pb-6 border-b border-slate-200 dark:border-slate-800">
                    <div className="space-y-1">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Visibility Score</p>
                      <p className="text-3xl font-medium text-slate-900 dark:text-white tracking-tight">84<span className="text-xl text-slate-400">/100</span></p>
                    </div>
                    <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-medium uppercase tracking-wider border border-slate-200 dark:border-slate-700">
                      Dominant
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-16 surface p-4 flex items-center gap-4">
                       <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                         <Globe className="w-5 h-5" />
                       </div>
                       <div className="flex-1">
                         <div className="h-2 w-1/3 bg-slate-200 dark:bg-slate-700 rounded-full mb-2"></div>
                         <div className="h-2 w-1/2 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                       </div>
                    </div>
                    <div className="h-16 surface p-4 flex items-center gap-4 opacity-60">
                       <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                         <Target className="w-5 h-5" />
                       </div>
                       <div className="flex-1">
                         <div className="h-2 w-1/4 bg-slate-200 dark:bg-slate-700 rounded-full mb-2"></div>
                         <div className="h-2 w-1/3 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                       </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="py-32 px-4 text-center">
         <div className="max-w-4xl mx-auto bg-slate-900 dark:bg-white rounded-2xl p-8 sm:p-20 relative overflow-hidden border border-slate-800 dark:border-slate-200">
            <div className="relative z-10 space-y-10">
              <div className="space-y-4">
                <h2 className="text-3xl font-display sm:text-4xl font-bold text-white dark:text-slate-900 tracking-tight">Ready to Activate AI Command?</h2>
                <p className="text-lg text-slate-400 dark:text-slate-500 font-medium max-w-xl mx-auto">
                  Join thousands of businesses using Ocula's advanced AI-powered intelligence to dominate their local market visibility.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => onStartAudit()}
                  className="btn-primary btn-xl rounded-xl"
                >
                   Get Started
                </button>
                <button 
                  onClick={handleOpenCalendly}
                  className="btn-base bg-transparent border border-slate-700 dark:border-slate-200 text-white dark:text-slate-900 btn-xl hover:bg-slate-800 dark:hover:bg-slate-100 rounded-xl"
                >
                   Book Demo
                </button>
              </div>
            </div>
         </div>
      </section>

      {/* FOOTER */}
      <footer className="py-16 px-4 sm:px-12 bg-slate-50 dark:bg-[#050505] border-t border-slate-200 dark:border-slate-900">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3 opacity-80">
               <OculaLogo className="w-8 h-8 text-slate-900 dark:text-white" />
               <span className="text-2xl font-display font-bold tracking-tighter text-slate-900 dark:text-white">ocula</span>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600">
              <button onClick={onLogin} className="btn-ghost btn-xs hover:text-indigo-600">Sign In</button>
              <button onClick={onViewPricing} className="btn-ghost btn-xs hover:text-indigo-600">Pricing</button>
              <button onClick={handleOpenCalendly} className="btn-ghost btn-xs hover:text-indigo-600">Consultation</button>
              <button onClick={onViewLegal} className="btn-ghost btn-xs hover:text-indigo-600">Legal</button>
              <button onClick={onGiveFeedback} className="btn-ghost btn-xs hover:text-indigo-600">Feedback</button>
              <button onClick={() => onStartAudit()} className="btn-ghost btn-xs hover:text-indigo-600">Get Started</button>
            </div>
            
            <p className="text-[10px] font-mono text-slate-300 dark:text-slate-700">
              © {new Date().getFullYear()} Ocula Intelligence. All rights reserved.
            </p>
         </div>
      </footer>
    </div>
  );
};

export default LandingPage;
