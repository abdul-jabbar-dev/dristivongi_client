import React from 'react';
import Link from 'next/link';
import { useSearchTagsQuery } from '@/redux/feature/tag/tag.reducer';
import { useNewsFeedQuery } from '@/redux/feature/case/case.reducer';
import { useSearchParams } from 'next/navigation';
import { getAvatarUrl } from '@/lib/utils';

export default function RightSidebar() {
  const { data: tagsData } = useSearchTagsQuery('');
  const searchParams = useSearchParams();
  const currentTag = searchParams.get('tag');
  const { data: newsFeedData } = useNewsFeedQuery(currentTag ? { tag: currentTag } : undefined);
  
  const cases = newsFeedData?.data || [];
  
  // Extract data for sidebar
  const activeCases = cases.slice(0, 3);
  const similarCases = cases.slice(3, 6);
  const nearbyCases = cases.filter(c => c.location).slice(0, 3);

  // Extract unique authors
  const authorsMap = new Map();
  cases.forEach(c => {
     if (c.author && c.author.id && !authorsMap.has(c.author.id)) {
        authorsMap.set(c.author.id, c.author);
     }
  });
  const involvedPeople = Array.from(authorsMap.values()).slice(0, 3);

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
      {activeCases.length > 0 && (
         <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
           <h3 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">এক নজরে বিষয়টি</h3>
           <div className="space-y-3">
             <div className="flex justify-between items-start text-xs">
               <div className="flex-1 pr-2 overflow-hidden">
                 <p className="font-semibold text-slate-700 mb-2">সক্রিয় প্রধান বিষয়সমূহ</p>
                 {activeCases.map((c, index) => {
                    const rawTitle = c?.title || (c?.titleHtml ? c.titleHtml.replace(/<[^>]+>/g, '') : '') || 'নামবিহীন বিষয়';
                    return (
                      <Link href={`/case/${c.id}`} key={`case-${c.id || index}`} className="block text-slate-500 mt-1.5 hover:underline truncate" title={rawTitle}>
                        {rawTitle.length > 30 ? rawTitle.substring(0, 30) + '...' : rawTitle}
                      </Link>
                    );
                 })}
               </div>
               <div className="flex flex-col gap-1 items-end mt-6 shrink-0">
                 {activeCases.map((c, index) => (
                    <span key={`status-${c.id || index}`} className={`${c.caseStatus === 'CLOSED' ? 'bg-slate-100 text-slate-700' : 'bg-emerald-100 text-emerald-700'} px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap`}>
                       {c.caseStatus === 'OPEN' ? 'তদন্তাধীন' : c.caseStatus === 'IN_PROGRESS' ? 'পদক্ষেপ চলছে' : 'মীমাংসিত'}
                    </span>
                 ))}
               </div>
             </div>
           </div>
         </div>
      )}

      {/* People Involved */}
      {involvedPeople.length > 0 && (
         <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
           <h3 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">জড়িত ব্যক্তিবর্গ</h3>
           <div className="grid grid-cols-3 gap-2">
              {involvedPeople.map((person: any) => (
                 <Link href={`/profile/${person.userName || person.id}`} key={person.id} className="flex flex-col items-center text-center group cursor-pointer">
                    <img src={getAvatarUrl(person)} className="w-10 h-10 object-cover rounded-full border border-slate-200 mb-1 group-hover:border-slate-400 transition" alt={person.fullName} />
                    <p className="text-[10px] font-bold text-slate-700 leading-tight group-hover:text-blue-600 transition truncate w-full px-1">{person.fullName || person.userName}</p>
                    <p className="text-[9px] text-slate-500">ব্যবহারকারী</p>
                 </Link>
              ))}
           </div>
         </div>
      )}

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
      {similarCases.length > 0 && (
         <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
           <h3 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">অনুরূপ বিষয়সমূহ</h3>
           <ul className="space-y-2 text-xs text-slate-700">
              {similarCases.map((c, index) => {
                 const rawTitle = c?.title || (c?.titleHtml ? c.titleHtml.replace(/<[^>]+>/g, '') : '') || 'নামবিহীন বিষয়';
                 return (
                   <li key={`similar-${c.id || index}`} className="truncate">
                      <Link href={`/case/${c.id}`} className="cursor-pointer hover:text-slate-600 hover:underline" title={rawTitle}>
                         {rawTitle}
                      </Link>
                   </li>
                 );
              })}
           </ul>
         </div>
      )}

      {/* Nearby Cases */}
      {nearbyCases.length > 0 && (
         <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
           <h3 className="text-sm font-bold text-slate-800 mb-1 border-b border-slate-100 pb-2">কাছাকাছি বিষয়সমূহ</h3>
           <p className="text-[10px] text-slate-500 mb-2">Based on location → local problems</p>
           <ul className="space-y-2 text-xs text-slate-700">
              {nearbyCases.map((c, index) => {
                 const rawTitle = c?.title || (c?.titleHtml ? c.titleHtml.replace(/<[^>]+>/g, '') : '') || 'নামবিহীন বিষয়';
                 return (
                   <li key={`nearby-${c.id || index}`} className="truncate">
                      <Link href={`/case/${c.id}`} className="cursor-pointer hover:text-slate-600 hover:underline" title={rawTitle}>
                         {rawTitle}
                      </Link>
                   </li>
                 );
              })}
           </ul>
         </div>
      )}

    </div>
  );
}
