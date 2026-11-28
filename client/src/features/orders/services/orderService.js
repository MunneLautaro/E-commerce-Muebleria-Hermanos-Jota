import { fetchApi } from "../../../services/api"

export const toOrderItems = (products) =>
  products.map(({ _id, quantity }) => ({ producto: _id, cantidad: quantity }))

export const orderService = {
  async createOrder(products, envio) {
    return fetchApi("/ordenes", {
      method: "POST",
      body: JSON.stringify({ productos: toOrderItems(products), envio }),
    })
  },
}
