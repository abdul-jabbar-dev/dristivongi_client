'use client';
import React, { useState } from 'react';
import { useRemoveMemberMutation } from '@/redux/feature/organization/organizationApi';
import { OrganizationMemberDTO } from '@/redux/feature/organization/organization.types';

interface RemoveMemberModalProps {
  member: OrganizationMemberDTO;
  orgIdOrSlug: string;
  onClose: () => void;
}

export default function RemoveMemberModal({
  member,
  orgIdOrSlug,
  onClose,
}: RemoveMemberModalProps) {
  const [errorMsg, setErrorMsg] = useState('');
  const [removeMember, { isLoading }] = useRemoveMemberMutation();

  const handleConfirm = async () => {
    try {
      await removeMember({
        idOrSlug: orgIdOrSlug,
        memberId: member.id,
      }).unwrap();

      onClose();
    } catch (err: any) {
      setErrorMsg(err?.data?.message || err?.message || 'Failed to remove member');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-150">
        <div className="p-6">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-1">
            Remove {member.user.fullName}?
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Are you sure you want to remove this member from the organization? They will lose access to
            all private organization discussions, restricted cases, and management tools.
          </p>

          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 mb-4">
              {errorMsg}
            </div>
          )}
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
            onClick={handleConfirm}
            disabled={isLoading}
            className="px-5 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl transition-colors shadow-sm"
          >
            {isLoading ? 'Removing...' : 'Remove Member'}
          </button>
        </div>
      </div>
    </div>
  );
}
