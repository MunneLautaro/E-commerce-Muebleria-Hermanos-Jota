import { Router } from "express"
import {
  getCurrentUser,
  login,
  register,
} from "../controllers/auth.controller.js"
import { requireAuth } from "../middlewares/auth.js"
import { validate } from "../middlewares/validate.js"
import { loginSchema, registerSchema } from "../schemas/auth.schema.js"

const router = Router()

router.post("/register", validate(registerSchema), register)
router.post("/login", validate(loginSchema), login)
router.get("/me", requireAuth, getCurrentUser)

export default router
