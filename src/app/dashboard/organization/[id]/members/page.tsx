'use client';
import React, { useState } from 'react';
import { useGetOrgMembersQuery, useUpdateMemberRoleMutation, useRemoveMemberMutation, useGetOrganizationByIdQuery } from '@/redux/feature/organization/organizationApi';
import { OrganizationRole } from '@/redux/feature/organization/organization.types';

export default function OrgDashboardMembers({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { data, isLoading } = useGetOrgMembersQuery(id);
  const { data: orgData } = useGetOrganizationByIdQuery(id);
  const [updateRole] = useUpdateMemberRoleMutation();
  const [removeMember] = useRemoveMemberMutation();
  const [searchTerm, setSearchTerm] = useState('');

  if (isLoading) return <div className="p-8">Loading members...</div>;

  const members = data?.data || [];
  const filtered = members.filter((m: any) => m.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleRoleChange = async (memberId: string, role: string) => {
    try {
      await updateRole({ id, memberId, role }).unwrap();
    } catch (err) {
      alert('Failed to update role');
    }
  };

  const handleRemove = async (memberId: string) => {
    if (window.confirm('Remove this member?')) {
      try {
        await removeMember({ id, memberId }).unwrap();
      } catch (err) {
        alert('Failed to remove member');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Members</h1>
        <input 
          type="text" 
          placeholder="Search members..." 
          className="p-2 border rounded-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">User</th>
              <th className="p-4">Role</th>
              <th className="p-4">Joined</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((member: any) => (
              <tr key={member.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden">
                    {member.user?.profilePicture && <img src={member.user.profilePicture} />}
                  </div>
                  <span className="font-medium">{member.user?.fullName || 'Unknown User'}</span>
                </td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-semibold">{member.role}</span>
                </td>
                <td className="p-4 text-gray-500 text-sm">{new Date(member.createdAt).toLocaleDateString()}</td>
                <td className="p-4">
                  <select 
                    value={member.role} 
                    onChange={(e) => handleRoleChange(member.id, e.target.value)}
                    className="p-1 border rounded mr-2 text-sm"
                  >
                    <option value="OWNER">Owner</option>
                    <option value="ADMIN">Admin</option>
                    <option value="REPRESENTATIVE">Representative</option>
                    <option value="MEMBER">Member</option>
                  </select>
                  <button onClick={() => handleRemove(member.id)} className="text-red-500 text-sm hover:underline">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center p-8 text-gray-500">No members found.</p>}
      </div>
    </div>
  );
}
