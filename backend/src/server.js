import "dotenv/config"
import mongoose from "mongoose"
import app from "./index.js"
import dns from "node:dns"

dns.setServers(["8.8.8.8", "8.8.4.4"])

const PORT = process.env.PORT || 3000

const startServer = async () => {
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI)
      console.log("Conectado a MongoDB")
    } catch (error) {
      console.error("No se pudo conectar a MongoDB:", error.message)
      process.exitCode = 1
      return
    }
  } else {
    console.warn(
      "MONGODB_URI no está configurado; las rutas de autenticación no estarán disponibles",
    )
  }

  app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`)
  })
}

startServer()
