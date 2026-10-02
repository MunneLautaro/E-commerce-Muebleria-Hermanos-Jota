import express from "express"
import { logger } from "./middlewares/logger.js"
import cors from "cors"
import corsOptions from "./config/cors.js"
import { errorHandler } from "./middlewares/errorHandler.js"
import { products } from "./data/products.js"

const app = express()

app.use(logger)

app.use(express.json())
app.use(cors(corsOptions))

app.get("/", (req, res) => {
  res.send(
    "Este es un endpoint de prueba. La API está funcionando correctamente.",
  )
})

app.get("/api/productos", (req, res) => {
  res.json(products)
})

app.get("/api/productos/:id", (req, res) => {
  const product = products.find((product) => product.id === req.params.id)

  if (!product) {
    return res.status(404).json({
      error: "Producto no encontrado",
    })
  }

  res.json(product)
})

app.use(errorHandler)

export default app
