import React, { useState } from 'react';
import { FileText, Plus, Crown, Users, ArrowUpDown, List, LayoutGrid } from 'lucide-react';
import { TCaseType } from '@/redux/feature/case/case.type';
import ClaimCard from './ClaimCard';

export default function ClaimsSection({ 
  caseData,
  onAddClaimClick
}: { 
  caseData: TCaseType,
  onAddClaimClick: () => void
}) {
  const [filterType, setFilterType] = useState<'ALL' | 'CREATOR' | 'COMMUNITY'>('ALL');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const authorId = (caseData as any).authorId || (caseData as any).author?.id;
  const claims = caseData.claims || [];
  const creatorClaims = claims.filter((c: any, idx: number) => c.createdBy === authorId || idx === 0);
  const communityClaims = claims.filter((c: any, idx: number) => c.createdBy !== authorId && idx !== 0);

  const filteredClaims = filterType === 'ALL' 
    ? claims 
    : filterType === 'CREATOR' 
      ? creatorClaims 
      : communityClaims;

  return (
    <div className="space-y-4">
      {/* Claims Header Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex gap-3.5 items-center">
          <div className="w-11 h-11 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center shrink-0 border border-slate-100/60">
            <FileText size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">Claims</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Different perspectives, statements, and arguments about this case. Each claim can be supported by evidence and sources.
            </p>
          </div>
        </div>
        <button 
          onClick={onAddClaimClick} 
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-600 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition shrink-0 shadow-sm"
        >
          <Plus size={16} /> Add Claim
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 pb-1">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button 
            onClick={() => setFilterType('ALL')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              filterType === 'ALL'
                ? 'bg-slate-50 text-slate-600 border border-slate-200 shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Claims ({claims.length})
          </button>
          <button 
            onClick={() => setFilterType('CREATOR')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              filterType === 'CREATOR'
                ? 'bg-amber-50 text-amber-700 border border-amber-300 shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Crown size={12} className="text-amber-500" /> Creator's Claim ({creatorClaims.length})
          </button>
          <button 
            onClick={() => setFilterType('COMMUNITY')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              filterType === 'COMMUNITY'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Users size={12} className="text-emerald-500" /> Community Claims ({communityClaims.length})
          </button>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 shadow-2xs">
            <ArrowUpDown size={12} />
            <span>Newest first</span>
          </button>
          <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden shadow-2xs">
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 transition ${viewMode === 'list' ? 'bg-slate-50 text-slate-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List size={14} />
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 transition ${viewMode === 'grid' ? 'bg-slate-50 text-slate-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Claims List */}
      {filteredClaims.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <p className="text-slate-500 text-sm">কোনো দাবি পাওয়া যায়নি।</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
          {filteredClaims.map((claim: any, idx: number) => (
            <ClaimCard 
              key={claim.id || idx} 
              claim={claim} 
              isCreator={claim.createdBy === authorId || idx === 0} 
              caseLocation={caseData.location} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
