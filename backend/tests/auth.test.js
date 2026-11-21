import { beforeEach, describe, expect, it, vi } from "vitest"
import request from "supertest"
import jwt from "jsonwebtoken"
import app from "../src/app.js"
import User from "../src/models/user.model.js"
import {
  DEFAULT_PASSWORD,
  createUser,
  signToken,
  tokenFor,
  validRegisterBody,
} from "./helpers.js"

const { verifyIdToken } = vi.hoisted(() => ({ verifyIdToken: vi.fn() }))

vi.mock("google-auth-library", () => ({
  OAuth2Client: class {
    verifyIdToken = verifyIdToken
  },
}))

const googleTicket = (payload) => ({ getPayload: () => payload })

describe("POST /api/auth/register", () => {
  it("crea el usuario y no devuelve la contraseña", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(validRegisterBody())

    expect(res.status).toBe(201)
    expect(res.body.user).toMatchObject({
      email: "cliente@example.com",
      role: "user",
      authProvider: "local",
      isActive: true,
    })
    expect(res.body.user).not.toHaveProperty("password")
    expect(res.body).not.toHaveProperty("token")
  })

  it("guarda la contraseña hasheada", async () => {
    await request(app).post("/api/auth/register").send(validRegisterBody())

    const user = await User.findOne({ email: "cliente@example.com" }).select(
      "+password",
    )
    expect(user.password).not.toBe(DEFAULT_PASSWORD)
    expect(user.password).toMatch(/^\$2[aby]\$/)
  })

  it("normaliza el email a minúsculas y sin espacios", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(validRegisterBody({ email: "  Cliente@Example.COM " }))

    expect(res.status).toBe(201)
    expect(res.body.user.email).toBe("cliente@example.com")
  })

  it("ignora campos no permitidos como role", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(validRegisterBody({ role: "admin", isActive: false }))

    expect(res.status).toBe(201)
    expect(res.body.user.role).toBe("user")
    expect(res.body.user.isActive).toBe(true)
  })

  it("devuelve 409 si el email ya está registrado", async () => {
    await createUser()

    const res = await request(app)
      .post("/api/auth/register")
      .send(validRegisterBody({ email: "CLIENTE@example.com" }))

    expect(res.status).toBe(409)
    expect(res.body.error).toBe("El email ya está registrado")
  })

  it.each([
    ["email inválido", { email: "no-es-un-email" }, "El email no es válido"],
    [
      "contraseña corta",
      { password: "1234567" },
      "La contraseña debe tener al menos 8 caracteres",
    ],
    [
      "contraseña solo con espacios",
      { password: "         " },
      "La contraseña no puede estar compuesta solo por espacios",
    ],
    [
      "teléfono con letras",
      { phone: "abc1234567" },
      "El teléfono contiene caracteres no válidos",
    ],
    [
      "dirección faltante",
      { address: undefined },
      "La dirección es obligatoria",
    ],
  ])("devuelve 400 con %s", async (_caso, overrides, mensaje) => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(validRegisterBody(overrides))

    expect(res.status).toBe(400)
    expect(res.body.error).toBe("Datos inválidos")
    // Solo el error del caso: si aparece otro, el body "válido" dejó de serlo.
    expect(res.body.details).toEqual([mensaje])
    expect(await User.countDocuments()).toBe(0)
  })
})

describe("POST /api/auth/login", () => {
  it("devuelve un token válido y el usuario", async () => {
    const user = await createUser()

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "cliente@example.com", password: DEFAULT_PASSWORD })

    expect(res.status).toBe(200)
    expect(res.body.user).toMatchObject({ email: "cliente@example.com" })
    expect(res.body.user).not.toHaveProperty("password")

    const payload = jwt.verify(res.body.token, process.env.JWT_SECRET)
    expect(payload).toMatchObject({
      sub: user._id.toString(),
      email: "cliente@example.com",
      role: "user",
    })
  })

  it("acepta el email con mayúsculas", async () => {
    await createUser()

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "CLIENTE@EXAMPLE.COM", password: DEFAULT_PASSWORD })

    expect(res.status).toBe(200)
  })

  it("devuelve 401 con contraseña incorrecta", async () => {
    await createUser()

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "cliente@example.com", password: "otra-clave-123" })

    expect(res.status).toBe(401)
    expect(res.body).not.toHaveProperty("token")
  })

  it("devuelve el mismo 401 si el usuario no existe", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nadie@example.com", password: DEFAULT_PASSWORD })

    expect(res.status).toBe(401)
    expect(res.body.error).toBe("Email o contraseña incorrectos")
  })

  it("devuelve 403 si el usuario está inactivo", async () => {
    await createUser({ isActive: false })

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "cliente@example.com", password: DEFAULT_PASSWORD })

    expect(res.status).toBe(403)
    expect(res.body).not.toHaveProperty("token")
  })

  it("devuelve 400 si faltan campos", async () => {
    const res = await request(app).post("/api/auth/login").send({})

    expect(res.status).toBe(400)
    expect(res.body.details).toEqual(
      expect.arrayContaining([
        "El email es obligatorio",
        "La contraseña es obligatoria",
      ]),
    )
  })
})

describe("GET /api/auth/me", () => {
  it("devuelve el usuario con un token válido", async () => {
    const user = await createUser({ name: "Ana" })

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${tokenFor(user)}`)

    expect(res.status).toBe(200)
    expect(res.body.user).toMatchObject({
      id: user._id.toString(),
      email: "cliente@example.com",
      name: "Ana",
    })
  })

  it("devuelve 401 sin header Authorization", async () => {
    const res = await request(app).get("/api/auth/me")

    expect(res.status).toBe(401)
    expect(res.body.error).toBe("Token de autenticación requerido")
  })

  it("devuelve 401 si el header no usa el esquema Bearer", async () => {
    const user = await createUser()

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", tokenFor(user))

    expect(res.status).toBe(401)
  })

  it("devuelve 401 con un token mal formado", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer esto-no-es-un-jwt")

    expect(res.status).toBe(401)
    expect(res.body.error).toBe("Token inválido o expirado")
  })

  it("devuelve 401 con un token firmado con otro secreto", async () => {
    const user = await createUser()
    const token = jwt.sign({ sub: user._id.toString() }, "otro-secreto")

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`)

    expect(res.status).toBe(401)
  })

  it("devuelve 401 con un token vencido", async () => {
    const user = await createUser()
    const token = signToken(
      { sub: user._id.toString() },
      { expiresIn: "-10s" },
    )

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`)

    expect(res.status).toBe(401)
    expect(res.body.error).toBe("Token inválido o expirado")
  })

  it("devuelve 401 si el usuario fue desactivado después de loguearse", async () => {
    const user = await createUser()
    const token = tokenFor(user)
    await User.updateOne({ _id: user._id }, { isActive: false })

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`)

    expect(res.status).toBe(401)
    expect(res.body.error).toBe("Usuario no disponible")
  })

  it("devuelve 401 si el usuario ya no existe", async () => {
    const user = await createUser()
    const token = tokenFor(user)
    await User.deleteOne({ _id: user._id })

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`)

    expect(res.status).toBe(401)
  })
})

describe("POST /api/auth/logout", () => {
  it("responde 200 sin requerir token", async () => {
    const res = await request(app).post("/api/auth/logout")

    expect(res.status).toBe(200)
  })
})

describe("POST /api/auth/google", () => {
  beforeEach(() => {
    verifyIdToken.mockReset()
  })

  const googlePayload = (overrides = {}) => ({
    sub: "google-123",
    email: "Ana@Gmail.com",
    email_verified: true,
    name: "Ana Pérez",
    picture: "https://example.com/ana.png",
    ...overrides,
  })

  it("crea un usuario nuevo de Google y devuelve un token", async () => {
    verifyIdToken.mockResolvedValue(googleTicket(googlePayload()))

    const res = await request(app)
      .post("/api/auth/google")
      .send({ credential: "credencial-de-google" })

    expect(res.status).toBe(200)
    expect(res.body.token).toEqual(expect.any(String))
    expect(res.body.user).toMatchObject({
      email: "ana@gmail.com",
      name: "Ana Pérez",
      authProvider: "google",
    })
    expect(verifyIdToken).toHaveBeenCalledWith({
      idToken: "credencial-de-google",
      audience: process.env.GOOGLE_CLIENT_ID,
    })
  })

  it("vincula la cuenta de Google a un usuario local con el mismo email", async () => {
    const existing = await createUser({ email: "ana@gmail.com" })
    verifyIdToken.mockResolvedValue(googleTicket(googlePayload()))

    const res = await request(app)
      .post("/api/auth/google")
      .send({ credential: "credencial-de-google" })

    expect(res.status).toBe(200)
    expect(res.body.user.id).toBe(existing._id.toString())
    expect(await User.countDocuments()).toBe(1)

    const updated = await User.findById(existing._id)
    expect(updated.googleId).toBe("google-123")
    expect(updated.name).toBe("Ana Pérez")
  })

  it("devuelve 401 si Google rechaza el token", async () => {
    verifyIdToken.mockRejectedValue(new Error("Invalid token"))

    const res = await request(app)
      .post("/api/auth/google")
      .send({ credential: "credencial-invalida" })

    expect(res.status).toBe(401)
    expect(await User.countDocuments()).toBe(0)
  })

  it("devuelve 400 si el email de Google no está verificado", async () => {
    verifyIdToken.mockResolvedValue(
      googleTicket(googlePayload({ email_verified: false })),
    )

    const res = await request(app)
      .post("/api/auth/google")
      .send({ credential: "credencial-de-google" })

    expect(res.status).toBe(400)
    expect(await User.countDocuments()).toBe(0)
  })

  it("devuelve 403 si el usuario vinculado está inactivo", async () => {
    await createUser({ email: "ana@gmail.com", googleId: "google-123", isActive: false })
    verifyIdToken.mockResolvedValue(googleTicket(googlePayload()))

    const res = await request(app)
      .post("/api/auth/google")
      .send({ credential: "credencial-de-google" })

    expect(res.status).toBe(403)
  })

  it("devuelve 400 sin credential", async () => {
    const res = await request(app).post("/api/auth/google").send({})

    expect(res.status).toBe(400)
    expect(verifyIdToken).not.toHaveBeenCalled()
  })
})
