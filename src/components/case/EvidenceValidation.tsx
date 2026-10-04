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

    const handleVote = (value: 'VALID' | 'INVALID' | 'NONE') => {
        if (!isAuthenticated) {
            // In a real app, trigger login modal. Here we might just alert.
            alert("Please log in to vote.");
            return;
        }
        submitValidation({ evidenceId, value });
    };

    return (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider">ফ্যাক্ট-চেকিং </span>
            
            {isAuthenticated ? (
                <div className="flex items-center gap-1 bg-slate-50 rounded-lg p-0.5 border border-slate-100">
                    <button
                        onClick={() => handleVote(validationData.currentUserVote === 'VALID' ? 'NONE' : 'VALID')}
                        disabled={isSubmitting}
                        title="সত্য তথ্য"
                        className={`flex cursor-pointer  items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                            validationData.currentUserVote === 'VALID' 
                            ? 'bg-white text-emerald-600   ' 
                            : 'text-slate-500 hover:text-emerald-600 hover:bg-white/60'
                        } ${validationData.currentUserVote === 'INVALID' ? 'opacity-80 grayscale' : ''}`}
                    >
                        <Check size={14} strokeWidth={validationData.currentUserVote === 'VALID' ? 3 : 2} /> 
                        সত্য
                        <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] ${validationData.currentUserVote === 'VALID' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>{validationData.valid || 0}</span>
                    </button>

                    <span className={`w-px h-3 bg-slate-200 mx-0.5 ${validationData.currentUserVote ? 'opacity-40' : ''}`}></span>

                    <button
                        onClick={() => handleVote(validationData.currentUserVote === 'INVALID' ? 'NONE' : 'INVALID')}
                        disabled={isSubmitting}
                        title="মিথ্যা বা প্রোপাগান্ডা"
                        className={`flex  cursor-pointer items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                            validationData.currentUserVote === 'INVALID' 
                            ? 'bg-white text-rose-600 ' 
                            : 'text-slate-500 hover:text-rose-600 hover:bg-white/60'
                        } ${validationData.currentUserVote === 'VALID' ? 'opacity-80 grayscale' : ''}`}
                    >
                        <X size={14} strokeWidth={validationData.currentUserVote === 'INVALID' ? 3 : 2} /> 
                        প্রোপাগান্ডা 
                        <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] ${validationData.currentUserVote === 'INVALID' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-600'}`}>{validationData.invalid || 0}</span>
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
