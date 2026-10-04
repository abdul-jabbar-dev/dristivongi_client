import React, { useState } from 'react';
import { useGetAssessmentsQuery, useSubmitAssessmentMutation } from '@/redux/feature/case/case.reducer';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { resolveMediaUrl } from '@/lib/utils';
import { CheckCircle2, User, AlertCircle } from 'lucide-react';

export default function AssessmentPoll({ claimId }: { claimId: string }) {
  const { data: assessmentResponse, isLoading } = useGetAssessmentsQuery(claimId);
  const [submitAssessment, { isLoading: isSubmitting }] = useSubmitAssessmentMutation();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  const data = assessmentResponse?.data;
  
  const total = data?.total || 0;
  const support = data?.support || 0;
  const neutral = data?.neutral || 0;
  const opposition = data?.opposition || 0;
  const currentUserPosition = data?.currentUserPosition;

  const getPercentage = (count: number) => {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  const handleGroupSelect = (group: string) => {
    setSelectedGroup(group);
    setSelectedChoice(null); // reset choice when group changes
  };

  const handleSubmit = async () => {
    if (!selectedChoice) return;
    try {
      await submitAssessment({
        claimId,
        data: {
          assessment: selectedChoice,
          isAnonymous
        }
      }).unwrap();
      setIsChanging(false);
      setSelectedGroup(null);
      setSelectedChoice(null);
    } catch (err: any) {
      alert(err?.data?.message || err?.error || "Failed to submit assessment");
    }
  };

  const hasVoted = !!currentUserPosition && !isChanging;

  return (
    <div className="mt-4 space-y-6 bg-white border border-slate-200 p-5 rounded-xl">
      <h3 className="font-bold text-slate-800 flex items-center gap-2">
        <span className="text-xl">💬</span> সবার মতামত
      </h3>
      
      {isLoading ? (
        <div className="text-center text-slate-500 py-8">লোড হচ্ছে...</div>
      ) : (
        <>
          {/* USER SELECTION AREA */}
          {isAuthenticated && (!currentUserPosition || isChanging) && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="font-bold text-slate-700 mb-4">এই দাবিটি নিয়ে আপনার অবস্থান কী?</p>
              
              {!selectedGroup ? (
                <div className="flex flex-col gap-2">
                  <button onClick={() => handleGroupSelect('OPPOSITION')} className="p-3 text-left border rounded-lg bg-white hover:border-red-400 hover:bg-red-50 transition font-bold text-slate-800">🔴 আপত্তি আছে</button>
                  <button onClick={() => handleGroupSelect('NEUTRAL')} className="p-3 text-left border rounded-lg bg-white hover:border-amber-400 hover:bg-amber-50 transition font-bold text-slate-800">🟡 নিশ্চিত নই</button>
                  <button onClick={() => handleGroupSelect('SUPPORT')} className="p-3 text-left border rounded-lg bg-white hover:border-emerald-400 hover:bg-emerald-50 transition font-bold text-slate-800">🟢 সমর্থন করি</button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="font-bold text-slate-800">
                    {selectedGroup === 'OPPOSITION' && '🔴 আপত্তি আছে'}
                    {selectedGroup === 'NEUTRAL' && '🟡 নিশ্চিত নই'}
                    {selectedGroup === 'SUPPORT' && '🟢 সমর্থন করি'}
                  </p>
                  
                  <div className="flex flex-col gap-2">
                    {selectedGroup === 'OPPOSITION' && (
                      <>
                        <label className="flex items-center gap-3 p-3 border rounded-lg bg-white cursor-pointer">
                          <input type="radio" name="choice" checked={selectedChoice === 'CONTRADICTED'} onChange={() => setSelectedChoice('CONTRADICTED')} className="w-4 h-4" />
                          <span>আপত্তি আছে</span>
                        </label>
                        <label className="flex items-center gap-3 p-3 border rounded-lg bg-white cursor-pointer">
                          <input type="radio" name="choice" checked={selectedChoice === 'DISPUTED'} onChange={() => setSelectedChoice('DISPUTED')} className="w-4 h-4" />
                          <span>দ্বিমত পোষণ করি / গ্রহণ করছি না</span>
                        </label>
                      </>
                    )}
                    {selectedGroup === 'NEUTRAL' && (
                      <>
                        <label className="flex items-center gap-3 p-3 border rounded-lg bg-white cursor-pointer">
                          <input type="radio" name="choice" checked={selectedChoice === 'INSUFFICIENT_EVIDENCE'} onChange={() => setSelectedChoice('INSUFFICIENT_EVIDENCE')} className="w-4 h-4" />
                          <span>আরও তথ্য চাই / এখনও সিদ্ধান্ত নেই</span>
                        </label>
                        <label className="flex items-center gap-3 p-3 border rounded-lg bg-white cursor-pointer">
                          <input type="radio" name="choice" checked={selectedChoice === 'PARTIALLY_SUPPORTED'} onChange={() => setSelectedChoice('PARTIALLY_SUPPORTED')} className="w-4 h-4" />
                          <span>নিরপেক্ষ / দুই দিকই দেখছি</span>
                        </label>
                      </>
                    )}
                    {selectedGroup === 'SUPPORT' && (
                      <>
                        <label className="flex items-center gap-3 p-3 border rounded-lg bg-white cursor-pointer">
                          <input type="radio" name="choice" checked={selectedChoice === 'SUPPORTED'} onChange={() => setSelectedChoice('SUPPORTED')} className="w-4 h-4" />
                          <span>সমর্থন করি / গ্রহণযোগ্য মনে হচ্ছে</span>
                        </label>
                      </>
                    )}
                  </div>
                  
                  {selectedChoice && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <p className="text-sm font-bold text-slate-700 mb-2">আপনার মতামত কীভাবে দেখানো হবে?</p>
                      <div className="flex gap-4 mb-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="privacy" checked={!isAnonymous} onChange={() => setIsAnonymous(false)} />
                          <span>👤 প্রকাশ্যে</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="privacy" checked={isAnonymous} onChange={() => setIsAnonymous(true)} />
                          <span>🔒 গোপনীয়ভাবে</span>
                        </label>
                      </div>
                      
                      <div className="flex gap-2">
                        <button onClick={() => setSelectedGroup(null)} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 transition">ফিরে যান</button>
                        <button onClick={handleSubmit} disabled={isSubmitting} className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition disabled:opacity-50">মতামত দিন</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {isChanging && (
                <div className="mt-4 text-center">
                  <button onClick={() => setIsChanging(false)} className="text-sm text-slate-500 hover:underline">বাতিল করুন</button>
                </div>
              )}
            </div>
          )}
          
          {/* RESULTS AREA */}
          <div className="mt-6">
            <h4 className="font-bold text-slate-700 mb-4 border-b pb-2">সবার অবস্থান</h4>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm font-bold text-slate-800 mb-1">
                  <span>🔴 আপত্তি আছে</span>
                  <span>{getPercentage(opposition)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div className="bg-red-500 h-3 rounded-full" style={{ width: `${getPercentage(opposition)}%` }}></div>
                </div>
                <p className="text-xs text-slate-500 mt-1">{toBengali(opposition)} জন</p>
              </div>
              
              <div>
                <div className="flex justify-between text-sm font-bold text-slate-800 mb-1">
                  <span>🟡 নিশ্চিত নই</span>
                  <span>{getPercentage(neutral)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div className="bg-amber-400 h-3 rounded-full" style={{ width: `${getPercentage(neutral)}%` }}></div>
                </div>
                <p className="text-xs text-slate-500 mt-1">{toBengali(neutral)} জন</p>
              </div>
              
              <div>
                <div className="flex justify-between text-sm font-bold text-slate-800 mb-1">
                  <span>🟢 সমর্থন করি</span>
                  <span>{getPercentage(support)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div className="bg-emerald-500 h-3 rounded-full" style={{ width: `${getPercentage(support)}%` }}></div>
                </div>
                <p className="text-xs text-slate-500 mt-1">{toBengali(support)} জন</p>
              </div>
            </div>
            
            <p className="text-sm font-medium text-slate-500 mt-4 text-right">মোট মতামত: {toBengali(total)}</p>
          </div>
          
          {/* USER'S POSITION */}
          {hasVoted && currentUserPosition && (
            <div className="mt-6 bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">আপনার অবস্থান</p>
                <p className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  {['CONTRADICTED', 'DISPUTED'].includes(currentUserPosition) && '🔴 আপত্তি আছে'}
                  {['INSUFFICIENT_EVIDENCE', 'PARTIALLY_SUPPORTED'].includes(currentUserPosition) && '🟡 নিশ্চিত নই'}
                  {['SUPPORTED'].includes(currentUserPosition) && '🟢 সমর্থন করি'}
                </p>
              </div>
              <button onClick={() => setIsChanging(true)} className="px-3 py-1.5 bg-white border border-slate-200 text-sm font-bold text-slate-700 rounded-lg hover:bg-slate-100 transition shadow-sm">
                পরিবর্তন করুন
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const toBengali = (num: number | string) => {
  const digits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
  return num.toString().split('').map(d => /[0-9]/.test(d) ? digits[parseInt(d)] : d).join('');
}
