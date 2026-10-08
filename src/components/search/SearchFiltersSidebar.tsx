'use client';

import React from 'react';
import { 
  Filter, 
  RotateCcw, 
  MapPin, 
  Layers, 
  Building2, 
  Users, 
  FileText, 
  Globe, 
  CheckCircle2, 
  MessageSquare,
  ArrowUpDown
} from 'lucide-react';
import { SearchScope, SearchSortBy } from '@/redux/feature/search/search.types';

interface SearchFiltersSidebarProps {
  scope: SearchScope;
  setScope: (scope: SearchScope) => void;
  sortBy: SearchSortBy;
  setSortBy: (sort: SearchSortBy) => void;
  location: string;
  setLocation: (loc: string) => void;
  status: string;
  setStatus: (st: string) => void;
  organizationType: string;
  setOrganizationType: (ot: string) => void;
  evidenceType: string;
  setEvidenceType: (et: string) => void;
  onResetFilters: () => void;
  counts?: {
    cases?: number;
    organizations?: number;
    users?: number;
    claims?: number;
    evidence?: number;
    sources?: number;
    discussions?: number;
  };
}

export default function SearchFiltersSidebar({
  scope,
  setScope,
  sortBy,
  setSortBy,
  location,
  setLocation,
  status,
  setStatus,
  organizationType,
  setOrganizationType,
  evidenceType,
  setEvidenceType,
  onResetFilters,
  counts,
}: SearchFiltersSidebarProps) {
  const scopeTabs: { id: SearchScope; label: string; icon: any; count?: number }[] = [
    { id: 'all', label: 'All Results', icon: Layers },
    { id: 'cases', label: 'Cases', icon: Layers, count: counts?.cases },
    { id: 'organizations', label: 'Organizations', icon: Building2, count: counts?.organizations },
    { id: 'users', label: 'People', icon: Users, count: counts?.users },
    { id: 'claims', label: 'Claims', icon: CheckCircle2, count: counts?.claims },
    { id: 'evidence', label: 'Evidence', icon: FileText, count: counts?.evidence },
    { id: 'sources', label: 'Sources', icon: Globe, count: counts?.sources },
    { id: 'discussions', label: 'Discussions', icon: MessageSquare, count: counts?.discussions },
  ];

  const hasActiveFilters = location || status || organizationType || evidenceType || sortBy !== 'relevance';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
          <Filter size={16} className="text-slate-500" />
          <span>Filters & Discovery</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600 transition"
          >
            <RotateCcw size={12} /> Reset
          </button>
        )}
      </div>

      {/* Scope Navigation Tabs */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
          Category / Scope
        </label>
        <div className="space-y-1">
          {scopeTabs.map(tab => {
            const Icon = tab.icon;
            const active = scope === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setScope(tab.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition ${
                  active 
                    ? 'bg-slate-900 text-white font-semibold shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={16} className={active ? 'text-white' : 'text-slate-400'} />
                  <span>{tab.label}</span>
                </div>
                {tab.count !== undefined && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    active ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sorting */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
          <span className="flex items-center gap-1"><ArrowUpDown size={12} /> Sort Order</span>
        </label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SearchSortBy)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400 focus:bg-white transition cursor-pointer"
        >
          <option value="relevance">Relevance (Default)</option>
          <option value="recent">Recently Created</option>
          <option value="most_active">Recently Active</option>
          <option value="most_members">Most Members (Orgs)</option>
        </select>
      </div>

      {/* Location Filter */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
          <span className="flex items-center gap-1"><MapPin size={12} /> Location</span>
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Dhaka, Gazipur, Tongi..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-slate-400 focus:bg-white transition"
        />
      </div>

      {/* Case Status Filter (applicable for cases/all) */}
      {(scope === 'all' || scope === 'cases') && (
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Case Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400 focus:bg-white transition cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="SHOW">Active / Open</option>
            <option value="RESOLVED">Resolved</option>
            <option value="UNDER_REVIEW">Under Review</option>
          </select>
        </div>
      )}

      {/* Organization Type (applicable for orgs/all) */}
      {(scope === 'all' || scope === 'organizations') && (
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Organization Type
          </label>
          <select
            value={organizationType}
            onChange={(e) => setOrganizationType(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400 focus:bg-white transition cursor-pointer"
          >
            <option value="">All Types</option>
            <option value="COMMUNITY_GROUP">Community Group</option>
            <option value="NGO">NGO / Civil Society</option>
            <option value="WATCHDOG">Watchdog / Civic Monitor</option>
            <option value="GOVERNMENT">Government Body</option>
            <option value="RESEARCH">Research / Academic</option>
          </select>
        </div>
      )}

      {/* Evidence Type (applicable for evidence/all) */}
      {(scope === 'all' || scope === 'evidence') && (
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Evidence Type
          </label>
          <select
            value={evidenceType}
            onChange={(e) => setEvidenceType(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400 focus:bg-white transition cursor-pointer"
          >
            <option value="">All Evidence</option>
            <option value="DOCUMENT">Official Document</option>
            <option value="IMAGE">Photograph / Image</option>
            <option value="VIDEO">Video Recording</option>
            <option value="AUDIT">Inspection / Audit</option>
            <option value="STATEMENT">Witness Statement</option>
          </select>
        </div>
      )}
    </div>
  );
}
