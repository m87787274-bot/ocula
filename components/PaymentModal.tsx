import React, { useState } from 'react';
import { CreditCard, Lock, CheckCircle, X } from 'lucide-react';
import { SubscriptionTier } from '../types';
import { TIER_CONFIGS, CurrencyConfig } from '../src/constants/pricing';

interface PaymentModalProps {
  tier: SubscriptionTier;
  currency: CurrencyConfig;
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ tier, currency, onClose, onSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const config = TIER_CONFIGS[tier];
  const convertedPrice = Math.round(config.price * currency.rate);
  const formattedPrice = `${currency.symbol}${convertedPrice.toLocaleString()}`;

  const PAYSTACK_LINKS = {
    growth: "https://paystack.shop/pay/tsdz3b8449",
    premium: "https://paystack.shop/pay/wpkmxgc7qq"
  };

  const isPaystackTier = tier === 'growth' || tier === 'premium';
  const paystackUrl = isPaystackTier ? PAYSTACK_LINKS[tier as keyof typeof PAYSTACK_LINKS] : null;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isProcessing || success) return;
    setIsProcessing(true);

    // Simulate fast payment gateway API processing
    setTimeout(() => {
      setIsProcessing(false);
      setSuccess(true);
      
      setTimeout(() => {
        onSuccess();
      }, 1200);
    }, 600);
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
        <div className="surface w-full max-w-md rounded-xl p-4 shadow-2xl border-4 border-emerald-500/20 text-center space-y-4">
          <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30 animate-bounce-subtle">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Payment Successful!</h3>
          <p className="text-slate-500 dark:text-slate-400 font-bold">
            Welcome to the <span className="text-emerald-500">{config.name}</span> tier. Your intelligence capabilities have been upgraded.
          </p>
          <button 
            onClick={onSuccess}
            className="w-full btn-primary btn-lg bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 mt-4"
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
      <div className="surface w-full max-w-lg rounded-xl shadow-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden flex flex-col max-h-[90vh]">
        <button 
          onClick={onClose}
          className="btn-icon absolute top-4 right-6 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-4 space-y-4 overflow-y-auto">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <CreditCard className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Secure Checkout</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Powered by {isPaystackTier ? 'Paystack' : 'Stripe'}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Plan Selected</p>
              <p className="text-lg font-black text-slate-900 dark:text-white">{config.name} Tier</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Due</p>
              <p className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tighter">{formattedPrice}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
              <span className="inline-block px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white rounded-full">
                Simulated Payment Mode
              </span>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                Payment gateways are set to quick simulation mode. Upgrade instantly to <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{config.name}</span> with one click.
              </p>
            </div>

            <button 
              type="button"
              onClick={() => handleSubmit()}
              disabled={isProcessing}
              className="w-full btn-primary btn-lg bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 py-4 text-sm font-black tracking-wide flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Simulating Gateway Authorization...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Simulate Successful Payment ({formattedPrice})
                </>
              )}
            </button>

            {isPaystackTier && paystackUrl && (
              <div className="text-center pt-1">
                <a 
                  href={paystackUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-slate-400 hover:text-blue-500 underline"
                >
                  Or test external Paystack link directly
                </a>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400">
            <Lock className="w-3 h-3" />
            <span>Payments are secure and encrypted.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
