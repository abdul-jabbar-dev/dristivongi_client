import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../baseQueryWithReauth';
import { 
  GlobalSearchResponse, 
  SearchFilterParams, 
  SearchSuggestionsResponse 
} from './search.types';

export const searchApi = createApi({
  reducerPath: 'searchApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Search'],
  endpoints: (builder) => ({
    globalSearch: builder.query<{ data: GlobalSearchResponse }, SearchFilterParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.q) queryParams.append('q', params.q);
        if (params.scope) queryParams.append('scope', params.scope);
        if (params.location) queryParams.append('location', params.location);
        if (params.category) queryParams.append('category', params.category);
        if (params.status) queryParams.append('status', params.status);
        if (params.organizationId) queryParams.append('organizationId', params.organizationId);
        if (params.organizationType) queryParams.append('organizationType', params.organizationType);
        if (params.evidenceType) queryParams.append('evidenceType', params.evidenceType);
        if (params.sourceType) queryParams.append('sourceType', params.sourceType);
        if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
        if (params.dateTo) queryParams.append('dateTo', params.dateTo);
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.page) queryParams.append('page', params.page.toString());

        return `search?${queryParams.toString()}`;
      },
      providesTags: ['Search'],
    }),

    searchSuggestions: builder.query<{ data: SearchSuggestionsResponse }, { q: string; limit?: number }>({
      query: ({ q, limit = 8 }) => `search/suggestions?q=${encodeURIComponent(q)}&limit=${limit}`,
    }),
  }),
});

export const {
  useGlobalSearchQuery,
  useLazyGlobalSearchQuery,
  useSearchSuggestionsQuery,
} = searchApi;
