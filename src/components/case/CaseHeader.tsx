import React from 'react';
import StaticTestBadge from '@/components/common/StaticTestBadge';
import { Bookmark, Share2, MoreHorizontal, MapPin, Globe, Images, Plus } from 'lucide-react';
import { resolveMediaUrl } from '@/lib/utils';
import { TCaseType } from '@/redux/feature/case/case.type';

export default function CaseHeader({ caseData }: { caseData: TCaseType }) {
  const dateObj = caseData.createdAt ? new Date(caseData.createdAt) : new Date();
  const dateStr = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const authorName = (caseData as any).author?.fullName || 'Tanvir Hasan';
  const authorRole = (caseData as any).author?.type || 'Citizen';
  const authorImg = resolveMediaUrl((caseData as any).author?.userProfile?.profilePicture || (caseData as any).author?.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80';
  
  // Banner media
  const bannerImg = resolveMediaUrl((caseData as any).medias?.[0]?.media?.url) || 'https://images.unsplash.com/photo-1541888059039-2708304a37b3?w=1600&q=80';
  const categoryName = (caseData as any).category?.name || '';
  const locationName = caseData.location || 'Dhaka, Bangladesh';

  return (
    <div className="mb-6">
      {/* Hero Cover Banner */}
      <div className="relative h-48 sm:h-56 md:h-64 rounded-2xl overflow-hidden shadow-sm border border-slate-200/80 mb-5 bg-slate-900 group">
        <img 
          src={bannerImg} 
          alt={caseData.title}
          className="w-full h-full object-cover group-hover:scale-[1.01] transition duration-500" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
        
        {/* View all media button */}
        <button className="absolute bottom-3 right-3 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white font-medium text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition shadow-sm">
          <Images size={14} />
          <span>View all media</span>
        </button>
      </div>

      {/* Case Details Header Content */}
      <div>
        {/* Category Tag */}
        <div className="mb-2.5">
          <span className="inline-block bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded-md border border-emerald-200/60">
            {categoryName}
          </span>
        </div>

        {/* Title + Action Buttons Row */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug flex-1">
            {caseData.title}
          </h1>

          <div className="flex items-center gap-2 shrink-0">
            <button className="bg-slate-600 hover:bg-slate-700 text-white font-semibold px-4 py-2 rounded-lg text-sm flex items-center gap-1.5 shadow-sm transition">
              <Plus size={15} /> Follow
            </button>
            <button className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium px-3.5 py-2 rounded-lg text-sm transition shadow-2xs">
              <Bookmark size={15} /> Save
            </button>
            <button className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium px-3.5 py-2 rounded-lg text-sm transition shadow-2xs">
              <Share2 size={15} /> Share
            </button>
            <div tabIndex={0} className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg transition relative group cursor-pointer shadow-2xs">
              <MoreHorizontal size={16} />
              <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-lg border border-slate-200 hidden group-focus-within:block group-hover:block z-50 cursor-default">
                 <div className="p-1">
                    <button className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer flex justify-between items-center">
                      Report Content <StaticTestBadge label="TEST" />
                    </button>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Metadata Line */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <img src={authorImg} alt={authorName} className="w-6 h-6 rounded-full object-cover border border-slate-200 shadow-2xs" />
            <span className="font-bold text-slate-800">{authorName}</span>
          </div>

          <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2 py-0.5 rounded-full">
            {authorRole}
          </span>

          <span className="text-slate-300">•</span>
          <span>{dateStr}</span>

          <span className="text-slate-300">•</span>
          <span className="flex items-center gap-1 text-slate-600">
            <MapPin size={13} className="text-slate-400" />
            {locationName}
          </span>

          <span className="text-slate-300">•</span>
          <span className="flex items-center gap-1 text-slate-600">
            <Globe size={13} className="text-slate-400" />
            Public
          </span>
        </div>
      </div>
    </div>
  );
}
