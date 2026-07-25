import { formatErrorMessage } from '../src/lib/errorUtils';
import React, { useState } from 'react';
import { CreditCard, Lock, CheckCircle, AlertCircle, X } from 'lucide-react';
import { SubscriptionTier } from '../types';
import { TIER_CONFIGS, CurrencyConfig } from '../src/constants/pricing';

interface PaymentModalProps {
  tier: SubscriptionTier;
  currency: CurrencyConfig;
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ tier, currency, onClose, onSuccess }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing || success) return;
    setError(null);

    if (isPaystackTier && paystackUrl) {
      window.open(paystackUrl, '_blank');
      onSuccess(); // Update the user account in the demo
      return;
    }

    setIsProcessing(true);

    // Simulate API call
    setTimeout(() => {
      // Basic validation simulation
      if (cardNumber.replace(/\s/g, '').length < 16) {
        setError('Invalid card number');
        setIsProcessing(false);
        return;
      }

      setIsProcessing(false);
      setSuccess(true);
      
      setTimeout(() => {
        onSuccess();
      }, 1500);
    }, 2000);
  };

  const handleCardInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    const formatted = value.replace(/(\d{4})/g, '$1 ').trim();
    setCardNumber(formatted);
  };

  const handleExpiryInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setExpiry(value);
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {isPaystackTier ? (
              <div className="space-y-6 pt-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 text-center">
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                    You are one step away from upgrading to <span className="text-blue-600 dark:text-blue-400">{config.name}</span>. Click the button below to complete your payment securely on Paystack.
                  </p>
                </div>
                <button 
                  type="submit"
                  className="w-full btn-primary btn-lg gap-3"
                >
                  <Lock className="w-4 h-4" />
                  Continue to Paystack
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Card Information</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={cardNumber}
                        onChange={handleCardInput}
                        placeholder="0000 0000 0000 0000"
                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500/20 outline-none font-mono font-bold text-slate-900 dark:text-white transition-all"
                        required
                      />
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expiry</label>
                      <input 
                        type="text" 
                        value={expiry}
                        onChange={handleExpiryInput}
                        placeholder="MM/YY"
                        className="w-full px-4 py-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500/20 outline-none font-mono font-bold text-slate-900 dark:text-white transition-all text-center"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CVC</label>
                      <input 
                        type="text" 
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="123"
                        className="w-full px-4 py-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500/20 outline-none font-mono font-bold text-slate-900 dark:text-white transition-all text-center"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cardholder Name</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="JOHN DOE"
                      className="w-full px-4 py-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500/20 outline-none font-bold text-slate-900 dark:text-white transition-all uppercase"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-rose-500 bg-rose-50 dark:bg-rose-900/20 p-3 rounded-xl text-xs font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={isProcessing}
                  className="w-full btn-primary btn-lg gap-3"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Pay {formattedPrice}
                    </>
                  )}
                </button>
              </>
            )}
          </form>
          
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
