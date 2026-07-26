import React from 'react';
import { motion } from 'framer-motion';
import FlokkerLogo from './FlokkerLogo';

export const FlokkerLoadingFallback: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Ambient background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.25, 1],
            opacity: [0.2, 0.4, 0.2] 
          }}
          transition={{ 
            duration: 3.5, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/25 rounded-full blur-[140px]"
        />
        <motion.div 
          animate={{ 
            scale: [1.1, 0.9, 1.1],
            opacity: [0.15, 0.3, 0.15] 
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[250px] bg-blue-500/20 rounded-full blur-[100px]"
        />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-sm px-6 text-center">
        {/* Animated Flokker Falcon Bird Logo Container */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative mb-8"
        >
          {/* Pulsing Outer Glow Ring */}
          <motion.div 
            animate={{ 
              scale: [1, 1.4],
              opacity: [0.4, 0] 
            }}
            transition={{ 
              duration: 2.2, 
              repeat: Infinity, 
              ease: "easeOut" 
            }}
            className="absolute -inset-4 border border-indigo-500/40 rounded-3xl"
          />

          <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl flex items-center justify-center">
            <FlokkerLogo size="xl" showText={false} animated={true} className="w-20 h-20" />
          </div>
        </motion.div>

        {/* Flokker Wordmark Title */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-2 mb-8"
        >
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-3xl font-display font-extrabold tracking-tight text-white">
              FLOKKER
            </h1>
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          </div>
          <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.3em] text-indigo-400">
            Digital Services & Brand Growth
          </p>
        </motion.div>

        {/* Glowing Electric Progress Bar */}
        <motion.div 
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "100%" }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden mb-4 border border-slate-700/40"
        >
          <motion.div 
            animate={{ 
              x: ["-100%", "100%"] 
            }}
            transition={{ 
              duration: 1.6, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="h-full w-1/2 bg-gradient-to-r from-indigo-500 via-blue-400 to-indigo-500 rounded-full shadow-[0_0_12px_rgba(99,102,241,0.8)]"
          />
        </motion.div>

        {/* Loading Message */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-xs font-mono text-slate-400 tracking-wider"
        >
          Launching Flokker Experience...
        </motion.p>
      </div>

      {/* Footer System Version Badge */}
      <div className="absolute bottom-8 text-[10px] font-mono text-slate-600 uppercase tracking-widest">
        Flokker Engine • Falcon Wing v2.4
      </div>
    </div>
  );
};

export default FlokkerLoadingFallback;
