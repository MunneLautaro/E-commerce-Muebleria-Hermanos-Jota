export const validate = (schema, property = "body") => async (req, res, next) => {
  try {
    req[property] = await schema.validate(req[property], {
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
