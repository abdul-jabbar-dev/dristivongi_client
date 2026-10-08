'use client';
import React, { useState } from 'react';
import { useGetAdminOrganizationsQuery, useReviewOrganizationMutation } from '../../../redux/feature/organization/organizationApi';
import { OrganizationVerificationBadge } from '../../../components/organization/OrganizationVerificationBadge';

export default function AdminOrganizations() {
  const [filter, setFilter] = useState('ALL');
  const { data, isLoading } = useGetAdminOrganizationsQuery({ filter });
  const [reviewOrg] = useReviewOrganizationMutation();

  if (isLoading) return <div className="p-8 max-w-6xl mx-auto animate-pulse h-screen bg-gray-100 rounded-xl"></div>;

  const handleAction = async (id: string, action: string) => {
    const reason = action === 'REJECT' ? prompt('Reason for rejection?') : undefined;
    if (action === 'REJECT' && !reason) return;
    
    try {
      await reviewOrg({ id, action, reason: reason || undefined }).unwrap();
      alert(`Organization ${action.toLowerCase()} successfully.`);
    } catch (err) {
      alert('Action failed');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin: Organizations</h1>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['ALL', 'PENDING_VERIFICATION', 'VERIFIED', 'REJECTED', 'SUSPENDED'].map(f => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${filter === f ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Organization</th>
              <th className="p-4">Type</th>
              <th className="p-4">Visibility</th>
              <th className="p-4">Verification</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.data?.map((org: any) => (
              <tr key={org.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-4">
                  <div className="font-bold">{org.name}</div>
                  <div className="text-xs text-gray-500">{org.slug}</div>
                </td>
                <td className="p-4 text-sm">{org.organizationType}</td>
                <td className="p-4"><span className="text-xs bg-gray-100 px-2 py-1 rounded">{org.visibility}</span></td>
                <td className="p-4"><OrganizationVerificationBadge status={org.verificationStatus} /></td>
                <td className="p-4">
                  {org.verificationStatus === 'PENDING_VERIFICATION' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleAction(org.id, 'APPROVE')} className="text-xs bg-green-600 text-white px-2 py-1 rounded">Approve</button>
                      <button onClick={() => handleAction(org.id, 'REJECT')} className="text-xs bg-red-600 text-white px-2 py-1 rounded">Reject</button>
                    </div>
                  )}
                  {org.verificationStatus === 'VERIFIED' && (
                     <button onClick={() => handleAction(org.id, 'SUSPEND')} className="text-xs border text-red-600 px-2 py-1 rounded hover:bg-red-50">Suspend</button>
                  )}
                  {org.verificationStatus === 'SUSPENDED' && (
                     <button onClick={() => handleAction(org.id, 'RESTORE')} className="text-xs border border-green-200 text-green-700 px-2 py-1 rounded hover:bg-green-50">Restore</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data?.data?.length === 0 && <p className="text-center p-8 text-gray-500">No organizations found for this filter.</p>}
      </div>
    </div>
  );
}
