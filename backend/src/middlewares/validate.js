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
