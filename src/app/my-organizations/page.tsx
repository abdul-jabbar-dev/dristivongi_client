'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useGetMyOrganizationsQuery } from '@/redux/feature/organization/organizationApi';
import { OrganizationStatusBadge } from '@/components/organization/OrganizationStatusBadge';
import OrganizationsLayout from '../organizations/layout';

export default function MyOrganizations() {
  const { data, isLoading, isError } = useGetMyOrganizationsQuery();
  const [searchTerm, setSearchTerm] = useState('');

  const organizations = (data?.data || []).filter((membership: any) =>
    membership.organization?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <OrganizationsLayout>
      <div className="flex flex-col min-h-full">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Organizations</h1>
            <p className="text-[13px] text-gray-500 mt-0.5">Organizations you manage or are a member of.</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input 
              type="text" 
              placeholder="Search my organizations..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent rounded-full focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none text-gray-900 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Organizations List */}
        <div className="bg-gray-50 flex-1">
          {isLoading ? (
            <div className="animate-pulse bg-white">
              {[1, 2, 3].map(i => (
                <div key={i} className="border-b border-gray-200 p-5 flex gap-4 items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-14 h-14 bg-gray-200 rounded-xl flex-shrink-0"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                  <div className="w-28 h-9 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-12 px-4 bg-white">
              <h3 className="text-lg font-bold text-red-600 mb-1">Error loading your organizations</h3>
              <p className="text-gray-500 text-sm">Please try logging in or refreshing the page.</p>
            </div>
          ) : organizations.length > 0 ? (
            <div className="divide-y divide-gray-200 bg-white">
              {organizations.map((membership: any) => (
                <div key={membership.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-gray-50/60 transition">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-700 text-white font-black text-xl flex items-center justify-center shrink-0 overflow-hidden shadow-2xs border border-gray-100">
                      {membership.organization?.logoUrl ? (
                        <img src={membership.organization.logoUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        membership.organization?.name?.charAt(0).toUpperCase() || 'O'
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-base text-gray-900 truncate">{membership.organization?.name}</h3>
                        <OrganizationStatusBadge status={membership.organization?.status} />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 flex-wrap">
                        <span>Role: <strong className="text-gray-700 font-semibold uppercase">{membership.role || 'MEMBER'}</strong></span>
                        <span>•</span>
                        <span>Visibility: <strong className="text-gray-700 font-semibold capitalize">{membership.organization?.visibility?.toLowerCase() || 'PUBLIC'}</strong></span>
                      </div>
                    </div>
                  </div>
                  <Link 
                    href={`/org/${membership.organization?.slug || membership.organization?.id}`} 
                    className="w-full sm:w-auto text-center px-4 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg shadow-2xs transition shrink-0"
                  >
                    View Organization
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 bg-white min-h-[300px] flex flex-col items-center justify-center">
              <h3 className="text-lg font-bold text-gray-900 mb-1">No organizations found</h3>
              <p className="text-gray-500 text-sm mb-4">You haven't joined or created any organization yet.</p>
              <Link href="/organizations/create" className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-full hover:bg-blue-700 transition">
                + Create Organization
              </Link>
            </div>
          )}
        </div>
      </div>
    </OrganizationsLayout>
  );
}
