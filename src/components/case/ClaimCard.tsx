import React, { useState } from 'react';
import { Crown, Users, MoreHorizontal, Camera, Link as LinkIcon, MessageSquare, MessageCircle, ArrowRight, Shield } from 'lucide-react';
import { resolveMediaUrl } from '@/lib/utils';
import OpinionFeed from '@/components/opinion/OpinionFeed';
import StaticTestBadge from '@/components/common/StaticTestBadge';
import MarkdownRenderer from '@/components/shared/MarkdownRenderer';

export default function ClaimCard({ 
  claim, 
  isCreator, 
  caseLocation 
}: { 
  claim: any, 
  isCreator: boolean, 
  caseLocation: string 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showOpinionModal, setShowOpinionModal] = useState(false);

  const dateObj = claim.createdAt ? new Date(claim.createdAt) : new Date();
  const dateStr = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const authorName = claim.creator?.fullName || 'Tanvir Hasan';
  const authorImg = resolveMediaUrl(claim.creator?.userProfile?.profilePicture || claim.creator?.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80';

  // Get thumbnail from first evidence or fallback
  const firstEvidenceMedia = claim.evidence?.[0]?.evidence?.medias?.[0]?.media?.url;
  const thumbUrl = resolveMediaUrl(firstEvidenceMedia) || 'https://images.unsplash.com/photo-1541888059039-2708304a37b3?w=500&q=80';

  const evidenceCount = claim.evidence?.length || 0;
  const sourcesCount = claim.sources?.length || 0;
  const opinionsCount = claim.opinions?.length || 0;
  const discussionsCount = claim.discussions?.length || 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow p-5">
      {/* Top Header Row */}
      <div className="flex justify-between items-center mb-3">
        {isCreator ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/80">
            <Crown size={12} className="text-amber-600" />
            Creator's Claim
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
            <Users size={12} className="text-emerald-600" />
            Community Claim
          </span>
        )}

        <div tabIndex={0} className="text-slate-400 hover:text-slate-600 group relative cursor-pointer p-1">
          <MoreHorizontal size={16} />
          <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-slate-200 hidden group-focus-within:block group-hover:block z-20 cursor-default">
            <div className="p-1">
              <button className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer flex justify-between items-center">
                Report Claim <StaticTestBadge label="TEST" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Body: 2 Columns */}
      <div className="flex flex-col md:flex-row gap-5 justify-between items-start mb-4">
        {/* Left Side: Title, Description, Author */}
        <div className="flex-1 min-w-0">
          <div 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-base sm:text-lg font-bold text-slate-900 leading-snug mb-1.5 hover:text-slate-600 cursor-pointer transition [&_p]:mb-0"
          >
            <div className="whitespace-pre-wrap">{claim.title}</div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <img src={authorImg} alt={authorName} className="w-5 h-5 rounded-full object-cover border border-slate-200" />
            <span className="font-semibold text-slate-700">{authorName}</span>
            <span className="text-slate-300">•</span>
            <span>{dateStr}</span>
          </div>
        </div>

        {/* Right Side: Thumbnail + Actions */}
        <div className="flex flex-col items-end gap-2.5 shrink-0 w-full sm:w-auto">
          <div className="w-full sm:w-44 h-24 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-2xs">
            <img src={thumbUrl} alt={claim.title} className="w-full h-full object-cover hover:scale-105 transition duration-300" />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold text-xs rounded-lg transition flex items-center gap-1 cursor-pointer"
            >
              <span>{isExpanded ? 'Hide Details' : 'View Claim'}</span>
              <ArrowRight size={12} className={isExpanded ? 'rotate-90 transition' : ''} />
            </button>
            <button 
              onClick={() => setShowOpinionModal(!showOpinionModal)}
              className="px-3 py-1.5 bg-slate-600 hover:bg-slate-700 text-white font-semibold text-xs rounded-lg transition shadow-2xs cursor-pointer"
            >
              Give Opinion
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Metrics Bar */}
      <div className="flex items-center gap-5 text-xs text-slate-500 pt-3 border-t border-slate-100">
        <span className="flex items-center gap-1.5 font-medium text-slate-600 hover:text-slate-600 cursor-pointer transition">
          <Camera size={14} className="text-slate-500" />
          <span>{evidenceCount} Evidence</span>
        </span>
        <span className="flex items-center gap-1.5 font-medium text-slate-600 hover:text-emerald-600 cursor-pointer transition">
          <LinkIcon size={14} className="text-emerald-500" />
          <span>{sourcesCount} Sources</span>
        </span>
        <span className="flex items-center gap-1.5 font-medium text-slate-600 hover:text-purple-600 cursor-pointer transition">
          <MessageSquare size={14} className="text-purple-500" />
          <span>{opinionsCount} Opinions</span>
        </span>
        <span className="flex items-center gap-1.5 font-medium text-slate-600 hover:text-amber-600 cursor-pointer transition">
          <MessageCircle size={14} className="text-amber-500" />
          <span>{discussionsCount} Discussions</span>
        </span>
      </div>

      {/* Expanded Claim Details (Evidence & Sources) */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50/70 -mx-5 -mb-5 p-5 rounded-b-2xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Evidence section */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                <Camera size={13} className="text-slate-600" />
                Attached Evidence ({evidenceCount})
              </h4>
              {!claim.evidence || claim.evidence.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No evidence attached yet.</p>
              ) : (
                <div className="space-y-2">
                  {claim.evidence.map((ev: any, i: number) => (
                    <div key={i} className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                        <img src={resolveMediaUrl(ev.evidence?.medias?.[0]?.media?.url) || thumbUrl} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-800 truncate">{ev.evidence?.title || 'Evidence item'}</p>
                        <p className="text-[10px] text-slate-400 truncate">{ev.evidence?.description || 'No description'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sources section */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                <LinkIcon size={13} className="text-emerald-600" />
                Attached Sources ({sourcesCount})
              </h4>
              {!claim.sources || claim.sources.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No sources attached yet.</p>
              ) : (
                <div className="space-y-2">
                  {claim.sources.map((src: any, i: number) => (
                    <div key={i} className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="font-semibold text-slate-800 truncate">{src.source?.title || 'External Source'}</p>
                        <p className="text-[10px] text-slate-400">{src.source?.externalSourceName || 'External link'}</p>
                      </div>
                      <a href={src.source?.externalLinks?.[0] || '#'} target="_blank" rel="noreferrer" className="text-slate-600 hover:text-slate-800 text-[11px] font-semibold shrink-0">
                        Open ↗
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Opinion Composer Drawer / Box */}
      {showOpinionModal && (
        <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50/50 -mx-5 -mb-5 p-5 rounded-b-2xl">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-xs font-bold text-slate-900">Opinions on this Claim</h4>
            <button onClick={() => setShowOpinionModal(false)} className="text-xs text-slate-400 hover:text-slate-600">Close</button>
          </div>
          <OpinionFeed targetType="CLAIM" targetId={claim.id} />
        </div>
      )}
    </div>
  );
}
