import { useCallback, useEffect, useMemo, useState } from "react"
import { authService } from "../services/authService"
import { AuthContext } from "./AuthContext"

const TOKEN_KEY = "hj_auth_token"
const USER_KEY = "hj_auth_user"

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null)
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      localStorage.removeItem(USER_KEY)
      return null
    }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const verifySession = async () => {
      if (!token) {
        if (isMounted) setLoading(false)
        return
      }

      try {
        const response = await authService.getMe(token)
        if (isMounted && response?.user) {
          setUser(response.user)
          localStorage.setItem(USER_KEY, JSON.stringify(response.user))
        }
      } catch {
        if (isMounted) {
          setToken(null)
          setUser(null)
          localStorage.removeItem(TOKEN_KEY)
          localStorage.removeItem(USER_KEY)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    verifySession()

    return () => {
      isMounted = false
    }
  }, [token])

  const saveSession = useCallback((newToken, newUser) => {
    setToken(newToken)
    setUser(newUser)
    localStorage.setItem(TOKEN_KEY, newToken)
    localStorage.setItem(USER_KEY, JSON.stringify(newUser))
  }, [])

  const login = useCallback(
    async ({ email, password }) => {
      const data = await authService.login({ email, password })
      saveSession(data.token, data.user)
      return data
    },
    [saveSession],
  )

  const loginWithGoogle = useCallback(
    async (credential) => {
      const data = await authService.googleLogin(credential)
      saveSession(data.token, data.user)
      return data
    },
    [saveSession],
  )

  const register = useCallback(
    async ({ email, password, phone, address }) => {
      const data = await authService.register({
        email,
        password,
        phone,
        address,
      })
      saveSession(data.token, data.user)
      return data
    },
    [saveSession],
  )

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      loading,
      login,
      loginWithGoogle,
      register,
      logout,
    }),
    [user, token, loading, login, loginWithGoogle, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
