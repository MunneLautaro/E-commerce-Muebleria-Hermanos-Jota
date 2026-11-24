import { beforeEach, describe, expect, it } from "vitest"
import request from "supertest"
import mongoose from "mongoose"
import app from "../src/app.js"
import Product from "../src/models/product.model.js"
import User from "../src/models/user.model.js"
import {
  createProduct,
  createUser,
  tokenFor,
  validProductBody,
} from "./helpers.js"

const missingId = () => new mongoose.Types.ObjectId().toString()

let admin
let adminToken

beforeEach(async () => {
  admin = await createUser({ email: "admin@example.com", role: "admin" })
  adminToken = tokenFor(admin)
})

const adminApi = () =>
  request.agent(app).set("Authorization", `Bearer ${adminToken}`)

describe("GET /api/products", () => {
  it("lista solo productos activos con paginación por defecto", async () => {
    await createProduct({ nombre: "Activo" })
    await createProduct({ nombre: "Inactivo", isActive: false })

    const res = await request(app).get("/api/products")

    expect(res.status).toBe(200)
    expect(res.body.items.map((p) => p.nombre)).toEqual(["Activo"])
    expect(res.body.pagination).toEqual({
      page: 1,
      limit: 12,
      total: 1,
      totalPages: 1,
    })
  })

  it("ordena por nombre ascendente", async () => {
    await createProduct({ nombre: "Sillón" })
    await createProduct({ nombre: "Aparador" })
    await createProduct({ nombre: "Mesa" })

    const res = await request(app).get("/api/products")

    expect(res.body.items.map((p) => p.nombre)).toEqual([
      "Aparador",
      "Mesa",
      "Sillón",
    ])
  })

  it("pagina los resultados", async () => {
    for (let i = 0; i < 14; i += 1) {
      await createProduct({ nombre: `Producto ${String(i).padStart(2, "0")}` })
    }

    const res = await request(app).get("/api/products?page=2&limit=12")

    expect(res.status).toBe(200)
    expect(res.body.items).toHaveLength(2)
    expect(res.body.items[0].nombre).toBe("Producto 12")
    expect(res.body.pagination).toMatchObject({
      page: 2,
      total: 14,
      totalPages: 2,
    })
  })

  it("busca por nombre sin distinguir mayúsculas", async () => {
    await createProduct({ nombre: "Mesa Palermo" })
    await createProduct({ nombre: "Silla Nórdica" })

    const res = await request(app).get("/api/products?q=MESA")

    expect(res.body.items.map((p) => p.nombre)).toEqual(["Mesa Palermo"])
  })

  it("trata los caracteres especiales de q como texto literal", async () => {
    await createProduct({ nombre: "Mesa (edición limitada)" })
    await createProduct({ nombre: "Mesa común" })

    const res = await request(app).get("/api/products").query({ q: "(edición" })

    expect(res.status).toBe(200)
    expect(res.body.items.map((p) => p.nombre)).toEqual([
      "Mesa (edición limitada)",
    ])
  })

  it("filtra por rango de precio inclusivo", async () => {
    await createProduct({ nombre: "Barato", precio: 100 })
    await createProduct({ nombre: "Medio", precio: 500 })
    await createProduct({ nombre: "Caro", precio: 1000 })

    const res = await request(app).get(
      "/api/products?minPrice=100&maxPrice=500",
    )

    expect(res.body.items.map((p) => p.nombre)).toEqual(["Barato", "Medio"])
  })

  it("también responde en la ruta /api/productos", async () => {
    await createProduct()

    const res = await request(app).get("/api/productos")

    expect(res.status).toBe(200)
    expect(res.body.items).toHaveLength(1)
  })

  it.each([
    ["page=0", "page debe ser mayor o igual a 1"],
    ["limit=5", "limit debe ser 12, 15 o 20"],
    ["order=price_desc", "order no es válido"],
    ["minPrice=-1", "minPrice no puede ser negativo"],
    ["maxPrice=abc", "maxPrice debe ser numérico"],
    ["minPrice=500&maxPrice=100", "minPrice no puede superar maxPrice"],
  ])("devuelve 400 con %s", async (query, mensaje) => {
    const res = await request(app).get(`/api/products?${query}`)

    expect(res.status).toBe(400)
    expect(res.body.error).toBe("Parámetros inválidos")
    expect(res.body.details).toContain(mensaje)
  })
})

describe("GET /api/products/:id", () => {
  it("devuelve un producto activo", async () => {
    const product = await createProduct({ nombre: "Mesa Palermo" })

    const res = await request(app).get(`/api/products/${product._id}`)

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      _id: product._id.toString(),
      nombre: "Mesa Palermo",
      sku: product.sku,
    })
  })

  it("devuelve 404 si el producto está inactivo", async () => {
    const product = await createProduct({ isActive: false })

    const res = await request(app).get(`/api/products/${product._id}`)

    expect(res.status).toBe(404)
  })

  it("devuelve 404 si el producto no existe", async () => {
    const res = await request(app).get(`/api/products/${missingId()}`)

    expect(res.status).toBe(404)
    expect(res.body.error).toBe("Producto no encontrado")
  })

  it("devuelve 400 con un ID inválido", async () => {
    const res = await request(app).get("/api/products/no-es-un-id")

    expect(res.status).toBe(400)
    expect(res.body.error).toBe("El ID del producto no es válido")
  })
})

describe("GET /api/products/admin", () => {
  it("incluye productos inactivos", async () => {
    await createProduct({ nombre: "Activo" })
    await createProduct({ nombre: "Inactivo", isActive: false })

    const res = await adminApi().get("/api/products/admin")

    expect(res.status).toBe(200)
    expect(res.body.items.map((p) => p.nombre)).toEqual(["Activo", "Inactivo"])
  })

  it("devuelve un producto inactivo por ID", async () => {
    const product = await createProduct({ isActive: false })

    const res = await adminApi().get(`/api/products/admin/${product._id}`)

    expect(res.status).toBe(200)
    expect(res.body.isActive).toBe(false)
  })

  it("devuelve 404 si el producto no existe", async () => {
    const res = await adminApi().get(`/api/products/admin/${missingId()}`)

    expect(res.status).toBe(404)
  })

  it("devuelve 400 con un ID inválido", async () => {
    const res = await adminApi().get("/api/products/admin/no-es-un-id")

    expect(res.status).toBe(400)
    expect(res.body.error).toBe("El ID del producto no es válido")
  })

  it("pagina el listado contando también los inactivos", async () => {
    for (let i = 0; i < 13; i += 1) {
      await createProduct({
        nombre: `Producto ${String(i).padStart(2, "0")}`,
        isActive: i % 2 === 0,
      })
    }

    const res = await adminApi().get("/api/products/admin?page=2&limit=12")

    expect(res.status).toBe(200)
    expect(res.body.items.map((p) => p.nombre)).toEqual(["Producto 12"])
    expect(res.body.pagination).toEqual({
      page: 2,
      limit: 12,
      total: 13,
      totalPages: 2,
    })
  })

  it("filtra por búsqueda y precio incluyendo los inactivos", async () => {
    await createProduct({ nombre: "Mesa activa", precio: 300 })
    await createProduct({ nombre: "Mesa inactiva", precio: 400, isActive: false })
    await createProduct({ nombre: "Mesa cara", precio: 5000, isActive: false })
    await createProduct({ nombre: "Silla", precio: 300 })

    const res = await adminApi().get("/api/products/admin?q=mesa&maxPrice=1000")

    expect(res.status).toBe(200)
    expect(res.body.items.map((p) => p.nombre)).toEqual([
      "Mesa activa",
      "Mesa inactiva",
    ])
  })

  it("devuelve 400 con parámetros inválidos", async () => {
    const res = await adminApi().get("/api/products/admin?limit=100")

    expect(res.status).toBe(400)
    expect(res.body.error).toBe("Parámetros inválidos")
    expect(res.body.details).toContain("limit debe ser 12, 15 o 20")
  })
})

describe("rutas de admin en el alias /api/productos", () => {
  it("crea, edita y borra un producto", async () => {
    const created = await adminApi()
      .post("/api/productos")
      .send(validProductBody())
    expect(created.status).toBe(201)

    const id = created.body._id
    const updated = await adminApi()
      .put(`/api/productos/${id}`)
      .send({ nombre: "Mesa Recoleta" })
    expect(updated.status).toBe(200)
    expect(updated.body.nombre).toBe("Mesa Recoleta")

    const deleted = await adminApi().delete(`/api/productos/${id}`)
    expect(deleted.status).toBe(200)
    expect((await Product.findById(id)).isActive).toBe(false)
  })

  it("también exige ser admin", async () => {
    const user = await createUser({ email: "user@example.com" })

    const res = await request(app)
      .post("/api/productos")
      .set("Authorization", `Bearer ${tokenFor(user)}`)
      .send(validProductBody())

    expect(res.status).toBe(403)
    expect(await Product.countDocuments()).toBe(0)
  })
})

describe("POST /api/products", () => {
  it("crea el producto con un SKU generado por el servidor", async () => {
    const res = await adminApi().post("/api/products").send(validProductBody())

    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({
      nombre: "Mesa Palermo",
      precio: 450000,
      stock: 5,
      isActive: true,
      atributos: [{ clave: "Material", valor: "Roble" }],
    })
    expect(res.body.sku).toMatch(/^HJ-\d{6}$/)
    expect(await Product.countDocuments()).toBe(1)
  })

  it.each([
    ["1.234,56", 1234.56],
    ["1234.5", 1234.5],
    ["99,90", 99.9],
    ["1.000.000", 1000000],
  ])("normaliza el precio %s a %d", async (precio, esperado) => {
    const res = await adminApi()
      .post("/api/products")
      .send(validProductBody({ precio }))

    expect(res.status).toBe(201)
    expect(res.body.precio).toBe(esperado)
  })

  it.each([
    [
      "sku enviado por el cliente",
      { sku: "HJ-000001" },
      "El SKU se genera automáticamente y no debe enviarse",
    ],
    [
      "_id enviado por el cliente",
      { _id: missingId() },
      "El ID del producto se genera automáticamente y no debe enviarse",
    ],
    ["sin nombre", { nombre: undefined }, "El nombre es obligatorio"],
    ["sin precio", { precio: undefined }, "El precio es obligatorio"],
    ["precio negativo", { precio: -1 }, "El precio no puede ser negativo"],
    [
      "precio con formato inválido",
      { precio: "12,345,67" },
      "El precio debe ser numérico. Usá puntos para miles y coma para centavos",
    ],
    ["stock decimal", { stock: 1.5 }, "El stock debe ser un entero"],
    ["stock negativo", { stock: -3 }, "El stock no puede ser negativo"],
    [
      "imagen con protocolo no permitido",
      { imagenUrl: "javascript:alert(1)" },
      "La imagen debe ser una URL HTTP/HTTPS o una ruta relativa válida",
    ],
    ["sin imagen", { imagenUrl: undefined }, "La imagen es obligatoria"],
    [
      "atributo sin valor",
      { atributos: [{ clave: "Color", valor: "" }] },
      "El valor del atributo es obligatorio",
    ],
  ])("devuelve 400 con %s", async (_caso, overrides, mensaje) => {
    const res = await adminApi()
      .post("/api/products")
      .send(validProductBody(overrides))

    expect(res.status).toBe(400)
    expect(res.body.error).toBe("Datos inválidos")
    // Solo el error del caso: si aparece otro, el body "válido" dejó de serlo.
    expect([...new Set(res.body.details)]).toEqual([mensaje])
    expect(await Product.countDocuments()).toBe(0)
  })
})

describe("PUT /api/products/:id", () => {
  it("actualiza solo los campos enviados", async () => {
    const product = await createProduct({ nombre: "Mesa", precio: 100 })

    const res = await adminApi()
      .put(`/api/products/${product._id}`)
      .send({ precio: "250,50" })

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ nombre: "Mesa", precio: 250.5 })
  })

  it("permite reactivar un producto inactivo", async () => {
    const product = await createProduct({ isActive: false })

    const res = await adminApi()
      .put(`/api/products/${product._id}`)
      .send({ isActive: true })

    expect(res.status).toBe(200)
    expect(res.body.isActive).toBe(true)
  })

  it("devuelve 409 si el SKU ya pertenece a otro producto", async () => {
    const existing = await createProduct()
    const product = await createProduct()

    const res = await adminApi()
      .put(`/api/products/${product._id}`)
      .send({ sku: existing.sku.toLowerCase() })

    expect(res.status).toBe(409)
    expect(res.body.error).toBe("El SKU ya está registrado")
  })

  it("devuelve 400 si no se envía ningún campo", async () => {
    const product = await createProduct()

    const res = await adminApi().put(`/api/products/${product._id}`).send({})

    expect(res.status).toBe(400)
    expect(res.body.details).toEqual([
      "Debe enviar al menos un campo para actualizar",
    ])
  })

  it("devuelve 400 con datos inválidos", async () => {
    const product = await createProduct()

    const res = await adminApi()
      .put(`/api/products/${product._id}`)
      .send({ stock: -1 })

    expect(res.status).toBe(400)
    expect(res.body.details).toEqual(["El stock no puede ser negativo"])
    expect((await Product.findById(product._id)).stock).toBe(product.stock)
  })

  it("devuelve 404 si el producto no existe", async () => {
    const res = await adminApi()
      .put(`/api/products/${missingId()}`)
      .send({ nombre: "Nuevo" })

    expect(res.status).toBe(404)
  })

  it("devuelve 400 con un ID inválido", async () => {
    const res = await adminApi()
      .put("/api/products/no-es-un-id")
      .send({ nombre: "Nuevo" })

    expect(res.status).toBe(400)
  })
})

describe("DELETE /api/products/:id", () => {
  it("hace un borrado lógico (isActive = false)", async () => {
    const product = await createProduct()

    const res = await adminApi().delete(`/api/products/${product._id}`)

    expect(res.status).toBe(200)
    expect(res.body.isActive).toBe(false)

    const stored = await Product.findById(product._id)
    expect(stored).not.toBeNull()
    expect(stored.isActive).toBe(false)
  })

  it("el producto borrado deja de aparecer en el catálogo público", async () => {
    const product = await createProduct()
    await adminApi().delete(`/api/products/${product._id}`)

    // Sin token: es lo que ve un visitante del catálogo.
    const list = await request(app).get("/api/products")
    const detail = await request(app).get(`/api/products/${product._id}`)

    expect(list.body.items).toHaveLength(0)
    expect(detail.status).toBe(404)
  })

  it("devuelve 404 si el producto no existe", async () => {
    const res = await adminApi().delete(`/api/products/${missingId()}`)

    expect(res.status).toBe(404)
  })

  it("devuelve 400 con un ID inválido", async () => {
    const res = await adminApi().delete("/api/products/no-es-un-id")

    expect(res.status).toBe(400)
  })
})

describe("permisos de administrador en productos", () => {
  let productId

  beforeEach(async () => {
    productId = (await createProduct())._id.toString()
  })

  const protectedRoutes = [
    [
      "POST /",
      201,
      (agent) => agent.post("/api/products").send(validProductBody()),
    ],
    ["GET /admin", 200, (agent) => agent.get("/api/products/admin")],
    [
      "GET /admin/:id",
      200,
      (agent, id) => agent.get(`/api/products/admin/${id}`),
    ],
    [
      "PUT /:id",
      200,
      (agent, id) => agent.put(`/api/products/${id}`).send({ nombre: "X" }),
    ],
    ["DELETE /:id", 200, (agent, id) => agent.delete(`/api/products/${id}`)],
  ]

  const sendWith = (send, token) =>
    send(request(app), productId).set("Authorization", `Bearer ${token}`)

  it.each(protectedRoutes)(
    "%s devuelve 401 sin token",
    async (_route, _status, send) => {
      const res = await send(request(app), productId)

      expect(res.status).toBe(401)
    },
  )

  it.each(protectedRoutes)(
    "%s devuelve 403 con un usuario que no es admin",
    async (_route, _status, send) => {
      const user = await createUser({ email: "user@example.com" })

      const res = await sendWith(send, tokenFor(user))

      expect(res.status).toBe(403)
    },
  )

  it.each(protectedRoutes)(
    "%s responde %d a un admin",
    async (_route, status, send) => {
      const res = await sendWith(send, adminToken)

      expect(res.status).toBe(status)
    },
  )

  // El token sigue siendo válido y dice role: "admin"; lo que manda es la base.
  it.each(protectedRoutes)(
    "%s devuelve 401 si el admin fue desactivado",
    async (_route, _status, send) => {
      await User.updateOne({ _id: admin._id }, { isActive: false })

      const res = await sendWith(send, adminToken)

      expect(res.status).toBe(401)
      expect(res.body.error).toBe("Usuario no disponible")
    },
  )

  it.each(protectedRoutes)(
    "%s devuelve 401 si el admin ya no existe",
    async (_route, _status, send) => {
      await User.deleteOne({ _id: admin._id })

      const res = await sendWith(send, adminToken)

      expect(res.status).toBe(401)
    },
  )

  it.each(protectedRoutes)(
    "%s devuelve 403 si al admin le quitaron el rol",
    async (_route, _status, send) => {
      await User.updateOne({ _id: admin._id }, { role: "user" })

      const res = await sendWith(send, adminToken)

      expect(res.status).toBe(403)
    },
  )

  it("un usuario sin permisos no llega a modificar el producto", async () => {
    const user = await createUser({ email: "user@example.com" })
    const agent = request(app)

    await agent
      .put(`/api/products/${productId}`)
      .set("Authorization", `Bearer ${tokenFor(user)}`)
      .send({ nombre: "X" })
    await agent
      .delete(`/api/products/${productId}`)
      .set("Authorization", `Bearer ${tokenFor(user)}`)

    const stored = await Product.findById(productId)
    expect(stored.nombre).toBe("Mesa Palermo")
    expect(stored.isActive).toBe(true)
  })
})

describe("modelo Product", () => {
  it.each([
    ["sin imagen", undefined],
    ["con la imagen vacía", ""],
  ])("rechaza un producto %s", async (_caso, imagenUrl) => {
    const data = { ...validProductBody(), sku: "HJ-000001", imagenUrl }

    await expect(Product.create(data)).rejects.toMatchObject({
      name: "ValidationError",
      errors: { imagenUrl: { kind: "required" } },
    })
    expect(await Product.countDocuments()).toBe(0)
  })
})
