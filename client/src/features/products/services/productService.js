import { fetchApi } from "../../../services/api"

export const productService = {
  async getProducts() {
    return fetchApi("/products")
  },

  async getProductById(id) {
    return fetchApi(`/products/${id}`)
  },

  async createProduct(product) {
    return fetchApi("/products", {
      method: "POST",
      body: JSON.stringify(product),
    })
  },
}
