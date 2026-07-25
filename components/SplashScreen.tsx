
import React from 'react';
import { motion } from 'framer-motion';
import OculaLogo from './OculaLogo';

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-50 dark:bg-[#050505] overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1] 
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[280px] bg-blue-500/20 rounded-full blur-[120px]"
        />
      </div>

      <div className="relative flex flex-col items-center">
        {/* Logo Container */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            duration: 0.8, 
            ease: [0.16, 1, 0.3, 1] 
          }}
          className="relative mb-4"
        >
          {/* Pulsing ring around logo */}
          <motion.div 
            animate={{ 
              scale: [1, 1.5],
              opacity: [0.5, 0] 
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeOut" 
            }}
            className="absolute inset-0 border-2 border-blue-500 rounded-full"
          />
          
          <div className="relative surface p-4 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-800">
            <OculaLogo className="w-14 h-14 text-blue-600 dark:text-white" color="#2563eb" />
          </div>
        </motion.div>

        {/* Text and Progress */}
        <div className="flex flex-col items-center gap-4">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white"
          >
            ocula<span className="text-blue-600">.</span>
          </motion.h1>
          
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: 200 }}
            transition={{ delay: 0.6, duration: 1.5, ease: "easeInOut" }}
            className="h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden"
          >
            <motion.div 
              animate={{ 
                x: [-200, 200] 
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="h-full w-1/2 bg-blue-600 rounded-full"
            />
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500"
          >
            Initializing Intelligence
          </motion.p>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-12 left-12">
        <p className="text-[8px] font-mono text-slate-300 dark:text-slate-700 uppercase tracking-widest">System v3.1.0</p>
      </div>
      <div className="absolute bottom-12 right-12">
        <p className="text-[8px] font-mono text-slate-300 dark:text-slate-700 uppercase tracking-widest">© 2026 Ocula AI</p>
      </div>
    </div>
  );
};

export default SplashScreen;
