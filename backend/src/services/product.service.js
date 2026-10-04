import {
  getProductsModel,
  getProductByIdModel,
} from "../models/product.model.js"

export const getProductsService = async () => {
  return await getProductsModel()
}

export const getProductByIdService = async (id) => {
  return await getProductByIdModel(id)
}
