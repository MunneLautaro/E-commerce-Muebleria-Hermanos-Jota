import { http, HttpResponse } from "msw"
import { server } from "../../../test/msw/server"
import {
  adminOrdersHandler,
  apiUrl,
  buildOrder,
  myOrdersHandler,
  paginatedResponse,
} from "../../../test/msw/handlers"
import { tokenStorage } from "../../../services/tokenStorage"
import { orderService, toOrderItems } from "./orderService"

const cartProducts = [
  { _id: "mesa-1", nombre: "Mesa Roble", precio: 150000, quantity: 2 },
  { _id: "silla-1", nombre: "Silla Córdoba", precio: 85000, quantity: 1 },
]

describe("orderService", () => {
  afterEach(() => tokenStorage.clear())

  test("convierte los productos del carrito al formato de la API", () => {
    expect(toOrderItems(cartProducts)).toEqual([
      { producto: "mesa-1", cantidad: 2 },
      { producto: "silla-1", cantidad: 1 },
    ])
  })

  test("crea la orden con POST /ordenes enviando el token", async () => {
    const captured = {}
    server.use(
      http.post(apiUrl("/ordenes"), async ({ request }) => {
        captured.body = await request.json()
        captured.authorization = request.headers.get("Authorization")
        return HttpResponse.json({ _id: "orden-1", total: 385000 }, { status: 201 })
      }),
    )
    tokenStorage.set("token-de-prueba")
    const envio = {
      nombreCompleto: "Ana Pérez",
      telefono: "11 5555-1234",
      direccion: "Av. Corrientes",
      altura: "1234",
      ciudad: "Buenos Aires",
      codigoPostal: "1043",
    }

    const order = await orderService.createOrder(cartProducts, envio)

    expect(order).toEqual({ _id: "orden-1", total: 385000 })
    expect(captured.body).toEqual({
      productos: [
        { producto: "mesa-1", cantidad: 2 },
        { producto: "silla-1", cantidad: 1 },
      ],
      envio,
    })
    expect(captured.authorization).toBe("Bearer token-de-prueba")
  })

  test("pide las órdenes del usuario con la paginación y el token", async () => {
    const response = paginatedResponse([buildOrder()])
    const { handler, requests } = myOrdersHandler(response)
    server.use(handler)
    tokenStorage.set("token-de-prueba")

    const data = await orderService.getMyOrders("usuario-1", { page: 2 })

    expect(data).toEqual(response)
    expect(requests).toEqual([
      expect.objectContaining({
        pathname: "/api/ordenes/usuario/usuario-1",
        query: { page: "2" },
        authorization: "Bearer token-de-prueba",
      }),
    ])
  })

  test("pide las órdenes del admin omitiendo los filtros vacíos", async () => {
    const { handler, requests } = adminOrdersHandler()
    server.use(handler)

    await orderService.getAdminOrders({
      page: 1,
      limit: 20,
      estado: "pendiente",
      desde: "2026-03-01",
      hasta: "",
      q: "ana@example.com",
    })

    expect(requests[0].pathname).toBe("/api/ordenes")
    expect(requests[0].query).toEqual({
      page: "1",
      limit: "20",
      estado: "pendiente",
      desde: "2026-03-01",
      q: "ana@example.com",
    })
  })

  test("propaga el 403 si el usuario no es admin", async () => {
    server.use(
      http.get(apiUrl("/ordenes"), () =>
        HttpResponse.json(
          { error: "Se requieren permisos de administrador" },
          { status: 403 },
        ),
      ),
    )

    await expect(orderService.getAdminOrders()).rejects.toMatchObject({
      message: "Se requieren permisos de administrador",
      status: 403,
    })
  })

  test("propaga el mensaje y el status del error del backend", async () => {
    server.use(
      http.post(apiUrl("/ordenes"), () =>
        HttpResponse.json(
          { error: 'No hay stock suficiente de "Mesa Roble". Queda 1 unidad' },
          { status: 400 },
        ),
      ),
    )

    await expect(orderService.createOrder(cartProducts)).rejects.toMatchObject({
      message: 'No hay stock suficiente de "Mesa Roble". Queda 1 unidad',
      status: 400,
    })
  })
})
