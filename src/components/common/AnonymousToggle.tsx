import React from 'react';
import { Shield } from 'lucide-react';

interface AnonymousToggleProps {
  isAnonymous: boolean;
  onChange: (isAnonymous: boolean) => void;
  className?: string;
}

export default function AnonymousToggle({ isAnonymous, onChange, className = '' }: AnonymousToggleProps) {
  return (
    <div 
      className={`group relative flex items-center gap-1.5 cursor-pointer px-1.5 py-1 rounded transition-colors ${isAnonymous ? 'bg-slate-900/5' : 'hover:bg-slate-50'} ${className}`}
      onClick={() => onChange(!isAnonymous)}
      title="Post anonymously. Your identity will be hidden."
    >
      <Shield size={14} className={`transition-colors ${isAnonymous ? 'text-slate-900' : 'text-slate-400'}`} />
      <span className={`text-[11px] font-semibold transition-colors ${isAnonymous ? 'text-slate-900' : 'text-slate-500'}`}>
        Anonymous
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={isAnonymous}
        className={`ml-0.5 relative inline-flex h-3.5 w-6 flex-shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          isAnonymous ? 'bg-slate-900' : 'bg-slate-300'
        }`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
            isAnonymous ? 'translate-x-2.5' : 'translate-x-0'
          }`}
        />
      </button>
      
      {/* Minimal Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-max px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 hidden sm:block">
        Hide your identity
        <svg className="absolute text-slate-800 h-1.5 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255" xmlSpace="preserve">
          <polygon className="fill-current" points="0,0 127.5,127.5 255,0"/>
        </svg>
      </div>
    </div>
  );
}
