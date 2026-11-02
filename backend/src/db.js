import dns from "node:dns"
import mongoose from "mongoose"

const configureDnsServers = () => {
  const servers = (process.env.MONGODB_DNS_SERVERS || "1.1.1.1,8.8.8.8")
    .split(",")
    .map((server) => server.trim())
    .filter(Boolean)

  if (servers.length === 0) {
    throw new Error(
      "MONGODB_DNS_SERVERS debe contener al menos un servidor DNS",
    )
  }

  dns.setServers(servers)
}

if (process.env.NODE_ENV !== "production") {
  configureDnsServers()
}

const cached =
  global.mongooseCache || (global.mongooseCache = { conn: null, promise: null })

export async function connectDB() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI no está configurado")
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (error) {
    cached.promise = null
    cached.conn = null
    throw error
  }

  return cached.conn
}
