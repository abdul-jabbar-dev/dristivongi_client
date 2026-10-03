'use client'
import { AppStore, makeStore } from '@/redux/store'
import { useState } from 'react'
import { Provider } from 'react-redux'
 

import { useEffect } from 'react'
import { setCredentials, logout, setLoading } from '@/redux/feature/auth/auth.slice'
import { USER_Api } from '@/redux/feature/user/user.reducer'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/redux/store'

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch()
  const { isLoading, accessToken } = useSelector((state: RootState) => state.auth)
  const [getMe] = USER_Api.useLazyGetMeQuery()
  const [refresh] = USER_Api.useRefreshMutation()

  useEffect(() => {
    const initAuth = async () => {
      let currentToken = localStorage.getItem('token') || null;
      try {
        if (currentToken) {
          // Verify existing token
          dispatch(setCredentials({ user: null, accessToken: currentToken }))
          const res = await getMe().unwrap()
          dispatch(setCredentials({ user: res.data, accessToken: currentToken }))
        } else {
          // Try to refresh
          const res = await refresh({}).unwrap()
          if (res.accessToken) {
             dispatch(setCredentials({ user: null, accessToken: res.accessToken }))
             const meRes = await getMe().unwrap()
             dispatch(setCredentials({ user: meRes.data, accessToken: res.accessToken }))
          }
        }
      } catch (e) {
        dispatch(logout())
      } finally {
        dispatch(setLoading(false))
      }
    }
    initAuth()
  }, [dispatch, getMe, refresh])

  if (isLoading) {
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>
  }

  return <>{children}</>
}

export default function StoreProvider({
  children
}: {
  children: React.ReactNode
}) {
  const [store] = useState<AppStore>(makeStore)

  return (
    <Provider store={store}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  )
}