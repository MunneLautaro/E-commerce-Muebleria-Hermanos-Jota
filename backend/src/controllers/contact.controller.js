import { createContactService } from "../services/contact.service.js"

export const createContact = async (req, res, next) => {
  try {
    await createContactService(req.body)
    return res.status(201).json({ message: "Consulta recibida correctamente" })
  } catch (error) {
    return next(error)
  }
}
