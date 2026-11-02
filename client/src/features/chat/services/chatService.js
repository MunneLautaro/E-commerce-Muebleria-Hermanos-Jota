import { fetchApi } from "../../../services/api"

export function sendChatMessage(message, sessionId) {
  return fetchApi("/chat", {
    method: "POST",
    body: JSON.stringify({ message, sessionId }),
  })
}
