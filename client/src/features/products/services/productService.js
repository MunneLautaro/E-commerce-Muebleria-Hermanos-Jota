import { fetchApi } from "../../../services/api"

export const productService = {
  async getProducts() {
    return fetchApi("/productos")
  },

  async getProductById(id) {
    return fetchApi(`/productos/${id}`)
  },
}
