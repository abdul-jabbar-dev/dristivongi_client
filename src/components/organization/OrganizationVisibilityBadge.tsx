import React from 'react';

export const OrganizationVisibilityBadge = ({ visibility }: { visibility: string }) => {
  const isPublic = visibility === 'PUBLIC';
  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 w-fit ${isPublic ? 'bg-green-50 text-green-700' : 'bg-purple-50 text-purple-700'}`}>
      {isPublic ? '🌍 PUBLIC' : '🔒 PRIVATE'}
    </span>
  );
};
