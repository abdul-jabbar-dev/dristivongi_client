import { OrganizationRole, MembershipModerationStatus } from '@/redux/feature/organization/organization.types';

export type OrganizationPermission =
  | 'viewOrganization'
  | 'viewMembers'
  | 'joinOrganization'
  | 'leaveOrganization'
  | 'inviteMembers'
  | 'addMembers'
  | 'approveJoinRequests'
  | 'rejectJoinRequests'
  | 'manageMembers'
  | 'changeMemberRoles'
  | 'removeMembers'
  | 'moderateMembers'
  | 'manageCases'
  | 'createCases'
  | 'contribute'
  | 'manageMedia'
  | 'manageFiles'
  | 'manageSettings';

export interface ViewerContext {
  isAuthenticated?: boolean;
  isMember?: boolean;
  membershipId?: string | null;
  role?: OrganizationRole | null;
  moderationStatus?: MembershipModerationStatus | null;
  isOwner?: boolean;
  isAdmin?: boolean;
  isModerator?: boolean;
  permissions?: Record<OrganizationPermission, boolean>;
}

export const getOrganizationPermissions = (
  viewer?: ViewerContext | null,
  isPublicOrg: boolean = true
): Record<OrganizationPermission, boolean> => {
  const role = viewer?.role;
  const modStatus = viewer?.moderationStatus || 'ACTIVE';
  const isBanned = modStatus === 'BANNED';
  const isRestricted = modStatus === 'RESTRICTED' || modStatus === 'SUSPENDED';

  if (!role || isBanned) {
    return {
      viewOrganization: isPublicOrg && !isBanned,
      viewMembers: isPublicOrg && !isBanned,
      joinOrganization: !role && !isBanned,
      leaveOrganization: false,
      inviteMembers: false,
      addMembers: false,
      approveJoinRequests: false,
      rejectJoinRequests: false,
      manageMembers: false,
      changeMemberRoles: false,
      removeMembers: false,
      moderateMembers: false,
      manageCases: false,
      createCases: false,
      contribute: false,
      manageMedia: false,
      manageFiles: false,
      manageSettings: false,
    };
  }

  const canContribute = !isRestricted;

  switch (role) {
    case 'OWNER':
      return {
        viewOrganization: true,
        viewMembers: true,
        joinOrganization: false,
        leaveOrganization: true,
        inviteMembers: true,
        addMembers: true,
        approveJoinRequests: true,
        rejectJoinRequests: true,
        manageMembers: true,
        changeMemberRoles: true,
        removeMembers: true,
        moderateMembers: true,
        manageCases: true,
        createCases: true,
        contribute: true,
        manageMedia: true,
        manageFiles: true,
        manageSettings: true,
      };

    case 'ADMIN':
      return {
        viewOrganization: true,
        viewMembers: true,
        joinOrganization: false,
        leaveOrganization: true,
        inviteMembers: true,
        addMembers: true,
        approveJoinRequests: true,
        rejectJoinRequests: true,
        manageMembers: true,
        changeMemberRoles: true,
        removeMembers: true,
        moderateMembers: true,
        manageCases: true,
        createCases: canContribute,
        contribute: canContribute,
        manageMedia: true,
        manageFiles: true,
        manageSettings: false,
      };

    case 'MODERATOR':
      return {
        viewOrganization: true,
        viewMembers: true,
        joinOrganization: false,
        leaveOrganization: true,
        inviteMembers: true,
        addMembers: false,
        approveJoinRequests: true,
        rejectJoinRequests: true,
        manageMembers: false,
        changeMemberRoles: false,
        removeMembers: false,
        moderateMembers: true,
        manageCases: false,
        createCases: canContribute,
        contribute: canContribute,
        manageMedia: false,
        manageFiles: false,
        manageSettings: false,
      };

    case 'REPRESENTATIVE':
    case 'MEMBER':
    default:
      return {
        viewOrganization: true,
        viewMembers: true,
        joinOrganization: false,
        leaveOrganization: true,
        inviteMembers: false,
        addMembers: false,
        approveJoinRequests: false,
        rejectJoinRequests: false,
        manageMembers: false,
        changeMemberRoles: false,
        removeMembers: false,
        moderateMembers: false,
        manageCases: false,
        createCases: canContribute,
        contribute: canContribute,
        manageMedia: false,
        manageFiles: false,
        manageSettings: false,
      };
  }
};

export const canManageTargetMember = (
  actorRole?: OrganizationRole | null,
  targetRole?: OrganizationRole | null
): boolean => {
  if (!actorRole || !targetRole) return false;
  if (actorRole === 'OWNER') {
    return targetRole !== 'OWNER'; // Owner can manage everyone else (transfer is separate)
  }
  if (actorRole === 'ADMIN') {
    return targetRole !== 'OWNER' && targetRole !== 'ADMIN';
  }
  return false;
};

export const canAssignRole = (
  actorRole?: OrganizationRole | null,
  targetNewRole?: OrganizationRole | null
): boolean => {
  if (!actorRole || !targetNewRole) return false;
  if (actorRole === 'OWNER') {
    return targetNewRole !== 'OWNER';
  }
  if (actorRole === 'ADMIN') {
    return targetNewRole === 'MODERATOR' || targetNewRole === 'REPRESENTATIVE' || targetNewRole === 'MEMBER';
  }
  return false;
};
