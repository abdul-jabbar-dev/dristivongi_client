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
      const currentToken = localStorage.getItem('token') || null;
      if (currentToken) {
        dispatch(setCredentials({ user: null, accessToken: currentToken }));
      }
      
      try {
        // If currentToken is invalid, baseQueryWithReauth will automatically try to refresh it
        // and update the token via setCredentials before getMe() returns.
        const res = await getMe().unwrap();
        
        // At this point, if a refresh happened, the new token is already in localStorage
        const latestToken = localStorage.getItem('token');
        if (latestToken) {
          dispatch(setCredentials({ user: res.data, accessToken: latestToken }));
        } else {
          dispatch(logout());
        }
      } catch (e) {
        // If getMe fails (and refresh also failed or wasn't possible), log out
        dispatch(logout());
      } finally {
        dispatch(setLoading(false));
      }
    };
    initAuth();
  }, [dispatch, getMe]);

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