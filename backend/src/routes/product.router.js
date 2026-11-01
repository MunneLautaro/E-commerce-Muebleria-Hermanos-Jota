import { Router } from "express"
import {
  getProducts,
  getProductById,
  updateProduct,
} from "../controllers/product.controller.js"
import { validate } from "../middlewares/validate.js"
import { updateProductSchema } from "../schemas/product.schema.js"

const router = Router()

router.get("/", getProducts)
router.get("/:id", getProductById)
router.put("/:id", validate(updateProductSchema), updateProduct)

export default router
