import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { TCaseType } from '@/redux/feature/case/case.type';
import { Crown, Users, Camera, Link as LinkIcon, MessageSquare, MessageCircle, FileText, Edit, Plus, MapPin, ArrowUpRight, Menu, X, Search, ChevronDown } from 'lucide-react';
import { resolveMediaUrl, getAvatarUrl } from '@/lib/utils';
import EvidenceSection from './EvidenceSection';
import ClaimUpdatesSection from './ClaimUpdatesSection';
import AssessmentPoll from '@/components/opinion/AssessmentPoll';
import StaticTestBadge from '@/components/common/StaticTestBadge';
import AddEvidenceForm from './AddEvidenceDrawer';
import DiscussionComments from '@/components/shared/DiscussionComments';
import { useGetOpinionsQuery } from '@/redux/feature/opinion/opinion.reducer';
import { useGetAssessmentsQuery, useGetClaimUpdatesQuery } from '@/redux/feature/case/case.reducer';
import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';



export default function ClaimWorkspace({
   caseData,
   selectedClaimId,
   setSelectedClaimId,
   onAddClaimClick
}: {
   caseData: TCaseType,
   selectedClaimId: string | null,
   setSelectedClaimId: (id: string) => void,
   onAddClaimClick: () => void
}) {
   const [activeTab, setActiveTab] = useState<'EVIDENCE' | 'DISCUSSION'>('EVIDENCE');
   const [isAddEvidenceOpen, setIsAddEvidenceOpen] = useState(false);
   const [isClaimsPanelOpen, setIsClaimsPanelOpen] = useState(false);
   const [searchQuery, setSearchQuery] = useState('');
   const [highlightedEvidenceIds, setHighlightedEvidenceIds] = useState<string[]>([]);
   const [highlightedSourceIds, setHighlightedSourceIds] = useState<string[]>([]);
   const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
   const isCaseCreator = Boolean(user && (caseData.author?.id === user.id || (caseData as any).authorId === user.id));
   const canUserCreateClaim = caseData.settings?.canUserCreateClaim ?? true;
   const canUserCreateClaimEvidence = caseData.settings?.canUserCreateClaimEvidence ?? true;

   const showCreateClaimAction = isCaseCreator || canUserCreateClaim;
   const showAddEvidenceInput = isAuthenticated && (isCaseCreator || canUserCreateClaimEvidence);

   const searchParams = useSearchParams();

   useEffect(() => {
      const claimEvids = searchParams?.get('claim_evid')?.split(',').filter(Boolean) || [];
      const claimSrcids = searchParams?.get('claim_srcid')?.split(',').filter(Boolean) || [];

      if (claimEvids.length > 0) setHighlightedEvidenceIds(claimEvids);
      else setHighlightedEvidenceIds([]);

      if (claimSrcids.length > 0) setHighlightedSourceIds(claimSrcids);
      else setHighlightedSourceIds([]);

      // Auto-switch to EVIDENCE tab if we have IDs
      if (claimEvids.length > 0 || claimSrcids.length > 0) {
         setActiveTab('EVIDENCE');
         // Auto scroll down to specific evidence if not already in view
         setTimeout(() => {
            const firstId = claimEvids[0] || claimSrcids[0];
            const el = document.getElementById(`evidence-item-${firstId}`);
            if (el) {
               el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
               const container = document.getElementById('evidence-section-container');
               if (container) container.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
         }, 300);
      }
   }, [searchParams]);

   useEffect(() => {
      const handleEsc = (e: KeyboardEvent) => {
         if (e.key === 'Escape') setIsClaimsPanelOpen(false);
      };
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
   }, []);

   const claims = caseData.claims || [];
   const selectedClaim = claims.find((c: any) => c.id === selectedClaimId) || claims[0];

   const hasEvidence = Boolean(
      (selectedClaim?.evidence && selectedClaim.evidence.length > 0) ||
      (selectedClaim?.sources && selectedClaim.sources.length > 0)
   );
   const showEvidenceTab = showAddEvidenceInput || hasEvidence;

   useEffect(() => {
      if (!showEvidenceTab && activeTab === 'EVIDENCE') {
         setActiveTab('DISCUSSION');
      }
   }, [showEvidenceTab, activeTab]);

   const { data: opinionsResponse } = useGetOpinionsQuery({ targetType: 'CLAIM', targetId: selectedClaim?.id }, { skip: !selectedClaim?.id });
   const { data: assessmentResponse } = useGetAssessmentsQuery(selectedClaim?.id, { skip: !selectedClaim?.id });
   const { data: updatesData } = useGetClaimUpdatesQuery({ claimId: selectedClaim?.id, limit: 100 }, { skip: !selectedClaim?.id });

   const [mentionSuggestions, setMentionSuggestions] = useState<any[]>([]);
   const [userSuggestions, setUserSuggestions] = useState<any[]>([]);

   useEffect(() => {
      const handleFocusTarget = (e: any) => {
         const { targetId, type, id } = e.detail || {};
         if (!targetId && !id) return;

         // If targeting a claim
         if (type === 'CLAIM' || (id && claims.some((c: any) => c.id === id))) {
            const claimIdToSelect = id || (targetId ? targetId.replace('claim-item-', '').replace('claim-', '') : null);
            const matchedClaim = claims.find((c: any) => c.id === claimIdToSelect);
            if (matchedClaim) {
               setSelectedClaimId(matchedClaim.id);
            }
            setTimeout(() => {
               const el = document.getElementById('claim-details-card') || document.getElementById('claim-workspace-container');
               if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  el.classList.add('ring-4', 'ring-sky-400', 'bg-sky-50/50', 'rounded-2xl', 'transition-all', 'duration-500');
                  setTimeout(() => el.classList.remove('ring-4', 'ring-sky-400', 'bg-sky-50/50'), 3500);
               }
            }, 100);
            return;
         }

         // If targeting evidence or source, check which claim has it
         if (type === 'EVIDENCE' || type === 'SOURCE' || targetId?.startsWith('evidence-item-')) {
            const evidId = id || targetId.replace('evidence-item-', '');
            const owningClaim = claims.find((c: any) =>
               c.evidence?.some((e: any) => (e.evidence?.id || e.id) === evidId) ||
               c.sources?.some((s: any) => (s.source?.id || s.id) === evidId)
            );
            if (owningClaim && owningClaim.id !== selectedClaim?.id) {
               setSelectedClaimId(owningClaim.id);
            }
         }

         if (activeTab !== 'EVIDENCE') {
            setActiveTab('EVIDENCE');
         }

         setTimeout(() => {
            const el = document.getElementById(targetId);
            if (el) {
               el.scrollIntoView({ behavior: 'smooth', block: 'center' });
               const ringColor = type === 'UPDATE' ? 'outline-amber-400'
                  : type === 'EVIDENCE' ? 'outline-emerald-400'
                     : type === 'SOURCE' ? 'outline-indigo-400'
                        : 'outline-blue-400';
               const classes = [ringColor, 'outline', 'outline-2', '-outline-offset-2', 'shadow-lg', 'transition-all', 'duration-500', 'z-20', 'rounded-xl'];
               el.classList.add(...classes);
               setTimeout(() => el.classList.remove(...classes), 3000);
            }
         }, 180);
      };
      window.addEventListener('focus-target-item', handleFocusTarget);
      return () => window.removeEventListener('focus-target-item', handleFocusTarget);
   }, [activeTab, claims, selectedClaim]);

   useEffect(() => {
      if (!selectedClaim) return;
      const updates = updatesData?.data?.updates || updatesData?.updates || [];
      const allClaimsSuggestions = claims.map((c: any) => ({
         id: c.id,
         type: 'CLAIM',
         prefix: '#claim-',
         title: c.title,
         author: c.creator?.fullName,
         date: c.createdAt
      }));

      const suggestions = [
         ...allClaimsSuggestions,
         ...updates.map((up: any) => ({
            id: up.id,
            type: 'UPDATE',
            prefix: '#status-',
            title: up.content?.slice(0, 60) + (up.content?.length > 60 ? '...' : ''),
            author: up.author?.fullName || (up.isAnonymous ? 'Anonymous' : 'Contributor'),
            date: up.createdAt
         })),
         ...(selectedClaim.evidence || []).map((e: any) => ({
            id: e.evidence?.id || e.id,
            type: 'EVIDENCE',
            prefix: '#evidence-',
            title: e.evidence?.title || e.title,
            author: e.evidence?.creator?.fullName || e.creator?.fullName,
            date: e.evidence?.createdAt || e.createdAt
         })),
         ...(selectedClaim.sources || []).map((s: any) => ({
            id: s.source?.id || s.id,
            type: 'SOURCE',
            prefix: '#source-',
            title: s.source?.title || s.title,
            author: s.source?.creator?.fullName || s.creator?.fullName,
            date: s.source?.createdAt || s.createdAt
         }))
      ].filter(item => item.id).sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
      setMentionSuggestions(suggestions);

      // Extract User Suggestions for @ mention
      const userMap = new Map<string, any>();
      const registerUser = (u: any, role: string) => {
         if (!u) return;
         const uname = u.userName || (u.fullName ? u.fullName.toLowerCase().replace(/\s+/g, '') : null) || u.id;
         if (!uname) return;
         if (!userMap.has(uname)) {
            userMap.set(uname, {
               id: u.id,
               userName: uname,
               fullName: u.fullName || uname,
               avatar: getAvatarUrl(u),
               role
            });
         }
      };

      if (selectedClaim.creator) registerUser(selectedClaim.creator, 'দাবি প্রস্তুতকারক');
      if ((caseData as any)?.author) registerUser((caseData as any).author, 'লেখক');
      updates.forEach((up: any) => { if (!up.isAnonymous && up.author) registerUser(up.author, 'আপডেট কন্ট্রিবিউটর'); });
      (selectedClaim.evidence || []).forEach((e: any) => {
         const cr = e.evidence?.creator || e.creator;
         if (cr) registerUser(cr, 'প্রমাণ কন্ট্রিবিউটর');
      });
      const allOps = opinionsResponse?.data || [];
      allOps.forEach((op: any) => {
         if (!op.isAnonymous && op.author) registerUser(op.author, 'আলোচক');
         if (op.replies) {
            op.replies.forEach((r: any) => {
               if (!r.isAnonymous && r.author) registerUser(r.author, 'আলোচক');
            });
         }
      });

      setUserSuggestions(Array.from(userMap.values()));
   }, [selectedClaim, updatesData, caseData, opinionsResponse]);

   if (!selectedClaim) {
      return (
         <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
            <p className="text-slate-500 mb-4 font-bold text-sm">এই বিষয়ে এখনও কোনো দাবি যোগ করা হয়নি।</p>
            {isAuthenticated && showCreateClaimAction && (
               <button onClick={onAddClaimClick} className="bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-semibold inline-flex items-center gap-2 hover:bg-slate-700">
                  <Plus size={16} /> দাবি যোগ করুন
               </button>
            )}
         </div>
      );
   }

   // Selected claim details
   const authorId = (caseData as any).authorId || (caseData as any).author?.id;
   const isCreator = (selectedClaim as any).createdBy === authorId || claims.indexOf(selectedClaim) === 0;

   const authorName = selectedClaim.creator?.fullName || 'Tanvir Hasan';
   const authorImg = getAvatarUrl(selectedClaim.creator);
   const dateObj = selectedClaim.createdAt ? new Date(selectedClaim.createdAt) : new Date();
   const dateStr = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

   // Counts for selected claim
   const evidenceCount = selectedClaim.evidence?.length || 0;
   const sourcesCount = selectedClaim.sources?.length || 0;

   const allOpinions = opinionsResponse?.data || [];
   const discussionsCount = allOpinions.filter((op: any) => op.value === 'DISCUSSION').length;

   const opinionsCount = assessmentResponse?.data?.total || 0;


   const filteredClaims = claims.filter((c: any) => c.title?.toLowerCase().includes(searchQuery.toLowerCase()));

   const changeSelectedClaim = (id: string) => {
      setSelectedClaimId(id);
      try {
         const url = new URL(window.location.href);
         url.searchParams.set('claim', id);
         window.history.pushState({}, '', url.toString());
      } catch (_) { }
   };

   return (
      <div id="claim-workspace-container" className="flex flex-col gap-6 items-start w-full relative">
         {/* Main Content */}
         <div className="flex-1 min-w-0 space-y-6 w-full">
            {/* Top Bar with Dropdown */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full mb-4 gap-4">
               {/* Left: Claim Header */}
               <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-100">
                     {isCreator && <Crown size={14} className="text-amber-500" />}
                     <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">দাবি</div>
                  </div>
                  <div className="text-slate-300 font-light">|</div>
                  <div className="text-sm text-slate-500 font-medium">
                     দাবি #{(claims.findIndex((c: any) => c.id === selectedClaim.id) + 1) || 1} of {claims.length}
                  </div>
               </div>

               {/* Right: Dropdown & Nav */}
               <div className="flex items-center gap-2 z-30">


                  <div className="relative flex items-center shrink-0">
                     <button
                        onClick={() => setIsClaimsPanelOpen(!isClaimsPanelOpen)}
                        className="flex items-center gap-2 text-[13px] font-bold text-slate-600 bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm hover:bg-slate-50 transition max-w-[200px]"
                     >
                        {isCreator ? <Crown size={14} className="text-amber-500 shrink-0" /> : <FileText size={14} className="text-slate-500 shrink-0" />}
                        <span className="truncate">{selectedClaim.title}</span>
                        <ChevronDown size={14} className={`shrink-0 transition-transform ${isClaimsPanelOpen ? 'rotate-180' : ''}`} />
                     </button>

                     {/* Dropdown Menu */}
                     {isClaimsPanelOpen && (
                        <>
                           <div className="fixed inset-0 z-40" onClick={() => setIsClaimsPanelOpen(false)} />
                           <div className="absolute top-full right-0 mt-2 w-[320px] bg-white border border-slate-200 rounded-xl shadow-xl z-50 flex flex-col overflow-hidden">
                              <div className="p-3 pb-2">
                                 <div className="relative">
                                    <input
                                       type="text"
                                       placeholder="দাবি খুঁজুন..."
                                       value={searchQuery}
                                       onChange={(e) => setSearchQuery(e.target.value)}
                                       className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 pl-8 focus:bg-white transition-colors"
                                    />
                                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                                 </div>
                              </div>
                              <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-1.5 pt-0">
                                 {filteredClaims.map((claim: any, idx: number) => {
                                    const isSelected = claim.id === selectedClaimId || (!selectedClaimId && claim.id === claims[0]?.id);
                                    const isCreatorClaim = claim.createdBy === authorId || claims.findIndex((c: any) => c.id === claim.id) === 0;

                                    return (
                                       <button
                                          key={claim.id || idx}
                                          onClick={() => {
                                             changeSelectedClaim(claim.id);
                                             setActiveTab('EVIDENCE');
                                             setIsClaimsPanelOpen(false);
                                          }}
                                          className={`w-full text-left p-2.5 rounded-lg transition-all flex items-center gap-2.5 ${isSelected
                                             ? 'bg-slate-50/50 text-slate-900 font-semibold'
                                             : 'bg-white text-slate-700 hover:bg-slate-50'
                                             }`}
                                       >
                                          <div className="shrink-0">
                                             {isCreatorClaim ? <Crown size={14} className="text-amber-500" /> : <FileText size={14} className="text-slate-400" />}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                             <div className="text-sm line-clamp-1" title={claim.title}>
                                                {claim.title}
                                             </div>
                                          </div>
                                       </button>
                                    );
                                 })}
                              </div>
                              {isAuthenticated && showCreateClaimAction && (
                                 <div className="p-2 border-t border-slate-100 bg-slate-50">
                                    <button
                                       onClick={() => {
                                          setIsClaimsPanelOpen(false);
                                          onAddClaimClick();
                                       }}
                                       className="w-full text-center py-2 bg-white border border-slate-200 text-slate-700 font-bold text-[13px] rounded-lg transition-colors hover:bg-slate-100 hover:text-slate-900 flex items-center justify-center gap-2"
                                    >
                                       <Plus size={14} /> নতুন দাবি যোগ করুন
                                    </button>
                                 </div>
                              )}
                           </div>
                        </>
                     )}
                  </div>

                  {/* Prev/Next Nav */}
                  <div className="flex items-center gap-1.5 ml-2">
                     <button
                        onClick={() => {
                           const idx = claims.findIndex((c: any) => c.id === selectedClaim.id);
                           if (idx > 0) {
                              changeSelectedClaim(claims[idx - 1].id);
                              setActiveTab('EVIDENCE');
                           }
                        }}
                        disabled={claims.findIndex((c: any) => c.id === selectedClaim.id) === 0}
                        className="w-7 h-7 flex items-center justify-center bg-white border border-slate-200 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition shrink-0"
                     >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M15 18l-6-6 6-6"></path></svg>
                     </button>
                     <button
                        onClick={() => {
                           const idx = claims.findIndex((c: any) => c.id === selectedClaim.id);
                           if (idx < claims.length - 1) {
                              changeSelectedClaim(claims[idx + 1].id);
                              setActiveTab('EVIDENCE');
                           }
                        }}
                        disabled={claims.findIndex((c: any) => c.id === selectedClaim.id) === claims.length - 1}
                        className="w-7 h-7 flex items-center justify-center bg-white border border-slate-200 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition shrink-0"
                     >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M9 18l6-6-6-6"></path></svg>
                     </button>
                  </div>
               </div>
            </div>

            {/* 2. Claim Details Card */}
            <div id="claim-details-card" className="bg-white rounded-2xl shadow-sm border border-slate-200/90 mb-4 overflow-hidden flex flex-col transition-all duration-300">
               <div className="p-5 sm:p-6 flex flex-col flex-1 overflow-hidden bg-white">
                  <div className="flex mb-5 flex-col xl:flex-row xl:items-center justify-between gap-4 mt-auto">
                     <div className="flex items-center gap-3">
                        <img src={authorImg} alt={authorName} className="w-8 h-8 rounded-full object-cover shrink-0" />
                        <div className="flex items-center gap-1.5 text-[13px] text-slate-500">
                           <span className="font-semibold text-slate-900">{authorName}</span>
                           <div className="w-3.5 h-3.5 bg-slate-500 text-white rounded-full flex items-center justify-center shrink-0">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-2.5 h-2.5"><path d="M20 6L9 17l-5-5"></path></svg>
                           </div>
                           <span className="ml-1">Added this claim · {dateStr}</span>
                        </div>
                     </div>

                     <div className="flex items-center gap-5 text-sm text-slate-700 font-semibold">
                        <div className="flex items-center gap-1.5" title="তথ্য-প্রমাণ"><FileText size={16} className="text-slate-400" /> <span>{evidenceCount}</span></div>
                        <div className="flex items-center gap-1.5" title="উৎস"><LinkIcon size={16} className="text-slate-400" /> <span>{sourcesCount}</span></div>
                        <div className="flex items-center gap-1.5" title="মতামত"><MessageSquare size={16} className="text-slate-400" /> <span>{opinionsCount}</span></div>
                        <div className="flex items-center gap-1.5" title="আলোচনা"><MessageCircle size={16} className="text-slate-400" /> <span>{discussionsCount}</span></div>
                        <button className="text-slate-400 ml-2 hover:text-slate-600 transition"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" /></svg></button>
                     </div>
                  </div>
                  {/* Claim Typography */}
                  <h2 className="text-[16px] xl:text-[18px] font-medium text-slate-700 leading-relaxed mb-6 text-pretty">
                     <span className="text-slate-300 font-serif mr-1 text-lg">"</span>
                     {selectedClaim.title}
                     <span className="text-slate-300 font-serif ml-1 text-lg">"</span>
                  </h2>

                  {/* Footer: Author & Stats inline */}


                  {/* Mini Opinion Section (Inline) */}
                  {/* {isAuthenticated && (
                  <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                     <div className="text-[13px] font-semibold text-slate-600">এই দাবিটি নিয়ে আপনার মতামত কী?</div>
                     <div className="flex flex-wrap items-center gap-2">
                        <button
                           onClick={() => setActiveTab('Opinions')}
                           className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs transition"
                        >
                           🟢 সমর্থন
                        </button>
                        <button
                           onClick={() => setActiveTab('Opinions')}
                           className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 font-bold text-xs transition"
                        >
                           🔴 আপত্তি
                        </button>
                        <button
                           onClick={() => setActiveTab('Opinions')}
                           className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold text-xs transition"
                        >
                           🟡 নিশ্চিত নই
                        </button>
                     </div>
                  </div>
               )} */}
                  {/* Mini Opinion Section (Inline) */}
                  {/* ... */}

               </div>
               {/* Claim Updates / Current Status Timeline (Above Evidence & Sources) */}
               <ClaimUpdatesSection
                  claim={selectedClaim}
                  caseData={caseData}
                  onHighlight={(evIds, srcIds) => {
                     setHighlightedEvidenceIds(evIds);
                     setHighlightedSourceIds(srcIds);
                     if (evIds.length > 0 || srcIds.length > 0) {
                        setActiveTab('EVIDENCE');
                        // Optional: smoothly scroll to the evidence section
                        setTimeout(() => {
                           const firstId = evIds[0] || srcIds[0];
                           const el = document.getElementById(`evidence-item-${firstId}`);
                           if (el) {
                              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                           } else {
                              const container = document.getElementById('evidence-section-container');
                              if (container) container.scrollIntoView({ behavior: 'smooth', block: 'start' });
                           }
                        }, 100);
                     }
                  }}
               />
            </div>



            {/* Claim Evidence & Sources Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 mb-4 flex flex-col relative">
               {/* Tabs */}
               <div className="flex items-center gap-6 border-t border-b border-slate-100 px-5 sm:px-6 pt-2 bg-white">
                  {showEvidenceTab && (
                     <button
                        onClick={() => setActiveTab('EVIDENCE')}
                        className={`pb-3 text-sm font-bold transition-colors relative ${activeTab === 'EVIDENCE' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                     >
                        Claim Evidence & Sources
                        {activeTab === 'EVIDENCE' && <div className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-slate-900 rounded-t-full" />}
                     </button>
                  )}
                  <button
                     onClick={() => setActiveTab('DISCUSSION')}
                     className={`pb-3 text-sm font-bold transition-colors relative ${activeTab === 'DISCUSSION' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                     আলোচনা
                     {activeTab === 'DISCUSSION' && <div className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-slate-900 rounded-t-full" />}
                  </button>
               </div>

               {/* Tab Content */}
               <div className="bg-white pb-2">
                  {showEvidenceTab && activeTab === 'EVIDENCE' && (
                     <div className="pt-4">
                        {showAddEvidenceInput && !isAddEvidenceOpen && (
                           <div className="px-5 sm:px-6 mb-5">
                              <div
                                 onClick={() => setIsAddEvidenceOpen(true)}
                                 className="flex items-center gap-2.5 bg-white border border-slate-200 p-1.5 sm:p-2 rounded-xl cursor-text shadow-sm hover:border-slate-300 hover:shadow transition group"
                              >
                                 <img src={authorImg} alt="User" className="w-7 h-7 rounded-full object-cover shrink-0 ml-1" />
                                 <div className="flex-1 text-[12px] sm:text-[13px] text-slate-400 font-medium bg-transparent outline-none truncate">
                                    আপনার কাছে কি কোনো প্রমাণ বা তথ্য আছে? এখানে পোস্ট করুন...
                                 </div>
                                 <div className="flex items-center gap-3 pr-1 shrink-0">
                                    <div className="flex items-center gap-2 text-slate-400">
                                       <button className="hover:text-slate-600 transition"><Camera size={16} /></button>
                                       <button className="hover:text-slate-600 transition"><LinkIcon size={16} /></button>
                                    </div>
                                    <button className="bg-slate-600 hover:bg-slate-700 text-white font-semibold text-[12px] px-4 py-1.5 rounded-lg transition shadow-sm">
                                       Post
                                    </button>
                                 </div>
                              </div>
                           </div>
                        )}

                        {showAddEvidenceInput && isAddEvidenceOpen && (
                           <div className="px-5 sm:px-6 mb-4">
                              <AddEvidenceForm
                                 isOpen={isAddEvidenceOpen}
                                 onClose={() => setIsAddEvidenceOpen(false)}
                                 caseId={caseData.id}
                                 claimId={selectedClaim.id}
                              />
                           </div>
                        )}
                        <div id="evidence-section-container">
                           <EvidenceSection
                              caseData={{ ...caseData, claims: [selectedClaim] } as any}
                              onAddEvidenceClick={() => setIsAddEvidenceOpen(true)}
                              hideFilter={true}
                              highlightedEvidenceIds={highlightedEvidenceIds}
                              highlightedSourceIds={highlightedSourceIds}
                           />
                        </div>
                     </div>
                  )}

                  {activeTab === 'DISCUSSION' && (
                     <div className="p-5 sm:p-6">
                        <DiscussionComments targetType="CLAIM" targetId={selectedClaim.id} mentionSuggestions={mentionSuggestions} userSuggestions={userSuggestions} />
                     </div>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
}
