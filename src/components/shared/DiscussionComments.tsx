import React, { useState, useRef } from 'react';
import { useGetOpinionsQuery, useCreateOpinionMutation } from '@/redux/feature/opinion/opinion.reducer';
import { resolveMediaUrl } from '@/lib/utils';
import { ThumbsUp, MessageCircle, MoreHorizontal, Image as ImageIcon, Smile, Send, Camera, Link as LinkIcon, X, Play } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import LightboxModal from './LightboxModal';

interface Source {
   title: string;
   externalLinks: string[];
}

export default function DiscussionComments({ targetType, targetId, previewMode }: { targetType: 'CASE' | 'CLAIM' | 'EVIDENCE' | 'SOURCE', targetId: string, previewMode?: boolean }) {
   const { data: opinionsResponse, isLoading } = useGetOpinionsQuery({ targetType, targetId });
   const allOpinions = opinionsResponse?.data || [];
   let opinions = allOpinions.filter((op: any) => op.value === 'DISCUSSION');
   if (previewMode) {
      opinions = opinions.slice(0, 2);
   }

   const [createOpinion, { isLoading: isPosting }] = useCreateOpinionMutation();
   const [commentText, setCommentText] = useState('');

   const user = useSelector((state: RootState) => state.auth.user);

   // New states for dynamic features
   const [opinionFiles, setOpinionFiles] = useState<File[]>([]);
   const [opinionSources, setOpinionSources] = useState<Source[]>([]);
   const [showSourceInputs, setShowSourceInputs] = useState(false);
   const [sourceTitle, setSourceTitle] = useState('');
   const [sourceUrl, setSourceUrl] = useState('');

   // State for tracking which comment we are replying to
   const [replyingToId, setReplyingToId] = useState<string | null>(null);
   const [replyText, setReplyText] = useState('');
   const [lightboxState, setLightboxState] = useState<{ medias: any[], initialIndex: number, contextInfo?: any } | null>(null);

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

      // Only attach files to main comments for now to keep replies simple
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
      } catch (err: any) {
         if (err.status === 401 || err.data?.message === 'jwt expired') {
            alert("Please login to comment.");
         } else {
            alert(err.data?.message || err.error || "Failed to post comment");
         }
      }
   };

   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
         const filesArray = Array.from(e.target.files);
         setOpinionFiles(prev => [...prev, ...filesArray]);
      }
   };

   const removeFile = (index: number) => {
      setOpinionFiles(prev => prev.filter((_, i) => i !== index));
   };

   const handleAddSource = () => {
      if (!sourceTitle.trim() || !sourceUrl.trim()) return;
      try { new URL(sourceUrl); } catch { return alert("Invalid URL"); }
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
   }

   const formatTime = (dateStr: string) => {
      const date = new Date(dateStr);
      const diffInHours = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60));
      if (diffInHours < 1) return 'কিছুক্ষণ আগে';
      if (diffInHours < 24) return `${toBengali(diffInHours)}ঘ.`;
      return `${toBengali(Math.floor(diffInHours / 24))}দি.`;
   }

   return (
      <div className="pt-4 border-t border-slate-100 mt-2">
         {/* Composer */}
         {(!previewMode || user) && (
            <div className="flex gap-3 items-start mb-6">
               {user?.userProfile?.profilePicture || user?.avatar ? (
                  <img src={resolveMediaUrl(user?.userProfile?.profilePicture || user?.avatar)} alt="Me" className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200" />
               ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-md">
                     {user?.fullName?.charAt(0).toUpperCase() || user?.userName?.charAt(0).toUpperCase() || 'U'}
                  </div>
               )}
               <div className="flex-1">
                  <div className="flex flex-col bg-slate-50 border border-slate-200 rounded-xl focus-within:border-slate-400 focus-within:bg-white transition overflow-hidden">
                     <div className="flex items-center px-4 py-2">
                        <input
                           type="text"
                           disabled={!user}
                           placeholder={user ? "Add a comment..." : "Login to comment"}
                           className="flex-1 bg-transparent outline-none text-sm text-slate-800 placeholder-slate-500"
                           value={commentText}
                           onChange={e => setCommentText(e.target.value)}
                           onKeyDown={e => e.key === 'Enter' && handlePostComment()}
                        />
                        <div className="flex items-center gap-3 text-slate-400 ml-2">
                           <button onClick={() => fileInputRef.current?.click()} className="hover:text-slate-600 transition"><ImageIcon size={18} /></button>
                           <button onClick={() => setShowSourceInputs(!showSourceInputs)} className="hover:text-slate-600 transition"><LinkIcon size={18} /></button>
                           <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*,video/*" />
                           <button disabled={(!commentText.trim() && opinionFiles.length === 0 && opinionSources.length === 0) || isPosting} onClick={() => handlePostComment()} className="text-slate-600 disabled:text-slate-300 disabled:cursor-not-allowed">
                              <Send size={18} />
                           </button>
                        </div>
                     </div>

                     {/* Source Inputs */}
                     {showSourceInputs && (
                        <div className="p-2 border-t border-slate-100 bg-slate-100/50 flex gap-2">
                           <input type="text" placeholder="উৎস শিরোনাম" className="flex-1 text-xs px-2 py-1 border rounded" value={sourceTitle} onChange={e => setSourceTitle(e.target.value)} />
                           <input type="url" placeholder="URL" className="flex-1 text-xs px-2 py-1 border rounded" value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} />
                           <button onClick={handleAddSource} className="bg-slate-600 text-white text-xs px-3 rounded hover:bg-slate-700">Add</button>
                        </div>
                     )}

                     {/* Attachments Preview */}
                     {(opinionFiles.length > 0 || opinionSources.length > 0) && (
                        <div className="p-3 border-t border-slate-100 flex flex-wrap gap-2">
                           {opinionFiles.map((file, idx) => (
                              <div key={idx} className="relative w-20 h-20 rounded bg-slate-200 border border-slate-300">
                                 {file.type.startsWith('image') ? (
                                    <img src={URL.createObjectURL(file)} className="w-full h-full object-cover rounded" />
                                 ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500 font-bold uppercase">Vid</div>
                                 )}
                                 <button onClick={() => removeFile(idx)} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 shadow-sm hover:bg-red-600 transition"><X size={12} /></button>
                              </div>
                           ))}
                           {opinionSources.map((src, idx) => (
                              <div key={idx} className="flex items-center gap-1 bg-slate-50 border border-slate-100 text-slate-700 px-2 py-1 rounded text-xs">
                                 <LinkIcon size={10} /> <span className="max-w-[100px] truncate">{src.title}</span>
                                 <button onClick={() => removeSource(idx)} className="ml-1 text-slate-400 hover:text-red-500"><X size={12} /></button>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
               </div>
            </div>
         )}
         {/* Comments List */}
         {isLoading && <div className="text-center py-4 text-xs text-slate-400">লোড হচ্ছে...</div>}

         {!isLoading && opinions.length > 0 && (
            <div className="space-y-4">
               {opinions.map((op: any) => (
                  <div key={op.id} className="flex gap-3">
                     {/* Parent Avatar with connecting line */}
                     <div className="flex flex-col items-center">
                        <img src={resolveMediaUrl(op.author?.userProfile?.profilePicture || op.author?.avatar) || 'https://i.pravatar.cc/150'} className="w-8 h-8 rounded-full border border-slate-200 object-cover shrink-0 z-10" />
                        {((op.replies && op.replies.length > 0) || replyingToId === op.id) && (
                           <div className="w-0.5 bg-slate-200 flex-1 my-1"></div>
                        )}
                     </div>

                     <div className="flex-1 pb-2">
                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 inline-block min-w-[200px] max-w-full hover:bg-slate-100 transition">
                           <div className="flex justify-between items-start gap-4 mb-2">
                              <div>
                                 <p className="text-xs font-bold text-slate-800 hover:underline cursor-pointer">{op.author?.fullName || op.author?.userName || 'Anonymous'}</p>
                                 <p className="text-[10px] text-slate-500">{op.author?.userName || 'Citizen'} | {op.value}</p>
                              </div>
                              <span className="text-[10px] text-slate-400">{formatTime(op.createdAt)}</span>
                           </div>

                           <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">{op.content}</p>

                           {/* Attached Medias */}
                           {op.medias && op.medias.length > 0 && (
                              <div className="flex gap-2 mt-3 overflow-x-auto custom-scrollbar pb-1">
                                 {op.medias.map((m: any, idx: number) => {
                                    const mime = m.media?.type?.toLowerCase() || '';
                                    const handleMediaClick = () => setLightboxState({ 
                                       medias: op.medias.map((om: any) => om.media), 
                                       initialIndex: idx,
                                       contextInfo: {
                                          authorName: op.author?.fullName || op.author?.userName,
                                          authorAvatar: resolveMediaUrl(op.author?.userProfile?.profilePicture || op.author?.avatar),
                                          title: 'Discussion Comment',
                                          content: op.content,
                                          date: formatTime(op.createdAt),
                                          links: op.sources?.map((s: any) => ({ url: s.source?.externalLinks?.[0], title: s.source?.title })) || []
                                       }
                                    });
                                    
                                    return mime.includes('image') ? (
                                       <img key={idx} src={resolveMediaUrl(m.media.url)} className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:opacity-90 transition" onClick={handleMediaClick} />
                                    ) : mime.includes('video') ? (
                                       <div key={idx} className="w-32 h-32 md:w-40 md:h-40 bg-slate-900 rounded-lg border border-slate-200 flex items-center justify-center shadow-sm cursor-pointer hover:bg-slate-800 transition" onClick={handleMediaClick}>
                                          <Play size={24} className="text-white opacity-70" />
                                       </div>
                                    ) : null;
                                 })}
                              </div>
                           )}

                           {/* Attached Sources */}
                           {op.sources && op.sources.length > 0 && (
                              <div className="mt-3 space-y-1">
                                 {op.sources.map((src: any, idx: number) => (
                                    <a key={idx} href={src.source?.externalLinks?.[0]} target="_blank" className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50/50 hover:bg-slate-50 p-1.5 rounded border border-slate-100 transition">
                                       <LinkIcon size={12} /> <span className="font-semibold">{src.source?.title}</span>
                                    </a>
                                 ))}
                              </div>
                           )}
                        </div>

                        <div className="flex items-center gap-3 mt-1 ml-2 text-[11px] font-bold text-slate-500">
                           <button className="hover:text-slate-800 hover:bg-slate-100 px-1.5 py-0.5 rounded transition">Like</button>
                           <span className="text-slate-300">|</span>
                           <button
                              onClick={() => { setReplyingToId(replyingToId === op.id ? null : op.id); setReplyText(`@${op.author?.userName} `); }}
                              className="hover:text-slate-800 hover:bg-slate-100 px-1.5 py-0.5 rounded transition"
                           >
                              Reply
                           </button>
                        </div>

                        {/* Reply Composer */}
                        {replyingToId === op.id && (
                           <div className="mt-3 flex gap-2 items-center">
                              <img src={resolveMediaUrl(user?.userProfile?.profilePicture || user?.avatar) || 'https://i.pravatar.cc/150'} className="w-6 h-6 rounded-full border border-slate-200 object-cover" />
                              <div className="flex-1 bg-white border border-slate-200 rounded-full flex items-center px-3 py-1.5 shadow-sm">
                                 <input
                                    type="text"
                                    autoFocus
                                    className="flex-1 bg-transparent outline-none text-xs text-slate-800"
                                    placeholder="Reply..."
                                    value={replyText}
                                    onChange={e => setReplyText(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handlePostComment(op.id)}
                                 />
                                 <button onClick={() => handlePostComment(op.id)} disabled={!replyText.trim() || isPosting} className="text-slate-600 disabled:text-slate-300 ml-2">
                                    <Send size={14} />
                                 </button>
                              </div>
                           </div>
                        )}

                        {/* Nested Replies Tree */}
                        {op.replies && op.replies.length > 0 && (
                           <div className="mt-4 space-y-4">
                              {op.replies.map((reply: any, index: number) => (
                                 <div key={reply.id} className="flex gap-2">
                                    <div className="flex flex-col items-center">
                                       <img src={resolveMediaUrl(reply.author?.userProfile?.profilePicture || reply.author?.avatar) || 'https://i.pravatar.cc/150'} className="w-6 h-6 rounded-full border border-slate-200 object-cover shrink-0 z-10" />
                                       {index < op.replies.length - 1 && (
                                          <div className="w-0.5 bg-slate-200 flex-1 my-1"></div>
                                       )}
                                    </div>
                                    <div className="flex-1">
                                       <div className="bg-white border border-slate-100 rounded-lg p-2.5 inline-block min-w-[150px] max-w-full">
                                          <div className="flex justify-between items-start gap-3 mb-1">
                                             <p className="text-[11px] font-bold text-slate-800">{reply.author?.fullName || reply.author?.userName || 'Anonymous'}</p>
                                             <span className="text-[9px] text-slate-400">{formatTime(reply.createdAt)}</span>
                                          </div>
                                          <p className="text-xs text-slate-800 whitespace-pre-wrap">{reply.content}</p>
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
