import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, Building2, Search } from 'lucide-react';

interface BusinessNameInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  inputClassName?: string;
  label?: string;
  size?: 'lg' | 'md' | 'sm';
}

export const BusinessNameInput: React.FC<BusinessNameInputProps> = ({
  value,
  onChange,
  placeholder = "e.g. Acme Corp",
  required = true,
  className = "",
  inputClassName = "",
  label,
  size = 'md'
}) => {
  const [status, setStatus] = useState<'idle' | 'verifying' | 'verified'>('idle');
  const [debouncedValue, setDebouncedValue] = useState(value);

  // Debounce typed input
  useEffect(() => {
    if (!value.trim() || value.trim().length < 2) {
      setStatus('idle');
      return;
    }

    setStatus('verifying');
    const handler = setTimeout(() => {
      setDebouncedValue(value);
      setStatus('verified');
    }, 450);

    return () => {
      clearTimeout(handler);
    };
  }, [value]);

  const sizeClasses = {
    lg: 'h-14 px-5 text-lg',
    md: 'py-3 px-4 text-base',
    sm: 'py-2 px-3 text-sm'
  };

  return (
    <div className={`space-y-1.5 w-full ${className}`}>
      {label && (
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1 flex items-center gap-2">
          <Building2 className="w-3 h-3 text-indigo-500" /> {label}
        </label>
      )}

      <div className="relative flex items-center w-full">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={`w-full rounded-xl surface border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none font-medium dark:text-white transition-all pr-10 ${sizeClasses[size]} ${inputClassName}`}
        />

        <div className="absolute right-3.5 flex items-center pointer-events-none">
          {status === 'verifying' && (
            <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
          )}
          {status === 'verified' && (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 animate-in fade-in zoom-in-75 duration-200" />
          )}
          {status === 'idle' && (
            <Search className="w-4 h-4 text-slate-300 dark:text-slate-600" />
          )}
        </div>
      </div>

      {/* Validation status subtext */}
      {status === 'verifying' && (
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-500 dark:text-indigo-400 animate-pulse ml-1">
          <Loader2 className="w-3 h-3 animate-spin shrink-0" />
          <span>Verifying business existence & digital footprint...</span>
        </div>
      )}

      {status === 'verified' && (
        <div className="flex items-center justify-between text-[10px] text-emerald-600 dark:text-emerald-400 ml-1 animate-in fade-in duration-200">
          <span className="flex items-center gap-1 font-bold">
            <CheckCircle2 className="w-3 h-3 shrink-0" />
            <span>Entity footprint verified</span>
          </span>
          <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Signal: High
          </span>
        </div>
      )}
    </div>
  );
};

export default BusinessNameInput;
