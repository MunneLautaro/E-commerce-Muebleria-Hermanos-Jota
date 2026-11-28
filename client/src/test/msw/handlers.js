import { http, HttpResponse } from "msw"

export const API_URL = "http://localhost:3000/api"

export const apiUrl = (path) => `${API_URL}${path}`

export const handlers = []

export const paginatedResponse = (
  items,
  { page = 1, limit = 12, total = items.length } = {},
) => ({
  items,
  pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
})

export const buildOrder = (overrides = {}) => ({
  _id: "64b7f0c2a1b2c3d4e5f60001",
  createdAt: "2026-03-10T15:30:00.000Z",
  estado: "aceptada",
  total: 385000,
  comprador: {
    _id: "64b7f0c2a1b2c3d4e5f6aaaa",
    name: "Ana Pérez",
    email: "ana@example.com",
  },
  productos: [
    {
      producto: {
        _id: "mesa-1",
        nombre: "Mesa Roble",
        precio: 999999,
        imagenUrl: "/mesa.jpg",
      },
      cantidad: 2,
      subtotal: 300000,
    },
    {
      producto: null,
      cantidad: 1,
      subtotal: 85000,
    },
  ],
  envio: {
    nombreCompleto: "Ana Pérez",
    telefono: "11 5555-1234",
    direccion: "Av. Corrientes",
    altura: "1234",
    ciudad: "Buenos Aires",
    codigoPostal: "1043",
  },
  ...overrides,
})

export const captureGet = (path, respond) => {
  const requests = []
  const handler = http.get(apiUrl(path), ({ request, params }) => {
    const url = new URL(request.url)
    const captured = {
      pathname: url.pathname,
      params,
      query: Object.fromEntries(url.searchParams),
      authorization: request.headers.get("Authorization"),
    }
    requests.push(captured)
    const body = typeof respond === "function" ? respond(captured) : respond
    return body instanceof Response ? body : HttpResponse.json(body)
  })
  return { handler, requests }
}

export const myOrdersHandler = (respond = paginatedResponse([])) =>
  captureGet("/ordenes/usuario/:compradorId", respond)

export const adminOrdersHandler = (respond = paginatedResponse([], { limit: 20 })) =>
  captureGet("/ordenes", respond)

export const adminProductsHandler = (
  respond = paginatedResponse([], { limit: 20 }),
) => captureGet("/products/admin", respond)
