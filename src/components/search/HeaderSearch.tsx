'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Clock, ArrowRight, Building2, Briefcase, User, Sparkles } from 'lucide-react';
import { useSearchSuggestionsQuery } from '@/redux/feature/search/searchApi';
import { SearchSuggestionItem } from '@/redux/feature/search/search.types';
import { resolveMediaUrl } from '@/lib/utils';

const RECENT_SEARCHES_KEY = 'civiclens_recent_searches';

export default function HeaderSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored).slice(0, 5));
      }
    } catch (e) {}
  }, []);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Query suggestions from API
  const { data: suggestionsData, isFetching } = useSearchSuggestionsQuery(
    { q: debouncedQuery, limit: 8 },
    { skip: !debouncedQuery || debouncedQuery.length < 1 }
  );

  const suggestions: SearchSuggestionItem[] = suggestionsData?.data?.items || [];

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveToRecent = (searchTerm: string) => {
    const term = searchTerm.trim();
    if (!term) return;
    try {
      const updated = [term, ...recentSearches.filter(s => s.toLowerCase() !== term.toLowerCase())].slice(0, 6);
      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (e) {}
  };

  const clearRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (e) {}
  };

  const removeRecentItem = (e: React.MouseEvent, item: string) => {
    e.stopPropagation();
    const updated = recentSearches.filter(s => s !== item);
    setRecentSearches(updated);
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (e) {}
  };

  const handleSearchSubmit = (searchTerm: string) => {
    const term = searchTerm.trim();
    if (!term) return;
    saveToRecent(term);
    setIsOpen(false);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        const item = suggestions[selectedIndex];
        saveToRecent(item.title);
        setIsOpen(false);
        router.push(item.url);
      } else {
        handleSearchSubmit(query);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > -1 ? prev - 1 : -1));
      return;
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'ORGANIZATION':
        return <Building2 size={16} className="text-amber-600" />;
      case 'CASE':
        return <Briefcase size={16} className="text-indigo-600" />;
      case 'USER':
        return <User size={16} className="text-emerald-600" />;
      default:
        return <Sparkles size={16} className="text-slate-500" />;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-[340px] xl:max-w-[420px]">
      {/* Search Input Bar */}
      <div 
        className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-slate-700 transition-all duration-200 border ${
          isOpen 
            ? 'bg-white border-slate-300 shadow-md ring-2 ring-slate-100' 
            : 'bg-slate-100 border-transparent hover:bg-slate-200/70 focus-within:bg-white focus-within:border-slate-300'
        }`}
      >
        <Search size={16} className={`shrink-0 transition-colors ${isOpen ? 'text-slate-700' : 'text-slate-400'}`} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search cases, organizations, people..."
          className="bg-transparent border-none outline-none flex-1 text-sm text-slate-800 placeholder:text-slate-400 w-full"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setDebouncedQuery('');
              inputRef.current?.focus();
            }}
            className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200 transition"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Autocomplete & Recent Searches Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 text-left animate-in fade-in-50 slide-in-from-top-1 duration-150">
          {/* 1. When no query: Show Recent Searches */}
          {!query.trim() && recentSearches.length > 0 && (
            <div className="py-2">
              <div className="flex items-center justify-between px-4 py-1.5 text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-1.5 uppercase tracking-wider">
                  <Clock size={13} /> Recent Searches
                </span>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-rose-500 hover:text-rose-600 hover:underline font-normal"
                >
                  Clear all
                </button>
              </div>
              <div className="mt-1">
                {recentSearches.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSearchSubmit(item)}
                    className="flex items-center justify-between px-4 py-2 hover:bg-slate-50 cursor-pointer group text-sm text-slate-700 transition"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Clock size={14} className="text-slate-400 group-hover:text-slate-600" />
                      <span className="truncate">{item}</span>
                    </div>
                    <button
                      onClick={(e) => removeRecentItem(e, item)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. When query has suggestions */}
          {query.trim() && suggestions.length > 0 && (
            <div className="py-2 divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
              <div className="px-4 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Suggestions
              </div>
              <div className="py-1">
                {suggestions.map((item, idx) => (
                  <div
                    key={item.id + idx}
                    onClick={() => {
                      saveToRecent(item.title);
                      setIsOpen(false);
                      router.push(item.url);
                    }}
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition ${
                      selectedIndex === idx ? 'bg-indigo-50/80 text-indigo-900' : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden text-slate-600 font-bold text-xs">
                      {item.image ? (
                        <img 
                          src={resolveMediaUrl(item.image)} 
                          alt="" 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        getSuggestionIcon(item.type)
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate leading-tight">{item.title}</p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{item.subtitle}</p>
                    </div>
                    <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
                      {item.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Loading state */}
          {query.trim() && isFetching && (
            <div className="px-4 py-3 text-xs text-slate-500 flex items-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
              Searching suggestions...
            </div>
          )}

          {/* 4. Bottom action: View all results */}
          {query.trim() && (
            <div
              onClick={() => handleSearchSubmit(query)}
              className="border-t border-slate-100 bg-slate-50/70 hover:bg-slate-100 px-4 py-3 flex items-center justify-between cursor-pointer text-sm font-semibold text-slate-700 transition"
            >
              <div className="flex items-center gap-2 truncate">
                <Search size={15} className="text-slate-500" />
                <span>Search all results for <strong className="text-slate-900">"{query}"</strong></span>
              </div>
              <ArrowRight size={15} className="text-slate-500" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
