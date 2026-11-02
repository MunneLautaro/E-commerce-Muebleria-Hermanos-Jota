export const validate = (schema) => async (req, res, next) => {
  try {
    req.body = await schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    })
    next()
  } catch (error) {
    return res.status(400).json({
      error: "Datos inválidos",
      details: error.errors,
    })
  }
}

export const validateQuery = (schema) => async (req, res, next) => {
  try {
    req.validatedQuery = await schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    })
    next()
  } catch (error) {
    return res.status(400).json({
      error: "Parámetros inválidos",
      details: error.errors,
    })
  }
}
