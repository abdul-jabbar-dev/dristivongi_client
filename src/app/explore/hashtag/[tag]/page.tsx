'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Hash } from 'lucide-react';
import { useNewsFeedQuery } from '@/redux/feature/case/case.reducer';
import { useGetTagDetailsQuery } from '@/redux/feature/tag/tag.reducer';
import CaseCard from '@/components/CaseCard';

export default function HashtagPage() {
    const params = useParams();
    const tag = params.tag as string;
    
    const { data: tagData, isLoading: isTagLoading } = useGetTagDetailsQuery(tag);
    const { data: casesData, isLoading: isCasesLoading } = useNewsFeedQuery(tag);

    if (isTagLoading || isCasesLoading) {
        return (
            <div className="max-w-2xl mx-auto py-12 px-4 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
            </div>
        );
    }

    if (!tagData?.data && !isTagLoading) {
        return (
            <div className="max-w-2xl mx-auto py-12 px-4 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Hash size={32} className="text-slate-400" />
                </div>
                <h1 className="text-xl font-bold text-slate-800 mb-2">এই নামে এখনও কোনো hashtag নেই।</h1>
                <p className="text-slate-500">আপাতত এই বিষয়ে কোনো কেস পাওয়া যায়নি।</p>
            </div>
        );
    }

    const caseCount = tagData?.data?.caseCount || 0;

    return (
        <div className="max-w-2xl mx-auto pb-20 pt-6 px-4 sm:px-0 space-y-6 animate-in fade-in duration-500">
            
            {/* Header section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-50 text-slate-600 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                    <Hash size={32} strokeWidth={2.5} />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                    #{tagData?.data?.name || tag}
                </h1>
                <p className="text-slate-500 font-medium">
                    {caseCount} {caseCount === 1 ? 'Case' : 'Cases'}
                </p>
            </div>

            {/* Cases list */}
            <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-800 px-1">Recent Cases</h2>
                
                {casesData?.data && casesData.data.length > 0 ? (
                    casesData.data.map((c: any) => (
                        <CaseCard key={c.id} c={c} />
                    ))
                ) : (
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                        <p className="text-slate-500">No cases found for #{tag}.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
