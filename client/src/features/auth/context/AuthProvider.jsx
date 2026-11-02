import { useCallback, useEffect, useMemo, useState } from "react"
import { authService } from "../services/authService"
import { AuthContext } from "./AuthContext"

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const verifySession = async () => {
      try {
        const response = await authService.getMe()
        if (isMounted && response?.user) {
          setUser(response.user)
        }
      } catch {
        if (isMounted) {
          setUser(null)
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
  }, [])

  const saveSession = useCallback((newUser) => {
    setUser(newUser)
  }, [])

  const login = useCallback(
    async ({ email, password }) => {
      const data = await authService.login({ email, password })
      saveSession(data.user)
      return data
    },
    [saveSession],
  )

  const loginWithGoogle = useCallback(
    async (credential) => {
      const data = await authService.googleLogin(credential)
      saveSession(data.user)
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
      saveSession(data.user)
      return data
    },
    [saveSession],
  )

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } finally {
      setUser(null)
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      loading,
      login,
      loginWithGoogle,
      register,
      logout,
    }),
    [user, loading, login, loginWithGoogle, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
