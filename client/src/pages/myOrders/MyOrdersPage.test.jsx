import { screen, within } from "@testing-library/react"
import { HttpResponse } from "msw"
import { Route, Routes, useLocation } from "react-router-dom"
import {
  buildOrder,
  myOrdersHandler,
  paginatedResponse,
} from "../../test/msw/handlers"
import { server } from "../../test/msw/server"
import { renderWithProviders } from "../../test/renderWithProviders"
import MyOrdersPage from "./MyOrdersPage"

const cliente = { id: "usuario-1", email: "ana@example.com", role: "user" }

const LoginProbe = () => {
  const location = useLocation()
  return <p data-testid="login-state">{JSON.stringify(location.state)}</p>
}

const renderPage = (auth = { user: cliente, isAuthenticated: true }) =>
  renderWithProviders(
    <Routes>
      <Route path="/mis-ordenes" element={<MyOrdersPage />} />
      <Route path="/login" element={<LoginProbe />} />
    </Routes>,
    { route: "/mis-ordenes", auth },
  )

const newestOrder = buildOrder({
  _id: "64b7f0c2a1b2c3d4e5f60002",
  createdAt: "2026-03-12T15:30:00.000Z",
  estado: "pendiente",
  total: 150000,
  productos: [
    {
      producto: { _id: "silla-1", nombre: "Silla Córdoba", imagenUrl: "/silla.jpg" },
      cantidad: 1,
      subtotal: 150000,
    },
  ],
})
const olderOrder = buildOrder()

const useOrders = (respond) => {
  const { handler, requests } = myOrdersHandler(respond)
  server.use(handler)
  return requests
}

const normalize = (text) => text.replace(/\s/g, " ")

describe("MyOrdersPage", () => {
  afterEach(() => vi.restoreAllMocks())

  test("sin sesión redirige al login y guarda la vuelta a /mis-ordenes", async () => {
    renderPage({ user: null, isAuthenticated: false })

    expect(await screen.findByTestId("login-state")).toHaveTextContent(
      JSON.stringify({ from: "/mis-ordenes" }),
    )
  })

  test("lista las órdenes del usuario logueado en el orden que devuelve la API", async () => {
    const requests = useOrders(paginatedResponse([newestOrder, olderOrder]))
    renderPage()

    const list = await screen.findByRole("list", { name: "Tus órdenes" })
    const items = within(list).getAllByRole("listitem")

    expect(items).toHaveLength(2)
    expect(normalize(items[0].textContent)).toBe(
      "Orden N° 64b7f0c2a1b2c3d4e5f6000212/03/2026 · 1 producto$ 150.000Pago pendiente",
    )
    expect(normalize(items[1].textContent)).toBe(
      "Orden N° 64b7f0c2a1b2c3d4e5f6000110/03/2026 · 3 productos$ 385.000Pago confirmado",
    )
    expect(requests[0]).toMatchObject({
      pathname: "/api/ordenes/usuario/usuario-1",
      query: { page: "1", limit: "12" },
    })
    expect(
      screen.getByRole("heading", { level: 1, name: "Mis órdenes" }),
    ).toBeInTheDocument()
  })

  test("abre el detalle con el precio unitario calculado desde el subtotal", async () => {
    useOrders(paginatedResponse([olderOrder]))
    const { user } = renderPage()

    await user.click(
      await screen.findByRole("button", { name: /Orden N° 64b7f0c2a1b2c3d4e5f60001/ }),
    )

    const dialog = screen.getByRole("dialog", {
      name: "Orden N° 64b7f0c2a1b2c3d4e5f60001",
    })
    const mesa = within(dialog).getByText("Mesa Roble").closest("li")
    expect(normalize(mesa.textContent)).toContain("Precio unitario$ 150.000")
    expect(within(dialog).getByText("Producto no disponible")).toBeInTheDocument()
    expect(
      within(dialog).queryByRole("heading", { name: "Comprador" }),
    ).not.toBeInTheDocument()

    await user.click(
      within(dialog).getByRole("button", { name: "Cerrar detalle de la orden" }),
    )
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  test("pagina las órdenes", async () => {
    const requests = useOrders(({ query }) =>
      paginatedResponse(
        [query.page === "2" ? olderOrder : newestOrder],
        { page: Number(query.page), total: 13 },
      ),
    )
    const { user } = renderPage()

    await screen.findByText(/64b7f0c2a1b2c3d4e5f60002/)
    expect(
      screen.getByRole("navigation", { name: "Paginación de órdenes" }),
    ).toHaveTextContent("Página 1 de 2")

    await user.click(screen.getByRole("button", { name: "Siguiente" }))

    expect(await screen.findByText(/64b7f0c2a1b2c3d4e5f60001/)).toBeInTheDocument()
    expect(requests.map(({ query }) => query.page)).toEqual(["1", "2"])
  })

  test("muestra el estado vacío con un link al catálogo", async () => {
    useOrders(paginatedResponse([]))
    renderPage()

    expect(
      await screen.findByRole("heading", { name: "Todavía no hiciste compras" }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: "Explorar productos" }),
    ).toHaveAttribute("href", "/productos")
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument()
  })

  test("muestra el error y permite reintentar", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    let calls = 0
    useOrders(() => {
      calls += 1
      return calls === 1
        ? HttpResponse.json({ error: "Error interno" }, { status: 500 })
        : paginatedResponse([olderOrder])
    })
    const { user } = renderPage()

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudieron cargar tus órdenes.",
    )

    await user.click(screen.getByRole("button", { name: "Intentar nuevamente" }))

    expect(await screen.findByRole("list", { name: "Tus órdenes" })).toBeInTheDocument()
  })

  test("pide no indexar la página", async () => {
    useOrders(paginatedResponse([]))
    renderPage()

    await screen.findByRole("heading", { name: "Todavía no hiciste compras" })
    expect(document.title).toBe("Mis órdenes | Mueblería Hermanos Jota")
    expect(
      document.head.querySelector('meta[name="robots"]'),
    ).toHaveAttribute("content", "noindex, nofollow")
  })
})
