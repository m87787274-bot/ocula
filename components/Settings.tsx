
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, UserRole, SubscriptionTier } from '../types';
import { storageService } from '../services/storageService';
import { TIER_CONFIGS } from '../src/constants/pricing';
import { INDUSTRIES, COMPANY_SIZES } from '../src/constants/industries';
import { 
  User as UserIcon, 
  Building2, 
  CreditCard, 
  Bell, 
  Shield, 
  Moon, 
  Sun, 
  Check, 
  AlertCircle,
  Save,
  LogOut,
  Globe,
  Target
} from 'lucide-react';

interface SettingsProps {
  user: User;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onUpdateUser: (user: User) => void;
  onLogout: () => void;
  onUpgradePlan?: () => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  user, 
  isDarkMode, 
  onToggleDarkMode, 
  onUpdateUser, 
  onLogout,
  onUpgradePlan 
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'business' | 'subscription' | 'notifications' | 'integrations'>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    avatar: user.avatar || '',
    businessName: user.businessDetails?.name || '',
    industry: user.businessDetails?.industry || 'other',
    companySize: user.businessDetails?.companySize || '1-10',
    website: user.businessDetails?.website || '',
    location: user.businessDetails?.location || '',
    businessGoals: user.businessDetails?.businessGoals || user.businessDetails?.goals || '',
    logo: user.businessDetails?.logo || '',
    brandColor: user.businessDetails?.brandColor || '#6366f1',
    notificationsPush: user.preferences?.notifications.push ?? true,
    notificationsEmail: user.preferences?.notifications.email ?? false,
    notificationsAnomalies: user.preferences?.notifications.anomalies ?? true,
    notificationsMarketUpdates: user.preferences?.notifications.marketUpdates ?? true,
    aiProvider: user.preferences?.aiProvider || 'openai',
  });

  const [apiConfig, setApiConfig] = useState<{
    dataForSeoConfigured?: boolean;
    brightDataConfigured?: boolean;
  }>({});

  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => setApiConfig(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => setSaveSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  const handleSave = async () => {
    setIsSaving(true);
    
    const updatedUser: User = {
      ...user,
      name: formData.name,
      email: formData.email,
      avatar: formData.avatar,
      businessDetails: {
        ...user.businessDetails,
        name: formData.businessName,
        industry: formData.industry,
        companySize: formData.companySize,
        website: formData.website,
        location: formData.location,
        businessGoals: formData.businessGoals,
        logo: formData.logo,
        brandColor: formData.brandColor
      },
      preferences: {
        ...user.preferences,
        notifications: {
          push: formData.notificationsPush,
          email: formData.notificationsEmail,
          anomalies: formData.notificationsAnomalies,
          marketUpdates: formData.notificationsMarketUpdates,
        },
        theme: isDarkMode ? 'dark' : 'light',
        aiProvider: formData.aiProvider as 'openai'
      }
    };

    // Save to storage mediated by onUpdateUser in App.tsx
    onUpdateUser(updatedUser);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSaving(false);
    setSaveSuccess(true);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'business', label: 'Business', icon: Building2 },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'integrations', label: 'Integrations', icon: Globe },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your account preferences and business configuration.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
          
          <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="surface overflow-hidden">
            <div className="p-6 md:p-8">
              {activeTab === 'profile' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-6 mb-8">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-800">
                        <img 
                          src={formData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`} 
                          alt="Avatar" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button className="absolute -bottom-2 -right-2 p-2 surface rounded-lg shadow-md text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors">
                        <UserIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Profile Photo</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Update your avatar to personalize your dashboard.</p>
                      <input 
                        type="text" 
                        value={formData.avatar}
                        onChange={(e) => setFormData({...formData, avatar: e.target.value})}
                        placeholder="Avatar URL"
                        className="mt-2 w-full max-w-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Full Name</label>
                      <input 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email Address</label>
                      <input 
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'business' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Business Name</label>
                      <input 
                        type="text" 
                        value={formData.businessName}
                        onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Industry</label>
                      <select 
                        value={formData.industry}
                        onChange={(e) => setFormData({...formData, industry: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-indigo-500"
                      >
                        {INDUSTRIES.map(ind => (
                          <option key={ind.value} value={ind.value}>{ind.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Custom Business Logo Upload */}
                    <div className="md:col-span-2 p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Business Custom Logo</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Upload your official brand logo to personalize dashboard reports and PDF exports.</p>
                        </div>
                        {formData.logo && (
                          <button 
                            type="button" 
                            onClick={() => setFormData({ ...formData, logo: '' })}
                            className="text-xs font-bold text-rose-500 hover:underline"
                          >
                            Remove Logo
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-4 pt-1">
                        <div 
                          className="w-16 h-16 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden shrink-0"
                          style={{ borderColor: formData.brandColor || '#6366f1' }}
                        >
                          {formData.logo ? (
                            <img src={formData.logo} alt="Business Logo" className="w-full h-full object-cover" />
                          ) : (
                            <Building2 className="w-8 h-8 text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 3 * 1024 * 1024) {
                                  alert("Image file should be under 3MB.");
                                  return;
                                }
                                const reader = new FileReader();
                                reader.onload = () => {
                                  if (typeof reader.result === 'string') {
                                    setFormData(prev => ({ ...prev, logo: reader.result as string }));
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                          />
                          <p className="text-[10px] text-slate-400">Supports PNG, JPG, WebP, SVG. Recommended square or horizontal mark.</p>
                        </div>
                      </div>
                    </div>

                    {/* Brand Primary Color Selection */}
                    <div className="md:col-span-2 p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Brand Primary Color</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Select your primary brand theme color applied across reports, widgets, and key metrics.</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        {[
                          { name: 'Indigo', hex: '#6366f1' },
                          { name: 'Emerald', hex: '#10b981' },
                          { name: 'Cobalt', hex: '#2563eb' },
                          { name: 'Violet', hex: '#8b5cf6' },
                          { name: 'Rose', hex: '#e11d48' },
                          { name: 'Amber', hex: '#d97706' },
                          { name: 'Cyan', hex: '#0891b2' },
                          { name: 'Slate', hex: '#334155' }
                        ].map((color) => (
                          <button
                            key={color.hex}
                            type="button"
                            onClick={() => setFormData({ ...formData, brandColor: color.hex })}
                            className={`w-9 h-9 rounded-xl border-2 transition-all flex items-center justify-center ${
                              formData.brandColor === color.hex ? 'border-white ring-2 ring-indigo-500 scale-105 shadow-md' : 'border-transparent opacity-80 hover:opacity-100'
                            }`}
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                          >
                            {formData.brandColor === color.hex && <Check className="w-4 h-4 text-white" />}
                          </button>
                        ))}
                        <div className="flex items-center gap-2 ml-auto">
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Custom Hex:</span>
                          <input 
                            type="color" 
                            value={formData.brandColor}
                            onChange={(e) => setFormData({ ...formData, brandColor: e.target.value })}
                            className="w-9 h-9 rounded-xl cursor-pointer border border-slate-200 dark:border-slate-700 bg-transparent"
                          />
                          <input 
                            type="text" 
                            value={formData.brandColor}
                            onChange={(e) => setFormData({ ...formData, brandColor: e.target.value })}
                            className="w-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-mono font-bold text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Website URL</label>
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="url" 
                          value={formData.website}
                          onChange={(e) => setFormData({...formData, website: e.target.value})}
                          placeholder="https://example.com"
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-4 py-2.5 text-sm font-medium outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Company Size</label>
                      <select 
                        value={formData.companySize}
                        onChange={(e) => setFormData({...formData, companySize: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-indigo-500"
                      >
                        {COMPANY_SIZES.map(size => (
                          <option key={size.value} value={size.value}>{size.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Business Goals</label>
                    <div className="relative">
                      <Target className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
                      <textarea 
                        value={formData.businessGoals}
                        onChange={(e) => setFormData({...formData, businessGoals: e.target.value})}
                        placeholder="What are your primary business objectives?"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm font-medium outline-none focus:border-indigo-500 min-h-[120px]"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'subscription' && (() => {
                const tierKey = (user?.account?.tier || 'free') as keyof typeof TIER_CONFIGS;
                const tierConfig = TIER_CONFIGS[tierKey] || TIER_CONFIGS['free'];
                const unitsRemaining = user?.account?.unitsRemaining ?? tierConfig.units;
                const unitsTotal = user?.account?.unitsTotal || tierConfig.units;
                const renewalDateStr = user?.account?.renewalDate ? new Date(user.account.renewalDate).toLocaleDateString() : 'N/A';
                const totalScans = user?.account?.totalScans ?? 0;
                const unitProgress = unitsTotal > 0 ? Math.min(100, Math.max(0, (unitsRemaining / unitsTotal) * 100)) : 100;

                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="bg-slate-900 dark:bg-slate-950 rounded-2xl p-6 text-white relative overflow-hidden">
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Current Plan</p>
                            <h3 className="text-2xl font-bold tracking-tight capitalize">{tierConfig.name}</h3>
                          </div>
                          <div className="px-3 py-1 bg-white/10 rounded-lg border border-white/20">
                            <span className="text-[10px] font-bold uppercase tracking-widest">Active</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Units Remaining</p>
                            <p className="text-xl font-bold">{unitsRemaining} / {unitsTotal}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Next Renewal</p>
                            <p className="text-xl font-bold">{renewalDateStr}</p>
                          </div>
                          <div className="hidden md:block">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Scans</p>
                            <p className="text-xl font-bold">{totalScans}</p>
                          </div>
                        </div>

                        <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-6">
                          <div 
                            className="h-full bg-indigo-500 rounded-full transition-all duration-300" 
                            style={{ width: `${unitProgress}%` }}
                          />
                        </div>

                        <button 
                          onClick={onUpgradePlan}
                          className="btn-base bg-white text-slate-900 btn-md font-bold hover:bg-slate-100 transition-colors"
                        >
                          Upgrade Plan
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Payment Methods</h4>
                      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-8 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center font-bold text-[10px]">VISA</div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">•••• •••• •••• 4242</p>
                            <p className="text-xs text-slate-500">Expires 12/26</p>
                          </div>
                        </div>
                        <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Edit</button>
                      </div>
                    </div>
                  </motion.div>
                );
              })()}



              {activeTab === 'notifications' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Push Notifications</p>
                        <p className="text-xs text-slate-500">Receive real-time alerts for important market anomalies.</p>
                      </div>
                      <button 
                        onClick={() => setFormData({...formData, notificationsPush: !formData.notificationsPush})}
                        className={`w-12 h-6 rounded-full transition-colors relative ${formData.notificationsPush ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.notificationsPush ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Email Digest</p>
                        <p className="text-xs text-slate-500">Stay updated with weekly intelligence summaries.</p>
                      </div>
                      <button 
                        onClick={() => setFormData({...formData, notificationsEmail: !formData.notificationsEmail})}
                        className={`w-12 h-6 rounded-full transition-colors relative ${formData.notificationsEmail ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.notificationsEmail ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Market Intel Emails</p>
                        <p className="text-xs text-slate-500">Receive significant market updates and performance changes via email.</p>
                      </div>
                      <button 
                        onClick={() => setFormData({...formData, notificationsMarketUpdates: !formData.notificationsMarketUpdates})}
                        className={`w-12 h-6 rounded-full transition-colors relative ${formData.notificationsMarketUpdates ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.notificationsMarketUpdates ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Anomaly Detection</p>
                        <p className="text-xs text-slate-500">Highly sensitive alerts for sudden visibility shifts.</p>
                      </div>
                      <button 
                        onClick={() => setFormData({...formData, notificationsAnomalies: !formData.notificationsAnomalies})}
                        className={`w-12 h-6 rounded-full transition-colors relative ${formData.notificationsAnomalies ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.notificationsAnomalies ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Dark Mode</p>
                        <p className="text-xs text-slate-500">Switch between light and dark visual themes.</p>
                      </div>
                      <button 
                        onClick={onToggleDarkMode}
                        className={`w-12 h-6 rounded-full transition-colors relative ${isDarkMode ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isDarkMode ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>

                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">AI Analyst Provider</p>
                          <p className="text-xs text-slate-500">Choose the engine that powers your visibility reports and insights.</p>
                        </div>
                        <div className="flex bg-slate-200 dark:bg-slate-900 p-1 rounded-xl">
                          <button 
                            onClick={() => setFormData({...formData, aiProvider: 'openai'})}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${formData.aiProvider === 'openai' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                          >
                            OpenAI
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'integrations' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Data & Search Integrations</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Connect live web scrapers and search indexing networks for real-time visibility intelligence.</p>
                  </div>

                  {/* Bright Data Card */}
                  <div className="p-5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-xs">
                          BD
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            Bright Data Real-Time Web & SERP
                            {apiConfig.brightDataConfigured ? (
                              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-wider">
                                Connected
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-[10px] font-black uppercase tracking-wider">
                                Live Simulation Mode
                              </span>
                            )}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Powers real-time Google SERP extraction, web page scraping, and unblocked business signal indexing.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 space-y-2">
                      <p className="font-bold">Configuration Instructions:</p>
                      <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                        To enable direct Bright Data network requests, set <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-indigo-600 dark:text-indigo-400">BRIGHTDATA_API_KEY</code> and optional <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-indigo-600 dark:text-indigo-400">BRIGHTDATA_ZONE</code> in your environment settings.
                      </p>
                    </div>
                  </div>

                  {/* DataForSEO Card */}
                  <div className="p-5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-xs">
                          SEO
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            DataForSEO Domain Rank API
                            {apiConfig.dataForSeoConfigured ? (
                              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-wider">
                                Connected
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-slate-500/10 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-wider">
                                Standby
                              </span>
                            )}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Retrieves domain trust scores, estimated organic traffic, and keyword volumes.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {saveSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 text-emerald-600 font-bold text-sm"
                  >
                    <Check className="w-4 h-4" />
                    Changes saved successfully
                  </motion.div>
                )}
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setActiveTab('profile')}
                  className="btn-secondary btn-md"
                >
                  Reset
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="btn-primary btn-md bg-indigo-600 hover:bg-indigo-700 gap-2 min-w-[140px]"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
