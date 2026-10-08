import React from 'react';
import Link from 'next/link';

export const triggerFocusHighlight = (targetId: string, type: 'UPDATE' | 'EVIDENCE' | 'SOURCE' | 'CLAIM' | 'DEFAULT' = 'DEFAULT', extraId?: string) => {
  // Dispatch global event so parent components (like ClaimWorkspace and CompactCaseDetails) can switch tab and claim
  window.dispatchEvent(new CustomEvent('focus-target-item', { 
    detail: { targetId, type, id: extraId || targetId.replace(/^[a-z]+-item-/, '').replace(/^claim-/, '') } 
  }));

  const applyHighlight = (el: HTMLElement) => {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Choose vibrant color based on type
    const ringColor = type === 'UPDATE' ? 'ring-amber-500 bg-amber-50/90' 
      : type === 'EVIDENCE' ? 'ring-emerald-500 bg-emerald-50/90' 
      : type === 'CLAIM' ? 'ring-sky-500 bg-sky-50/90' 
      : type === 'SOURCE' ? 'ring-indigo-500 bg-indigo-50/90'
      : 'ring-blue-500 bg-blue-50/90';

    const classes = [ringColor.split(' ')[0], ringColor.split(' ')[1], 'ring-4', 'shadow-2xl', 'rounded-2xl', 'transition-all', 'duration-500', 'z-20'];
    el.classList.add(...classes);

    setTimeout(() => {
      el.classList.remove(...classes);
    }, 3500);
  };

  const el = document.getElementById(targetId);
  if (el) {
    applyHighlight(el);
  } else {
    // Retry after tab/claim switch
    setTimeout(() => {
      const retryEl = document.getElementById(targetId);
      if (retryEl) applyHighlight(retryEl);
      else {
        setTimeout(() => {
          const finalRetry = document.getElementById(targetId);
          if (finalRetry) applyHighlight(finalRetry);
        }, 300);
      }
    }, 150);
  }
};

export default function TextWithMentions({ text, className }: { text: string; className?: string }) {
  if (!text) return null;

  // Match @username, #status-{id}, #update-{id}, #evidence-{id}, #source-{id}, #claim-{id}
  const mentionRegex = /(@[a-zA-Z0-9_\.-]+|#(?:status|update|evidence|source|claim)-[a-zA-Z0-9_-]+)/g;
  const parts = text.split(mentionRegex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (!part) return null;

        if (part.startsWith('@')) {
          const username = part.substring(1); // Remove the '@'
          return (
            <Link 
              key={index} 
              href={`/profile/${username}`}
              className="inline-flex items-center text-blue-600 font-semibold bg-blue-50/80 hover:bg-blue-100 hover:text-blue-800 px-1.5 py-0.5 rounded transition-colors duration-150 mx-0.5 align-baseline text-[11px]"
              onClick={(e) => e.stopPropagation()}
            >
              @{username}
            </Link>
          );
        } else if (part.startsWith('#claim-')) {
          const id = part.replace('#claim-', '');
          return (
            <button
              key={index}
              type="button"
              className="inline-flex items-center gap-1 text-sky-700 bg-sky-50 hover:bg-sky-100 font-semibold px-1.5 py-0.5 rounded border border-sky-200/80 transition-colors duration-150 mx-0.5 cursor-pointer align-baseline text-[11px]"
              onClick={(e) => { e.stopPropagation(); triggerFocusHighlight(`claim-workspace-container`, 'CLAIM', id); }}
              title="দাবিতে ফোকাস করুন"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
              <span>{part}</span>
            </button>
          );
        } else if (part.startsWith('#status-') || part.startsWith('#update-')) {
          const id = part.replace(/^#(?:status|update)-/, '');
          return (
            <button
              key={index}
              type="button"
              className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 hover:bg-amber-100 font-semibold px-1.5 py-0.5 rounded border border-amber-200/80 transition-colors duration-150 mx-0.5 cursor-pointer align-baseline text-[11px]"
              onClick={(e) => { e.stopPropagation(); triggerFocusHighlight(`update-item-${id}`, 'UPDATE', id); }}
              title="আপডেটে স্ক্রোল করুন"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              <span>{part}</span>
            </button>
          );
        } else if (part.startsWith('#evidence-')) {
          const id = part.replace('#evidence-', '');
          return (
            <button
              key={index}
              type="button"
              className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-semibold px-1.5 py-0.5 rounded border border-emerald-200/80 transition-colors duration-150 mx-0.5 cursor-pointer align-baseline text-[11px]"
              onClick={(e) => { e.stopPropagation(); triggerFocusHighlight(`evidence-item-${id}`, 'EVIDENCE', id); }}
              title="প্রমাণাদিতে স্ক্রোল করুন"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>{part}</span>
            </button>
          );
        } else if (part.startsWith('#source-')) {
          const id = part.replace('#source-', '');
          return (
            <button
              key={index}
              type="button"
              className="inline-flex items-center gap-1 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 font-semibold px-1.5 py-0.5 rounded border border-indigo-200/80 transition-colors duration-150 mx-0.5 cursor-pointer align-baseline text-[11px]"
              onClick={(e) => { e.stopPropagation(); triggerFocusHighlight(`evidence-item-${id}`, 'SOURCE', id); }}
              title="উৎসতে স্ক্রোল করুন"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              <span>{part}</span>
            </button>
          );
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </span>
  );
}


