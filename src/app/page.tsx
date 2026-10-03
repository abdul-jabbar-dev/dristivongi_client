'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, FileText, Loader2, Video, Image as ImageIcon, Smile } from 'lucide-react';
import CaseCard from '@/components/CaseCard';
import { useNewsFeedQuery } from '@/redux/feature/case/case.reducer';
import { TCaseType } from '@/redux/feature/case/case.type';
import LeftSidebar from '@/components/newsfeed/LeftSidebar';
import RightSidebar from '@/components/newsfeed/RightSidebar';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { resolveMediaUrl } from '@/lib/utils';
import CreateCaseInline from '@/components/case/CreateCaseInline';
import { useSearchParams, useRouter } from 'next/navigation';

export default function NewsfeedPage() {
  const searchParams = useSearchParams();
  const tagParam = searchParams.get('tag') || undefined;

  const { data: responseData, isLoading, isError, error, refetch } = useNewsFeedQuery(tagParam);
  const [activeTab, setActiveTab] = useState('আপনার জন্য');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const userImg = resolveMediaUrl(user?.userProfile?.profilePicture || user?.avatar) || 'https://i.pravatar.cc/150';

  const casesList: TCaseType[] = responseData?.data || [];

  const tabs = ['আপনার জন্য', 'সর্বশেষ', 'অনুসরণ করা', 'কাছাকাছি'];

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 pt-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

          {/* Left Sidebar */}
          <div className="hidden lg:block lg:col-span-3 sticky top-6 self-start max-h-[calc(100vh-3rem)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <LeftSidebar />
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-6 space-y-6">

            {/* Tabs */}
            <div className="flex items-center gap-6 border-b border-slate-300 px-2">
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === tab ? 'border-slate-800 text-slate-800' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Create Case Composer - Facebook Style */}
            {!isModalOpen ? (
              <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-sm flex flex-col gap-3 transition-all duration-300">
                <div className="flex gap-3 items-center">
                  <img src={userImg} alt="User" className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-100" />
                  <button onClick={() => setIsModalOpen(true)} className="flex-1 bg-slate-100 hover:bg-slate-200 transition px-4 py-2.5 rounded-full text-slate-500 cursor-pointer text-sm text-left">
                    আপনার চারপাশে কী ঘটছে, {user?.fullName?.split(' ')[0] || user?.userName || 'নাগরিক'}?
                  </button>
                </div>
              </div>
            ) : (
              <CreateCaseInline
                imgUrl={userImg}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                  setIsModalOpen(false);
                  refetch();
                }}
              />
            )}

            {isLoading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-slate-600 animate-spin" />
              </div>
            )}

            {isError && (
              <div className="p-4 mb-6 text-sm text-red-700 bg-red-100 rounded-lg flex flex-col items-start gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold">Error:</span> {(error as any)?.message || 'An error occurred while fetching cases.'}
                </div>
                <button
                  onClick={() => refetch()}
                  className="px-3 py-1 bg-red-200 hover:bg-red-300 text-red-800 rounded-md transition text-xs font-semibold"
                >
                  Retry
                </button>
              </div>
            )}

            {!isLoading && !isError && casesList.length === 0 && (
              <div className="text-center py-20 bg-white border border-slate-200 rounded-xl">
                <FileText size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">No Cases Found</h3>
                <p className="text-sm text-slate-500 mb-6">There are currently no cases matching your criteria.</p>
                <Link
                  href="/create-case"
                  className="inline-block px-4 py-2 bg-slate-50 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-100 transition"
                >
                  Be the first to create a case
                </Link>
              </div>
            )}

            {!isLoading && !isError && casesList.length > 0 && (
              <div key={`${tagParam || 'all'}-${activeTab}`} className="grid grid-cols-1 gap-6">
                {casesList.map((c: TCaseType, index: number) => (
                  <div
                    key={c.id}
                    className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CaseCard c={c} />
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block lg:col-span-3 sticky top-6 self-start max-h-[calc(100vh-3rem)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <RightSidebar />
          </div>

        </div>
      </div>
    </div>
  );
}
