'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useGetOrganizationsQuery } from '@/redux/feature/organization/organizationApi';
import { OrganizationCard } from '@/components/organization/OrganizationCard';

export default function OrganizationsDirectory() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data, isLoading } = useGetOrganizationsQuery({ search: searchTerm, limit: 20 });

  return (
    <div className="min-h-screen bg-[#f7f9f9]">
      <div className="max-w-2xl mx-auto border-x border-gray-200 bg-white min-h-screen">
        
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Organizations</h1>
            <p className="text-[13px] text-gray-500 mt-0.5">Discover and connect with public groups</p>
          </div>
          <Link href="/organizations/create" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-full transition-colors">
            Create Org
          </Link>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-gray-200 space-y-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input 
              type="text" 
              placeholder="Search organizations..." 
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-transparent rounded-full focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none text-gray-900 text-[15px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <select className="px-4 py-1.5 bg-gray-100 border-transparent rounded-full text-[14px] text-gray-700 font-medium focus:ring-2 focus:ring-blue-200 outline-none appearance-none cursor-pointer">
              <option value="">All Categories</option>
              <option value="GOVERNMENT">Government</option>
              <option value="NGO">Non-profit / NGO</option>
              <option value="COMMUNITY">Community Group</option>
            </select>
          </div>
        </div>

        {/* Feed Content */}
        <div>
          {isLoading ? (
            <div className="animate-pulse">
               {[1,2,3,4,5].map(i => (
                 <div key={i} className="border-b border-gray-100 p-5 flex gap-4">
                   <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
                   <div className="flex-1 space-y-3 py-1">
                     <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                     <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                     <div className="space-y-2 pt-2">
                       <div className="h-3 bg-gray-200 rounded w-full"></div>
                       <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                     </div>
                   </div>
                 </div>
               ))}
            </div>
          ) : (
            <div>
              {data?.data?.map((org: any) => <OrganizationCard key={org.id} org={org} />)}
            </div>
          )}
          
          {data?.data?.length === 0 && (
            <div className="text-center py-16 px-4">
              <h3 className="text-[18px] font-bold text-gray-900 mb-1">No results found</h3>
              <p className="text-gray-500 text-[15px]">Try adjusting your search or category filter to find what you're looking for.</p>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
