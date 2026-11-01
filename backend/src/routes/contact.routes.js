import { Router } from "express"
import { createContact } from "../controllers/contact.controller.js"
import { validate } from "../middlewares/validate.js"
import { createContactSchema } from "../schemas/contact.schema.js"

const contactRoutes = Router()

contactRoutes.post("/", validate(createContactSchema), createContact)

export default contactRoutes
