'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bookmark, Search, ArrowLeft, BookmarkCheck } from 'lucide-react';
import Header from '@/components/Header';
import LeftSidebar from '@/components/newsfeed/LeftSidebar';
import RightSidebar from '@/components/newsfeed/RightSidebar';
import CaseCard from '@/components/CaseCard';
import { useGetSavedFeedQuery } from '@/redux/feature/feed/feedApi';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

export default function SavedCasesPage() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const { data: savedData, isLoading, isFetching } = useGetSavedFeedQuery(
    { page, limit: 30 },
    { skip: !isAuthenticated }
  );

  const savedItems = savedData?.data || [];

  // Filter items based on local search term
  const filteredItems = savedItems.filter(item => {
    if (!searchTerm.trim()) return true;
    const title = item.case?.title || item.case?.titleHtml || '';
    const loc = item.case?.location || '';
    const org = item.case?.organization?.name || '';
    const query = searchTerm.toLowerCase();
    return (
      title.toLowerCase().includes(query) ||
      loc.toLowerCase().includes(query) ||
      org.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-slate-900 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-[1280px] w-full mx-auto px-2 sm:px-4 py-4 md:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Navigation Sidebar */}
          <aside className="hidden lg:block lg:col-span-3">
            <LeftSidebar />
          </aside>

          {/* Main Content Area */}
          <section className="col-span-1 lg:col-span-6 space-y-4">
            
            {/* Page Header */}
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                    <Bookmark size={22} className="fill-blue-50" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      সংরক্ষিত বিষয়সমূহ
                      {savedItems.length > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">
                          {savedItems.length}
                        </span>
                      )}
                    </h1>
                    <p className="text-xs text-slate-500">
                      আপনার পরবর্তীতে দেখার জন্য সংরক্ষণ করে রাখা বিষয়সমূহ
                    </p>
                  </div>
                </div>

                <Link
                  href="/"
                  className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
                >
                  <ArrowLeft size={14} />
                  নীড়ে ফিরুন
                </Link>
              </div>

              {/* Search in saved */}
              {savedItems.length > 0 && (
                <div className="relative mt-3">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="সংরক্ষিত বিষয়ের মধ্যে খুঁজুন..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>
              )}
            </div>

            {/* Unauthenticated State */}
            {!isAuthenticated && (
              <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm text-center">
                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-500">
                  <Bookmark size={28} />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">লগইন প্রয়োজন</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                  আপনার সংরক্ষিত বিষয়গুলো দেখতে অনুগ্রহ করে আপনার একাউন্টে লগইন করুন।
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition"
                >
                  লগইন করুন
                </Link>
              </div>
            )}

            {/* Loading Skeleton */}
            {isAuthenticated && (isLoading || isFetching) && (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm animate-pulse">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-slate-200" />
                      <div className="space-y-1.5 flex-1">
                        <div className="h-3.5 bg-slate-200 rounded w-1/3" />
                        <div className="h-2.5 bg-slate-200 rounded w-1/4" />
                      </div>
                    </div>
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                    <div className="h-24 bg-slate-100 rounded-lg mb-4" />
                    <div className="h-8 bg-slate-100 rounded" />
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {isAuthenticated && !isLoading && filteredItems.length === 0 && (
              <div className="bg-white rounded-xl p-10 border border-slate-200 shadow-sm text-center">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3 text-blue-500">
                  <BookmarkCheck size={32} />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">
                  {searchTerm ? 'কোনো বিষয় খুঁজে পাওয়া যায়নি' : 'এখনো কোনো বিষয় সংরক্ষণ করা হয়নি'}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
                  {searchTerm
                    ? `"${searchTerm}" এর সাথে মিলে এমন কোনো সংরক্ষিত বিষয় পাওয়া যায়নি।`
                    : 'নিউজফিড বা কেস বিস্তারিত পাতা থেকে গুরুত্বপূর্ণ বিষয়গুলো সেভ করে রাখতে পারেন।'}
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition"
                >
                  ফিড অন্বেষণ করুন
                </Link>
              </div>
            )}

            {/* Saved Case Feed List */}
            {isAuthenticated && !isLoading && filteredItems.length > 0 && (
              <div className="space-y-4">
                {filteredItems.map((feedItem) => (
                  <CaseCard
                    key={feedItem.case.id}
                    c={feedItem.case as any}
                  />
                ))}
              </div>
            )}

          </section>

          {/* Right Trends & Activity Sidebar */}
          <aside className="hidden lg:block lg:col-span-3">
            <RightSidebar />
          </aside>

        </div>
      </main>
    </div>
  );
}
