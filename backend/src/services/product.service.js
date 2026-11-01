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

const createProductError = (message, status) => {
  const error = new Error(message)
  error.status = status
  error.expose = true
  return error
}

const handleProductWriteError = (error) => {
  if (error.code === 11000) {
    throw createProductError("Ya existe un producto con ese SKU", 409)
  }

  if (error.name === "ValidationError") {
    throw createProductError("Los datos del producto no son válidos", 400)
  }

  throw error
}

export const createProductService = async (productData) => {
  try {
    return await Product.create(productData)
  } catch (error) {
    handleProductWriteError(error)
  }
}

export const updateProductService = async (id, productData) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: id, isActive: true },
      { $set: productData },
      { returnDocument: "after", runValidators: true },
    ).lean()

    if (!product) {
      throw createProductError("Producto no encontrado", 404)
    }

    return product
  } catch (error) {
    handleProductWriteError(error)
  }
}

export const deleteProductService = async (id) => {
  const product = await Product.findByIdAndDelete(id)

  if (!product) {
    throw createProductError("Producto no encontrado", 404)
  }
}
