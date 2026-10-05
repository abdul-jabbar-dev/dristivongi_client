'use client';

import React, { useState, useRef } from 'react';
import { useUpdateProfileMutation, useLazyCheckUsernameQuery } from '../../../redux/feature/user/user.reducer';
import type { TUserType } from '../../../redux/feature/user/user.type';
import { isUsernameValid, normalizeUsername } from '../../../utils/username';
import Image from 'next/image';
import { Camera, Image as ImageIcon, Check, X as XIcon, Loader2, User, FileText, MapPin, Link as LinkIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { resolveMediaUrl } from '../../../lib/utils';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '../../../redux/feature/auth/auth.slice';
import { RootState } from '../../../redux/store';

export default function EditProfileModal({ profile, onClose }: { profile: TUserType, onClose: () => void }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { accessToken } = useSelector((state: RootState) => state.auth);
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }

    try {
      const { processImageToWebP } = await import('../../../lib/image-processor');
      const processed = await processImageToWebP(file, { maxSize: 5 * 1024 * 1024 });
      
      if (type === 'profile') {
        setProfilePic(processed.file);
        setProfilePicPreview(processed.previewUrl);
      } else {
        setCoverPic(processed.file);
        setCoverPicPreview(processed.previewUrl);
      }
      setError('');
    } catch (err: any) {
      // Fallback to original if processing fails
      if (type === 'profile') {
        setProfilePic(file);
        setProfilePicPreview(URL.createObjectURL(file));
      } else {
        setCoverPic(file);
        setCoverPicPreview(URL.createObjectURL(file));
      }
      console.warn('WebP processing failed, using original file', err);
    }
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

      const response = await updateProfile(data).unwrap();
      if (response && response.data) {
         dispatch(setCredentials({ user: response.data, accessToken: accessToken || '' }));
      }
      onClose();
      
      // Redirect if username changed
      if (normalizedUserName && normalizedUserName !== profile.userName) {
        router.push(`/profile/${normalizedUserName}`);
      }
    } catch (err: any) {
      setError(err?.data?.message || 'প্রোফাইল আপডেট করা যায়নি। আবার চেষ্টা করুন।');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 sm:p-0">
      <div className="bg-white sm:rounded-2xl shadow-2xl w-full max-w-xl h-full sm:h-auto sm:max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-20">
          <h3 className="text-xl font-bold text-slate-800">Edit Profile</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full p-2 transition-colors">
            <XIcon size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 scrollbar-thin">
          {error && (
            <div className="mx-6 mt-6 p-4 bg-red-50 text-red-700 text-sm font-medium rounded-xl border border-red-100 flex items-start gap-3">
              <XIcon size={16} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Media Section */}
          <div className="relative mb-20 bg-white group">
            {/* Cover Picture */}
            <div className="relative w-full h-44 sm:h-52 bg-slate-100 overflow-hidden cursor-pointer group-hover:bg-slate-200 transition-colors" onClick={() => coverPicRef.current?.click()}>
              {coverPicPreview ? (
                <Image src={resolveMediaUrl(coverPicPreview)} alt="Cover Preview" layout="fill" objectFit="cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-blue-50 to-indigo-50"></div>
              )}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="bg-white/90 text-slate-800 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-sm hover:bg-white hover:scale-105 transition-all">
                  <ImageIcon size={16} /> Update Cover Photo
                </div>
              </div>
              <input type="file" ref={coverPicRef} onChange={(e) => handleFileChange(e, 'cover')} accept="image/*" className="hidden" />
            </div>

            {/* Profile Picture */}
            <div className="absolute -bottom-14 left-8">
              <div 
                className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-slate-100 overflow-hidden shadow-md group/avatar cursor-pointer hover:shadow-lg transition-shadow"
                onClick={(e) => {
                  e.stopPropagation();
                  profilePicRef.current?.click();
                }}
              >
                {profilePicPreview ? (
                  <Image src={resolveMediaUrl(profilePicPreview)} alt="Profile Preview" layout="fill" objectFit="cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-slate-400">
                    {formData.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                  <Camera size={24} className="text-white" />
                  <span className="text-white text-[10px] font-bold">Update</span>
                </div>
                <input type="file" ref={profilePicRef} onChange={(e) => handleFileChange(e, 'profile')} accept="image/*" className="hidden" />
              </div>
            </div>
          </div>

          <div className="px-6 pb-8 space-y-8">
            
            {/* Identity Section */}
            <div className="space-y-5">
               <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Identity</h4>
               
               <div className="grid sm:grid-cols-2 gap-5">
                 <div>
                   <label className="flex items-center gap-2 text-[13px] font-bold text-slate-700 mb-1.5">
                     <User size={14} className="text-slate-400" /> Full Name
                   </label>
                   <input
                     type="text"
                     required
                     className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-[14px] text-slate-800"
                     value={formData.fullName}
                     onChange={e => setFormData({...formData, fullName: e.target.value})}
                     placeholder="John Doe"
                   />
                 </div>
                 
                 <div>
                   <label className="flex items-center gap-2 text-[13px] font-bold text-slate-700 mb-1.5">
                     @ Username
                   </label>
                   <div className="relative">
                     <input
                       type="text"
                       className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl outline-none transition-all text-[14px] text-slate-800 ${
                         usernameStatus 
                           ? (usernameStatus.available && usernameStatus.valid ? 'border-emerald-300 focus:ring-emerald-100 focus:border-emerald-500 focus:bg-white' : 'border-red-300 focus:ring-red-100 focus:border-red-500 focus:bg-white')
                           : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500 focus:bg-white'
                       }`}
                       value={formData.userName}
                       onChange={e => setFormData({...formData, userName: e.target.value})}
                       placeholder="johndoe"
                     />
                     <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                       {isCheckingUsername && <Loader2 size={16} className="text-slate-400 animate-spin" />}
                       {!isCheckingUsername && usernameStatus?.available === true && <Check size={16} className="text-emerald-500" />}
                       {!isCheckingUsername && (usernameStatus?.available === false || usernameStatus?.valid === false) && <XIcon size={16} className="text-red-500" />}
                     </div>
                   </div>
                   {usernameStatus?.reason && (
                     <p className={`mt-1.5 text-xs font-medium ${usernameStatus.available ? 'text-emerald-600' : 'text-red-500'}`}>
                       {usernameStatus.reason}
                     </p>
                   )}
                 </div>
               </div>
            </div>

            {/* About Section */}
            <div className="space-y-5">
               <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">About You</h4>
               
               <div>
                 <label className="flex items-center gap-2 text-[13px] font-bold text-slate-700 mb-1.5">
                   <FileText size={14} className="text-slate-400" /> Bio / Headline
                 </label>
                 <textarea
                   rows={3}
                   className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-[14px] text-slate-800 resize-none"
                   value={formData.bio}
                   onChange={e => setFormData({...formData, bio: e.target.value})}
                   placeholder="Describe your civic interests and professional background..."
                 ></textarea>
               </div>
            </div>

            {/* Links & Location */}
            <div className="space-y-5">
               <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Location & Links</h4>
               
               <div className="grid sm:grid-cols-2 gap-5">
                 <div>
                   <label className="flex items-center gap-2 text-[13px] font-bold text-slate-700 mb-1.5">
                     <MapPin size={14} className="text-slate-400" /> Location
                   </label>
                   <input
                     type="text"
                     className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-[14px] text-slate-800"
                     value={formData.location}
                     onChange={e => setFormData({...formData, location: e.target.value})}
                     placeholder="e.g. Dhaka, Bangladesh"
                   />
                 </div>

                 <div>
                   <label className="flex items-center gap-2 text-[13px] font-bold text-slate-700 mb-1.5">
                     <LinkIcon size={14} className="text-slate-400" /> Website / Social
                   </label>
                   <input
                     type="url"
                     className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-[14px] text-slate-800"
                     value={formData.website}
                     onChange={e => setFormData({...formData, website: e.target.value})}
                     placeholder="https://..."
                   />
                 </div>
               </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-end gap-3 sticky bottom-0 z-20">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-200 bg-white rounded-full text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-full text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
              {isLoading ? 'Saving Changes...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
