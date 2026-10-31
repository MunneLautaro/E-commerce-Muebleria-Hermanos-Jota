import express from "express"
import { logger } from "./middlewares/logger.js"
import cors from "cors"
import cookieParser from "cookie-parser"
import corsOptions from "./config/cors.js"
import { errorHandler } from "./middlewares/errorHandler.js"
import productRoutes from "./routes/product.router.js"
import authRoutes from "./routes/auth.routes.js"
import chatRoutes from "./routes/chat.routes.js"

const app = express()

app.use(logger)
app.use(express.json())
app.use(cookieParser())
app.use(cors(corsOptions))

app.use("/api/productos", productRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/chat", chatRoutes)

app.use(errorHandler)

export default app
