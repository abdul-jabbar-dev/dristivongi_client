'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { OrganizationMemberDTO, OrganizationRole } from '@/redux/feature/organization/organization.types';
import { canManageTargetMember } from '@/lib/organizationPermissions';

interface OrganizationMemberRowProps {
  member: OrganizationMemberDTO;
  orgIdOrSlug: string;
  viewerRole?: OrganizationRole | null;
  viewerUserId?: string | null;
  isOwner?: boolean;
  isAdmin?: boolean;
  isModerator?: boolean;
  onOpenRoleModal?: (member: OrganizationMemberDTO) => void;
  onOpenRemoveModal?: (member: OrganizationMemberDTO) => void;
  onOpenModerateModal?: (member: OrganizationMemberDTO) => void;
}

export const getRoleBadge = (role: OrganizationRole) => {
  switch (role) {
    case 'OWNER':
      return {
        label: 'Owner',
        className: 'bg-amber-100 text-amber-800 border-amber-200',
      };
    case 'ADMIN':
      return {
        label: 'Admin',
        className: 'bg-blue-100 text-blue-800 border-blue-200',
      };
    case 'MODERATOR':
      return {
        label: 'Moderator',
        className: 'bg-purple-100 text-purple-800 border-purple-200',
      };
    case 'REPRESENTATIVE':
      return {
        label: 'Representative',
        className: 'bg-teal-100 text-teal-800 border-teal-200',
      };
    case 'MEMBER':
    default:
      return {
        label: 'Member',
        className: 'bg-gray-100 text-gray-700 border-gray-200',
      };
  }
};

export default function OrganizationMemberRow({
  member,
  orgIdOrSlug,
  viewerRole,
  viewerUserId,
  isOwner,
  isAdmin,
  isModerator,
  onOpenRoleModal,
  onOpenRemoveModal,
  onOpenModerateModal,
}: OrganizationMemberRowProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roleInfo = getRoleBadge(member.role);
  const isSelf = viewerUserId === member.userId;
  const canManageThisMember = !isSelf && canManageTargetMember(viewerRole, member.role);
  const canModerateThisMember =
    !isSelf &&
    (isOwner || isAdmin || isModerator) &&
    member.role !== 'OWNER' &&
    !(isModerator && member.role === 'ADMIN');

  const profileUrl = member.user.userName
    ? `/profile/${member.user.userName}`
    : `/profile/${member.user.id}`;

  const joinedDate = member.joinedAt
    ? new Date(member.joinedAt).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : null;

  // Format safe civic contributions summary
  const cont = member.contributions;
  const contributionParts: string[] = [];
  if (cont) {
    if (cont.cases > 0) contributionParts.push(`${cont.cases} Case${cont.cases > 1 ? 's' : ''}`);
    if (cont.evidence > 0) contributionParts.push(`${cont.evidence} Evidence`);
    if (cont.claims > 0) contributionParts.push(`${cont.claims} Claim${cont.claims > 1 ? 's' : ''}`);
    if (cont.sources > 0) contributionParts.push(`${cont.sources} Source${cont.sources > 1 ? 's' : ''}`);
    if (cont.discussions > 0) contributionParts.push(`${cont.discussions} Discussion${cont.discussions > 1 ? 's' : ''}`);
  }

  const handleCopyUsername = () => {
    if (member.user.userName) {
      navigator.clipboard.writeText(`@${member.user.userName}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 gap-3">
      {/* User Info & Avatar */}
      <div className="flex items-start sm:items-center gap-3.5 min-w-0">
        <Link href={profileUrl} className="relative flex-shrink-0 group">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg overflow-hidden ring-2 ring-transparent group-hover:ring-blue-400 transition-all">
            {member.user.profilePicture ? (
              <img
                src={member.user.profilePicture}
                alt={member.user.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              member.user.fullName.charAt(0).toUpperCase()
            )}
          </div>
          {member.role === 'OWNER' && (
            <span
              className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full p-0.5 shadow-sm"
              title="Organization Owner"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </span>
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={profileUrl}
              className="font-semibold text-gray-900 hover:text-blue-600 hover:underline transition-colors text-base truncate"
            >
              {member.user.fullName}
            </Link>
            {member.user.userName && (
              <span className="text-xs text-gray-500 truncate">@{member.user.userName}</span>
            )}
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${roleInfo.className}`}
            >
              {roleInfo.label}
            </span>
            {member.moderationStatus && member.moderationStatus !== 'ACTIVE' && (
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                  member.moderationStatus === 'RESTRICTED'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : member.moderationStatus === 'SUSPENDED'
                    ? 'bg-orange-50 text-orange-700 border-orange-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}
              >
                {member.moderationStatus.charAt(0) + member.moderationStatus.slice(1).toLowerCase()}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 mt-1">
            {joinedDate && <span>Joined {joinedDate}</span>}
            {contributionParts.length > 0 ? (
              <>
                <span className="text-gray-300">•</span>
                <span className="text-gray-700 font-medium">
                  {contributionParts.slice(0, 3).join(' · ')}
                </span>
              </>
            ) : (
              <>
                <span className="text-gray-300">•</span>
                <span className="text-gray-400">No public civic activity yet</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons & Dropdown */}
      <div className="flex items-center gap-2 self-end sm:self-center">
        <Link
          href={profileUrl}
          className="hidden sm:inline-flex items-center px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
        >
          View Profile
        </Link>

        {/* Action Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Member actions"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
              />
            </svg>
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-30 text-sm animate-in fade-in zoom-in-95 duration-100">
              <Link
                href={profileUrl}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                View Profile
              </Link>

              {member.user.userName && (
                <button
                  onClick={() => {
                    handleCopyUsername();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 text-left transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  {copied ? 'Copied Username!' : 'Copy Username'}
                </button>
              )}

              {/* Authorized Manager Actions */}
              {canManageThisMember && onOpenRoleModal && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenRoleModal(member);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 text-left transition-colors border-t border-gray-100"
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Change Role
                </button>
              )}

              {canModerateThisMember && onOpenModerateModal && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenModerateModal(member);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-amber-700 hover:bg-amber-50 text-left transition-colors"
                >
                  <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Moderate / Restrict
                </button>
              )}

              {canManageThisMember && onOpenRemoveModal && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenRemoveModal(member);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 text-left transition-colors"
                >
                  <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Remove from Group
                </button>
              )}

              {!canManageThisMember && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    alert('Report filed to organization moderators.');
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-gray-500 hover:bg-gray-50 text-left transition-colors border-t border-gray-100"
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                  </svg>
                  Report Member
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
