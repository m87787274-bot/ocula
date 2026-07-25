import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageSquare, Star, ThumbsUp, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { User } from '../types';

interface FeedbackModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ user, isOpen, onClose, isDarkMode }) => {
  const [type, setType] = useState<'feedback' | 'bug' | 'feature'>('feedback');
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSending(false);
    setIsSuccess(true);
    
    setTimeout(() => {
      setIsSuccess(false);
      setMessage('');
      onClose();
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
          >
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Feedback Hub</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Help us evolve Ocula</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {isSuccess ? (
                <div className="py-12 text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                  <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase">Intelligence Received</h4>
                  <p className="text-sm text-slate-500">Your signal has been successfully routed to our engineering team.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'feedback', label: 'Feedback', icon: <ThumbsUp className="w-3.5 h-3.5" />, active: 'bg-indigo-600 border-indigo-600 shadow-indigo-500/20' },
                      { id: 'bug', label: 'Bug', icon: <AlertCircle className="w-3.5 h-3.5" />, active: 'bg-rose-600 border-rose-600 shadow-rose-500/20' },
                      { id: 'feature', label: 'Feature', icon: <Star className="w-3.5 h-3.5" />, active: 'bg-amber-500 border-amber-500 shadow-amber-500/20' }
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setType(t.id as any)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${
                          type === t.id 
                            ? `${t.active} text-white shadow-lg` 
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {t.icon}
                        <span className="text-[9px] font-black uppercase tracking-widest">{t.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rating</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setRating(s)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                            rating >= s ? 'text-amber-500 scale-110' : 'text-slate-200 dark:text-slate-700'
                          }`}
                        >
                          <Star className={`w-6 h-6 ${rating >= s ? 'fill-amber-500' : ''}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Message</label>
                    <textarea
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Describe your experience or report an issue..."
                      className="w-full min-h-[120px] p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-indigo-500 transition-all text-sm font-medium resize-none"
                    />
                  </div>

                  <button
                    disabled={isSending}
                    type="submit"
                    className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all"
                  >
                    {isSending ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Transmitting...</>
                    ) : (
                      <><Send className="w-4 h-4" /> Transmit Signal</>
                    )}
                  </button>

                  {!user && (
                    <p className="text-[9px] text-slate-400 text-center font-bold uppercase tracking-widest">
                      Anonymous Signal — Sign in to link this feedback to your account.
                    </p>
                  )}
                </>
              )}
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default FeedbackModal;
