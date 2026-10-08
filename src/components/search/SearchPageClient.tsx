'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Search, 
  Filter, 
  Sparkles, 
  Layers, 
  Building2, 
  Users, 
  FileText, 
  Globe, 
  CheckCircle2, 
  MessageSquare,
  AlertCircle,
  TrendingUp,
  X,
  ChevronRight,
  MapPin
} from 'lucide-react';
import { useGlobalSearchQuery } from '@/redux/feature/search/searchApi';
import { SearchScope, SearchSortBy } from '@/redux/feature/search/search.types';
import CaseSearchCard from './CaseSearchCard';
import OrgSearchCard from './OrgSearchCard';
import UserSearchCard from './UserSearchCard';
import { 
  ClaimSearchCard, 
  EvidenceSearchCard, 
  SourceSearchCard, 
  DiscussionSearchCard 
} from './EvidenceAndSourceCards';
import SearchFiltersSidebar from './SearchFiltersSidebar';

export default function SearchPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Query state initialized from URL params
  const initialQ = searchParams.get('q') || '';
  const initialScope = (searchParams.get('scope') as SearchScope) || 'all';
  const initialLocation = searchParams.get('location') || '';
  const initialSortBy = (searchParams.get('sortBy') as SearchSortBy) || 'relevance';

  const [inputQuery, setInputQuery] = useState(initialQ);
  const [activeQuery, setActiveQuery] = useState(initialQ);
  const [scope, setScope] = useState<SearchScope>(initialScope);
  const [sortBy, setSortBy] = useState<SearchSortBy>(initialSortBy);
  const [location, setLocation] = useState(initialLocation);
  const [status, setStatus] = useState('');
  const [organizationType, setOrganizationType] = useState('');
  const [evidenceType, setEvidenceType] = useState('');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync state if URL query params change externally
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const s = (searchParams.get('scope') as SearchScope) || 'all';
    setInputQuery(q);
    setActiveQuery(q);
    setScope(s);
  }, [searchParams]);

  // Execute global search query
  const { data: searchResponse, isFetching, error } = useGlobalSearchQuery({
    q: activeQuery,
    scope,
    sortBy,
    location: location || undefined,
    status: status || undefined,
    organizationType: organizationType || undefined,
    evidenceType: evidenceType || undefined,
    limit: 20,
  });

  const searchData = searchResponse?.data;
  const results = searchData?.results;

  // Handle Search Input Submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = inputQuery.trim();
    setActiveQuery(term);
    
    // Update URL
    const params = new URLSearchParams();
    if (term) params.set('q', term);
    if (scope !== 'all') params.set('scope', scope);
    if (location) params.set('location', location);
    if (sortBy !== 'relevance') params.set('sortBy', sortBy);
    
    router.push(`/search?${params.toString()}`);
  };

  const handleScopeChange = (newScope: SearchScope) => {
    setScope(newScope);
    const params = new URLSearchParams(window.location.search);
    if (newScope === 'all') {
      params.delete('scope');
    } else {
      params.set('scope', newScope);
    }
    router.push(`/search?${params.toString()}`);
  };

  const handleResetFilters = () => {
    setLocation('');
    setStatus('');
    setOrganizationType('');
    setEvidenceType('');
    setSortBy('relevance');
  };

  // Calculate total counts
  const counts = {
    cases: results?.cases.total,
    organizations: results?.organizations.total,
    users: results?.users.total,
    claims: results?.claims.total,
    evidence: results?.evidence.total,
    sources: results?.sources.total,
    discussions: results?.discussions.total,
  };

  const grandTotal = 
    (counts.cases || 0) + 
    (counts.organizations || 0) + 
    (counts.users || 0) + 
    (counts.claims || 0) + 
    (counts.evidence || 0) + 
    (counts.sources || 0) + 
    (counts.discussions || 0);

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-slate-50/70 overflow-hidden">
      {/* Search Header Banner */}
      <div className="shrink-0 bg-white border-b border-slate-200 py-3.5 px-4 sm:px-6 lg:px-8 shadow-xs z-20">
        <div className="max-w-7xl mx-auto">
          {/* Top Search Input Box */}
          <form onSubmit={handleSearchSubmit} className="max-w-3xl flex items-center gap-3">
            <div className="flex-1 relative flex items-center bg-slate-100 hover:bg-slate-200/60 focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-300 rounded-2xl border border-transparent focus-within:border-slate-300 transition-all px-4 py-2.5">
              <Search size={18} className="text-slate-400 shrink-0 mr-2.5" />
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Search across Cases, Organizations, People, Claims, Evidence, Discussions..."
                className="w-full bg-transparent border-none outline-none text-sm sm:text-base text-slate-800 placeholder:text-slate-400"
              />
              {inputQuery && (
                <button
                  type="button"
                  onClick={() => setInputQuery('')}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition"
                >
                  <X size={15} />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-5 py-2.5 rounded-2xl text-sm transition shadow-sm shrink-0"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition shrink-0"
              aria-label="Toggle Filters"
            >
              <Filter size={18} />
            </button>
          </form>

          {/* Search Context & Intent Meta */}
          <div className="mt-2.5 flex items-center justify-between flex-wrap gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-2 flex-wrap">
              <span>Results for <strong className="text-slate-900">"{activeQuery || 'All Content'}"</strong></span>
              <span>•</span>
              <span>Found <strong>{grandTotal}</strong> items</span>
              {searchData?.intent && (
                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md font-medium">
                  <Sparkles size={12} className="text-indigo-500" /> Intent: {searchData.intent.type}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main 3-Column Content Layout (Independent Scroll) */}
      <div className="flex-1 min-h-0 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-0">
          {/* Left Column: Filter Sidebar */}
          <div className={`lg:col-span-3 h-full overflow-y-auto custom-scrollbar pr-1 pb-16 ${mobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
            <SearchFiltersSidebar
              scope={scope}
              setScope={handleScopeChange}
              sortBy={sortBy}
              setSortBy={setSortBy}
              location={location}
              setLocation={setLocation}
              status={status}
              setStatus={setStatus}
              organizationType={organizationType}
              setOrganizationType={setOrganizationType}
              evidenceType={evidenceType}
              setEvidenceType={setEvidenceType}
              onResetFilters={handleResetFilters}
              counts={counts}
            />
          </div>

          {/* Center Column: Search Results (Independently Scrollable) */}
          <div className="lg:col-span-6 h-full overflow-y-auto custom-scrollbar px-1 pb-24 space-y-6">
            {/* Loading Skeleton */}
            {isFetching && (
              <div className="space-y-4 animate-pulse">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-1/4" />
                    <div className="h-6 bg-slate-200 rounded w-3/4" />
                    <div className="h-4 bg-slate-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-800">
                <AlertCircle size={32} className="mx-auto text-rose-500 mb-2" />
                <h3 className="font-bold text-base">Search Failed</h3>
                <p className="text-xs text-rose-600 mt-1">Unable to load search results. Please check your query or connection.</p>
              </div>
            )}

            {/* Zero Results State */}
            {!isFetching && !error && grandTotal === 0 && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-10 text-center shadow-xs">
                <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-4">
                  <Search size={28} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">
                  No results found for "{activeQuery}"
                </h3>
                <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                  Try checking your spelling, using broader search terms, or exploring one of the suggested civic categories below.
                </p>

                <div className="mt-6 pt-6 border-t border-slate-100 max-w-md mx-auto">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
                    Suggested Searches
                  </span>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {['ঢাকা', 'Gazipur road', 'Civic Watch', 'inspection report', 'water supply'].map(tag => (
                      <button
                        key={tag}
                        onClick={() => {
                          setInputQuery(tag);
                          setActiveQuery(tag);
                          router.push(`/search?q=${encodeURIComponent(tag)}`);
                        }}
                        className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-full transition font-medium"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Grouped Results when scope === 'all' */}
            {!isFetching && !error && scope === 'all' && grandTotal > 0 && results && (
              <div className="space-y-8">
                {/* 1. Organizations Section */}
                {results.organizations.items.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Building2 size={16} className="text-amber-600" /> Organizations ({results.organizations.total})
                      </h2>
                      {results.organizations.total > results.organizations.items.length && (
                        <button
                          onClick={() => handleScopeChange('organizations')}
                          className="text-xs text-indigo-600 hover:underline font-semibold flex items-center gap-1"
                        >
                          View all organizations <ChevronRight size={13} />
                        </button>
                      )}
                    </div>
                    <div className="space-y-3">
                      {results.organizations.items.map(org => (
                        <OrgSearchCard key={org.id} item={org} />
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Cases Section */}
                {results.cases.items.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Layers size={16} className="text-indigo-600" /> Cases ({results.cases.total})
                      </h2>
                      {results.cases.total > results.cases.items.length && (
                        <button
                          onClick={() => handleScopeChange('cases')}
                          className="text-xs text-indigo-600 hover:underline font-semibold flex items-center gap-1"
                        >
                          View all cases <ChevronRight size={13} />
                        </button>
                      )}
                    </div>
                    <div className="space-y-3">
                      {results.cases.items.map(caseItem => (
                        <CaseSearchCard key={caseItem.id} item={caseItem} />
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. People / Users Section */}
                {results.users.items.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Users size={16} className="text-emerald-600" /> People ({results.users.total})
                      </h2>
                      {results.users.total > results.users.items.length && (
                        <button
                          onClick={() => handleScopeChange('users')}
                          className="text-xs text-indigo-600 hover:underline font-semibold flex items-center gap-1"
                        >
                          View all people <ChevronRight size={13} />
                        </button>
                      )}
                    </div>
                    <div className="space-y-3">
                      {results.users.items.map(user => (
                        <UserSearchCard key={user.id} item={user} />
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Claims Section */}
                {results.claims.items.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <CheckCircle2 size={16} className="text-indigo-600" /> Claims ({results.claims.total})
                    </h2>
                    <div className="space-y-3">
                      {results.claims.items.map(claim => (
                        <ClaimSearchCard key={claim.id} item={claim} />
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Evidence Section */}
                {results.evidence.items.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <FileText size={16} className="text-amber-600" /> Evidence ({results.evidence.total})
                    </h2>
                    <div className="space-y-3">
                      {results.evidence.items.map(ev => (
                        <EvidenceSearchCard key={ev.id} item={ev} />
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. Sources Section */}
                {results.sources.items.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Globe size={16} className="text-emerald-600" /> Sources ({results.sources.total})
                    </h2>
                    <div className="space-y-3">
                      {results.sources.items.map(src => (
                        <SourceSearchCard key={src.id} item={src} />
                      ))}
                    </div>
                  </div>
                )}

                {/* 7. Discussions Section */}
                {results.discussions.items.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <MessageSquare size={16} className="text-slate-500" /> Discussions ({results.discussions.total})
                    </h2>
                    <div className="space-y-3">
                      {results.discussions.items.map(disc => (
                        <DiscussionSearchCard key={disc.id} item={disc} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Scoped Single Entity View (when scope !== 'all') */}
            {!isFetching && !error && scope !== 'all' && results && (
              <div className="space-y-4">
                {scope === 'cases' && results.cases.items.map(c => <CaseSearchCard key={c.id} item={c} />)}
                {scope === 'organizations' && results.organizations.items.map(o => <OrgSearchCard key={o.id} item={o} />)}
                {scope === 'users' && results.users.items.map(u => <UserSearchCard key={u.id} item={u} />)}
                {scope === 'claims' && results.claims.items.map(cl => <ClaimSearchCard key={cl.id} item={cl} />)}
                {scope === 'evidence' && results.evidence.items.map(e => <EvidenceSearchCard key={e.id} item={e} />)}
                {scope === 'sources' && results.sources.items.map(s => <SourceSearchCard key={s.id} item={s} />)}
                {scope === 'discussions' && results.discussions.items.map(d => <DiscussionSearchCard key={d.id} item={d} />)}
              </div>
            )}
          </div>

          {/* Right Column: Refinement & Context Tips (Fixed/Independent Scroll) */}
          <div className="lg:col-span-3 h-full overflow-y-auto custom-scrollbar pl-1 pb-16 space-y-6 hidden lg:block">
            {/* Quick Civic Discovery Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <TrendingUp size={16} className="text-indigo-600" /> Civic Discovery Tips
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                You can search by <strong>location</strong> (e.g. <em>Gazipur</em>, <em>ঢাকা</em>), <strong>organization name</strong>, or specific <strong>case topics</strong>.
              </p>
              <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 space-y-1.5">
                <p>• <strong>@username</strong> directly finds users</p>
                <p>• <strong>report / inspection</strong> highlights evidence & sources</p>
                <p>• Results preserve domain links to parent cases</p>
              </div>
            </div>

            {/* Popular Locations */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <MapPin size={16} className="text-rose-500" /> Popular Locations
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {['Dhaka', 'ঢাকা', 'Gazipur', 'গাজীপুর', 'Tongi', 'Mirpur', 'Chittagong', 'Sylhet'].map(loc => (
                  <button
                    key={loc}
                    onClick={() => {
                      setLocation(loc);
                      const params = new URLSearchParams(window.location.search);
                      params.set('location', loc);
                      router.push(`/search?${params.toString()}`);
                    }}
                    className="text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg transition"
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
