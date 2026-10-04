'use client';

import React, { useState, useRef } from 'react';
import { useUpdateProfileMutation, useLazyCheckUsernameQuery } from '../../../redux/feature/user/user.reducer';
import type { TUserType } from '../../../redux/feature/user/user.type';
import { isUsernameValid, normalizeUsername } from '../../../utils/username';
import Image from 'next/image';
import { Camera, Image as ImageIcon, Check, X as XIcon, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function EditProfileModal({ profile, onClose }: { profile: TUserType, onClose: () => void }) {
  const router = useRouter();
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const [formData, setFormData] = useState({
    fullName: profile.fullName || '',
    userName: profile.userName || '',
    bio: profile.userProfile?.bio || '',
    location: profile.userProfile?.location || '',
    website: profile.userProfile?.website || '',
  });
  
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(profile.userProfile?.profilePicture || null);
  
  const [coverPic, setCoverPic] = useState<File | null>(null);
  const [coverPicPreview, setCoverPicPreview] = useState<string | null>(profile.userProfile?.coverPicture || null);

  const profilePicRef = useRef<HTMLInputElement>(null);
  const coverPicRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState('');

  const [checkUsername, { isFetching: isCheckingUsername }] = useLazyCheckUsernameQuery();
  const [usernameStatus, setUsernameStatus] = useState<{available?: boolean, reason?: string, valid?: boolean} | null>(null);
  
  React.useEffect(() => {
    if (formData.userName === profile.userName) {
      setUsernameStatus(null);
      return;
    }
    
    const normalized = normalizeUsername(formData.userName);
    const validity = isUsernameValid(normalized);
    
    if (!validity.valid) {
      setUsernameStatus({ valid: false, reason: validity.reason });
      return;
    }

    setUsernameStatus(null);
    const timeoutId = setTimeout(async () => {
      try {
        const res = await checkUsername(normalized).unwrap();
        setUsernameStatus({ available: res.data.available, reason: res.data.reason, valid: true });
      } catch(e) {}
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.userName, profile.userName, checkUsername]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    if (type === 'profile') {
      setProfilePic(file);
      setProfilePicPreview(previewUrl);
    } else {
      setCoverPic(file);
      setCoverPicPreview(previewUrl);
    }
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('fullName', formData.fullName);
      const normalizedUserName = normalizeUsername(formData.userName);
      if (normalizedUserName) {
        const validity = isUsernameValid(normalizedUserName);
        if (!validity.valid) {
          setError(validity.reason || 'Invalid username');
          return;
        }
        data.append('userName', normalizedUserName);
      }
      
      data.append('bio', formData.bio);
      data.append('location', formData.location);
      data.append('website', formData.website);
      
      if (profilePic) {
        data.append('profilePicture', profilePic);
      }
      if (coverPic) {
        data.append('coverPicture', coverPic);
      }

      if (normalizedUserName && normalizedUserName !== profile.userName) {
        if (usernameStatus && usernameStatus.available === false) {
          setError(usernameStatus.reason || 'Please choose an available username.');
          return;
        }
      }

      await updateProfile(data).unwrap();
      onClose();
      
      // Redirect if username changed
      if (normalizedUserName && normalizedUserName !== profile.userName) {
        router.push(`/profile/${normalizedUserName}`);
      }
    } catch (err: any) {
      setError(err?.data?.message || 'প্রোফাইল ছবি আপলোড করা যায়নি। আবার চেষ্টা করুন।');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999] p-4 sm:p-0">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <h3 className="text-lg font-bold text-gray-800">Edit Profile</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-full p-1.5 transition">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
          {error && (
            <div className="m-5 mb-0 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          {/* Cover & Avatar Upload UI */}
          <div className="relative mb-16 bg-gray-50">
            {/* Cover Picture */}
            <div className="relative w-full h-36 bg-gray-200 group">
              {coverPicPreview ? (
                <Image src={coverPicPreview} alt="Cover Preview" layout="fill" objectFit="cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-blue-100 to-indigo-100"></div>
              )}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <button 
                  type="button" 
                  onClick={() => coverPicRef.current?.click()}
                  className="bg-white/90 text-gray-800 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 hover:bg-white transition"
                >
                  <ImageIcon size={14} /> Change Cover
                </button>
              </div>
              <input type="file" ref={coverPicRef} onChange={(e) => handleFileChange(e, 'cover')} accept="image/*" className="hidden" />
            </div>

            {/* Profile Picture */}
            <div className="absolute -bottom-12 left-6">
              <div className="relative w-24 h-24 rounded-full border-4 border-white bg-gray-100 overflow-hidden shadow-sm group">
                {profilePicPreview ? (
                  <Image src={profilePicPreview} alt="Profile Preview" layout="fill" objectFit="cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-300">
                    {formData.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div 
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer"
                  onClick={() => profilePicRef.current?.click()}
                >
                  <Camera size={24} className="text-white" />
                </div>
                <input type="file" ref={profilePicRef} onChange={(e) => handleFileChange(e, 'profile')} accept="image/*" className="hidden" />
              </div>
            </div>
          </div>

          <div className="px-6 pb-6 space-y-4">
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition text-[14px]"
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1">Username</label>
              <div className="relative">
                <input
                  type="text"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none transition text-[14px] ${
                    usernameStatus 
                      ? (usernameStatus.available && usernameStatus.valid ? 'border-green-300 focus:ring-green-100 focus:border-green-500' : 'border-red-300 focus:ring-red-100 focus:border-red-500')
                      : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500'
                  }`}
                  value={formData.userName}
                  onChange={e => setFormData({...formData, userName: e.target.value})}
                />
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  {isCheckingUsername && <Loader2 size={16} className="text-gray-400 animate-spin" />}
                  {!isCheckingUsername && usernameStatus?.available === true && <Check size={16} className="text-green-500" />}
                  {!isCheckingUsername && (usernameStatus?.available === false || usernameStatus?.valid === false) && <XIcon size={16} className="text-red-500" />}
                </div>
              </div>
              {usernameStatus?.reason && (
                <p className={`mt-1 text-xs ${usernameStatus.available ? 'text-green-600' : 'text-red-500'}`}>
                  {usernameStatus.reason}
                </p>
              )}
              {usernameStatus?.available && usernameStatus.valid && !usernameStatus.reason && (
                <p className="mt-1 text-xs text-green-600">Username is available</p>
              )}
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1">Bio</label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition text-[14px] resize-none"
                value={formData.bio}
                onChange={e => setFormData({...formData, bio: e.target.value})}
                placeholder="Tell us about yourself..."
              ></textarea>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1">Location</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition text-[14px]"
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
                placeholder="e.g. Dhaka, Bangladesh"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1">Website</label>
              <input
                type="url"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition text-[14px]"
                value={formData.website}
                onChange={e => setFormData({...formData, website: e.target.value})}
                placeholder="https://"
              />
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 sticky bottom-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 bg-white rounded-lg text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg text-[13px] font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
