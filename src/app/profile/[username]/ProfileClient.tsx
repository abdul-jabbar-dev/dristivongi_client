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
import { Loader2, FileText } from 'lucide-react';

export default function ProfileClient({ username }: { username: string }) {
  const { data, isLoading, error } = useGetUserProfileQuery(username);
  const { data: casesData, isLoading: isCasesLoading } = useNewsFeedQuery(data?.data?.userName ? { author: data.data.userName } : skipToken);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'cases' | 'contributions'>('cases');

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-10 animate-pulse">
        <div className="w-full h-48 bg-gray-200 rounded-lg"></div>
        <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto -mt-12 border-4 border-white"></div>
        <div className="w-1/3 h-6 bg-gray-200 mx-auto mt-4"></div>
        <div className="w-1/4 h-4 bg-gray-200 mx-auto mt-2"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-20 text-center text-gray-500">
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

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 px-4">
      <div className="relative w-full h-48 md:h-64 bg-gray-100 rounded-t-lg overflow-hidden">
        {profile.userProfile?.coverPicture ? (
          <Image src={profile.userProfile.coverPicture} alt="Cover" layout="fill" objectFit="cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-100 to-indigo-100"></div>
        )}
      </div>

      <div className="relative px-6 pb-6 bg-white rounded-b-lg shadow-sm border border-gray-100 border-t-0">
        <div className="flex justify-between items-end -mt-16 sm:-mt-20 mb-4">
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-sm z-10">
            {profile.userProfile?.profilePicture ? (
              <Image src={profile.userProfile.profilePicture} alt={profile.fullName} layout="fill" objectFit="cover" />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-3xl text-gray-400 font-bold">
                {profile.fullName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          {isOwner && (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="mb-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors z-10 bg-white"
            >
              {profile.userName ? 'Edit Profile' : 'Set Username'}
            </button>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">{profile.fullName}</h1>
          <p className="text-gray-500 font-medium">
            {profile.userName ? `@${profile.userName}` : 'Username not set'}
          </p>
          
          {profile.userProfile?.bio && (
            <p className="mt-4 text-gray-700 whitespace-pre-wrap">{profile.userProfile.bio}</p>
          )}

          <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
            {profile.userProfile?.location && (
              <div className="flex items-center gap-1">
                📍 <span>{profile.userProfile.location}</span>
              </div>
            )}
            {profile.userProfile?.website && (
              <div className="flex items-center gap-1">
                🔗 <a href={profile.userProfile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{new URL(profile.userProfile.website).hostname.replace('www.', '')}</a>
              </div>
            )}
            <div className="flex items-center gap-1">
              📅 <span>Joined {new Date(profile.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-6 mt-8 border-t border-gray-100 pt-6">
          <div className="text-center">
            <span className="block text-xl font-bold text-gray-900">{profile._count?.cases || 0}</span>
            <span className="text-sm text-gray-500">Cases</span>
          </div>
          <div className="text-center">
            <span className="block text-xl font-bold text-gray-900">{profile._count?.claims || 0}</span>
            <span className="text-sm text-gray-500">Claims</span>
          </div>
          <div className="text-center">
            <span className="block text-xl font-bold text-gray-900">{profile._count?.evidence || 0}</span>
            <span className="text-sm text-gray-500">Contributions</span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-4 border-b border-gray-200">
        <button 
          className={`px-4 py-2 font-medium ${activeTab === 'cases' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('cases')}
        >
          Cases
        </button>
        <button 
          className={`px-4 py-2 font-medium ${activeTab === 'contributions' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('contributions')}
        >
          Contributions
        </button>
      </div>
      
      <div className="py-6">
        {activeTab === 'cases' && (
          <div className="space-y-6">
            {isCasesLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
              </div>
            ) : casesData?.data && casesData.data.length > 0 ? (
              casesData.data.map((c: any) => (
                <CaseCard key={c.id} c={c} />
              ))
            ) : (
              <div className="text-center py-16 bg-white border border-slate-200 rounded-xl">
                <FileText size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-700 mb-2">No Cases Found</h3>
                <p className="text-sm text-slate-500">This user hasn't published any cases yet.</p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'contributions' && (
          <div className="text-gray-500 text-center py-16 bg-white border border-slate-200 rounded-xl">
            Contributions will be displayed here.
          </div>
        )}
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
