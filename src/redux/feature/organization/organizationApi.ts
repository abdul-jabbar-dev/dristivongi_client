import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../baseQueryWithReauth';
import {
  ApiSuccessResponse,
  PaginatedApiSuccessResponse,
  PublicOrganizationDTO,
  OwnerOrganizationDTO,
  OrganizationMembershipDTO,
  OrganizationMemberDTO,
  OrganizationMemberStatsDTO,
  OrganizationInvitationDTO,
  OrganizationJoinRequestDTO,
  CandidateUserDTO,
} from './organization.types';

export const organizationApi = createApi({
  reducerPath: 'organizationApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Organization',
    'MyOrganizations',
    'OrgMembers',
    'OrgStats',
    'OrgAdmins',
    'OrgContributors',
    'OrgInvitations',
    'OrgRequests',
    'OrgVerification',
  ],
  endpoints: (builder) => ({
    getOrganizations: builder.query<
      PaginatedApiSuccessResponse<PublicOrganizationDTO>,
      { search?: string; type?: string; limit?: number; page?: number }
    >({
      query: (params) => ({ url: '/organizations', params }),
      providesTags: ['Organization'],
    }),

    getOrganizationBySlug: builder.query<ApiSuccessResponse<any>, string>({
      query: (slug) => `/organizations/slug/${slug}/context`,
      providesTags: ['Organization'],
    }),

    getOrganizationById: builder.query<ApiSuccessResponse<OwnerOrganizationDTO>, string>({
      query: (id) => `/organizations/${id}`,
      providesTags: ['Organization'],
    }),

    getOrganizationFeed: builder.query<ApiSuccessResponse<any>, { slug: string; cursor?: string }>({
      query: ({ slug, cursor }) => ({
        url: `/organizations/slug/${slug}/feed`,
        params: cursor ? { cursor } : undefined,
      }),
      providesTags: ['Organization'],
    }),

    getMyOrganizations: builder.query<ApiSuccessResponse<OrganizationMembershipDTO[]>, void>({
      query: () => '/organizations/me/memberships',
      providesTags: ['MyOrganizations'],
    }),

    createOrganization: builder.mutation<ApiSuccessResponse<OwnerOrganizationDTO>, any>({
      query: (data) => ({ url: '/organizations', method: 'POST', body: data }),
      invalidatesTags: ['MyOrganizations', 'Organization'],
    }),

    updateOrganization: builder.mutation<ApiSuccessResponse<OwnerOrganizationDTO>, { id: string; data: any }>({
      query: ({ id, data }) => ({ url: `/organizations/${id}`, method: 'PATCH', body: data }),
      invalidatesTags: ['MyOrganizations', 'Organization'],
    }),

    // ==========================================
    // PEOPLE / MEMBERS & STATS ENDPOINTS
    // ==========================================

    getOrgMembers: builder.query<
      ApiSuccessResponse<OrganizationMemberDTO[]>,
      {
        idOrSlug: string;
        search?: string;
        role?: string;
        tab?: string;
        moderationStatus?: string;
        page?: number;
        limit?: number;
      }
    >({
      query: ({ idOrSlug, ...params }) => ({
        url: `/organizations/${idOrSlug}/members`,
        params,
      }),
      providesTags: ['OrgMembers'],
    }),

    getOrgMemberStats: builder.query<ApiSuccessResponse<OrganizationMemberStatsDTO>, string>({
      query: (idOrSlug) => `/organizations/${idOrSlug}/member-stats`,
      providesTags: ['OrgStats', 'OrgMembers', 'OrgRequests', 'OrgInvitations'],
    }),

    getOrgAdminsModerators: builder.query<ApiSuccessResponse<OrganizationMemberDTO[]>, string>({
      query: (idOrSlug) => `/organizations/${idOrSlug}/admins-moderators`,
      providesTags: ['OrgAdmins', 'OrgMembers'],
    }),

    getOrgContributors: builder.query<
      ApiSuccessResponse<OrganizationMemberDTO[]>,
      { idOrSlug: string; limit?: number }
    >({
      query: ({ idOrSlug, limit = 10 }) => ({
        url: `/organizations/${idOrSlug}/contributors`,
        params: { limit },
      }),
      providesTags: ['OrgContributors', 'OrgMembers'],
    }),

    searchCandidateUsers: builder.query<
      ApiSuccessResponse<CandidateUserDTO[]>,
      { idOrSlug: string; search: string }
    >({
      query: ({ idOrSlug, search }) => ({
        url: `/organizations/${idOrSlug}/candidate-users`,
        params: { q: search },
      }),
    }),

    // ==========================================
    // JOIN & LEAVE MUTATIONS
    // ==========================================

    joinOrganization: builder.mutation<ApiSuccessResponse<any>, string>({
      query: (idOrSlug) => ({
        url: `/organizations/${idOrSlug}/join`,
        method: 'POST',
      }),
      invalidatesTags: ['Organization', 'MyOrganizations', 'OrgMembers', 'OrgStats'],
    }),

    leaveOrganization: builder.mutation<ApiSuccessResponse<any>, string>({
      query: (idOrSlug) => ({
        url: `/organizations/${idOrSlug}/leave`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Organization', 'MyOrganizations', 'OrgMembers', 'OrgStats'],
    }),

    // ==========================================
    // INVITATIONS ENDPOINTS
    // ==========================================

    inviteMember: builder.mutation<
      ApiSuccessResponse<any>,
      { idOrSlug: string; emailOrUsername: string; role?: string }
    >({
      query: ({ idOrSlug, emailOrUsername, role }) => ({
        url: `/organizations/${idOrSlug}/invitations`,
        method: 'POST',
        body: { emailOrUsername, role },
      }),
      invalidatesTags: ['OrgInvitations', 'OrgStats'],
    }),

    getOrgInvitations: builder.query<ApiSuccessResponse<OrganizationInvitationDTO[]>, string>({
      query: (idOrSlug) => `/organizations/${idOrSlug}/invitations`,
      providesTags: ['OrgInvitations'],
    }),

    getMyInvitations: builder.query<ApiSuccessResponse<OrganizationInvitationDTO[]>, void>({
      query: () => '/organizations/me/invitations',
      providesTags: ['OrgInvitations'],
    }),

    acceptInvitation: builder.mutation<ApiSuccessResponse<any>, string>({
      query: (invitationId) => ({
        url: `/organizations/invitations/${invitationId}/accept`,
        method: 'POST',
      }),
      invalidatesTags: ['OrgInvitations', 'MyOrganizations', 'Organization', 'OrgMembers', 'OrgStats'],
    }),

    declineInvitation: builder.mutation<ApiSuccessResponse<any>, string>({
      query: (invitationId) => ({
        url: `/organizations/invitations/${invitationId}/decline`,
        method: 'POST',
      }),
      invalidatesTags: ['OrgInvitations', 'OrgStats'],
    }),

    cancelInvitation: builder.mutation<ApiSuccessResponse<any>, { idOrSlug: string; invitationId: string }>({
      query: ({ idOrSlug, invitationId }) => ({
        url: `/organizations/${idOrSlug}/invitations/${invitationId}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: ['OrgInvitations', 'OrgStats'],
    }),

    // ==========================================
    // JOIN REQUESTS ENDPOINTS
    // ==========================================

    requestToJoin: builder.mutation<ApiSuccessResponse<any>, { idOrSlug: string; message?: string }>({
      query: ({ idOrSlug, message }) => ({
        url: `/organizations/${idOrSlug}/join-requests`,
        method: 'POST',
        body: { message },
      }),
      invalidatesTags: ['Organization', 'OrgRequests', 'OrgStats'],
    }),

    getOrgJoinRequests: builder.query<ApiSuccessResponse<OrganizationJoinRequestDTO[]>, string>({
      query: (idOrSlug) => `/organizations/${idOrSlug}/join-requests`,
      providesTags: ['OrgRequests'],
    }),

    approveJoinRequest: builder.mutation<ApiSuccessResponse<any>, { idOrSlug: string; requestId: string }>({
      query: ({ idOrSlug, requestId }) => ({
        url: `/organizations/${idOrSlug}/join-requests/${requestId}/approve`,
        method: 'POST',
      }),
      invalidatesTags: ['OrgRequests', 'OrgMembers', 'OrgStats', 'Organization'],
    }),

    rejectJoinRequest: builder.mutation<
      ApiSuccessResponse<any>,
      { idOrSlug: string; requestId: string; reason?: string }
    >({
      query: ({ idOrSlug, requestId, reason }) => ({
        url: `/organizations/${idOrSlug}/join-requests/${requestId}/reject`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['OrgRequests', 'OrgStats'],
    }),

    // ==========================================
    // MEMBER MANAGEMENT & MODERATION
    // ==========================================

    updateMemberRole: builder.mutation<
      ApiSuccessResponse<any>,
      { idOrSlug: string; memberId: string; role: string }
    >({
      query: ({ idOrSlug, memberId, role }) => ({
        url: `/organizations/${idOrSlug}/members/${memberId}/role`,
        method: 'PATCH',
        body: { role },
      }),
      invalidatesTags: ['OrgMembers', 'OrgAdmins', 'OrgStats', 'Organization'],
    }),

    removeMember: builder.mutation<ApiSuccessResponse<any>, { idOrSlug: string; memberId: string }>({
      query: ({ idOrSlug, memberId }) => ({
        url: `/organizations/${idOrSlug}/members/${memberId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['OrgMembers', 'OrgAdmins', 'OrgContributors', 'OrgStats', 'Organization'],
    }),

    moderateMember: builder.mutation<
      ApiSuccessResponse<any>,
      { idOrSlug: string; memberId: string; action: 'RESTRICT' | 'SUSPEND' | 'BAN' | 'UNRESTRICT'; reason?: string }
    >({
      query: ({ idOrSlug, memberId, action, reason }) => ({
        url: `/organizations/${idOrSlug}/members/${memberId}/moderation`,
        method: 'PATCH',
        body: { action, reason },
      }),
      invalidatesTags: ['OrgMembers', 'OrgAdmins', 'OrgStats'],
    }),

    // Admin & Verification endpoints
    getAdminOrganizations: builder.query<PaginatedApiSuccessResponse<OwnerOrganizationDTO>, any>({
      query: (params) => ({ url: '/admin/organizations', params }),
      providesTags: ['Organization'],
    }),
    reviewOrganization: builder.mutation<ApiSuccessResponse<any>, { id: string; action: string; reason?: string }>({
      query: ({ id, action, reason }) => ({ url: `/admin/organizations/${id}/review`, method: 'POST', body: { action, reason } }),
      invalidatesTags: ['Organization', 'MyOrganizations'],
    }),
    submitVerification: builder.mutation<ApiSuccessResponse<any>, { id: string; documentUrls: string[] }>({
      query: ({ id, documentUrls }) => ({ url: `/organizations/${id}/verification`, method: 'POST', body: { documentUrls } }),
      invalidatesTags: ['Organization', 'OrgVerification'],
    }),
  }),
});

export const {
  useGetOrganizationsQuery,
  useGetOrganizationBySlugQuery,
  useGetOrganizationFeedQuery,
  useGetOrganizationByIdQuery,
  useGetMyOrganizationsQuery,
  useCreateOrganizationMutation,
  useUpdateOrganizationMutation,

  // People & Stats hooks
  useGetOrgMembersQuery,
  useGetOrgMemberStatsQuery,
  useGetOrgAdminsModeratorsQuery,
  useGetOrgContributorsQuery,
  useLazySearchCandidateUsersQuery,

  // Join & Leave hooks
  useJoinOrganizationMutation,
  useLeaveOrganizationMutation,

  // Invitations hooks
  useInviteMemberMutation,
  useGetOrgInvitationsQuery,
  useGetMyInvitationsQuery,
  useAcceptInvitationMutation,
  useDeclineInvitationMutation,
  useCancelInvitationMutation,

  // Join Requests hooks
  useRequestToJoinMutation,
  useGetOrgJoinRequestsQuery,
  useApproveJoinRequestMutation,
  useRejectJoinRequestMutation,

  // Management & Moderation hooks
  useUpdateMemberRoleMutation,
  useRemoveMemberMutation,
  useModerateMemberMutation,

  // Admin & Verification hooks
  useGetAdminOrganizationsQuery,
  useReviewOrganizationMutation,
  useSubmitVerificationMutation,
} = organizationApi;
