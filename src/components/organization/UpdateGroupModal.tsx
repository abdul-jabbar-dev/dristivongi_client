import React, { useState, useRef } from 'react';
import { useUpdateOrganizationMutation } from '@/redux/feature/organization/organizationApi';

export default function UpdateGroupModal({ org, onClose }: { org: any; onClose: () => void }) {
  const [updateOrg, { isLoading }] = useUpdateOrganizationMutation();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: org.name,
    description: org.description || '',
    website: org.website || '',
    location: org.location || '',
    logoUrl: org.logoUrl || '',
    coverUrl: org.coverUrl || ''
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(org.logoUrl || null);
  const [coverPreview, setCoverPreview] = useState<string | null>(org.coverUrl || null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'cover') => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (type === 'logo') {
          setLogoPreview(url);
          setFormData(prev => ({ ...prev, logoUrl: base64 }));
        } else {
          setCoverPreview(url);
          setFormData(prev => ({ ...prev, coverUrl: base64 }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateOrg({ id: org.id, data: formData }).unwrap();
      onClose();
      // Optional: force reload or let RTK query update the cache
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Failed to update organization');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl w-full max-w-[600px] flex flex-col shadow-2xl overflow-hidden max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Update Group</h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="relative mb-16 rounded-t-lg bg-gray-100 h-32 md:h-40 border border-gray-200">
            {coverPreview && <img src={coverPreview} alt="Cover" className="w-full h-full object-cover rounded-t-lg" />}
            <input type="file" accept="image/*" className="hidden" ref={coverInputRef} onChange={(e) => handleFileChange(e, 'cover')} />
            <button type="button" onClick={() => coverInputRef.current?.click()} className="absolute top-4 right-4 p-2 bg-white rounded-full shadow text-gray-600">
               <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>
            </button>
            
            <div className="absolute -bottom-10 left-6 w-24 h-24 bg-white rounded-full p-1 border border-gray-200 shadow-sm z-20">
              <input type="file" accept="image/*" className="hidden" ref={logoInputRef} onChange={(e) => handleFileChange(e, 'logo')} />
              <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-gray-400 relative overflow-hidden group">
                {logoPreview ? <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" /> : <span>Logo</span>}
                <button type="button" onClick={() => logoInputRef.current?.click()} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 text-white transition-opacity">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>
                </button>
              </div>
            </div>
          </div>

          <form id="update-org-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea rows={3} className="mt-1 w-full p-2 border border-gray-300 rounded-md" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Website</label>
              <input type="url" className="mt-1 w-full p-2 border border-gray-300 rounded-md" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input type="text" className="mt-1 w-full p-2 border border-gray-300 rounded-md" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-200 rounded-full">Cancel</button>
          <button type="submit" form="update-org-form" disabled={isLoading} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700">
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
