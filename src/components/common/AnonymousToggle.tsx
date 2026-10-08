import React from 'react';
import { Shield } from 'lucide-react';

interface AnonymousToggleProps {
  isAnonymous: boolean;
  onChange: (isAnonymous: boolean) => void;
  className?: string;
}

export default function AnonymousToggle({
  isAnonymous,
  onChange,
  className = '',
}: AnonymousToggleProps) {
  const handleToggle = () => {
    onChange(!isAnonymous);
  };

  return (
    <div className={`relative inline-flex group ${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={isAnonymous}
        aria-label={
          isAnonymous
            ? 'Anonymous mode is enabled'
            : 'Enable anonymous mode'
        }
        onClick={handleToggle}
        className={`
          inline-flex items-center gap-1.5
          rounded-full
          px-2.5 py-1.5
          text-[11px] font-semibold
          leading-none
          select-none
          transition-all duration-200 ease-out
          focus:outline-none
          focus-visible:ring-2
          focus-visible:ring-slate-400/40
          focus-visible:ring-offset-1

          ${
            isAnonymous
              ? `
                bg-slate-900
                text-white
                shadow-sm
                shadow-slate-900/15
              `
              : `
                bg-slate-100
                text-slate-500
                hover:bg-slate-200
                hover:text-slate-700
              `
          }
        `}
      >
        {/* Privacy / Anonymous Icon */}
        <Shield
          size={13}
          strokeWidth={isAnonymous ? 2.5 : 2}
          className={`
            shrink-0
            transition-all duration-200
            ${
              isAnonymous
                ? 'text-white'
                : 'text-slate-400 group-hover:text-slate-600'
            }
          `}
        />

        {/* Label */}
        <span className="whitespace-nowrap">
          Anonymous
        </span>

        {/* Minimal Toggle */}
        <span
          aria-hidden="true"
          className={`
            relative
            h-4 w-7
            shrink-0
            rounded-full
            transition-colors duration-200 ease-out

            ${
              isAnonymous
                ? 'bg-white/25'
                : 'bg-slate-300'
            }
          `}
        >
          {/* Toggle Knob */}
          <span
            className={`
              absolute
              left-0.5
              top-0.5
              h-3 w-3
              rounded-full
              bg-white
              shadow-sm
              transition-transform duration-200 ease-out

              ${
                isAnonymous
                  ? 'translate-x-3'
                  : 'translate-x-0'
              }
            `}
          />
        </span>
      </button>

      {/* Tooltip */}
      <div
        className="
          pointer-events-none
          absolute
          bottom-full
          left-1/2
          z-[999999]
          mb-2
          hidden
          -translate-x-1/2
          whitespace-nowrap
          rounded-md
          bg-slate-900
          px-2.5
          py-1.5
          text-[10px]
          font-medium
          text-white
          opacity-0
          shadow-lg
          transition-opacity
          duration-150
          group-hover:opacity-100
          sm:block
        "
      >
        {isAnonymous
          ? 'Your identity is hidden'
          : 'Post anonymously'}

        {/* Tooltip Arrow */}
        <span
          className="
            absolute
            left-1/2
            top-full
            -translate-x-1/2
            border-x-[4px]
            border-t-[4px]
            border-x-transparent
            border-t-slate-900
          "
        />
      </div>
    </div>
  );
}