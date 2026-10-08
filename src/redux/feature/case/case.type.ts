export type TUser = {
  id: string;
  fullName?: string | null;
  userName?: string | null;
  avatar?: string;
  userProfile?: { profilePicture?: string | null; bio?: string | null } | null;
};

export type TMedia = {
  id: string;
  url: string;
  type: string;
};

export type TCaseMedia = {
  media: TMedia;
  order: number;
};

export type TSource = {
  id: string;
  title: string;
  description: string;
  sourceLocation: string;
  sourceDate: string | null;
  externalSourceType: string;
  externalSourceName: string;
  externalLinks: string[];
};

export type TEvidence = {
  id: string;
  title: string;
  description: string;
  type: string;
  submittedBy: string;
  medias: { media: TMedia; order: number }[];
};

export type TClaimEvidence = {
  evidence: TEvidence;
  relationship: "SUPPORTS" | "CHALLENGES" | "CONTEXT";
};

export type TClaimSource = {
  source: TSource;
  relationship: "SUPPORTS" | "CHALLENGES" | "CONTEXT";
};

export type TClaimState =
  | 'PROPOSED'
  | 'SUPPORTED'
  | 'PARTIALLY_SUPPORTED'
  | 'INSUFFICIENT_EVIDENCE'
  | 'CHALLENGED'
  | 'CONTRADICTED'
  | 'DISPUTED'
  | 'WITHDRAWN'
  | 'SUPERSEDED';

export type TClaimUpdateType =
  | 'GENERAL_UPDATE'
  | 'INFORMATION_ADDED'
  | 'EVIDENCE_ADDED'
  | 'SOURCE_ADDED'
  | 'STATE_CHANGED'
  | 'CLAIM_REVISED'
  | 'CLAIM_CLARIFIED'
  | 'CHALLENGED'
  | 'WITHDRAWN'
  | 'SUPERSEDED';

export type TClaimUpdate = {
  id: string;
  claimId: string;
  content: string;
  previousState: TClaimState | null;
  newState: TClaimState | null;
  updateType: TClaimUpdateType;
  createdBy?: string;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
  author: TUser;
  evidence?: { evidence: TEvidence }[];
  sources?: { source: TSource }[];
};

export type TClaimUpdatePermissions = {
  canAddUpdate: boolean;
  isDirectCaseClaim: boolean;
  claimId: string;
  currentState: TClaimState;
};

export type TClaim = {
  id: string;
  title: string;
  statement: string;
  statementHtml?: string;
  claimType: string;
  createdAt: string;
  currentState?: TClaimState;
  medias?: TCaseMedia[];
  evidence?: TClaimEvidence[];
  sources?: TClaimSource[];
  assessments?: any[];
  discussions?: any[];
  creator?: TUser;
  _count?: {
    evidence: number;
    sources: number;
  };
};

export type TCaseType = {
  id: string;
  title: string;
  titleHtml?: string;
  location: string;
  caseStatus: string;
  createdAt: string;
  updatedAt: string;
  author: TUser;
  claims: TClaim[];
  medias?: TCaseMedia[];
  discussions?: any[];
  tags?: {
    tag: {
      id: string;
      name: string;
      normalizedName: string;
    };
  }[];
  _count?: {
    claims: number;
    discussions: number;
  };
  settings?: {
    canUserCreateClaim: boolean;
    canUserCreateClaimEvidence: boolean;
    canUserCreateClaimUpdate: boolean;
  };
  reaction?: {
    support: number;
    oppose: number;
    total: number;
    currentUserReaction: "SUPPORT" | "OPPOSE" | null;
  };
  stats?: {
    supportCount: number;
    opposeCount: number;
    claimCount?: number;
    discussionCount?: number;
    evidenceCount?: number;
    sourceCount?: number;
  };
};
