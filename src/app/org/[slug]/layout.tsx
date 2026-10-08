'use client';
import React, { useState } from 'react';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  useGetOrganizationBySlugQuery,
  useJoinOrganizationMutation,
  useRequestToJoinMutation,
  useLeaveOrganizationMutation,
} from '@/redux/feature/organization/organizationApi';
import UpdateGroupModal from '@/components/organization/UpdateGroupModal';

export default function OrganizationPublicLayout({ children }: { children: React.ReactNode }) {
  const { slug } = useParams();
  const pathname = usePathname();
  const { data, isLoading, error } = useGetOrganizationBySlugQuery(slug as string);

  const [joinOrganization, { isLoading: isJoining }] = useJoinOrganizationMutation();
  const [requestToJoin, { isLoading: isRequesting }] = useRequestToJoinMutation();
  const [leaveOrganization, { isLoading: isLeaving }] = useLeaveOrganizationMutation();

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);

  if (isLoading) return <div className="p-8 text-center animate-pulse">Loading organization...</div>;
  if (error || !data?.data) return <div className="p-8 text-center text-red-500">Organization not found.</div>;

  const org = data.data.organization;
  const viewer = data.data.viewer;

  const tabs = [
    { name: 'Home', href: `/org/${slug}` },
    { name: 'About', href: `/org/${slug}/about` },
    { name: 'Discussion', href: `/org/${slug}/discussion` },
    { name: 'Featured', href: `/org/${slug}/featured` },
    { name: 'People', href: `/org/${slug}/members` },
    { name: 'Media', href: `/org/${slug}/media` },
    { name: 'Files', href: `/org/${slug}/files` },
    { name: 'Cases', href: `/org/${slug}/cases` },
  ];

  const handleJoinClick = async () => {
    try {
      if (org.visibility === 'PUBLIC') {
        await joinOrganization(org.id).unwrap();
      } else {
        await requestToJoin({ idOrSlug: org.id }).unwrap();
        setHasRequested(true);
      }
    } catch (err: any) {
      alert(err?.data?.message || err?.message || 'Failed to join');
    }
  };

  const handleLeaveClick = async () => {
    if (window.confirm('Are you sure you want to leave this organization?')) {
      try {
        await leaveOrganization(org.id).unwrap();
      } catch (err: any) {
        alert(err?.data?.message || err?.message || 'Failed to leave organization');
      }
    }
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto">
          {/* Cover */}
          <div className="h-48 md:h-64 bg-gray-200 w-full relative rounded-b-xl overflow-hidden">
            {org.coverUrl ? (
              <img src={org.coverUrl} className="w-full h-full object-cover" alt="Cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
            )}
          </div>

          {/* Info Section */}
          <div className="px-4 sm:px-6 lg:px-8 relative pt-4 pb-0">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
              <div className="flex items-end gap-4">
                {/* Logo */}
                <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-2xl border-4 border-white shadow-md overflow-hidden flex-shrink-0 -mt-16 z-10">
                  {org.logoUrl ? (
                    <img src={org.logoUrl} className="w-full h-full object-cover" alt="Logo" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center text-3xl font-bold text-white">
                      {org.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Title & Metadata */}
                <div className="pb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{org.name}</h1>
                    {org.verificationStatus === 'VERIFIED' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 font-medium mt-1">
                    {org.visibility === 'PUBLIC' ? 'Public' : 'Private'} {org.category || org.organizationType} • {org.location || 'CivicLens Network'}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 w-full md:w-auto pb-1">
                {viewer?.isMember ? (
                  <div className="flex items-center gap-2 flex-1 md:flex-none">
                    {viewer?.permissions?.manageMembers || viewer?.isAdmin || viewer?.isOwner ? (
                      <Link
                        href={`/org/${slug}/members`}
                        className="flex-1 md:flex-none px-6 py-2 bg-gray-900 text-white font-semibold rounded-full hover:bg-black transition-colors text-center text-sm shadow-sm"
                      >
                        Manage
                      </Link>
                    ) : (
                      <span className="flex-1 md:flex-none px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-full text-center text-sm border border-gray-200">
                        Joined ({viewer.role})
                      </span>
                    )}
                  </div>
                ) : hasRequested ? (
                  <button
                    disabled
                    className="flex-1 md:flex-none px-6 py-2 bg-amber-100 text-amber-800 font-semibold rounded-full text-sm cursor-default"
                  >
                    Request Pending
                  </button>
                ) : (
                  <button
                    onClick={handleJoinClick}
                    disabled={isJoining || isRequesting}
                    className="flex-1 md:flex-none px-6 py-2 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors text-sm shadow-sm"
                  >
                    {isJoining || isRequesting
                      ? 'Processing...'
                      : org.visibility === 'PUBLIC'
                        ? 'Join'
                        : 'Request to Join'}
                  </button>
                )}

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link copied to clipboard!');
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-colors text-sm"
                >
                  Share
                </button>

                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="p-2 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                      />
                    </svg>
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg z-50 border border-gray-200 py-1">
                      {viewer?.permissions?.manageSettings && (
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            setIsUpdateModalOpen(true);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Update Group
                        </button>
                      )}
                      {viewer?.isMember && (
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            handleLeaveClick();
                          }}
                          disabled={isLeaving}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          Leave Group
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          alert('Report filed.');
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Report Group
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex overflow-x-auto custom-scrollbar border-t border-gray-100 mt-6 pt-1">
              {tabs.map((tab) => {
                const isActive =
                  pathname === tab.href ||
                  (tab.name === 'Home' && pathname === `/org/${slug}`) ||
                  (tab.name === 'People' && (pathname === `/org/${slug}/members` || pathname === `/org/${slug}/people`));

                return (
                  <Link
                    key={tab.name}
                    href={tab.href}
                    className={`whitespace-nowrap px-4 py-3 font-semibold text-sm border-b-2 transition-colors ${isActive
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-t-lg'
                      }`}
                  >
                    {tab.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">{children}</div>

      {isUpdateModalOpen && <UpdateGroupModal org={org} onClose={() => setIsUpdateModalOpen(false)} />}
    </div>
  );
}
