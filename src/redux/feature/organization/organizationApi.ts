import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../baseQueryWithReauth';
import {
  ApiSuccessResponse,
  PaginatedApiSuccessResponse,
  PublicOrganizationDTO,
  OwnerOrganizationDTO,
  OrganizationMembershipDTO,
  OrganizationInvitationDTO,
} from './organization.types';

export const organizationApi = createApi({
  reducerPath: 'organizationApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Organization', 'MyOrganizations', 'OrgMembers', 'OrgVerification', 'OrgInvitations'],
  endpoints: (builder) => ({
    getOrganizations: builder.query<PaginatedApiSuccessResponse<PublicOrganizationDTO>, { search?: string; type?: string; limit?: number; page?: number }>({
      query: (params) => ({ url: '/organizations', params }),
      providesTags: ['Organization'],
    }),
    getOrganizationBySlug: builder.query<ApiSuccessResponse<PublicOrganizationDTO>, string>({
      query: (slug) => `/organizations/slug/${slug}`,
      providesTags: ['Organization'],
    }),
    getOrganizationById: builder.query<ApiSuccessResponse<OwnerOrganizationDTO>, string>({
      query: (id) => `/organizations/${id}`,
      providesTags: ['Organization'],
    }),
    getMyOrganizations: builder.query<ApiSuccessResponse<OrganizationMembershipDTO[]>, void>({
      query: () => '/organizations/my-organizations',
      providesTags: ['MyOrganizations'],
    }),
    createOrganization: builder.mutation<ApiSuccessResponse<OwnerOrganizationDTO>, any>({
      query: (data) => ({ url: '/organizations', method: 'POST', body: data }),
      invalidatesTags: ['MyOrganizations', 'Organization'],
    }),
    updateOrganization: builder.mutation<ApiSuccessResponse<OwnerOrganizationDTO>, { id: string, data: any }>({
      query: ({ id, data }) => ({ url: `/organizations/${id}`, method: 'PATCH', body: data }),
      invalidatesTags: ['MyOrganizations', 'Organization'],
    }),
    getOrgMembers: builder.query<ApiSuccessResponse<OrganizationMembershipDTO[]>, string>({
      query: (id) => `/organizations/${id}/members`,
      providesTags: ['OrgMembers'],
    }),
    inviteMember: builder.mutation<ApiSuccessResponse<any>, { id: string, email: string, role: string }>({
      query: ({ id, email, role }) => ({ url: `/organizations/${id}/invitations`, method: 'POST', body: { email, role } }),
      invalidatesTags: ['OrgInvitations'],
    }),
    getOrgInvitations: builder.query<ApiSuccessResponse<OrganizationInvitationDTO[]>, string>({
      query: (id) => `/organizations/${id}/invitations`,
      providesTags: ['OrgInvitations'],
    }),
    updateMemberRole: builder.mutation<ApiSuccessResponse<any>, { id: string, memberId: string, role: string }>({
      query: ({ id, memberId, role }) => ({ url: `/organizations/${id}/members/${memberId}`, method: 'PATCH', body: { role } }),
      invalidatesTags: ['OrgMembers'],
    }),
    removeMember: builder.mutation<ApiSuccessResponse<any>, { id: string, memberId: string }>({
      query: ({ id, memberId }) => ({ url: `/organizations/${id}/members/${memberId}`, method: 'DELETE' }),
      invalidatesTags: ['OrgMembers'],
    }),
    getAdminOrganizations: builder.query<PaginatedApiSuccessResponse<OwnerOrganizationDTO>, any>({
      query: (params) => ({ url: '/admin/organizations', params }),
      providesTags: ['Organization'],
    }),
    reviewOrganization: builder.mutation<ApiSuccessResponse<any>, { id: string, action: string, reason?: string }>({
      query: ({ id, action, reason }) => ({ url: `/admin/organizations/${id}/review`, method: 'POST', body: { action, reason } }),
      invalidatesTags: ['Organization', 'MyOrganizations'],
    }),
    submitVerification: builder.mutation<ApiSuccessResponse<any>, { id: string, documentUrls: string[] }>({
      query: ({ id, documentUrls }) => ({ url: `/organizations/${id}/verification`, method: 'POST', body: { documentUrls } }),
      invalidatesTags: ['Organization', 'OrgVerification'],
    }),
  }),
});

export const {
  useGetOrganizationsQuery,
  useGetOrganizationBySlugQuery,
  useGetOrganizationByIdQuery,
  useGetMyOrganizationsQuery,
  useCreateOrganizationMutation,
  useUpdateOrganizationMutation,
  useGetOrgMembersQuery,
  useInviteMemberMutation,
  useGetOrgInvitationsQuery,
  useUpdateMemberRoleMutation,
  useRemoveMemberMutation,
  useGetAdminOrganizationsQuery,
  useReviewOrganizationMutation,
  useSubmitVerificationMutation,
} = organizationApi;
