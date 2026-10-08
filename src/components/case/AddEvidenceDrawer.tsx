import React, { useState } from 'react';
import { X, Paperclip, Link as LinkIcon, Camera, FileText, Plus } from 'lucide-react';
import { useAddEvidenceMutation, useAddCaseEvidenceMutation } from '@/redux/feature/case/case.reducer';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useImageUpload } from '@/hooks/useImageUpload';
import AnonymousToggle from '../common/AnonymousToggle';

interface AddEvidenceDrawerProps {
   isOpen: boolean;
   onClose: () => void;
   caseId: string;
   claimId?: string;
   isModal?: boolean;
   isNotShowAnonymous?: boolean;
}

export default function AddEvidenceForm({ isOpen, onClose, caseId, claimId, isModal, isNotShowAnonymous = false }: AddEvidenceDrawerProps) {
   const [addEvidence, { isLoading: isClaimLoading }] = useAddEvidenceMutation();
   const [addCaseEvidence, { isLoading: isCaseLoading }] = useAddCaseEvidenceMutation();

   const isLoading = isClaimLoading || isCaseLoading;

   const { files, addFiles, removeFile, validFiles, clearFiles } = useImageUpload();

   const [text, setText] = useState('');
   const [sourceUrls, setSourceUrls] = useState<string[]>(['']);
   const [relationship, setRelationship] = useState('SUPPORTS');
   const [showLinkInput, setShowLinkInput] = useState(false);
   const [isAnonymous, setIsAnonymous] = useState(false);
   const { isAuthenticated } = useSelector((state: RootState) => state.auth);

   if (!isOpen || !isAuthenticated) return null;

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      const hasValidLinks = sourceUrls.some(url => url.trim() !== '');
      if (!text.trim() && validFiles.length === 0 && !hasValidLinks) {
         alert("অনুগ্রহ করে কোনো তথ্য, ছবি বা উৎসের লিংক দিন।");
         return;
      }

      try {
         const payload: any = {
            isAnonymous,
            evidence: [],
            sources: []
         };

         if (text.trim() || validFiles.length > 0) {
            payload.evidence.push({
               title: text.trim() || 'প্রমাণ',
               type: validFiles.length > 0 ? (validFiles[0].processedFile?.type.includes('video') ? 'VIDEO' : validFiles[0].processedFile?.type.includes('pdf') ? 'DOCUMENT' : 'IMAGE') : 'TEXT',
               relationship: relationship
            });
         }

         const validLinks = sourceUrls.filter(url => url.trim() !== '');
         if (validLinks.length > 0) {
            try {
               const urlObj = new URL(validLinks[0]);
               payload.sources.push({
                  title: urlObj.hostname,
                  sourceLocation: '',
                  sourceDate: new Date().toISOString(),
                  externalSourceType: 'website',
                  externalSourceName: urlObj.hostname,
                  externalLinks: validLinks,
                  relationship: relationship
               });
            } catch {
               alert("অনুগ্রহ করে সঠিক লিংকের ফরম্যাট দিন (যেমন: https://...)");
               return;
            }
         }

         const formData = new FormData();
         formData.append('data', JSON.stringify(payload));

         if (payload.evidence.length > 0) {
            validFiles.forEach((f: any) => {
               if (f.processedFile) formData.append(`evidenceMedia_0`, f.processedFile);
            });
         }

         if (claimId) {
            await addEvidence({ claimId, caseId, formData }).unwrap();
         } else {
            await addCaseEvidence({ caseId, formData }).unwrap();
         }
         onClose();
         // Reset form
         setText(''); clearFiles(); setSourceUrls(['']); setRelationship('SUPPORTS');
         alert("তথ্য সফলভাবে যোগ হয়েছে।");
      } catch (error) {
         const err = error as any;
         console.error("Failed to add evidence", err);
         if (err?.status === 401) {
            alert("এই কাজটি করতে লগইন করতে হবে। আপনার লগইন সেশন শেষ হয়ে গেছে।");
            window.location.href = '/login';
         } else {
            alert("তথ্য যোগ করা যায়নি। আবার চেষ্টা করুন।");
         }
      }
   };

   const relationshipOptions = [
      { value: 'SUPPORTS', label: 'সমর্থন করে' },
      { value: 'CHALLENGES', label: 'বিরোধিতা করে' },
      { value: 'CONTEXT', label: 'প্রেক্ষাপট' }
   ];

   const formContent = (
      <div className={`rounded-xl shadow-sm overflow-hidden animate-in slide-in-from-top-2 duration-200 transition-colors ${isModal ? 'w-full shadow-2xl border-0' : 'border mb-6'} ${isAnonymous ? 'bg-slate-50 border-slate-300' : 'bg-white border-slate-200'}`}>
         <form id="add-evidence-form" onSubmit={handleSubmit} className="flex flex-col">

            <div className={`p-4 pb-0 relative transition-colors ${isAnonymous ? 'bg-slate-100/50' : 'bg-transparent'}`}>
               {!isNotShowAnonymous && (
                  <div className="flex justify-between items-center mb-2">
                     <AnonymousToggle isAnonymous={isAnonymous} onChange={setIsAnonymous} />
                     <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-1.5 rounded-full transition">
                        <X size={16} />
                     </button>
                  </div>
               )}
               <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  className="w-full text-sm resize-none focus:outline-none min-h-[80px] text-slate-800 placeholder:text-slate-400"
                  placeholder="আপনার কাছে কি কোনো প্রমাণ বা তথ্য আছে? এখানে বিস্তারিত লিখুন..."
               />
            </div>

            {(files.length > 0 || showLinkInput) && (
               <div className="mx-4 mb-3 p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-4">

                  {files.length > 0 && (
                     <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Attached Files</div>
                        <div className="flex flex-wrap gap-2">
                           {files.map((f: any) => (
                              <div key={f.id} className="relative w-14 h-14 rounded-lg border border-slate-200 overflow-hidden bg-white flex flex-col items-center justify-center group shadow-sm">
                                 {f.state === 'processing' && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                                       <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    </div>
                                 )}
                                 {f.state === 'error' && (
                                    <div className="absolute inset-0 bg-red-500/80 flex flex-col items-center justify-center z-10 p-1">
                                       <span className="text-[8px] text-white text-center font-bold leading-tight" title={f.error}>Failed</span>
                                    </div>
                                 )}
                                 {f.originalFile.type.startsWith('image/') ? (
                                    <img src={f.previewUrl} alt="preview" className="w-full h-full object-cover" />
                                 ) : (
                                    <div className="p-1 text-center">
                                       <span className="text-[8px] font-bold text-slate-500 break-all line-clamp-2">{f.originalFile.name}</span>
                                    </div>
                                 )}
                                 <button type="button" onClick={() => removeFile(f.id)} className="absolute top-0 right-0 bg-red-500/90 text-white p-0.5 rounded-bl-lg shadow-sm hover:bg-red-600 backdrop-blur-sm transition z-20"><X size={12} /></button>
                              </div>
                           ))}
                           <label className="relative w-14 h-14 rounded-lg border-2 border-dashed border-slate-300 hover:border-slate-500 bg-slate-50 hover:bg-slate-50 flex flex-col items-center justify-center cursor-pointer transition text-slate-400 hover:text-slate-500 shadow-sm">
                              <Plus size={20} />
                              <input type="file" multiple accept="image/*,video/*,application/pdf" onChange={e => {
                                 if (e.target.files) addFiles(Array.from(e.target.files));
                              }} className="hidden" />
                           </label>
                        </div>
                     </div>
                  )}

                  {showLinkInput && (
                     <div>
                        <div className="flex items-center justify-between mb-2">
                           <div className="text-[10px] font-bold text-slate-500 uppercase">Source Links</div>
                           <button type="button" onClick={() => setShowLinkInput(false)} className="text-[10px] font-bold text-red-500 hover:underline">Close</button>
                        </div>
                        <div className="flex flex-col gap-2">
                           {sourceUrls.map((url, index) => (
                              <div key={index} className="flex items-center gap-2">
                                 <input
                                    type="url"
                                    value={url}
                                    onChange={e => {
                                       const newUrls = [...sourceUrls];
                                       newUrls[index] = e.target.value;

                                       if (index === sourceUrls.length - 1 && e.target.value.trim() !== '') {
                                          newUrls.push('');
                                       }

                                       setSourceUrls(newUrls);
                                    }}
                                    className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-500 outline-none bg-white shadow-sm"
                                    placeholder="https://..."
                                 />
                                 {sourceUrls.length > 1 && index !== sourceUrls.length - 1 && (
                                    <button type="button" onClick={() => setSourceUrls(sourceUrls.filter((_, i) => i !== index))} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition shrink-0">
                                       <X size={14} />
                                    </button>
                                 )}
                              </div>
                           ))}
                        </div>
                     </div>
                  )}
               </div>
            )}

            <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">

               <div className="flex items-center gap-2">
                  <label className="p-2 text-slate-500 hover:text-slate-600 hover:bg-slate-100 rounded-full cursor-pointer transition relative group">
                     <Camera size={18} />
                     <input type="file" multiple accept="image/*,video/*,application/pdf" onChange={e => {
                        if (e.target.files) addFiles(Array.from(e.target.files));
                     }} className="hidden" />
                  </label>
                  <button type="button" onClick={() => setShowLinkInput(true)} className="p-2 text-slate-500 hover:text-slate-600 hover:bg-slate-100 rounded-full cursor-pointer transition">
                     <LinkIcon size={18} />
                  </button>
               </div>

               <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="flex items-center bg-slate-200/50 p-1 rounded-lg border border-slate-200/50">
                     {relationshipOptions.map(opt => (
                        <button
                           key={opt.value}
                           type="button"
                           onClick={() => setRelationship(opt.value)}
                           className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition ${relationship === opt.value ? 'bg-white text-slate-800 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 border border-transparent'}`}
                        >
                           {opt.label}
                        </button>
                     ))}
                  </div>

                  <button type="submit" disabled={isLoading} className="px-5 py-1.5 text-xs font-bold text-white bg-slate-600 hover:bg-slate-700 rounded-lg transition shadow-sm disabled:opacity-50">
                     {isLoading ? 'Wait...' : 'সাবমিট'}
                  </button>
               </div>
            </div>

         </form>
      </div>
   );

   if (isModal) {
      return (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="relative w-full max-w-2xl">
               {formContent}
            </div>
         </div>
      );
   }

   return formContent;
}
