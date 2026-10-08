'use client';
import { skipToken } from '@reduxjs/toolkit/query';

import React, { useState } from 'react';
import Image from 'next/image';
import { useGetUserProfileQuery } from '../../../redux/feature/user/user.reducer';
import { useNewsFeedQuery } from '../../../redux/feature/case/case.reducer';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import EditProfileModal from './EditProfileModal';
import CaseCard from '../../../components/CaseCard';
import { Loader2, FileText, MapPin, Link as LinkIcon, Calendar, Activity, CheckCircle, Shield, FileCheck, HelpCircle } from 'lucide-react';
import { resolveMediaUrl } from '../../../lib/utils';

export default function ProfileClient({ username }: { username: string }) {
  const { data, isLoading, error } = useGetUserProfileQuery(username);
  const { data: casesData, isLoading: isCasesLoading } = useNewsFeedQuery(data?.data?.userName ? { author: data.data.userName } : skipToken);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'cases' | 'contributions' | 'organizations'>('overview');

  if (isLoading) {
    return (
      <div className="w-full max-w-5xl mx-auto mt-10 animate-pulse px-4">
        <div className="w-full h-64 bg-slate-200 rounded-t-2xl"></div>
        <div className="w-32 h-32 bg-slate-300 rounded-full mx-auto sm:ml-8 -mt-16 border-4 border-white"></div>
        <div className="w-1/3 h-8 bg-slate-200 mt-4 sm:ml-8"></div>
        <div className="w-1/4 h-4 bg-slate-200 mt-2 sm:ml-8"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-20 text-center text-slate-500">
        <h2 className="text-2xl font-bold mb-2">User not found</h2>
        <p className="mb-6">এই ব্যবহারকারীর প্রোফাইল পাওয়া যায়নি।</p>
        <button
          onClick={() => window.location.href = '/explore'}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition"
        >
          Explore Cases
        </button>
      </div>
    );
  }

  const profile = data.data;
  const isOwner = currentUser?.id === profile.id;

  const casesCount = profile._count?.cases || 0;
  const claimsCount = profile._count?.claims || 0;
  const evidenceCount = profile._count?.evidence || 0;
  const sourceCount = (profile._count as any)?.sources || 0; // Assuming sources count exists or 0
  const assessmentsCount = (profile._count as any)?.assessments || 0;

  return (
    <div className="w-full max-w-5xl mx-auto mt-4 sm:mt-8 px-0 sm:px-4 mb-16">

      {/* Profile Header Card */}
      <div className="bg-white sm:rounded-2xl shadow-sm border-x sm:border border-slate-200 overflow-hidden mb-6">
        {/* Cover Image */}
        <div className="relative w-full h-48 sm:h-72 bg-slate-100">
          {profile.userProfile?.coverPicture ? (
            <Image src={resolveMediaUrl(profile.userProfile.coverPicture)} alt="Cover" layout="fill" objectFit="cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-slate-200 to-slate-100"></div>
          )}
        </div>

        {/* Identity & Actions */}
        <div className="px-4 sm:px-8 pb-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between sm:-mt-16 mb-4">
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-white overflow-hidden bg-slate-100 shadow-md z-10 -mt-14 sm:mt-0 mb-4 sm:mb-0">
              {profile.userProfile?.profilePicture ? (
                <Image src={resolveMediaUrl(profile.userProfile.profilePicture)} alt={profile.fullName} layout="fill" objectFit="cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl text-slate-400 font-bold bg-slate-200">
                  {profile.fullName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex gap-3 z-10 sm:mb-4">
              {isOwner ? (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-5 py-2 border border-slate-300 rounded-full text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors bg-white shadow-sm flex-1 sm:flex-none text-center"
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 transition shadow-sm flex-1 sm:flex-none">
                    Follow
                  </button>
                  <button className="px-4 py-2 border border-slate-300 rounded-full text-sm font-semibold text-slate-700 hover:bg-slate-50 transition bg-white shadow-sm flex-1 sm:flex-none text-center">
                    Message
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="mt-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {profile.fullName}
            </h1>
            <p className="text-slate-500 font-medium mb-3">
              {profile.userName ? `@${profile.userName}` : 'Username not set'}
            </p>

            <p className="text-slate-800 font-medium text-sm sm:text-base max-w-2xl whitespace-pre-wrap leading-relaxed">
              {profile.userProfile?.bio || 'Civic Contributor'}
            </p>

            <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-sm text-slate-500 font-medium">
              {profile.userProfile?.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin size={16} className="text-slate-400" />
                  <span>{profile.userProfile.location}</span>
                </div>
              )}
              {profile.userProfile?.website && (
                <div className="flex items-center gap-1.5">
                  <LinkIcon size={16} className="text-slate-400" />
                  <a href={profile.userProfile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {new URL(profile.userProfile.website).hostname.replace('www.', '')}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar size={16} className="text-slate-400" />
                <span>Joined {new Date(profile.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 sm:px-8 flex overflow-x-auto border-t border-slate-100 scrollbar-hide">
          <div className="flex gap-1 sm:gap-6 min-w-max">
            {(['overview', 'cases', 'contributions', 'organizations'] as const).map((tab) => (
              <button
                key={tab}
                className={`px-4 py-4 font-bold text-sm border-b-[3px] transition-colors whitespace-nowrap ${activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2-Column Main Content Layout */}
      <div className="flex flex-col lg:flex-row gap-6 px-4 sm:px-0">

        {/* Left Column (Sidebar) */}
        <div className="w-full lg:w-[340px] shrink-0 space-y-6">

          {/* Civic Activity Identity Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Activity size={18} className="text-blue-500" />
              Civic Activity
            </h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-600 font-medium">
                  <FileText size={16} className="text-slate-400" /> Cases Created
                </div>
                <span className="font-bold text-slate-800">{casesCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-600 font-medium">
                  <HelpCircle size={16} className="text-slate-400" /> Claims Contributed
                </div>
                <span className="font-bold text-slate-800">{claimsCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center justify-between text-sm w-full">
                  <div className="flex items-center gap-2 text-slate-600 font-medium">
                    <CheckCircle size={16} className="text-slate-400" /> Evidence Added
                  </div>
                  <span className="font-bold text-slate-800">{evidenceCount}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-600 font-medium">
                  <LinkIcon size={16} className="text-slate-400" /> Sources Added
                </div>
                <span className="font-bold text-slate-800">{sourceCount}</span>
              </div>
            </div>
          </div>

          {/* About / Meta Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Shield size={18} className="text-slate-500" />
              About
            </h2>
            <div className="space-y-4 text-sm text-slate-600">
              {profile.userProfile?.bio && (
                <div>
                  <p className="leading-relaxed">{profile.userProfile.bio}</p>
                </div>
              )}
              {profile.userProfile?.location && (
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-slate-400" />
                  <span className="font-medium">{profile.userProfile.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-slate-400" />
                <span className="font-medium">Joined {new Date(profile.createdAt || Date.now()).getFullYear()}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (Main Feed) */}
        <div className="flex-1 min-w-0">

          {/* Overview Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {isCasesLoading ? (
                <div className="flex justify-center py-10 bg-white rounded-2xl border border-slate-200">
                  <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                </div>
              ) : casesData?.data && casesData.data.length > 0 ? (
                <>
                  <h3 className="text-lg font-bold text-slate-800 px-1">Recent Cases</h3>
                  <div className="space-y-4">
                    {casesData.data.slice(0, 3).map((c: any, index: number) => (
                      <CaseCard key={`overview-${c.id}-${index}`} c={c} />
                    ))}
                  </div>
                  {casesData.data.length > 3 && (
                    <button
                      onClick={() => setActiveTab('cases')}
                      className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-200 transition text-sm text-center"
                    >
                      View all cases
                    </button>
                  )}
                </>
              ) : (
                <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
                  <FileCheck size={48} className="mx-auto text-slate-200 mb-4" />
                  <h3 className="text-lg font-bold text-slate-700 mb-1">No Activity Yet</h3>
                  <p className="text-sm text-slate-500 max-w-xs mx-auto">This contributor hasn't published any public activity yet.</p>
                </div>
              )}
            </div>
          )}

          {/* Cases Tab Content */}
          {activeTab === 'cases' && (
            <div className="space-y-4">
              {isCasesLoading ? (
                <div className="flex justify-center py-10 bg-white rounded-2xl border border-slate-200">
                  <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                </div>
              ) : casesData?.data && casesData.data.length > 0 ? (
                casesData.data.map((c: any, index: number) => (
                  <CaseCard key={`${c.id}-${index}`} c={c} />
                ))
              ) : (
                <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
                  <FileText size={48} className="mx-auto text-slate-200 mb-4" />
                  <h3 className="text-lg font-bold text-slate-700 mb-1">No Cases Found</h3>
                  <p className="text-sm text-slate-500">This user hasn't created any cases yet.</p>
                </div>
              )}
            </div>
          )}

          {/* Contributions Tab Content */}
          {activeTab === 'contributions' && (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
              <Activity size={48} className="mx-auto text-slate-200 mb-4" />
              <h3 className="text-lg font-bold text-slate-700 mb-1">Contributions</h3>
              <p className="text-sm text-slate-500">Evidence, claims, and source contributions will appear here.</p>
            </div>
          )}

          {/* Organizations Tab Content */}
          {activeTab === 'organizations' && (
            <div className="space-y-4">
              {profile.organizationMemberships && profile.organizationMemberships.length > 0 ? (
                profile.organizationMemberships.map((membership: any) => (
                  <div key={membership.organizationId} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-500 overflow-hidden">
                        {membership.organization?.logoUrl ? (
                          <img src={resolveMediaUrl(membership.organization.logoUrl)} alt="Org logo" className="w-full h-full object-cover" />
                        ) : (
                          membership.organization?.name?.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">
                          <a href={`/org/${membership.organization.slug}`} className="hover:underline">
                            {membership.organization?.name}
                          </a>
                        </h3>
                        <p className="text-sm text-slate-500 capitalize">{membership.role.toLowerCase()}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
                  <Shield size={48} className="mx-auto text-slate-200 mb-4" />
                  <h3 className="text-lg font-bold text-slate-700 mb-1">No Organizations</h3>
                  <p className="text-sm text-slate-500">This user is not a member of any organization.</p>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {isEditModalOpen && (
        <EditProfileModal
          profile={profile}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </div>
  );
}
