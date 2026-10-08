'use client';
import React, { useState } from 'react';
import {
  useGetOrgInvitationsQuery,
  useGetOrgMemberStatsQuery,
  useCancelInvitationMutation,
} from '@/redux/feature/organization/organizationApi';
import OrgMembersDashboardNav from '@/components/organization/OrgMembersDashboardNav';
import InvitePeopleModal from '@/components/organization/InvitePeopleModal';

export default function OrgDashboardInvitations({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const { data: invitationsData, isLoading } = useGetOrgInvitationsQuery(id);
  const { data: statsData } = useGetOrgMemberStatsQuery(id);
  const [cancelInvitation, { isLoading: isCancelling }] = useCancelInvitationMutation();

  const invitations = invitationsData?.data || [];
  const stats = statsData?.data;

  const handleCancel = async (invitationId: string) => {
    if (window.confirm('Cancel this pending invitation?')) {
      try {
        await cancelInvitation({ idOrSlug: id, invitationId }).unwrap();
      } catch (err: any) {
        alert(err?.data?.message || err?.message || 'Failed to cancel invitation');
      }
    }
  };

  const pendingInvites = invitations.filter((i) => i.status === 'PENDING');
  const otherInvites = invitations.filter((i) => i.status !== 'PENDING');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Invitations Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track sent invitation links, status, and pending responses
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsInviteOpen(true)}
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

      {/* Pending Invitations */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-bold text-gray-900 text-base">Pending Invitations · {pendingInvites.length}</h3>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-gray-500 text-sm animate-pulse">
            Loading invitations...
          </div>
        ) : pendingInvites.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <p className="text-base font-semibold text-gray-900">No pending invitations</p>
            <p className="text-xs text-gray-500">Send an invitation to bring new members into the organization.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {pendingInvites.map((invite) => (
              <div
                key={invite.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{invite.email}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                      Role: {invite.role}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Sent by {invite.inviter?.fullName || 'Manager'} on{' '}
                    {new Date(invite.createdAt).toLocaleDateString()} · Expires in 7 days
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => handleCancel(invite.id)}
                    disabled={isCancelling}
                    className="px-3.5 py-1.5 bg-white border border-gray-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold transition-colors shadow-sm"
                  >
                    Cancel Invitation
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History */}
      {otherInvites.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-bold text-gray-900 text-base">Past Invitations · {otherInvites.length}</h3>
          </div>
          <div className="divide-y divide-gray-100 text-sm">
            {otherInvites.map((invite) => (
              <div key={invite.id} className="p-4 flex items-center justify-between">
                <div>
                  <span className="font-medium text-gray-900">{invite.email}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    {new Date(invite.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    invite.status === 'ACCEPTED'
                      ? 'bg-green-100 text-green-800'
                      : invite.status === 'CANCELLED'
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {invite.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {isInviteOpen && (
        <InvitePeopleModal
          orgIdOrSlug={id}
          isOwner={true}
          isAdmin={true}
          onClose={() => setIsInviteOpen(false)}
        />
      )}
    </div>
  );
}
