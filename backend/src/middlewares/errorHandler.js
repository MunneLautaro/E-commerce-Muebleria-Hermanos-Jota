export function errorHandler(err, req, res, next) {
  if (err.isCors) {
    return res.status(403).json({ error: err.message })
  }

  console.error(err)
  if (err.code === 11000) {
    return res.status(409).json({ error: "El recurso ya existe" })
  }

  if (err.name === "ValidationError" || err.name === "CastError") {
    return res.status(400).json({ error: "Datos inválidos" })
  }

  if (
    err.name === "MongoServerSelectionError" ||
    err.name === "MongooseServerSelectionError" ||
    (err.name === "MongooseError" &&
      /buffering timed out|Cannot call|topology was destroyed/i.test(err.message))
  ) {
    return res.status(503).json({ error: "La base de datos no está disponible" })
  }

  res.status(err.status ?? err.statusCode ?? 500).json({
    error: err.expose ? err.message : "Error interno del servidor",
  })
}
