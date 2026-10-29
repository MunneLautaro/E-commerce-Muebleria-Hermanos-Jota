import { Router } from "express"
import { chatController } from "../controllers/chat.controller.js"

const chatRoutes = Router()

chatRoutes.post("/", chatController)

export default chatRoutes
