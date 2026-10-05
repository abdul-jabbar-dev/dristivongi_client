// Need to use the React-specific entry point to import createApi
import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from '../../baseQueryWithReauth'
import { TCaseType } from './case.type'

// Define a service using a base URL and expected endpoints
export const CASE_Api = createApi({
    reducerPath: 'caseApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Case', 'CaseList', 'Assessment', 'EvidenceValidation'],
    endpoints: (builder) => ({
        newsFeed: builder.query<{ data: TCaseType[], nextPage: number | null }, { tag?: string, author?: string, page?: number } | void>({
            query: (params) => {
                let url = `case/get_case/news_feed`;
                if (params) {
                    const queryParams = new URLSearchParams();
                    if (params.tag) queryParams.append('tag', params.tag);
                    if (params.author) queryParams.append('author', params.author);
                    if (params.page) queryParams.append('page', params.page.toString());
                    if (queryParams.toString()) {
                        url += `?${queryParams.toString()}`;
                    }
                }
                return url;
            },
            serializeQueryArgs: ({ queryArgs }) => {
                const { page, ...rest } = queryArgs || {};
                return rest;
            },
            merge: (currentCache, newItems) => {
                if (newItems.data) {
                    currentCache.data.push(...newItems.data);
                }
                currentCache.nextPage = newItems.nextPage;
            },
            forceRefetch({ currentArg, previousArg }) {
                return currentArg?.page !== previousArg?.page;
            },
            transformResponse: (response: any) => {
                const nextPage = response?.data?.nextPage || null;
                if (response?.data?.data) {
                    return { data: response.data.data, nextPage };
                }
                if (response?.data?.items) {
                    return { data: response.data.items, nextPage };
                }
                return { data: response?.data || [], nextPage };
            },
            providesTags: ['CaseList'],
        }),
        caseDetails: builder.query<{ data: TCaseType }, string>({
            query: (id) => `case/get_case/${id}`,
            providesTags: (result, error, id) => [{ type: 'Case', id }],
        }),
        createCase: builder.mutation<any, FormData>({
            query: (formData) => ({
                url: `case/create_case`,
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: ['CaseList'],
        }),
        createClaim: builder.mutation<any, { caseId: string, formData: FormData }>({
            query: ({ caseId, formData }) => ({
                url: `case/${caseId}/create_claim`,
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: (result, error, arg) => [{ type: 'Case', id: arg.caseId }],
        }),
        addEvidence: builder.mutation<any, { claimId: string, caseId: string, formData: FormData }>({
            query: ({ claimId, formData }) => ({
                url: `case/${claimId}/add_evidence`,
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: (result, error, arg) => [{ type: 'Case', id: arg.caseId }],
        }),
        addCaseEvidence: builder.mutation<any, { caseId: string, formData: FormData }>({
            query: ({ caseId, formData }) => ({
                url: `case/${caseId}/case_evidence`,
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: (result, error, arg) => [{ type: 'Case', id: arg.caseId }],
        }),
        getAssessments: builder.query<any, string>({
            query: (claimId) => `case/${claimId}/assessment`,
            providesTags: (result, error, id) => [{ type: 'Assessment', id }],
        }),
        submitAssessment: builder.mutation<any, { claimId: string, data: { assessment: string, isAnonymous: boolean } }>({
            query: ({ claimId, data }) => ({
                url: `case/${claimId}/assessment`,
                method: 'POST',
                body: data,
            }),
            async onQueryStarted({ claimId, data }, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    CASE_Api.util.updateQueryData('getAssessments', claimId, (draft: any) => {
                        if (draft.data) {
                            const prevVote = draft.data.currentUserPosition;
                            
                            // Remove previous vote count
                            if (prevVote === 'SUPPORT') draft.data.support = Math.max(0, (draft.data.support || 0) - 1);
                            if (prevVote === 'NEUTRAL') draft.data.neutral = Math.max(0, (draft.data.neutral || 0) - 1);
                            if (prevVote === 'OPPOSITION') draft.data.opposition = Math.max(0, (draft.data.opposition || 0) - 1);
                            
                            // Determine new vote category based on choice
                            let newVote = null;
                            const choice = data.assessment;
                            if (['FULLY_AGREE', 'MOSTLY_AGREE', 'PARTIALLY_AGREE'].includes(choice)) newVote = 'SUPPORT';
                            else if (['PARTIALLY_DISAGREE', 'MOSTLY_DISAGREE', 'COMPLETELY_DISAGREE'].includes(choice)) newVote = 'OPPOSITION';
                            else if (['NEED_MORE_INFO', 'NEUTRAL', 'MIXED_FEELINGS'].includes(choice)) newVote = 'NEUTRAL';
                            
                            // Add new vote count
                            if (newVote === 'SUPPORT') draft.data.support = (draft.data.support || 0) + 1;
                            if (newVote === 'NEUTRAL') draft.data.neutral = (draft.data.neutral || 0) + 1;
                            if (newVote === 'OPPOSITION') draft.data.opposition = (draft.data.opposition || 0) + 1;
                            
                            draft.data.currentUserPosition = newVote;
                            draft.data.total = (draft.data.support || 0) + (draft.data.neutral || 0) + (draft.data.opposition || 0);
                        }
                    })
                );
                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            },
            invalidatesTags: (result, error, arg) => [{ type: 'Assessment', id: arg.claimId }],
        }),
        importUrl: builder.mutation<any, { url: string }>({
            query: (data) => ({
                url: `media/import-url`,
                method: 'POST',
                body: data,
            }),
        }),
        submitEvidenceValidation: builder.mutation({
            query: ({ evidenceId, value }) => ({
                url: `/evidence/${evidenceId}/validation`,
                method: "POST",
                body: { value }
            }),
            async onQueryStarted({ evidenceId, value }, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    CASE_Api.util.updateQueryData('getEvidenceValidation', evidenceId, (draft: any) => {
                        if (draft.data) {
                            const prevVote = draft.data.currentUserVote;
                            if (prevVote === 'VALID') draft.data.valid = Math.max(0, (draft.data.valid || 0) - 1);
                            if (prevVote === 'INVALID') draft.data.invalid = Math.max(0, (draft.data.invalid || 0) - 1);
                            
                            const newVote = value === 'NONE' ? null : value;
                            if (newVote === 'VALID') draft.data.valid = (draft.data.valid || 0) + 1;
                            if (newVote === 'INVALID') draft.data.invalid = (draft.data.invalid || 0) + 1;
                            
                            draft.data.currentUserVote = newVote;
                            draft.data.total = (draft.data.valid || 0) + (draft.data.invalid || 0);
                            draft.data.validPercentage = draft.data.total > 0 ? (draft.data.valid / draft.data.total) * 100 : 0;
                            draft.data.invalidPercentage = draft.data.total > 0 ? (draft.data.invalid / draft.data.total) * 100 : 0;
                        }
                    })
                );
                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            },
            invalidatesTags: (result, error, { evidenceId }) => [
                { type: 'EvidenceValidation', id: evidenceId }
            ]
        }),
        getEvidenceValidation: builder.query({
            query: (evidenceId) => `/evidence/${evidenceId}/validation`,
            providesTags: (result, error, evidenceId) => [
                { type: 'EvidenceValidation', id: evidenceId }
            ]
        }),
        submitCaseReaction: builder.mutation<any, { caseId: string, value: string }>({
            query: ({ caseId, value }) => ({
                url: `case/${caseId}/reaction`,
                method: 'POST',
                body: { value },
            }),
            async onQueryStarted({ caseId, value }, { dispatch, queryFulfilled, getState }) {
                const patchResultDetails = dispatch(
                    CASE_Api.util.updateQueryData('caseDetails', caseId, (draft) => {
                        if (draft.data) {
                            if (draft.data.stats) {
                                const prevReaction = draft.data.reaction?.currentUserReaction;
                                if (prevReaction === "SUPPORT") draft.data.stats.supportCount = Math.max(0, (draft.data.stats.supportCount || 0) - 1);
                                if (prevReaction === "OPPOSE") draft.data.stats.opposeCount = Math.max(0, (draft.data.stats.opposeCount || 0) - 1);
                                
                                const newReaction = value === "NONE" ? null : value as "SUPPORT" | "OPPOSE";
                                if (newReaction === "SUPPORT") draft.data.stats.supportCount = (draft.data.stats.supportCount || 0) + 1;
                                if (newReaction === "OPPOSE") draft.data.stats.opposeCount = (draft.data.stats.opposeCount || 0) + 1;
                            }

                            if (!draft.data.reaction) {
                                draft.data.reaction = { support: 0, oppose: 0, total: 0, currentUserReaction: null };
                            }
                            const prevReaction = draft.data.reaction.currentUserReaction;
                            if (prevReaction === "SUPPORT") draft.data.reaction.support = Math.max(0, draft.data.reaction.support - 1);
                            if (prevReaction === "OPPOSE") draft.data.reaction.oppose = Math.max(0, draft.data.reaction.oppose - 1);
                            
                            const newReaction = value === "NONE" ? null : value as "SUPPORT" | "OPPOSE";
                            if (newReaction === "SUPPORT") draft.data.reaction.support++;
                            if (newReaction === "OPPOSE") draft.data.reaction.oppose++;
                            
                            draft.data.reaction.currentUserReaction = newReaction;
                            draft.data.reaction.total = draft.data.reaction.support + draft.data.reaction.oppose;
                        }
                    })
                );

                const state = getState() as any;
                const queries = state.caseApi?.queries || {};
                const patches: any[] = [];

                for (const [key, query] of Object.entries(queries)) {
                    if (key.startsWith('newsFeed(') && (query as any)?.status === 'fulfilled') {
                        const originalArgs = (query as any).originalArgs;
                        const patch = dispatch(
                            CASE_Api.util.updateQueryData('newsFeed', originalArgs, (draft) => {
                                if (draft.data) {
                                    const caseItem = draft.data.find(c => c.id === caseId);
                                    if (caseItem) {
                                        if (caseItem.stats) {
                                            const prevReaction = caseItem.reaction?.currentUserReaction;
                                            if (prevReaction === "SUPPORT") caseItem.stats.supportCount = Math.max(0, (caseItem.stats.supportCount || 0) - 1);
                                            if (prevReaction === "OPPOSE") caseItem.stats.opposeCount = Math.max(0, (caseItem.stats.opposeCount || 0) - 1);
                                            
                                            const newReaction = value === "NONE" ? null : value as "SUPPORT" | "OPPOSE";
                                            if (newReaction === "SUPPORT") caseItem.stats.supportCount = (caseItem.stats.supportCount || 0) + 1;
                                            if (newReaction === "OPPOSE") caseItem.stats.opposeCount = (caseItem.stats.opposeCount || 0) + 1;
                                        }

                                        if (!caseItem.reaction) {
                                            caseItem.reaction = { support: 0, oppose: 0, total: 0, currentUserReaction: null };
                                        }
                                        const prevReaction = caseItem.reaction.currentUserReaction;
                                        if (prevReaction === "SUPPORT") caseItem.reaction.support = Math.max(0, caseItem.reaction.support - 1);
                                        if (prevReaction === "OPPOSE") caseItem.reaction.oppose = Math.max(0, caseItem.reaction.oppose - 1);
                                        
                                        const newReaction = value === "NONE" ? null : value as "SUPPORT" | "OPPOSE";
                                        if (newReaction === "SUPPORT") caseItem.reaction.support++;
                                        if (newReaction === "OPPOSE") caseItem.reaction.oppose++;
                                        
                                        caseItem.reaction.currentUserReaction = newReaction;
                                        caseItem.reaction.total = caseItem.reaction.support + caseItem.reaction.oppose;
                                    }
                                }
                            })
                        );
                        patches.push(patch);
                    }
                }

                try {
                    await queryFulfilled;
                } catch {
                    patchResultDetails.undo();
                    patches.forEach(p => p.undo());
                }
            },
            invalidatesTags: (result, error, arg) => [{ type: 'Case', id: arg.caseId }, 'CaseList'],
        })
    }),
})

export const { useNewsFeedQuery, useCaseDetailsQuery, useCreateCaseMutation, useCreateClaimMutation, useAddEvidenceMutation, useAddCaseEvidenceMutation, useGetAssessmentsQuery, useSubmitAssessmentMutation, useImportUrlMutation, useSubmitEvidenceValidationMutation, useGetEvidenceValidationQuery, useSubmitCaseReactionMutation } = CASE_Api