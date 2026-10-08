import { configureStore } from '@reduxjs/toolkit'
import { USER_Api } from './feature/user/user.reducer'
import { CASE_Api } from './feature/case/case.reducer'
import { OPINION_Api } from './feature/opinion/opinion.reducer'
import { TAG_Api } from './feature/tag/tag.reducer'
import { organizationApi } from './feature/organization/organizationApi'
import { feedApi } from './feature/feed/feedApi'
import { searchApi } from './feature/search/searchApi'
import authReducer from './feature/auth/auth.slice'

export const makeStore = () => {
    return configureStore({
        reducer: {
            auth: authReducer,
            [USER_Api.reducerPath]: USER_Api.reducer,
            [CASE_Api.reducerPath]: CASE_Api.reducer,
            [OPINION_Api.reducerPath]: OPINION_Api.reducer,
            [TAG_Api.reducerPath]: TAG_Api.reducer,
            [organizationApi.reducerPath]: organizationApi.reducer,
            [feedApi.reducerPath]: feedApi.reducer,
            [searchApi.reducerPath]: searchApi.reducer,
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(
                USER_Api.middleware,
                CASE_Api.middleware,
                OPINION_Api.middleware,
                TAG_Api.middleware,
                organizationApi.middleware,
                feedApi.middleware,
                searchApi.middleware
            ),
    })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']