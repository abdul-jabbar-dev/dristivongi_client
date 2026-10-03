'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, ChevronLeft, Search, Plus, X
} from 'lucide-react';
import { createCase } from '@/lib/api';

export default function CreateCasePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    location: '',
    claims: {
      title: '',
      evidence: [] as any[],
      sources: [] as any[],
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const payload: any = {
        title: formData.title,
        titleHtml: formData.title,
        location: formData.location
      };

      if (formData.claims.title.trim().length >= 3) {
        payload.claims = {
          title: formData.claims.title,
          evidence: formData.claims.evidence,
          sources: formData.claims.sources
        };
      }

      await createCase(payload);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'An error occurred during submission');
    } finally {
      setIsLoading(false);
    }
  };

  const addEvidence = () => {
    setFormData({
      ...formData,
      claims: {
        ...formData.claims,
        evidence: [
          { title: '', type: 'Photo', relationship: 'SUPPORTS' }
        ]
      }
    });
  };

  const updateEvidence = (index: number, field: string, value: string) => {
    const newEvidence = [...formData.claims.evidence];
    newEvidence[index] = { ...newEvidence[index], [field]: value };
    setFormData({
      ...formData,
      claims: { ...formData.claims, evidence: newEvidence }
    });
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Sidebar - Same as Newsfeed */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between hidden md:flex">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-slate-200">
            <div className="flex items-center gap-2 text-slate-600 font-bold text-xl tracking-tight">
              <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center text-white">C</div>
              CivicLens
            </div>
          </div>
          <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-140px)]">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer">
              <LayoutDashboard size={18} className="text-slate-400" />
              <span className="text-sm">Dashboard</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-50 text-slate-700 font-medium cursor-pointer">
              <Plus size={18} className="text-slate-600" />
              <span className="text-sm">Create Case</span>
            </div>
            {/* Additional Nav Items (Truncated for brevity, matching design visually) */}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 relative overflow-y-auto">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 sticky top-0 z-10">
          <div className="flex-1 max-w-2xl flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-lg">
             <Search size={20} className="text-slate-400" />
             <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none flex-1 text-sm placeholder:text-slate-500" />
          </div>
        </header>

        <div className="flex-1 p-6 lg:p-8 max-w-4xl mx-auto w-full">
          <div className="mb-6 flex items-center gap-2 text-sm text-slate-500 cursor-pointer" onClick={() => router.push('/')}>
            <ChevronLeft size={16} /> Back to Newsfeed
          </div>
          
          <h1 className="text-2xl font-bold text-slate-900 mb-6">Create New Case</h1>

          {error && (
            <div className="p-4 mb-6 text-sm text-red-700 bg-red-100 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <h2 className="text-lg font-bold mb-4">Case Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Title <span className="text-red-500">*</span></label>
                  <input required minLength={3} type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-slate-500" placeholder="e.g. XYZ Road Development Project" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Location <span className="text-red-500">*</span></label>
                  <input required minLength={3} type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-slate-500" placeholder="e.g. Tongi, Gazipur" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <h2 className="text-lg font-bold mb-4">Initial Claim</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Claim Title (Optional)</label>
                  <input type="text" value={formData.claims.title} onChange={e => setFormData({...formData, claims: {...formData.claims, title: e.target.value}})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-slate-500" placeholder="e.g. This road is blocked" />
                </div>
              </div>
            </div>

            {formData.claims.title.trim().length >= 3 && (
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold">Evidence</h2>
                  <button type="button" onClick={addEvidence} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-100">
                    <Plus size={16} /> Add Evidence
                  </button>
                </div>
                
                {formData.claims.evidence.map((ev, index) => (
                  <div key={index} className="border border-slate-200 rounded-lg p-4 mb-4 relative">
                    <button type="button" onClick={() => {
                      const newEv = formData.claims.evidence.filter((_, i) => i !== index);
                      setFormData({...formData, claims: {...formData.claims, evidence: newEv}});
                    }} className="absolute top-4 right-4 text-slate-400 hover:text-red-500"><X size={16}/></button>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Title</label>
                        <input required type="text" value={ev.title} onChange={e => updateEvidence(index, 'title', e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-slate-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Relationship</label>
                        <select value={ev.relationship} onChange={e => updateEvidence(index, 'relationship', e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-slate-500">
                          <option value="SUPPORTS">Supports</option>
                          <option value="CHALLENGES">Challenges</option>
                          <option value="CONTEXT">Context</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-4">
              <button type="button" onClick={() => router.push('/')} className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50">Cancel</button>
              <button type="submit" disabled={isLoading} className="px-6 py-2.5 bg-slate-600 text-white rounded-lg font-semibold hover:bg-slate-700 disabled:opacity-70">
                {isLoading ? 'Creating...' : 'Create Case'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
