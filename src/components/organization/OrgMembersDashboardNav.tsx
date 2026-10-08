'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface OrgMembersDashboardNavProps {
  orgId: string;
  pendingRequestsCount?: number;
  pendingInvitationsCount?: number;
}

export default function OrgMembersDashboardNav({
  orgId,
  pendingRequestsCount = 0,
  pendingInvitationsCount = 0,
}: OrgMembersDashboardNavProps) {
  const pathname = usePathname();

  const tabs = [
    { label: 'All Members', href: `/org/${orgId}/members`, count: null },
    {
      label: 'Join Requests',
      href: `/org/${orgId}/members/requests`,
      count: pendingRequestsCount,
      countColor: 'bg-amber-100 text-amber-800',
    },
    {
      label: 'Invitations',
      href: `/org/${orgId}/members/invitations`,
      count: pendingInvitationsCount,
      countColor: 'bg-blue-100 text-blue-800',
    },
    { label: 'Role Permissions', href: `/org/${orgId}/members/roles`, count: null },
    { label: 'Moderation', href: `/org/${orgId}/members/moderation`, count: null },
  ];

  return (
    <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto custom-scrollbar pb-0 mb-6">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
              isActive
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-t-lg'
            }`}
          >
            {tab.label}
            {tab.count !== null && tab.count > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${tab.countColor || 'bg-gray-100 text-gray-700'}`}>
                {tab.count}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
