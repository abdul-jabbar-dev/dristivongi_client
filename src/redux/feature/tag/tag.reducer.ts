import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from '../../baseQueryWithReauth'

export const TAG_Api = createApi({
    reducerPath: 'tagApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Tag', 'TagList'],
    endpoints: (builder) => ({
        searchTags: builder.query<{ data: any[] }, string>({
            query: (q) => `tags/search?q=${encodeURIComponent(q)}`,
            providesTags: ['TagList'],
        }),
        getTagDetails: builder.query<{ data: any }, string>({
            query: (name) => `tags/${encodeURIComponent(name)}`,
            providesTags: (result, error, name) => [{ type: 'Tag', id: name }],
        }),
    }),
})

export const {
    useSearchTagsQuery,
    useGetTagDetailsQuery,
} = TAG_Api
