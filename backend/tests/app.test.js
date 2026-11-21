import { afterEach, describe, expect, it, vi } from "vitest"
import request from "supertest"
import mongoose from "mongoose"
import app from "../src/app.js"

// Origin incluido en CORS_WHITELIST (ver vitest.config.js).
const ALLOWED_ORIGIN = "http://localhost:5173"

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("GET /health", () => {
  it("responde ok", async () => {
    const res = await request(app).get("/health")

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: "ok" })
  })
})

describe("GET /ready", () => {
  it("responde 200 con la base conectada", async () => {
    const res = await request(app).get("/ready")

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: "ready", database: "connected" })
  })

  it("responde 503 si la base no está conectada", async () => {
    const readyState = vi
      .spyOn(mongoose.connection, "readyState", "get")
      .mockReturnValue(0)

    try {
      const res = await request(app).get("/ready")

      expect(res.status).toBe(503)
      expect(res.body).toEqual({
        status: "not_ready",
        database: "disconnected",
      })
    } finally {
      readyState.mockRestore()
    }
  })
})

describe("rutas inexistentes", () => {
  it.each(["/no-existe", "/api/no-existe", "/api/products/admin/1/extra"])(
    "%s devuelve 404",
    async (path) => {
      const res = await request(app).get(path)

      expect(res.status).toBe(404)
      expect(res.body).toEqual({ error: "Ruta no encontrada" })
    },
  )
})

describe("conexión a la base en /api", () => {
  it("devuelve 503 si no se puede conectar a MongoDB", async () => {
    vi.stubEnv("MONGODB_URI", "")

    const res = await request(app).get("/api/products")

    expect(res.status).toBe(503)
    expect(res.body).toEqual({ error: "Base de datos no disponible" })
  })
})

describe("CORS", () => {
  it("permite un origin de la whitelist", async () => {
    const res = await request(app)
      .get("/api/products")
      .set("Origin", ALLOWED_ORIGIN)

    expect(res.status).toBe(200)
    expect(res.headers["access-control-allow-origin"]).toBe(ALLOWED_ORIGIN)
  })

  it("permite pedidos sin origin, como los de Postman o curl", async () => {
    const res = await request(app).get("/api/products")

    expect(res.status).toBe(200)
  })

  it("rechaza con 403 un origin fuera de la whitelist", async () => {
    const res = await request(app)
      .get("/api/products")
      .set("Origin", "https://sitio-malicioso.example.com")

    expect(res.status).toBe(403)
    expect(res.body).toEqual({
      error: "No permitido por políticas de CORS (Empresa)",
    })
    expect(res.headers).not.toHaveProperty("access-control-allow-origin")
  })

  it("responde el preflight y habilita el header Authorization", async () => {
    const res = await request(app)
      .options("/api/products")
      .set("Origin", ALLOWED_ORIGIN)
      .set("Access-Control-Request-Method", "PUT")
      .set("Access-Control-Request-Headers", "Authorization, Content-Type")

    expect(res.status).toBe(204)
    expect(res.headers["access-control-allow-origin"]).toBe(ALLOWED_ORIGIN)
    expect(res.headers["access-control-allow-methods"]).toContain("PUT")
    expect(res.headers["access-control-allow-headers"]).toContain(
      "Authorization",
    )
  })
})

describe("body de la petición", () => {
  it("devuelve 400 con un JSON mal formado", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send('{"email": "ana@example.com",')

    expect(res.status).toBe(400)
    expect(res.body.error).toEqual(expect.any(String))
  })

  it("devuelve 413 si el body supera el límite de tamaño", async () => {
    const res = await request(app)
      .post("/api/contacto")
      .send({ mensaje: "a".repeat(200 * 1024) })

    expect(res.status).toBe(413)
  })
})
