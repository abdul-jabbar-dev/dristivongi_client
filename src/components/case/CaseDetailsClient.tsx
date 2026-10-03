'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import AddClaimDrawer from '@/components/case/AddClaimDrawer';
import CompactCaseDetails from '@/components/case/CompactCaseDetails';
import ClaimWorkspace from '@/components/case/ClaimWorkspace';
import DiscussionComments from '@/components/shared/DiscussionComments';
import AddEvidenceForm from '@/components/case/AddEvidenceDrawer';
import { MessageCircle } from 'lucide-react';
import { useCaseDetailsQuery } from '@/redux/feature/case/case.reducer';
import { useGetOpinionsQuery } from '@/redux/feature/opinion/opinion.reducer';

export default function CaseDetailsClient({ id, initialData, initialOpinions }: { id: string, initialData: any, initialOpinions: any[] }) {
  // We can still use RTK Query for live updates, but skip initial fetch or let it run in background
  const { data: responseData } = useCaseDetailsQuery(id, {
    skip: !initialData, // If we don't have initial data, we might want to fetch, but we do have it
  });
  
  const { data: opinionResponse } = useGetOpinionsQuery({ targetType: 'CASE', targetId: id });
  
  const rawData = responseData?.data || responseData;
  const data = rawData || initialData;
  
  const opinions = opinionResponse?.data || initialOpinions || [];
  
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [isAddClaimModalOpen, setIsAddClaimModalOpen] = useState(false);
  const [isAddCaseEvidenceModalOpen, setIsAddCaseEvidenceModalOpen] = useState(false);
  
  // check if current user is creator (we need auth user, but for now we assume they are if author matches, or we just check if author ID exists)
  // We can just rely on the API to protect it, but to show/hide the button we need a check.
  // We'll just set it to true for now or if we have user context.
  const isCreator = true; // In a real app, you'd check authUser.id === data.authorId

  const counts = {
    claims: data?.claims?.length || 0,
    evidence: data?.claims?.reduce((acc: number, c: any) => acc + (c.evidence?.length || 0), 0) || 0,
    sources: data?.claims?.reduce((acc: number, c: any) => acc + (c.sources?.length || 0), 0) || 0,
    opinions: opinions.length,
    discussion: data?.discussions?.length || 0
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      <div className="max-w-[1400px] mx-auto px-4 pt-6">
        
        {/* Main 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Left Column (Compact Case Details & Case Discussion) */}
          <div className="lg:col-span-6 xl:col-span-6 space-y-6">
             <div className="space-y-6">
                <CompactCaseDetails 
                   caseData={data} 
                   counts={counts} 
                   isCreator={isCreator}
                   onAddEvidenceClick={() => setIsAddCaseEvidenceModalOpen(true)}
                />
                
                {/* Case Dedicated Discussion (Only show here if claims exist) */}
                {counts.claims > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
                     <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
                           <MessageCircle size={16} />
                        </div>
                        <div>
                           <h3 className="font-bold text-slate-900 text-sm">ঘটনা নিয়ে আলোচনা</h3>
                           <p className="text-[10px] text-slate-500">সম্পূর্ণ কেস সম্পর্কে আপনার মতামত জানান</p>
                        </div>
                     </div>
                     <DiscussionComments targetType="CASE" targetId={data.id} />
                  </div>
                )}
             </div>
          </div>

          {/* Right Column (Claim Workspace or Discussion if empty) */}
          <div className="lg:col-span-6 xl:col-span-6 space-y-6 sticky top-6 self-start max-h-[calc(100vh-1.5rem)] overflow-y-auto overscroll-contain [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
             <ClaimWorkspace 
                caseData={data} 
                selectedClaimId={selectedClaimId}
                setSelectedClaimId={setSelectedClaimId}
                onAddClaimClick={() => setIsAddClaimModalOpen(true)}
             />

             {/* Case Dedicated Discussion (Show here if NO claims exist) */}
             {counts.claims === 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
                   <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
                         <MessageCircle size={16} />
                      </div>
                      <div>
                         <h3 className="font-bold text-slate-900 text-sm">ঘটনা নিয়ে আলোচনা</h3>
                         <p className="text-[10px] text-slate-500">সম্পূর্ণ কেস সম্পর্কে আপনার মতামত জানান</p>
                      </div>
                   </div>
                   <DiscussionComments targetType="CASE" targetId={data.id} />
                </div>
             )}
          </div>

        </div>
      </div>

      {/* Add Claim Drawer mapped to state */}
      <AddClaimDrawer 
        isOpen={isAddClaimModalOpen} 
        onClose={() => setIsAddClaimModalOpen(false)} 
        caseId={id} 
      />

      <AddEvidenceForm
         isOpen={isAddCaseEvidenceModalOpen}
         onClose={() => setIsAddCaseEvidenceModalOpen(false)}
         caseId={id}
         isModal={true}
      />

    </div>
  );
}
