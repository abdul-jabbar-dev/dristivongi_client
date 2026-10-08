'use client';
import React, { useState } from 'react';
import { useGetOrgInvitationsQuery, useInviteMemberMutation } from '@/redux/feature/organization/organizationApi';

export default function OrgDashboardInvitations({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { data, isLoading } = useGetOrgInvitationsQuery(id);
  const [inviteMember, { isLoading: isInviting }] = useInviteMemberMutation();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('MEMBER');

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await inviteMember({ idOrSlug: id, emailOrUsername: email, role }).unwrap();
      setEmail('');
      alert('Invitation sent successfully.');
    } catch (err) {
      alert('Failed to send invitation.');
    }
  };

  if (isLoading) return <div className="p-8">Loading invitations...</div>;

  const invitations = data?.data || [];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Invitations</h1>
      
      <div className="bg-white border rounded-xl p-6 shadow-sm mb-8">
        <h2 className="text-lg font-bold mb-4">Invite New Member</h2>
        <form onSubmit={handleInvite} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Email Address</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select value={role} onChange={e => setRole(e.target.value)} className="w-full p-2 border rounded-md">
              <option value="ADMIN">Admin</option>
              <option value="REPRESENTATIVE">Representative</option>
              <option value="MEMBER">Member</option>
            </select>
          </div>
          <button disabled={isInviting} type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
            {isInviting ? 'Sending...' : 'Send Invite'}
          </button>
        </form>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <h2 className="text-lg font-bold p-6 border-b">Pending Invitations</h2>
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4">Expires</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invitations.map((inv: any) => (
              <tr key={inv.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-4">{inv.email}</td>
                <td className="p-4"><span className="text-xs font-semibold">{inv.role}</span></td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${inv.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100'}`}>
                    {inv.status}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-500">{new Date(inv.expiresAt).toLocaleDateString()}</td>
                <td className="p-4">
                  {inv.status === 'PENDING' && <button className="text-red-500 text-sm hover:underline">Cancel</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {invitations.length === 0 && <p className="text-center p-8 text-gray-500">No pending invitations.</p>}
      </div>
    </div>
  );
}
