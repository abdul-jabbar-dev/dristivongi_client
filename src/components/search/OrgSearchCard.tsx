'use client';

import React from 'react';
import Link from 'next/link';
import { Building2, ShieldCheck, MapPin, Users, Briefcase, ArrowRight } from 'lucide-react';
import { OrganizationSearchResult } from '@/redux/feature/search/search.types';
import { resolveMediaUrl } from '@/lib/utils';

export default function OrgSearchCard({ item }: { item: OrganizationSearchResult }) {
  const logoSrc = item.logoUrl ? resolveMediaUrl(item.logoUrl) : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 hover:border-slate-300 hover:shadow-md transition-all duration-200 group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3.5 flex-1 min-w-0">
        {/* Logo / Icon */}
        <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center shrink-0 overflow-hidden text-amber-700 font-bold">
          {logoSrc ? (
            <img 
              src={logoSrc} 
              alt={item.name} 
              className="w-full h-full object-cover" 
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <Building2 size={24} className="text-amber-600" />
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link href={`/org/${item.slug}`}>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors truncate">
                {item.name}
              </h3>
            </Link>
            {item.verificationStatus === 'VERIFIED' && (
              <span className="inline-flex items-center gap-0.5 text-blue-600 text-xs font-semibold" title="Verified Organization">
                <ShieldCheck size={15} />
              </span>
            )}
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              {item.organizationType}
            </span>
          </div>

          {item.description && (
            <p className="text-xs text-slate-600 line-clamp-2 mt-1">
              {item.description}
            </p>
          )}

          <div className="flex items-center gap-3 text-xs text-slate-500 mt-2.5 flex-wrap">
            {item.location && (
              <span className="flex items-center gap-1">
                <MapPin size={12} className="text-rose-500" /> {item.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users size={12} className="text-indigo-500" /> {item.memberCount} Members
            </span>
            <span className="flex items-center gap-1">
              <Briefcase size={12} className="text-amber-500" /> {item.caseCount} Cases
            </span>
          </div>
        </div>
      </div>

      {/* Action */}
      <Link
        href={`/org/${item.slug}`}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition shrink-0"
      >
        View Organization <ArrowRight size={13} />
      </Link>
    </div>
  );
}
