import jwt from "jsonwebtoken"

const getSecret = () => {
  if (!process.env.JWT_SECRET) {
    const error = new Error("JWT_SECRET no está configurado")
    error.status = 500
    throw error
  }

  return process.env.JWT_SECRET
}

export const requireAuth = (req, res, next) => {
  const authorization = req.headers.authorization
  const bearerToken = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : null
  const token = req.cookies?.hjAuthToken || bearerToken

  if (!token) {
    return res.status(401).json({ error: "Token de autenticación requerido" })
  }

  try {
    req.user = jwt.verify(token, getSecret())
    next()
  } catch (error) {
    if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Token inválido o expirado" })
    }

    next(error)
  }
}
