'use client';
import React from 'react';
import { useGetOrgMemberStatsQuery } from '@/redux/feature/organization/organizationApi';
import OrgMembersDashboardNav from '@/components/organization/OrgMembersDashboardNav';

export default function OrgDashboardRoles({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { data: statsData } = useGetOrgMemberStatsQuery(id);
  const stats = statsData?.data;

  const roleDefinitions = [
    {
      role: 'Owner',
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
      description: 'The highest organization authority. Holds ultimate administrative responsibility.',
      permissions: [
        'Manage all organization settings and visibility',
        'Invite, promote, and demote administrators and moderators',
        'Approve and reject incoming join requests',
        'Manage Cases, official responses, and civic resources',
        'Initiate ownership transfers or archive the group',
      ],
      restrictions: ['Cannot be removed by another administrator', 'Cannot leave while sole owner'],
    },
    {
      role: 'Admin',
      badge: 'bg-blue-100 text-blue-800 border-blue-200',
      description: 'Operations and community manager. Helps run the day-to-day organizational workflows.',
      permissions: [
        'Invite new members and assign moderator roles',
        'Approve or reject join requests',
        'Manage member directory and remove normal members',
        'Oversee cases, evidence contributions, and files',
        'Moderate content and resolve community reports',
      ],
      restrictions: ['Cannot assign or remove Organization Owner', 'Cannot manage core billing/ownership'],
    },
    {
      role: 'Moderator',
      badge: 'bg-purple-100 text-purple-800 border-purple-200',
      description: 'Community safety and discussion steward. Maintains factual integrity and respectful discourse.',
      permissions: [
        'Review and act on pending join requests',
        'Review reported claims, evidence, and discussions',
        'Apply member moderation (Restrict, Suspend, Ban)',
        'Pin and highlight important community investigations',
      ],
      restrictions: ['Cannot change membership roles', 'Cannot manage organizational settings'],
    },
    {
      role: 'Representative',
      badge: 'bg-teal-100 text-teal-800 border-teal-200',
      description: 'Verified spokesperson authorized to publish official civic responses on behalf of the organization.',
      permissions: [
        'Publish verified Official Responses on Cases',
        'Represent organization stance in civic disputes',
        'Contribute public evidence and sources',
      ],
      restrictions: ['Cannot manage administrative roles', 'Cannot moderate members'],
    },
    {
      role: 'Member',
      badge: 'bg-gray-100 text-gray-700 border-gray-200',
      description: 'Standard community participant with full access to collaborative civic tools.',
      permissions: [
        'Create and contribute to organization Cases',
        'Submit verified evidence, claims, and external sources',
        'Participate in discussions and community fact-checking',
        'Follow and collaborate on civic investigations',
      ],
      restrictions: ['Cannot access management tools', 'Cannot moderate other users'],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Role & Permission Hierarchy</h1>
        <p className="text-sm text-gray-500 mt-1">
          Detailed explanation of CivicLens organization access control and permission boundaries
        </p>
      </div>

      <OrgMembersDashboardNav
        orgId={id}
        pendingRequestsCount={stats?.pendingRequestsCount}
        pendingInvitationsCount={stats?.pendingInvitationsCount}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roleDefinitions.map((def) => (
          <div
            key={def.role}
            className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="text-lg font-bold text-gray-900">{def.role}</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${def.badge}`}>
                  {def.role}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">{def.description}</p>

              <div className="space-y-3 text-xs">
                <div>
                  <h4 className="font-semibold text-gray-900 uppercase tracking-wider mb-2 text-[11px]">
                    Key Capabilities
                  </h4>
                  <ul className="space-y-1.5 text-gray-600">
                    {def.permissions.map((p, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <svg className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 uppercase tracking-wider mb-2 text-[11px]">
                    System Boundaries
                  </h4>
                  <ul className="space-y-1.5 text-gray-500">
                    {def.restrictions.map((r, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <svg className="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
