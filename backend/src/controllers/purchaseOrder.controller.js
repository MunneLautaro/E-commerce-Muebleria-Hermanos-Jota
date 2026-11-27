import {
  createPurchaseOrderService,
  getAllPurchaseOrdersService,
  getPurchaseOrdersByBuyerService,
} from "../services/purchaseOrder.service.js"

export const createPurchaseOrder = async (req, res, next) => {
  try {
    const purchaseOrder = await createPurchaseOrderService(
      req.user.sub,
      req.body.productos,
    )

    return res.status(201).json(purchaseOrder)
  } catch (error) {
    return next(error)
  }
}

export const getAllPurchaseOrders = async (req, res, next) => {
  try {
    const purchaseOrders = await getAllPurchaseOrdersService(req.validatedQuery)
    return res.json(purchaseOrders)
  } catch (error) {
    return next(error)
  }
}

export const getPurchaseOrdersByBuyer = async (req, res, next) => {
  try {
    const purchaseOrders = await getPurchaseOrdersByBuyerService(
      req.params.compradorId,
      req.validatedQuery,
    )
    return res.json(purchaseOrders)
  } catch (error) {
    return next(error)
  }
}
