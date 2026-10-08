'use client';
import React, { useState, useEffect } from 'react';
import {
  useInviteMemberMutation,
  useLazySearchCandidateUsersQuery,
} from '@/redux/feature/organization/organizationApi';
import { OrganizationRole } from '@/redux/feature/organization/organization.types';

interface InvitePeopleModalProps {
  orgIdOrSlug: string;
  isOwner?: boolean;
  isAdmin?: boolean;
  onClose: () => void;
}

export default function InvitePeopleModal({
  orgIdOrSlug,
  isOwner,
  isAdmin,
  onClose,
}: InvitePeopleModalProps) {
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<OrganizationRole>('MEMBER');
  const [selectedUserEmailOrUsername, setSelectedUserEmailOrUsername] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [triggerSearch, { data: candidateData, isFetching: isSearching }] =
    useLazySearchCandidateUsersQuery();
  const [inviteMember, { isLoading: isInviting }] = useInviteMemberMutation();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search.trim().length >= 2) {
        triggerSearch({ idOrSlug: orgIdOrSlug, search: search.trim() });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search, orgIdOrSlug, triggerSearch]);

  const candidates = candidateData?.data || [];

  const handleSendInvite = async (emailOrUsernameToUse?: string) => {
    const target = (emailOrUsernameToUse || selectedUserEmailOrUsername || search).trim();
    if (!target) {
      setErrorMsg('Please enter an email or username');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');

    try {
      await inviteMember({
        idOrSlug: orgIdOrSlug,
        emailOrUsername: target,
        role: selectedRole,
      }).unwrap();

      setSuccessMsg(`Invitation sent to ${target}!`);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err?.data?.message || err?.message || 'Failed to send invitation');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Invite People to Organization</h3>
            <p className="text-xs text-gray-500">Send an invitation link or add verified platform members</p>
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

        {/* Content */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-green-50 text-green-700 text-sm rounded-xl border border-green-100">
              {successMsg}
            </div>
          )}

          {/* Search Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Find People by Name, Username or Email
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. john@example.com or @username"
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
            </div>
          </div>

          {/* Candidate results */}
          {search.trim().length >= 2 && (
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar border rounded-xl p-2 bg-gray-50/50">
              {isSearching && <p className="text-xs text-gray-500 text-center py-2">Searching members...</p>}
              {!isSearching && candidates.length === 0 && (
                <p className="text-xs text-gray-500 text-center py-2">
                  No existing user found with &quot;{search}&quot;. You can still send an invitation by email.
                </p>
              )}
              {candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-100 hover:border-blue-200 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs overflow-hidden flex-shrink-0">
                      {candidate.profilePicture ? (
                        <img src={candidate.profilePicture} alt="" className="w-full h-full object-cover" />
                      ) : (
                        candidate.fullName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{candidate.fullName}</p>
                      {candidate.userName && (
                        <p className="text-xs text-gray-500 truncate">@{candidate.userName}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    {candidate.isMember ? (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-medium">
                        Already Member ({candidate.memberRole})
                      </span>
                    ) : candidate.isPendingInvite ? (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-md font-medium">
                        Invite Pending
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSendInvite(candidate.userName || candidate.fullName)}
                        disabled={isInviting}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        Invite
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Role selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Assigned Organization Role
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRole('MEMBER')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedRole === 'MEMBER'
                    ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="font-semibold text-sm text-gray-900">Member</div>
                <div className="text-xs text-gray-500 mt-0.5">View and contribute</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('MODERATOR')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedRole === 'MODERATOR'
                    ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="font-semibold text-sm text-gray-900">Moderator</div>
                <div className="text-xs text-gray-500 mt-0.5">Review & moderate</div>
              </button>

              {isOwner && (
                <button
                  type="button"
                  onClick={() => setSelectedRole('ADMIN')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedRole === 'ADMIN'
                      ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-semibold text-sm text-gray-900">Admin</div>
                  <div className="text-xs text-gray-500 mt-0.5">Full management</div>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
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
            onClick={() => handleSendInvite()}
            disabled={isInviting || !search.trim()}
            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors shadow-sm"
          >
            {isInviting ? 'Sending...' : 'Send Invitation'}
          </button>
        </div>
      </div>
    </div>
  );
}
