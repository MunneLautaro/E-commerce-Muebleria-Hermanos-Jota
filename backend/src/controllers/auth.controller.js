import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { OAuth2Client } from "google-auth-library"
import User from "../models/user.model.js"

const publicUser = (user) => ({
  id: user._id,
  email: user.email,
  name: user.name || "",
  picture: user.picture || "",
  authProvider: user.authProvider || "local",
  isActive: user.isActive,
  orders: user.orders,
  phone: user.phone,
  address: user.address,
})

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    const error = new Error("JWT_SECRET no está configurado")
    error.status = 500
    throw error
  }

  return process.env.JWT_SECRET
}

const getGoogleClient = () => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    const error = new Error("GOOGLE_CLIENT_ID no está configurado")
    error.status = 500
    throw error
  }

  return new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
}

const createToken = (user) => {
  return jwt.sign({ sub: user._id.toString(), email: user.email }, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  })
}

const handleDatabaseError = (error) => {
  if (error?.code === 11000) {
    const duplicateError = new Error("El email ya está registrado")
    duplicateError.status = 409
    return duplicateError
  }

  if (error?.name === "MongooseError" && error.message.includes("Cannot call")) {
    const databaseError = new Error("La base de datos no está disponible")
    databaseError.status = 503
    return databaseError
  }

  return error
}

export const register = async (req, res, next) => {
  try {
    getJwtSecret()
    const { email, password, phone, address } = req.body
    const existingUser = await User.findOne({ email }).lean()

    if (existingUser) {
      return res.status(409).json({ error: "El email ya está registrado" })
    }

    const user = await User.create({
      email,
      password: await bcrypt.hash(password, 12),
      phone,
      address,
      isActive: true,
      orders: [],
    })

    const token = createToken(user)
    return res.status(201).json({ token, user: publicUser(user) })
  } catch (error) {
    next(handleDatabaseError(error))
  }
}

export const login = async (req, res, next) => {
  try {
    getJwtSecret()
    const { email, password } = req.body
    const user = await User.findOne({ email }).select("+password")

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Email o contraseña incorrectos" })
    }

    if (!user.isActive) {
      return res.status(403).json({ error: "El usuario está inactivo" })
    }

    return res.json({ token: createToken(user), user: publicUser(user) })
  } catch (error) {
    next(handleDatabaseError(error))
  }
}

export const googleLogin = async (req, res, next) => {
  try {
    getJwtSecret()
    const { credential } = req.body
    const client = getGoogleClient()

    let ticket
    try {
      ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      })
    } catch {
      return res.status(401).json({ error: "Token de Google inválido o expirado" })
    }

    const payload = ticket.getPayload()
    if (!payload?.sub || !payload.email || payload.email_verified !== true) {
      return res.status(400).json({ error: "No se pudo obtener la información de Google" })
    }

    const { sub: googleId, email, name, picture } = payload
    const normalizedEmail = email.toLowerCase().trim()

    let user = await User.findOne({ googleId })

    if (!user) {
      user = await User.findOne({ email: normalizedEmail })

      if (user) {
        user.googleId = googleId
        if (!user.name && name) user.name = name
        if (!user.picture && picture) user.picture = picture
        await user.save()
      } else {
        user = await User.create({
          email: normalizedEmail,
          googleId,
          name: name || "",
          picture: picture || "",
          authProvider: "google",
          isActive: true,
          orders: [],
        })
      }
    }

    if (!user.isActive) {
      return res.status(403).json({ error: "El usuario está inactivo" })
    }

    const token = createToken(user)
    return res.json({ token, user: publicUser(user) })
  } catch (error) {
    next(handleDatabaseError(error))
  }
}

export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.sub)

    if (!user || !user.isActive) {
      return res.status(401).json({ error: "Usuario no disponible" })
    }

    return res.json({ user: publicUser(user) })
  } catch (error) {
    next(handleDatabaseError(error))
  }
}
