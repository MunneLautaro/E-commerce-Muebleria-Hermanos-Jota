import { Router } from "express"
import {
  createProduct,
  deleteProduct,
  getProducts,
  getProductById,
  updateProduct,
} from "../controllers/product.controller.js"
import { requireAuth } from "../middlewares/auth.js"
import { validate } from "../middlewares/validate.js"
import {
  createProductSchema,
  productIdSchema,
  updateProductSchema,
} from "../schemas/product.schema.js"

const router = Router()

router.get("/", getProducts)
router.post("/", requireAuth, validate(createProductSchema), createProduct)
router.get("/:id", getProductById)
router.put(
  "/:id",
  requireAuth,
  validate(productIdSchema, "params"),
  validate(updateProductSchema),
  updateProduct,
)
router.delete(
  "/:id",
  requireAuth,
  validate(productIdSchema, "params"),
  deleteProduct,
)

export default router
