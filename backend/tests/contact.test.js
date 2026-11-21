import { describe, expect, it, vi } from "vitest"
import request from "supertest"
import mongoose from "mongoose"
import app from "../src/app.js"
import Contact from "../src/models/contact.model.js"

const validContactBody = (overrides = {}) => ({
  nombre: "Ana Pérez",
  email: "ana@example.com",
  telefono: "1123456789",
  motivo: "showroom",
  mensaje: "Quisiera coordinar una visita al showroom.",
  ...overrides,
})

const sendContact = (body) => request(app).post("/api/contacto").send(body)

describe("POST /api/contacto", () => {
  it("guarda la consulta y responde 201", async () => {
    const res = await sendContact(validContactBody())

    expect(res.status).toBe(201)
    expect(res.body).toEqual({ message: "Consulta recibida correctamente" })

    const stored = await Contact.find().lean()
    expect(stored).toHaveLength(1)
    expect(stored[0]).toMatchObject({
      nombre: "Ana Pérez",
      email: "ana@example.com",
      telefono: "1123456789",
      motivo: "showroom",
    })
  })

  it("normaliza el email y recorta los espacios", async () => {
    await sendContact(
      validContactBody({ nombre: "  Ana  ", email: "  ANA@Example.com " }),
    )

    const stored = await Contact.findOne().lean()
    expect(stored.nombre).toBe("Ana")
    expect(stored.email).toBe("ana@example.com")
  })

  it("acepta la consulta sin teléfono", async () => {
    const res = await sendContact(validContactBody({ telefono: undefined }))

    expect(res.status).toBe(201)
    expect((await Contact.findOne().lean()).telefono).toBe("")
  })

  it("descarta los campos que no forman parte del formulario", async () => {
    await sendContact(validContactBody({ isAdmin: true, extra: "x" }))

    const stored = await Contact.findOne().lean()
    expect(stored).not.toHaveProperty("isAdmin")
    expect(stored).not.toHaveProperty("extra")
  })

  it.each(["pieza", "showroom", "general"])(
    "acepta el motivo %s",
    async (motivo) => {
      const res = await sendContact(validContactBody({ motivo }))

      expect(res.status).toBe(201)
    },
  )

  it.each([
    ["sin nombre", { nombre: undefined }, "El nombre es obligatorio"],
    [
      "nombre de una letra",
      { nombre: "A" },
      "El nombre debe tener al menos 2 caracteres",
    ],
    [
      "nombre demasiado largo",
      { nombre: "A".repeat(81) },
      "El nombre no puede superar los 80 caracteres",
    ],
    [
      "sin email",
      { email: undefined },
      "El correo electrónico es obligatorio",
    ],
    [
      "email inválido",
      { email: "no-es-un-email" },
      "Ingresá un correo electrónico válido",
    ],
    [
      "teléfono con letras",
      { telefono: "11-abc" },
      "El teléfono solo puede contener números",
    ],
    [
      "teléfono demasiado largo",
      { telefono: "1".repeat(31) },
      "El teléfono no puede superar los 30 caracteres",
    ],
    ["sin motivo", { motivo: undefined }, "El motivo es obligatorio"],
    ["motivo fuera de la lista", { motivo: "otro" }, "Elegí un motivo válido"],
    ["sin mensaje", { mensaje: undefined }, "El mensaje es obligatorio"],
    [
      "mensaje demasiado corto",
      { mensaje: "Hola" },
      "El mensaje debe tener al menos 10 caracteres",
    ],
    [
      "mensaje demasiado largo",
      { mensaje: "a".repeat(1001) },
      "El mensaje no puede superar los 1000 caracteres",
    ],
  ])("devuelve 400 con %s", async (_caso, overrides, mensaje) => {
    const res = await sendContact(validContactBody(overrides))

    expect(res.status).toBe(400)
    expect(res.body.error).toBe("Datos inválidos")
    // Solo el error del caso: si aparece otro, el body "válido" dejó de serlo.
    expect(res.body.details).toEqual([mensaje])
    expect(await Contact.countDocuments()).toBe(0)
  })

  it("devuelve 503 si la conexión a la base se perdió", async () => {
    const readyState = vi
      .spyOn(mongoose.connection, "readyState", "get")
      .mockReturnValue(0)

    try {
      const res = await sendContact(validContactBody())

      expect(res.status).toBe(503)
      expect(res.body.error).toBe("La base de datos no está disponible")
    } finally {
      readyState.mockRestore()
    }

    expect(await Contact.countDocuments()).toBe(0)
  })

  it("devuelve 503 si Mongo no responde al guardar", async () => {
    const error = Object.assign(new Error("server selection timed out"), {
      name: "MongooseServerSelectionError",
    })
    const create = vi.spyOn(Contact, "create").mockRejectedValue(error)

    try {
      const res = await sendContact(validContactBody())

      expect(res.status).toBe(503)
      expect(res.body.error).toBe("La base de datos no está disponible")
    } finally {
      create.mockRestore()
    }
  })
})
