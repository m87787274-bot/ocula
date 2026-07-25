import React from 'react';

interface OculaLogoProps {
  className?: string;
  color?: string;
}

export const OculaLogo: React.FC<OculaLogoProps> = React.memo(({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg 
    className={`${className} group transition-transform duration-700 ease-out hover:rotate-90`} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Ocula Logo"
  >
    {/* Outer Ring */}
    <circle cx="50" cy="50" r="45" stroke={color} strokeWidth="1" strokeDasharray="4 8" opacity="0.2" />
    
    {/* Main Eye Shape */}
    <path 
      d="M10 50C10 50 25 25 50 25C75 25 90 50 90 50C90 50 75 75 50 75C25 75 10 50 10 50Z" 
      stroke={color} 
      strokeWidth="4" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className="transition-all duration-300 group-hover:filter group-hover:drop-shadow-[0_0_12px_rgba(59,130,246,0.6)]"
    />
    
    {/* Inner Lens / Iris */}
    <circle cx="50" cy="50" r="18" stroke={color} strokeWidth="1.5" opacity="0.4" />
    <circle cx="50" cy="50" r="10" fill={color} className="transition-all duration-500 group-hover:scale-75 origin-center" />
    
    {/* Data Signal Path */}
    <path 
      d="M38 52L46 44L54 48L62 38" 
      stroke={color} 
      strokeWidth="3.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className="transition-all duration-300 group-hover:translate-y-[-2px] group-hover:scale-110 origin-center"
    />
    
    {/* Crosshairs */}
    <path d="M50 15V22" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.3" />
    <path d="M50 78V85" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.3" />
    <path d="M15 50H22" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.3" />
    <path d="M78 50H85" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.3" />
  </svg>
));

export default OculaLogo;
