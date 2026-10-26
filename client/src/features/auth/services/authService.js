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

  async getMe(token) {
    return fetchApi("/auth/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
}

