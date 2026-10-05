import React from 'react';

export const OrganizationVerificationBadge = ({ status }: { status: string }) => {
  const styles: any = {
    VERIFIED: 'bg-blue-100 text-blue-800 border-blue-200',
    PENDING_VERIFICATION: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    UNVERIFIED: 'bg-gray-100 text-gray-800 border-gray-200',
    REJECTED: 'bg-red-100 text-red-800 border-red-200',
    SUSPENDED: 'bg-red-100 text-red-800 border-red-200',
  };
  const displayTexts: any = {
    VERIFIED: 'Verified',
    PENDING_VERIFICATION: 'Pending Verification',
    UNVERIFIED: 'Unverified',
    REJECTED: 'Verification Rejected',
    SUSPENDED: 'Suspended',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status] || styles.UNVERIFIED}`}>
      {displayTexts[status] || 'Unverified'}
    </span>
  );
};
