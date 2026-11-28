import { beforeEach, describe, expect, it } from "vitest"
import request from "supertest"
import mongoose from "mongoose"
import app from "../src/app.js"
import Product from "../src/models/product.model.js"
import PurchaseOrder from "../src/models/purchaseOrder.model.js"
import { MAX_ORDER_ITEMS } from "../src/schemas/purchaseOrder.schema.js"
import {
  createProduct,
  createPurchaseOrder,
  createPurchaseOrderAt,
  createUser,
  signToken,
  tokenFor,
  validShippingBody,
} from "./helpers.js"

const missingId = () => new mongoose.Types.ObjectId().toString()

let cliente
let clienteToken
let admin
let adminToken

beforeEach(async () => {
  cliente = await createUser({ email: "cliente@example.com" })
  clienteToken = tokenFor(cliente)
  admin = await createUser({ email: "admin@example.com", role: "admin" })
  adminToken = tokenFor(admin)
})

const asCliente = (req) => req.set("Authorization", `Bearer ${clienteToken}`)
const asAdmin = (req) => req.set("Authorization", `Bearer ${adminToken}`)

const postOrder = (body, token = clienteToken) =>
  request(app)
    .post("/api/ordenes")
    .set("Authorization", `Bearer ${token}`)
    .send({ envio: validShippingBody(), ...body })

const stockOf = async (product) => (await Product.findById(product._id).lean()).stock

describe("POST /api/ordenes", () => {
  it("crea la orden, calcula los subtotales y el total y descuenta el stock", async () => {
    const mesa = await createProduct({ nombre: "Mesa", precio: 1000, stock: 5 })
    const silla = await createProduct({ nombre: "Silla", precio: 250, stock: 10 })

    const res = await postOrder({
      productos: [
        { producto: mesa._id.toString(), cantidad: 2 },
        { producto: silla._id.toString(), cantidad: 4 },
      ],
    })

    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({
      productos: [
        { producto: mesa._id.toString(), cantidad: 2, subtotal: 2000 },
        { producto: silla._id.toString(), cantidad: 4, subtotal: 1000 },
      ],
      total: 3000,
      comprador: cliente._id.toString(),
      estado: "aceptada",
    })
    expect(await stockOf(mesa)).toBe(3)
    expect(await stockOf(silla)).toBe(6)
    expect(await PurchaseOrder.countDocuments()).toBe(1)
  })

  it("toma el precio de la base y descarta los campos desconocidos", async () => {
    const mesa = await createProduct({ precio: 1000, stock: 5 })

    const res = await postOrder({
      productos: [{ producto: mesa._id.toString(), cantidad: 1, subtotal: 1 }],
      total: 1,
      comprador: admin._id.toString(),
      estado: "rechazada",
    })

    expect(res.status).toBe(201)
    expect(res.body.productos[0].subtotal).toBe(1000)
    expect(res.body.total).toBe(1000)
    expect(res.body.comprador).toBe(cliente._id.toString())
    expect(res.body.estado).toBe("aceptada")
  })

  it("guarda los datos de envío normalizados y descarta los campos desconocidos", async () => {
    const mesa = await createProduct({ precio: 1000, stock: 5 })

    const res = await postOrder({
      productos: [{ producto: mesa._id.toString(), cantidad: 1 }],
      envio: validShippingBody({
        nombreCompleto: "  Ana Pérez  ",
        ciudad: " Rosario ",
        piso: "3B",
      }),
    })

    const expected = validShippingBody({ ciudad: "Rosario" })
    expect(res.status).toBe(201)
    expect(res.body.envio).toEqual(expected)

    const saved = await PurchaseOrder.findById(res.body._id).lean()
    expect(saved.envio).toEqual(expected)
  })

  it("responde 400 si falta el envío y no descuenta stock", async () => {
    const mesa = await createProduct({ stock: 5 })

    const res = await postOrder({
      productos: [{ producto: mesa._id.toString(), cantidad: 1 }],
      envio: undefined,
    })

    expect(res.status).toBe(400)
    expect(res.body).toEqual({
      error: "Datos inválidos",
      details: ["Indicá los datos de envío"],
    })
    expect(await stockOf(mesa)).toBe(5)
    expect(await PurchaseOrder.countDocuments()).toBe(0)
  })

  it.each([
    ["con el envío que no es un objeto", "Av. Corrientes 1234", "Los datos de envío no son válidos"],
    ["sin el nombre completo", validShippingBody({ nombreCompleto: "   " }), "Ingresá el nombre completo de quien recibe"],
    ["con un nombre demasiado largo", validShippingBody({ nombreCompleto: "a".repeat(101) }), "El nombre completo no puede superar los 100 caracteres"],
    ["sin el teléfono", validShippingBody({ telefono: "" }), "Ingresá un teléfono de contacto"],
    ["con un teléfono inválido", validShippingBody({ telefono: "llamame" }), "Ingresá un teléfono válido"],
    ["sin la dirección", validShippingBody({ direccion: undefined }), "Ingresá la dirección de entrega"],
    ["con una dirección demasiado larga", validShippingBody({ direccion: "a".repeat(121) }), "La dirección no puede superar los 120 caracteres"],
    ["sin la altura", validShippingBody({ altura: "" }), "Ingresá la altura de la dirección"],
    ["con una altura demasiado larga", validShippingBody({ altura: "1".repeat(11) }), "La altura no puede superar los 10 caracteres"],
    ["sin la ciudad", validShippingBody({ ciudad: "" }), "Ingresá la ciudad"],
    ["sin el código postal", validShippingBody({ codigoPostal: "" }), "Ingresá el código postal"],
    ["con un código postal inválido", validShippingBody({ codigoPostal: "10-43" }), "Ingresá un código postal válido"],
  ])("responde 400 %s", async (_, envio, message) => {
    const mesa = await createProduct({ stock: 5 })

    const res = await postOrder({
      productos: [{ producto: mesa._id.toString(), cantidad: 1 }],
      envio,
    })

    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: "Datos inválidos", details: [message] })
    expect(await stockOf(mesa)).toBe(5)
    expect(await PurchaseOrder.countDocuments()).toBe(0)
  })

  it("suma las cantidades de un producto repetido al controlar el stock", async () => {
    const mesa = await createProduct({ nombre: "Mesa", precio: 1000, stock: 3 })
    const item = { producto: mesa._id.toString(), cantidad: 2 }

    const res = await postOrder({ productos: [item, item] })

    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: 'No hay stock suficiente de "Mesa". Queda 1 unidad' })
    expect(await stockOf(mesa)).toBe(3)
  })

  it.each([
    ["sin productos", {}, "La compra debe contener al menos un producto"],
    ["con la lista vacía", { productos: [] }, "La compra debe contener al menos un producto"],
    ["con productos que no son una lista", { productos: "mesa" }, "Los productos deben enviarse en una lista"],
    ["sin el producto", { productos: [{ cantidad: 1 }] }, "Indicá el producto"],
    ["con un ID de producto inválido", { productos: [{ producto: "no-es-un-id", cantidad: 1 }] }, "El ID del producto no es válido"],
    ["sin la cantidad", { productos: [{ producto: missingId() }] }, "Indicá la cantidad"],
    ["con una cantidad no numérica", { productos: [{ producto: missingId(), cantidad: "dos" }] }, "La cantidad debe ser numérica"],
    ["con una cantidad decimal", { productos: [{ producto: missingId(), cantidad: 1.5 }] }, "La cantidad debe ser un número entero"],
    ["con una cantidad menor a 1", { productos: [{ producto: missingId(), cantidad: 0 }] }, "La cantidad debe ser al menos 1"],
    [
      `con más de ${MAX_ORDER_ITEMS} productos`,
      { productos: Array.from({ length: MAX_ORDER_ITEMS + 1 }, () => ({ producto: missingId(), cantidad: 1 })) },
      `La compra no puede tener más de ${MAX_ORDER_ITEMS} productos`,
    ],
  ])("responde 400 %s", async (_, body, message) => {
    const res = await postOrder(body)

    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: "Datos inválidos", details: [message] })
    expect(await PurchaseOrder.countDocuments()).toBe(0)
  })

  it("responde 400 si no hay stock suficiente e informa cuánto queda", async () => {
    const mesa = await createProduct({ nombre: "Mesa Palermo", stock: 1 })

    const res = await postOrder({
      productos: [{ producto: mesa._id.toString(), cantidad: 2 }],
    })

    expect(res.status).toBe(400)
    expect(res.body).toEqual({
      error: 'No hay stock suficiente de "Mesa Palermo". Queda 1 unidad',
    })
    expect(await stockOf(mesa)).toBe(1)
  })

  it.each([
    ["inactivo", async () => (await createProduct({ isActive: false }))._id.toString()],
    ["inexistente", async () => missingId()],
  ])("responde 400 si el producto está %s", async (_, productId) => {
    const res = await postOrder({
      productos: [{ producto: await productId(), cantidad: 1 }],
    })

    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: "Uno de los productos ya no está disponible" })
    expect(await PurchaseOrder.countDocuments()).toBe(0)
  })

  it("no descuenta stock de ningún producto si uno de ellos falla", async () => {
    const mesa = await createProduct({ stock: 5 })
    const inactivo = await createProduct({ isActive: false, stock: 5 })

    const res = await postOrder({
      productos: [
        { producto: mesa._id.toString(), cantidad: 2 },
        { producto: inactivo._id.toString(), cantidad: 1 },
      ],
    })

    expect(res.status).toBe(400)
    expect(await stockOf(mesa)).toBe(5)
    expect(await PurchaseOrder.countDocuments()).toBe(0)
  })

  it("responde 401 sin token", async () => {
    const res = await request(app).post("/api/ordenes").send({ productos: [] })

    expect(res.status).toBe(401)
    expect(res.body).toEqual({ error: "Token de autenticación requerido" })
  })

  it("responde 401 con un token inválido", async () => {
    const res = await postOrder({ productos: [] }, "token-invalido")

    expect(res.status).toBe(401)
    expect(res.body).toEqual({ error: "Token inválido o expirado" })
  })

  it("responde 401 si el usuario está inactivo aunque el token siga vigente", async () => {
    const inactivo = await createUser({ email: "inactivo@example.com", isActive: false })
    const mesa = await createProduct({ stock: 5 })

    const res = await postOrder(
      { productos: [{ producto: mesa._id.toString(), cantidad: 1 }] },
      tokenFor(inactivo),
    )

    expect(res.status).toBe(401)
    expect(res.body).toEqual({ error: "Usuario no disponible" })
    expect(await stockOf(mesa)).toBe(5)
  })

  it("responde 401 si el token no corresponde a un usuario existente", async () => {
    const res = await postOrder({ productos: [] }, signToken({ sub: missingId() }))

    expect(res.status).toBe(401)
    expect(res.body).toEqual({ error: "Usuario no disponible" })
  })
})

describe("GET /api/ordenes", () => {
  it("lista todas las órdenes con comprador y productos populados", async () => {
    const mesa = await createProduct({ nombre: "Mesa", precio: 1000 })
    await createPurchaseOrder(cliente, {
      productos: [{ producto: mesa._id, cantidad: 1, subtotal: 1000 }],
    })
    await createPurchaseOrder(admin)

    const res = await asAdmin(request(app).get("/api/ordenes"))

    expect(res.status).toBe(200)
    expect(res.body.items).toHaveLength(2)
    expect(res.body.pagination).toEqual({ page: 1, limit: 12, total: 2, totalPages: 1 })

    const orden = res.body.items.find((item) => item.comprador.email === "cliente@example.com")
    expect(orden.comprador).not.toHaveProperty("password")
    expect(orden.productos[0].producto).toMatchObject({ nombre: "Mesa", precio: 1000 })
  })

  it("ordena de la más nueva a la más vieja y pagina", async () => {
    for (let i = 1; i <= 13; i += 1) {
      await createPurchaseOrder(cliente, { total: i })
    }

    const res = await asAdmin(request(app).get("/api/ordenes?page=2"))

    expect(res.status).toBe(200)
    expect(res.body.items.map((item) => item.total)).toEqual([1])
    expect(res.body.pagination).toEqual({ page: 2, limit: 12, total: 13, totalPages: 2 })
  })

  it.each([
    ["page=0", "page debe ser mayor o igual a 1"],
    ["page=abc", "page debe ser numérico"],
    ["limit=13", "limit debe ser 12, 15 o 20"],
  ])("responde 400 con %s", async (query, message) => {
    const res = await asAdmin(request(app).get(`/api/ordenes?${query}`))

    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: "Parámetros inválidos", details: [message] })
  })

  it("responde 403 a un usuario que no es admin", async () => {
    const res = await asCliente(request(app).get("/api/ordenes"))

    expect(res.status).toBe(403)
    expect(res.body).toEqual({ error: "Se requieren permisos de administrador" })
  })

  it("responde 401 a un admin inactivo", async () => {
    const inactivo = await createUser({
      email: "admin-inactivo@example.com",
      role: "admin",
      isActive: false,
    })

    const res = await request(app)
      .get("/api/ordenes")
      .set("Authorization", `Bearer ${tokenFor(inactivo)}`)

    expect(res.status).toBe(401)
  })

  it("responde 401 sin token", async () => {
    const res = await request(app).get("/api/ordenes")

    expect(res.status).toBe(401)
  })
})

describe("GET /api/ordenes con filtros", () => {
  const listOrders = (query) =>
    asAdmin(request(app).get("/api/ordenes").query(query))

  const totals = (res) => res.body.items.map((item) => item.total)

  it("filtra por estado", async () => {
    await createPurchaseOrder(cliente, { total: 1 })
    await createPurchaseOrder(cliente, { total: 2, estado: "pendiente" })
    await createPurchaseOrder(cliente, { total: 3, estado: "rechazada" })

    const pendientes = await listOrders({ estado: "pendiente" })
    const rechazadas = await listOrders({ estado: "rechazada" })
    const aceptadas = await listOrders({ estado: "aceptada" })

    expect(totals(pendientes)).toEqual([2])
    expect(pendientes.body.pagination.total).toBe(1)
    expect(totals(rechazadas)).toEqual([3])
    expect(totals(aceptadas)).toEqual([1])
  })

  describe("por fecha en la hora de Argentina", () => {
    beforeEach(async () => {
      await createPurchaseOrderAt(cliente, "2026-03-10T02:59:59.999Z", { total: 1 })
      await createPurchaseOrderAt(cliente, "2026-03-10T03:00:00.000Z", { total: 2 })
      await createPurchaseOrderAt(cliente, "2026-03-11T02:59:59.999Z", { total: 3 })
      await createPurchaseOrderAt(cliente, "2026-03-11T03:00:00.000Z", { total: 4 })
    })

    it("desde incluye las órdenes desde las 00:00 de ese día", async () => {
      const res = await listOrders({ desde: "2026-03-10" })

      expect(res.status).toBe(200)
      expect(totals(res)).toEqual([4, 3, 2])
    })

    it("hasta incluye el día completo", async () => {
      const res = await listOrders({ hasta: "2026-03-10" })

      expect(res.status).toBe(200)
      expect(totals(res)).toEqual([3, 2, 1])
    })

    it("con desde y hasta iguales devuelve solo ese día", async () => {
      const res = await listOrders({ desde: "2026-03-10", hasta: "2026-03-10" })

      expect(res.status).toBe(200)
      expect(totals(res)).toEqual([3, 2])
      expect(res.body.pagination.total).toBe(2)
    })
  })

  describe("búsqueda", () => {
    let lucia
    let pedro

    beforeEach(async () => {
      lucia = await createUser({ email: "lucia@correo.com", name: "Lucia Fernan" })
      pedro = await createUser({ email: "pedro.gomez@correo.com", name: "Pedro Gómez" })
      await createPurchaseOrder(lucia, { total: 1 })
      await createPurchaseOrder(pedro, { total: 2 })
      await createPurchaseOrder(cliente, { total: 3 })
    })

    it("busca por el ID exacto de la orden", async () => {
      const orden = await createPurchaseOrder(pedro, { total: 4 })

      const res = await listOrders({ q: orden._id.toString().toUpperCase() })

      expect(res.status).toBe(200)
      expect(totals(res)).toEqual([4])
    })

    it("no devuelve nada si el ID no corresponde a ninguna orden", async () => {
      const res = await listOrders({ q: missingId() })

      expect(res.status).toBe(200)
      expect(res.body.items).toEqual([])
      expect(res.body.pagination.total).toBe(0)
    })

    it("busca por email del comprador sin distinguir mayúsculas", async () => {
      const res = await listOrders({ q: "PEDRO.GOMEZ@" })

      expect(totals(res)).toEqual([2])
    })

    it("busca por nombre del comprador", async () => {
      const res = await listOrders({ q: "gómez" })

      expect(totals(res)).toEqual([2])
      expect(res.body.items[0].comprador).toMatchObject({
        name: "Pedro Gómez",
        email: "pedro.gomez@correo.com",
      })
    })

    it("no interpreta un texto de 12 caracteres como ID", async () => {
      const res = await listOrders({ q: "Lucia Fernan" })

      expect(res.status).toBe(200)
      expect(totals(res)).toEqual([1])
    })

    it("trata los caracteres especiales como texto literal", async () => {
      const res = await listOrders({ q: "(.*" })

      expect(res.status).toBe(200)
      expect(res.body.items).toEqual([])
    })

    it("ignora los espacios alrededor del texto", async () => {
      const res = await listOrders({ q: "  lucia@  " })

      expect(totals(res)).toEqual([1])
    })
  })

  it("combina estado, fechas y búsqueda", async () => {
    const lucia = await createUser({ email: "lucia@correo.com", name: "Lucia" })
    await createPurchaseOrderAt(lucia, "2026-03-10T15:00:00Z", { total: 1, estado: "pendiente" })
    await createPurchaseOrderAt(lucia, "2026-03-10T16:00:00Z", { total: 2 })
    await createPurchaseOrderAt(lucia, "2026-03-12T15:00:00Z", { total: 3, estado: "pendiente" })
    await createPurchaseOrderAt(cliente, "2026-03-10T15:00:00Z", { total: 4, estado: "pendiente" })

    const res = await listOrders({
      estado: "pendiente",
      desde: "2026-03-09",
      hasta: "2026-03-11",
      q: "lucia",
    })

    expect(res.status).toBe(200)
    expect(totals(res)).toEqual([1])
    expect(res.body.pagination).toEqual({ page: 1, limit: 12, total: 1, totalPages: 1 })
  })

  it("pagina los resultados filtrados", async () => {
    for (let i = 1; i <= 14; i += 1) {
      await createPurchaseOrder(cliente, {
        total: i,
        estado: i % 2 === 0 ? "pendiente" : "aceptada",
      })
    }

    const res = await listOrders({ estado: "pendiente", limit: 15 })

    expect(totals(res)).toEqual([14, 12, 10, 8, 6, 4, 2])
    expect(res.body.pagination).toEqual({ page: 1, limit: 15, total: 7, totalPages: 1 })
  })

  it.each([
    ["un estado inválido", { estado: "cancelada" }, "estado debe ser pendiente, aceptada, rechazada"],
    ["una fecha con otro formato", { desde: "10/03/2026" }, "desde debe tener el formato AAAA-MM-DD"],
    ["una fecha inexistente", { hasta: "2026-02-30" }, "hasta no es una fecha válida"],
    ["desde posterior a hasta", { desde: "2026-03-11", hasta: "2026-03-10" }, "desde no puede ser posterior a hasta"],
    ["una búsqueda demasiado larga", { q: "a".repeat(101) }, "q no puede superar 100 caracteres"],
  ])("responde 400 con %s", async (_, query, message) => {
    const res = await listOrders(query)

    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: "Parámetros inválidos", details: [message] })
  })

  it("define índices para ordenar y filtrar por estado y fecha", () => {
    const indexes = PurchaseOrder.schema.indexes().map(([fields]) => fields)

    expect(indexes).toContainEqual({ createdAt: -1, _id: -1 })
    expect(indexes).toContainEqual({ estado: 1, createdAt: -1, _id: -1 })
  })
})

describe("GET /api/ordenes/usuario/:compradorId", () => {
  const ordersOf = (user) => request(app).get(`/api/ordenes/usuario/${user._id}`)

  it("ordena de la orden más nueva a la más vieja", async () => {
    await createPurchaseOrderAt(cliente, "2026-01-10T12:00:00Z", { total: 1 })
    await createPurchaseOrderAt(cliente, "2026-03-10T12:00:00Z", { total: 3 })
    await createPurchaseOrderAt(cliente, "2026-02-10T12:00:00Z", { total: 2 })

    const res = await asCliente(ordersOf(cliente))

    expect(res.body.items.map((item) => item.total)).toEqual([3, 2, 1])
  })

  it("ignora los filtros del admin", async () => {
    const orden = await createPurchaseOrder(cliente, { total: 1 })
    await createPurchaseOrder(cliente, { total: 2, estado: "pendiente" })
    await createPurchaseOrder(cliente, { total: 3, estado: "rechazada" })

    const res = await asCliente(
      ordersOf(cliente).query({
        estado: "pendiente",
        desde: "2999-01-01",
        hasta: "no-es-una-fecha",
        q: orden._id.toString(),
      }),
    )

    expect(res.status).toBe(200)
    expect(res.body.items.map((item) => item.total)).toEqual([3, 2, 1])
    expect(res.body.pagination.total).toBe(3)
  })

  it("devuelve solo las órdenes del usuario logueado", async () => {
    await createPurchaseOrder(cliente)
    await createPurchaseOrder(admin)

    const res = await asCliente(ordersOf(cliente))

    expect(res.status).toBe(200)
    expect(res.body.items).toHaveLength(1)
    expect(res.body.items[0].comprador._id).toBe(cliente._id.toString())
    expect(res.body.pagination).toEqual({ page: 1, limit: 12, total: 1, totalPages: 1 })
  })

  it("permite a un admin ver las órdenes de otro usuario", async () => {
    await createPurchaseOrder(cliente)

    const res = await asAdmin(ordersOf(cliente))

    expect(res.status).toBe(200)
    expect(res.body.items).toHaveLength(1)
  })

  it("responde 403 si un usuario pide las órdenes de otro", async () => {
    await createPurchaseOrder(admin)

    const res = await asCliente(ordersOf(admin))

    expect(res.status).toBe(403)
    expect(res.body).toEqual({
      error: "No tenés permiso para ver los datos de otro usuario",
    })
  })

  it("responde 400 si un admin pide un ID de comprador inválido", async () => {
    const res = await asAdmin(request(app).get("/api/ordenes/usuario/no-es-un-id"))

    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: "El ID del comprador no es válido" })
  })

  it("responde 401 si el usuario está inactivo", async () => {
    const inactivo = await createUser({ email: "inactivo@example.com", isActive: false })

    const res = await ordersOf(inactivo).set(
      "Authorization",
      `Bearer ${tokenFor(inactivo)}`,
    )

    expect(res.status).toBe(401)
    expect(res.body).toEqual({ error: "Usuario no disponible" })
  })

  it("responde 401 sin token", async () => {
    const res = await ordersOf(cliente)

    expect(res.status).toBe(401)
  })
})
