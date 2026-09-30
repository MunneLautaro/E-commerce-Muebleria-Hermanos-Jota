import express from "express"
import { logger } from "./middlewares/logger.js"

const app = express()

app.use(logger)

app.get("/", (req, res) => {
  res.send("Hola")
})

app.listen(3000, () => {
  console.log("Servidor en http://localhost:3000")
})
