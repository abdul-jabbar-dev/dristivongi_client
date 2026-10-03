// Need to use the React-specific entry point to import createApi
import { createApi } from '@reduxjs/toolkit/query/react'
import type { TUserType } from './user.type'
import { baseQueryWithReauth } from '../../baseQueryWithReauth'

// Define a service using a base URL and expected endpoints
export const USER_Api = createApi({
  reducerPath: 'userApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getUserProfile: builder.query<TUserType, string>({
      query: () => `users/`,
    }),
    getMe: builder.query<any, void>({
      query: () => `auth/me`,
    }),
    refresh: builder.mutation<any, any>({
      query: () => ({
        url: `auth/refresh`,
        method: 'POST',
      }),
    }),
    logoutApi: builder.mutation<any, void>({
      query: () => ({
        url: `auth/logout`,
        method: 'POST',
      }),
    }),
    login: builder.mutation<any, any>({
      query: (credentials) => ({
        url: 'auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation<any, any>({
      query: (userData) => ({
        url: 'auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
  }),
})

export const { useGetUserProfileQuery, useLoginMutation, useRegisterMutation, useLazyGetMeQuery, useRefreshMutation, useLogoutApiMutation } = USER_Api