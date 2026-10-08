'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  useGetOrganizationBySlugQuery,
  useGetOrgMembersQuery,
  useGetOrgMemberStatsQuery,
  useGetOrgAdminsModeratorsQuery,
  useGetOrgContributorsQuery,
} from '@/redux/feature/organization/organizationApi';
import OrganizationMemberRow from '@/components/organization/OrganizationMemberRow';
import OrganizationPeopleSidebar from '@/components/organization/OrganizationPeopleSidebar';
import InvitePeopleModal from '@/components/organization/InvitePeopleModal';
import ChangeRoleModal from '@/components/organization/ChangeRoleModal';
import RemoveMemberModal from '@/components/organization/RemoveMemberModal';
import ModerateMemberModal from '@/components/organization/ModerateMemberModal';
import { OrganizationMemberDTO } from '@/redux/feature/organization/organization.types';

export default function OrganizationMembersPage() {
  const { slug } = useParams();
  const orgSlug = slug as string;

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'admins' | 'contributors'>('all');
  const [page, setPage] = useState(1);

  // Modals state
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [roleModalMember, setRoleModalMember] = useState<OrganizationMemberDTO | null>(null);
  const [removeModalMember, setRemoveModalMember] = useState<OrganizationMemberDTO | null>(null);
  const [moderateModalMember, setModerateModalMember] = useState<OrganizationMemberDTO | null>(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Main Queries
  const { data: orgContextData, isLoading: isOrgLoading } = useGetOrganizationBySlugQuery(orgSlug);
  const org = orgContextData?.data?.organization;
  const viewer = orgContextData?.data?.viewer;

  const { data: statsData } = useGetOrgMemberStatsQuery(org?.id || orgSlug, {
    skip: !org,
  });

  const { data: adminsData, isLoading: isAdminsLoading } = useGetOrgAdminsModeratorsQuery(
    org?.id || orgSlug,
    { skip: !org }
  );

  const { data: contributorsData, isLoading: isContributorsLoading } = useGetOrgContributorsQuery(
    { idOrSlug: org?.id || orgSlug, limit: 6 },
    { skip: !org }
  );

  const { data: membersData, isLoading: isMembersLoading, isFetching: isMembersFetching } =
    useGetOrgMembersQuery(
      {
        idOrSlug: org?.id || orgSlug,
        search: debouncedSearch || undefined,
        tab: activeTab !== 'all' ? activeTab : undefined,
        page,
        limit: 20,
      },
      { skip: !org }
    );

  if (isOrgLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium text-sm">Loading people & organization community...</p>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-1">Organization Not Found</h3>
        <p className="text-gray-500 text-sm">The organization you are looking for does not exist or is private.</p>
      </div>
    );
  }

  const stats = statsData?.data;
  const admins = adminsData?.data || [];
  const contributors = contributorsData?.data || [];
  const members = membersData?.data || [];
  const meta = membersData?.meta;

  const canInvite = viewer?.permissions?.inviteMembers || viewer?.isAdmin || viewer?.isOwner;
  const totalCount = stats?.totalMembers ?? meta?.total ?? members.length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content (2 Columns on Desktop) */}
      <div className="lg:col-span-2 space-y-6">
        {/* Header & Search */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-2xl font-bold text-gray-900">People</h2>
                <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                  {totalCount.toLocaleString()} {totalCount === 1 ? 'Member' : 'Members'}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Verified contributors, moderators, and community members
              </p>
            </div>

            {canInvite && (
              <button
                type="button"
                onClick={() => setIsInviteOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Invite People
              </button>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative mb-5">
            <input
              type="text"
              placeholder="Find a member by name or @username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all pl-10"
            />
            <svg
              className="w-5 h-5 text-gray-400 absolute left-3 top-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-600 bg-gray-200 rounded-full p-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            <button
              onClick={() => {
                setActiveTab('all');
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({stats?.totalMembers ?? totalCount})
            </button>
            <button
              onClick={() => {
                setActiveTab('admins');
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'admins'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Admins & Moderators ({(stats?.adminsCount ?? 0) + (stats?.moderatorsCount ?? 0)})
            </button>
            <button
              onClick={() => {
                setActiveTab('contributors');
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'contributors'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Contributors ({stats?.contributorsCount ?? 0})
            </button>
          </div>
        </div>

        {/* Section 1: Admins & Moderators (Shown when on "all" tab and not searching) */}
        {activeTab === 'all' && !debouncedSearch && admins.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h3 className="font-bold text-gray-900 text-base">
                  Admins & Moderators · {admins.length}
                </h3>
                <p className="text-xs text-gray-500">Community stewards and verified managers</p>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {admins.map((admin) => (
                <OrganizationMemberRow
                  key={admin.id}
                  member={admin}
                  orgIdOrSlug={org.id}
                  viewerRole={viewer?.role}
                  viewerUserId={viewer?.membershipId}
                  isOwner={viewer?.isOwner}
                  isAdmin={viewer?.isAdmin}
                  isModerator={viewer?.isModerator}
                  onOpenRoleModal={setRoleModalMember}
                  onOpenRemoveModal={setRemoveModalMember}
                  onOpenModerateModal={setModerateModalMember}
                />
              ))}
            </div>
          </div>
        )}

        {/* Section 2: Group Contributors (Shown when real non-anonymous contributions exist) */}
        {activeTab === 'all' && !debouncedSearch && contributors.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h3 className="font-bold text-gray-900 text-base">
                  Top Civic Contributors · {contributors.length}
                </h3>
                <p className="text-xs text-gray-500">
                  Members with verified public cases, claims, evidence, and discussions
                </p>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {contributors.map((contrib) => (
                <OrganizationMemberRow
                  key={contrib.id}
                  member={contrib}
                  orgIdOrSlug={org.id}
                  viewerRole={viewer?.role}
                  viewerUserId={viewer?.membershipId}
                  isOwner={viewer?.isOwner}
                  isAdmin={viewer?.isAdmin}
                  isModerator={viewer?.isModerator}
                  onOpenRoleModal={setRoleModalMember}
                  onOpenRemoveModal={setRemoveModalMember}
                  onOpenModerateModal={setModerateModalMember}
                />
              ))}
            </div>
          </div>
        )}

        {/* Section 3: All Members list */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <div>
              <h3 className="font-bold text-gray-900 text-base">
                {activeTab === 'admins'
                  ? `Admins & Moderators · ${members.length}`
                  : activeTab === 'contributors'
                  ? `Civic Contributors · ${members.length}`
                  : debouncedSearch
                  ? `Search Results · ${members.length}`
                  : `Members · ${totalCount}`}
              </h3>
              <p className="text-xs text-gray-500">
                {debouncedSearch
                  ? `Showing results matching "${debouncedSearch}"`
                  : 'All registered members in this organization'}
              </p>
            </div>
          </div>

          {isMembersLoading || isMembersFetching ? (
            <div className="p-12 text-center text-gray-500 text-sm animate-pulse space-y-2">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p>Fetching members list...</p>
            </div>
          ) : members.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <svg className="w-12 h-12 text-gray-300 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h4 className="text-base font-semibold text-gray-900">
                {debouncedSearch ? 'No members found' : 'No members yet'}
              </h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                {debouncedSearch
                  ? `No members found matching "${debouncedSearch}". Try another search term.`
                  : 'Be the first to join or invite people to this community.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {members.map((member) => (
                <OrganizationMemberRow
                  key={member.id}
                  member={member}
                  orgIdOrSlug={org.id}
                  viewerRole={viewer?.role}
                  viewerUserId={viewer?.membershipId}
                  isOwner={viewer?.isOwner}
                  isAdmin={viewer?.isAdmin}
                  isModerator={viewer?.isModerator}
                  onOpenRoleModal={setRoleModalMember}
                  onOpenRemoveModal={setRemoveModalMember}
                  onOpenModerateModal={setModerateModalMember}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50 border-t border-gray-100">
              <span className="text-xs text-gray-500">
                Page {meta.page} of {meta.totalPages} ({meta.total} members)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-colors"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={!meta.hasNext}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="lg:col-span-1">
        <OrganizationPeopleSidebar
          org={org}
          stats={stats}
          canInvite={canInvite}
          onOpenInviteModal={() => setIsInviteOpen(true)}
        />
      </div>

      {/* Modals */}
      {isInviteOpen && (
        <InvitePeopleModal
          orgIdOrSlug={org.id}
          isOwner={viewer?.isOwner}
          isAdmin={viewer?.isAdmin}
          onClose={() => setIsInviteOpen(false)}
        />
      )}

      {roleModalMember && (
        <ChangeRoleModal
          member={roleModalMember}
          orgIdOrSlug={org.id}
          isOwner={viewer?.isOwner}
          onClose={() => setRoleModalMember(null)}
        />
      )}

      {removeModalMember && (
        <RemoveMemberModal
          member={removeModalMember}
          orgIdOrSlug={org.id}
          onClose={() => setRemoveModalMember(null)}
        />
      )}

      {moderateModalMember && (
        <ModerateMemberModal
          member={moderateModalMember}
          orgIdOrSlug={org.id}
          onClose={() => setModerateModalMember(null)}
        />
      )}
    </div>
  );
}
