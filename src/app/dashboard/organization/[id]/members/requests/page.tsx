'use client';
import React from 'react';
import {
  useGetOrgJoinRequestsQuery,
  useGetOrgMemberStatsQuery,
  useApproveJoinRequestMutation,
  useRejectJoinRequestMutation,
} from '@/redux/feature/organization/organizationApi';
import OrgMembersDashboardNav from '@/components/organization/OrgMembersDashboardNav';

export default function OrgDashboardJoinRequests({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);

  const { data: requestsData, isLoading } = useGetOrgJoinRequestsQuery(id);
  const { data: statsData } = useGetOrgMemberStatsQuery(id);
  const [approveRequest, { isLoading: isApproving }] = useApproveJoinRequestMutation();
  const [rejectRequest, { isLoading: isRejecting }] = useRejectJoinRequestMutation();

  const requests = requestsData?.data || [];
  const stats = statsData?.data;

  const handleApprove = async (requestId: string) => {
    try {
      await approveRequest({ idOrSlug: id, requestId }).unwrap();
    } catch (err: any) {
      alert(err?.data?.message || err?.message || 'Failed to approve request');
    }
  };

  const handleReject = async (requestId: string) => {
    const reason = window.prompt('Optional rejection reason (or leave blank):');
    try {
      await rejectRequest({ idOrSlug: id, requestId, reason: reason || undefined }).unwrap();
    } catch (err: any) {
      alert(err?.data?.message || err?.message || 'Failed to reject request');
    }
  };

  const pendingRequests = requests.filter((r) => r.status === 'PENDING');
  const pastRequests = requests.filter((r) => r.status !== 'PENDING');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Pending Join Requests</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review community membership requests for private or verification-gated access
        </p>
      </div>

      <OrgMembersDashboardNav
        orgId={id}
        pendingRequestsCount={stats?.pendingRequestsCount}
        pendingInvitationsCount={stats?.pendingInvitationsCount}
      />

      {/* Pending Requests List */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-bold text-gray-900 text-base">
            Pending Queue · {pendingRequests.length}
          </h3>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-gray-500 text-sm animate-pulse">
            Loading join requests...
          </div>
        ) : pendingRequests.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <svg className="w-12 h-12 text-gray-300 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-base font-semibold text-gray-900">No pending join requests</p>
            <p className="text-xs text-gray-500">All membership requests have been reviewed.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="p-5 hover:bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center overflow-hidden flex-shrink-0">
                    {req.user.profilePicture ? (
                      <img src={req.user.profilePicture} alt="" className="w-full h-full object-cover" />
                    ) : (
                      req.user.fullName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-base">{req.user.fullName}</div>
                    {req.user.userName && (
                      <div className="text-xs text-gray-500">@{req.user.userName}</div>
                    )}
                    {req.message && (
                      <div className="mt-2 text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-gray-700 italic">
                        &quot;{req.message}&quot;
                      </div>
                    )}
                    <div className="text-xs text-gray-400 mt-1">
                      Requested on {new Date(req.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleReject(req.id)}
                    disabled={isRejecting}
                    className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl text-xs transition-colors shadow-sm"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApprove(req.id)}
                    disabled={isApproving}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-colors shadow-sm"
                  >
                    Approve Member
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Requests History */}
      {pastRequests.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-bold text-gray-900 text-base">Request History · {pastRequests.length}</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {pastRequests.map((req) => (
              <div key={req.id} className="p-4 flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium text-gray-900">{req.user?.fullName}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      req.status === 'APPROVED'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
