import { Router } from "express"
import { createContact } from "../controllers/contact.controller.js"
import { contactRateLimit } from "../middlewares/rateLimit.js"
import { validate } from "../middlewares/validate.js"
import { createContactSchema } from "../schemas/contact.schema.js"

const contactRoutes = Router()

contactRoutes.post("/", contactRateLimit, validate(createContactSchema), createContact)

export default contactRoutes
