import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import User from "../src/models/user.model.js"
import Product from "../src/models/product.model.js"
import PurchaseOrder from "../src/models/purchaseOrder.model.js"

export const DEFAULT_PASSWORD = "password123"

export const validRegisterBody = (overrides = {}) => ({
  email: "cliente@example.com",
  password: DEFAULT_PASSWORD,
  phone: "+54 11 1234-5678",
  address: "Av. Siempre Viva 742",
  ...overrides,
})

export const createUser = async (overrides = {}) => {
  const { password = DEFAULT_PASSWORD, ...rest } = overrides
  return User.create({
    email: "cliente@example.com",
    password: await bcrypt.hash(password, 4),
    ...rest,
  })
}

export const signToken = (payload, options = {}) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h", ...options })

export const tokenFor = (user) =>
  signToken({ sub: user._id.toString(), email: user.email, role: user.role })

export const validProductBody = (overrides = {}) => ({
  nombre: "Mesa Palermo",
  descripcion: "Mesa de comedor en roble macizo",
  medidas: "180 X 90 X 75 cm",
  precio: 450000,
  stock: 5,
  imagenUrl: "/images/mesa-palermo.png",
  atributos: [{ clave: "Material", valor: "Roble" }],
  ...overrides,
})

let skuCounter = 0

// Crea un producto directamente en la base, sin pasar por la API.
export const createProduct = (overrides = {}) => {
  skuCounter += 1
  return Product.create({
    sku: `TEST-${String(skuCounter).padStart(6, "0")}`,
    ...validProductBody(),
    ...overrides,
  })
}

export const createPurchaseOrder = (comprador, overrides = {}) =>
  PurchaseOrder.create({
    productos: [
      {
        producto: new mongoose.Types.ObjectId(),
        cantidad: 1,
        subtotal: 1000,
      },
    ],
    total: 1000,
    comprador: comprador._id,
    ...overrides,
  })
