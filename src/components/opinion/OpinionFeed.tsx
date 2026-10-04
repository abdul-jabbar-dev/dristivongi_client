import React, { useState } from 'react';
import { MoreHorizontal, CheckCircle2, User, AlertCircle, X, MessageSquare, Share2, Bookmark, FileText, Send, Play } from 'lucide-react';
import { useGetOpinionsQuery, useCreateOpinionMutation } from '@/redux/feature/opinion/opinion.reducer';
import { resolveMediaUrl, getAvatarUrl } from '@/lib/utils';
import TextWithMentions from '../shared/TextWithMentions';
import OpinionComposer from './OpinionComposer';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

export default function OpinionFeed({ targetType, targetId, buttonText, initiallyOpen = false }: { targetType: string, targetId: string, buttonText?: string, initiallyOpen?: boolean }) {
  const { data: opinionResponse, isLoading } = useGetOpinionsQuery({ targetType, targetId });
  const opinions = opinionResponse?.data || [];
  const [isOpen, setIsOpen] = useState(targetType === 'CASE' || initiallyOpen);
  
  const [createOpinion, { isLoading: isPostingReply }] = useCreateOpinionMutation();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const handlePostReply = async (parentId: string) => {
    if (!replyText.trim()) return;
    
    const formData = new FormData();
    const payload: any = {
      targetType: targetType,
      targetId: targetId,
      content: replyText,
      value: 'DISCUSSION',
      parentId: parentId,
      sources: []
    };
    
    formData.append("data", JSON.stringify(payload));
    
    try {
      await createOpinion(formData).unwrap();
      setReplyText('');
      setReplyingToId(null);
    } catch (err: any) {
      if (err.status === 401 || err.data?.message === 'jwt expired') {
        alert("আপনার সেশনের মেয়াদ শেষ হয়ে গেছে। দয়া করে আবার লগইন করুন।");
      } else {
        alert(err.data?.message || err.error || "Failed to post reply");
      }
    }
  };

  const toBengali = (num: number | string) => {
    const digits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
    return num.toString().split('').map(d => /[0-9]/.test(d) ? digits[parseInt(d)] : d).join('');
  }
  
  const formatTime = (dateStr: string) => {
     const date = new Date(dateStr);
     const diffInHours = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60));
     if (diffInHours < 1) return 'কিছুক্ষণ আগে';
     if (diffInHours < 24) return `${toBengali(diffInHours)}ঘ.`;
     return `${toBengali(Math.floor(diffInHours/24))}দি.`;
  }

  if (!isOpen) {
     return (
        <button onClick={() => setIsOpen(true)} className="text-sm font-bold text-slate-600 hover:underline flex items-center gap-1 mt-2">
           <MessageSquare size={14} /> {buttonText || 'মতামত দিন'} ({opinions.length})
        </button>
     );
  }

  return (
    <div className="space-y-4 mt-3">
      {targetType !== 'CASE' && !initiallyOpen && (
         <button onClick={() => setIsOpen(false)} className="text-xs text-slate-500 hover:underline flex items-center gap-1 mb-2">
            <X size={12} /> মতামত লুকান
         </button>
      )}
      <OpinionComposer targetType={targetType} targetId={targetId} />
      
      {isLoading ? (
         <div className="text-center py-12 text-slate-500">Loading opinions...</div>
      ) : opinions.length === 0 ? (
         <div className="text-center py-12 bg-white border border-slate-200 rounded-xl">
           <p className="text-slate-500">এখনও কেউ এই বিষয়ে মতামত প্রদান করেননি।</p>
         </div>
      ) : opinions.map((op: any) => {
         let badgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
         let badgeText = op.value || 'মতামত';
         let badgeIcon = <AlertCircle size={10} />;
         
         const val = op.value;
         if (['SUPPORTED', 'SUPPORTS', 'RELIABLE'].includes(val)) { badgeColor = 'bg-emerald-100 text-emerald-700 border-emerald-200'; badgeText = 'সমর্থন করে'; badgeIcon = <CheckCircle2 size={10} />; }
         else if (['PARTIALLY_SUPPORTED', 'IMPORTANT'].includes(val)) { badgeColor = 'bg-amber-100 text-amber-700 border-amber-200'; badgeText = 'আংশিক সমর্থন'; badgeIcon = <User size={10} />; }
         else if (['CONTRADICTED', 'CHALLENGES', 'QUESTIONABLE', 'NOT_RELEVANT', 'IRRELEVANT'].includes(val)) { badgeColor = 'bg-red-100 text-red-700 border-red-200'; badgeText = 'বিরোধিতা করে'; badgeIcon = <X size={10} />; }
         else if (['DISPUTED'].includes(val)) { badgeColor = 'bg-orange-100 text-orange-700 border-orange-200'; badgeText = 'বিতর্কিত'; badgeIcon = <AlertCircle size={10} />; }
         else if (['DISCUSSION'].includes(val)) { badgeColor = 'bg-slate-100 text-slate-700 border-slate-200'; badgeText = 'আলোচনা'; badgeIcon = <MessageSquare size={10} />; }
         else if (['NEEDS_MORE_INFORMATION', 'INSUFFICIENT_EVIDENCE', 'NEEDS_VERIFICATION'].includes(val)) { badgeColor = 'bg-slate-100 text-slate-700 border-slate-200'; badgeText = 'পর্যাপ্ত তথ্য নেই'; badgeIcon = <AlertCircle size={10} />; }
         
         const opDate = new Date(op.createdAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' });
         
         return (
            <div key={op.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
               <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                     <img src={getAvatarUrl(op.author)} alt="Author" className="w-10 h-10 rounded-full border border-slate-200 object-cover" />
                     <div>
                        <div className="flex items-center gap-2">
                           <h4 className="font-bold text-slate-900 text-sm">{op.author?.fullName}</h4>
                           <span className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase border ${badgeColor}`}>
                              {badgeIcon} {badgeText}
                           </span>
                           <span className="text-[11px] text-slate-400">• {opDate}</span>
                        </div>
                     </div>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={18}/></button>
               </div>
               <TextWithMentions className="text-slate-800 text-sm leading-relaxed mb-4 whitespace-pre-wrap block" text={op.content} />
               
               {/* Media Rendering */}
               {op.medias && op.medias.length > 0 && (
                  <div className={`grid gap-2 mb-4 ${op.medias.length === 1 ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'}`}>
                     {op.medias.slice(0, 3).map((m: any, idx: number) => {
                        if (idx === 2 && op.medias.length > 3) {
                           return (
                              <div key={m.media?.id || idx} className="relative rounded-lg overflow-hidden bg-slate-800 flex items-center justify-center text-white font-bold cursor-pointer hover:bg-slate-700 transition aspect-video">
                                 <img src={resolveMediaUrl(m.media.url)} className="absolute inset-0 w-full h-full object-cover opacity-50" alt=""/>
                                 <span className="z-10 text-xl">+{op.medias.length - 2}</span>
                              </div>
                           )
                        }
                        return <img key={m.media?.id || idx} src={resolveMediaUrl(m.media.url)} className="w-full aspect-video object-cover rounded-lg" alt=""/>
                     })}
                  </div>
               )}

               {/* Source Rendering */}
               {op.sources && op.sources.length > 0 && (
                 <div className="mb-4 space-y-2">
                    {op.sources.map((srcRaw: any) => {
                      const src = srcRaw.source;
                      return (
                        <a key={src.id} href={src.externalLinks?.[0] || '#'} target="_blank" rel="noreferrer" className="block border border-slate-200 rounded-lg overflow-hidden flex hover:bg-slate-50 transition">
                           <div className="w-12 h-12 bg-slate-100 flex items-center justify-center border-r border-slate-200 text-slate-400">
                             <FileText size={20} />
                           </div>
                           <div className="p-3 flex flex-col justify-center flex-1">
                              <h5 className="font-bold text-slate-900 text-sm leading-tight mb-1 line-clamp-1">{src.title}</h5>
                              <span className="text-[10px] text-slate-500 line-clamp-1">{src.externalLinks?.[0]}</span>
                           </div>
                        </a>
                      )
                    })}
                 </div>
               )}

               <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-4 text-slate-500 text-xs font-medium">
                     <button className="flex items-center gap-1.5 hover:text-slate-600 transition">
                        <div className="flex -space-x-1">
                           <div className="w-5 h-5 rounded-full bg-slate-500 text-white flex items-center justify-center text-[10px]">👍</div>
                        </div>
                        <span className="ml-1">0</span>
                     </button>
                     {isAuthenticated ? (
                        <button 
                           onClick={() => { setReplyingToId(replyingToId === op.id ? null : op.id); setReplyText(''); }} 
                           className="flex items-center gap-1.5 hover:text-slate-600 transition"
                        >
                           <MessageSquare size={14}/> {op.replies?.length || 0} মন্তব্য
                        </button>
                     ) : (
                        <span className="flex items-center gap-1.5 text-slate-400">
                           <MessageSquare size={14}/> {op.replies?.length || 0} মন্তব্য
                        </span>
                     )}
                  </div>
                  <div className="flex items-center gap-4 text-slate-500 text-xs font-medium">
                     <button className="flex items-center gap-1.5 hover:text-slate-600 transition"><Share2 size={14}/> শেয়ার</button>
                     <button className="flex items-center gap-1.5 hover:text-slate-600 transition"><Bookmark size={14}/> সংরক্ষণ</button>
                  </div>
               </div>

               {/* Reply Composer */}
               {isAuthenticated && replyingToId === op.id && (
                  <div className="mt-4 flex gap-2 items-center border-t border-slate-100 pt-4">
                     <img src={getAvatarUrl(user)} className="w-8 h-8 rounded-full border border-slate-200 object-cover" />
                     <div className="flex-1 bg-slate-50 border border-slate-200 rounded-full flex items-center px-3 py-1.5 shadow-sm focus-within:border-slate-400 focus-within:bg-white transition">
                        <input 
                           type="text"
                           autoFocus
                           className="flex-1 bg-transparent outline-none text-sm text-slate-800"
                           placeholder="মতামতের উত্তর দিন..."
                           value={replyText}
                           onChange={e => setReplyText(e.target.value)}
                           onKeyDown={e => e.key === 'Enter' && handlePostReply(op.id)}
                        />
                        <button onClick={() => handlePostReply(op.id)} disabled={!replyText.trim() || isPostingReply} className="text-slate-600 disabled:text-slate-300 ml-2">
                           <Send size={16} />
                        </button>
                     </div>
                  </div>
               )}

               {/* Nested Replies */}
               {op.replies && op.replies.length > 0 && (
                  <div className="mt-4 space-y-3 pl-2">
                     {op.replies.map((reply: any, index: number) => (
                        <div key={reply.id} className="flex gap-2">
                           <div className="flex flex-col items-center mt-1">
                              <img src={getAvatarUrl(reply.author)} className="w-6 h-6 rounded-full border border-slate-200 object-cover shrink-0 z-10" />
                              {index < op.replies.length - 1 && (
                                 <div className="w-0.5 bg-slate-200 flex-1 my-1"></div>
                              )}
                           </div>
                           <div className="flex-1">
                              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 inline-block min-w-[150px] max-w-full hover:bg-slate-100 transition shadow-sm">
                                 <div className="flex justify-between items-start gap-4 mb-1">
                                    <p className="text-xs font-bold text-slate-800">{reply.author?.fullName || reply.author?.userName || 'Anonymous'}</p>
                                    <span className="text-[10px] text-slate-400 font-medium">{formatTime(reply.createdAt)}</span>
                                 </div>
                                 <p className="text-sm text-slate-700 whitespace-pre-wrap">{reply.content}</p>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>
         )
      })}
    </div>
  );
}
