'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateOrganizationMutation } from '@/redux/feature/organization/organizationApi';

export default function CreateOrganization() {
  const router = useRouter();
  const [createOrg, { isLoading }] = useCreateOrganizationMutation();
  const [formData, setFormData] = useState({ name: '', organizationType: 'COMMUNITY', visibility: 'PUBLIC', description: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await createOrg(formData).unwrap();
      router.push(`/dashboard/organization/${res.data.id}`);
    } catch (err) {
      console.error(err);
      alert('Failed to create organization');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-8">Create Organization</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl border">
        <div>
          <label className="block text-sm font-medium mb-2">Organization Name</label>
          <input required type="text" className="w-full p-3 border rounded-md" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Organization Type</label>
          <select className="w-full p-3 border rounded-md" value={formData.organizationType} onChange={e => setFormData({...formData, organizationType: e.target.value})}>
             <option value="GOVERNMENT">Government</option>
             <option value="NGO">NGO</option>
             <option value="COMMUNITY">Community Group</option>
             <option value="CORPORATION">Corporation</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Visibility</label>
          <div className="space-y-3">
            <label className="flex items-start gap-3 p-4 border rounded-md cursor-pointer hover:bg-gray-50">
              <input type="radio" name="visibility" value="PUBLIC" checked={formData.visibility === 'PUBLIC'} onChange={() => setFormData({...formData, visibility: 'PUBLIC'})} className="mt-1"/>
              <div>
                <p className="font-medium">PUBLIC</p>
                <p className="text-sm text-gray-500">Anyone can discover and view this organization.</p>
              </div>
            </label>
            <label className="flex items-start gap-3 p-4 border rounded-md cursor-pointer hover:bg-gray-50">
              <input type="radio" name="visibility" value="PRIVATE" checked={formData.visibility === 'PRIVATE'} onChange={() => setFormData({...formData, visibility: 'PRIVATE'})} className="mt-1"/>
              <div>
                <p className="font-medium">PRIVATE</p>
                <p className="text-sm text-gray-500">Only authorized members can access this organization.</p>
                {formData.visibility === 'PRIVATE' && <p className="text-xs text-orange-600 mt-2">Private organizations require CivicLens Admin verification before activation.</p>}
              </div>
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea required rows={4} className="w-full p-3 border rounded-md" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
        </div>
        <button disabled={isLoading} type="submit" className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
          {isLoading ? 'Creating...' : 'Create Organization'}
        </button>
      </form>
    </div>
  );
}
