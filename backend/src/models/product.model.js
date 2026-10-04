import { products } from "../data/products.js"

export const getProductsModel = async () => {
  return products
}

export const getProductByIdModel = async (id) => {
  const productId = Number(id)

  return products.find((product) => product.id === productId) || null
}
