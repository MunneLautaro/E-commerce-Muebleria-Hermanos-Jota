const CHAT_TIMEOUT_MS = 30000

function getResponseText(payload) {
  if (typeof payload === "string") return payload.trim()

  if (Array.isArray(payload)) {
    for (const item of payload) {
      const text = getResponseText(item)
      if (text) return text
    }
    return ""
  }

  if (payload && typeof payload === "object") {
    for (const key of ["output", "response", "text", "message"]) {
      const text = getResponseText(payload[key])
      if (text) return text
    }
  }

  return ""
}

export async function sendChatMessage({ message, sessionId }) {
  const webhookUrl = process.env.N8N_CHAT_WEBHOOK_URL

  if (!webhookUrl) {
    const error = new Error("El chatbot no está configurado")
    error.status = 503
    error.expose = true
    throw error
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), CHAT_TIMEOUT_MS)

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "sendMessage",
        chatInput: message,
        sessionId,
      }),
      signal: controller.signal,
    })

    const payload = await response.json().catch(() => null)

    if (!response.ok) {
      const error = new Error("El chatbot no pudo procesar el mensaje")
      error.status = 502
      error.expose = true
      throw error
    }

    const text = getResponseText(payload)
    if (!text) {
      const error = new Error("El chatbot devolvió una respuesta inválida")
      error.status = 502
      error.expose = true
      throw error
    }

    return { message: text, sessionId: sessionId || null }
  } catch (error) {
    if (error.name === "AbortError") {
      const timeoutError = new Error("El chatbot tardó demasiado en responder")
      timeoutError.status = 504
      timeoutError.expose = true
      throw timeoutError
    }

    throw error
  } finally {
    clearTimeout(timeout)
  }
}
