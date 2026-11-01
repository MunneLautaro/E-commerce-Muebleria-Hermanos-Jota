import { rateLimit } from "express-rate-limit"

const jsonRateLimitHandler = (req, res) => {
  res.status(429).json({
    error: "Demasiadas solicitudes. Intentá nuevamente más tarde.",
  })
}

const createLimiter = (windowMs, limit) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: jsonRateLimitHandler,
  })

export const authRateLimit = createLimiter(15 * 60 * 1000, 10)
export const chatRateLimit = createLimiter(10 * 60 * 1000, 20)
export const contactRateLimit = createLimiter(60 * 60 * 1000, 5)
export const productWriteRateLimit = createLimiter(15 * 60 * 1000, 30)
