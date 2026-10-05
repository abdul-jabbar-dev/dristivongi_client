'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import { useGetOrganizationBySlugQuery } from '@/redux/feature/organization/organizationApi';

export default function OrganizationPublicProfile() {
  const { slug } = useParams();
  const { data, isLoading, error } = useGetOrganizationBySlugQuery(slug as string);

  if (isLoading) return <div className="p-8 text-center animate-pulse">Loading organization...</div>;
  if (error || !data?.data) return <div className="p-8 text-center text-red-500">Organization not found or private.</div>;

  const org = data.data;

  return (
    <div className="w-full">
      <div className="h-64 bg-gray-300 w-full relative">
        {org.coverUrl && <img src={org.coverUrl} className="w-full h-full object-cover" alt="Cover" />}
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute -top-16 left-8 w-32 h-32 bg-white rounded-xl border-4 border-white shadow-md overflow-hidden flex items-center justify-center">
           {org.logoUrl ? <img src={org.logoUrl} className="w-full h-full object-cover" /> : <span className="text-4xl text-gray-400">{org.name.charAt(0)}</span>}
        </div>
        <div className="pt-20 pb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              {org.name}
              {org.verificationStatus === 'VERIFIED' && <span className="text-blue-500 text-xl" title="Verified by CivicLens">✓</span>}
            </h1>
            <p className="text-gray-600 mt-1">{org.type} • {org.location || 'Global'}</p>
          </div>
          <div className="flex gap-3">
             <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Follow</button>
             {org.website && <a href={org.website} target="_blank" className="px-4 py-2 border rounded-md hover:bg-gray-50">Website</a>}
          </div>
        </div>
        <div className="flex border-b mb-6">
          <button className="px-4 py-3 border-b-2 border-blue-600 font-medium text-blue-600">Overview</button>
          <button className="px-4 py-3 font-medium text-gray-500 hover:text-gray-700">Cases</button>
          <button className="px-4 py-3 font-medium text-gray-500 hover:text-gray-700">Official Responses</button>
        </div>
        <div className="prose dark:prose-invert max-w-none">
          <p>{org.description}</p>
        </div>
      </div>
    </div>
  );
}
