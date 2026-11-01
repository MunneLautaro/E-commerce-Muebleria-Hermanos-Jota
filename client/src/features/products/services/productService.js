import { fetchApi } from "../../../services/api"

export const productService = {
  async getProducts(params = {}) {
    const query = new URLSearchParams(params).toString()
    return fetchApi(`/products${query ? `?${query}` : ""}`)
  },

  async getProductById(id) {
    return fetchApi(`/products/${id}`)
  },

  async getAdminProductById(id) {
    return fetchApi(`/products/admin/${id}`)
  },

  async getAdminProducts(params = {}) {
    const query = new URLSearchParams(params).toString()
    return fetchApi(`/products/admin${query ? `?${query}` : ""}`)
  },

  async createProduct(product) {
    return fetchApi("/products", {
      method: "POST",
      body: JSON.stringify(product),
    })
  },

  async updateProduct(id, product) {
    return fetchApi(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(product),
    })
  },

  async deleteProduct(id) {
    return fetchApi(`/products/${id}`, {
      method: "DELETE",
    })
  },
}
