
import {
  createPurchaseOrderService,
  getAllPurchaseOrdersService,
  getPurchaseOrdersByBuyerService,
} from "../services/purchaseOrder.service.js"

export const createPurchaseOrder = async (req, res, next) => {
  try {
    const buyerId = req.user.sub
    const { products } = req.body

    const purchaseOrder = await createPurchaseOrderService(
      buyerId,
      products,
    )

    return res.status(201).json({
      message: "Orden de compra creada correctamente",
      purchaseOrder,
    })
  } catch (error) {
    next(error)
  }
}

export const getAllPurchaseOrders = async (req, res, next) => {
  try {
    const page = req.query.page || 1

    const result = await getAllPurchaseOrdersService(page)

    return res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

export const getPurchaseOrdersByBuyer = async (req, res, next) => {
  try {
    const buyerId = req.params.buyerId
    const page = req.query.page || 1

    const result = await getPurchaseOrdersByBuyerService(
      buyerId,
      page,
    )

    return res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}
