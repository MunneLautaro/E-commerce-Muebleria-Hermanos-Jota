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
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      return res.status(401).json({ error: "Token inválido o expirado" })
    }

    next(error)
  }
}

const findAuthenticatedUser = (req) => {
  const userId = req.user?.sub

  return mongoose.isValidObjectId(userId)
    ? User.findById(userId).select("role isActive").lean()
    : null
}

const unavailableUser = (res) =>
  res.status(401).json({ error: "Usuario no disponible" })

export const requireActiveUser = async (req, res, next) => {
  try {
    const user = await findAuthenticatedUser(req)

    if (!user?.isActive) {
      return unavailableUser(res)
    }

    next()
  } catch (error) {
    next(error)
  }
}

export const requireOwnerOrAdmin = (param) => async (req, res, next) => {
  try {
    const user = await findAuthenticatedUser(req)

    if (!user?.isActive) {
      return unavailableUser(res)
    }

    if (req.params[param] !== req.user.sub && user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "No tenés permiso para ver los datos de otro usuario" })
    }

    next()
  } catch (error) {
    next(error)
  }
}

export const requireAdmin = async (req, res, next) => {
  try {
    const user = await findAuthenticatedUser(req)

    if (!user?.isActive) {
      return unavailableUser(res)
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
