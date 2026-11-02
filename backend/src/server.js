import "dotenv/config"
import dns from "node:dns"
import mongoose from "mongoose"
import app from "./index.js"

const PORT = process.env.PORT || 3000

const configureDnsServers = () => {
  const servers = (process.env.MONGODB_DNS_SERVERS || "1.1.1.1,8.8.8.8")
    .split(",")
    .map((server) => server.trim())
    .filter(Boolean)

  if (servers.length === 0) {
    throw new Error("MONGODB_DNS_SERVERS debe contener al menos un servidor DNS")
  }

  dns.setServers(servers)
}

const startServer = async () => {
  if (!process.env.MONGODB_URI && process.env.NODE_ENV === "production") {
    console.error("MONGODB_URI debe estar configurado en producción")
    process.exitCode = 1
    return
  }

  if (process.env.MONGODB_URI) {
    try {
      configureDnsServers()
      await mongoose.connect(process.env.MONGODB_URI)
      console.log("Conectado a MongoDB")
    } catch (error) {
      console.error("No se pudo conectar a MongoDB:", error.message)
      process.exitCode = 1
      return
    }
  } else {
    console.warn(
      "MONGODB_URI no está configurado; las rutas que requieren persistencia no estarán disponibles",
    )
  }

  app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`)
  })
}

startServer()
