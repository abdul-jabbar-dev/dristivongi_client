import React from 'react';
import { Bookmark, Share2, MapPin, Globe, Images, Plus, FileText, Camera, Link as LinkIcon, MessageSquare, MessageCircle, Info } from 'lucide-react';
import { resolveMediaUrl, removeHashtags, formatBengaliTime , getAvatarUrl} from '@/lib/utils';
import { TCaseType } from '@/redux/feature/case/case.type';
import MarkdownRenderer from '@/components/shared/MarkdownRenderer';
import EvidenceSection from '@/components/case/EvidenceSection';
import MediaGrid from '@/components/shared/MediaGrid';

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
  const dateObj = caseData.createdAt ? new Date(caseData.createdAt) : new Date();
  const dateStr = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const authorName = (caseData as any).author?.fullName || 'Tanvir Hasan';
  const authorRole = (caseData as any).author?.type || 'Citizen';
  const authorImg = getAvatarUrl((caseData as any).author);
  
  const bannerImg = resolveMediaUrl((caseData as any).medias?.[0]?.media?.url);
  const categoryName = (caseData as any).category?.name || '';
  const locationName = caseData.location || 'Dhaka, Bangladesh';

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
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5 text-slate-500 font-semibold" title="Claims"><FileText size={14}/><span className="text-slate-900 text-sm">{counts.claims}</span></div>
                <div className="flex items-center gap-1.5 text-emerald-600 font-semibold" title="Evidence"><Camera size={14}/><span className="text-slate-900 text-sm">{counts.evidence}</span></div>
                <div className="flex items-center gap-1.5 text-amber-500 font-semibold" title="Sources"><LinkIcon size={14}/><span className="text-slate-900 text-sm">{counts.sources}</span></div>
                <div className="flex items-center gap-1.5 text-purple-500 font-semibold" title="Opinions"><MessageSquare size={14}/><span className="text-slate-900 text-sm">{counts.opinions}</span></div>
                <div className="flex items-center gap-1.5 text-rose-500 font-semibold" title="Discussions"><MessageCircle size={14}/><span className="text-slate-900 text-sm">{counts.discussion}</span></div>
              </div>

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
             <div className="flex flex-wrap gap-3 items-center">
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
        </div>
      </div>

      {/* Case Evidence Section */}
      {((caseData as any).evidence?.length > 0 || (caseData as any).sources?.length > 0) && (
         <div className="mt-4">
             <h3 className="font-bold px-3 text-slate-900 text-sm mb-3">Case Evidence & Sources</h3>
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
         </div>
      )}

    </div>
  );
}
