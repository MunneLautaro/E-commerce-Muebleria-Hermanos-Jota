import mongoose from "mongoose"
import Product from "../models/product.model.js"

const mapProductCreationError = (error) => {
  if (error?.code === 11000) {
    const duplicateError = new Error("Ya existe un producto con ese SKU")
    duplicateError.status = 409
    duplicateError.expose = true
    return duplicateError
  }

  if (
    error?.name === "ValidationError" ||
    (error?.name === "MongooseError" &&
      /buffering timed out|Cannot call/i.test(error.message))
  ) {
    const message =
      error.name === "ValidationError"
        ? Object.values(error.errors)
            .map((validationError) => validationError.message)
            .join(", ")
        : "La base de datos no está disponible"
    const mappedError = new Error(message)
    mappedError.status = error.name === "ValidationError" ? 400 : 503
    mappedError.expose = true
    return mappedError
  }

  if (
    error?.name === "MongoServerSelectionError" ||
    error?.name === "MongooseServerSelectionError"
  ) {
    const unavailableError = new Error("La base de datos no está disponible")
    unavailableError.status = 503
    unavailableError.expose = true
    return unavailableError
  }

  return error
}

export const createProductService = async (productData) => {
  try {
    return await Product.create(productData)
  } catch (error) {
    throw mapProductCreationError(error)
  }
}

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
