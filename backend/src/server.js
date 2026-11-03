import "dotenv/config"
import app from "./index.js"
import { connectDB } from "./db.js"

const PORT = process.env.PORT || 3000

const startServer = async () => {
  try {
    await connectDB()
    console.log("Conectado a MongoDB")
  } catch (error) {
    console.error("No se pudo conectar a MongoDB:", error.message)
    process.exitCode = 1
    return
  }

  app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`)
  })
}

startServer()
