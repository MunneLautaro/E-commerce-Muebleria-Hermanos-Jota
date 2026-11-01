import express from "express"
import mongoose from "mongoose"
import { logger } from "./middlewares/logger.js"
import cors from "cors"
import cookieParser from "cookie-parser"
import corsOptions from "./config/cors.js"
import { errorHandler } from "./middlewares/errorHandler.js"
import productRoutes from "./routes/product.router.js"
import authRoutes from "./routes/auth.routes.js"
import chatRoutes from "./routes/chat.routes.js"
import contactRoutes from "./routes/contact.routes.js"

const app = express()

app.get("/health", (req, res) => {
  res.json({ status: "ok" })
})

app.get("/ready", (req, res) => {
  const ready = mongoose.connection.readyState === 1
  return res.status(ready ? 200 : 503).json({
    status: ready ? "ready" : "not_ready",
    database: ready ? "connected" : "disconnected",
  })
})

app.use(logger)
app.use(express.json())
app.use(cookieParser())
app.use(cors(corsOptions))

app.use("/api/products", productRoutes)
app.use("/api/productos", productRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/chat", chatRoutes)
app.use("/api/contacto", contactRoutes)

app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" })
})

app.use(errorHandler)

export default app
