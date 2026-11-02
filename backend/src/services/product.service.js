import { randomInt } from "node:crypto"
import mongoose from "mongoose"
import Product from "../models/product.model.js"

const SKU_GENERATION_ATTEMPTS = 5

const generateSku = () => `HJ-${randomInt(0, 1_000_000).toString().padStart(6, "0")}`

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
  for (let attempt = 0; attempt < SKU_GENERATION_ATTEMPTS; attempt += 1) {
    try {
      return await Product.create({
        ...productData,
        sku: generateSku(),
      })
    } catch (error) {
      if (error?.code !== 11000 || attempt === SKU_GENERATION_ATTEMPTS - 1) {
        throw mapProductCreationError(error)
      }
    }
  }
}

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

const getProducts = async ({
  page = 1,
  limit = 12,
  order = "name_asc",
  q,
  minPrice,
  maxPrice,
} = {}, includeInactive = false) => {
  const filter = includeInactive ? {} : { isActive: true }

  if (q) {
    filter.nombre = { $regex: escapeRegex(q), $options: "i" }
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.precio = {}
    if (minPrice !== undefined) filter.precio.$gte = minPrice
    if (maxPrice !== undefined) filter.precio.$lte = maxPrice
  }

  const sort = order === "name_asc" ? { nombre: 1, _id: 1 } : { nombre: 1, _id: 1 }
  const skip = (page - 1) * limit
  const [items, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Product.countDocuments(filter),
  ])

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export const getProductsService = (params) => getProducts(params)

export const getAdminProductsService = (params) => getProducts(params, true)

const getProductById = async (id, includeInactive = false) => {
  if (!mongoose.isValidObjectId(id)) {
    const error = new Error("El ID del producto no es válido")
    error.status = 400
    error.expose = true
    throw error
  }

  return Product.findOne({
    _id: id,
    ...(includeInactive ? {} : { isActive: true }),
  }).lean()
}

export const getProductByIdService = (id) => getProductById(id)

export const getAdminProductByIdService = (id) => getProductById(id, true)

export const deleteProductService = async (id) => {
  if (!mongoose.isObjectIdOrHexString(id)) {
    const error = new Error("El ID del producto no es válido")
    error.status = 400
    error.expose = true
    throw error
  }

  return Product.findByIdAndUpdate(
    id,
    { isActive: false },
    { returnDocument: "after", runValidators: true },
  ).lean()
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
      returnDocument: "after",
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
