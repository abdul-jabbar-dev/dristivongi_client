export type OrganizationVisibility = 'PUBLIC' | 'PRIVATE';
export type OrganizationVerificationStatus =
  | 'UNVERIFIED'
  | 'PENDING_VERIFICATION'
  | 'VERIFIED'
  | 'REJECTED'
  | 'SUSPENDED';
export type OrganizationStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
export type OrganizationRole = 'OWNER' | 'ADMIN' | 'MODERATOR' | 'REPRESENTATIVE' | 'MEMBER';
export type MembershipModerationStatus = 'ACTIVE' | 'RESTRICTED' | 'SUSPENDED' | 'BANNED';
export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED';
export type JoinRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface PublicOrganizationDTO {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  organizationType: string;
  visibility: OrganizationVisibility;
  verificationStatus: OrganizationVerificationStatus;
  status: OrganizationStatus;
  logoUrl: string | null;
  coverUrl: string | null;
  website: string | null;
  location: string | null;
  category?: string | null;
  _count?: {
    memberships?: number;
    officialResponses?: number;
  };
}

export interface MemberOrganizationDTO extends PublicOrganizationDTO {
  email: string | null;
  phone: string | null;
  address: string | null;
  createdAt: string;
}

export interface OwnerOrganizationDTO extends MemberOrganizationDTO {
  rejectionReason: string | null;
  suspensionReason: string | null;
}

export interface CivicContributionsSummary {
  total: number;
  cases: number;
  claims: number;
  evidence: number;
  sources: number;
  discussions: number;
}

export interface OrganizationMemberUser {
  id: string;
  fullName: string;
  userName: string | null;
  profilePicture: string | null;
  bio?: string | null;
  location?: string | null;
  accountCreated?: string;
}

export interface OrganizationMemberDTO {
  id: string;
  userId: string;
  role: OrganizationRole;
  moderationStatus?: MembershipModerationStatus;
  joinedAt: string;
  user: OrganizationMemberUser;
  contributions: CivicContributionsSummary;
}

export interface OrganizationMembershipDTO {
  id: string;
  organizationId: string;
  userId: string;
  role: OrganizationRole;
  moderationStatus?: MembershipModerationStatus;
  createdAt: string;
  organization: PublicOrganizationDTO;
  user?: OrganizationMemberUser;
}

export interface OrganizationMemberStatsDTO {
  totalMembers: number;
  adminsCount: number;
  moderatorsCount: number;
  contributorsCount: number;
  pendingRequestsCount: number;
  pendingInvitationsCount: number;
}

export interface OrganizationInvitationDTO {
  id: string;
  organizationId: string;
  email: string;
  invitedBy: string;
  role: OrganizationRole;
  status: InvitationStatus;
  expiresAt: string;
  createdAt: string;
  inviter?: {
    id: string;
    fullName: string;
    userName: string | null;
  };
  organization?: PublicOrganizationDTO;
}

export interface OrganizationJoinRequestDTO {
  id: string;
  organizationId: string;
  userId: string;
  status: JoinRequestStatus;
  message?: string | null;
  rejectionReason?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  user: OrganizationMemberUser;
  reviewer?: {
    id: string;
    fullName: string;
    userName: string | null;
  } | null;
}

export interface CandidateUserDTO {
  id: string;
  fullName: string;
  userName: string | null;
  profilePicture: string | null;
  isMember: boolean;
  memberRole: OrganizationRole | null;
  isPendingInvite: boolean;
  isPendingRequest: boolean;
}

export interface OfficialResponseDTO {
  id: string;
  organizationId: string;
  caseId: string;
  representativeId: string;
  content: string;
  createdAt: string;
  organization: PublicOrganizationDTO;
}

export interface ApiSuccessResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
  };
}

export interface PaginatedApiSuccessResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages?: number;
    hasNext?: boolean;
  };
}
