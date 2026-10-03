'use client';
import React, { useState } from 'react';
import { getLinkSecurityStatus } from '@/lib/security';
import { AlertTriangle } from 'lucide-react';
import SafeLinkModal from './SafeLinkModal';

interface SafeLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
}

export default function SafeLink({ href, children, className = '', ...props }: SafeLinkProps) {
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const security = getLinkSecurityStatus(href);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (security.status === 'blocked') {
      e.preventDefault();
      setShowBlockedModal(true);
      return;
    }
    if (props.onClick) {
      props.onClick(e);
    }
  };

  const isNormal = security.status === 'normal' || security.status === 'verified';
  const isWarning = security.status === 'warning';
  const isBlocked = security.status === 'blocked';

  return (
    <>
      <a 
        href={isBlocked ? '#' : href}
        onClick={handleClick}
        className={`${className} ${isWarning ? 'text-amber-600 hover:text-amber-700 relative inline-flex items-center group' : ''}`}
        rel={!isNormal ? "noopener noreferrer nofollow" : props.rel}
        target={!isNormal ? "_blank" : props.target}
        {...props}
      >
        {children}
        {isWarning && (
          <span className="inline-flex relative ml-1 align-middle">
            <AlertTriangle size={14} className="text-amber-500" />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-max bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              ⚠ Suspicious link
              <br />
              <span className="text-[10px] text-slate-300">This link has been flagged as suspicious.</span>
            </span>
          </span>
        )}
      </a>

      <SafeLinkModal 
        isOpen={showBlockedModal} 
        onClose={() => setShowBlockedModal(false)} 
        reason={security.reason}
      />
    </>
  );
}
