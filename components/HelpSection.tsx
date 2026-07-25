
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, 
  ChevronDown, 
  Search, 
  Zap, 
  Target, 
  MessageSquare, 
  BookOpen, 
  Send, 
  X, 
  CheckCircle2, 
  Clock, 
  CheckCircle,
  Bot,
  User as UserIcon,
  ArrowRight,
  LifeBuoy,
  Calendar
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { SupportTicket } from '../types';
import { generateSupportResponse } from '../services/aiService';

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, isOpen, onClick }) => (
  <div 
    className={`border-b border-slate-100 dark:border-slate-800 last:border-0 transition-all duration-300 overflow-hidden ${
      isOpen 
        ? 'bg-indigo-50 dark:bg-indigo-900/30 px-6 rounded-2xl border-transparent my-4 shadow-md ring-1 ring-indigo-500/20' 
        : 'px-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl'
    }`}
  >
    <button
      onClick={onClick}
      className="w-full py-6 flex items-center justify-between text-left group transition-all"
    >
      <span className={`text-lg font-black tracking-tight transition-colors ${isOpen ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}`}>
        {question}
      </span>
      <div className={`p-2 rounded-full transition-colors duration-300 ${isOpen ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'group-hover:bg-slate-200 dark:group-hover:bg-slate-700'}`}>
        <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
      </div>
    </button>
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
        >
          <div className="pb-6 text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            {answer}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

interface HelpSectionProps {
  onRestartTour?: () => void;
}

const HelpSection: React.FC<HelpSectionProps> = ({ onRestartTour }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showContactForm, setShowContactForm] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({ subject: '', message: '' });
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Hello! I'm Ocula AI Support. How can I help you today?" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      const tickets = await storageService.getTickets();
      setTickets(tickets);
    };
    fetchTickets();
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.subject || !contactForm.message) return;
    
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1500));
    const newTickets = await storageService.addTicket(contactForm.subject, contactForm.message);
    if (newTickets) {
      setTickets(newTickets);
    }
    setIsSubmitting(false);
    setIsSubmitted(true);
    setTimeout(() => {
      setShowContactForm(false);
      setIsSubmitted(false);
      setContactForm({ subject: '', message: '' });
    }, 3000);
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsChatLoading(true);

    try {
      const response = await generateSupportResponse(userMessage, chatMessages);
      setChatMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'model', text: "I'm sorry, I encountered an error. Please try again or open a support ticket." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleCloseTicket = async (ticketId: string) => {
    const updated = await storageService.updateTicketStatus(ticketId, 'resolved');
    if (updated) setTickets(updated);
  };

  const faqs = [
    {
      question: "What is a 'Vision Scry'?",
      answer: "A Vision Scry is Ocula's signature deep-scan intelligence report. It uses advanced AI to analyze a business's digital footprint across search engines, social media, and market data to provide a comprehensive visibility score and actionable strategic insights.",
      category: "Core Features"
    },
    {
      question: "How is the Visibility Score calculated?",
      answer: "The score is a weighted synthesis of five key pillars: Google My Business, Social Presence, Brand Authority, Content Strength, and Market Position. We compare your data against industry benchmarks and competitor performance to give you a relative dominance rating.",
      category: "Metrics"
    },
    {
      question: "What are 'Missions'?",
      answer: "Missions are goal-oriented tracking projects. Once you identify a gap in your visibility, you can launch a mission to improve that specific metric. Ocula will monitor your progress and provide tactical updates as you work towards your objective.",
      category: "Strategy"
    },
    {
      question: "Can I compare my business with competitors?",
      answer: "Yes. Use the 'Rival Deep-Dive' template or the comparison tool in your dashboard to benchmark your performance against up to 3 competitors. This reveals exactly where they are outperforming you and where you have the advantage.",
      category: "Competitive Intelligence"
    },
    {
      question: "How do I interpret the 'Resonance' score?",
      answer: "Resonance measures how well your content and social presence are actually engaging your target audience. A high score means your message is being amplified and discussed, while a low score suggests your signals are being lost in the noise.",
      category: "Metrics"
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. Ocula uses enterprise-grade encryption and strictly adheres to privacy standards. We only analyze publicly available digital signals to generate your intelligence reports.",
      category: "Security"
    }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6"
        >
          <HelpCircle className="w-3 h-3" />
          Intelligence Support
        </motion.div>
        <h1 className="text-5xl font-display md:text-6xl font-medium text-slate-900 dark:text-white tracking-tight mb-6">
          How can we help you <span className="text-indigo-600">dominate</span>?
        </h1>
        <p className="text-xl text-slate-500 dark:text-slate-400 font-bold max-w-2xl mx-auto mb-10">
          Everything you need to know about leveraging Ocula's intelligence suite to achieve market clarity.
        </p>

        <div className="relative max-w-xl mx-auto group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="Search for answers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-16 pr-6 py-5 surface rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-lg font-bold placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
        {[
          { icon: Bot, title: "AI Assistant", desc: "Get instant answers from our AI support officer.", color: "bg-emerald-500", shadow: "shadow-emerald-500/20", action: () => setShowChat(true) },
          { icon: Calendar, title: "Book a Meeting", desc: "Schedule a 1-on-1 strategy session with our team.", color: "bg-purple-500", shadow: "shadow-purple-500/20", action: () => window.open("https://calendly.com/teamflokker/new-meeting", "_blank") },
          { icon: MessageSquare, title: "Support Ticket", desc: "Submit a detailed request for our team.", color: "bg-indigo-500", shadow: "shadow-indigo-500/20", action: () => setShowContactForm(true) },
          { icon: Zap, title: "Guided Tour", desc: "Restart the onboarding experience to learn the HUD.", color: "bg-amber-500", shadow: "shadow-amber-500/20", action: onRestartTour || (() => {}) }
        ].map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -5 }}
            onClick={item.action}
            className="p-8 surface rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all cursor-pointer group"
          >
            <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg ${item.shadow}`}>
              <item.icon className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 transition-colors">{item.title}</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-4">{item.desc}</p>
            <div className="flex items-center text-indigo-600 text-sm font-black uppercase tracking-widest">
              Launch <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="surface rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="p-8 md:p-12">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-4">
            <Target className="w-8 h-8 text-indigo-600" />
            Frequently Asked Questions
          </h2>
          
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <FAQItem
                  key={index}
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openIndex === index}
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                />
              ))
            ) : (
              <div className="py-20 text-center">
                <p className="text-slate-400 font-black uppercase tracking-widest">No intelligence found for "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {tickets.length > 0 && (
        <div className="mt-12 surface rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="p-8 md:p-12">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-4">
              <LifeBuoy className="w-8 h-8 text-indigo-600" />
              My Support Tickets
            </h2>
            
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{ticket.subject}</h3>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                      ticket.status === 'open' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      ticket.status === 'in-progress' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' :
                      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    }`}>
                      {ticket.status === 'open' ? <Clock className="w-3 h-3" /> : 
                       ticket.status === 'in-progress' ? <Zap className="w-3 h-3" /> : 
                       <CheckCircle className="w-3 h-3" />}
                      {ticket.status}
                    </div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 font-medium mb-4">{ticket.message}</p>
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>Ticket ID: {ticket.id} • {new Date(ticket.createdAt).toLocaleDateString()}</span>
                    {ticket.status !== 'resolved' && (
                      <button 
                        onClick={() => handleCloseTicket(ticket.id)}
                        className="text-indigo-600 hover:text-indigo-700 font-black uppercase tracking-widest"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mt-20 p-12 bg-slate-900 dark:bg-indigo-950 rounded-[2.5rem] text-center relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-display md:text-4xl font-medium text-white mb-6">Still have questions?</h2>
          <p className="text-indigo-200/70 font-bold mb-10 max-w-xl mx-auto">
            Our intelligence officers are standing by to help you navigate the complex digital landscape.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => window.open("https://calendly.com/teamflokker/new-meeting", "_blank")}
              className="w-full sm:w-auto px-10 py-5 bg-purple-600 text-white rounded-2xl font-black text-lg hover:bg-purple-700 transition-all hover:scale-105 active:scale-95 shadow-2xl flex items-center justify-center gap-3"
            >
              <Calendar className="w-5 h-5" />
              Book Meeting
            </button>
            <button 
              onClick={() => setShowChat(true)}
              className="w-full sm:w-auto px-10 py-5 bg-emerald-500 text-white rounded-2xl font-black text-lg hover:bg-emerald-600 transition-all hover:scale-105 active:scale-95 shadow-2xl flex items-center justify-center gap-3"
            >
              <Bot className="w-5 h-5" />
              Chat with AI
            </button>
            <button 
              onClick={() => setShowContactForm(true)}
              className="w-full sm:w-auto px-10 py-5 bg-white text-slate-900 rounded-2xl font-black text-lg hover:bg-indigo-50 transition-all hover:scale-105 active:scale-95 shadow-2xl flex items-center justify-center gap-3"
            >
              <MessageSquare className="w-5 h-5" />
              Open Ticket
            </button>
          </div>
        </div>
      </div>

      {/* Contact Support Modal */}
      <AnimatePresence>
        {showContactForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-lg surface rounded-3xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-600" />
                  Contact Support
                </h3>
                <button 
                  onClick={() => setShowContactForm(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                {isSubmitted ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-12 flex flex-col items-center text-center"
                  >
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2">Message Sent!</h4>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                      Our intelligence team has received your request and will respond shortly.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Subject</label>
                      <input 
                        type="text" 
                        required
                        value={contactForm.subject}
                        onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white font-medium"
                        placeholder="How can we help?"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Message</label>
                      <textarea 
                        required
                        rows={5}
                        value={contactForm.message}
                        onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white font-medium resize-none"
                        placeholder="Describe your issue or question in detail..."
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={isSubmitting || !contactForm.subject || !contactForm.message}
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Chat Modal */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-2xl h-[600px] surface rounded-3xl flex flex-col overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">Ocula AI Support</h3>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Online</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setShowChat(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {chatMessages.map((msg, idx) => (
                  <div 
                    key={idx}
                    className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
                      msg.role === 'user' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}>
                      {msg.role === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-200 border border-slate-100 dark:border-slate-800 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                      <Bot className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-800">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleChatSubmit} className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <div className="relative">
                  <input 
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask Ocula AI anything..."
                    className="w-full pl-4 pr-12 py-4 surface border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                  <button 
                    type="submit"
                    disabled={!chatInput.trim() || isChatLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HelpSection;
