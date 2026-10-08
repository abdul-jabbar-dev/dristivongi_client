'use client';
import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Check, Loader2, Settings } from 'lucide-react';
import { useUpdateCaseSettingsMutation } from '@/redux/feature/case/case.reducer';
import { TCaseType } from '@/redux/feature/case/case.type';

interface CaseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: TCaseType;
}

export default function CaseSettingsModal({ isOpen, onClose, caseData }: CaseSettingsModalProps) {
  const [canUserCreateClaim, setCanUserCreateClaim] = useState(
    caseData.settings?.canUserCreateClaim ?? true
  );
  const [canUserCreateClaimEvidence, setCanUserCreateClaimEvidence] = useState(
    caseData.settings?.canUserCreateClaimEvidence ?? true
  );
  const [canUserCreateClaimUpdate, setCanUserCreateClaimUpdate] = useState(
    caseData.settings?.canUserCreateClaimUpdate ?? true
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [updateSettings, { isLoading, error }] = useUpdateCaseSettingsMutation();

  useEffect(() => {
    if (caseData.settings) {
      setCanUserCreateClaim(caseData.settings.canUserCreateClaim ?? true);
      setCanUserCreateClaimEvidence(caseData.settings.canUserCreateClaimEvidence ?? true);
      setCanUserCreateClaimUpdate(caseData.settings.canUserCreateClaimUpdate ?? true);
    }
  }, [caseData]);

  if (!isOpen) return null;

  const handleSave = async () => {
    try {
      setSuccessMessage(null);
      await updateSettings({
        caseId: caseData.id,
        settings: {
          canUserCreateClaim,
          canUserCreateClaimEvidence,
          canUserCreateClaimUpdate,
        },
      }).unwrap();

      setSuccessMessage('অনুমতি ও অনুমতি সেটিংস সফলভাবে আপডেট করা হয়েছে।');
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Failed to update case settings:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs transition-opacity">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">অবদান ও অনুমতি</h2>
              <p className="text-xs text-slate-500 font-medium">সাধারণ ব্যবহারকারীদের অবদানের সুযোগ নির্ধারণ করুন</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <Check size={16} className="shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold">
              সেটিংস আপডেট করতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।
            </div>
          )}

          {/* Setting 1: Create Claims */}
          <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-all bg-slate-50/30">
            <div className="space-y-1 pr-2">
              <h3 className="text-sm font-bold text-slate-800">ব্যবহারকারীরা দাবি (Claim) তৈরি করতে পারবে</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                এই Case-এর অধীনে সাধারণ ব্যবহারকারীরা নতুন Claim তৈরি করতে পারবে।
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCanUserCreateClaim(!canUserCreateClaim)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                canUserCreateClaim ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  canUserCreateClaim ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Setting 2: Add Evidence to Claims */}
          <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-all bg-slate-50/30">
            <div className="space-y-1 pr-2">
              <h3 className="text-sm font-bold text-slate-800">ব্যবহারকারীরা দাবিতে প্রমাণ (Evidence) যোগ করতে পারবে</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                ব্যবহারকারীরা বিদ্যমান Claim-এর সাথে নতুন Evidence যোগ করতে পারবে।
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCanUserCreateClaimEvidence(!canUserCreateClaimEvidence)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                canUserCreateClaimEvidence ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  canUserCreateClaimEvidence ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Setting 3: Create Claim Updates */}
          <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-all bg-slate-50/30">
            <div className="space-y-1 pr-2">
              <h3 className="text-sm font-bold text-slate-800">ব্যবহারকারীরা দাবির আপডেট/অবস্থা পরিবর্তন করতে পারবে</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                ব্যবহারকারীরা Claim-এর বর্তমান অবস্থা ও পরিবর্তনের Update যোগ করতে পারবে।
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCanUserCreateClaimUpdate(!canUserCreateClaimUpdate)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                canUserCreateClaimUpdate ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  canUserCreateClaimUpdate ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-800 transition-colors"
          >
            বাতিল
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading}
            className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors inline-flex items-center gap-2 shadow-xs disabled:opacity-50"
          >
            {isLoading && <Loader2 size={14} className="animate-spin" />}
            <span>সেটিংস সংরক্ষণ করুন</span>
          </button>
        </div>

      </div>
    </div>
  );
}
