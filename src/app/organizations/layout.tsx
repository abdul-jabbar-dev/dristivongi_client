'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function OrganizationsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isDiscover = pathname === '/organizations';
  const isMyOrgs = pathname === '/my-organizations' || pathname === '/organizations/my-organizations';
  const isSuggested = pathname === '/organizations/suggestions';
  const isCreate = pathname === '/organizations/create';

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row min-h-screen">
      {/* Left Sidebar Nav */}
      <aside className="w-full md:w-64 flex-shrink-0 p-4 hidden md:block select-none">
        <nav className="space-y-1 sticky top-20">
          <Link 
            href="/organizations" 
            className={`flex items-center px-4 py-2.5 text-sm font-semibold rounded-xl transition ${
              isDiscover ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100 shadow-2xs' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Discover
          </Link>
          <Link 
            href="/my-organizations" 
            className={`flex items-center px-4 py-2.5 text-sm font-semibold rounded-xl transition ${
              isMyOrgs ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100 shadow-2xs' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            My Organizations
          </Link>
          <Link 
            href="/organizations/suggestions" 
            className={`flex items-center px-4 py-2.5 text-sm font-semibold rounded-xl transition ${
              isSuggested ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100 shadow-2xs' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Suggested
          </Link>
          <Link 
            href="/organizations/create" 
            className={`flex items-center px-4 py-2.5 text-sm font-bold rounded-xl transition mt-4 border border-gray-200 justify-center shadow-2xs ${
              isCreate ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-800 hover:bg-gray-50'
            }`}
          >
            + Create Organization
          </Link>
        </nav>
      </aside>
      
      {/* Mobile Nav */}
      <div className="md:hidden flex overflow-x-auto p-3 border-b border-gray-200 gap-2 no-scrollbar bg-white sticky top-14 z-20">
        <Link 
          href="/organizations" 
          className={`px-4 py-1.5 text-xs font-bold rounded-full whitespace-nowrap ${
            isDiscover ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          Discover
        </Link>
        <Link 
          href="/my-organizations" 
          className={`px-4 py-1.5 text-xs font-bold rounded-full whitespace-nowrap ${
            isMyOrgs ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          My Orgs
        </Link>
        <Link 
          href="/organizations/suggestions" 
          className={`px-4 py-1.5 text-xs font-bold rounded-full whitespace-nowrap ${
            isSuggested ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          Suggested
        </Link>
        <Link 
          href="/organizations/create" 
          className={`px-4 py-1.5 text-xs font-bold rounded-full border border-gray-300 text-gray-700 whitespace-nowrap ${
            isCreate ? 'bg-blue-600 text-white border-blue-600' : ''
          }`}
        >
          Create
        </Link>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 bg-white md:border-x border-gray-200">
        {children}
      </main>

      {/* Right Sidebar Suggestions */}
      <aside className="w-full md:w-80 flex-shrink-0 p-4 hidden lg:block select-none">
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4 shadow-2xs sticky top-20">
          <h3 className="font-bold text-gray-900 text-sm mb-1">Suggestions</h3>
          <p className="text-xs text-gray-500 mb-3">Discover new communities and civic organizations.</p>
          <div className="text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
            Explore active groups to participate in civic action.
          </div>
        </div>
      </aside>
    </div>
  );
}
