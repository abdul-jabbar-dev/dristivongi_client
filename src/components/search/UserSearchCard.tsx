'use client';

import React from 'react';
import Link from 'next/link';
import { User, MapPin, Building2, ArrowRight } from 'lucide-react';
import { UserSearchResult } from '@/redux/feature/search/search.types';
import { resolveMediaUrl } from '@/lib/utils';

export default function UserSearchCard({ item }: { item: UserSearchResult }) {
  const profileUrl = item.userName ? `/profile/${item.userName}` : `/profile/${item.id}`;
  const avatarSrc = item.profilePicture ? resolveMediaUrl(item.profilePicture) : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 hover:border-slate-300 hover:shadow-md transition-all duration-200 group flex items-center justify-between gap-4">
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        {/* Avatar */}
        <div className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden text-slate-600 font-bold text-sm">
          {avatarSrc ? (
            <img 
              src={avatarSrc} 
              alt={item.fullName} 
              className="w-full h-full object-cover" 
              onError={(e) => {
                // Fallback to text initials on broken image
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <span>{item.fullName.charAt(0).toUpperCase()}</span>
          )}
        </div>

        {/* User Info */}
        <div className="min-w-0 flex-1">
          <Link href={profileUrl}>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
              {item.fullName}
            </h4>
          </Link>
          <div className="flex items-center gap-2 text-xs text-slate-500 truncate">
            {item.userName && <span>@{item.userName}</span>}
            {item.location && (
              <span className="flex items-center gap-0.5">
                <MapPin size={11} className="text-rose-500" /> {item.location}
              </span>
            )}
          </div>
          {item.organizationAffiliation && (
            <div className="flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md mt-1 w-fit">
              <Building2 size={11} />
              <span>{item.organizationAffiliation.name} ({item.organizationAffiliation.role})</span>
            </div>
          )}
          {item.bio && (
            <p className="text-xs text-slate-600 truncate mt-1">{item.bio}</p>
          )}
        </div>
      </div>

      {/* View Profile Action */}
      <Link
        href={profileUrl}
        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 border border-slate-200 px-3 py-1.5 rounded-lg transition shrink-0"
      >
        Profile <ArrowRight size={12} />
      </Link>
    </div>
  );
}
