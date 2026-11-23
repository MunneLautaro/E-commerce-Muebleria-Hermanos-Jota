import { useCallback, useEffect, useMemo, useState } from "react"
import { tokenStorage } from "../../../services/tokenStorage"
import { authService } from "../services/authService"
import { AuthContext } from "./AuthContext"

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const verifySession = async () => {
      if (!tokenStorage.get()) {
        if (isMounted) setLoading(false)
        return
      }

      try {
        const response = await authService.getMe()
        if (isMounted && response?.user) {
          setUser(response.user)
        }
      } catch (error) {
        // Solo un 401 indica token inválido o expirado: se descarta para no
        // reenviarlo. Ante errores de red o del servidor se conserva el token
        // y la sesión se reintenta en la próxima carga.
        if (error.status === 401) {
          tokenStorage.clear()
        }
        if (isMounted) {
          setUser(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    void verifySession()

    return () => {
      isMounted = false
    }
  }, [])

  const saveSession = useCallback(({ token, user: newUser }) => {
    if (token) {
      tokenStorage.set(token)
    }
    setUser(newUser)
  }, [])

  const login = useCallback(
    async ({ email, password }) => {
      const data = await authService.login({ email, password })
      saveSession(data)
      return data
    },
    [saveSession],
  )

  const loginWithGoogle = useCallback(
    async (credential) => {
      const data = await authService.googleLogin(credential)
      saveSession(data)
      return data
    },
    [saveSession],
  )

  const register = useCallback(async ({ email, password, phone, address }) => {
    return authService.register({ email, password, phone, address })
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch {
      // El logout es local: aunque el backend no responda, se cierra la sesión.
    } finally {
      tokenStorage.clear()
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
