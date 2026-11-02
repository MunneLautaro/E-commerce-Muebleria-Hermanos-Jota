import { Router } from "express"
import {
  getCurrentUser,
  googleLogin,
  login,
  logout,
  register,
} from "../controllers/auth.controller.js"
import { requireAuth } from "../middlewares/auth.js"
import { authRateLimit } from "../middlewares/rateLimit.js"
import { validate } from "../middlewares/validate.js"
import {
  googleAuthSchema,
  loginSchema,
  registerSchema,
} from "../schemas/auth.schema.js"

const router = Router()

router.post("/register", authRateLimit, validate(registerSchema), register)
router.post("/login", authRateLimit, validate(loginSchema), login)
router.post("/google", authRateLimit, validate(googleAuthSchema), googleLogin)
router.post("/logout", logout)
router.get("/me", requireAuth, getCurrentUser)

export default router
