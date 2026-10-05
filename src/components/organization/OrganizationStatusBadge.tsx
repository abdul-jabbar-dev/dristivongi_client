import React from 'react';

export const OrganizationStatusBadge = ({ status }: { status: string }) => {
  const styles: any = {
    ACTIVE: 'bg-green-100 text-green-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    SUSPENDED: 'bg-red-100 text-red-800',
    ARCHIVED: 'bg-gray-100 text-gray-800',
  };
  return <span className={`px-2 py-1 rounded text-xs font-semibold ${styles[status] || styles.PENDING}`}>{status}</span>;
};
