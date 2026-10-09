import { createContext, useContext } from 'react'
import type { UserProfileResponse } from '../lib/types'

export interface AuthContextValue {
  initialized: boolean
  authenticated: boolean
  user: UserProfileResponse | null
  loading: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
)

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
