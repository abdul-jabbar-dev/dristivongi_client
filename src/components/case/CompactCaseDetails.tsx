import React, { useState } from 'react';
import { Bookmark, Share2, MapPin, Globe, Images, Plus, FileText, Camera, Link as LinkIcon, MessageSquare, MessageCircle, Info } from 'lucide-react';
import { resolveMediaUrl, removeHashtags, formatBengaliTime , getAvatarUrl} from '@/lib/utils';
import { TCaseType } from '@/redux/feature/case/case.type';
import MarkdownRenderer from '@/components/shared/MarkdownRenderer';
import EvidenceSection from '@/components/case/EvidenceSection';
import MediaGrid from '@/components/shared/MediaGrid';
import DiscussionComments from '@/components/shared/DiscussionComments';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useSubmitCaseReactionMutation } from '@/redux/feature/case/case.reducer';
import { toBengaliNumber } from '@/lib/utils';

export default function CompactCaseDetails({ 
  caseData,
  counts,
  isCreator,
  onAddEvidenceClick
}: { 
  caseData: TCaseType,
  counts: { claims: number, evidence: number, sources: number, opinions: number, discussion: number },
  isCreator?: boolean,
  onAddEvidenceClick?: () => void
}) {
  const [activeTab, setActiveTab] = useState<'EVIDENCE' | 'DISCUSSION'>('EVIDENCE');
  const dateObj = caseData.createdAt ? new Date(caseData.createdAt) : new Date();
  const dateStr = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const authorName = (caseData as any).author?.fullName || 'Tanvir Hasan';
  const authorRole = (caseData as any).author?.type || 'Citizen';
  const authorImg = getAvatarUrl((caseData as any).author);
  
  const bannerImg = resolveMediaUrl((caseData as any).medias?.[0]?.media?.url);
  const categoryName = (caseData as any).category?.name || '';
  const locationName = caseData.location || 'Dhaka, Bangladesh';
  const [submitReaction] = useSubmitCaseReactionMutation();

  const caseMedias = ((caseData as any).medias || []).map((m: any) => ({
    url: m.media?.url,
    type: m.media?.type || 'IMAGE',
  })).filter((m: any) => m.url);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Cover Image removed to match clean reference layout */}

      <div className="p-5 sm:p-6 flex flex-col flex-1 overflow-hidden bg-white">
        
        <div className="shrink-0">
          {/* Top Bar: Metadata, Stats & Actions */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-y-4 mb-6 pb-5 border-b border-slate-100">
            
            {/* Left: Author, Location, Date */}
            <div className="flex items-start gap-3 text-slate-500 font-medium">
               <img src={authorImg} alt={authorName} className="w-10 h-10 rounded-full object-cover shrink-0" />
               <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5">
                     <span className="font-semibold text-slate-900 text-[15px]">{authorName}</span>
                     <div className="w-3.5 h-3.5 bg-slate-500 text-white rounded-full flex items-center justify-center shrink-0">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-2.5 h-2.5"><path d="M20 6L9 17l-5-5"></path></svg>
                     </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[13px]">
                     <span>{authorRole} · {locationName}</span>
                     <span className="text-slate-300">•</span>
                     <span>{dateStr}</span>
                  </div>
               </div>
            </div>

            {/* Right: Stats and Button */}
            <div className="flex flex-wrap items-center gap-4 self-start xl:self-auto">
              {isCreator && (
                <button 
                  onClick={onAddEvidenceClick}
                  className="bg-emerald-50 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 font-semibold px-3 py-1.5 rounded-lg text-[13px] flex items-center gap-1.5 transition shrink-0"
                >
                  <Plus size={14} /> Add Evidence
                </button>
              )}
            </div>
          </div>

          <div className="text-[15px] text-slate-800 leading-relaxed mb-4">
            <MarkdownRenderer content={removeHashtags(caseData.titleHtml || caseData.title, (caseData as any).tags?.map((t: any) => t.tag.name) || [])} />
          </div>
          
          {((caseData as any).descriptionHtml || (caseData as any).description) && (
             <div className="text-[15px] text-slate-700 leading-relaxed font-normal mb-6">
               <MarkdownRenderer content={removeHashtags((caseData as any).descriptionHtml || (caseData as any).description, (caseData as any).tags?.map((t: any) => t.tag.name) || [])} />
             </div>
          )}

          {caseMedias.length > 0 && (
             <div className="mb-6">
                <MediaGrid 
                   medias={caseMedias} 
                   contextInfo={{
                      authorName: (caseData as any).author?.fullName || (caseData as any).author?.userName,
                      authorAvatar: resolveMediaUrl((caseData as any).author?.userProfile?.profilePicture || (caseData as any).author?.avatar),
                      title: 'Case Overview',
                      content: caseData.title + ((caseData as any).description ? '\n\n' + (caseData as any).description : ''),
                      date: formatBengaliTime(caseData.createdAt)
                   }}
                />
             </div>
          )}
           {/* Hashtags */}
           {((caseData as any).tags?.length > 0) && (
              <div className="flex flex-wrap gap-3 items-center mb-6">
                 {(caseData as any).tags.map((caseTag: any) => (
                    <span 
                       key={caseTag.tag?.id || Math.random()}
                       onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `/explore/hashtag/${caseTag.tag.normalizedName}`;
                       }}
                       className="text-slate-600 text-[14px] font-medium cursor-pointer hover:underline transition"
                    >
                       #{caseTag.tag.name}
                    </span>
                 ))}
              </div>
           )}

           {/* Reaction Counts & Action Bar */}
           <div className="mt-auto">
              <div className="flex flex-wrap items-center gap-2 mb-0 text-[11px] text-slate-500 font-medium bg-slate-50 pr-3 py-2 rounded-lg w-fit">
                 {(caseData.reaction?.support ?? 0) > 0 && <span className="flex items-center gap-1">👍 {toBengaliNumber(caseData.reaction?.support || 0)}</span>}
                 {(caseData.reaction?.oppose ?? 0) > 0 && <span className="flex items-center gap-1">👎 {toBengaliNumber(caseData.reaction?.oppose || 0)}</span>}
                 {((caseData.reaction?.support ?? 0) > 0 || (caseData.reaction?.oppose ?? 0) > 0) && <span className="text-slate-300 mx-1">|</span>}
                 {(counts.claims > 0) && <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div> {toBengaliNumber(counts.claims)}টি দাবি</span>}
                 {(counts.claims > 0) && <span className="text-slate-300">|</span>}
                 {(counts.evidence > 0) && <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> {toBengaliNumber(counts.evidence)}টি তথ্য-প্রমাণ</span>}
                 {(counts.evidence > 0) && <span className="text-slate-300">|</span>}
                 {(counts.sources > 0) && <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div> {toBengaliNumber(counts.sources)}টি উৎস</span>}
                 {(counts.sources > 0) && <span className="text-slate-300">|</span>}
                 {(counts.opinions > 0) && <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div> {toBengaliNumber(counts.opinions)}টি মতামত</span>}
              </div>
              <div className="flex flex-wrap items-center justify-between border-t border-slate-100 pt-0 gap-y-3">
                 <div className="flex items-center gap-5 text-slate-500">
                    <button 
                       onClick={() => submitReaction({ caseId: caseData.id, value: caseData.reaction?.currentUserReaction === 'SUPPORT' ? 'NONE' : 'SUPPORT' })}
                       className={`flex items-center gap-1.5 text-[13px] font-bold transition ${caseData.reaction?.currentUserReaction === 'SUPPORT' ? 'text-blue-600' : 'hover:text-slate-800'}`}>
                       <ThumbsUp size={18} className={caseData.reaction?.currentUserReaction === 'SUPPORT' ? 'fill-current' : ''} /> সমর্থন
                    </button>
                    <button 
                       onClick={() => submitReaction({ caseId: caseData.id, value: caseData.reaction?.currentUserReaction === 'OPPOSE' ? 'NONE' : 'OPPOSE' })}
                       className={`flex items-center gap-1.5 text-[13px] font-bold transition ${caseData.reaction?.currentUserReaction === 'OPPOSE' ? 'text-red-600' : 'hover:text-slate-800'}`}>
                       <ThumbsDown size={18} className={caseData.reaction?.currentUserReaction === 'OPPOSE' ? 'fill-current' : ''} /> অসমর্থন
                    </button>
                    <button className="flex items-center gap-1.5 text-[13px] font-bold hover:text-slate-800 transition">
                       <Share2 size={18} /> শেয়ার করুন
                    </button>
                 </div>
              </div>
           </div>

         </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-slate-100 px-5 sm:px-6 pt-2 mt-4">
          <button
             onClick={() => setActiveTab('EVIDENCE')}
             className={`pb-3 text-sm font-bold transition-colors relative ${activeTab === 'EVIDENCE' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
             Case Evidence & Sources
             {activeTab === 'EVIDENCE' && <div className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-slate-900 rounded-t-full" />}
          </button>
          <button
             onClick={() => setActiveTab('DISCUSSION')}
             className={`pb-3 text-sm font-bold transition-colors relative ${activeTab === 'DISCUSSION' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
             ঘটনা নিয়ে আলোচনা
             {activeTab === 'DISCUSSION' && <div className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-slate-900 rounded-t-full" />}
          </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white pb-2">
         {activeTab === 'EVIDENCE' && (
            <div className="pt-4">
               {((caseData as any).evidence?.length > 0 || (caseData as any).sources?.length > 0) ? (
                  <EvidenceSection 
                     caseData={{
                        ...caseData,
                        author: caseData.author,
                        claims: [{
                           evidence: (caseData as any).evidence || [],
                           sources: (caseData as any).sources || []
                        } as any]
                     } as any}
                     onAddEvidenceClick={onAddEvidenceClick}
                     hideFilter={true}
                  />
               ) : (
                  <div className="text-center py-6">
                     <p className="text-slate-500 text-sm font-medium mb-3">এই কেসটির বিষয়ে কোনো তথ্য নেই।</p>
                     <button onClick={onAddEvidenceClick} className="text-xs text-slate-600 font-bold bg-slate-50 px-3 py-2 rounded-lg hover:bg-slate-100 transition inline-flex items-center gap-1.5">
                        + তথ্য যোগ করুন
                     </button>
                  </div>
               )}
            </div>
         )}
         
         {activeTab === 'DISCUSSION' && (
            <div className="p-5 sm:p-6">
                <DiscussionComments targetType="CASE" targetId={caseData.id} />
            </div>
         )}
      </div>

    </div>
  );
}
