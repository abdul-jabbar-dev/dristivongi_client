import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../baseQueryWithReauth';

export interface FeedCaseAuthor {
  id: string;
  fullName: string;
  userName: string | null;
  userProfile?: {
    profilePicture?: string | null;
    bio?: string | null;
  } | null;
  isVerified?: boolean;
}

export interface FeedCaseOrganization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  visibility: string;
}

export interface FeedCaseOfficialResponse {
  id: string;
  organizationId: string;
  content: string;
  createdAt: string;
  organization?: {
    name: string;
    slug: string;
    logoUrl?: string | null;
  };
}

export interface FeedCaseItem {
  id: string;
  title: string;
  titleHtml?: string;
  location: string;
  caseStatus: string;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
  isAnonymous: boolean;
  author: FeedCaseAuthor;
  organization?: FeedCaseOrganization | null;
  stats: {
    supportCount: number;
    opposeCount: number;
    viewCount: number;
    discussionCount: number;
    evidenceCount: number;
    sourceCount: number;
    claimCount: number;
  };
  claims: Array<{
    id?: string;
    title: string;
    evidence?: Array<{
      evidence?: {
        medias?: Array<{ media: { url: string; type: string } }>;
      };
    }>;
  }>;
  medias?: Array<{ media: { url: string; type: string } }>;
  officialResponses?: FeedCaseOfficialResponse[];
  userInteractions?: {
    isFollowing: boolean;
    isSaved: boolean;
    isJoinedOrg: boolean;
    currentUserReaction?: 'SUPPORT' | 'OPPOSE' | null;
  };
}

export interface FeedItemDTO {
  case: FeedCaseItem;
  context: {
    reason: string;
    label: string;
    organizationName?: string | null;
  };
}

export interface FeedResponse {
  success: boolean;
  data: FeedItemDTO[];
  nextCursor?: string | null;
  hasMore: boolean;
  meta?: {
    totalCandidates: number;
    returnedCount: number;
    durationMs: number;
  };
}

export const feedApi = createApi({
  reducerPath: 'feedApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Feed', 'Case', 'MyOrganizations', 'Organization'],
  endpoints: (builder) => ({
    getPersonalizedFeed: builder.query<
      FeedResponse,
      { cursor?: string; page?: number; limit?: number; sort?: string; tag?: string; author?: string }
    >({
      query: (params) => ({
        url: '/feed',
        params,
      }),
      providesTags: ['Feed'],
    }),

    toggleFollowCase: builder.mutation<{ success: boolean; data: { following: boolean; message: string } }, string>({
      query: (caseId) => ({
        url: `/feed/cases/${caseId}/follow`,
        method: 'POST',
      }),
      invalidatesTags: ['Feed'],
    }),

    toggleSaveCase: builder.mutation<{ success: boolean; data: { saved: boolean; message: string } }, string>({
      query: (caseId) => ({
        url: `/feed/cases/${caseId}/save`,
        method: 'POST',
      }),
      invalidatesTags: ['Feed'],
    }),

    hideCase: builder.mutation<{ success: boolean; message: string }, string>({
      query: (caseId) => ({
        url: `/feed/cases/${caseId}/hide`,
        method: 'POST',
      }),
      invalidatesTags: ['Feed'],
    }),

    markNotInterested: builder.mutation<{ success: boolean; message: string }, string>({
      query: (caseId) => ({
        url: `/feed/cases/${caseId}/not-interested`,
        method: 'POST',
      }),
      invalidatesTags: ['Feed'],
    }),

    muteOrganization: builder.mutation<{ success: boolean; message: string }, string>({
      query: (organizationId) => ({
        url: `/feed/organizations/${organizationId}/mute`,
        method: 'POST',
      }),
      invalidatesTags: ['Feed'],
    }),

    toggleFollowOrganization: builder.mutation<{ success: boolean; data: { following: boolean; message: string } }, string>({
      query: (organizationId) => ({
        url: `/feed/organizations/${organizationId}/follow`,
        method: 'POST',
      }),
      invalidatesTags: ['Feed'],
    }),

    getSavedFeed: builder.query<{ success: boolean; data: FeedItemDTO[]; total: number; page: number; hasMore: boolean }, { page?: number; limit?: number } | void>({
      query: (params) => ({
        url: '/feed/saved',
        params: params || {},
      }),
      providesTags: ['Feed'],
    }),
  }),
});

export const {
  useGetPersonalizedFeedQuery,
  useLazyGetPersonalizedFeedQuery,
  useToggleFollowCaseMutation,
  useToggleSaveCaseMutation,
  useHideCaseMutation,
  useMarkNotInterestedMutation,
  useMuteOrganizationMutation,
  useToggleFollowOrganizationMutation,
  useGetSavedFeedQuery,
} = feedApi;
