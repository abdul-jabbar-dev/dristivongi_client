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
        newsFeed: builder.query<{ data: TCaseType[] }, { tag?: string, author?: string } | void>({
            query: (params) => {
                let url = `case/get_case/news_feed`;
                if (params) {
                    const queryParams = new URLSearchParams();
                    if (params.tag) queryParams.append('tag', params.tag);
                    if (params.author) queryParams.append('author', params.author);
                    if (queryParams.toString()) {
                        url += `?${queryParams.toString()}`;
                    }
                }
                return url;
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
            invalidatesTags: (result, error, { evidenceId }) => [
                { type: 'EvidenceValidation', id: evidenceId }
            ]
        }),
        getEvidenceValidation: builder.query({
            query: (evidenceId) => `/evidence/${evidenceId}/validation`,
            providesTags: (result, error, evidenceId) => [
                { type: 'EvidenceValidation', id: evidenceId }
            ]
        })
    }),
})

export const { useNewsFeedQuery, useCaseDetailsQuery, useCreateCaseMutation, useCreateClaimMutation, useAddEvidenceMutation, useAddCaseEvidenceMutation, useGetAssessmentsQuery, useSubmitAssessmentMutation, useImportUrlMutation, useSubmitEvidenceValidationMutation, useGetEvidenceValidationQuery } = CASE_Api