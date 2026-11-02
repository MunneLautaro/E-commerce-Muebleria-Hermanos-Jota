import { sendChatMessage } from "../services/chat.service.js"

export async function chatController(req, res, next) {
  const { message, sessionId } = req.body

  if (typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "El mensaje es obligatorio" })
  }

  if (message.length > 2000) {
    return res
      .status(400)
      .json({ error: "El mensaje no puede superar los 2000 caracteres" })
  }

  try {
    const reply = await sendChatMessage({
      message: message.trim(),
      sessionId:
        typeof sessionId === "string" && sessionId.trim()
          ? sessionId.trim()
          : undefined,
    })

    return res.json(reply)
  } catch (error) {
    return next(error)
  }
}
