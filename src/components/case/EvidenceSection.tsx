import React, { useState } from 'react';
import { TCaseType } from '@/redux/feature/case/case.type';
import { resolveMediaUrl, formatBengaliTime } from '@/lib/utils';
import { FileText, Camera, Link as LinkIcon, User, Flag, ArrowUpRight } from 'lucide-react';
import MediaGrid from '@/components/shared/MediaGrid';
import EvidenceValidation from './EvidenceValidation';

export default function EvidenceSection({ caseData, onAddEvidenceClick, hideFilter }: { caseData: TCaseType, onAddEvidenceClick?: () => void, hideFilter?: boolean }) {
   const [filterType, setFilterType] = useState<'ALL' | 'SUPPORTS' | 'CHALLENGES' | 'CONTEXT'>('ALL');

   const selectedClaim = caseData.claims?.[0];
   if (!selectedClaim) return null;

   const rawEvidence = selectedClaim.evidence || [];
   const rawSources = selectedClaim.sources || [];

   // Compose Evidence Packages by matching creator and approximate time, or just list them.
   // For simplicity, we can treat each Evidence as a package, and attach any Source created by the same user around the same time.
   // Or simply map Evidence and Sources into a unified list of "Contributions".
   const contributions: any[] = [];

   const matchedSourceIds = new Set();

   rawEvidence.forEach((evRel: any) => {
      const ev = evRel.evidence;
      if (!ev) return;

      // Find a source by the same creator to pair, matching timestamps within 10 seconds
      const pairedSourceRel = rawSources.find((srcRel: any) => {
         if (srcRel.source?.createdBy !== ev.submittedBy) return false;
         if (matchedSourceIds.has(srcRel.source?.id)) return false;

         const evTime = new Date(ev.createdAt).getTime();
         const srcTime = new Date(srcRel.source?.createdAt).getTime();
         return Math.abs(evTime - srcTime) < 10000; // within 10 seconds
      });

      if (pairedSourceRel) {
         matchedSourceIds.add(pairedSourceRel.source.id);
      }

      const creatorId = ev.submittedBy;
      const creatorName = ev.creator?.fullName || ev.creator?.userName;
      const isMainAuthor = creatorId === caseData.author?.id;
      const authorLabel = isMainAuthor ? 'মূল লেখক' : (creatorName || 'নাম প্রকাশে অনিচ্ছুক');

      contributions.push({
         id: ev.id,
         type: 'EVIDENCE',
         title: ev.title,
         mediaCount: ev.medias?.length || 0,
         medias: ev.medias?.map((m: any) => ({
            url: resolveMediaUrl(m.media?.url),
            type: m.media?.type
         })) || [],
         relationship: evRel.relationship,
         creatorLabel: authorLabel,
         isMainAuthor: isMainAuthor,
         createdAt: ev.createdAt,
         source: pairedSourceRel ? pairedSourceRel.source : null
      });
   });

   rawSources.forEach((srcRel: any) => {
      const src = srcRel.source;
      if (!src || matchedSourceIds.has(src.id)) return;
      const creatorId = src.createdBy;
      const creatorName = src.creator?.fullName || src.creator?.userName;
      const isMainAuthor = creatorId === caseData.author?.id;
      const authorLabel = isMainAuthor ? 'মূল লেখক' : (creatorName || 'নাম প্রকাশে অনিচ্ছুক');

      contributions.push({
         id: src.id,
         type: 'SOURCE_ONLY',
         title: src.title,
         sourceName: src.externalSourceName,
         externalLinks: src.externalLinks || [],
         relationship: srcRel.relationship,
         creatorLabel: authorLabel,
         isMainAuthor: isMainAuthor,
         createdAt: src.createdAt,
      });
   });

   contributions.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

   const filteredContributions = filterType === 'ALL'
      ? contributions
      : contributions.filter(c => c.relationship === filterType);

   const supportsCount = contributions.filter(c => c.relationship === 'SUPPORTS').length;
   const challengesCount = contributions.filter(c => c.relationship === 'CHALLENGES').length;
   const contextCount = contributions.filter(c => c.relationship === 'CONTEXT').length;

   return (
      <div className="space-y-4">
         {/* Filter Bar */}
         {!hideFilter && (
            <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-slate-100">
               <button
                  onClick={() => setFilterType('ALL')}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition ${filterType === 'ALL'
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                     }`}
               >
                  All {contributions.length}
               </button>
               <button
                  onClick={() => setFilterType('SUPPORTS')}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition ${filterType === 'SUPPORTS'
                        ? 'bg-emerald-100 text-emerald-800 shadow-sm border border-emerald-200'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                     }`}
               >
                  Supports {supportsCount}
               </button>
               <button
                  onClick={() => setFilterType('CHALLENGES')}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition ${filterType === 'CHALLENGES'
                        ? 'bg-rose-100 text-rose-800 shadow-sm border border-rose-200'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                     }`}
               >
                  Challenges {challengesCount}
               </button>
               <button
                  onClick={() => setFilterType('CONTEXT')}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition ${filterType === 'CONTEXT'
                        ? 'bg-slate-100 text-slate-800 shadow-sm border border-slate-200'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                     }`}
               >
                  Context {contextCount}
               </button>
            </div>
         )}

         {/* List of Evidence Packages */}
         {contributions.length === 0 ? (
            <div className="text-center pb-4">

            </div>
         ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
               {filteredContributions.map((c: any) => {
                  const isSupports = c.relationship === 'SUPPORTS';
                  const isChallenges = c.relationship === 'CHALLENGES';
                  const relText = isSupports ? 'এই তথ্য দাবিটিকে সমর্থন করে' : isChallenges ? 'এই তথ্য দাবিটির বিরোধিতা করে' : 'এই তথ্য দাবিটির প্রেক্ষাপট দেয়';
                  const relIcon = isSupports ? '🟢' : isChallenges ? '🔴' : '🟡';
                  const borderColor = isSupports ? 'border-emerald-300' : isChallenges ? 'border-rose-300' : 'border-amber-300';

                  return (
                     <div key={c.id} className={`pl-4 py-3 border-l-4 ${borderColor} transition-colors mb-2`}>
                        {/* Meta Info Header */}
                        <div className="flex items-start justify-between mb-3 pb-3 border-b border-slate-100">
                           <div className="flex flex-col gap-1.5">
                              <div className="flex items-center gap-2 text-[10px] font-medium">
                                 {!hideFilter && (
                                    <>
                                       <div className={`flex items-center gap-1 font-bold ${c.isMainAuthor ? 'text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded' : 'text-slate-500'}`}>
                                          <User size={12} /> {c.creatorLabel}
                                       </div>
                                       <span className="text-slate-300">·</span>
                                    </>
                                 )}
                                 <span className="text-slate-500">{formatBengaliTime(c.createdAt)}</span>
                              </div>
                              <div className="flex items-center gap-1.5 font-semibold text-xs">
                                 {relIcon} <span className={isSupports ? 'text-emerald-700' : isChallenges ? 'text-rose-700' : 'text-slate-700'}>{relText}</span>
                              </div>
                           </div>

                           {/* {!hideFilter && (
                    <div className="flex items-center gap-3">
                       <button className="text-slate-600 font-bold text-xs hover:underline">View</button>
                       <button className="text-slate-400 hover:text-slate-600 transition"><Flag size={14}/></button>
                    </div>
                  )} */}
                        </div>

                        <p className="text-slate-900 font-medium text-sm leading-snug mb-2">
                           "{c.title}"
                        </p>

                        {c.type === 'EVIDENCE' && c.medias && c.medias.length > 0 && (
                           <div className="mb-2">
                              <MediaGrid
                                 medias={c.medias}
                                 compactMode={!hideFilter}
                                 contextInfo={{
                                    authorName: c.author?.fullName || c.author?.userName || 'Anonymous',
                                    authorAvatar: resolveMediaUrl(c.author?.userProfile?.profilePicture || c.author?.avatar),
                                    title: c.type === 'EVIDENCE' ? 'Evidence' : 'Source',
                                    content: c.title + (c.description ? '\n\n' + c.description : ''),
                                    date: formatBengaliTime(c.createdAt),
                                    links: c.source?.externalLinks ? c.source.externalLinks.map((l: string) => ({ url: l })) : []
                                 }}
                              />
                           </div>
                        )}

                        {c.source && (
                           <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 mb-2 hover:border-slate-300 transition group">
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                 <LinkIcon size={12} /> Source Links
                              </div>
                              <div className="font-semibold text-slate-800 text-sm">{c.source.title || c.source.externalSourceName}</div>
                              {c.source.externalLinks && c.source.externalLinks.length > 0 && (
                                 <div className="flex flex-col gap-1.5 mt-2">
                                    {c.source.externalLinks.map((link: string, idx: number) => {
                                       try {
                                          const url = new URL(link);
                                          return (
                                             <a key={idx} href={link} target="_blank" rel="noreferrer" className="flex items-center justify-between px-2.5 py-2 rounded-md bg-white border border-slate-100 hover:border-slate-300 hover:shadow-sm transition group/link">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                   <img src={`https://www.google.com/s2/favicons?domain=${url.hostname}&sz=32`} alt="icon" className="w-4 h-4 rounded-sm shrink-0" />
                                                   <span className="text-xs font-medium text-slate-700 group-hover/link:text-slate-700 truncate">{url.hostname.replace('www.', '')}</span>
                                                </div>
                                                <ArrowUpRight size={12} className="text-slate-400 group-hover/link:text-slate-600 shrink-0 opacity-0 group-hover/link:opacity-100 transition" />
                                             </a>
                                          );
                                       } catch (e) {
                                          return (
                                             <a key={idx} href={link} target="_blank" rel="noreferrer" className="text-xs text-slate-600 hover:underline break-all block">{link}</a>
                                          );
                                       }
                                    })}
                                 </div>
                              )}
                           </div>
                        )}

                        {c.type === 'SOURCE_ONLY' && (
                           <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 mb-2 hover:border-slate-300 transition group">
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                 <LinkIcon size={12} /> Source Links
                              </div>
                              <div className="font-semibold text-slate-800 text-sm">{c.title || c.sourceName}</div>
                              {c.externalLinks && c.externalLinks.length > 0 && (
                                 <div className="flex flex-col gap-1.5 mt-2">
                                    {c.externalLinks.map((link: string, idx: number) => {
                                       try {
                                          const url = new URL(link);
                                          return (
                                             <a key={idx} href={link} target="_blank" rel="noreferrer" className="flex items-center justify-between px-2.5 py-2 rounded-md bg-white border border-slate-100 hover:border-slate-300 hover:shadow-sm transition group/link">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                   <img src={`https://www.google.com/s2/favicons?domain=${url.hostname}&sz=32`} alt="icon" className="w-4 h-4 rounded-sm shrink-0" />
                                                   <span className="text-xs font-medium text-slate-700 group-hover/link:text-slate-700 truncate">{url.hostname.replace('www.', '')}</span>
                                                </div>
                                                <ArrowUpRight size={12} className="text-slate-400 group-hover/link:text-slate-600 shrink-0 opacity-0 group-hover/link:opacity-100 transition" />
                                             </a>
                                          );
                                       } catch (e) {
                                          return (
                                             <a key={idx} href={link} target="_blank" rel="noreferrer" className="text-xs text-slate-600 hover:underline break-all block">{link}</a>
                                          );
                                       }
                                    })}
                                 </div>
                              )}
                           </div>
                        )}

                        <EvidenceValidation evidenceId={c.id || c.evidenceId} />

                     </div>
                  );
               })}
            </div>
         )}
      </div>
   );
}
