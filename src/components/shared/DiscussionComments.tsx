import React, { useState, useRef } from 'react';
import { useGetOpinionsQuery, useCreateOpinionMutation } from '@/redux/feature/opinion/opinion.reducer';
import { resolveMediaUrl, getAvatarUrl } from '@/lib/utils';
import { Image as ImageIcon, Send, Link as LinkIcon, X, Play, Shield } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import Link from 'next/link';
import LightboxModal from './LightboxModal';
import TextWithMentions from './TextWithMentions';

interface Source {
   title: string;
   externalLinks: string[];
}

interface MentionState {
   type: 'USER' | 'HASHTAG';
   query: string;
   cursorPos: number;
   tokenStart: number;
   tokenLength: number;
   isReply: boolean;
   selectedIndex: number;
}

export default function DiscussionComments({ 
   targetType, 
   targetId, 
   previewMode, 
   mentionSuggestions = [],
   userSuggestions = [] 
}: { 
   targetType: 'CASE' | 'CLAIM' | 'EVIDENCE' | 'SOURCE', 
   targetId: string, 
   previewMode?: boolean, 
   mentionSuggestions?: any[],
   userSuggestions?: any[]
}) {
   const { data: opinionsResponse, isLoading } = useGetOpinionsQuery({ targetType, targetId });
   const allOpinions = opinionsResponse?.data || [];
   let opinions = allOpinions.filter((op: any) => op.value === 'DISCUSSION').sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
   if (previewMode) {
      opinions = opinions.slice(0, 2);
   }

   const [createOpinion, { isLoading: isPosting }] = useCreateOpinionMutation();
   const [commentText, setCommentText] = useState('');

   const user = useSelector((state: RootState) => state.auth.user);
   const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

   // New states for dynamic features
   const [opinionFiles, setOpinionFiles] = useState<File[]>([]);
   const [opinionSources, setOpinionSources] = useState<Source[]>([]);
   const [showSourceInputs, setShowSourceInputs] = useState(false);
   const [sourceTitle, setSourceTitle] = useState('');
   const [sourceUrl, setSourceUrl] = useState('');

   // State for tracking which comment we are replying to
   const [replyingToId, setReplyingToId] = useState<string | null>(null);
   const [replyText, setReplyText] = useState('');
   const [isAnonymous, setIsAnonymous] = useState(false);
   const [lightboxState, setLightboxState] = useState<{ medias: any[], initialIndex: number, contextInfo?: any } | null>(null);

   // Mention state for @ and #
   const [mentionState, setMentionState] = useState<MentionState | null>(null);
   const dropdownRef = useRef<HTMLDivElement>(null);
   const mainInputRef = useRef<HTMLInputElement>(null);
   const replyInputRef = useRef<HTMLInputElement>(null);

   // Merge passed userSuggestions with opinions authors
   const allUserSuggestions = React.useMemo(() => {
      const map = new Map<string, any>();
      userSuggestions.forEach(u => {
         const key = u.userName || u.id;
         if (key) map.set(key, u);
      });
      allOpinions.forEach((op: any) => {
         if (!op.isAnonymous && op.author) {
            const uname = op.author.userName || (op.author.fullName ? op.author.fullName.toLowerCase().replace(/\s+/g, '') : op.author.id);
            if (uname && !map.has(uname)) {
               map.set(uname, {
                  id: op.author.id,
                  userName: uname,
                  fullName: op.author.fullName || uname,
                  avatar: getAvatarUrl(op.author),
                  role: 'আলোচক'
               });
            }
         }
         if (op.replies) {
            op.replies.forEach((r: any) => {
               if (!r.isAnonymous && r.author) {
                  const uname = r.author.userName || (r.author.fullName ? r.author.fullName.toLowerCase().replace(/\s+/g, '') : r.author.id);
                  if (uname && !map.has(uname)) {
                     map.set(uname, {
                        id: r.author.id,
                        userName: uname,
                        fullName: r.author.fullName || uname,
                        avatar: getAvatarUrl(r.author),
                        role: 'আলোচক'
                     });
                  }
               }
            });
         }
      });
      return Array.from(map.values());
   }, [userSuggestions, allOpinions]);

   // Filter suggestions based on active mention state
   const currentSuggestions = React.useMemo(() => {
      if (!mentionState) return [];
      const query = mentionState.query.toLowerCase();
      if (mentionState.type === 'USER') {
         return allUserSuggestions.filter(u => 
            u.userName?.toLowerCase().includes(query) || 
            u.fullName?.toLowerCase().includes(query)
         );
      } else {
         return (mentionSuggestions || []).filter(s =>
            s.title?.toLowerCase().includes(query) ||
            s.type?.toLowerCase().includes(query) ||
            s.author?.toLowerCase().includes(query)
         );
      }
   }, [mentionState, allUserSuggestions, mentionSuggestions]);

   const handleInputChange = (value: string, cursorPos: number, isReply: boolean = false) => {
      if (isReply) {
         setReplyText(value);
      } else {
         setCommentText(value);
      }

      const textBeforeCursor = value.slice(0, cursorPos);
      const match = textBeforeCursor.match(/(?:^|\s)([@#][^\s]*)$/);

      if (match) {
         const token = match[1];
         const prefix = token[0];
         const query = token.slice(1);
         const tokenStart = cursorPos - token.length;

         setMentionState({
            type: prefix === '@' ? 'USER' : 'HASHTAG',
            query,
            cursorPos,
            tokenStart,
            tokenLength: token.length,
            isReply,
            selectedIndex: 0
         });
      } else {
         setMentionState(null);
      }
   };

   const handleSelectMention = (item: any, isReply: boolean = false) => {
      const currentText = isReply ? replyText : commentText;
      let insertedText = '';

      if (mentionState?.type === 'USER') {
         insertedText = `@${item.userName || item.id} `;
      } else {
         const prefix = item.prefix || (
            item.type === 'CLAIM' ? '#claim-' :
            item.type === 'UPDATE' ? '#status-' : 
            item.type === 'SOURCE' ? '#source-' : '#evidence-'
         );
         insertedText = `${prefix}${item.id} `;
      }

      const tokenStart = mentionState?.tokenStart ?? 0;
      const tokenLength = mentionState?.tokenLength ?? 0;
      const before = currentText.slice(0, tokenStart);
      const after = currentText.slice(tokenStart + tokenLength);
      const newText = before + insertedText + after;

      if (isReply) {
         setReplyText(newText);
         setTimeout(() => {
            if (replyInputRef.current) {
               const pos = before.length + insertedText.length;
               replyInputRef.current.focus();
               replyInputRef.current.setSelectionRange(pos, pos);
            }
         }, 10);
      } else {
         setCommentText(newText);
         setTimeout(() => {
            if (mainInputRef.current) {
               const pos = before.length + insertedText.length;
               mainInputRef.current.focus();
               mainInputRef.current.setSelectionRange(pos, pos);
            }
         }, 10);
      }
      setMentionState(null);
   };

   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, isReply: boolean = false) => {
      if (mentionState && mentionState.isReply === isReply && currentSuggestions.length > 0) {
         if (e.key === 'ArrowDown') {
            e.preventDefault();
            setMentionState(prev => prev ? {
               ...prev,
               selectedIndex: (prev.selectedIndex + 1) % currentSuggestions.length
            } : null);
            return;
         }
         if (e.key === 'ArrowUp') {
            e.preventDefault();
            setMentionState(prev => prev ? {
               ...prev,
               selectedIndex: (prev.selectedIndex - 1 + currentSuggestions.length) % currentSuggestions.length
            } : null);
            return;
         }
         if (e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();
            const item = currentSuggestions[mentionState.selectedIndex];
            if (item) {
               handleSelectMention(item, isReply);
               return;
            }
         }
         if (e.key === 'Escape') {
            e.preventDefault();
            setMentionState(null);
            return;
         }
      }

      if (e.key === 'Enter' && !e.shiftKey) {
         e.preventDefault();
         handlePostComment(isReply ? replyingToId || undefined : undefined);
      }
   };

   const fileInputRef = useRef<HTMLInputElement>(null);

   const handlePostComment = async (parentId?: string) => {
      const text = parentId ? replyText : commentText;
      if (!text.trim() && opinionFiles.length === 0 && opinionSources.length === 0) return;

      const formData = new FormData();
      const payload: any = {
         targetType: targetType,
         targetId: targetId,
         content: text,
         value: 'DISCUSSION',
         isAnonymous,
         sources: opinionSources.map(s => ({
            ...s,
            externalSourceType: 'URL',
            externalSourceName: new URL(s.externalLinks[0]).hostname.replace('www.', '')
         }))
      };

      if (parentId) {
         payload.parentId = parentId;
      }

      formData.append("data", JSON.stringify(payload));

      if (!parentId && opinionFiles.length > 0) {
         opinionFiles.forEach(file => formData.append("files", file));
      }

      try {
         await createOpinion(formData).unwrap();
         if (parentId) {
            setReplyText('');
            setReplyingToId(null);
         } else {
            setCommentText('');
            setOpinionFiles([]);
            setOpinionSources([]);
         }
         setMentionState(null);
      } catch (err: any) {
         if (err.status === 401 || err.data?.message === 'jwt expired') {
            alert("মন্তব্য করতে অনুগ্রহ করে লগইন করুন।");
         } else {
            alert(err.data?.message || err.error || "মন্তব্য পোস্ট করা সম্ভব হয়নি");
         }
      }
   };

   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
         try {
            const { processFilesForUpload } = await import('@/lib/image-processor');
            const processedFiles = await processFilesForUpload(Array.from(e.target.files));
            setOpinionFiles(prev => [...prev, ...processedFiles]);
         } catch (err: any) {
            alert(err.message || 'Image processing failed');
         }
      }
   };

   const removeFile = (index: number) => {
      setOpinionFiles(prev => prev.filter((_, i) => i !== index));
   };

   const handleAddSource = () => {
      if (!sourceTitle.trim() || !sourceUrl.trim()) return;
      try { new URL(sourceUrl); } catch { return alert("সঠিক URL দিন"); }
      setOpinionSources(prev => [...prev, { title: sourceTitle, externalLinks: [sourceUrl] }]);
      setSourceTitle('');
      setSourceUrl('');
      setShowSourceInputs(false);
   };

   const removeSource = (index: number) => {
      setOpinionSources(prev => prev.filter((_, i) => i !== index));
   };

   const toBengali = (num: number | string) => {
      const digits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
      return num.toString().split('').map(d => /[0-9]/.test(d) ? digits[parseInt(d)] : d).join('');
   };

   const formatTime = (dateStr: string) => {
      const date = new Date(dateStr);
      const diffInHours = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60));
      if (diffInHours < 1) return 'এইমাত্র';
      if (diffInHours < 24) return `${toBengali(diffInHours)}ঘণ্টা আগে`;
      return `${toBengali(Math.floor(diffInHours / 24))}দিন আগে`;
   };

   // Render the Mention Dropdown UI
   const renderMentionDropdown = (isReply: boolean) => {
      if (!mentionState || mentionState.isReply !== isReply || currentSuggestions.length === 0) return null;

      const positionClasses = isReply 
         ? "bottom-full mb-1.5 left-0" 
         : "top-full mt-2 left-0";

      return (
         <div 
            ref={dropdownRef}
            className={`absolute ${positionClasses} w-[340px] max-w-[90vw] max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-2xl ring-1 ring-slate-900/5 z-[9999] p-1.5 custom-scrollbar animate-in fade-in zoom-in-95 duration-150`}
         >
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between border-b border-slate-100 mb-1">
               <span>{mentionState.type === 'USER' ? '👤 ব্যবহারকারী মেনশন (@)' : '🏷️ আপডেট ও প্রমাণাদি মেনশন (#)'}</span>
               <span className="text-[9px] font-medium text-slate-400">↑↓ এবং Enter চাপুন</span>
            </div>

            {mentionState.type === 'USER' ? (
               currentSuggestions.map((u: any, idx: number) => {
                  const isSelected = idx === mentionState.selectedIndex;
                  return (
                     <button
                        key={u.userName || idx}
                        type="button"
                        onClick={() => handleSelectMention(u, isReply)}
                        onMouseEnter={() => setMentionState(prev => prev ? { ...prev, selectedIndex: idx } : null)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-2.5 ${
                           isSelected ? 'bg-blue-50/90 text-blue-900 ring-1 ring-blue-200' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                     >
                        <img src={u.avatar} alt={u.fullName} className="w-6 h-6 rounded-full object-cover border border-slate-200 shrink-0" />
                        <div className="flex-1 min-w-0">
                           <div className="flex items-center justify-between gap-1">
                              <span className="font-semibold text-xs truncate">{u.fullName}</span>
                              {u.role && (
                                 <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 font-medium shrink-0">
                                    {u.role}
                                 </span>
                              )}
                           </div>
                           <div className="text-[10px] text-slate-400 truncate">@{u.userName}</div>
                        </div>
                     </button>
                  );
               })
            ) : (
               currentSuggestions.map((s: any, idx: number) => {
                  const isSelected = idx === mentionState.selectedIndex;
                  const isClaim = s.type === 'CLAIM';
                  const isUpdate = s.type === 'UPDATE';
                  const isEvidence = s.type === 'EVIDENCE';
                  const badgeColor = isClaim ? 'bg-sky-100 text-sky-700 border-sky-200' : isUpdate ? 'bg-amber-100 text-amber-700 border-amber-200' : isEvidence ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-indigo-100 text-indigo-700 border-indigo-200';
                  const badgeText = isClaim ? 'দাবি' : isUpdate ? 'আপডেট' : isEvidence ? 'প্রমাণ' : 'উৎস';

                  return (
                     <button
                        key={s.id || idx}
                        type="button"
                        onClick={() => handleSelectMention(s, isReply)}
                        onMouseEnter={() => setMentionState(prev => prev ? { ...prev, selectedIndex: idx } : null)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-xl transition-all mb-0.5 ${
                           isSelected ? 'bg-blue-50/90 text-blue-900 ring-1 ring-blue-200' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                     >
                        <div className="flex items-center gap-1.5 mb-0.5">
                           <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-bold border ${badgeColor}`}>
                              {badgeText}
                           </span>
                           <span className="font-semibold text-xs text-slate-800 truncate flex-1">{s.title || 'শিরোনাম নেই'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 pl-1">
                           {s.author && <span>{s.author}</span>}
                           {s.date && <span>· {new Date(s.date).toLocaleDateString('bn-BD')}</span>}
                        </div>
                     </button>
                  );
               })
            )}
         </div>
      );
   };

   return (
      <div className="pt-2">
         {/* Minimalist Compact Composer */}
         {isAuthenticated && (!previewMode || user) && (
            <div className="mb-3">
               <div className="flex gap-2 items-center">
                  <div className="relative shrink-0">
                     {isAnonymous ? (
                        <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs shadow-sm ring-1 ring-slate-300" title="গোপন মুড">
                           <Shield size={13} />
                        </div>
                     ) : (
                        <img src={getAvatarUrl(user)} alt="Me" className="w-7 h-7 rounded-full object-cover border border-slate-200" />
                     )}
                  </div>

                  <div className="flex-1 min-w-0">
                     <div className="relative">
                        <div className={`flex items-center rounded-xl border px-2.5 py-1 bg-slate-50 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all ${isAnonymous ? 'border-slate-400 bg-slate-100/60' : 'border-slate-200'}`}>
                           <input
                              ref={mainInputRef}
                              type="text"
                              disabled={!user}
                              placeholder={isAnonymous ? "গোপন নাগরিক হিসেবে মতামত লিখুন..." : "মতামত লিখুন... (@ইউজার, #আপডেট/#প্রমাণ)"}
                              className="flex-1 bg-transparent outline-none text-xs text-slate-800 placeholder-slate-400 min-w-0 pr-1.5"
                              value={commentText}
                              onChange={e => handleInputChange(e.target.value, e.target.selectionStart || e.target.value.length, false)}
                              onKeyDown={e => handleKeyDown(e, false)}
                           />

                           <div className="flex items-center gap-1 shrink-0 text-slate-400">
                              {/* Inline Anonymous Mode Toggle */}
                              <button
                                 type="button"
                                 onClick={() => setIsAnonymous(!isAnonymous)}
                                 className={`px-1.5 py-0.5 rounded-lg transition-all text-[10px] flex items-center gap-1 font-semibold ${
                                    isAnonymous
                                       ? 'bg-slate-800 text-white shadow-xs'
                                       : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
                                 }`}
                                 title={isAnonymous ? "গোপন মুড সক্রিয় (Whistleblower Mode On)" : "গোপন মুড চালু করুন"}
                              >
                                 <Shield size={11} className={isAnonymous ? 'fill-current' : ''} />
                                 <span>{isAnonymous ? 'গোপন' : 'নামহীন'}</span>
                              </button>

                              {/* Media Attachment */}
                              <button
                                 type="button"
                                 onClick={() => fileInputRef.current?.click()}
                                 className="p-1 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
                                 title="ছবি/ভিডিও"
                              >
                                 <ImageIcon size={13} />
                              </button>

                              {/* Source Link */}
                              <button
                                 type="button"
                                 onClick={() => setShowSourceInputs(!showSourceInputs)}
                                 className={`p-1 rounded-lg transition-colors ${showSourceInputs ? 'text-blue-600 bg-blue-50' : 'hover:text-slate-700 hover:bg-slate-200/60'}`}
                                 title="উৎস লিঙ্ক"
                              >
                                 <LinkIcon size={13} />
                              </button>

                              <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*,video/*" />

                              {/* Submit Button */}
                              <button
                                 type="button"
                                 disabled={(!commentText.trim() && opinionFiles.length === 0 && opinionSources.length === 0) || isPosting}
                                 onClick={() => handlePostComment()}
                                 className="p-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-30 disabled:hover:bg-blue-600 transition-all shadow-xs ml-0.5 cursor-pointer"
                              >
                                 <Send size={11} />
                              </button>
                           </div>
                        </div>

                        {/* Main Mention Dropdown */}
                        {renderMentionDropdown(false)}
                     </div>

                     {/* Source Inputs if active */}
                     {showSourceInputs && (
                        <div className="mt-1.5 p-2 border border-slate-200 rounded-xl bg-slate-50 flex gap-2 animate-in fade-in zoom-in-95 duration-150">
                           <input type="text" placeholder="উৎস শিরোনাম" className="flex-1 text-xs px-2 py-0.5 bg-white border border-slate-200 rounded-lg outline-none" value={sourceTitle} onChange={e => setSourceTitle(e.target.value)} />
                           <input type="url" placeholder="https://..." className="flex-1 text-xs px-2 py-0.5 bg-white border border-slate-200 rounded-lg outline-none" value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} />
                           <button onClick={handleAddSource} className="bg-blue-600 text-white text-xs font-semibold px-2.5 py-0.5 rounded-lg hover:bg-blue-700">যোগ</button>
                        </div>
                     )}

                     {/* Attachments Preview */}
                     {(opinionFiles.length > 0 || opinionSources.length > 0) && (
                        <div className="mt-1.5 p-1.5 border border-slate-200 rounded-xl bg-slate-50 flex flex-wrap gap-1.5">
                           {opinionFiles.map((file, idx) => (
                              <div key={idx} className="relative w-12 h-12 rounded-lg bg-slate-200 border border-slate-300 overflow-hidden">
                                 {file.type.startsWith('image') ? (
                                    <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                                 ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-600 font-bold uppercase">Vid</div>
                                 )}
                                 <button onClick={() => removeFile(idx)} className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5 shadow-sm hover:bg-red-600 transition"><X size={9} /></button>
                              </div>
                           ))}
                           {opinionSources.map((src, idx) => (
                              <div key={idx} className="flex items-center gap-1 bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md text-[10px]">
                                 <LinkIcon size={9} /> <span className="max-w-[100px] truncate">{src.title}</span>
                                 <button onClick={() => removeSource(idx)} className="ml-1 text-slate-400 hover:text-red-500"><X size={9} /></button>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
               </div>
            </div>
         )}

         {/* Comments List */}
         {isLoading && <div className="text-center py-2 text-xs text-slate-400">মতামত লোড হচ্ছে...</div>}

         {!isLoading && opinions.length === 0 && (
            <div className="text-center py-3 text-xs text-slate-400">এখনো কোনো মতামত যোগ করা হয়নি। প্রথম মতামতটি দিন।</div>
         )}

         {!isLoading && opinions.length > 0 && (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
               {opinions.map((op: any) => (
                  <div key={op.id} className="flex gap-2 items-start text-xs">
                     <img src={getAvatarUrl(op.author)} className="w-7 h-7 rounded-full border border-slate-200 object-cover shrink-0 mt-0.5" />

                     <div className="flex-1 min-w-0">
                        <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 inline-block max-w-full">
                           <div className="flex items-center gap-2 mb-0.5">
                              <Link href={`/profile/${op.author?.userName || op.author?.id || ''}`} className="font-bold text-slate-900 hover:text-blue-600 transition text-[11px] truncate">
                                 {op.author?.fullName || op.author?.userName || 'Anonymous'}
                              </Link>
                              <span className="text-[10px] text-slate-400">{formatTime(op.createdAt)}</span>
                           </div>

                           <TextWithMentions className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed block break-words" text={op.content} />

                           {/* Attached Medias */}
                           {op.medias && op.medias.length > 0 && (
                              <div className="flex gap-1.5 mt-2 overflow-x-auto custom-scrollbar pb-1">
                                 {op.medias.map((m: any, idx: number) => {
                                    const mime = m.media?.type?.toLowerCase() || '';
                                    const handleMediaClick = () => setLightboxState({ 
                                       medias: op.medias.map((om: any) => om.media), 
                                       initialIndex: idx,
                                       contextInfo: {
                                          authorName: op.author?.fullName || op.author?.userName,
                                          authorAvatar: resolveMediaUrl(op.author?.userProfile?.profilePicture || op.author?.avatar),
                                          title: 'মতামতের প্রমাণাদি',
                                          content: op.content,
                                          date: formatTime(op.createdAt),
                                          links: op.sources?.map((s: any) => ({ url: s.source?.externalLinks?.[0], title: s.source?.title })) || []
                                       }
                                    });
                                    
                                    return mime.includes('image') ? (
                                       <img key={idx} src={resolveMediaUrl(m.media.url)} className="w-20 h-20 object-cover rounded-lg border border-slate-200 cursor-pointer hover:opacity-90 transition" onClick={handleMediaClick} />
                                    ) : mime.includes('video') ? (
                                       <div key={idx} className="w-20 h-20 bg-slate-900 rounded-lg border border-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-800 transition" onClick={handleMediaClick}>
                                          <Play size={16} className="text-white opacity-70" />
                                       </div>
                                    ) : null;
                                 })}
                              </div>
                           )}

                           {/* Attached Sources */}
                           {op.sources && op.sources.length > 0 && (
                              <div className="mt-1.5 space-y-1">
                                 {op.sources.map((src: any, idx: number) => (
                                    <a key={idx} href={src.source?.externalLinks?.[0]} target="_blank" className="flex items-center gap-1 text-[11px] text-blue-600 hover:underline bg-white p-1 rounded border border-slate-100 transition">
                                       <LinkIcon size={10} /> <span className="font-medium truncate">{src.source?.title}</span>
                                    </a>
                                 ))}
                              </div>
                           )}
                        </div>

                        {isAuthenticated && (
                           <div className="flex items-center gap-2 mt-0.5 ml-1 text-[10px] font-medium text-slate-500">
                              <button
                                 onClick={() => { setReplyingToId(replyingToId === op.id ? null : op.id); setReplyText(`@${op.author?.userName || ''} `); }}
                                 className="hover:text-blue-600 transition"
                              >
                                 উত্তর দিন (Reply)
                              </button>
                           </div>
                        )}

                        {/* Reply Composer */}
                        {replyingToId === op.id && (
                           <div className="mt-2 flex gap-1.5 items-center relative">
                              <img src={getAvatarUrl(user)} className="w-5 h-5 rounded-full border border-slate-200 object-cover shrink-0" />
                              <div className="flex-1 bg-white border border-slate-200 rounded-xl flex items-center px-2.5 py-1 shadow-2xs relative focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                                 <input
                                    ref={replyInputRef}
                                    type="text"
                                    autoFocus
                                    className="flex-1 bg-transparent outline-none text-xs text-slate-800"
                                    placeholder="উত্তর লিখুন... (@ইউজার, #আপডেট)"
                                    value={replyText}
                                    onChange={e => handleInputChange(e.target.value, e.target.selectionStart || e.target.value.length, true)}
                                    onKeyDown={e => handleKeyDown(e, true)}
                                 />
                                 <button onClick={() => handlePostComment(op.id)} disabled={!replyText.trim() || isPosting} className="text-blue-600 disabled:text-slate-300 ml-1 cursor-pointer hover:text-blue-700 transition">
                                    <Send size={11} />
                                 </button>
                              </div>
                              {renderMentionDropdown(true)}
                           </div>
                        )}

                        {/* Nested Replies */}
                        {op.replies && op.replies.length > 0 && (
                           <div className="mt-2 pl-3 border-l border-slate-200 space-y-2">
                              {op.replies.map((reply: any) => (
                                 <div key={reply.id} className="flex gap-1.5 items-start">
                                    <img src={getAvatarUrl(reply.author)} className="w-5 h-5 rounded-full border border-slate-200 object-cover shrink-0 mt-0.5" />
                                    <div className="flex-1 min-w-0">
                                       <div className="bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1 inline-block max-w-full">
                                          <div className="flex items-center gap-1.5 mb-0.5">
                                             <Link href={`/profile/${reply.author?.userName || reply.author?.id || ''}`} className="text-[10px] font-bold text-slate-800 hover:underline truncate">
                                                {reply.author?.fullName || reply.author?.userName || 'Anonymous'}
                                             </Link>
                                             <span className="text-[9px] text-slate-400">{formatTime(reply.createdAt)}</span>
                                          </div>
                                          <TextWithMentions className="text-xs text-slate-800 whitespace-pre-wrap block" text={reply.content} />
                                       </div>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        )}
                     </div>
                  </div>
               ))}
            </div>
         )}

         {/* Lightbox Modal */}
         {lightboxState && (
            <LightboxModal 
               medias={lightboxState.medias} 
               initialIndex={lightboxState.initialIndex} 
               onClose={() => setLightboxState(null)} 
               contextInfo={lightboxState.contextInfo}
            />
         )}
      </div>
   );
}
