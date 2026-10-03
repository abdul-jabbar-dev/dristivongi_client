import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import ENV from '@/lib/config';
import { logout, setCredentials } from './feature/auth/auth.slice';
import { RootState } from './store';

const mutex = { isLocked: false }; // A simple mutex to prevent multiple refresh calls

export const baseQuery = fetchBaseQuery({
  baseUrl: ENV.API_URL,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // wait until the mutex is available without locking it
  while (mutex.isLocked) {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    if (!mutex.isLocked) {
      mutex.isLocked = true;
      try {
        const refreshResult = await baseQuery(
          {
            url: 'auth/refresh',
            method: 'POST',
            credentials: 'include',
          },
          api,
          extraOptions
        );

        if (refreshResult.data) {
          // Success: store new token
          const { accessToken } = (refreshResult.data as any).data;
          // Optimistic update for now, we'll refetch user info if needed or just keep current user
          api.dispatch(setCredentials({ user: (api.getState() as RootState).auth.user, accessToken }));

          // Retry original request
          result = await baseQuery(args, api, extraOptions);
        } else {
          // Refresh failed
          api.dispatch(logout());
        }
      } finally {
        mutex.isLocked = false;
      }
    } else {
      // wait until the mutex is available without locking it
      while (mutex.isLocked) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      result = await baseQuery(args, api, extraOptions);
    }
  }
  return result;
};
