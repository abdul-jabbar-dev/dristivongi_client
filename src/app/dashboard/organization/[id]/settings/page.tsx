'use client';
import React, { useState, useEffect } from 'react';
import { useGetOrganizationByIdQuery, useUpdateOrganizationMutation } from '@/redux/feature/organization/organizationApi';

export default function OrgDashboardSettings({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { data, isLoading } = useGetOrganizationByIdQuery(id);
  const [updateOrg, { isLoading: isUpdating }] = useUpdateOrganizationMutation();
  
  const [formData, setFormData] = useState({
    description: '',
    website: '',
    phone: '',
    address: '',
    visibility: 'PUBLIC'
  });

  useEffect(() => {
    if (data?.data) {
      setFormData({
        description: data.data.description || '',
        website: data.data.website || '',
        phone: data.data.phone || '',
        address: data.data.location || '',
        visibility: data.data.visibility
      });
    }
  }, [data]);

  if (isLoading) return <div className="p-8">Loading settings...</div>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateOrg({ id, data: formData }).unwrap();
      alert('Settings updated successfully');
    } catch (err) {
      alert('Failed to update settings');
    }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <form onSubmit={handleSubmit} className="bg-white border rounded-xl shadow-sm p-6 space-y-6">
        <h2 className="text-xl font-bold border-b pb-2">Profile Information</h2>
        
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-2 border rounded-md" />
        </div>

        <h2 className="text-xl font-bold border-b pb-2 pt-4">Contact</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Website</label>
            <input type="url" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className="w-full p-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-2 border rounded-md" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Address</label>
          <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full p-2 border rounded-md" />
        </div>

        <h2 className="text-xl font-bold border-b pb-2 pt-4">Visibility</h2>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input type="radio" name="visibility" value="PUBLIC" checked={formData.visibility === 'PUBLIC'} onChange={() => setFormData({...formData, visibility: 'PUBLIC'})}/>
            <span>PUBLIC - Discoverable by everyone</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="radio" name="visibility" value="PRIVATE" checked={formData.visibility === 'PRIVATE'} onChange={() => setFormData({...formData, visibility: 'PRIVATE'})}/>
            <span>PRIVATE - Only authorized members</span>
          </label>
        </div>

        <div className="pt-4 flex justify-end">
          <button disabled={isUpdating} type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
            {isUpdating ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>

      <div className="mt-8 bg-red-50 border border-red-200 rounded-xl p-6">
        <h2 className="text-xl font-bold text-red-800 mb-2">Danger Zone</h2>
        <p className="text-red-700 text-sm mb-4">Once you delete or archive an organization, there is no going back. Please be certain.</p>
        <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Archive Organization</button>
      </div>
    </div>
  );
}
