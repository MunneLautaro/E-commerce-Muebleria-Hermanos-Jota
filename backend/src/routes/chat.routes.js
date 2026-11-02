import { Router } from "express"
import { chatController } from "../controllers/chat.controller.js"
import { chatRateLimit } from "../middlewares/rateLimit.js"

const chatRoutes = Router()

chatRoutes.post("/", chatRateLimit, chatController)

export default chatRoutes
