
import React from 'react';
import { SubscriptionTier } from '../types';
import { TIER_CONFIGS } from '../src/constants/pricing';
import { Check, Zap, Shield } from 'lucide-react';

interface PricingTiersProps {
  currentTier?: SubscriptionTier;
  selectedTier?: SubscriptionTier;
  onSelectTier: (tier: SubscriptionTier) => void;
  showTitle?: boolean;
  currency?: { code: string; rate: number; symbol: string };
}

const PricingTiers: React.FC<PricingTiersProps> = ({ currentTier, selectedTier, onSelectTier, showTitle = true, currency = { code: 'USD', rate: 1, symbol: '$' } }) => {
  const tiers: SubscriptionTier[] = ['free', 'growth', 'premium'];
  const tierOrder = { free: 0, growth: 1, premium: 2 };

  const getTierIcon = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'free': return <Zap className="w-5 h-5 text-indigo-500" />;
      case 'growth': return <Zap className="w-5 h-5 text-emerald-500" />;
      case 'premium': return <Shield className="w-5 h-5 text-amber-500" />;
    }
  };

  const getTierGradient = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'free': return 'from-indigo-500 to-violet-600';
      case 'growth': return 'from-emerald-500 to-teal-600';
      case 'premium': return 'from-amber-500 to-orange-600';
    }
  };

  const formatPrice = (tier: SubscriptionTier) => {
    const config = TIER_CONFIGS[tier];
    if (tier === 'free') return 'Free';
    const converted = Math.round(config.price * currency.rate);
    return `${currency.symbol}${converted.toLocaleString()}`;
  };

  return (
    <div className="w-full">
      {showTitle && (
        <div className="text-center mb-4">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Choose Your Intelligence Level</h3>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Select the power Ocula needs for your mission.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-4 items-stretch">
        {tiers.map((tier) => {
          const config = TIER_CONFIGS[tier];
          
          // Logic for "Current Plan" mode (Upgrade/Downgrade)
          const isCurrent = currentTier === tier;
          const isUpgrade = currentTier ? tierOrder[tier] > tierOrder[currentTier] : false;
          
          // Logic for "Selection" mode (Signup)
          const isSelected = selectedTier === tier;
          
          // Determine active state based on mode
          const isActive = currentTier ? isCurrent : isSelected;

          return (
            <div 
              key={tier}
              onClick={() => !isActive && onSelectTier(tier)}
              className={`
                relative p-4 rounded-xl border transition-all flex flex-col h-full
                ${isActive 
                  ? `border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800 shadow-sm scale-[1.02] z-10 cursor-default` 
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 surface cursor-pointer group hover:scale-[1.01]'}
              `}
            >
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-widest border border-slate-800 dark:border-slate-200 z-20">
                  Current Plan
                </div>
              )}
              
              {!currentTier && isSelected && (
                 <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-widest border border-slate-800 dark:border-slate-200 z-20">
                  Selected
                </div>
              )}

              <div className="mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700`}>
                    {getTierIcon(tier)}
                  </div>
                  <div>
                    <h4 className="font-black text-lg text-slate-900 dark:text-white tracking-tight leading-none">{config.name}</h4>
                    <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mt-1.5">{config.units} Credits (Units) / Month</p>
                  </div>
                </div>
                
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
                    {formatPrice(tier)}
                  </span>
                  <span className="text-xs font-bold text-slate-400">/month</span>
                </div>
              </div>

              <div className="space-y-3 flex-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Features Included:</p>
                {config.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                    <div className="mt-0.5 p-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <Check className="w-2.5 h-2.5 text-slate-900 dark:text-white shrink-0" />
                    </div>
                    <span className="leading-tight">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button 
                  type="button"
                  disabled={isActive}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isActive) onSelectTier(tier);
                  }}
                  className={`w-full btn-sm ${
                    isActive 
                      ? 'btn-ghost text-slate-900 dark:text-white cursor-default' 
                      : currentTier 
                        ? (isUpgrade 
                            ? 'btn-primary' 
                            : 'btn-secondary')
                        : 'btn-secondary'
                  }`}
                >
                  {currentTier 
                    ? (isCurrent ? 'Active Plan' : isUpgrade ? 'Upgrade' : 'Downgrade')
                    : (isSelected ? 'Selected' : 'Select Plan')
                  }
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PricingTiers;
