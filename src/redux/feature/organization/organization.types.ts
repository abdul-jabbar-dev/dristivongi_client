export type OrganizationVisibility = 'PUBLIC' | 'PRIVATE';
export type OrganizationVerificationStatus = 'UNVERIFIED' | 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';
export type OrganizationStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
export type OrganizationRole = 'OWNER' | 'ADMIN' | 'REPRESENTATIVE' | 'MEMBER';
export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED';

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

export interface OrganizationMembershipDTO {
  id: string;
  organizationId: string;
  userId: string;
  role: OrganizationRole;
  createdAt: string;
  organization: PublicOrganizationDTO;
  user?: {
    id: string;
    fullName: string;
    userName: string;
    profilePicture: string | null;
  };
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
}

export interface PaginatedApiSuccessResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}
