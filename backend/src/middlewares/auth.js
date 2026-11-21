import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import User from "../models/user.model.js"

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
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice(7).trim()
    : null

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

// El rol se lee de la base y no del token: así un admin desactivado, borrado
// o degradado pierde el acceso de inmediato y no recién cuando vence su JWT.
export const requireAdmin = async (req, res, next) => {
  try {
    const userId = req.user?.sub
    const user = mongoose.isValidObjectId(userId)
      ? await User.findById(userId).select("role isActive").lean()
      : null

    if (!user || !user.isActive) {
      return res.status(401).json({ error: "Usuario no disponible" })
    }

    if (user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Se requieren permisos de administrador" })
    }

    next()
  } catch (error) {
    next(error)
  }
}
