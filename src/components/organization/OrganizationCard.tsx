import React from 'react';
import Link from 'next/link';

export const OrganizationCard = ({ org }: { org: any }) => {
  return (
    <div className="bg-white border-b border-gray-200 p-5 hover:bg-gray-50 transition-colors">
      <div className="flex items-start gap-4">
        {/* Avatar/Logo */}
        <Link href={`/org/${org.slug}`} className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200 hover:opacity-90">
           {org.logoUrl ? (
             <img src={org.logoUrl} alt={org.name} className="w-full h-full object-cover"/>
           ) : (
             <span className="text-gray-500 font-bold text-2xl">{org.name.charAt(0)}</span>
           )}
        </Link>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Link href={`/org/${org.slug}`} className="font-bold text-base text-gray-900 hover:underline truncate">
              {org.name}
            </Link>
            {org.verificationStatus === 'VERIFIED' && (
              <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-label="Verified">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          
          <div className="text-gray-500 text-sm mb-2 font-medium">
            {org.organizationType || org.type}
            {org.location && <span className="mx-1.5 text-gray-300">•</span>}
            {org.location && <span>{org.location}</span>}
          </div>
          
          <p className="text-gray-700 text-sm leading-relaxed mb-3 line-clamp-2">
            {org.description || "No description provided."}
          </p>
          
          {/* Stats & Actions Footer */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
              {org._count?.memberships !== undefined && (
                <span>{org._count.memberships} members</span>
              )}
              {org._count?.cases !== undefined && (
                <>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span>{org._count.cases} cases</span>
                </>
              )}
              {org._count?.officialResponses !== undefined && (
                <>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span>{org._count.officialResponses} official responses</span>
                </>
              )}
            </div>
            
            <Link href={`/org/${org.slug}`} className="px-4 py-1.5 border border-gray-300 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors">
              View
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
