'use client';
import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AddClaimDrawer from '@/components/case/AddClaimDrawer';
import CompactCaseDetails from '@/components/case/CompactCaseDetails';
import ClaimWorkspace from '@/components/case/ClaimWorkspace';
import DiscussionComments from '@/components/shared/DiscussionComments';
import AddEvidenceForm from '@/components/case/AddEvidenceDrawer';
import { MessageCircle } from 'lucide-react';
import { useCaseDetailsQuery } from '@/redux/feature/case/case.reducer';
import { useGetOpinionsQuery } from '@/redux/feature/opinion/opinion.reducer';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

function CaseDetailsContent({ id, initialData, initialOpinions }: { id: string, initialData: any, initialOpinions: any[] }) {
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
  
  const searchParams = useSearchParams();
  const queryClaimId = searchParams?.get('claim');
  const queryClaimEvid = searchParams?.get('claim_evid');
  const queryCaseEvid = searchParams?.get('case_evid');
  const queryCaseComtId = searchParams?.get('case_comtid');
  const queryClaimComtId = searchParams?.get('claim_comtid');

  const handleSelectClaim = (claimId: string) => {
    setSelectedClaimId(claimId);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('claim', claimId);
      window.history.pushState({}, '', url.toString());
    } catch (_) {}
  };

  useEffect(() => {
    if (queryClaimId && selectedClaimId !== queryClaimId) {
      setSelectedClaimId(queryClaimId);
    }
  }, [queryClaimId]);

  useEffect(() => {
    const handleFocus = (e: any) => {
      const { id, type } = e.detail || {};
      const claims = data?.claims || [];
      const claimId = id || (type === 'CLAIM' ? id : null);
      if (claimId && claims.some((c: any) => c.id === claimId)) {
        handleSelectClaim(claimId);
        setTimeout(() => {
          const el = document.getElementById('claim-details-card') || document.getElementById('claim-workspace-container');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('ring-4', 'ring-sky-500', 'bg-sky-50/70', 'shadow-2xl', 'rounded-2xl', 'transition-all', 'duration-500');
            setTimeout(() => el.classList.remove('ring-4', 'ring-sky-500', 'bg-sky-50/70', 'shadow-2xl'), 3500);
          }
        }, 150);
      }
    };
    window.addEventListener('focus-target-item', handleFocus);
    return () => window.removeEventListener('focus-target-item', handleFocus);
  }, [data]);
  
  const { user } = useSelector((state: RootState) => state.auth);
  
  // check if current user is creator (we need auth user, but for now we assume they are if author matches, or we just check if author ID exists)
  // We can just rely on the API to protect it, but to show/hide the button we need a check.
  const isCreator = user && (data.author?.id === user.id || data.authorId === user.id);

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

             {/* Empty Claim State Discussion has been moved to Tabs in CompactCaseDetails */}
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
         isNotShowAnonymous={isCreator}
      />

    </div>
  );
}

export default function CaseDetailsClient({ id, initialData, initialOpinions }: { id: string, initialData: any, initialOpinions: any[] }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CaseDetailsContent id={id} initialData={initialData} initialOpinions={initialOpinions} />
    </Suspense>
  );
}
