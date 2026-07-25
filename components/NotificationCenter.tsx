import React, { useState, useEffect } from 'react';
import { Notification } from '../types';
import { storageService } from '../services/storageService';
import { Bell, X, Check, Trash2, AlertTriangle, TrendingUp, Info, Zap, BellOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose, isDarkMode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (isOpen) {
      const fetchNotifications = async () => {
        const notifs = await storageService.getNotifications();
        setNotifications(notifs);
      };
      fetchNotifications();
    }
  }, [isOpen]);

  const handleMarkAsRead = async (id: string) => {
    const updated = await storageService.markNotificationAsRead(id);
    setNotifications(updated);
  };

  const handleMarkAllAsRead = async () => {
    const updated = await storageService.markAllNotificationsAsRead();
    setNotifications(updated);
  };

  const handleClearAll = async () => {
    const updated = await storageService.clearNotifications();
    setNotifications(updated);
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'anomaly': return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'warning': return <Zap className="w-4 h-4 text-amber-500" />;
      case 'success': return <TrendingUp className="w-4 h-4 text-emerald-500" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      default: return <Info className="w-4 h-4 text-indigo-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[1000] bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md z-[1001] surface shadow-2xl flex flex-col border-l border-slate-100 dark:border-slate-800"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Bell className="w-6 h-6 text-slate-900 dark:text-white" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Intelligence</h2>
                    <div className="flex items-center gap-1.5 px-1.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-md">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                      <span className="text-[8px] font-black text-indigo-500 uppercase tracking-wider">Syncing</span>
                    </div>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Performance stream</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="btn-icon w-10 h-10 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Actions */}
            {notifications.length > 0 && (
              <div className="px-5 py-4 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <button 
                  onClick={handleMarkAllAsRead}
                  className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:underline flex items-center gap-2"
                >
                  <Check className="w-3 h-3" /> Mark all read
                </button>
                <button 
                  onClick={handleClearAll}
                  className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest hover:underline flex items-center gap-2"
                >
                  <Trash2 className="w-3 h-3" /> Clear all
                </button>
              </div>
            )}

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {notifications.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-4">
                  <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                    <BellOff className="w-8 h-8 text-slate-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">All clear</h3>
                    <p className="text-sm text-slate-500 font-medium">No new market signals or anomalies detected.</p>
                  </div>
                </div>
              ) : (
                notifications.map((notification) => (
                  <motion.div 
                    key={notification.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl border transition-all relative group ${
                      notification.read 
                        ? 'surface border-slate-100 dark:border-slate-800 opacity-60' 
                        : 'surface border-indigo-100 dark:border-indigo-900/50 shadow-lg shadow-indigo-500/5'
                    }`}
                  >
                    {!notification.read && (
                      <div className="absolute top-4 right-6 w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                    )}
                    
                    <div className="flex gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        notification.type === 'anomaly' ? 'bg-rose-50 dark:bg-rose-900/20' :
                        notification.type === 'warning' ? 'bg-amber-50 dark:bg-amber-900/20' :
                        notification.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20' :
                        'bg-indigo-50 dark:bg-indigo-900/20'
                      }`}>
                        {getIcon(notification.type)}
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <h4 className="font-bold text-slate-900 dark:text-white text-xs leading-tight">{notification.title}</h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-3 pt-2">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            {Math.abs(Date.now() - new Date(notification.timestamp).getTime()) < 120000 ? (
                              <>
                                <span className="w-1 h-1 bg-indigo-500 rounded-full animate-pulse" />
                                <span className="text-indigo-500">Just Now</span>
                              </>
                            ) : (
                              new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            )}
                          </span>
                          {!notification.read && (
                            <button 
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:underline"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">
                Ocula Intelligence Engine • v2.4.0
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationCenter;
