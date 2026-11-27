import mongoose from "mongoose"
import PurchaseOrder from "../models/purchaseOrder.model.js"
import Product from "../models/product.model.js"

const badRequest = (message) => {
  const error = new Error(message)
  error.status = 400
  error.expose = true
  return error
}

const unavailableProductError = async (productId, session) => {
  const product = await Product.findById(productId)
    .select("nombre stock isActive")
    .session(session)
    .lean()

  if (!product?.isActive) {
    return badRequest("Uno de los productos ya no está disponible")
  }

  const remaining =
    product.stock === 1 ? "Queda 1 unidad" : `Quedan ${product.stock} unidades`

  return badRequest(`No hay stock suficiente de "${product.nombre}". ${remaining}`)
}

const reserveProduct = async ({ producto, cantidad }, session) => {
  const product = await Product.findOneAndUpdate(
    {
      _id: producto,
      isActive: true,
      stock: { $gte: cantidad },
    },
    { $inc: { stock: -cantidad } },
    { returnDocument: "after", session },
  ).lean()

  if (!product) {
    throw await unavailableProductError(producto, session)
  }

  return {
    producto: product._id,
    cantidad,
    subtotal: product.precio * cantidad,
  }
}

export const createPurchaseOrderService = async (compradorId, productos) => {
  const session = await mongoose.startSession()

  try {
    let purchaseOrder

    await session.withTransaction(async () => {
      const items = []

      for (const item of productos) {
        items.push(await reserveProduct(item, session))
      }

      const total = items.reduce((sum, item) => sum + item.subtotal, 0)

      const [created] = await PurchaseOrder.create(
        [{ productos: items, total, comprador: compradorId }],
        { session },
      )

      purchaseOrder = created.toObject()
    })

    return purchaseOrder
  } finally {
    await session.endSession()
  }
}

const getPurchaseOrders = async (filter, { page = 1, limit = 12 } = {}) => {
  const skip = (page - 1) * limit

  const [items, total] = await Promise.all([
    PurchaseOrder.find(filter)
      .populate("comprador", "name email")
      .populate("productos.producto", "nombre precio imagenUrl")
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    PurchaseOrder.countDocuments(filter),
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

export const getAllPurchaseOrdersService = (params) =>
  getPurchaseOrders({}, params)

export const getPurchaseOrdersByBuyerService = (compradorId, params) => {
  if (!mongoose.isValidObjectId(compradorId)) {
    throw badRequest("El ID del comprador no es válido")
  }

  return getPurchaseOrders({ comprador: compradorId }, params)
}
