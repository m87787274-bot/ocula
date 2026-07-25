import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, FileText, ChevronLeft, Scale, Gavel, Eye } from 'lucide-react';

type LegalTab = 'terms' | 'privacy';

interface LegalProps {
  onBack: () => void;
  initialTab?: LegalTab;
}

const Legal: React.FC<LegalProps> = ({ onBack, initialTab = 'terms' }) => {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050505] pt-20 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-8 group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-widest">Back to Ocula</span>
        </button>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Sidebar Nav */}
          <div className="w-full md:w-64 shrink-0 space-y-2">
            <button
              onClick={() => setActiveTab('terms')}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${
                activeTab === 'terms' 
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' 
                  : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Gavel className="w-5 h-5" />
              <span className="font-bold text-sm">Terms of Service</span>
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${
                activeTab === 'privacy' 
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' 
                  : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Lock className="w-5 h-5" />
              <span className="font-bold text-sm">Privacy Policy</span>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 md:p-12 shadow-sm min-h-[600px]">
            {activeTab === 'terms' ? (
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl">
                    <Scale className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white m-0">Terms of Service</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest m-0 mt-1">Last Updated: May 2026</p>
                  </div>
                </div>

                <section className="space-y-6 text-slate-600 dark:text-slate-300 leading-relaxed">
                  <p>Welcome to Ocula. By accessing our platform, you agree to these terms. Please read them carefully.</p>
                  
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">1. Services</h3>
                  <p>Ocula provides AI-powered visibility intelligence and SEO monitoring tools. We reserve the right to modify or discontinue any feature at any time.</p>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">2. User Accounts</h3>
                  <p>You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate information when creating an account.</p>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">3. Prohibited Use</h3>
                  <p>You may not use Ocula for any illegal purpose or to violate any laws in your jurisdiction. Automated scraping or reverse engineering of the Ocula platform is strictly prohibited.</p>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">4. Intellectual Property</h3>
                  <p>All content, features, and functionality of Ocula are the exclusive property of our company and its licensors.</p>
                </section>
              </div>
            ) : (
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl">
                    <Eye className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white m-0">Privacy Policy</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest m-0 mt-1">Last Updated: May 2026</p>
                  </div>
                </div>

                <section className="space-y-6 text-slate-600 dark:text-slate-300 leading-relaxed">
                  <p>Your privacy is paramount. This policy explains how we collect, use, and protect your data.</p>
                  
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">1. Information Collection</h3>
                  <p>We collect information you provide directly to us, such as when you create an account, initiate a scan, or contact support.</p>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">2. Use of Information</h3>
                  <p>We use your information to provide, maintain, and improve our services, as well as to develop new features and ensure security. We analyze public digital signals to provide visibility intelligence.</p>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">3. Data Security</h3>
                  <p>We implement industry-standard security measures, including end-to-end encryption for sensitive data, to protect your information from unauthorized access or disclosure.</p>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">4. Third-Party Services</h3>
                  <p>We may use third-party infrastructure providers to host our services. We do not share your private analysis data with third parties except as required to provide the core services you requested.</p>
                </section>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Legal;
