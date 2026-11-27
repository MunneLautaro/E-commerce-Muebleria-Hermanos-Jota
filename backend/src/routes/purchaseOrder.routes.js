import { Router } from "express"
import {
  createPurchaseOrder,
  getAllPurchaseOrders,
  getPurchaseOrdersByBuyer,
} from "../controllers/purchaseOrder.controller.js"
import {
  requireActiveUser,
  requireAdmin,
  requireAuth,
  requireOwnerOrAdmin,
} from "../middlewares/auth.js"
import { purchaseOrderWriteRateLimit } from "../middlewares/rateLimit.js"
import { validate, validateQuery } from "../middlewares/validate.js"
import { createPurchaseOrderSchema } from "../schemas/purchaseOrder.schema.js"
import { purchaseOrderQuerySchema } from "../schemas/purchaseOrder.query.schema.js"

const router = Router()

router.post(
  "/",
  requireAuth,
  requireActiveUser,
  purchaseOrderWriteRateLimit,
  validate(createPurchaseOrderSchema),
  createPurchaseOrder,
)
router.get(
  "/",
  requireAuth,
  requireAdmin,
  validateQuery(purchaseOrderQuerySchema),
  getAllPurchaseOrders,
)
router.get(
  "/usuario/:compradorId",
  requireAuth,
  requireOwnerOrAdmin("compradorId"),
  validateQuery(purchaseOrderQuerySchema),
  getPurchaseOrdersByBuyer,
)

export default router
