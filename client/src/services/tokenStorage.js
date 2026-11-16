const TOKEN_KEY = "hjAuthToken"

// Respaldo en memoria: solo se usa cuando el navegador bloquea el storage.
let memoryToken = null

export const tokenStorage = {
  get() {
    if (memoryToken) return memoryToken
    try {
      return window.localStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  },

  set(token) {
    if (!token) return
    try {
      window.localStorage.setItem(TOKEN_KEY, token)
      memoryToken = null
    } catch {
      // Si el navegador bloquea el storage, la sesión durará lo que dure la pestaña.
      memoryToken = token
    }
  },

  clear() {
    memoryToken = null
    try {
      window.localStorage.removeItem(TOKEN_KEY)
    } catch {
      // Nada que limpiar si el storage no está disponible.
    }
  },
}
