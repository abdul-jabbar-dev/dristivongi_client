'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import {
  useGetPersonalizedFeedQuery,
  useLazyGetPersonalizedFeedQuery,
  FeedItemDTO,
} from '@/redux/feature/feed/feedApi';
import CivicCaseFeedCard from '@/components/case/CivicCaseFeedCard';
import LeftSidebar from '@/components/newsfeed/LeftSidebar';
import RightSidebar from '@/components/newsfeed/RightSidebar';
import CreateCaseInline from '@/components/case/CreateCaseInline';
import { getAvatarUrl } from '@/lib/utils';
import {
  FileText,
  Loader2,
  RefreshCw,
  Sparkles,
  Building,
  Clock,
  MapPin,
  Eye,
} from 'lucide-react';

export default function NewsfeedPage() {
  const searchParams = useSearchParams();
  const tagParam = searchParams.get('tag') || undefined;

  const [activeTab, setActiveTab] = useState<'FOR_YOU' | 'JOINED_ORGS' | 'LATEST' | 'NEARBY' | 'FOLLOWING'>('FOR_YOU');
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [accumulatedItems, setAccumulatedItems] = useState<FeedItemDTO[]>([]);
  const [hasNewItemsBanner, setHasNewItemsBanner] = useState(false);

  const user = useSelector((state: RootState) => state.auth.user);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const userImg = getAvatarUrl(user);

  // Main Feed Query
  const {
    data: feedResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetPersonalizedFeedQuery({
    tag: tagParam,
    sort: activeTab === 'LATEST' ? 'recent' : 'recommended',
    limit: 15,
  });

  const [fetchMore, { isFetching: isFetchingMore }] = useLazyGetPersonalizedFeedQuery();

  // Sync initial query results into accumulated items
  useEffect(() => {
    if (feedResponse?.data) {
      setAccumulatedItems(feedResponse.data);
    }
  }, [feedResponse]);

  // Handle Loading More via Cursor Pagination
  const handleLoadMore = async () => {
    if (!feedResponse?.nextCursor || isFetching || isFetchingMore) return;

    try {
      const res = await fetchMore({
        cursor: feedResponse.nextCursor,
        tag: tagParam,
        sort: activeTab === 'LATEST' ? 'recent' : 'recommended',
        limit: 15,
      }).unwrap();

      if (res?.data) {
        setAccumulatedItems((prev) => {
          const existingIds = new Set(prev.map((i) => i.case.id));
          const newItems = res.data.filter((i) => !existingIds.has(i.case.id));
          return [...prev, ...newItems];
        });
      }
    } catch (err) {
      console.error('Failed to load more feed items', err);
    }
  };

  // Intersection Observer for Continuous Infinite Scroll
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading || isFetching || isFetchingMore) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && feedResponse?.hasMore) {
          handleLoadMore();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isLoading, isFetching, isFetchingMore, feedResponse?.hasMore]
  );

  // Filter items based on active tab
  const displayedItems = accumulatedItems.filter((item) => {
    if (activeTab === 'JOINED_ORGS') {
      return item.context?.reason === 'JOINED_ORGANIZATION' || item.case.organization;
    }
    if (activeTab === 'FOLLOWING') {
      return item.context?.reason === 'FOLLOWED_CASE' || item.context?.reason === 'FOLLOWED_ORGANIZATION';
    }
    if (activeTab === 'NEARBY') {
      return item.context?.reason === 'LOCAL_RELEVANCE' || !!item.case.location;
    }
    return true; // 'FOR_YOU' or 'LATEST'
  });

  const handleHideCase = (caseId: string) => {
    setAccumulatedItems((prev) => prev.filter((i) => i.case.id !== caseId));
  };

  const handleManualRefresh = () => {
    setHasNewItemsBanner(false);
    refetch();
  };

  const tabs = [
    { id: 'FOR_YOU', label: 'আপনার জন্য (For You)', icon: Sparkles },
    { id: 'JOINED_ORGS', label: 'সংগঠনসমূহ (Joined Orgs)', icon: Building },
    { id: 'LATEST', label: 'সর্বশেষ (Latest)', icon: Clock },
    { id: 'NEARBY', label: 'কাছাকাছি (Nearby)', icon: MapPin },
    { id: 'FOLLOWING', label: 'অনুসরণ করা (Following)', icon: Eye },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 pt-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Sidebar */}
          <div className="hidden lg:block lg:col-span-3 sticky top-6 self-start max-h-[calc(100vh-3rem)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <LeftSidebar />
          </div>

          {/* Main Feed Column */}
          <div className="lg:col-span-6 min-w-0 w-full space-y-5">
            {/* Feed Header & Tabs */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    CL
                  </div>
                  <div>
                    <h1 className="text-base font-bold text-slate-900 leading-tight">
                      {user?.fullName ? `স্বাগতম, ${user.fullName.split(' ')[0]}` : 'নাগরিক ফিড (Civic Feed)'}
                    </h1>
                    <p className="text-[11px] text-slate-500">
                      Personalized Cases, Organization investigations, and Community Evidence
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleManualRefresh}
                  disabled={isFetching}
                  className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-colors"
                  title="Refresh Feed"
                >
                  <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-blue-600' : ''}`} />
                </button>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar border-t border-slate-100 pt-2.5">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id as any);
                      }}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* New Cases Refresh Banner */}
            {hasNewItemsBanner && (
              <button
                onClick={handleManualRefresh}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 animate-bounce transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                নতুন কেস উপলব্ধ রয়েছে — রিফ্রেশ করুন (New Cases Available)
              </button>
            )}

            {/* Create Case Inline (Case First) */}
            {isAuthenticated &&
              (!isComposerOpen ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                  <img
                    src={userImg}
                    alt="User"
                    className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-100"
                  />
                  <button
                    onClick={() => setIsComposerOpen(true)}
                    className="flex-1 bg-slate-50 hover:bg-slate-100 transition-colors px-4 py-2.5 rounded-xl text-slate-500 text-sm text-left font-medium border border-slate-100"
                  >
                    নাগরিক সমস্যা বা কেস রিপোর্ট করুন... (Report a Civic Case)
                  </button>
                </div>
              ) : (
                <CreateCaseInline
                  imgUrl={userImg}
                  onClose={() => setIsComposerOpen(false)}
                  onSuccess={() => {
                    setIsComposerOpen(false);
                    refetch();
                  }}
                />
              ))}

            {/* Loading State */}
            {isLoading && (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-pulse space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                        <div className="h-3 bg-slate-100 rounded w-1/4"></div>
                      </div>
                    </div>
                    <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-16 bg-slate-100 rounded"></div>
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {isError && (
              <div className="p-5 bg-red-50 text-red-700 rounded-2xl border border-red-200 text-sm space-y-2">
                <p className="font-bold">Failed to load personalized feed</p>
                <p className="text-xs text-red-600">
                  {(error as any)?.data?.message || (error as any)?.message || 'Please check your connection and retry.'}
                </p>
                <button
                  onClick={() => refetch()}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !isError && displayedItems.length === 0 && (
              <div className="text-center py-16 px-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-sm">
                <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {activeTab === 'JOINED_ORGS'
                      ? 'সংগঠন থেকে কোনো কেস নেই (No Organization Cases)'
                      : activeTab === 'FOLLOWING'
                      ? 'অনুসরণ করা কোনো কেস নেই (No Followed Cases)'
                      : 'ফিডে কোনো কেস নেই (No Cases Found)'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    {activeTab === 'JOINED_ORGS'
                      ? 'সংগঠনে যুক্ত হোন এবং সংশ্লিষ্ট কেসগুলো আপনার ফিডে দেখতে পাবেন।'
                      : 'নাগরিক কেস এক্সপ্লোর করুন অথবা নতুন একটি কেস রিপোর্ট করুন।'}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <Link
                    href="/organizations"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                  >
                    Explore Organizations
                  </Link>
                  <Link
                    href="/create-case"
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                  >
                    Report a Case
                  </Link>
                </div>
              </div>
            )}

            {/* Feed Cards List */}
            {!isLoading && !isError && displayedItems.length > 0 && (
              <div className="space-y-4">
                {displayedItems.map((item, index) => {
                  const isLast = index === displayedItems.length - 1;
                  return (
                    <div
                      key={`${item.case.id}-${index}`}
                      ref={isLast ? lastElementRef : null}
                      className="animate-in fade-in slide-in-from-bottom-3 duration-300 fill-mode-both"
                    >
                      <CivicCaseFeedCard item={item} onHide={handleHideCase} />
                    </div>
                  );
                })}

                {/* Loading More Indicator */}
                {isFetchingMore && (
                  <div className="flex items-center justify-center py-6 gap-2 text-xs text-slate-500 font-medium">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    Loading more personalized cases...
                  </div>
                )}

                {/* Reached End Indicator */}
                {!feedResponse?.hasMore && displayedItems.length > 0 && (
                  <div className="text-center py-8 text-xs text-slate-400 font-medium border-t border-slate-100">
                    ✓ You&apos;ve reached the end of your feed.
                  </div>
                )}
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
