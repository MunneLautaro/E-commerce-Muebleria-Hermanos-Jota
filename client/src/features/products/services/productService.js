import { fetchApi } from "../../../services/api"
import { withQuery } from "../../../services/withQuery"

export const productService = {
  async getProducts(params = {}) {
    return fetchApi(withQuery("/products", params))
  },

  async getProductById(id) {
    return fetchApi(`/products/${id}`)
  },

  async getAdminProductById(id) {
    return fetchApi(`/products/admin/${id}`)
  },

  async getAdminProducts(params = {}) {
    return fetchApi(withQuery("/products/admin", params))
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
