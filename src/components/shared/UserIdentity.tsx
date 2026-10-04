'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface UserIdentityProps {
  user: {
    id?: string;
    fullName: string;
    userName?: string | null;
    userProfile?: {
      profilePicture?: string | null;
    } | null;
  };
  size?: 'sm' | 'md' | 'lg';
  showUsername?: boolean;
  className?: string;
}

import { getAvatarUrl } from '@/lib/utils';

export default function UserIdentity({ 
  user, 
  size = 'md', 
  showUsername = true,
  className = ''
}: UserIdentityProps) {
  
  if (!user) return null;

  const initial = user.fullName ? user.fullName.charAt(0).toUpperCase() : '?';
  const profileUrl = `/profile/${user.userName || user.id || ''}`;
  
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  const nameSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const avatarUrl = getAvatarUrl(user);

  return (
    <Link href={profileUrl} className={`inline-flex items-center gap-2.5 group ${className}`}>
      <div className={`relative shrink-0 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold overflow-hidden border border-slate-200 shadow-sm transition group-hover:shadow ${sizeClasses[size]}`}>
        <Image 
          src={avatarUrl} 
          alt={user.fullName || 'User'} 
          layout="fill" 
          objectFit="cover" 
        />
      </div>
      
      <div className="flex flex-col min-w-0">
        <span className={`font-semibold text-slate-800 group-hover:text-blue-600 transition truncate ${nameSizeClasses[size]}`}>
          {user.fullName}
        </span>
        {showUsername && (
          <span className="text-slate-500 text-[11px] sm:text-xs truncate">
            {user.userName ? `@${user.userName}` : 'Username not set'}
          </span>
        )}
      </div>
    </Link>
  );
}
