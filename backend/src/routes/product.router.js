import { Router } from "express"
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
} from "../controllers/product.controller.js"
import { validate } from "../middlewares/validate.js"
import { createProductSchema } from "../schemas/product.schema.js"
import { updateProductSchema } from "../schemas/product.schema.js"

const router = Router()

router.post("/", validate(createProductSchema), createProduct)
router.get("/", getProducts)
router.get("/:id", getProductById)
router.put("/:id", validate(updateProductSchema), updateProduct)

export default router
