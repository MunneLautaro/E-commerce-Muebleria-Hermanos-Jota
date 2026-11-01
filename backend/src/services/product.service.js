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

export const updateProductService = async (id, productData) => {
  if (!mongoose.isObjectIdOrHexString(id)) {
    const error = new Error("El ID del producto no es válido")
    error.status = 400
    error.expose = true
    throw error
  }

  try {
    return await Product.findByIdAndUpdate(id, productData, {
      new: true,
      runValidators: true,
    }).lean()
  } catch (error) {
    if (error.code === 11000) {
      const duplicateError = new Error("El SKU ya está registrado")
      duplicateError.status = 409
      duplicateError.expose = true
      throw duplicateError
    }

    throw error
  }
}
