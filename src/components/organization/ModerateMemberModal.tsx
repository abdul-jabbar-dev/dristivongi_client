'use client';
import React, { useState } from 'react';
import { useModerateMemberMutation } from '@/redux/feature/organization/organizationApi';
import { OrganizationMemberDTO } from '@/redux/feature/organization/organization.types';

interface ModerateMemberModalProps {
  member: OrganizationMemberDTO;
  orgIdOrSlug: string;
  onClose: () => void;
}

export default function ModerateMemberModal({
  member,
  orgIdOrSlug,
  onClose,
}: ModerateMemberModalProps) {
  const [action, setAction] = useState<'RESTRICT' | 'SUSPEND' | 'BAN' | 'UNRESTRICT'>('RESTRICT');
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [moderateMember, { isLoading }] = useModerateMemberMutation();

  const handleSave = async () => {
    try {
      await moderateMember({
        idOrSlug: orgIdOrSlug,
        memberId: member.id,
        action,
        reason: reason.trim() || undefined,
      }).unwrap();

      onClose();
    } catch (err: any) {
      setErrorMsg(err?.data?.message || err?.message || 'Failed to apply moderation action');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Moderate Member</h3>
            <p className="text-xs text-gray-500">Apply community safety actions for {member.user.fullName}</p>
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

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Select Action
            </label>
            <div className="space-y-2">
              <label
                onClick={() => setAction('RESTRICT')}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  action === 'RESTRICT'
                    ? 'border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/20'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="action"
                  checked={action === 'RESTRICT'}
                  onChange={() => setAction('RESTRICT')}
                  className="mt-1 text-amber-600"
                />
                <div>
                  <div className="font-semibold text-sm text-gray-900">Restrict Member</div>
                  <div className="text-xs text-gray-500">
                    Restricts creating new cases, adding evidence, and posting in discussions.
                  </div>
                </div>
              </label>

              <label
                onClick={() => setAction('SUSPEND')}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  action === 'SUSPEND'
                    ? 'border-orange-500 bg-orange-50/40 ring-2 ring-orange-500/20'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="action"
                  checked={action === 'SUSPEND'}
                  onChange={() => setAction('SUSPEND')}
                  className="mt-1 text-orange-600"
                />
                <div>
                  <div className="font-semibold text-sm text-gray-900">Suspend Participation</div>
                  <div className="text-xs text-gray-500">
                    Temporarily disables all organization contributions.
                  </div>
                </div>
              </label>

              <label
                onClick={() => setAction('BAN')}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  action === 'BAN'
                    ? 'border-red-500 bg-red-50/40 ring-2 ring-red-500/20'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="action"
                  checked={action === 'BAN'}
                  onChange={() => setAction('BAN')}
                  className="mt-1 text-red-600"
                />
                <div>
                  <div className="font-semibold text-sm text-gray-900">Ban from Organization</div>
                  <div className="text-xs text-gray-500">
                    Hides member and completely blocks access to this organization.
                  </div>
                </div>
              </label>

              {member.moderationStatus && member.moderationStatus !== 'ACTIVE' && (
                <label
                  onClick={() => setAction('UNRESTRICT')}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    action === 'UNRESTRICT'
                      ? 'border-green-500 bg-green-50/40 ring-2 ring-green-500/20'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="action"
                    checked={action === 'UNRESTRICT'}
                    onChange={() => setAction('UNRESTRICT')}
                    className="mt-1 text-green-600"
                  />
                  <div>
                    <div className="font-semibold text-sm text-gray-900">Restore / Unrestrict</div>
                    <div className="text-xs text-gray-500">
                      Returns member status to active with normal participation permissions.
                    </div>
                  </div>
                </label>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Reason (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Provide a brief explanation for this moderation action..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
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
            {isLoading ? 'Applying...' : 'Apply Action'}
          </button>
        </div>
      </div>
    </div>
  );
}
