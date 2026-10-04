import express from "express"
import { logger } from "./middlewares/logger.js"
import cors from "cors"
import corsOptions from "./config/cors.js"
import { errorHandler } from "./middlewares/errorHandler.js"
import productRoutes from "./routes/productRoutes.js"

const app = express()

app.use(logger)

app.use(express.json())
app.use(cors(corsOptions))

app.use("/api/productos", productRoutes)

app.use(errorHandler)

export default app
