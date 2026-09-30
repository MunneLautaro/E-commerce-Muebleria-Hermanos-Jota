export function errorHandler(err, req, res, next) {
  if (err.isCors) {
    return res.status(403).json({ error: err.message })
  }

  console.error(err)
  res.status(err.status || 500).json({ error: "Error interno del servidor" })
}
