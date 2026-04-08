/**
 * context/AuthContext.jsx
 * Provides authentication state and helpers to the entire app.
 * Token and user object are persisted in localStorage for page refresh.
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true) // true on first load while we verify token

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const token    = localStorage.getItem('aiv_token')
    const cached   = localStorage.getItem('aiv_user')

    if (token && cached) {
      try {
        setUser(JSON.parse(cached))
      } catch { /* malformed cache */ }
    }
    setLoading(false)
  }, [])

  const login = useCallback(async ({ email, password }) => {
    const res  = await authService.login({ email, password })
    const { token, user: u } = res.data
    localStorage.setItem('aiv_token', token)
    localStorage.setItem('aiv_user',  JSON.stringify(u))
    setUser(u)
    return u
  }, [])

  const signup = useCallback(async (data) => {
    const res  = await authService.signup(data)
    const { token, user: u } = res.data
    localStorage.setItem('aiv_token', token)
    localStorage.setItem('aiv_user',  JSON.stringify(u))
    setUser(u)
    return u
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('aiv_token')
    localStorage.removeItem('aiv_user')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
