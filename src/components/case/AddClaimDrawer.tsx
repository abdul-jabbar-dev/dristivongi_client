import React, { useState } from 'react';
import { X, Plus, Trash2, Camera, Link as LinkIcon, FileText } from 'lucide-react';
import { useCreateClaimMutation } from '@/redux/feature/case/case.reducer';
import AnonymousToggle from '../common/AnonymousToggle';

interface AddClaimDrawerProps {
   isOpen: boolean;
   onClose: () => void;
   caseId: string;
}

export default function AddClaimDrawer({ isOpen, onClose, caseId }: AddClaimDrawerProps) {
   const [createClaim, { isLoading }] = useCreateClaimMutation();
   const [title, setTitle] = useState('');
   const [isAnonymous, setIsAnonymous] = useState(false);

   const [evidence, setEvidence] = useState<{ title: string; type: string; relationship: string; files: File[] }[]>([]);
   const [sources, setSources] = useState<{ type: string; name: string; link: string; date: string; relationship: string }[]>([]);

   // Editor removed

   if (!isOpen) return null;

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const titlePlain = title.trim();

      if (titlePlain.length < 3) return;

      try {
         const payload = {
            title: titlePlain,
            isAnonymous,
            evidence: evidence.map(ev => ({
               title: ev.title,
               type: ev.type,
               relationship: ev.relationship
            })),
            sources: sources.map(src => ({
               title: src.name,
               sourceLocation: '',
               sourceDate: src.date,
               externalSourceType: src.type,
               externalSourceName: src.name,
               externalLinks: src.link ? [src.link] : [],
               relationship: src.relationship
            }))
         };

         const formData = new FormData();
         formData.append('data', JSON.stringify(payload));

         // Append files. Following naming convention evidenceMedia_INDEX
         evidence.forEach((ev, idx) => {
            ev.files.forEach(file => {
               formData.append(`evidenceMedia_${idx}`, file);
            });
         });

         await createClaim({ caseId, formData }).unwrap();
         onClose();
         // Reset form
         setTitle(''); setEvidence([]); setSources([]);
         alert("দাবিটি সফলভাবে যোগ করা হয়েছে।");
      } catch (error) {
         const err = error as any;
         console.error("Failed to add claim", err);
         if (err?.status === 401) {
            alert("এই কাজটি করতে লগইন করতে হবে। আপনার লগইন সেশন শেষ হয়ে গেছে।");
            window.location.href = '/login';
         } else {
            alert("দাবিটি যোগ করা যায়নি। আবার চেষ্টা করুন।");
         }
      }
   };

   const relationshipOptions = [
      { value: 'SUPPORTS', label: 'সমর্থন করে', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      { value: 'CHALLENGES', label: 'বিরোধিতা করে', color: 'bg-red-50 text-red-700 border-red-200' },
      { value: 'CONTEXT', label: 'শুধু প্রেক্ষাপট দেয়', color: 'bg-amber-50 text-amber-700 border-amber-200' }
   ];

   return (
      <div className="fixed inset-0 z-50 flex justify-end">
         {/* Overlay */}
         <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>

         {/* Drawer */}
         <div className={`relative w-full max-w-lg h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 transition-colors ${isAnonymous ? 'bg-slate-50' : 'bg-white'}`}>

            <div className={`flex items-start justify-between p-5 border-b transition-colors ${isAnonymous ? 'border-slate-200 bg-slate-100/50' : 'border-slate-100 bg-slate-50/50'}`}>
               <div>
                  <h2 className={`text-xl font-bold ${isAnonymous ? 'text-slate-800' : 'text-slate-900'}`}>
                     {isAnonymous ? 'বেনামে একটি দাবি যোগ করুন' : 'আরেকটি দাবি যোগ করুন'}
                  </h2>
                  <p className={`text-xs mt-1 leading-relaxed ${isAnonymous ? 'text-slate-500' : 'text-slate-500'}`}>
                     {isAnonymous ? 'আপনার পরিচয় প্রকাশ পাবে না।' : 'এই বিষয় নিয়ে কোনো দাবি বা ভিন্ন মত থাকলে যোগ করতে পারেন।\nতথ্য ও প্রমাণ দিলে অন্যরা বুঝতে সুবিধা পাবে।'}
                  </p>
                  <div className="mt-3">
                     <AnonymousToggle isAnonymous={isAnonymous} onChange={setIsAnonymous} />
                  </div>
               </div>
               <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition text-slate-500">
                  <X size={20} />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
               <form id="add-claim-form" onSubmit={handleSubmit} className="space-y-8">

                  {/* Step 1: Claim */}
                  <div className="space-y-4">
                     <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
                        <div className="w-6 h-6 rounded-full bg-slate-600 text-white flex items-center justify-center text-xs font-bold shrink-0">১</div>
                        <h3 className="font-bold text-slate-900">আপনার দাবি কী?</h3>
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">দাবির শিরোনাম *</label>
                        <textarea
                           required
                           value={title}
                           onChange={(e) => setTitle(e.target.value)}
                           className="w-full px-4 py-3 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition min-h-[100px] resize-y"
                           placeholder="সহজভাবে লিখুন—আপনি কী ঘটেছে বলে মনে করছেন?"
                        />
                     </div>
                  </div>

                  {/* Step 2: Evidence */}
                  <div className="space-y-4">
                     <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
                        <div className="w-6 h-6 rounded-full bg-slate-600 text-white flex items-center justify-center text-xs font-bold shrink-0">২</div>
                        <div>
                           <h3 className="font-bold text-slate-900">তথ্য বা প্রমাণ যোগ করুন (ঐচ্ছিক)</h3>
                           <p className="text-[10px] text-slate-500">আপনার দাবিকে সমর্থন করে এমন ছবি, ভিডিও, নথি বা অন্য কোনো তথ্য যোগ করতে পারেন।</p>
                        </div>
                     </div>

                     <button type="button" onClick={() => setEvidence([...evidence, { title: '', type: 'IMAGE', relationship: 'SUPPORTS', files: [] }])} className="flex items-center justify-center gap-2 w-full py-2.5 border-2 border-dashed border-slate-200 bg-slate-50/50 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 transition">
                        <Plus size={16} /> নতুন প্রমাণ যোগ করুন
                     </button>

                     <div className="space-y-4">
                        {evidence.map((ev, idx) => (
                           <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl relative">
                              <button type="button" onClick={() => setEvidence(evidence.filter((_, i) => i !== idx))} className="absolute top-3 right-3 text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                              <h4 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-2"><FileText size={14} className="text-slate-600" /> প্রমাণ {idx + 1}</h4>

                              <div className="space-y-3">
                                 <div>
                                    <label className="block text-[10px] font-bold text-slate-700 mb-1">প্রমাণের শিরোনাম *</label>
                                    <textarea required value={ev.title} onChange={e => { const newEv = [...evidence]; newEv[idx].title = e.target.value; setEvidence(newEv); }} className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded min-h-[60px]" placeholder="যেমন: সংস্কার কাজের ছবি" />
                                 </div>
                                 <div>
                                    <label className="block text-[10px] font-bold text-slate-700 mb-1">ফাইল আপলোড (একাধিক ছবি/ভিডিও/নথি)</label>
                                    <input type="file" multiple accept="image/*,video/*,application/pdf" onChange={async e => {
                                       try {
                                          const { processFilesForUpload } = await import('@/lib/image-processor');
                                          const processedFiles = await processFilesForUpload(Array.from(e.target.files || []));
                                          const newEv = [...evidence];
                                          newEv[idx].files = [...newEv[idx].files, ...processedFiles];
                                          setEvidence(newEv);
                                       } catch (err: any) {
                                          alert(err.message || 'Image processing failed');
                                       }
                                    }} className="text-xs text-slate-500 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100" />
                                    {ev.files.length > 0 && (
                                       <div className="mt-2 space-y-2">
                                          <p className="text-[10px] text-slate-600">{ev.files.length}টি ফাইল নির্বাচিত:</p>
                                          <div className="flex flex-wrap gap-2">
                                             {ev.files.map((f, fIdx) => (
                                                <div key={fIdx} className="relative w-16 h-16 rounded border border-slate-200 overflow-hidden bg-slate-50 flex flex-col items-center justify-center" title={f.name}>
                                                   {f.type.startsWith('image/') ? (
                                                      <img src={URL.createObjectURL(f)} alt="preview" className="w-full h-full object-cover" />
                                                   ) : (
                                                      <div className="p-1 text-center">
                                                         <span className="text-[8px] font-bold text-slate-500 break-all line-clamp-2">{f.name}</span>
                                                      </div>
                                                   )}
                                                   <button type="button" onClick={() => { const newEv = [...evidence]; newEv[idx].files = newEv[idx].files.filter((_, i) => i !== fIdx); setEvidence(newEv); }} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-sm transform scale-75 hover:bg-red-600"><X size={12} /></button>
                                                </div>
                                             ))}
                                          </div>
                                       </div>
                                    )}
                                 </div>
                                 <div>
                                    <label className="block text-[10px] font-bold text-slate-700 mb-2">এটি দাবিটিকে কীভাবে সমর্থন করে? *</label>
                                    <div className="flex flex-wrap gap-2">
                                       {relationshipOptions.map(opt => (
                                          <label key={opt.value} className={`cursor-pointer px-2 py-1 text-[10px] font-bold rounded-full border flex items-center gap-1.5 transition ${ev.relationship === opt.value ? opt.color + ' border-current' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                                             <input type="radio" className="hidden" name={`relationship-ev-${idx}`} value={opt.value} checked={ev.relationship === opt.value} onChange={() => { const newEv = [...evidence]; newEv[idx].relationship = opt.value; setEvidence(newEv); }} />
                                             {opt.value === 'SUPPORTS' ? '🟢' : opt.value === 'CHALLENGES' ? '🔴' : '🟡'} {opt.label}
                                          </label>
                                       ))}
                                    </div>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Step 3: Sources */}
                  <div className="space-y-4">
                     <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
                        <div className="w-6 h-6 rounded-full bg-slate-600 text-white flex items-center justify-center text-xs font-bold shrink-0">৩</div>
                        <div>
                           <h3 className="font-bold text-slate-900">তথ্যটি কোথা থেকে এসেছে? (ঐচ্ছিক)</h3>
                           <p className="text-[10px] text-slate-500">তথ্যের উৎস দিলে বিষয়টি আরও বিশ্বাসযোগ্য হয়।</p>
                        </div>
                     </div>

                     <button type="button" onClick={() => setSources([...sources, { type: 'সংবাদ', name: '', link: '', date: '', relationship: 'SUPPORTS' }])} className="flex items-center justify-center gap-2 w-full py-2.5 border-2 border-dashed border-slate-200 bg-slate-50/50 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 transition">
                        <Plus size={16} /> নতুন উৎস যোগ করুন
                     </button>

                     <div className="space-y-4">
                        {sources.map((src, idx) => (
                           <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl relative">
                              <button type="button" onClick={() => setSources(sources.filter((_, i) => i !== idx))} className="absolute top-3 right-3 text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                              <h4 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-2"><LinkIcon size={14} className="text-slate-600" /> উৎস {idx + 1}</h4>

                              <div className="grid grid-cols-2 gap-3">
                                 <div>
                                    <label className="block text-[10px] font-bold text-slate-700 mb-1">উৎসের ধরন *</label>
                                    <select value={src.type} onChange={e => { const newSrc = [...sources]; newSrc[idx].type = e.target.value; setSources(newSrc); }} className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded bg-white">
                                       <option>সংবাদ</option><option>সরকারি তথ্য</option><option>অফিসিয়াল নথি</option><option>সামাজিক মাধ্যম</option><option>অন্যান্য</option>
                                    </select>
                                 </div>
                                 <div>
                                    <label className="block text-[10px] font-bold text-slate-700 mb-1">উৎসের নাম *</label>
                                    <input required value={src.name} onChange={e => { const newSrc = [...sources]; newSrc[idx].name = e.target.value; setSources(newSrc); }} className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded" placeholder="যেমন: প্রথম আলো" />
                                 </div>
                                 <div className="col-span-2">
                                    <label className="block text-[10px] font-bold text-slate-700 mb-1">লিংক (থাকলে)</label>
                                    <input type="url" value={src.link} onChange={e => { const newSrc = [...sources]; newSrc[idx].link = e.target.value; setSources(newSrc); }} className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded" placeholder="https://..." />
                                 </div>
                                 <div className="col-span-2">
                                    <label className="block text-[10px] font-bold text-slate-700 mb-2">সম্পর্ক *</label>
                                    <div className="flex flex-wrap gap-2">
                                       {relationshipOptions.map(opt => (
                                          <label key={opt.value} className={`cursor-pointer px-2 py-1 text-[10px] font-bold rounded-full border flex items-center gap-1.5 transition ${src.relationship === opt.value ? opt.color + ' border-current' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                                             <input type="radio" className="hidden" name={`relationship-src-${idx}`} value={opt.value} checked={src.relationship === opt.value} onChange={() => { const newSrc = [...sources]; newSrc[idx].relationship = opt.value; setSources(newSrc); }} />
                                             {opt.label}
                                          </label>
                                       ))}
                                    </div>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

               </form>
            </div>

            <div className={`p-5 border-t flex justify-between gap-3 shrink-0 transition-colors ${isAnonymous ? 'border-slate-200 bg-slate-50/50' : 'border-slate-100 bg-white'}`}>
               <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition w-1/3">বাতিল</button>
               <button type="submit" form="add-claim-form" disabled={isLoading} className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition w-2/3 shadow-sm flex items-center justify-center gap-2 disabled:opacity-50">
                  {isLoading ? 'প্রকাশ করা হচ্ছে...' : 'দাবি প্রকাশ করুন'}
               </button>
            </div>
         </div>
      </div>
   );
}
