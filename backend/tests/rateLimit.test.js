import { describe, expect, it, vi } from "vitest"
import express from "express"
import request from "supertest"

// setup.js reemplaza los limiters por un passThrough para el resto de los
// tests; acá se usan los reales, montados en una app mínima.
const limiters = await vi.importActual("../src/middlewares/rateLimit.js")

const appWith = (limiter) => {
  const app = express()
  app.post("/", limiter, (req, res) => res.json({ ok: true }))
  return app
}

describe("rate limit", () => {
  it.each([
    ["authRateLimit", 10],
    ["chatRateLimit", 20],
    ["contactRateLimit", 5],
    ["productWriteRateLimit", 30],
  ])("%s permite %d pedidos y después responde 429", async (name, limit) => {
    const agent = request(appWith(limiters[name]))

    for (let i = 0; i < limit; i += 1) {
      const res = await agent.post("/")
      expect(res.status).toBe(200)
    }

    const blocked = await agent.post("/")

    expect(blocked.status).toBe(429)
    expect(blocked.body).toEqual({
      error: "Demasiadas solicitudes. Intentá nuevamente más tarde.",
    })
  })

  it("informa el límite con los headers estándar y no con los legacy", async () => {
    // Los headers se envían tanto en las respuestas permitidas como en el 429.
    const res = await request(appWith(limiters.authRateLimit)).post("/")

    expect(res.headers).toHaveProperty("ratelimit-policy")
    expect(res.headers).toHaveProperty("ratelimit")
    expect(res.headers).not.toHaveProperty("x-ratelimit-limit")
  })
})
