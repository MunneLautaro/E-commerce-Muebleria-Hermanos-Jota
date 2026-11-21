import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { errorHandler } from "../src/middlewares/errorHandler.js"

const namedError = (name, message = "error", extra = {}) =>
  Object.assign(new Error(message), { name, ...extra })

// Llama al middleware directamente y devuelve lo que respondió.
const handle = (err) => {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  }
  errorHandler(err, {}, res, vi.fn())
  return { status: res.status.mock.calls[0][0], body: res.json.mock.calls[0][0] }
}

let consoleError

beforeEach(() => {
  consoleError = vi.spyOn(console, "error").mockImplementation(() => {})
})

afterEach(() => {
  consoleError.mockRestore()
})

describe("errorHandler", () => {
  it("responde 403 a los errores de CORS sin loguearlos", () => {
    const err = Object.assign(new Error("No permitido"), { isCors: true })

    expect(handle(err)).toEqual({ status: 403, body: { error: "No permitido" } })
    expect(consoleError).not.toHaveBeenCalled()
  })

  it("responde 409 a una clave duplicada de MongoDB", () => {
    const err = Object.assign(new Error("E11000 duplicate key"), { code: 11000 })

    expect(handle(err)).toEqual({
      status: 409,
      body: { error: "El recurso ya existe" },
    })
  })

  it.each(["ValidationError", "CastError"])(
    "responde 400 a un %s de Mongoose",
    (name) => {
      expect(handle(namedError(name))).toEqual({
        status: 400,
        body: { error: "Datos inválidos" },
      })
    },
  )

  it.each([
    ["MongoServerSelectionError", "connection refused"],
    ["MongooseServerSelectionError", "connection refused"],
    ["MongooseError", "Operation `products.find()` buffering timed out"],
    ["MongooseError", "Cannot call `products.find()` before connection"],
    ["MongooseError", "topology was destroyed"],
  ])("responde 503 a un %s (%s)", (name, message) => {
    expect(handle(namedError(name, message))).toEqual({
      status: 503,
      body: { error: "La base de datos no está disponible" },
    })
  })

  it("no confunde otro MongooseError con una caída de la base", () => {
    expect(handle(namedError("MongooseError", "otro problema")).status).toBe(500)
  })

  it("expone el mensaje de un error marcado con expose", () => {
    const err = Object.assign(new Error("El SKU ya está registrado"), {
      status: 409,
      expose: true,
    })

    expect(handle(err)).toEqual({
      status: 409,
      body: { error: "El SKU ya está registrado" },
    })
  })

  it("usa statusCode si el error no tiene status", () => {
    const err = Object.assign(new Error("x"), { statusCode: 422, expose: true })

    expect(handle(err).status).toBe(422)
  })

  it("oculta el mensaje de un error inesperado y responde 500", () => {
    const err = new Error("password de la base: secreto")

    expect(handle(err)).toEqual({
      status: 500,
      body: { error: "Error interno del servidor" },
    })
  })

  it("oculta el mensaje si el error tiene status pero no expose", () => {
    const err = Object.assign(new Error("detalle interno"), { status: 502 })

    expect(handle(err)).toEqual({
      status: 502,
      body: { error: "Error interno del servidor" },
    })
  })

  it("loguea los errores que no son de CORS", () => {
    const err = new Error("boom")

    handle(err)

    expect(consoleError).toHaveBeenCalledWith(err)
  })
})
