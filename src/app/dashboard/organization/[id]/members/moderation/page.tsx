'use client';
import React, { useState } from 'react';
import {
  useGetOrgMembersQuery,
  useGetOrgMemberStatsQuery,
  useModerateMemberMutation,
} from '@/redux/feature/organization/organizationApi';
import OrgMembersDashboardNav from '@/components/organization/OrgMembersDashboardNav';
import { OrganizationMemberDTO } from '@/redux/feature/organization/organization.types';

export default function OrgDashboardModeration({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);

  const [activeTab, setActiveTab] = useState<'RESTRICTED' | 'SUSPENDED' | 'BANNED'>('RESTRICTED');
  const { data: statsData } = useGetOrgMemberStatsQuery(id);
  const { data: membersData, isLoading } = useGetOrgMembersQuery({
    idOrSlug: id,
    moderationStatus: activeTab,
    limit: 50,
  });

  const [moderateMember, { isLoading: isModerating }] = useModerateMemberMutation();
  const members = membersData?.data || [];
  const stats = statsData?.data;

  const handleUnrestrict = async (member: OrganizationMemberDTO) => {
    if (window.confirm(`Restore active status for ${member.user.fullName}?`)) {
      try {
        await moderateMember({
          idOrSlug: id,
          memberId: member.id,
          action: 'UNRESTRICT',
        }).unwrap();
      } catch (err: any) {
        alert(err?.data?.message || err?.message || 'Failed to update moderation status');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Member Moderation & Safety</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review members with restricted participation, suspensions, or community bans
        </p>
      </div>

      <OrgMembersDashboardNav
        orgId={id}
        pendingRequestsCount={stats?.pendingRequestsCount}
        pendingInvitationsCount={stats?.pendingInvitationsCount}
      />

      {/* Moderation Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
        <button
          onClick={() => setActiveTab('RESTRICTED')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'RESTRICTED'
              ? 'bg-amber-100 text-amber-900 border border-amber-200 shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Restricted Members
        </button>
        <button
          onClick={() => setActiveTab('SUSPENDED')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'SUSPENDED'
              ? 'bg-orange-100 text-orange-900 border border-orange-200 shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Suspended Members
        </button>
        <button
          onClick={() => setActiveTab('BANNED')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'BANNED'
              ? 'bg-red-100 text-red-900 border border-red-200 shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Banned Users
        </button>
      </div>

      {/* Moderated Members List */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-bold text-gray-900 text-base">
            {activeTab.charAt(0) + activeTab.slice(1).toLowerCase()} List · {members.length}
          </h3>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-gray-500 text-sm animate-pulse">
            Loading moderation records...
          </div>
        ) : members.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <svg className="w-12 h-12 text-emerald-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-base font-semibold text-gray-900">
              No {activeTab.toLowerCase()} members
            </p>
            <p className="text-xs text-gray-500">Your community has zero members in this moderation status.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {members.map((member) => (
              <div
                key={member.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-gray-200 text-gray-700 font-bold flex items-center justify-center overflow-hidden flex-shrink-0">
                    {member.user.profilePicture ? (
                      <img src={member.user.profilePicture} alt="" className="w-full h-full object-cover" />
                    ) : (
                      member.user.fullName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{member.user.fullName}</div>
                    {member.user.userName && (
                      <div className="text-xs text-gray-500">@{member.user.userName}</div>
                    )}
                    <div className="text-xs text-gray-400 mt-0.5">
                      Role: {member.role} · Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => handleUnrestrict(member)}
                    disabled={isModerating}
                    className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl text-xs transition-colors shadow-sm"
                  >
                    Restore Status
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
