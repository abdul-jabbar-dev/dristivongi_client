'use client'
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateOrganizationMutation } from '@/redux/feature/organization/organizationApi';
 
export default function CreateOrganizationModal() {
  const router = useRouter();
  const [createOrg, { isLoading }] = useCreateOrganizationMutation();
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    organizationType: 'COMMUNITY', 
    location: '',
    category: '',
    categoryKeywords: '',
    visibility: 'PUBLIC' 
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.description) return;
    
    try {
      const payload = {
        ...formData,
        categoryKeywords: formData.categoryKeywords.split(',').map(k => k.trim()).filter(Boolean)
      };
      const res = await createOrg(payload).unwrap();
      router.push(`/org/${res.data.slug || res.data.id}`);
    } catch (err) {
      console.error(err);
      alert('Failed to create organization');
    }
  };

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

  const isFormValid = formData.name.trim() !== '' && formData.description.trim() !== '';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl w-full max-w-[744px] flex flex-col shadow-2xl overflow-hidden max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create organization</h2>
          <button 
            onClick={() => router.back()}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 custom-scrollbar">
          
          {/* Cover & Logo Section */}
          <div className="relative mb-16 rounded-t-lg bg-gray-100 h-32 md:h-40 border border-gray-200 overflow-visible">
            {coverPreview && (
              <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover rounded-t-lg" />
            )}
            
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={coverInputRef} 
              onChange={(e) => handleFileChange(e, 'cover')} 
            />
            
            {/* Cover Edit Button */}
            <button 
              type="button" 
              onClick={() => coverInputRef.current?.click()}
              className="absolute top-4 right-4 p-2 bg-white rounded-full shadow hover:bg-gray-50 text-gray-600 transition-colors z-10"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            
            {/* Logo Wrapper */}
            <div className="absolute -bottom-10 left-6 w-24 h-24 bg-white rounded-full p-1 border border-gray-200 shadow-sm z-20">
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={logoInputRef} 
                onChange={(e) => handleFileChange(e, 'logo')} 
              />
              
              <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-gray-400 relative group overflow-hidden">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
                
                {/* Logo Edit Button */}
                <button 
                  type="button" 
                  onClick={() => logoInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 text-right mb-4">* Indicates required</p>

          {/* Form Fields */}
          <form id="create-org-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Organization Name */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">Organization name*</label>
              <input 
                required 
                type="text" 
                maxLength={100}
                className="w-full px-3 py-2 border border-gray-400 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors text-gray-900" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
              />
              <div className="text-right text-xs text-gray-500 mt-1">{formData.name.length}/100</div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">Description*</label>
              <textarea 
                required 
                rows={4} 
                maxLength={2000}
                placeholder="What is the purpose of your organization?"
                className="w-full px-3 py-2 border border-gray-400 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors text-gray-900 resize-none" 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})}
              ></textarea>
              <div className="text-right text-xs text-gray-500 mt-1">{formData.description.length}/2,000</div>
            </div>

            {/* Organization Type */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">Organization type</label>
              <div className="relative">
                <select 
                  className="w-full px-3 py-2 border border-gray-400 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors text-gray-900 appearance-none bg-white cursor-pointer" 
                  value={formData.organizationType} 
                  onChange={e => setFormData({...formData, organizationType: e.target.value})}
                >
                   <option value="COMMUNITY">Community Group</option>
                   <option value="NGO">Non-profit / NGO</option>
                   <option value="GOVERNMENT">Government</option>
                   <option value="MEDIA">Media / News</option>
                   <option value="CORPORATION">Corporation</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">Location</label>
              <input 
                type="text" 
                placeholder="Add a location to your organization"
                className="w-full px-3 py-2 border border-gray-400 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors text-gray-900" 
                value={formData.location} 
                onChange={e => setFormData({...formData, location: e.target.value})} 
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">Category</label>
              <input 
                type="text" 
                placeholder="e.g. Environment, Technology, Education"
                className="w-full px-3 py-2 border border-gray-400 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors text-gray-900" 
                value={formData.category} 
                onChange={e => setFormData({...formData, category: e.target.value})} 
              />
            </div>

            {/* Category Keywords */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">Category Keywords (comma separated)</label>
              <input 
                type="text" 
                placeholder="e.g. climate change, recycling, green energy"
                className="w-full px-3 py-2 border border-gray-400 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors text-gray-900" 
                value={formData.categoryKeywords} 
                onChange={e => setFormData({...formData, categoryKeywords: e.target.value})} 
              />
            </div>

            {/* Visibility Settings (CivicLens specific) */}
            <div className="pt-2">
              <label className="block text-sm font-semibold text-gray-900 mb-3">Privacy & Visibility</label>
              <div className="space-y-4">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="flex items-center h-5 mt-0.5">
                    <input 
                      type="radio" 
                      name="visibility" 
                      value="PUBLIC" 
                      checked={formData.visibility === 'PUBLIC'} 
                      onChange={() => setFormData({...formData, visibility: 'PUBLIC'})} 
                      className="w-4 h-4 text-blue-600 border-gray-400 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Public</p>
                    <p className="text-sm text-gray-500">Anyone can discover and view this organization on CivicLens.</p>
                  </div>
                </label>
                
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="flex items-center h-5 mt-0.5">
                    <input 
                      type="radio" 
                      name="visibility" 
                      value="PRIVATE" 
                      checked={formData.visibility === 'PRIVATE'} 
                      onChange={() => setFormData({...formData, visibility: 'PRIVATE'})} 
                      className="w-4 h-4 text-blue-600 border-gray-400 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Private</p>
                    <p className="text-sm text-gray-500">Only authorized members can access this organization's private content.</p>
                  </div>
                </label>
              </div>
            </div>
            
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl gap-3">
          <button 
            type="button"
            onClick={() => router.back()}
            className="px-5 py-1.5 font-semibold text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="create-org-form"
            disabled={isLoading || !isFormValid}
            className={`px-6 py-1.5 font-semibold rounded-full transition-colors ${
              (isLoading || !isFormValid) 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
            }`}
          >
            {isLoading ? 'Creating...' : 'Create'}
          </button>
        </div>

      </div>
    </div>
  );
}
