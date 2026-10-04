'use client';
import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { MoreHorizontal, Users, MessageCircle, Heart, Share2, Bookmark, ArrowRight, Play, FileText, Image as ImageIcon, X } from 'lucide-react';
import { TCaseType } from '@/redux/feature/case/case.type';
import { resolveMediaUrl, formatBengaliTime, toBengaliNumber, removeHashtags , getAvatarUrl} from '@/lib/utils';
import DiscussionComments from '@/components/shared/DiscussionComments';
import MarkdownRenderer from '@/components/shared/MarkdownRenderer';
import LightboxModal from '@/components/shared/LightboxModal';
import { ChevronDown } from 'lucide-react';

const CardMediaPreview = ({ media, resolveMediaUrl }: { media: any, resolveMediaUrl: any }) => {
   if (media.label === 'Photo') {
      return <img src={resolveMediaUrl(media.url)} className="object-cover w-full h-full" alt="evidence" />;
   }
   if (media.label === 'Video') {
      return (
         <div className="relative w-full h-full bg-slate-900 flex items-center justify-center overflow-hidden group">
            <img src={resolveMediaUrl(media.url)} className="object-cover w-full h-full opacity-60 group-hover:opacity-50 transition duration-500 group-hover:scale-105" alt="video thumb" />
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                  <Play size={20} className="text-white fill-white ml-0.5" />
               </div>
            </div>
            <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-[10px] font-bold bg-black/60 px-2 py-1 rounded-md backdrop-blur-md">
               <Play size={10} /> {media.label}
            </div>
         </div>
      );
   }
   return (
      <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-500 relative group hover:bg-slate-200 transition">
         {media.type?.includes('pdf') || media.url?.toLowerCase().endsWith('.pdf') ? (
            <iframe src={`${resolveMediaUrl(media.url)}#toolbar=0&navpanes=0&scrollbar=0&view=Fit`} className="w-full h-full object-cover pointer-events-none" frameBorder="0" scrolling="no" />
         ) : (
            <FileText size={36} className="text-slate-400 mb-2 group-hover:text-slate-500 transition" />
         )}
         <div className="absolute inset-0 z-10" />
         {!media.type?.includes('pdf') && !media.url?.toLowerCase().endsWith('.pdf') && (
            <span className="text-xs font-medium text-center truncate w-full px-2">Document</span>
         )}
         <div className="absolute bottom-2 left-2 flex items-center gap-1 text-slate-700 text-[10px] font-bold bg-slate-300 px-2 py-1 rounded-md z-20">
            <FileText size={10} /> {media.label}
         </div>
      </div>
   );
};

export default function CaseCard({ c }: { c: TCaseType }) {
   const [showComments, setShowComments] = useState(false);
   const timeStr = formatBengaliTime(c.createdAt);


   const [expandedClaims, setExpandedClaims] = useState<Record<string, boolean>>({});
   const [expansionLevel, setExpansionLevel] = useState(0);
   const [contentScrollHeight, setContentScrollHeight] = useState(0);
   const contentRef = useRef<HTMLDivElement>(null);

   React.useEffect(() => {
      if (contentRef.current) {
         setContentScrollHeight(contentRef.current.scrollHeight);
      }
   }, [c.titleHtml, c.title]);
   const claimCount = c._count?.claims ?? c.claims?.length ?? 0;
   const discussionCount = c._count?.discussions ?? c.discussions?.length ?? 0;

   // Calculate evidence and sources from claims
   let evidenceCount = 0;
   let sourcesCount = 0;
   c.claims?.forEach(claim => {
      evidenceCount += claim.evidence?.length || 0;
      sourcesCount += claim.sources?.length || 0;
   });

   // Extract all media from case and claims
   const allMedias: { type: string, url: string, label: string }[] = [];
   c.medias?.forEach(m => {
      const mime = m.media?.type?.toLowerCase() || '';
      let label = 'Photo';
      if (mime.includes('video')) label = 'Video';
      else if (mime.includes('pdf') || mime.includes('document')) label = 'Document';
      allMedias.push({ type: mime || 'IMAGE', url: m.media?.url || '', label });
   });
   c.claims?.forEach(claim => {
      claim.evidence?.forEach(ce => {
         ce.evidence?.medias?.forEach(em => {
            const mime = em.media?.type?.toLowerCase() || '';
            let label = 'Photo';
            if (mime.includes('video')) label = 'Video';
            else if (mime.includes('pdf') || mime.includes('document')) label = 'Document';
            allMedias.push({ type: mime || 'IMAGE', url: em.media?.url || '', label });
         });
      });
   });

   const validMedias = allMedias.filter(m => m.url);
   const [previewIndex, setPreviewIndex] = useState<number | null>(null);

   return (
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">

         {/* Author, Category & Options */}
         <div className="flex items-start justify-between mb-4">
            <Link href={`/profile/${c.author?.userName || c.author?.id || ''}`} className="flex items-center gap-3 group">
               <img src={getAvatarUrl(c.author)} alt="Author" className="w-10 h-10 object-cover rounded-full border border-slate-200 shadow-sm group-hover:shadow-md transition" />
               <div className="flex flex-col">
                  <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition">
                     {c.author?.fullName || c.author?.userName || 'Anonymous'}
                     <span className="font-normal text-slate-500 text-xs ml-1 group-hover:text-slate-600">({c.author?.userName || 'নাগরিক'}, {c.location || 'ঢাকা'})</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                     <span className="font-bold text-slate-600 text-[10px] uppercase tracking-wider">বিষয়</span>
                     <span>·</span>
                     <span>{timeStr}</span>
                  </div>
               </div>
            </Link>

            <button className="text-slate-400 hover:bg-slate-100 rounded-full p-1.5 transition">
               <MoreHorizontal size={18} />
            </button>
         </div>

         {/* Title */}
         <div className="mb-4 relative">
            <div 
               ref={contentRef} 
               className={`text-[15px] text-slate-800 leading-relaxed overflow-hidden transition-all duration-300 ${
                  expansionLevel === 0 ? 'max-h-[400px]' : 
                  expansionLevel === 1 ? 'max-h-[800px]' : 
                  ''
               }`}
            >
               <MarkdownRenderer content={removeHashtags(c.titleHtml || c.title, c.tags?.map(t => t.tag.name) || [])} />
            </div>
            
            {/* Show "See more" if we are at Level 0 and content is > 400px */}
            {expansionLevel === 0 && contentScrollHeight > 400 && (
               <>
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                  <button 
                     onClick={() => setExpansionLevel(1)}
                     className="mt-1 text-sm font-semibold text-slate-600 hover:text-slate-800 transition flex items-center gap-1 relative z-10"
                  >
                     See more <ChevronDown size={14} />
                  </button>
               </>
            )}

            {/* Show "See more" again if we are at Level 1 and content is STILL > 800px */}
            {expansionLevel === 1 && contentScrollHeight > 800 && (
               <>
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                  <Link 
                     href={`/case/${c.id}`}
                     className="mt-1 text-sm font-semibold text-slate-600 hover:text-slate-800 transition flex items-center gap-1 relative z-10"
                  >
                     See more <ChevronDown size={14} className="-rotate-90" />
                  </Link>
               </>
            )}
         </div>

         {/* Stats Row */}
         <div className="flex items-center gap-2 text-xs font-bold bg-slate-50 rounded-lg p-3  border border-slate-100 text-slate-600 flex-wrap">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-slate-500"></div>{toBengaliNumber(claimCount)}টি দাবি</div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>{toBengaliNumber(evidenceCount)}টি তথ্য-প্রমাণ</div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-teal-500"></div>{toBengaliNumber(sourcesCount)}টি উৎস</div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-slate-500"></div>{toBengaliNumber(discussionCount)}টি মতামত</div>
         </div>

         {/* Main Claim */}
         {c.claims && c.claims.length > 0 && (
            <div className="mb-4">
               <p className="text-[10px] mb-2 font-bold text-slate-500">
                  দাবি
               </p>

               <span className="text-slate-500 " >
                  <p
                     className={`text-sm font-semibold text-slate-600 leading-5 ${expandedClaims[c.id] ? '' : 'line-clamp-3'
                        }`}
                  >
                     "{c.claims[0].title}"
                  </p>
                  {(c.claims[0].title?.length || 0) > 150 && (
                     <button
                        type="button"
                        onClick={() =>
                           setExpandedClaims(prev => ({
                              ...prev,
                              [c.id]: !prev[c.id],
                           }))
                        }
                        className="mt-1 text-xs font-medium text-slate-500 hover:text-slate-600 transition-colors flex items-center gap-1"
                     >
                        {expandedClaims[c.id] ? 'Show less' : 'Show more'}
                        <ChevronDown
                           size={14}
                           className={`transition-transform ${expandedClaims[c.id] ? 'rotate-180' : ''
                              }`}
                        />
                     </button>
                  )}
               </span>

            </div>
         )}

         {/* Evidence Section */}
         <div className="mb-4 relative">
            {validMedias.length > 0 && (<div className="flex items-center justify-between mb-2">
               <span className="text-xs font-bold text-slate-600">তথ্য-প্রমাণ ({toBengaliNumber(validMedias.length)}টি আইটেম)</span>
            </div>)}

            {validMedias.length > 0 && (
               <div className="mb-3 rounded-xl overflow-hidden border border-slate-200">
                  <div className="relative">
                     {validMedias.length === 1 && (
                        <div onClick={() => setPreviewIndex(0)} className="relative w-full max-h-[400px] bg-slate-100 flex items-center justify-center overflow-hidden cursor-pointer">
                           <CardMediaPreview media={validMedias[0]} resolveMediaUrl={resolveMediaUrl} />
                        </div>
                     )}
                     {validMedias.length === 2 && (
                        <div className="grid grid-cols-2 gap-1 bg-white h-[300px] cursor-pointer">
                           <div onClick={() => setPreviewIndex(0)} className="relative h-full w-full bg-slate-100 overflow-hidden"><CardMediaPreview media={validMedias[0]} resolveMediaUrl={resolveMediaUrl} /></div>
                           <div onClick={() => setPreviewIndex(1)} className="relative h-full w-full bg-slate-100 overflow-hidden"><CardMediaPreview media={validMedias[1]} resolveMediaUrl={resolveMediaUrl} /></div>
                        </div>
                     )}
                     {validMedias.length === 3 && (
                        <div className="grid grid-cols-2 gap-1 bg-white h-[350px] cursor-pointer">
                           <div onClick={() => setPreviewIndex(0)} className="relative h-full w-full bg-slate-100 overflow-hidden"><CardMediaPreview media={validMedias[0]} resolveMediaUrl={resolveMediaUrl} /></div>
                           <div className="grid grid-rows-2 gap-1 h-full">
                              <div onClick={() => setPreviewIndex(1)} className="relative h-full w-full bg-slate-100 overflow-hidden"><CardMediaPreview media={validMedias[1]} resolveMediaUrl={resolveMediaUrl} /></div>
                              <div onClick={() => setPreviewIndex(2)} className="relative h-full w-full bg-slate-100 overflow-hidden"><CardMediaPreview media={validMedias[2]} resolveMediaUrl={resolveMediaUrl} /></div>
                           </div>
                        </div>
                     )}
                     {validMedias.length === 4 && (
                        <div className="grid grid-rows-2 gap-1 bg-white h-[400px] cursor-pointer">
                           <div onClick={() => setPreviewIndex(0)} className="relative h-full w-full bg-slate-100 overflow-hidden"><CardMediaPreview media={validMedias[0]} resolveMediaUrl={resolveMediaUrl} /></div>
                           <div className="grid grid-cols-3 gap-1 h-full">
                              <div onClick={() => setPreviewIndex(1)} className="relative h-full w-full bg-slate-100 overflow-hidden"><CardMediaPreview media={validMedias[1]} resolveMediaUrl={resolveMediaUrl} /></div>
                              <div onClick={() => setPreviewIndex(2)} className="relative h-full w-full bg-slate-100 overflow-hidden"><CardMediaPreview media={validMedias[2]} resolveMediaUrl={resolveMediaUrl} /></div>
                              <div onClick={() => setPreviewIndex(3)} className="relative h-full w-full bg-slate-100 overflow-hidden"><CardMediaPreview media={validMedias[3]} resolveMediaUrl={resolveMediaUrl} /></div>
                           </div>
                        </div>
                     )}
                     {validMedias.length >= 5 && (
                        <div className="grid grid-rows-[2fr_1fr] gap-1 bg-white h-[450px] cursor-pointer">
                           <div className="grid grid-cols-2 gap-1 h-full">
                              <div onClick={() => setPreviewIndex(0)} className="relative h-full w-full bg-slate-100 overflow-hidden"><CardMediaPreview media={validMedias[0]} resolveMediaUrl={resolveMediaUrl} /></div>
                              <div onClick={() => setPreviewIndex(1)} className="relative h-full w-full bg-slate-100 overflow-hidden"><CardMediaPreview media={validMedias[1]} resolveMediaUrl={resolveMediaUrl} /></div>
                           </div>
                           <div className="grid grid-cols-3 gap-1 h-full">
                              <div onClick={() => setPreviewIndex(2)} className="relative h-full w-full bg-slate-100 overflow-hidden"><CardMediaPreview media={validMedias[2]} resolveMediaUrl={resolveMediaUrl} /></div>
                              <div onClick={() => setPreviewIndex(3)} className="relative h-full w-full bg-slate-100 overflow-hidden"><CardMediaPreview media={validMedias[3]} resolveMediaUrl={resolveMediaUrl} /></div>
                              <div onClick={() => setPreviewIndex(4)} className="relative h-full w-full bg-slate-100 overflow-hidden">
                                 <CardMediaPreview media={validMedias[4]} resolveMediaUrl={resolveMediaUrl} />
                                 {validMedias.length > 5 && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                       <span className="text-white text-3xl font-semibold">+{validMedias.length - 5}</span>
                                    </div>
                                 )}
                              </div>
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            )}
         </div>

         {/* Discussion Stats */}

         {/* Hashtags */}
         {((c as any).tags?.length > 0) && (
            <div className="flex flex-wrap gap-2 items-center mb-3">
               {((c as any).tags as any[]).slice(0, 5).map((caseTag: any) => (
                  <span 
                     key={caseTag.tag?.id || Math.random()}
                     onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `/explore/hashtag/${caseTag.tag.normalizedName}`;
                     }}
                     className="text-slate-600 text-[13px] font-medium cursor-pointer hover:underline transition"
                  >
                     #{caseTag.tag.name}
                  </span>
               ))}
               {((c as any).tags as any[]).length > 5 && (
                  <span className="text-slate-400 text-[13px] font-medium">
                     +{((c as any).tags as any[]).length - 5}
                  </span>
               )}
            </div>
         )}

         {/* Action Bar */}
         <div className="flex flex-wrap items-center justify-between border-t border-slate-100 pt-3 gap-y-3">
            <div className="flex items-center gap-4 text-slate-500">
               <button className="flex items-center gap-1.5 text-[11px] font-bold hover:text-slate-800 transition">
                  <Heart size={14} /> সমর্থন
               </button>
               <button onClick={() => setShowComments(!showComments)} className={`flex items-center gap-1.5 text-[11px] font-bold transition ${showComments ? 'text-slate-600' : 'hover:text-slate-800'}`}>
                  <MessageCircle size={14} /> মতামত দিন
               </button>
               <button className="flex items-center gap-1.5 text-[11px] font-bold hover:text-slate-800 transition">
                  <Share2 size={14} /> শেয়ার করুন
               </button>
               <button className="flex items-center gap-1.5 text-[11px] font-bold hover:text-slate-800 transition">
                  <Bookmark size={14} /> সংরক্ষণ
               </button>
            </div>

            <Link href={`/case/${c.id}`} className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-800 transition">
               সম্পূর্ণ বিষয়টি খুলুন <ArrowRight size={14} />
            </Link>
         </div>

         {/* LinkedIn Style Comments Section */}
         {showComments && (
            <DiscussionComments targetType="CASE" targetId={c.id} />
         )}

         {/* Lightbox Modal */}
         {previewIndex !== null && validMedias[previewIndex] && (
            <LightboxModal 
               medias={validMedias} 
               initialIndex={previewIndex} 
               onClose={() => setPreviewIndex(null)} 
               contextInfo={{
                  authorName: c.author?.fullName || c.author?.userName,
                  authorAvatar: resolveMediaUrl(c.author?.userProfile?.profilePicture || c.author?.avatar),
                  title: 'Case Evidence',
                  content: c.title,
                  date: formatBengaliTime(c.createdAt)
               }}
            />
         )}

      </div>
   );
}
