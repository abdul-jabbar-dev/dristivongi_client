'use client';
import React, { useState } from 'react';
import { X, Plus, Link as LinkIcon, Camera, ChevronDown, ChevronUp, Link2, Paperclip } from 'lucide-react';
import { useCreateClaimUpdateMutation } from '@/redux/feature/case/case.reducer';
import { TClaimState, TClaimUpdateType } from '@/redux/feature/case/case.type';
import { useImageUpload } from '@/hooks/useImageUpload';
import { resolveMediaUrl, formatBengaliTime } from '@/lib/utils';

const STATE_OPTIONS: { value: TClaimState; label: string }[] = [
  { value: 'PROPOSED', label: '🔵 Proposed (প্রস্তাবিত)' },
  { value: 'SUPPORTED', label: '🟢 Supported (সমর্থিত)' },
  { value: 'PARTIALLY_SUPPORTED', label: '🟡 Partially Supported (আংশিক সমর্থিত)' },
  { value: 'INSUFFICIENT_EVIDENCE', label: '⚪ Insufficient Evidence (পর্যাপ্ত প্রমাণ নেই)' },
  { value: 'CHALLENGED', label: '🟠 Challenged (আপত্তিজনক)' },
  { value: 'CONTRADICTED', label: '🔴 Contradicted (বিপরীত প্রমাণিত)' },
  { value: 'DISPUTED', label: '🟣 Disputed (বিতর্কিত)' },
  { value: 'WITHDRAWN', label: '🔘 Withdrawn (প্রত্যাহারকৃত)' },
  { value: 'SUPERSEDED', label: '⚙️ Superseded (স্থলাভিষিক্ত)' },
];

interface AddClaimUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  claimId: string;
  currentState?: TClaimState;
  availableEvidence?: any[];
  availableSources?: any[];
}

export default function AddClaimUpdateModal({
  isOpen,
  onClose,
  claimId,
  currentState = 'PROPOSED',
  availableEvidence = [],
  availableSources = []
}: AddClaimUpdateModalProps) {
  const [content, setContent] = useState('');
  const [changeState, setChangeState] = useState(false);
  const [selectedState, setSelectedState] = useState<TClaimState>(currentState);

  // Selected existing IDs
  const [selectedEvidenceIds, setSelectedEvidenceIds] = useState<string[]>([]);
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([]);

  // New Native Evidence/Source lists
  const [newEvidenceList, setNewEvidenceList] = useState<{ title: string; type: string; relationship: string; isAnonymous: boolean; files?: any[] }[]>([]);
  const [newSourceList, setNewSourceList] = useState<{ title: string; url: string; sourceName: string; relationship: string; isAnonymous: boolean }[]>([]);

  // Section toggle & picker modes
  const [isEvidenceSectionOpen, setIsEvidenceSectionOpen] = useState(true);
  const [evPickerMode, setEvPickerMode] = useState<'SELECT' | 'CREATE' | null>('SELECT');
  const [srcPickerMode, setSrcPickerMode] = useState<'SELECT' | 'CREATE' | null>('CREATE');

  // Native Evidence Composer states
  const [nativeEvText, setNativeEvText] = useState('');
  
  // Combined Evidence/Source active tab state
  const [activeTab, setActiveTab] = useState<'EXISTING' | 'CREATE_EVIDENCE' | null>('CREATE_EVIDENCE');
  const [expandedExistingId, setExpandedExistingId] = useState<string | null>(null);

  // Multi-source link state
  const [newLinks, setNewLinks] = useState([{ url: '', title: '', sourceName: '' }]);

  // Link drawer state
  const { files, addFiles, removeFile, validFiles, clearFiles } = useImageUpload();
  const [showLinkFields, setShowLinkFields] = useState(false);

  const [createClaimUpdate, { isLoading }] = useCreateClaimUpdateMutation();
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const toggleEvidenceId = (evId: string) => {
    setSelectedEvidenceIds((prev) =>
      prev.includes(evId) ? prev.filter((id) => id !== evId) : [...prev, evId]
    );
  };

  const toggleSourceId = (srcId: string) => {
    setSelectedSourceIds((prev) =>
      prev.includes(srcId) ? prev.filter((id) => id !== srcId) : [...prev, srcId]
    );
  };

  const handleAddCombined = () => {
    const validLinks = newLinks.filter(l => l.url.trim());
    const hasEvidenceData = Boolean(nativeEvText.trim() || validFiles.length > 0);
    const hasSourceData = validLinks.length > 0;

    const invalidLinks = newLinks.filter(l => !l.url.trim() && (l.title.trim() || l.sourceName.trim()));
    if (invalidLinks.length > 0) {
      alert("উৎসের ওয়েব লিংক (URL) প্রদান করা আবশ্যক।");
      return;
    }

    if (!hasEvidenceData && !hasSourceData) {
      alert("অনুগ্রহ করে কোনো প্রমাণ, ছবি অথবা উৎসের ওয়েব লিংক দিন।");
      return;
    }

    // 1. Create Evidence if evidence inputs contain data
    if (hasEvidenceData) {
      const evType = validFiles.length > 0
        ? (validFiles[0].processedFile?.type.includes('video') ? 'VIDEO' : validFiles[0].processedFile?.type.includes('pdf') ? 'DOCUMENT' : 'IMAGE')
        : 'TEXT';

      setNewEvidenceList((prev) => [
        ...prev,
        {
          title: nativeEvText.trim() || 'প্রমাণ',
          type: evType,
          relationship: 'CONTEXT',
          isAnonymous: false,
          files: validFiles.map((f: any) => f.processedFile)
        }
      ]);
    }

    // 2. Create Source if source inputs contain data
    if (hasSourceData) {
      setNewSourceList((prev) => [
        ...prev,
        ...validLinks.map((l) => ({
          title: l.title.trim() || l.url.trim(),
          url: l.url.trim(),
          sourceName: l.sourceName.trim() || 'External Source',
          relationship: 'CONTEXT',
          isAnonymous: false
        }))
      ]);
    }

    // Reset inputs
    setNativeEvText('');
    clearFiles();
    setNewLinks([{ url: '', title: '', sourceName: '' }]);
    setShowLinkFields(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setErrorMsg('আপডেটের বিবরণ দেওয়া আবশ্যক');
      return;
    }

    // Merge any dangling native evidence or source inputs
    const finalEvidenceList = [...newEvidenceList];
    const finalSourceList = [...newSourceList];

    const validLinks = newLinks.filter(l => l.url.trim());
    const hasEvidenceData = Boolean(nativeEvText.trim() || validFiles.length > 0);
    const hasSourceData = validLinks.length > 0;

    const invalidLinks = newLinks.filter(l => !l.url.trim() && (l.title.trim() || l.sourceName.trim()));
    if (invalidLinks.length > 0) {
      setErrorMsg('উৎসের ওয়েব লিংক (URL) প্রদান করা আবশ্যক।');
      return;
    }

    if (hasEvidenceData) {
      const evType = validFiles.length > 0
        ? (validFiles[0].processedFile?.type.includes('video') ? 'VIDEO' : validFiles[0].processedFile?.type.includes('pdf') ? 'DOCUMENT' : 'IMAGE')
        : 'TEXT';
      finalEvidenceList.push({
        title: nativeEvText.trim() || 'প্রমাণ',
        type: evType,
        relationship: 'CONTEXT',
        isAnonymous: false,
        files: validFiles.map((f: any) => f.processedFile)
      });
    }

    if (hasSourceData) {
      finalSourceList.push(...validLinks.map((l) => ({
        title: l.title.trim() || l.url.trim(),
        url: l.url.trim(),
        sourceName: l.sourceName.trim() || 'External Source',
        relationship: 'CONTEXT',
        isAnonymous: false
      })));
    }

    // Automatically compute updateType
    let computedUpdateType: TClaimUpdateType = 'GENERAL_UPDATE';
    if (changeState) {
      computedUpdateType = 'STATE_CHANGED';
    } else if (finalEvidenceList.length > 0 || selectedEvidenceIds.length > 0) {
      computedUpdateType = 'EVIDENCE_ADDED';
    } else if (finalSourceList.length > 0 || selectedSourceIds.length > 0) {
      computedUpdateType = 'SOURCE_ADDED';
    }

    try {
      setErrorMsg('');
      const formData = new FormData();

      const payloadBody = {
        content: content.trim(),
        updateType: computedUpdateType,
        newState: changeState ? selectedState : undefined,
        evidenceIds: selectedEvidenceIds,
        sourceIds: selectedSourceIds,
        evidence: finalEvidenceList.map((ev) => ({
          title: ev.title,
          type: ev.type,
          relationship: 'CONTEXT',
          isAnonymous: false
        })),
        sources: finalSourceList.map((src) => ({
          title: src.title,
          sourceLocation: src.url,
          externalSourceType: 'WEBSITE',
          externalSourceName: src.sourceName,
          externalLinks: [src.url],
          relationship: 'CONTEXT',
          isAnonymous: false
        })),
        isAnonymous: false,
      };

      formData.append('data', JSON.stringify(payloadBody));

      // Append files for newly created evidence
      finalEvidenceList.forEach((ev, idx) => {
        if (ev.files && ev.files.length > 0) {
          ev.files.forEach((file) => {
            if (file) formData.append(`evidenceMedia_${idx}`, file);
          });
        }
      });

      await createClaimUpdate({ claimId, formData }).unwrap();

      // Reset & close
      setContent('');
      setNativeEvText('');
      clearFiles();
      setNewLinks([{ url: '', title: '', sourceName: '' }]);
      setSelectedEvidenceIds([]);
      setSelectedSourceIds([]);
      setNewEvidenceList([]);
      setNewSourceList([]);
      setChangeState(false);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.data?.message || err?.message || 'আপডেট পোস্ট করতে সমস্যা হয়েছে');
    }
  };

  const combinedExisting = [
    ...availableEvidence.map((e: any) => ({ ...e, _itemType: 'EVIDENCE', _date: e.evidence?.createdAt || e.createdAt })),
    ...availableSources.map((s: any) => ({ ...s, _itemType: 'SOURCE', _date: s.source?.createdAt || s.createdAt }))
  ].sort((a, b) => new Date(b._date || 0).getTime() - new Date(a._date || 0).getTime());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">নতুন আপডেট যোগ করুন</h3>
            <p className="text-xs text-slate-500">দাবির বর্তমান ইতিহাস ও পরিবর্তন রেকর্ড করুন</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          {/* 1. Update Content */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              আপডেটের বিবরণ <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="কী পরিবর্তন ঘটেছে বা নতুন কী অগ্রগতি পাওয়া গেছে লিখুন..."
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 outline-none focus:border-slate-400 focus:bg-white transition"
              required
            />
          </div>

          {/* 2. State Transition Toggle */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 cursor-pointer flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={changeState}
                  onChange={(e) => setChangeState(e.target.checked)}
                  className="rounded border-slate-300 text-slate-700 focus:ring-slate-500"
                />
                দাবির অবস্থা পরিবর্তন করুন (Change Claim State)
              </label>
            </div>

            {changeState && (
              <div className="pt-2 border-t border-slate-200/60">
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  নতুন অবস্থা নির্বাচন করুন:
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value as TClaimState)}
                  className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg p-2 text-slate-800 outline-none"
                >
                  {STATE_OPTIONS.map((st) => (
                    <option key={st.value} value={st.value}>
                      {st.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* 4. Combined Collapsible Evidence & Sources Section */}
          <div className="border border-slate-200/90 rounded-xl overflow-hidden bg-white shadow-2xs">
            {/* Main Header */}
            <button
              type="button"
              onClick={() => setIsEvidenceSectionOpen(!isEvidenceSectionOpen)}
              className="w-full flex items-center justify-between p-3.5 bg-slate-50 text-left hover:bg-slate-100 transition"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Camera size={15} className="text-slate-600" />
                <span>Claim Evidence & Sources</span>
              </div>
              {isEvidenceSectionOpen ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
            </button>

            {isEvidenceSectionOpen && (
              <div className="p-4 space-y-4 bg-white border-t border-slate-100">
                
                {/* Unified Action Selector Row */}
                <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab(activeTab === 'EXISTING' ? null : 'EXISTING')}
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg transition shrink-0 cursor-pointer ${
                      activeTab === 'EXISTING'
                        ? 'bg-slate-200 text-slate-900 border border-slate-300'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    + বিদ্যমান (Existing)
                  </button>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveTab(activeTab === 'CREATE_EVIDENCE' ? null : 'CREATE_EVIDENCE')}
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                        activeTab === 'CREATE_EVIDENCE'
                          ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-600 shadow-2xs'
                          : 'border border-emerald-400 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      <Plus size={13} /> নতুন প্রমাণ তৈরি
                    </button>
                  </div>
                </div>

                {/* TAB 1: Existing items selector */}
                {activeTab === 'EXISTING' && (
                  <div className="pt-2">
                    <div className="max-h-60 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-white space-y-1.5 custom-scrollbar">
                      {combinedExisting.length === 0 ? (
                        <p className="text-xs text-slate-400 italic p-2 text-center">
                          এই দাবিতে এখনও কোনো বিদ্যমান প্রমাণ বা উৎস নেই।
                        </p>
                      ) : (
                        combinedExisting.map((item: any, idx: number) => {
                          if (item._itemType === 'EVIDENCE') {
                            const ev = item.evidence || item;
                            const isChecked = selectedEvidenceIds.includes(ev.id);
                            const rawMediaUrl = ev.medias?.[0]?.media?.url || ev.mediaUrl || ev.url || ev.fileUrl || ev.thumbnailUrl;
                            const mediaUrl = rawMediaUrl ? resolveMediaUrl(rawMediaUrl) : null;
                            const authorName = ev.creator?.fullName || ev.creator?.userName || 'Anonymous';
                            const dateStr = item._date ? formatBengaliTime(item._date) : '';

                            const isExpanded = expandedExistingId === ev.id;
                            
                            return (
                              <div
                                key={`ev-${ev.id}-${idx}`}
                                className={`flex flex-col p-2 rounded-lg border text-xs transition ${
                                  isChecked ? 'bg-emerald-50/70 border-emerald-300 shadow-sm' : 'bg-white border-slate-200 hover:bg-slate-50'
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start gap-2.5 min-w-0 pr-2 flex-1 cursor-pointer" onClick={() => setExpandedExistingId(isExpanded ? null : ev.id)}>
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => toggleEvidenceId(ev.id)}
                                      onClick={(e) => e.stopPropagation()}
                                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 mt-1 cursor-pointer"
                                    />
                                    
                                    {/* Small Thumbnail */}
                                    {mediaUrl && (
                                      <img
                                        src={mediaUrl}
                                        alt={ev.title}
                                        className="w-8 h-8 rounded-md object-cover border border-slate-200 shrink-0 bg-slate-100"
                                      />
                                    )}

                                    <div className="flex flex-col min-w-0">
                                      <span className={`truncate font-semibold leading-tight ${isChecked ? 'text-emerald-950' : 'text-slate-800'}`}>{ev.title}</span>
                                      <span className="text-[10px] text-slate-500 mt-0.5 truncate">{authorName} • {dateStr}</span>
                                    </div>
                                  </div>
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mt-0.5 cursor-pointer" onClick={() => setExpandedExistingId(isExpanded ? null : ev.id)}>{ev.type || 'IMAGE'}</span>
                                </div>
                                {isExpanded && ev.medias && ev.medias.length > 0 && (
                                  <div className="mt-3 pt-3 border-t border-slate-200/50 pl-[38px] flex flex-wrap gap-2">
                                    {ev.medias.map((m: any, mIdx: number) => {
                                       const imgUrl = resolveMediaUrl(m.media?.url);
                                       return imgUrl ? <img key={mIdx} src={imgUrl} className="h-12 w-12 rounded object-cover border border-slate-200 bg-white shadow-sm" /> : null;
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          } else {
                            const src = item.source || item;
                            const isChecked = selectedSourceIds.includes(src.id);
                            const authorName = src.creator?.fullName || src.creator?.userName || 'Anonymous';
                            const dateStr = item._date ? formatBengaliTime(item._date) : '';
                            
                            const isExpanded = expandedExistingId === src.id;
                            
                            return (
                              <div
                                key={`src-${src.id}-${idx}`}
                                className={`flex flex-col p-2 rounded-lg border text-xs transition ${
                                  isChecked ? 'bg-emerald-50/70 border-emerald-300 shadow-sm' : 'bg-white border-slate-200 hover:bg-slate-50'
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start gap-2.5 min-w-0 pr-2 flex-1 cursor-pointer" onClick={() => setExpandedExistingId(isExpanded ? null : src.id)}>
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => toggleSourceId(src.id)}
                                      onClick={(e) => e.stopPropagation()}
                                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 mt-1 cursor-pointer"
                                    />

                                    {/* Small Icon Badge */}
                                    <div className="w-8 h-8 rounded-md border border-emerald-200 bg-emerald-50 flex items-center justify-center shrink-0 text-emerald-700">
                                      <LinkIcon size={14} />
                                    </div>

                                    <div className="flex flex-col min-w-0">
                                      <span className={`truncate font-semibold leading-tight ${isChecked ? 'text-emerald-950' : 'text-slate-800'}`}>{src.title}</span>
                                      <span className="text-[10px] text-slate-500 mt-0.5 truncate">{authorName} • {dateStr}</span>
                                    </div>
                                  </div>
                                  <span className="text-[10px] text-slate-400 shrink-0 uppercase font-bold tracking-wider mt-0.5 cursor-pointer" onClick={() => setExpandedExistingId(isExpanded ? null : src.id)}>{src.externalSourceName || 'SOURCE'}</span>
                                </div>
                                {isExpanded && src.externalLinks && src.externalLinks.length > 0 && (
                                  <div className="mt-3 pt-3 border-t border-slate-200/50 pl-[38px] flex flex-col gap-1.5">
                                    {src.externalLinks.map((link: string, lIdx: number) => (
                                      <a key={lIdx} href={link} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline truncate inline-flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                                        <LinkIcon size={10} className="shrink-0" /> {link}
                                      </a>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          }
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 2: Native Evidence Creation Box (Matching Image 2 UI) */}
                {activeTab === 'CREATE_EVIDENCE' && (
                  <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs space-y-2 p-3.5">
                    <textarea
                      value={nativeEvText}
                      onChange={(e) => setNativeEvText(e.target.value)}
                      className="w-full text-xs min-h-[70px] border-0 focus:outline-none text-slate-800 placeholder:text-slate-400 resize-none"
                      placeholder="আপনার কাছে কি কোনো প্রমাণ বা তথ্য আছে? এখানে বিস্তারিত লিখুন..."
                    />

                    {/* File preview if attached */}
                    {files.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100">
                        {files.map((f: any) => (
                          <div key={f.id} className="relative w-12 h-12 rounded-lg border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center">
                            {f.originalFile.type.startsWith('image/') ? (
                              <img src={f.previewUrl} alt="prev" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[8px] font-bold p-1 text-center truncate">{f.originalFile.name}</span>
                            )}
                            <button type="button" onClick={() => removeFile(f.id)} className="absolute top-0 right-0 bg-rose-600 text-white p-0.5 rounded-bl">
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Inline Expandable Source Link Fields Drawer */}
                    {showLinkFields && (
                      <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-xl space-y-3 mt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                            <Link2 size={12} className="text-emerald-600" /> নতুন উৎস (Native Source Link)
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setShowLinkFields(false);
                              setNewLinks([{ url: '', title: '', sourceName: '' }]);
                            }}
                            className="text-slate-400 hover:text-rose-600 transition"
                          >
                            <X size={13} />
                          </button>
                        </div>
                        
                        {newLinks.map((link, index) => (
                          <div key={index} className="space-y-2 relative border-b border-slate-200/60 pb-3 last:border-0 last:pb-0">
                            {newLinks.length > 1 && (
                              <button 
                                type="button" 
                                onClick={() => setNewLinks(prev => prev.filter((_, i) => i !== index))}
                                className="absolute -top-1 -right-1 p-0.5 text-slate-400 hover:text-rose-500 bg-slate-50 rounded-full"
                              >
                                <X size={14}/>
                              </button>
                            )}
                            <input
                              type="url"
                              value={link.url}
                              onChange={(e) => {
                                const arr = [...newLinks];
                                arr[index].url = e.target.value;
                                setNewLinks(arr);
                              }}
                              placeholder="ওয়েব লিংক (URL) *"
                              className="w-full text-xs bg-white border border-slate-200/90 rounded-lg p-2 text-slate-800 outline-none focus:border-slate-400 transition pr-6"
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <input
                                type="text"
                                value={link.title}
                                onChange={(e) => {
                                  const arr = [...newLinks];
                                  arr[index].title = e.target.value;
                                  setNewLinks(arr);
                                }}
                                placeholder="উৎসের শিরোনাম (e.g. Official Gazette Report)"
                                className="text-xs bg-white border border-slate-200/90 rounded-lg p-2 text-slate-800 outline-none focus:border-slate-400 transition"
                              />
                              <input
                                type="text"
                                value={link.sourceName}
                                onChange={(e) => {
                                  const arr = [...newLinks];
                                  arr[index].sourceName = e.target.value;
                                  setNewLinks(arr);
                                }}
                                placeholder="উৎস প্রদানকারী (e.g. Newspaper)"
                                className="text-xs bg-white border border-slate-200/90 rounded-lg p-2 text-slate-800 outline-none focus:border-slate-400 transition"
                              />
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => setNewLinks(prev => [...prev, { url: '', title: '', sourceName: '' }])}
                          className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 mt-1"
                        >
                          <Plus size={12}/> আরও একটি লিংক যোগ করুন
                        </button>
                      </div>
                    )}

                    {/* Bottom action row */}
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <label className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full cursor-pointer transition" title="ছবি/মিডিয়া সংযুক্ত করুন">
                          <Camera size={16} />
                          <input
                            type="file"
                            multiple
                            accept="image/*,video/*,application/pdf"
                            onChange={(e) => {
                              if (e.target.files) addFiles(Array.from(e.target.files));
                            }}
                            className="hidden"
                          />
                        </label>
                        <label className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full cursor-pointer transition" title="ফাইল সংযুক্ত করুন">
                          <Paperclip size={16} />
                          <input
                            type="file"
                            multiple
                            accept="image/*,video/*,application/pdf"
                            onChange={(e) => {
                              if (e.target.files) addFiles(Array.from(e.target.files));
                            }}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowLinkFields(!showLinkFields)}
                          className={`p-1.5 rounded-full transition cursor-pointer ${
                            showLinkFields || newLinks[0]?.url ? 'text-emerald-700 bg-emerald-100 border border-emerald-300' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                          }`}
                          title="নতুন উৎস (Source Link) যোগ করুন"
                        >
                          <Link2 size={16} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddCombined}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-1.5 rounded-lg shadow-sm transition cursor-pointer"
                      >
                        যোগ করুন
                      </button>
                    </div>
                  </div>
                )}



                {/* Preview List of Selected Existing & Created Items */}
                {(selectedEvidenceIds.length > 0 || selectedSourceIds.length > 0 || newEvidenceList.length > 0 || newSourceList.length > 0) && (
                  <div className="pt-3 border-t border-slate-100 space-y-1.5">
                    <p className="text-[11px] font-bold text-slate-600 mb-1">সংযুক্ত আইটেমসমূহ (Selected & Created):</p>
                    {selectedEvidenceIds.map((evId) => {
                      const evObj = availableEvidence.find((item: any) => (item.evidence?.id || item.id) === evId);
                      const ev = evObj?.evidence || evObj;
                      return (
                        <div key={evId} className="flex items-center justify-between text-xs bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                          <span className="font-semibold text-slate-800 truncate">✓ {ev?.title || 'Existing Evidence'}</span>
                          <button type="button" onClick={() => toggleEvidenceId(evId)} className="text-slate-400 hover:text-rose-600 ml-2">
                            <X size={13} />
                          </button>
                        </div>
                      );
                    })}
                    {newEvidenceList.map((ev, idx) => (
                      <div key={`new-ev-${idx}`} className="flex items-center justify-between text-xs bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                        <span className="font-semibold text-emerald-900 truncate">+ {ev.title} (New Native Evidence)</span>
                        <button type="button" onClick={() => setNewEvidenceList((prev) => prev.filter((_, i) => i !== idx))} className="text-emerald-600 hover:text-rose-600 ml-2">
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                    {selectedSourceIds.map((srcId) => {
                      const srcObj = availableSources.find((item: any) => (item.source?.id || item.id) === srcId);
                      const src = srcObj?.source || srcObj;
                      return (
                        <div key={srcId} className="flex items-center justify-between text-xs bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                          <span className="font-semibold text-slate-800 truncate">✓ {src?.title || 'Existing Source'}</span>
                          <button type="button" onClick={() => toggleSourceId(srcId)} className="text-slate-400 hover:text-rose-600 ml-2">
                            <X size={13} />
                          </button>
                        </div>
                      );
                    })}
                    {newSourceList.map((src, idx) => (
                      <div key={`new-src-${idx}`} className="flex items-center justify-between text-xs bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                        <span className="font-semibold text-emerald-900 truncate">+ {src.title} (New Native Source)</span>
                        <button type="button" onClick={() => setNewSourceList((prev) => prev.filter((_, i) => i !== idx))} className="text-emerald-600 hover:text-rose-600 ml-2">
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            )}
          </div>



          {/* 6. Submit Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-lg transition"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 text-xs font-bold bg-slate-900 hover:bg-black text-white rounded-xl shadow-sm transition disabled:opacity-50"
            >
              {isLoading ? 'পাবলিশ হচ্ছে...' : 'পাবলিশ করুন'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
