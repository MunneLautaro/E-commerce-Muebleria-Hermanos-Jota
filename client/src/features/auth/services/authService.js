import { fetchApi } from "../../../services/api"

export const authService = {
  async login({ email, password }) {
    return fetchApi("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  },

  async register({ email, password, phone, address }) {
    return fetchApi("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, phone, address }),
    })
  },

  async googleLogin(credential) {
    return fetchApi("/auth/google", {
      method: "POST",
      body: JSON.stringify({ credential }),
    })
  },

  async getMe() {
    return fetchApi("/auth/me", {
      method: "GET",
    })
  },

  async logout() {
    return fetchApi("/auth/logout", {
      method: "POST",
    })
  },
}
