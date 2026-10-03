export type TUser = {
  id: string;
  fullName: string;
  userName: string;
  avatar?: string;
  userProfile?: { profilePicture?: string };
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

export type TClaim = {
  id: string;
  title: string;
  statement: string;
  statementHtml?: string;
  claimType: string;
  createdAt: string;
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
};
