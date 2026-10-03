import React from 'react';

export default function StaticTestBadge({ label = 'TEST DATA', tooltip = 'Static placeholder — Not connected to backend' }: { label?: string; tooltip?: string }) {
  if (process.env.NODE_ENV === 'production') return null;

  return (
    <span 
      className="inline-flex items-center gap-1 bg-red-50 text-red-600 border border-red-200 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase cursor-help ml-2 shrink-0 shadow-sm"
      title={tooltip}
    >
      {label}
    </span>
  );
}

export function StaticDataWrapper({ children, label = 'TEST DATA', tooltip = 'Static placeholder data — Not connected to backend' }: { children: React.ReactNode, label?: string, tooltip?: string }) {
  if (process.env.NODE_ENV === 'production') return <>{children}</>;

  return (
    <div className="relative border-2 border-dashed border-red-300 bg-red-50/10 rounded-xl overflow-hidden group" title={tooltip}>
      <div className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-bold px-2 py-1 rounded-bl-lg z-10 opacity-50 group-hover:opacity-100 transition shadow-sm pointer-events-none">
        {label}
      </div>
      {children}
    </div>
  );
}
