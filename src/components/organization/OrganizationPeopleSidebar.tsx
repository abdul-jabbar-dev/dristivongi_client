'use client';
import React from 'react';
import {
  OrganizationMemberStatsDTO,
  PublicOrganizationDTO,
} from '@/redux/feature/organization/organization.types';

interface OrganizationPeopleSidebarProps {
  org: PublicOrganizationDTO;
  stats?: OrganizationMemberStatsDTO;
  canInvite?: boolean;
  onOpenInviteModal?: () => void;
}

export default function OrganizationPeopleSidebar({
  org,
  stats,
  canInvite,
  onOpenInviteModal,
}: OrganizationPeopleSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-gray-900 text-base border-b border-gray-100 pb-3">
          About this Community
        </h3>

        {org.description && (
          <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
            {org.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 py-1">
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <div className="text-xs text-gray-500 font-medium">Members</div>
            <div className="text-xl font-bold text-gray-900 mt-0.5">
              {stats?.totalMembers?.toLocaleString() ?? 0}
            </div>
          </div>

          <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100/50">
            <div className="text-xs text-blue-700 font-medium">Admins</div>
            <div className="text-xl font-bold text-blue-900 mt-0.5">
              {stats?.adminsCount?.toLocaleString() ?? 0}
            </div>
          </div>

          <div className="bg-purple-50/50 rounded-xl p-3 border border-purple-100/50">
            <div className="text-xs text-purple-700 font-medium">Moderators</div>
            <div className="text-xl font-bold text-purple-900 mt-0.5">
              {stats?.moderatorsCount?.toLocaleString() ?? 0}
            </div>
          </div>

          <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100/50">
            <div className="text-xs text-emerald-700 font-medium">Contributors</div>
            <div className="text-xl font-bold text-emerald-900 mt-0.5">
              {stats?.contributorsCount?.toLocaleString() ?? 0}
            </div>
          </div>
        </div>

        {canInvite && onOpenInviteModal && (
          <button
            type="button"
            onClick={onOpenInviteModal}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            + Invite People
          </button>
        )}
      </div>

      {/* Community Values Card */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl border border-gray-200 p-5 space-y-2.5 text-xs text-gray-600">
        <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
          <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Civic Transparency
        </h4>
        <p>
          Members collaborate to verify civic claims, document community evidence, and engage in factual discussions.
        </p>
      </div>
    </div>
  );
}
