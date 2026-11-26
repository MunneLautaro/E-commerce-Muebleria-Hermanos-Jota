
import express from "express"
import {
  createPurchaseOrder,
  getAllPurchaseOrders,
  getPurchaseOrdersByBuyer,
} from "../controllers/purchaseOrder.controller.js"

import {
  requireAuth,
  requireAdmin,
} from "../middlewares/auth.js"

const router = express.Router()

// Crear una orden de compra: requiere autenticación
router.post("/", requireAuth, createPurchaseOrder)

// Obtener todas las órdenes: solamente administradores
router.get("/", requireAuth, requireAdmin, getAllPurchaseOrders)

// Ver las órdenes propias o las de otro usuario si es administrador
const authorizeBuyerOrAdmin = (req, res, next) => {
  const authenticatedUserId = req.user.sub
  const requestedBuyerId = req.params.buyerId

  if (authenticatedUserId === requestedBuyerId) {
    return next()
  }

  return requireAdmin(req, res, next)
}

router.get(
  "/user/:buyerId",
  requireAuth,
  authorizeBuyerOrAdmin,
  getPurchaseOrdersByBuyer,
)

export default router
