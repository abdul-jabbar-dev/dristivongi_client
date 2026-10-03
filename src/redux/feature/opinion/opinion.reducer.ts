import { createApi } from '@reduxjs/toolkit/query/react';

import ENV from '@/lib/config';
import { baseQueryWithReauth } from '../../baseQueryWithReauth';

export const OPINION_Api = createApi({
    reducerPath: 'opinionApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Opinions'],
    endpoints: (builder) => ({
        getOpinions: builder.query<any, { targetType: string; targetId: string }>({
            query: ({ targetType, targetId }) => `opinions/?targetType=${targetType}&targetId=${targetId}`,
            providesTags: (result, error, { targetType, targetId }) => [{ type: 'Opinions', id: `${targetType}-${targetId}` }]
        }),
        createOpinion: builder.mutation<any, FormData>({
            query: (formData) => ({
                url: 'opinions/',
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: (result, error, formData) => {
                const dataStr = formData.get('data') as string;
                if (dataStr) {
                    const data = JSON.parse(dataStr);
                    return [{ type: 'Opinions', id: `${data.targetType}-${data.targetId}` }];
                }
                return ['Opinions'];
            }
        }),
        deleteOpinion: builder.mutation<any, string>({
            query: (id) => ({
                url: `opinions/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Opinions']
        })
    }),
});

export const {
    useGetOpinionsQuery,
    useCreateOpinionMutation,
    useDeleteOpinionMutation
} = OPINION_Api;
