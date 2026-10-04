'use client';
import React, { useEffect, useRef, useState } from 'react';
import { getLinkSecurityStatus, getMediaSecurityStatus } from '@/lib/security';
import SafeLinkModal from './SafeLinkModal';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [blockedReason, setBlockedReason] = useState<string | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const links = containerRef.current.querySelectorAll('a');
    links.forEach(link => {
      const href = link.getAttribute('href');
      const security = getLinkSecurityStatus(href);

      if (!link.dataset.safeProcessed) {
        link.dataset.safeProcessed = 'true';

        if (security.status !== 'normal' && security.status !== 'verified') {
          link.setAttribute('rel', 'noopener noreferrer nofollow');
          link.setAttribute('target', '_blank');
        }

        if (security.status === 'warning') {
          link.classList.add('text-amber-600', 'hover:text-amber-700', 'relative', 'inline-flex', 'items-center', 'group');

          const iconSpan = document.createElement('span');
          iconSpan.className = 'ml-1 text-amber-500 text-[10px] inline-flex';
          iconSpan.innerHTML = '&#9888;'; // Warning icon

          const tooltip = document.createElement('span');
          tooltip.className = 'absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-max bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 font-normal normal-case tracking-normal leading-tight';
          tooltip.innerHTML = '&#9888; Suspicious link<br/><span style="font-size:10px;color:#cbd5e1">This link has been flagged as suspicious.</span>';

          iconSpan.appendChild(tooltip);
          link.appendChild(iconSpan);
        }
      }
    });

    const mediaElements = containerRef.current.querySelectorAll('img, video, iframe') as NodeListOf<HTMLElement>;
    mediaElements.forEach(media => {
      const src = media.getAttribute('src');
      const security = getMediaSecurityStatus(src);

      if (!media.dataset.safeProcessed) {
        media.dataset.safeProcessed = 'true';

        if (media.tagName.toLowerCase() === 'img') {
          media.addEventListener('error', () => {
            const placeholder = document.createElement('div');
            placeholder.className = 'bg-slate-100 border border-slate-200 rounded p-4 text-center my-2 flex flex-col items-center justify-center text-slate-500 text-sm';

            const altText = media.getAttribute('alt') || 'Image unavailable';
            placeholder.innerHTML = `<span class="text-slate-400 mb-1">🖼️</span><span class="italic text-xs">${altText}</span>`;

            if (media.parentNode) {
              media.parentNode.replaceChild(placeholder, media);
            }
          });
        }
      }
    });

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      const security = getLinkSecurityStatus(href);

      if (security.status === 'blocked') {
        e.preventDefault();
        setBlockedReason(security.reason);
        setIsModalOpen(true);
      }
    };

    const container = containerRef.current;
    container.addEventListener('click', handleClick);
    return () => {
      container.removeEventListener('click', handleClick);
    };
  }, [content]);

  if (!content) return null;

  // Replace @username with a link. 
  // We match it when preceded by space, >, start of string, <p>, or <br>.
  const contentWithMentions = content.replace(/(^|\s|>|<p>|<br>)(@([a-zA-Z0-9_]+))/g, (match, p1, p2, username) => {
    return `${p1}<a href="/profile/${username}" class="text-blue-600 hover:underline hover:text-blue-800 font-medium" onclick="event.stopPropagation()">${p2}</a>`;
  });

  return (
    <>
      <div
        ref={containerRef}
        className={`text-slate-800 ${className} [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2 [&_li]:mb-1 [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-600 [&_blockquote]:my-2 [&_blockquote]:bg-slate-50 [&_blockquote]:py-1 [&_a]:text-slate-600 [&_a:hover]:!underline [&_a:hover]:!decoration-slate-400 [&_a:hover]:!underline-offset-[3px] [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-2 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-bold [&_h3]:mb-2 [&_h4]:text-base [&_h4]:font-semibold [&_h4]:mb-2 [&_h5]:text-sm [&_h5]:font-semibold [&_h5]:mb-2 [&_h6]:text-sm [&_h6]:font-semibold [&_h6]:mb-2 [&_p]:mb-2`}
        dangerouslySetInnerHTML={{ __html: contentWithMentions }}
      />
      <SafeLinkModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        reason={blockedReason}
      />
    </>
  );
}
