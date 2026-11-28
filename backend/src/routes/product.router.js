import { Router } from "express"
import {
  createProduct,
  getProducts,
  getAdminProducts,
  getProductById,
  getAdminProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js"
import { validate, validateQuery } from "../middlewares/validate.js"
import { requireAdmin, requireAuth } from "../middlewares/auth.js"
import { productWriteRateLimit } from "../middlewares/rateLimit.js"
import {
  createProductSchema,
  updateProductSchema,
} from "../schemas/product.schema.js"
import {
  adminProductQuerySchema,
  productQuerySchema,
} from "../schemas/product.query.schema.js"

const router = Router()

router.post(
  "/",
  requireAuth,
  requireAdmin,
  productWriteRateLimit,
  validate(createProductSchema),
  createProduct,
)
router.get("/", validateQuery(productQuerySchema), getProducts)
router.get(
  "/admin",
  requireAuth,
  requireAdmin,
  validateQuery(adminProductQuerySchema),
  getAdminProducts,
)
router.get(
  "/admin/:id",
  requireAuth,
  requireAdmin,
  getAdminProductById,
)
router.get("/:id", getProductById)
router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  productWriteRateLimit,
  validate(updateProductSchema),
  updateProduct,
)
router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  productWriteRateLimit,
  deleteProduct,
)

export default router
