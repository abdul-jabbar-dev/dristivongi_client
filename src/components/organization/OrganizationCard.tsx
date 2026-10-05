import React from 'react';
import Link from 'next/link';

export const OrganizationCard = ({ org }: { org: any }) => {
  return (
    <div className="bg-white border-b border-gray-200 p-5 hover:bg-gray-50 transition-colors">
      <div className="flex items-start gap-4">
        {/* Avatar/Logo */}
        <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border border-gray-200">
           {org.logoUrl ? (
             <img src={org.logoUrl} alt={org.name} className="w-full h-full object-cover"/>
           ) : (
             <span className="text-gray-500 font-bold text-lg">{org.name.charAt(0)}</span>
           )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Link href={`/org/${org.slug}`} className="font-bold text-[15px] text-gray-900 hover:underline truncate">
              {org.name}
            </Link>
            {org.verificationStatus === 'VERIFIED' && (
              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            )}
            <span className="text-gray-500 text-[14px]">@{org.slug}</span>
          </div>
          
          <div className="text-gray-500 text-[13px] mb-2">
            {org.type} {org.location && <span className="mx-1">•</span>} {org.location}
          </div>
          
          <p className="text-gray-900 text-[15px] leading-relaxed mb-3">
            {org.description}
          </p>
          
          {/* Actions / Footer */}
          <div className="flex items-center text-gray-500 text-sm">
            <Link href={`/org/${org.slug}`} className="font-semibold text-blue-600 hover:text-blue-700">
              Visit Organization
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
