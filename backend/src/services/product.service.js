import { randomInt } from "node:crypto"
import mongoose from "mongoose"
import Product from "../models/product.model.js"
import PurchaseOrder from "../models/purchaseOrder.model.js"
import { escapeRegex } from "../utils/escapeRegex.js"

export const BEST_SELLERS_LIMIT = 3

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

const createWithUniqueSku = async (productData, attemptsLeft) => {
  try {
    return await Product.create({
      ...productData,
      sku: generateSku(),
    })
  } catch (error) {
    if (error?.code !== 11000 || attemptsLeft <= 1) {
      throw mapProductCreationError(error)
    }

    return createWithUniqueSku(productData, attemptsLeft - 1)
  }
}

export const createProductService = (productData) =>
  createWithUniqueSku(productData, SKU_GENERATION_ATTEMPTS)

const SORT_OPTIONS = {
  name_asc: { nombre: 1, _id: 1 },
}

const ADMIN_STATUS_FILTERS = {
  todos: {},
  activos: { isActive: true },
  inactivos: { isActive: false },
}

const getProducts = async (
  { page = 1, limit = 12, order = "name_asc", q, minPrice, maxPrice } = {},
  { baseFilter = { isActive: true }, searchFields = ["nombre"] } = {},
) => {
  const filter = { ...baseFilter }

  if (q) {
    const pattern = { $regex: escapeRegex(q), $options: "i" }
    filter.$or = searchFields.map((field) => ({ [field]: pattern }))
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.precio = {}
    if (minPrice !== undefined) filter.precio.$gte = minPrice
    if (maxPrice !== undefined) filter.precio.$lte = maxPrice
  }

  const sort = SORT_OPTIONS[order] ?? SORT_OPTIONS.name_asc
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

const getBestSellerIds = async (limit = BEST_SELLERS_LIMIT) => {
  const rows = await PurchaseOrder.aggregate([
    { $match: { estado: "aceptada" } },
    { $unwind: "$productos" },
    {
      $group: {
        _id: "$productos.producto",
        vendidos: { $sum: "$productos.cantidad" },
      },
    },
    {
      $lookup: {
        from: Product.collection.name,
        localField: "_id",
        foreignField: "_id",
        pipeline: [{ $match: { isActive: true } }, { $project: { _id: 1 } }],
        as: "producto",
      },
    },
    { $match: { "producto.0": { $exists: true } } },
    { $sort: { vendidos: -1, _id: 1 } },
    { $limit: limit },
    { $project: { _id: 1 } },
  ])

  return rows.map(({ _id }) => _id)
}

export const getProductsService = async (params) => {
  const [result, bestSellers] = await Promise.all([
    getProducts(params),
    getBestSellerIds(),
  ])
  const bestSellerIds = new Set(bestSellers.map((id) => id.toString()))

  return {
    ...result,
    items: result.items.map((product) => ({
      ...product,
      masVendido: bestSellerIds.has(product._id.toString()),
    })),
  }
}

export const FEATURED_PRODUCTS_LIMIT = 4

export const getFeaturedProductsService = async () => {
  const rankedIds = await getBestSellerIds(FEATURED_PRODUCTS_LIMIT)
  const missing = FEATURED_PRODUCTS_LIMIT - rankedIds.length
  const [bestSellers, others] = await Promise.all([
    Product.find({ _id: { $in: rankedIds }, isActive: true }).lean(),
    missing > 0
      ? Product.find({ _id: { $nin: rankedIds }, isActive: true })
          .sort(SORT_OPTIONS.name_asc)
          .limit(missing)
          .lean()
      : [],
  ])
  const byId = new Map(
    bestSellers.map((product) => [product._id.toString(), product]),
  )
  const ranked = rankedIds
    .map((id) => byId.get(id.toString()))
    .filter(Boolean)
    .map((product, index) => ({
      ...product,
      masVendido: index < BEST_SELLERS_LIMIT,
    }))

  return {
    items: [
      ...ranked,
      ...others.map((product) => ({ ...product, masVendido: false })),
    ].slice(0, FEATURED_PRODUCTS_LIMIT),
  }
}

export const getAdminProductsService = ({ estado = "todos", ...params } = {}) =>
  getProducts(params, {
    baseFilter: ADMIN_STATUS_FILTERS[estado] ?? ADMIN_STATUS_FILTERS.todos,
    searchFields: ["nombre", "sku"],
  })

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
