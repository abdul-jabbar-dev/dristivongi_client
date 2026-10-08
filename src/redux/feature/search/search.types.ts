export type SearchScope = 
  | 'all' 
  | 'cases' 
  | 'organizations' 
  | 'users' 
  | 'claims' 
  | 'evidence' 
  | 'sources' 
  | 'discussions';

export type SearchSortBy = 
  | 'relevance' 
  | 'recent' 
  | 'most_active' 
  | 'most_members';

export interface SearchFilterParams {
  q: string;
  scope?: SearchScope;
  location?: string;
  category?: string;
  status?: string;
  organizationId?: string;
  organizationType?: string;
  evidenceType?: string;
  sourceType?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: SearchSortBy;
  limit?: number;
  page?: number;
}

export interface UserSearchResult {
  id: string;
  fullName: string;
  userName: string | null;
  profilePicture: string | null;
  bio: string | null;
  location: string | null;
  organizationAffiliation?: {
    id: string;
    name: string;
    slug: string;
    role: string;
  } | null;
  url: string;
}

export interface OrganizationSearchResult {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  organizationType: string;
  verificationStatus: string;
  location: string | null;
  logoUrl: string | null;
  memberCount: number;
  caseCount: number;
  url: string;
}

export interface CaseSearchResult {
  id: string;
  title: string;
  titleHtml?: string;
  location: string;
  caseStatus: string;
  visibility: string;
  lastActivityAt: string;
  createdAt: string;
  isAnonymous: boolean;
  author: {
    id: string;
    name: string;
    userName: string | null;
    avatarUrl: string | null;
  };
  organization: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    verificationStatus?: string;
  } | null;
  stats: {
    claimsCount: number;
    evidenceCount: number;
    sourcesCount: number;
    discussionsCount: number;
    reactionsCount: number;
  };
  matchedContext?: {
    matchedClaim?: {
      id: string;
      title: string;
    } | null;
    matchedEvidence?: {
      id: string;
      title: string;
      type: string;
    } | null;
    matchedSource?: {
      id: string;
      title: string;
      publisher: string;
    } | null;
    matchedDiscussion?: {
      id: string;
      snippet: string;
    } | null;
  };
  url: string;
}

export interface ClaimSearchResult {
  id: string;
  title: string;
  claimType: string | null;
  claimStatus: string;
  createdAt: string;
  isAnonymous: boolean;
  parentCase: {
    id: string;
    title: string;
    location: string;
    organizationName?: string | null;
    url: string;
  };
  assessmentsCount: number;
  evidenceCount: number;
  url: string;
}

export interface EvidenceSearchResult {
  id: string;
  title: string;
  type: string;
  createdAt: string;
  isAnonymous: boolean;
  parentCase: {
    id: string;
    title: string;
    location: string;
    url: string;
  };
  relatedClaim?: {
    id: string;
    title: string;
  } | null;
  validationsCount: number;
  url: string;
}

export interface SourceSearchResult {
  id: string;
  title: string;
  publisher: string;
  sourceLocation: string;
  externalSourceType: string;
  externalLinks: string[];
  createdAt: string;
  parentCase: {
    id: string;
    title: string;
    url: string;
  };
  relatedClaim?: {
    id: string;
    title: string;
  } | null;
  url: string;
}

export interface DiscussionSearchResult {
  id: string;
  snippet: string;
  createdAt: string;
  isAnonymous: boolean;
  author: {
    name: string;
    avatarUrl: string | null;
  };
  parentCase: {
    id: string;
    title: string;
    url: string;
  };
  url: string;
}

export interface SearchGroupResult<T> {
  items: T[];
  total: number;
  hasMore: boolean;
}

export interface GlobalSearchResponse {
  query: string;
  normalizedQuery: string;
  scope: string;
  intent: {
    type: string;
    confidence: number;
  };
  results: {
    users: SearchGroupResult<UserSearchResult>;
    organizations: SearchGroupResult<OrganizationSearchResult>;
    cases: SearchGroupResult<CaseSearchResult>;
    claims: SearchGroupResult<ClaimSearchResult>;
    evidence: SearchGroupResult<EvidenceSearchResult>;
    sources: SearchGroupResult<SourceSearchResult>;
    discussions: SearchGroupResult<DiscussionSearchResult>;
  };
}

export interface SearchSuggestionItem {
  type: 'CASE' | 'ORGANIZATION' | 'USER' | 'CLAIM' | 'TOPIC';
  id: string;
  title: string;
  subtitle: string;
  image?: string | null;
  url: string;
}

export interface SearchSuggestionsResponse {
  query: string;
  items: SearchSuggestionItem[];
}
