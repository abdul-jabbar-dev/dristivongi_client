import React, { useState } from 'react';
import { FileText, Calendar, MapPin, Clock, Tag, ThumbsUp, Heart, MessageSquare, Share2, Bookmark, Image as ImageIcon, Link as LinkIcon, Send } from 'lucide-react';
import { TCaseType } from '@/redux/feature/case/case.type';
import { resolveMediaUrl } from '@/lib/utils';
import OpinionFeed from '@/components/opinion/OpinionFeed';
import { useCreateOpinionMutation } from '@/redux/feature/opinion/opinion.reducer';

export default function CaseOverview({ 
  caseData,
  onAddClaimClick,
  onNavigateTab
}: { 
  caseData: TCaseType,
  onAddClaimClick: () => void,
  onNavigateTab: (tab: string) => void
}) {
  const [opinionText, setOpinionText] = useState('');
  const [createOpinion, { isLoading: isPosting }] = useCreateOpinionMutation();

  const authorName = (caseData as any).author?.fullName || 'Tanvir Hasan';
  const authorRole = (caseData as any).author?.type || 'Citizen';
  const authorImg = resolveMediaUrl((caseData as any).author?.userProfile?.profilePicture || (caseData as any).author?.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80';
  
  const dateObj = caseData.createdAt ? new Date(caseData.createdAt) : new Date();
  const dateStr = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const categoryName = (caseData as any).category?.name || '';
  const locationName = caseData.location || 'Dhaka, Bangladesh';

  const defaultDesc = 'ঢাকা এলিভেটেড এক্সপ্রেসওয়ের নির্মাণকাজের কারণে আশপাশের এলাকায় ব্যাপক যানজট, ধুলাবালি এবং দৈনন্দিন চলাচলে সাধারণ মানুষের বড় ধরনের ভোগান্তি সৃষ্টি হচ্ছে। বিষয়টি নিয়ে বিভিন্ন নাগরিক, বিশেষজ্ঞ ও স্থানীয় বাসিন্দাদের মধ্যে আলোচনা চলছে। এই কেসটি নির্মাণকাজের প্রভাব, বিকল্প সমাধান এবং উন্নয়ন ও জনস্বার্থের ভারসাম্য নিয়ে বিভিন্ন দৃষ্টিভঙ্গি একত্রে দেখার একটি প্ল্যাটফর্ম।';
  const description = (caseData as any).description || caseData.claims?.[0]?.statement || defaultDesc;

  // Gallery images matching the expressway case
  const galleryImages = [
    'https://images.unsplash.com/photo-1541888059039-2708304a37b3?w=800&q=80',
    'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&q=80',
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400&q=80',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&q=80',
    'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&q=80'
  ];

  const handlePostOpinion = async () => {
    if (!opinionText.trim()) return;
    try {
      const formData = new FormData();
      formData.append('data', JSON.stringify({
        targetType: 'CASE',
        targetId: caseData.id,
        content: opinionText,
        stance: 'NEUTRAL'
      }));
      await createOpinion(formData).unwrap();
      setOpinionText('');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. About this case card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center shrink-0 border border-slate-100/60">
            <FileText size={20} />
          </div>
          <h2 className="text-lg font-bold text-slate-900">About this case</h2>
        </div>

        <p className="text-slate-700 text-sm leading-relaxed mb-5">
          {description}
        </p>

        {/* Gallery Grid: 1 large on left, 2x2 on right with +6 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 h-64 md:h-72 rounded-xl overflow-hidden mb-5">
          <div className="md:col-span-2 h-full bg-slate-100 overflow-hidden group cursor-pointer relative">
            <img 
              src={galleryImages[0]} 
              alt="Main Case Media" 
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
            />
          </div>
          <div className="grid grid-cols-2 grid-rows-2 gap-2.5 h-full">
            <div className="bg-slate-100 overflow-hidden group cursor-pointer">
              <img src={galleryImages[1]} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
            </div>
            <div className="bg-slate-100 overflow-hidden group cursor-pointer">
              <img src={galleryImages[2]} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
            </div>
            <div className="bg-slate-100 overflow-hidden group cursor-pointer">
              <img src={galleryImages[3]} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
            </div>
            <div className="bg-slate-900 relative overflow-hidden group cursor-pointer">
              <img src={galleryImages[4]} className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition duration-300" />
              <div className="absolute inset-0 flex items-center justify-center text-white font-extrabold text-xl">
                +6
              </div>
            </div>
          </div>
        </div>

        {/* 4 Metadata Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <Tag size={15} className="text-slate-500 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Category</div>
              <div className="font-bold text-slate-800 truncate">{categoryName}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <Calendar size={15} className="text-emerald-500 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Created</div>
              <div className="font-bold text-slate-800 truncate">{dateStr}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <MapPin size={15} className="text-rose-500 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Location</div>
              <div className="font-bold text-slate-800 truncate">{locationName}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <Clock size={15} className="text-amber-500 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Last updated</div>
              <div className="font-bold text-slate-800 truncate">5 Oct 2026</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. About the author */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
        <div className="flex items-center gap-3">
          <img src={authorImg} alt={authorName} className="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-[11px] text-slate-400 font-medium">the author</div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">{authorName}</span>
              <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                {authorRole}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Interested in urban development, public policy and community issues.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Social Interaction Bar & Composer */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-4">
        {/* Reactions Counter */}
        <div className="flex justify-between items-center text-xs text-slate-500 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="flex -space-x-1">
              <span className="w-4 h-4 rounded-full bg-slate-600 text-white text-[9px] flex items-center justify-center">👍</span>
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] flex items-center justify-center">❤️</span>
              <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] flex items-center justify-center">😮</span>
            </span>
            <span className="font-semibold text-slate-700 ml-1">42</span>
          </div>

          <div className="flex items-center gap-3 font-medium">
            <span>12 comments</span>
            <span>•</span>
            <span>5 shares</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-4 gap-2 py-1 border-b border-slate-100">
          <button className="flex items-center justify-center gap-2 py-2 text-slate-600 hover:bg-slate-50 rounded-xl font-medium text-xs transition">
            <ThumbsUp size={15} /> Like
          </button>
          <button className="flex items-center justify-center gap-2 py-2 text-slate-600 hover:bg-slate-50 rounded-xl font-medium text-xs transition">
            <MessageSquare size={15} /> Comment
          </button>
          <button className="flex items-center justify-center gap-2 py-2 text-slate-600 hover:bg-slate-50 rounded-xl font-medium text-xs transition">
            <Share2 size={15} /> Share
          </button>
          <button className="flex items-center justify-center gap-2 py-2 text-slate-600 hover:bg-slate-50 rounded-xl font-medium text-xs transition">
            <Bookmark size={15} /> Save
          </button>
        </div>

        {/* Inline Thought Composer */}
        <div className="flex items-center gap-3 pt-2">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
            N
          </div>
          <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-slate-400 focus-within:bg-white transition">
            <input 
              type="text" 
              value={opinionText}
              onChange={(e) => setOpinionText(e.target.value)}
              placeholder="Write your thoughts about this case..."
              className="bg-transparent border-none outline-none flex-1 text-xs text-slate-800 placeholder:text-slate-400"
              onKeyDown={(e) => e.key === 'Enter' && handlePostOpinion()}
            />
            <button className="text-slate-400 hover:text-slate-600 p-1">
              <ImageIcon size={15} />
            </button>
            <button className="text-slate-400 hover:text-slate-600 p-1">
              <LinkIcon size={15} />
            </button>
          </div>
          <button 
            onClick={handlePostOpinion}
            disabled={!opinionText.trim() || isPosting}
            className="bg-slate-600 hover:bg-slate-700 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-sm transition"
          >
            Post
          </button>
        </div>

        {/* Existing Opinions Feed */}
        <div className="pt-3">
          <OpinionFeed targetType="CASE" targetId={caseData.id} />
        </div>
      </div>
    </div>
  );
}
