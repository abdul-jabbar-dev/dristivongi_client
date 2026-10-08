'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Plus, Clock, Shield, Camera, Link as LinkIcon, ChevronDown, ChevronUp, UserCheck, Activity } from 'lucide-react';
import { useGetClaimUpdatesQuery, useGetClaimUpdatePermissionsQuery } from '@/redux/feature/case/case.reducer';
import { TClaimState, TClaimUpdate, TClaimUpdateType } from '@/redux/feature/case/case.type';
import { getAvatarUrl, resolveMediaUrl } from '@/lib/utils';
import AddClaimUpdateModal from './AddClaimUpdateModal';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

const STATE_CONFIG: Record<TClaimState, { label: string; bg: string; text: string; border: string; dot: string }> = {
  PROPOSED: { label: 'Proposed (প্রস্তাবিত)', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  SUPPORTED: { label: 'Supported (সমর্থিত)', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  PARTIALLY_SUPPORTED: { label: 'Partially Supported (আংশিক সমর্থিত)', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  INSUFFICIENT_EVIDENCE: { label: 'Insufficient Evidence (পর্যাপ্ত প্রমাণ নেই)', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-400' },
  CHALLENGED: { label: 'Challenged (আপত্তিজনক)', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
  CONTRADICTED: { label: 'Contradicted (বিপরীত প্রমাণিত)', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' },
  DISPUTED: { label: 'Disputed (বিতর্কিত)', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
  WITHDRAWN: { label: 'Withdrawn (প্রত্যাহারকৃত)', bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', dot: 'bg-gray-400' },
  SUPERSEDED: { label: 'Superseded (স্থলাভিষিক্ত)', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
};

const UPDATE_TYPE_LABELS: Record<TClaimUpdateType, string> = {
  GENERAL_UPDATE: 'আপডেট',
  INFORMATION_ADDED: 'তথ্য সংযোজন',
  EVIDENCE_ADDED: 'প্রমাণ সংযোজন',
  SOURCE_ADDED: 'উৎস সংযোজন',
  STATE_CHANGED: 'অবস্থা পরিবর্তন',
  CLAIM_REVISED: 'দাবি সংশোধন',
  CLAIM_CLARIFIED: 'স্পষ্টীকরণ',
  CHALLENGED: 'চ্যালেঞ্জ',
  WITHDRAWN: 'প্রত্যাহার',
  SUPERSEDED: 'স্থলাভিষিক্ত',
};

export default function ClaimUpdatesSection({ claim, caseData, onHighlight }: { claim: any, caseData?: any, onHighlight?: (evidenceIds: string[], sourceIds: string[]) => void }) {
  const claimId = claim?.id;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedUpdateId, setExpandedUpdateId] = useState<string | null>(null);
  const [showAllUpdates, setShowAllUpdates] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { data: updatesData, isLoading: isUpdatesLoading } = useGetClaimUpdatesQuery({ claimId, limit: 100 }, { skip: !claimId });
  const { data: permissionsData } = useGetClaimUpdatePermissionsQuery(claimId, { skip: !claimId });

  const updates: TClaimUpdate[] = updatesData?.data?.updates || updatesData?.updates || [];
  const displayedUpdates = showAllUpdates ? updates : updates.slice(0, 3);
  const currentState: TClaimState = updatesData?.data?.currentState || updatesData?.currentState || permissionsData?.data?.currentState || 'PROPOSED';
  const lastUpdatedRaw = updatesData?.data?.lastUpdated || updatesData?.lastUpdated;

  useEffect(() => {
    const handleFocus = (e: any) => {
      const targetId = e.detail?.targetId;
      const type = e.detail?.type;
      if (type === 'UPDATE' || (targetId && targetId.startsWith('update-item-'))) {
        setShowAllUpdates(true);
      }
    };
    window.addEventListener('focus-target-item', handleFocus);
    return () => window.removeEventListener('focus-target-item', handleFocus);
  }, []);

  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const isCaseCreator = Boolean(user && caseData && (caseData.author?.id === user.id || caseData.authorId === user.id));
  const settingAllowed = caseData?.settings?.canUserCreateClaimUpdate ?? true;
  const initialAllowed = isCaseCreator || settingAllowed;

  const canAddUpdate = Boolean((user || isAuthenticated) && initialAllowed && (permissionsData?.data?.canAddUpdate ?? permissionsData?.canAddUpdate ?? true));

  const stateInfo = STATE_CONFIG[currentState] || STATE_CONFIG.PROPOSED;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const latestAuthorName = updatesData?.data?.latestAuthor?.fullName || updatesData?.latestAuthor?.fullName || null;

  const hasUpdates = updates.length > 0;

  if (isUpdatesLoading) {
    return null;
  }

  if (!hasUpdates && !canAddUpdate) {
    return null;
  }

  return (
    <div className="bg-white p-4 sm:p-5 ">
      {!hasUpdates ? (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <Activity size={14} className="text-slate-600" />
            <span>বর্তমান অবস্থা ও আপডেট</span>
          </div>

          {canAddUpdate && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl shadow-xs transition shrink-0 cursor-pointer"
            >
              <Plus size={14} />
              <span>+ Add Update</span>
            </button>
          )}
        </div>
      ) : (
        <>
          {/* 1. CURRENT STATUS SUMMARY HEADER */}
          {/* 1. CURRENT STATUS SUMMARY HEADER */}
          <div className="flex items-center justify-between gap-4 mb-1">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <Activity size={14} className="text-slate-500" />
                <span>বর্তমান অবস্থা ও আপডেট</span>
              </div>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${stateInfo.bg} ${stateInfo.text} ${stateInfo.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${stateInfo.dot}`} />
                {stateInfo.label}
              </span>
            </div>

            {/* Server Authorized + Add Update Action */}
            {canAddUpdate && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[11px] rounded-lg shadow-sm transition shrink-0 cursor-pointer"
              >
                <Plus size={12} />
                <span>+ Update</span>
              </button>
            )}
          </div>

          {/* 2. TIMELINE LIST */}
          <div className="mt-5">
            {isUpdatesLoading ? (
              <div className="text-center text-xs text-slate-400 py-2">টাইমলাইন লোড হচ্ছে...</div>
            ) : (
              <div className="relative pl-5 space-y-5 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                {displayedUpdates.map((up, index) => {
                  const dateDisplay = formatDate(up.createdAt);
                  const authorName = up.author?.fullName || (up.isAnonymous ? 'Anonymous Contributor' : 'Contributor');
                  const evidenceCount = up.evidence?.length || 0;
                  const sourceCount = up.sources?.length || 0;
                  const isExpanded = expandedUpdateId === up.id;

                  const newStateConfig = up.newState ? STATE_CONFIG[up.newState] : null;

                  return (
                    <div key={up.id} id={`update-item-${up.id}`} className="relative">
                      {/* Timeline Dot */}
                      <div className="absolute -left-[23px] top-1.5 w-2 h-2 rounded-full bg-slate-300 ring-4 ring-white" />

                      {/* Content Container */}
                      <div className="pl-2">
                        {/* Meta Line: Date - Author - Type */}
                        <div className="flex flex-wrap items-center gap-2 text-[10px] font-medium text-slate-500 mb-1">
                          {index === 0 && (
                            <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">
                              সর্বশেষ
                            </span>
                          )}
                          <span className="flex items-center gap-1"><Clock size={10} className="text-slate-400" /> {dateDisplay}</span>
                          <span className="text-slate-300">•</span>

                          {up.isAnonymous ? (
                            <span className="text-amber-600 flex items-center gap-1">
                              <Shield size={9} /> Anonymous
                            </span>
                          ) : (
                            <span className="text-slate-700 font-semibold">@{up.author?.userName || authorName}</span>
                          )}

                          <span className="text-slate-300">•</span>
                          <span className="text-slate-600 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded">
                            {UPDATE_TYPE_LABELS[up.updateType] || up.updateType}
                          </span>

                          {/* State Transition Indicator */}
                          {up.newState && (
                            <>
                              <span className="text-slate-300">→</span>
                              <span className={`px-1.5 py-0.5 rounded-md border ${newStateConfig?.bg} ${newStateConfig?.text} ${newStateConfig?.border}`}>
                                {newStateConfig?.label.split(' ')[1] || newStateConfig?.label || up.newState}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Message Line & Inline Actions */}
                        <div className="flex items-start justify-between gap-4">
                          <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {up.content}
                          </p>

                          {/* Inline Attachments Toggle */}
                          {(evidenceCount > 0 || sourceCount > 0) && (
                            <button
                              onClick={() => {
                                const nextExpanded = isExpanded ? null : up.id;
                                setExpandedUpdateId(nextExpanded);
                                if (!nextExpanded) {
                                  const params = new URLSearchParams(searchParams?.toString() || '');
                                  params.delete('claim_evid');
                                  params.delete('claim_srcid');
                                  router.push(`${pathname}?${params.toString()}`, { scroll: false });
                                  if (onHighlight) onHighlight([], []);
                                }
                              }}
                              className={`shrink-0 flex items-center gap-1 text-[10px] font-semibold transition px-2 py-1 rounded-md border ${isExpanded
                                ? 'bg-amber-50 text-amber-700 border-amber-200 shadow-xs'
                                : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-700 shadow-xs'
                                }`}
                            >
                              {evidenceCount > 0 && (
                                <span className="flex items-center gap-1"><Camera size={10} className={isExpanded ? 'text-amber-500' : 'text-slate-400'} /> {evidenceCount}</span>
                              )}
                              {sourceCount > 0 && (
                                <span className="flex items-center gap-1"><LinkIcon size={10} className={isExpanded ? 'text-amber-500' : 'text-slate-400'} /> {sourceCount}</span>
                              )}
                            </button>
                          )}
                        </div>

                        {/* Expanded Media List */}
                        {isExpanded && (evidenceCount > 0 || sourceCount > 0) && (
                          <div className="mt-3 flex flex-wrap gap-2 pt-3 border-t border-slate-100">
                            {up.evidence?.map((e: any, idx: number) => {
                              const evId = e.evidenceId || e.evidence?.id;
                              return (
                                <button
                                  key={`ev-${evId}-${idx}`}
                                  onClick={() => {
                                    const params = new URLSearchParams(searchParams?.toString() || '');
                                    params.set('claim', claimId);
                                    params.set('claim_evid', evId);
                                    params.delete('claim_srcid');
                                    router.push(`${pathname}?${params.toString()}`, { scroll: false });
                                    if (onHighlight) onHighlight([evId], []);
                                  }}
                                  className="flex items-center gap-1.5 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-700 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition"
                                >
                                  <Camera size={12} className="text-slate-400" />
                                  <span className="truncate max-w-[120px] font-medium">{e.evidence?.title || 'প্রমাণ'}</span>
                                </button>
                              );
                            })}
                            {up.sources?.map((s: any, idx: number) => {
                              const srcId = s.sourceId || s.source?.id;
                              return (
                                <button
                                  key={`src-${srcId}-${idx}`}
                                  onClick={() => {
                                    const params = new URLSearchParams(searchParams?.toString() || '');
                                    params.set('claim', claimId);
                                    params.set('claim_srcid', srcId);
                                    params.delete('claim_evid');
                                    router.push(`${pathname}?${params.toString()}`, { scroll: false });
                                    if (onHighlight) onHighlight([], [srcId]);
                                  }}
                                  className="flex items-center gap-1.5 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-700 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition"
                                >
                                  <LinkIcon size={12} className="text-slate-400" />
                                  <span className="truncate max-w-[120px] font-medium">{s.source?.title || 'উৎস'}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!isUpdatesLoading && updates.length > 3 && (
              <div className="mt-4 pt-4 text-center border-t border-slate-100">
                <button
                  onClick={() => setShowAllUpdates(!showAllUpdates)}
                  className="text-xs font-semibold text-slate-500 hover:text-amber-600 transition"
                >
                  {showAllUpdates ? 'কম দেখান' : `আরো ${updates.length - 3}টি আপডেট দেখুন`}
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal */}
      <AddClaimUpdateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        claimId={claimId}
        currentState={currentState}
        availableEvidence={claim?.evidence || []}
        availableSources={claim?.sources || []}
      />
    </div>
  );
}
