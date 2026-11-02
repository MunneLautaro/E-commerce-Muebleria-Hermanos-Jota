import "dotenv/config"
import mongoose from "mongoose"
import Product from "../models/product.model.js"
import { products } from "../data/products.js"

const prices = [
  780000, 620000, 450000, 890000, 560000, 320000, 1000000, 940000, 390000,
  680000, 510000,
]

const stocks = [8, 12, 15, 5, 10, 18, 4, 6, 20, 9, 14]

const skus = [
  "HJ-001",
  "HJ-002",
  "HJ-003",
  "HJ-004",
  "HJ-005",
  "HJ-006",
  "HJ-007",
  "HJ-008",
  "HJ-009",
  "HJ-010",
  "HJ-011",
]

const getAttributes = (product) =>
  Object.entries(product)
    .filter(
      ([key, value]) =>
        !["id", "nombre", "descripcion", "medidas", "vendidos", "image"].includes(
          key,
        ) &&
        value !== undefined &&
        value !== null &&
        value !== "",
    )
    .map(([clave, valor]) => ({
      clave: clave.replaceAll("_", " "),
      valor: String(valor),
    }))

const seedProducts = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI no está configurado")
  }

  await mongoose.connect(process.env.MONGODB_URI)

  for (const [index, product] of products.entries()) {
    await Product.findOneAndUpdate(
      {
        $or: [{ sku: skus[index] }, { nombre: product.nombre }],
      },
      {
        sku: skus[index],
        nombre: product.nombre,
        descripcion: product.descripcion,
        medidas: product.medidas || "",
        precio: prices[index],
        stock: stocks[index],
        imagenUrl: product.image,
        atributos: getAttributes(product),
        isActive: true,
      },
      {
        upsert: true,
        returnDocument: "after",
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    )
  }

  console.log(`${products.length} productos sembrados correctamente`)
}

try {
  await seedProducts()
} catch (error) {
  console.error("No se pudieron sembrar los productos:", error.message)
  process.exitCode = 1
} finally {
  await mongoose.disconnect()
}
