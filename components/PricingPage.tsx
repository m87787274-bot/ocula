
import React, { useState } from 'react';
import PricingTiers from './PricingTiers';
import { SubscriptionTier } from '../types';
import { useNavigate } from 'react-router-dom';
import OculaLogo from './OculaLogo';
import { ArrowLeft, Globe } from 'lucide-react';
import { SUPPORTED_CURRENCIES, CurrencyConfig } from '../src/constants/pricing';
import PaymentModal from './PaymentModal';

interface PricingPageProps {
  user: any;
  onSelectTier?: (tier: SubscriptionTier) => void;
  onBack?: () => void;
  onLoginRequired?: () => void;
  isDarkMode: boolean;
  currentTier?: SubscriptionTier;
}

const PricingPage: React.FC<PricingPageProps> = ({ user, onSelectTier, onBack, onLoginRequired, isDarkMode, currentTier }) => {
  const navigate = useNavigate();
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyConfig>(SUPPORTED_CURRENCIES[0]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingTier, setPendingTier] = useState<SubscriptionTier | null>(null);

  const handleSelect = (tier: SubscriptionTier) => {
    if (!user) {
      if (onLoginRequired) {
        onLoginRequired();
      }
      return;
    }

    if (tier === 'free') {
      // Free tier doesn't need payment
      if (onSelectTier) {
        onSelectTier(tier);
      }
    } else {
      // Paid tiers require payment
      setPendingTier(tier);
      setShowPaymentModal(true);
    }
  };

  const handlePaymentSuccess = () => {
    if (pendingTier && onSelectTier) {
      onSelectTier(pendingTier);
    }
    setShowPaymentModal(false);
    setPendingTier(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-32 pb-20 px-4 relative">
      {showPaymentModal && pendingTier && (
        <PaymentModal 
          tier={pendingTier} 
          currency={selectedCurrency} 
          onClose={() => setShowPaymentModal(false)} 
          onSuccess={handlePaymentSuccess} 
        />
      )}
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={onBack}
            className="btn-ghost btn-xs text-slate-400 hover:text-blue-600 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </button>

          <div className="relative group">
            <div className="flex items-center gap-2 px-4 py-2 surface shadow-sm cursor-pointer hover:border-blue-500 transition-colors">
              <Globe className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{selectedCurrency.flag} {selectedCurrency.code}</span>
              <select 
                className="absolute inset-0 opacity-0 cursor-pointer"
                value={selectedCurrency.code}
                onChange={(e) => {
                  const currency = SUPPORTED_CURRENCIES.find(c => c.code === e.target.value);
                  if (currency) setSelectedCurrency(currency);
                }}
              >
                {SUPPORTED_CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.flag} {c.name} ({c.code})</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 mb-4">
            <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Pricing & Intelligence Plans</span>
          </div>
          <h1 className="text-2xl sm:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
            Choose Your <span className="text-blue-600">Vision.</span>
          </h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 font-bold max-w-2xl mx-auto">
            From solo entrepreneurs to market dominators, we have a plan to fuel your business intelligence.
          </p>
        </div>

        <div className="mb-20">
          <PricingTiers 
            currentTier={currentTier} 
            onSelectTier={handleSelect} 
            showTitle={false} 
            currency={selectedCurrency}
          />
        </div>

        <div className="surface p-4 border border-slate-100 dark:border-slate-800 shadow-professional relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-3xl rounded-full -mr-32 -mt-32" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="max-w-xl">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-4">Need a Custom Solution?</h2>
              <p className="text-slate-500 dark:text-slate-400 font-bold">
                For large enterprises requiring custom API access, white-label reports, or dedicated analyst support, our Enterprise team is ready to assist.
              </p>
            </div>
            <button 
              onClick={() => window.open("https://calendly.com/teamflokker/new-meeting", "_blank")}
              className="btn-primary btn-lg whitespace-nowrap"
            >
              Contact Enterprise
            </button>
          </div>
        </div>

        <div className="mt-20 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <OculaLogo className="w-8 h-8 opacity-20" />
            <span className="text-xl font-black tracking-tighter text-slate-300">ocula</span>
          </div>
          <p className="text-slate-400 font-bold text-sm">
            All plans include access to our core AI engine and real-time market data scrying.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
