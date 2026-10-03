import React from 'react';
import Link from 'next/link';
import { useSearchTagsQuery } from '@/redux/feature/tag/tag.reducer';
import { useSearchParams } from 'next/navigation';

export default function RightSidebar() {
  const { data: tagsData } = useSearchTagsQuery('');
  const searchParams = useSearchParams();
  const currentTag = searchParams.get('tag');
  
  return (
    <div className="w-full flex flex-col gap-4 sticky top-20">
      
      {/* Popular Hashtags */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2 flex justify-between items-center">
          <span>জনপ্রিয় টপিকস</span>
          {currentTag && (
             <Link href="/" className="text-[10px] text-slate-600 hover:underline">Clear Filter</Link>
          )}
        </h3>
        <div className="flex flex-wrap gap-2">
           {tagsData?.data && tagsData.data.length > 0 ? (
              tagsData.data.slice(0, 10).map((tag: any) => {
                 const isActive = currentTag === tag.normalizedName;
                 return (
                 <Link 
                    key={tag.id}
                    href={isActive ? '/' : `/?tag=${tag.normalizedName}`}
                    className={`text-[12px] font-semibold px-2.5 py-1.5 rounded-lg border transition ${
                       isActive 
                         ? 'bg-slate-600 text-white border-slate-600 shadow-md' 
                         : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
                    }`}
                 >
                    #{tag.name}
                 </Link>
              )})
           ) : (
              <p className="text-xs text-slate-500">কোনো টপিক পাওয়া যায়নি</p>
           )}
        </div>
      </div>

      {/* Case at a Glance */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">এক নজরে কেস</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-start text-xs">
            <div>
              <p className="font-semibold text-slate-700">সক্রিয় প্রধান কেসসমূহ</p>
              <p className="text-slate-500 mt-1 cursor-pointer hover:underline">ঢাকা মেট্রো সম্প্রসারণ</p>
              <p className="text-slate-500 mt-1 cursor-pointer hover:underline">বুড়িগঙ্গা নদীদূষণ</p>
              <p className="text-slate-500 mt-1 cursor-pointer hover:underline">মোহাম্মদ আলী ভবনের বা...</p>
            </div>
            <div className="flex flex-col gap-1 items-end">
               <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold">তদন্তাধীন</span>
               <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">পদক্ষেপ চলছে</span>
               <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">পদক্ষেপ চলছে</span>
            </div>
          </div>
        </div>
      </div>

      {/* People Involved */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">জড়িত ব্যক্তিবর্গ</h3>
        <div className="grid grid-cols-3 gap-2">
           <div className="flex flex-col items-center text-center">
              <img src="https://i.pravatar.cc/150?u=1" className="w-10 h-10 rounded-full border border-slate-200 mb-1" alt="" />
              <p className="text-[10px] font-bold text-slate-700 leading-tight">তানভীর হাসান</p>
              <p className="text-[9px] text-slate-500">নাগরিক</p>
           </div>
           <div className="flex flex-col items-center text-center">
              <img src="https://i.pravatar.cc/150?u=2" className="w-10 h-10 rounded-full border border-slate-200 mb-1" alt="" />
              <p className="text-[10px] font-bold text-slate-700 leading-tight">আয়েশা রহমান</p>
              <p className="text-[9px] text-slate-500">পরিবেশ বিশেষজ্ঞ</p>
           </div>
           <div className="flex flex-col items-center text-center">
              <img src="https://i.pravatar.cc/150?u=3" className="w-10 h-10 rounded-full border border-slate-200 mb-1" alt="" />
              <p className="text-[10px] font-bold text-slate-700 leading-tight">মোহাম্মদ আলী</p>
              <p className="text-[9px] text-slate-500">নগর পরিকল্পনাবিদ</p>
           </div>
        </div>
      </div>

      {/* Organizations */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">সংগঠন</h3>
        <p className="text-xs text-slate-500 mb-3">জড়িত সংস্থাসমূহ</p>
        <div className="grid grid-cols-3 gap-2">
           <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center bg-green-50 mb-1">
                 <span className="text-green-700 text-xs font-bold">রাজ</span>
              </div>
              <p className="text-[10px] font-bold text-slate-700 leading-tight">রাজউক</p>
           </div>
           <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center bg-slate-50 mb-1">
                 <span className="text-slate-700 text-xs font-bold">DSCC</span>
              </div>
              <p className="text-[10px] font-bold text-slate-700 leading-tight">ঢাকা উত্তর সিটি</p>
           </div>
           <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center bg-indigo-50 mb-1">
                 <span className="text-indigo-700 text-xs font-bold">BRTA</span>
              </div>
              <p className="text-[10px] font-bold text-slate-700 leading-tight">পরিবহন অধিদপ্তর</p>
           </div>
        </div>
      </div>

      {/* Similar Cases */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">অনুরূপ কেসসমূহ</h3>
        <ul className="space-y-2 text-xs text-slate-700">
           <li className="cursor-pointer hover:text-slate-600 truncate">ঢাকা মেট্রো সম্প্রসারণ, ইনারবেড়িবাঁধ প্র...</li>
           <li className="cursor-pointer hover:text-slate-600 truncate">বুড়িগঙ্গা নদীদূষণ, ইনারবেড়িবাঁধ প্রকল্পের...</li>
           <li className="cursor-pointer hover:text-slate-600 truncate">ঢাকা এলিভেটেড এক্সপ্রেসওয়ে, পরিবেশ দূষণ...</li>
        </ul>
      </div>

      {/* Nearby Cases */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-1 border-b border-slate-100 pb-2">কাছাকাছি কেস</h3>
        <p className="text-[10px] text-slate-500 mb-2">Based on location → local problems</p>
        <ul className="space-y-2 text-xs text-slate-700">
           <li className="cursor-pointer hover:text-slate-600 truncate">ঢাকা প্রবাহের লেক; লেকা পরায়লিম...</li>
        </ul>
      </div>

    </div>
  );
}
