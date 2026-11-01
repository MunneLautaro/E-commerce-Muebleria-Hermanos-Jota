import { Router } from "express"
import {
  createProduct,
  getProducts,
  getProductById,
} from "../controllers/product.controller.js"
import { validate } from "../middlewares/validate.js"
import { createProductSchema } from "../schemas/product.schema.js"

const router = Router()

router.post("/", validate(createProductSchema), createProduct)
router.get("/", getProducts)
router.get("/:id", getProductById)

export default router
