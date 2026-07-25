
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface AILoaderProps {
  message?: string;
  className?: string;
}

const AILoader: React.FC<AILoaderProps> = ({ message = "AI is scrying the market signals...", className = "" }) => {
  return (
    <div className={`flex flex-col items-center justify-center p-4 space-y-4 ${className}`}>
      <div className="relative">
        {/* Outer rotating ring */}
        <motion.div
          className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Inner pulsing glow */}
        <motion.div
          className="absolute inset-0 m-auto w-12 h-12 bg-blue-500/20 rounded-full blur-xl"
          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Center icon */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center text-blue-500"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sparkles className="w-8 h-8" />
        </motion.div>

        {/* Orbiting particles */}
        {[0, 72, 144, 216, 288].map((angle, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.8)]"
            animate={{
              x: [Math.cos(angle * Math.PI / 180) * 40, Math.cos((angle + 360) * Math.PI / 180) * 40],
              y: [Math.sin(angle * Math.PI / 180) * 40, Math.sin((angle + 360) * Math.PI / 180) * 40],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        ))}
      </div>

      <div className="text-center space-y-2">
        <motion.p
          className="text-sm font-black uppercase tracking-[0.3em] text-blue-500/80"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {message}
        </motion.p>
        <div className="flex gap-1 justify-center">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1 h-1 bg-blue-400 rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AILoader;
