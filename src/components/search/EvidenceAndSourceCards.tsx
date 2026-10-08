'use client';

import React from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Globe, 
  CheckCircle2, 
  MessageSquare, 
  Layers, 
  ExternalLink, 
  ArrowRight 
} from 'lucide-react';
import { 
  ClaimSearchResult, 
  EvidenceSearchResult, 
  SourceSearchResult, 
  DiscussionSearchResult 
} from '@/redux/feature/search/search.types';

export function ClaimSearchCard({ item }: { item: ClaimSearchResult }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 hover:border-slate-300 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full">
          <CheckCircle2 size={12} /> Claim
        </span>
        <span className="text-xs text-slate-500">
          {item.assessmentsCount} Assessments • {item.evidenceCount} Evidence
        </span>
      </div>

      <Link href={item.url} className="block">
        <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
          "{item.title}"
        </h3>
      </Link>

      {/* Parent Case context */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 truncate">
          <Layers size={13} className="text-slate-400 shrink-0" />
          <span className="text-slate-400">Part of Case:</span>
          <Link href={item.parentCase.url} className="font-semibold text-slate-800 hover:underline truncate">
            {item.parentCase.title}
          </Link>
        </div>
        <Link
          href={item.url}
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition"
        >
          View in Case <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}

export function EvidenceSearchCard({ item }: { item: EvidenceSearchResult }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 hover:border-slate-300 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full">
          <FileText size={12} /> Evidence • {item.type}
        </span>
        <span className="text-xs text-slate-500">
          {item.validationsCount} Community Validations
        </span>
      </div>

      <Link href={item.url} className="block">
        <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
          {item.title}
        </h3>
      </Link>

      {item.relatedClaim && (
        <div className="mt-2 text-xs text-slate-600 bg-slate-50 rounded-lg p-2">
          <span className="font-semibold text-slate-700">Related Claim: </span>
          <span>"{item.relatedClaim.title}"</span>
        </div>
      )}

      {/* Parent Case context */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 truncate">
          <Layers size={13} className="text-slate-400 shrink-0" />
          <span className="text-slate-400">Case:</span>
          <Link href={item.parentCase.url} className="font-semibold text-slate-800 hover:underline truncate">
            {item.parentCase.title}
          </Link>
        </div>
        <Link
          href={item.url}
          className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700 transition"
        >
          Inspect Evidence <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}

export function SourceSearchCard({ item }: { item: SourceSearchResult }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 hover:border-slate-300 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full">
          <Globe size={12} /> Source • {item.externalSourceType || 'Report'}
        </span>
        <span className="text-xs text-slate-500 font-medium">
          Publisher: {item.publisher}
        </span>
      </div>

      <Link href={item.url} className="block">
        <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
          {item.title}
        </h3>
      </Link>

      {/* External Links if available */}
      {item.externalLinks && item.externalLinks.length > 0 && (
        <div className="mt-2">
          <a
            href={item.externalLinks[0]}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline truncate max-w-full"
          >
            <ExternalLink size={11} /> {item.externalLinks[0]}
          </a>
        </div>
      )}

      {/* Parent Case Context */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 truncate">
          <Layers size={13} className="text-slate-400 shrink-0" />
          <span className="text-slate-400">Related Case:</span>
          <Link href={item.parentCase.url} className="font-semibold text-slate-800 hover:underline truncate">
            {item.parentCase.title}
          </Link>
        </div>
        <Link
          href={item.url}
          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition"
        >
          View Source <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}

export function DiscussionSearchCard({ item }: { item: DiscussionSearchResult }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 hover:border-slate-300 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
          <MessageSquare size={12} className="text-slate-500" /> Discussion
        </span>
        <span className="text-xs text-slate-400">
          By {item.author.name}
        </span>
      </div>

      <p className="text-sm text-slate-800 italic bg-slate-50/70 p-3 rounded-xl border border-slate-100">
        "{item.snippet}"
      </p>

      {/* Parent Case context */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 truncate">
          <Layers size={13} className="text-slate-400 shrink-0" />
          <span className="text-slate-400">In Case:</span>
          <Link href={item.parentCase.url} className="font-semibold text-slate-800 hover:underline truncate">
            {item.parentCase.title}
          </Link>
        </div>
        <Link
          href={item.url}
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition"
        >
          Go to Discussion <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}
