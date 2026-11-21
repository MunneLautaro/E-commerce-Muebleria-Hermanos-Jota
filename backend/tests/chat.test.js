import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import request from "supertest"
import app from "../src/app.js"

const WEBHOOK_URL = "https://n8n.example.com/webhook/chat"

// Simula la respuesta de fetch que devuelve el webhook de n8n.
const webhookResponse = (payload, { ok = true } = {}) => ({
  ok,
  json: async () => payload,
})

const sendChat = (body) => request(app).post("/api/chat").send(body)

let fetchMock

beforeEach(() => {
  fetchMock = vi.fn().mockResolvedValue(webhookResponse({ output: "Hola" }))
  vi.stubGlobal("fetch", fetchMock)
  vi.stubEnv("N8N_CHAT_WEBHOOK_URL", WEBHOOK_URL)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe("POST /api/chat", () => {
  it("reenvía el mensaje al webhook y devuelve la respuesta", async () => {
    const res = await sendChat({ message: "¿Hacen envíos?", sessionId: "s-1" })

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ message: "Hola", sessionId: "s-1" })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toBe(WEBHOOK_URL)
    expect(options.method).toBe("POST")
    expect(options.signal).toBeInstanceOf(AbortSignal)
    expect(JSON.parse(options.body)).toEqual({
      action: "sendMessage",
      chatInput: "¿Hacen envíos?",
      sessionId: "s-1",
    })
  })

  it("recorta los espacios del mensaje y del sessionId", async () => {
    await sendChat({ message: "  Hola  ", sessionId: "  s-1  " })

    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      chatInput: "Hola",
      sessionId: "s-1",
    })
  })

  it.each([
    ["sin sessionId", {}],
    ["con un sessionId vacío", { sessionId: "   " }],
    ["con un sessionId que no es texto", { sessionId: 123 }],
  ])("devuelve sessionId null %s", async (_caso, extra) => {
    const res = await sendChat({ message: "Hola", ...extra })

    expect(res.status).toBe(200)
    expect(res.body.sessionId).toBeNull()
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).not.toHaveProperty(
      "sessionId",
    )
  })

  it.each([
    ["un objeto con output", { output: "Respuesta" }],
    ["un objeto con response", { response: "Respuesta" }],
    ["un objeto con text", { text: "Respuesta" }],
    ["un objeto con message", { message: "Respuesta" }],
    ["un texto plano", "Respuesta"],
    ["un array de respuestas", [{ output: "" }, { output: "Respuesta" }]],
    ["un objeto anidado", { output: { text: "Respuesta" } }],
    ["texto con espacios alrededor", { output: "  Respuesta  " }],
  ])("extrae el texto de %s", async (_caso, payload) => {
    fetchMock.mockResolvedValue(webhookResponse(payload))

    const res = await sendChat({ message: "Hola" })

    expect(res.status).toBe(200)
    expect(res.body.message).toBe("Respuesta")
  })

  it.each([
    ["sin mensaje", {}, "El mensaje es obligatorio"],
    ["con un mensaje vacío", { message: "   " }, "El mensaje es obligatorio"],
    ["con un mensaje que no es texto", { message: 42 }, "El mensaje es obligatorio"],
    [
      "con un mensaje de más de 2000 caracteres",
      { message: "a".repeat(2001) },
      "El mensaje no puede superar los 2000 caracteres",
    ],
  ])("devuelve 400 %s", async (_caso, body, error) => {
    const res = await sendChat(body)

    expect(res.status).toBe(400)
    expect(res.body.error).toBe(error)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("acepta un mensaje de exactamente 2000 caracteres", async () => {
    const res = await sendChat({ message: "a".repeat(2000) })

    expect(res.status).toBe(200)
  })

  it("devuelve 503 si el webhook no está configurado", async () => {
    vi.stubEnv("N8N_CHAT_WEBHOOK_URL", "")

    const res = await sendChat({ message: "Hola" })

    expect(res.status).toBe(503)
    expect(res.body.error).toBe("El chatbot no está configurado")
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("devuelve 502 si el webhook responde con error", async () => {
    fetchMock.mockResolvedValue(
      webhookResponse({ output: "Algo" }, { ok: false }),
    )

    const res = await sendChat({ message: "Hola" })

    expect(res.status).toBe(502)
    expect(res.body.error).toBe("El chatbot no pudo procesar el mensaje")
  })

  it.each([
    ["una respuesta sin texto", { output: "" }],
    ["un objeto sin campos conocidos", { foo: "bar" }],
  ])("devuelve 502 si el webhook devuelve %s", async (_caso, payload) => {
    fetchMock.mockResolvedValue(webhookResponse(payload))

    const res = await sendChat({ message: "Hola" })

    expect(res.status).toBe(502)
    expect(res.body.error).toBe("El chatbot devolvió una respuesta inválida")
  })

  it("devuelve 502 si el webhook no devuelve JSON", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => {
        throw new SyntaxError("Unexpected token <")
      },
    })

    const res = await sendChat({ message: "Hola" })

    expect(res.status).toBe(502)
    expect(res.body.error).toBe("El chatbot devolvió una respuesta inválida")
  })

  it("devuelve 504 si el webhook tarda demasiado", async () => {
    fetchMock.mockRejectedValue(
      new DOMException("This operation was aborted", "AbortError"),
    )

    const res = await sendChat({ message: "Hola" })

    expect(res.status).toBe(504)
    expect(res.body.error).toBe("El chatbot tardó demasiado en responder")
  })

  it("devuelve 500 sin detalles si falla la conexión con el webhook", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"))

    const res = await sendChat({ message: "Hola" })

    expect(res.status).toBe(500)
    expect(res.body.error).toBe("Error interno del servidor")
  })
})
