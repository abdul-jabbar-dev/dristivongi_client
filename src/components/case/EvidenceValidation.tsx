import React from 'react';
import { useGetEvidenceValidationQuery, useSubmitEvidenceValidationMutation } from '@/redux/feature/case/case.reducer';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { Check, X } from 'lucide-react';

export default function EvidenceValidation({ evidenceId }: { evidenceId: string }) {
    const { data, isLoading } = useGetEvidenceValidationQuery(evidenceId);
    const [submitValidation, { isLoading: isSubmitting }] = useSubmitEvidenceValidationMutation();
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);

    if (isLoading) {
        return <div className="text-xs text-slate-400 mt-3 animate-pulse">Loading validation...</div>;
    }

    const validationData = data?.data || {
        validPercentage: 0,
        invalidPercentage: 0,
        total: 0,
        currentUserVote: null
    };

    const handleVote = (value: 'VALID' | 'INVALID') => {
        if (!isAuthenticated) {
            // In a real app, trigger login modal. Here we might just alert.
            alert("Please log in to vote.");
            return;
        }
        submitValidation({ evidenceId, value });
    };

    return (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">তথ্য-প্রমাণ যাচাই</span>
            
            {isAuthenticated ? (
                <div className="flex items-center gap-1 bg-slate-50 rounded-lg p-0.5 border border-slate-100">
                    <button
                        onClick={() => handleVote('VALID')}
                        disabled={isSubmitting}
                        title="Mark as valid"
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                            validationData.currentUserVote === 'VALID' 
                            ? 'bg-emerald-500 text-white shadow-sm' 
                            : 'text-slate-500 hover:text-emerald-600 hover:bg-slate-100'
                        }`}
                    >
                        <Check size={14} strokeWidth={validationData.currentUserVote === 'VALID' ? 3 : 2} /> 
                        {validationData.valid || 0}
                    </button>

                    <span className="w-px h-3 bg-slate-200"></span>

                    <button
                        onClick={() => handleVote('INVALID')}
                        disabled={isSubmitting}
                        title="Mark as invalid"
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                            validationData.currentUserVote === 'INVALID' 
                            ? 'bg-rose-500 text-white shadow-sm' 
                            : 'text-slate-500 hover:text-rose-600 hover:bg-slate-100'
                        }`}
                    >
                        <X size={14} strokeWidth={validationData.currentUserVote === 'INVALID' ? 3 : 2} /> 
                        {validationData.invalid || 0}
                    </button>
                </div>
            ) : (
                <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                    {validationData.total || 0} Votes
                </span>
            )}
        </div>
    );
}
