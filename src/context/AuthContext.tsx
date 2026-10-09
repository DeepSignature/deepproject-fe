import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api } from '../lib/api'
import keycloak, { initKeycloak, updateToken } from '../lib/keycloak'
import type { UserProfileResponse } from '../lib/types'
import { AuthContext } from './auth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [initialized, setInitialized] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [user, setUser] = useState<UserProfileResponse | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    keycloak.onAuthLogout = () => {
      setAuthenticated(false)
      setUser(null)
    }
    keycloak.onAuthRefreshError = () => {
      setAuthenticated(false)
      setUser(null)
    }
    keycloak.onTokenExpired = () => {
      void updateToken(30).catch(() => keycloak.clearToken())
    }

    let cancelled = false

    async function bootstrap() {
      let auth = false
      try {
        auth = await initKeycloak()
      } catch {
        // init failed; remain unauthenticated
      }
      if (cancelled) return

      setInitialized(true)
      setAuthenticated(auth)
      if (!auth) return

      try {
        setLoading(true)
        const profile = await api.me()
        if (cancelled) return
        setUser(profile)
      } catch {
        // profile fetch failed; stay authenticated, user stays null
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void bootstrap()

    return () => {
      cancelled = true
    }
  }, [])

  const redirectUri = `${window.location.origin}/`

  const login = useCallback(async () => {
    await keycloak.login({ redirectUri })
  }, [redirectUri])

  const logout = useCallback(async () => {
    await keycloak.logout({ redirectUri })
  }, [redirectUri])

  const value = useMemo(
    () => ({ initialized, authenticated, user, loading, login, logout }),
    [initialized, authenticated, user, loading, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
