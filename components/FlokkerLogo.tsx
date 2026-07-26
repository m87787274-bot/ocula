import React from 'react';

interface FlokkerLogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  animated?: boolean;
}

export const FlokkerLogo: React.FC<FlokkerLogoProps> = React.memo(({ 
  className = "",
  iconOnly = false,
  size = 'md',
  showText = true,
  animated = true
}) => {
  const sizeMap = {
    sm: { icon: "w-6 h-6", text: "text-lg", container: "gap-2" },
    md: { icon: "w-9 h-9", text: "text-2xl", container: "gap-2.5" },
    lg: { icon: "w-12 h-12", text: "text-3xl", container: "gap-3" },
    xl: { icon: "w-16 h-16", text: "text-4xl", container: "gap-4" }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex items-center ${currentSize.container} ${className} group cursor-pointer select-none`}>
      {/* GEOMETRIC FALCON / BIRD LOGO ICON */}
      <svg 
        className={`${currentSize.icon} shrink-0 transition-transform duration-300 group-hover:scale-105 overflow-visible`} 
        viewBox="0 0 200 200" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Flokker Falcon Logo"
      >
        <defs>
          {/* Top Electric Blue Wing Gradient */}
          <linearGradient id="flokkerWingBlue" x1="20" y1="20" x2="160" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1E69FF" />
            <stop offset="50%" stopColor="#0052FF" />
            <stop offset="100%" stopColor="#00D2FF" />
          </linearGradient>

          {/* Dark Metallic Head & Body Gradient */}
          <linearGradient id="flokkerMetallicDark" x1="80" y1="40" x2="180" y2="160" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="40%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          {/* Wing Metallic Facet 1 */}
          <linearGradient id="flokkerFacet1" x1="40" y1="60" x2="130" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>

          {/* Wing Metallic Facet 2 */}
          <linearGradient id="flokkerFacet2" x1="60" y1="80" x2="120" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          {/* Glow filter for eye */}
          <filter id="eyeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <style>{`
            @keyframes flokkerWingFlapUp {
              0%, 100% {
                transform: rotate(0deg) translateY(0px) scale(1, 1);
              }
              25% {
                transform: rotate(-14deg) translateY(-6px) scale(0.95, 1.10);
              }
              50% {
                transform: rotate(-24deg) translateY(-12px) scale(0.88, 1.22);
              }
              75% {
                transform: rotate(-12deg) translateY(-5px) scale(0.97, 1.06);
              }
            }

            @keyframes flokkerBodyFloat {
              0%, 100% {
                transform: translateY(0px);
              }
              50% {
                transform: translateY(-4px);
              }
            }

            .flokker-wings-flap {
              transform-origin: 110px 85px;
              animation: flokkerWingFlapUp 1.6s ease-in-out infinite;
            }

            .flokker-body-float {
              animation: flokkerBodyFloat 1.6s ease-in-out infinite;
            }

            .group:hover .flokker-wings-flap {
              animation-duration: 0.8s;
            }
          `}</style>
        </defs>

        {/* FLAPPING WINGS GROUP */}
        <g className={animated ? "flokker-wings-flap" : ""}>
          {/* TOP ELECTRIC BLUE WING BLADE */}
          <path 
            d="M 35 35 L 110 75 L 100 88 L 30 48 Z" 
            fill="url(#flokkerWingBlue)"
            className="transition-all duration-300 group-hover:brightness-110"
          />
          <path 
            d="M 35 35 L 125 90 L 105 105 L 50 68 Z" 
            fill="url(#flokkerWingBlue)"
            opacity="0.95"
          />

          {/* SECOND METALLIC WING FEATHER */}
          <path 
            d="M 40 58 L 110 92 L 102 112 L 52 78 Z" 
            fill="url(#flokkerFacet1)"
          />

          {/* THIRD METALLIC WING FEATHER */}
          <path 
            d="M 60 82 L 115 110 L 105 125 L 75 100 Z" 
            fill="url(#flokkerFacet2)"
          />
        </g>

        {/* GEOMETRIC FALCON HEAD & BODY */}
        <g className={animated ? "flokker-body-float" : ""}>
          <path 
            d="M 108 72 L 155 70 L 175 88 L 158 92 L 128 135 L 80 125 L 112 108 L 125 92 L 108 72 Z" 
            fill="url(#flokkerMetallicDark)"
          />

          {/* Sharp Beak Accent */}
          <path 
            d="M 158 92 L 175 88 L 162 100 Z" 
            fill="#020617"
          />

          {/* Neck / Jaw Facet Cut */}
          <path 
            d="M 128 135 L 115 108 L 125 92 L 132 108 Z" 
            fill="#475569" 
            opacity="0.5"
          />

          {/* ELECTRIC BLUE GLOWING EYE */}
          <circle 
            cx="148" 
            cy="81" 
            r="3" 
            fill="#00F0FF" 
            filter="url(#eyeGlow)"
            className="animate-pulse"
          />
          <circle 
            cx="148" 
            cy="81" 
            r="1.5" 
            fill="#FFFFFF" 
          />

          {/* HIGHLIGHT CREASE ACCENTS */}
          <path 
            d="M 110 75 L 153 72" 
            stroke="#00D2FF" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            opacity="0.8"
          />
          <path 
            d="M 112 108 L 135 130" 
            stroke="#94A3B8" 
            strokeWidth="1" 
            opacity="0.4"
          />
        </g>
      </svg>

      {/* FLOKKER WORDMARK */}
      {(!iconOnly && showText) && (
        <div className="flex items-baseline font-display tracking-tight font-extrabold text-white">
          <span className={`${currentSize.text} tracking-tight`}>Flok</span>
          <span className={`${currentSize.text} tracking-tight relative inline-block text-indigo-400`}>
            k
            <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping opacity-75" />
          </span>
          <span className={`${currentSize.text} tracking-tight`}>er</span>
        </div>
      )}
    </div>
  );
});

export default FlokkerLogo;
