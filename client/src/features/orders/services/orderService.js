import { fetchApi } from "../../../services/api"
import { withQuery } from "../../../services/withQuery"

export const toOrderItems = (products) =>
  products.map(({ _id, quantity }) => ({ producto: _id, cantidad: quantity }))

export const orderService = {
  async createOrder(products, envio) {
    return fetchApi("/ordenes", {
      method: "POST",
      body: JSON.stringify({ productos: toOrderItems(products), envio }),
    })
  },

  async getMyOrders(userId, params = {}) {
    return fetchApi(
      withQuery(`/ordenes/usuario/${encodeURIComponent(userId)}`, params),
    )
  },

  async getAdminOrders(params = {}) {
    return fetchApi(withQuery("/ordenes", params))
  },
}
