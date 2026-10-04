const whitelist = (process.env.CORS_WHITELIST || "http://localhost:5173,http://localhost:5174")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)

const corsOptions = {
  origin(origin, callback) {
    if (!origin || whitelist.includes(origin)) {
      return callback(null, true)
    }

    const error = new Error("No permitido por políticas de CORS (Empresa)")
    error.status = 403
    error.isCors = true
    callback(error)
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}

export default corsOptions
