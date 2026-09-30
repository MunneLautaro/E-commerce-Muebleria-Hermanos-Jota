import express from "express"
import { logger } from "./middlewares/logger.js"
import cors from "cors"
import corsOptions from "./config/cors.js"
import { errorHandler } from "./middlewares/errorHandler.js"

const app = express()

app.use(logger)

app.use(express.json())
app.use(cors(corsOptions))

app.get("/", (req, res) => {
  res.send(
    "Este es un endpoint de prueba. La API está funcionando correctamente.",
  )
})

app.use(errorHandler)

export default app
