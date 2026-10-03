import React from 'react';

export type TabType = 'Overview' | 'Claims' | 'Evidence' | 'Opinions' | 'Discussion';

export default function CaseNavigation({ 
  activeTab, 
  setActiveTab, 
  counts 
}: { 
  activeTab: TabType, 
  setActiveTab: (tab: TabType) => void,
  counts: { claims: number, evidence: number, opinions: number, discussion: number }
}) {
  const tabs: { id: TabType, label: string, count?: number }[] = [
    { id: 'Overview', label: 'Overview' },
    { id: 'Claims', label: 'Claims', count: counts.claims },
    { id: 'Evidence', label: 'Evidence', count: counts.evidence },
    { id: 'Opinions', label: 'Opinions', count: counts.opinions },
    { id: 'Discussion', label: 'Discussion', count: counts.discussion },
  ];

  return (
    <div className="flex border-b border-slate-200 mb-6 overflow-x-auto bg-slate-50/50 pt-2 gap-8">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-sm whitespace-nowrap border-b-2 transition flex items-center gap-1.5 cursor-pointer -mb-[1px] ${
              isActive 
                ? 'border-slate-600 text-slate-600 font-bold' 
                : 'border-transparent text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                isActive 
                  ? 'bg-slate-100 text-slate-700 font-bold' 
                  : 'bg-slate-100 text-slate-600 font-medium'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
