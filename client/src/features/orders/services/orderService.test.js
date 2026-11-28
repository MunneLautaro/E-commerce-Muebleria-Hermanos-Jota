import { http, HttpResponse } from "msw"
import { server } from "../../../test/msw/server"
import { apiUrl } from "../../../test/msw/handlers"
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
