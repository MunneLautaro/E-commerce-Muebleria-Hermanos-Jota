
import mongoose from "mongoose"
import PurchaseOrder from "../models/purchaseOrder.model.js"
import Product from "../models/product.model.js"

const ITEMS_PER_PAGE = 12

export const createPurchaseOrderService = async (buyerId, products) => {
  if (!mongoose.isValidObjectId(buyerId)) {
    const error = new Error("El usuario no es válido")
    error.status = 400
    throw error
  }

  if (!Array.isArray(products) || products.length === 0) {
    const error = new Error("La compra debe contener al menos un producto")
    error.status = 400
    throw error
  }

  const session = await mongoose.startSession()

  try {
    let purchaseOrder

    await session.withTransaction(async () => {
      const orderProducts = []
      let total = 0

      for (const item of products) {
        if (
          !mongoose.isValidObjectId(item.productId) ||
          !Number.isInteger(item.quantity) ||
          item.quantity < 1
        ) {
          const error = new Error("Los datos de un producto no son válidos")
          error.status = 400
          throw error
        }

        const product = await Product.findOneAndUpdate(
          {
            _id: item.productId,
            isActive: true,
            stock: { $gte: item.quantity },
          },
          {
            $inc: { stock: -item.quantity },
          },
          {
            new: true,
            session,
          },
        )

        if (!product) {
          const error = new Error(
            `El producto ${item.productId} no existe, no está disponible o no tiene stock suficiente`,
          )
          error.status = 400
          throw error
        }

        const totalPrice = product.precio * item.quantity

        orderProducts.push({
          productId: product._id,
          quantity: item.quantity,
          totalPrice,
        })

        total += totalPrice
      }

      const orders = await PurchaseOrder.create(
        [
          {
            products: orderProducts,
            total,
            buyer: buyerId,
            status: "Accepted",
          },
        ],
        { session },
      )

      purchaseOrder = orders[0]
    })

    return purchaseOrder
  } finally {
    await session.endSession()
  }
}

export const getAllPurchaseOrdersService = async (page = 1) => {
  const currentPage = Math.max(1, Number(page) || 1)
  const skip = (currentPage - 1) * ITEMS_PER_PAGE

  const [orders, total] = await Promise.all([
    PurchaseOrder.find()
      .populate("buyer", "name email")
      .populate("products.productId", "nombre precio imagenUrl")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(ITEMS_PER_PAGE)
      .lean(),

    PurchaseOrder.countDocuments(),
  ])

  return {
    orders,
    pagination: {
      total,
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      totalPages: Math.ceil(total / ITEMS_PER_PAGE),
    },
  }
}

export const getPurchaseOrdersByBuyerService = async (
  buyerId,
  page = 1,
) => {
  if (!mongoose.isValidObjectId(buyerId)) {
    const error = new Error("El usuario no es válido")
    error.status = 400
    throw error
  }

  const currentPage = Math.max(1, Number(page) || 1)
  const skip = (currentPage - 1) * ITEMS_PER_PAGE

  const [orders, total] = await Promise.all([
    PurchaseOrder.find({ buyer: buyerId })
      .populate("buyer", "name email")
      .populate("products.productId", "nombre precio imagenUrl")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(ITEMS_PER_PAGE)
      .lean(),

    PurchaseOrder.countDocuments({ buyer: buyerId }),
  ])

  return {
    orders,
    pagination: {
      total,
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      totalPages: Math.ceil(total / ITEMS_PER_PAGE),
    },
  }
}
