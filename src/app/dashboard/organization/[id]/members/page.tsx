'use client';
import React, { useState, useEffect } from 'react';
import {
  useGetOrgMembersQuery,
  useGetOrgMemberStatsQuery,
  useGetOrganizationByIdQuery,
  useUpdateMemberRoleMutation,
  useRemoveMemberMutation,
} from '@/redux/feature/organization/organizationApi';
import OrgMembersDashboardNav from '@/components/organization/OrgMembersDashboardNav';
import InvitePeopleModal from '@/components/organization/InvitePeopleModal';
import ModerateMemberModal from '@/components/organization/ModerateMemberModal';
import { getRoleBadge } from '@/components/organization/OrganizationMemberRow';
import { OrganizationMemberDTO, OrganizationRole } from '@/redux/feature/organization/organization.types';

export default function OrgDashboardMembers({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [moderateMemberTarget, setModerateMemberTarget] = useState<OrganizationMemberDTO | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data: orgData, isLoading: isOrgLoading } = useGetOrganizationByIdQuery(id);
  const { data: statsData } = useGetOrgMemberStatsQuery(id);
  const { data: membersData, isLoading: isMembersLoading } = useGetOrgMembersQuery({
    idOrSlug: id,
    search: debouncedSearch || undefined,
    role: roleFilter || undefined,
    page,
    limit: 25,
  });

  const [updateRole, { isLoading: isUpdatingRole }] = useUpdateMemberRoleMutation();
  const [removeMember, { isLoading: isRemovingMember }] = useRemoveMemberMutation();

  const members = membersData?.data || [];
  const stats = statsData?.data;
  const meta = membersData?.meta;

  const handleRoleChange = async (memberId: string, role: string) => {
    try {
      await updateRole({ idOrSlug: id, memberId, role }).unwrap();
    } catch (err: any) {
      alert(err?.data?.message || err?.message || 'Failed to update role');
    }
  };

  const handleRemove = async (member: OrganizationMemberDTO) => {
    if (window.confirm(`Are you sure you want to remove ${member.user.fullName} from this organization?`)) {
      try {
        await removeMember({ idOrSlug: id, memberId: member.id }).unwrap();
      } catch (err: any) {
        alert(err?.data?.message || err?.message || 'Failed to remove member');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Member Directory & Roles</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage organization membership, permissions, and moderation access
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsInviteModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Invite People
        </button>
      </div>

      <OrgMembersDashboardNav
        orgId={id}
        pendingRequestsCount={stats?.pendingRequestsCount}
        pendingInvitationsCount={stats?.pendingInvitationsCount}
      />

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by name or @username..."
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <svg
            className="w-4 h-4 text-gray-400 absolute left-3.5 top-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Roles</option>
            <option value="OWNER">Owner</option>
            <option value="ADMIN">Admin</option>
            <option value="MODERATOR">Moderator</option>
            <option value="REPRESENTATIVE">Representative</option>
            <option value="MEMBER">Member</option>
          </select>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {isMembersLoading ? (
          <div className="p-12 text-center text-gray-500 text-sm animate-pulse space-y-2">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p>Loading member directory...</p>
          </div>
        ) : members.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <p className="text-base font-semibold text-gray-900">No members found</p>
            <p className="text-xs text-gray-500">Try adjusting your search or role filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/75 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">User</th>
                  <th className="py-3.5 px-6">Role</th>
                  <th className="py-3.5 px-6">Contributions</th>
                  <th className="py-3.5 px-6">Joined Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {members.map((member) => {
                  const roleBadge = getRoleBadge(member.role);
                  return (
                    <tr key={member.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center overflow-hidden flex-shrink-0">
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
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${roleBadge.className}`}>
                          {roleBadge.label}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-xs text-gray-600">
                        {member.contributions?.total > 0 ? (
                          <div className="space-y-0.5">
                            <span className="font-semibold text-gray-900">{member.contributions.total} total</span>
                            <div className="text-gray-400">
                              {member.contributions.cases} cases · {member.contributions.evidence} evidence
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">0 contributions</span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-xs text-gray-500">
                        {new Date(member.joinedAt).toLocaleDateString()}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {member.role !== 'OWNER' ? (
                            <>
                              <select
                                value={member.role}
                                onChange={(e) => handleRoleChange(member.id, e.target.value)}
                                disabled={isUpdatingRole}
                                className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="ADMIN">Admin</option>
                                <option value="MODERATOR">Moderator</option>
                                <option value="REPRESENTATIVE">Representative</option>
                                <option value="MEMBER">Member</option>
                              </select>

                              <button
                                type="button"
                                onClick={() => setModerateMemberTarget(member)}
                                className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                title="Moderate"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleRemove(member)}
                                disabled={isRemovingMember}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Remove Member"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-amber-700 font-semibold bg-amber-50 px-2 py-1 rounded-md">
                              Primary Owner
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50 border-t border-gray-200">
            <span className="text-xs text-gray-500">
              Page {meta.page} of {meta.totalPages} ({meta.total} total members)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={!meta.hasNext}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {isInviteModalOpen && (
        <InvitePeopleModal
          orgIdOrSlug={id}
          isOwner={true}
          isAdmin={true}
          onClose={() => setIsInviteModalOpen(false)}
        />
      )}

      {moderateMemberTarget && (
        <ModerateMemberModal
          member={moderateMemberTarget}
          orgIdOrSlug={id}
          onClose={() => setModerateMemberTarget(null)}
        />
      )}
    </div>
  );
}
