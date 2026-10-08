import React, { Suspense } from 'react';
import { Metadata } from 'next';
import SearchPageClient from '@/components/search/SearchPageClient';

export const metadata: Metadata = {
  title: 'Search | CivicLens - Drishtivongi',
  description: 'Global discovery for Cases, Organizations, People, Claims, Evidence, and Civic Discussions.',
};

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
          <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
            <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
            Loading CivicLens Search...
          </div>
        </div>
      }
    >
      <SearchPageClient />
    </Suspense>
  );
}
