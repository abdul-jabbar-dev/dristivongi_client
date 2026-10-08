'use client';
import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useGetOrganizationBySlugQuery, useGetOrganizationFeedQuery } from '@/redux/feature/organization/organizationApi';
import Link from 'next/link';
import CreateCaseInline from '@/components/case/CreateCaseInline';
import CaseCard from '@/components/CaseCard';

export default function OrganizationHomePage() {
  const { slug } = useParams();
  const { data: orgData } = useGetOrganizationBySlugQuery(slug as string);
  const { data: feedData, isLoading: feedLoading } = useGetOrganizationFeedQuery({ slug: slug as string });
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  if (!orgData?.data) return null; // handled by layout
  const org = orgData.data.organization;
  const viewer = orgData.data.viewer;
  const feedItems = feedData?.data?.items || [];


  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Left Sidebar */}
      <div className="w-full md:w-1/3 flex flex-col gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="font-bold text-lg mb-3">About this community</h2>
          <p className="text-gray-700 text-sm mb-4 line-clamp-3">
            {org.description || 'No description provided.'}
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-gray-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-gray-900">{org.visibility === 'PUBLIC' ? 'Public' : 'Private'}</p>
                <p className="text-xs text-gray-500">{org.visibility === 'PUBLIC' ? 'Anyone can see who\'s in the community and what they post.' : 'Only members can see who\'s in the community and what they post.'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Center Feed */}
      <div className="w-full md:w-2/3 flex flex-col gap-4">

        {/* Create Case Composer */}
        {viewer?.isAuthenticated && viewer?.permissions?.canContribute && (
          !isComposerOpen ? (
            <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-sm flex flex-col gap-3 transition-all duration-300">
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                  {viewer?.userProfilePic ? (
                    <img src={viewer.userProfilePic} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-full h-full text-gray-400 bg-gray-100" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  )}
                </div>
                <button
                  onClick={() => setIsComposerOpen(true)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 transition px-4 py-2.5 rounded-full text-slate-500 cursor-pointer text-sm text-left font-medium"
                >
                  Report a case or share an update...
                </button>
              </div>
            </div>
          ) : (
            <CreateCaseInline
              imgUrl={viewer?.userProfilePic || ""}
              organizationId={org.id}
              onClose={() => setIsComposerOpen(false)}
              onSuccess={() => {
                setIsComposerOpen(false);
                // optionally refetch feed here
              }}
            />
          )
        )}

        {/* Feed List */}
        {feedLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 h-48 animate-pulse"></div>
            ))}
          </div>
        ) : feedItems.length > 0 ? (
          <div className="space-y-4">
            {feedItems.map((item: any) => (
              <div key={item.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
                <CaseCard c={item.case} />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No cases reported yet</h3>
            <p className="text-gray-500">Be the first to report a case or share an update for this community.</p>
          </div>
        )}

      </div>
    </div>
  );
}
