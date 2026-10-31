import mongoose from "mongoose"
import Product from "../models/product.model.js"

export const getProductsService = async () => {
  return Product.find({ isActive: true }).lean()
}

export const getProductByIdService = async (id) => {
  if (!mongoose.isValidObjectId(id)) {
    return null
  }

  return Product.findOne({ _id: id, isActive: true }).lean()
}
