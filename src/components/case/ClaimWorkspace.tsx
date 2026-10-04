import React, { useState, useEffect } from 'react';
import { TCaseType } from '@/redux/feature/case/case.type';
import { Crown, Users, Camera, Link as LinkIcon, MessageSquare, MessageCircle, FileText, Edit, Plus, MapPin, ArrowUpRight, Menu, X, Search, ChevronDown } from 'lucide-react';
import { resolveMediaUrl , getAvatarUrl} from '@/lib/utils';
import EvidenceSection from './EvidenceSection';
import AssessmentPoll from '@/components/opinion/AssessmentPoll';
import StaticTestBadge from '@/components/common/StaticTestBadge';
import AddEvidenceForm from './AddEvidenceDrawer';
import DiscussionComments from '@/components/shared/DiscussionComments';
import { useGetOpinionsQuery } from '@/redux/feature/opinion/opinion.reducer';
import { useGetAssessmentsQuery } from '@/redux/feature/case/case.reducer';
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
   const [activeTab, setActiveTab] = useState<'Evidence' | 'Sources' | 'Opinions' | 'Discussion'>('Evidence');
   const [isAddEvidenceOpen, setIsAddEvidenceOpen] = useState(false);
   const [isClaimsPanelOpen, setIsClaimsPanelOpen] = useState(false);
   const [searchQuery, setSearchQuery] = useState('');
   const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
   const isCaseCreator = user && (caseData.author?.id === user.id || (caseData as any).authorId === user.id);

   useEffect(() => {
      const handleEsc = (e: KeyboardEvent) => {
         if (e.key === 'Escape') setIsClaimsPanelOpen(false);
      };
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
   }, []);

   const claims = caseData.claims || [];
   const selectedClaim = claims.find((c: any) => c.id === selectedClaimId) || claims[0];

   const { data: opinionsResponse } = useGetOpinionsQuery({ targetType: 'CLAIM', targetId: selectedClaim?.id }, { skip: !selectedClaim?.id });
   const { data: assessmentResponse } = useGetAssessmentsQuery(selectedClaim?.id, { skip: !selectedClaim?.id });

   if (!selectedClaim) {
      return (
         <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
            <p className="text-slate-500 mb-4 font-bold text-sm">এই বিষয়ে এখনও কোনো দাবি যোগ করা হয়নি।</p>
            {isAuthenticated && (
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

   return (
      <div className="flex flex-col gap-6 items-start w-full relative">
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
                                             setSelectedClaimId(claim.id);
                                             setActiveTab('Evidence');
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
                              setSelectedClaimId(claims[idx - 1].id);
                              setActiveTab('Evidence');
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
                              setSelectedClaimId(claims[idx + 1].id);
                              setActiveTab('Evidence');
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
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-4">

               {/* Claim Typography */}
               <h2 className="text-[16px] xl:text-[18px] font-medium text-slate-700 leading-relaxed mb-6 text-pretty">
                  <span className="text-slate-300 font-serif mr-1 text-lg">"</span>
                  {selectedClaim.title}
                  <span className="text-slate-300 font-serif ml-1 text-lg">"</span>
               </h2>

               {/* Footer: Author & Stats inline */}
               <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mt-auto">
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

               {/* Mini Opinion Section (Inline) */}
               {isAuthenticated && (
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
               )}
            </div>

            {/* 3. Sub-Navigation Tabs */}
            <div className="flex flex-wrap gap-3 mb-6 border-b-2 border-transparent">
               {[
                  { id: 'Evidence', label: 'তথ্য-প্রমাণ ও উৎস', icon: <FileText size={16} />, count: evidenceCount + sourcesCount },
                  { id: 'Opinions', label: 'সবার মতামত', icon: <MessageSquare size={16} />, count: opinionsCount },
                  { id: 'Discussion', label: 'আলোচনা', icon: <MessageCircle size={16} />, count: discussionsCount },
               ].map(tab => (
                  <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id as any)}
                     className={`px-5 py-2 text-sm font-semibold whitespace-nowrap rounded-full flex items-center gap-2.5 transition-all border ${activeTab === tab.id
                        ? 'border-slate-600 bg-slate-50/40 text-slate-600'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                  >
                     {React.cloneElement(tab.icon as any, { className: activeTab === tab.id ? 'text-slate-600' : 'text-slate-400' })}
                     {tab.label}
                     <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[11px] font-bold ${activeTab === tab.id ? 'bg-slate-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {tab.count}
                     </span>
                  </button>
               ))}
            </div>

            {/* 4. Tab Content */}
            <div className="pt-4">
               {activeTab === 'Evidence' && (
                  <div>
                     {isCaseCreator && !isAddEvidenceOpen && (
                        <div
                           onClick={() => setIsAddEvidenceOpen(true)}
                           className="mb-6 flex items-center gap-3 bg-white border border-slate-200 p-2 sm:p-2.5 rounded-2xl cursor-text shadow-sm hover:border-slate-300 hover:shadow transition group"
                        >
                           <img src={authorImg} alt="User" className="w-9 h-9 rounded-full object-cover shrink-0 ml-1" />
                           <div className="flex-1 text-[13px] sm:text-[14px] text-slate-400 font-medium bg-transparent outline-none truncate">
                              আপনার কাছে কি কোনো প্রমাণ বা তথ্য আছে? এখানে পোস্ট করুন...
                           </div>
                           <div className="flex items-center gap-4 pr-1 shrink-0">
                              <div className="flex items-center gap-3 text-slate-400">
                                 <button className="hover:text-slate-600 transition"><Camera size={18} /></button>
                                 <button className="hover:text-slate-600 transition"><LinkIcon size={18} /></button>
                              </div>
                              <button className="bg-slate-600 hover:bg-slate-700 text-white font-semibold text-[14px] px-6 py-2 rounded-xl transition shadow-sm">
                                 Post
                              </button>
                           </div>
                        </div>
                     )}

                     {isCaseCreator && (
                        <AddEvidenceForm
                           isOpen={isAddEvidenceOpen}
                           onClose={() => setIsAddEvidenceOpen(false)}
                           caseId={caseData.id}
                           claimId={selectedClaim.id}
                        />
                     )}

                     <EvidenceSection caseData={{ ...caseData, claims: [selectedClaim] } as any} onAddEvidenceClick={() => setIsAddEvidenceOpen(true)} />
                  </div>
               )}

               {activeTab === 'Opinions' && (
                  <AssessmentPoll claimId={selectedClaim.id} />
               )}

               {activeTab === 'Discussion' && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
                     <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                           <MessageCircle size={20} />
                        </div>
                        <div>
                           <h3 className="font-bold text-slate-900">আলোচনা ({discussionsCount}) <StaticTestBadge label="TEST FEATURE" /></h3>
                           <p className="text-xs text-slate-500">এই দাবি নিয়ে আলোচনা করুন...</p>
                        </div>
                     </div>

                     <DiscussionComments targetType="CLAIM" targetId={selectedClaim.id} />
                  </div>
               )}
            </div>
         </div>
      </div>
   );
}
