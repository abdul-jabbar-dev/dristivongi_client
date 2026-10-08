'use client';

import React from 'react';
import Link from 'next/link';
import { 
  MapPin, 
  FileText, 
  ShieldCheck, 
  Layers, 
  MessageSquare, 
  CheckCircle2, 
  Building2, 
  Clock, 
  ArrowRight 
} from 'lucide-react';
import { CaseSearchResult } from '@/redux/feature/search/search.types';
import { formatBengaliTime } from '@/lib/utils';

export default function CaseSearchCard({ item }: { item: CaseSearchResult }) {
  const timeAgo = formatBengaliTime(item.lastActivityAt || item.createdAt);

  const rawTitle = item.title || (item.titleHtml ? item.titleHtml.replace(/<[^>]+>/g, '') : 'Civic Case');

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 hover:border-slate-300 hover:shadow-md transition-all duration-200 group">
      {/* Organization or Category Header */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
            <Layers size={12} className="text-slate-500" /> Case
          </span>
          {item.organization && (
            <Link 
              href={`/org/${item.organization.slug}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-amber-50 text-amber-800 border border-amber-200/60 px-2.5 py-0.5 rounded-full transition"
            >
              <Building2 size={12} className="text-amber-600" />
              <span>{item.organization.name}</span>
              {item.organization.verificationStatus === 'VERIFIED' && (
                <ShieldCheck size={12} className="text-blue-500" />
              )}
            </Link>
          )}
        </div>

        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Clock size={12} />
          <span>{timeAgo}</span>
        </div>
      </div>

      {/* Main Title */}
      <Link href={`/case/${item.id}`} className="block">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
          {rawTitle}
        </h3>
      </Link>

      {/* Location */}
      {item.location && (
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mt-2">
          <MapPin size={13} className="text-rose-500 shrink-0" />
          <span>{item.location}</span>
        </div>
      )}

      {/* Matched Claim Snippet if applicable */}
      {item.matchedContext?.matchedClaim && (
        <div className="mt-3 bg-slate-50 border-l-4 border-indigo-500 rounded-r-xl p-3 text-xs text-slate-700">
          <span className="font-bold text-indigo-700 block mb-0.5">Matched Claim:</span>
          <p className="italic line-clamp-2">"{item.matchedContext.matchedClaim.title}"</p>
        </div>
      )}

      {/* Footer Stats & Author */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
          <span className="flex items-center gap-1">
            <CheckCircle2 size={13} className="text-indigo-500" /> {item.stats.claimsCount} Claims
          </span>
          <span className="flex items-center gap-1">
            <FileText size={13} className="text-amber-500" /> {item.stats.evidenceCount} Evidence
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare size={13} className="text-emerald-500" /> {item.stats.discussionsCount} Discussions
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">By</span>
          <span className="text-xs font-medium text-slate-700">{item.author.name}</span>
          <Link
            href={`/case/${item.id}`}
            className="ml-2 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition"
          >
            View Case <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
