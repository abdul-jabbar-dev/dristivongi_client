'use client';
import React, { useState } from 'react';
import { useUpdateMemberRoleMutation } from '@/redux/feature/organization/organizationApi';
import { OrganizationMemberDTO, OrganizationRole } from '@/redux/feature/organization/organization.types';

interface ChangeRoleModalProps {
  member: OrganizationMemberDTO;
  orgIdOrSlug: string;
  isOwner?: boolean;
  onClose: () => void;
}

export default function ChangeRoleModal({
  member,
  orgIdOrSlug,
  isOwner,
  onClose,
}: ChangeRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState<OrganizationRole>(member.role);
  const [errorMsg, setErrorMsg] = useState('');
  const [updateRole, { isLoading }] = useUpdateMemberRoleMutation();

  const handleSave = async () => {
    if (selectedRole === member.role) {
      onClose();
      return;
    }

    try {
      await updateRole({
        idOrSlug: orgIdOrSlug,
        memberId: member.id,
        role: selectedRole,
      }).unwrap();

      onClose();
    } catch (err: any) {
      setErrorMsg(err?.data?.message || err?.message || 'Failed to update role');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Change Member Role</h3>
            <p className="text-xs text-gray-500">Update permissions for {member.user.fullName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100">
              {errorMsg}
            </div>
          )}

          <div className="space-y-2">
            {isOwner && (
              <label
                onClick={() => setSelectedRole('ADMIN')}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedRole === 'ADMIN'
                    ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  checked={selectedRole === 'ADMIN'}
                  onChange={() => setSelectedRole('ADMIN')}
                  className="mt-1 text-blue-600"
                />
                <div>
                  <div className="font-semibold text-sm text-gray-900">Admin</div>
                  <div className="text-xs text-gray-500">
                    Can manage members, invite, moderate, approve requests, and manage Cases.
                  </div>
                </div>
              </label>
            )}

            <label
              onClick={() => setSelectedRole('MODERATOR')}
              className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                selectedRole === 'MODERATOR'
                  ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="role"
                checked={selectedRole === 'MODERATOR'}
                onChange={() => setSelectedRole('MODERATOR')}
                className="mt-1 text-blue-600"
              />
              <div>
                <div className="font-semibold text-sm text-gray-900">Moderator</div>
                <div className="text-xs text-gray-500">
                  Can review join requests, moderate discussions, and restrict members.
                </div>
              </div>
            </label>

            <label
              onClick={() => setSelectedRole('REPRESENTATIVE')}
              className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                selectedRole === 'REPRESENTATIVE'
                  ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="role"
                checked={selectedRole === 'REPRESENTATIVE'}
                onChange={() => setSelectedRole('REPRESENTATIVE')}
                className="mt-1 text-blue-600"
              />
              <div>
                <div className="font-semibold text-sm text-gray-900">Representative</div>
                <div className="text-xs text-gray-500">
                  Official spokesperson allowed to submit verified official responses.
                </div>
              </div>
            </label>

            <label
              onClick={() => setSelectedRole('MEMBER')}
              className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                selectedRole === 'MEMBER'
                  ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="role"
                checked={selectedRole === 'MEMBER'}
                onChange={() => setSelectedRole('MEMBER')}
                className="mt-1 text-blue-600"
              />
              <div>
                <div className="font-semibold text-sm text-gray-900">Member</div>
                <div className="text-xs text-gray-500">
                  Standard member with ability to view, create cases, add evidence, and participate.
                </div>
              </div>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading}
            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-colors shadow-sm"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
