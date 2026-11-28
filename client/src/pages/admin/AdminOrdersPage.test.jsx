import { fireEvent, screen, waitFor, within } from "@testing-library/react"
import { Route, Routes, useLocation } from "react-router-dom"
import {
  adminOrdersHandler,
  buildOrder,
  paginatedResponse,
} from "../../test/msw/handlers"
import { server } from "../../test/msw/server"
import { renderWithProviders } from "../../test/renderWithProviders"
import AdminOrdersPage from "./AdminOrdersPage"

const admin = { id: "admin-1", email: "admin@example.com", role: "admin" }
const adminAuth = { user: admin, isAuthenticated: true }

const LocationProbe = () => {
  const location = useLocation()
  return (
    <>
      <p data-testid="pathname">{location.pathname}</p>
      <p data-testid="search">{location.search}</p>
    </>
  )
}

const renderPage = (route = "/admin/ordenes", auth = adminAuth) =>
  renderWithProviders(
    <>
      <Routes>
        <Route path="/admin/ordenes" element={<AdminOrdersPage />} />
        <Route path="/login" element={<h1>Login</h1>} />
        <Route path="/" element={<h1>Inicio</h1>} />
      </Routes>
      <LocationProbe />
    </>,
    { route, auth },
  )

const useOrders = (respond = paginatedResponse([buildOrder()], { limit: 20 })) => {
  const { handler, requests } = adminOrdersHandler(respond)
  server.use(handler)
  return requests
}

const lastQuery = (requests) => requests.at(-1).query
const expectSearch = (value) =>
  waitFor(() => expect(screen.getByTestId("search")).toHaveTextContent(value === "" ? /^$/ : value))

const normalize = (text) => text.replace(/\s/g, " ")

describe("AdminOrdersPage", () => {
  afterEach(() => vi.restoreAllMocks())

  test("sin sesión redirige al login", async () => {
    renderPage("/admin/ordenes", { user: null, isAuthenticated: false })

    expect(await screen.findByRole("heading", { name: "Login" })).toBeInTheDocument()
  })

  test("redirige al inicio a un usuario que no es admin y no pide las órdenes", async () => {
    renderPage("/admin/ordenes", {
      user: { id: "user-1", email: "ana@example.com", role: "user" },
      isAuthenticated: true,
    })

    expect(await screen.findByRole("heading", { name: "Inicio" })).toBeInTheDocument()
  })

  test("muestra la tabla de órdenes con el comprador y pide no indexar", async () => {
    const requests = useOrders()
    renderPage()

    const table = await screen.findByRole("table")
    const [, row] = within(table).getAllByRole("row")
    expect(normalize(row.textContent)).toBe(
      "64b7f0c2a1b2c3d4e5f6000110/03/2026Ana Pérezana@example.com3 productos$ 385.000Pago confirmadoVer detalle",
    )
    expect(lastQuery(requests)).toEqual({ page: "1", limit: "20" })
    expect(screen.getByText("1 orden")).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { level: 1, name: "Órdenes de compra" }),
    ).toBeInTheDocument()
    expect(document.title).toBe("Panel de órdenes | Mueblería Hermanos Jota")
    expect(
      document.head.querySelector('meta[name="robots"]'),
    ).toHaveAttribute("content", "noindex, nofollow")
  })

  test("abre el detalle con los datos del comprador y el precio unitario", async () => {
    useOrders()
    const { user } = renderPage()

    await user.click(
      await screen.findByRole("button", {
        name: "Ver detalle de la orden 64b7f0c2a1b2c3d4e5f60001",
      }),
    )

    const dialog = screen.getByRole("dialog", {
      name: "Orden N° 64b7f0c2a1b2c3d4e5f60001",
    })
    const buyer = within(dialog).getByRole("region", { name: "Comprador" })
    expect(within(buyer).getByText("ana@example.com")).toBeInTheDocument()
    const mesa = within(dialog).getByText("Mesa Roble").closest("li")
    expect(normalize(mesa.textContent)).toContain("Precio unitario$ 150.000")
  })

  test("al filtrar por estado actualiza la URL, la request y vuelve a la página 1", async () => {
    const requests = useOrders()
    const { user } = renderPage("/admin/ordenes?page=3&limit=15")

    await screen.findByRole("table")
    expect(lastQuery(requests)).toEqual({ page: "3", limit: "15" })

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Estado" }),
      "Pago pendiente",
    )

    await expectSearch("?limit=15&estado=pendiente")
    await waitFor(() =>
      expect(lastQuery(requests)).toEqual({ page: "1", limit: "15", estado: "pendiente" }),
    )
  })

  test("las fechas se limitan entre sí y viajan en la URL y la request", async () => {
    const requests = useOrders()
    renderPage()
    await screen.findByRole("table")

    const desde = screen.getByLabelText("Desde")
    const hasta = screen.getByLabelText("Hasta")

    fireEvent.change(desde, { target: { value: "2026-03-01" } })
    await expectSearch("?desde=2026-03-01")
    expect(hasta).toHaveAttribute("min", "2026-03-01")

    fireEvent.change(hasta, { target: { value: "2026-03-31" } })
    await expectSearch("?desde=2026-03-01&hasta=2026-03-31")
    expect(desde).toHaveAttribute("max", "2026-03-31")
    await waitFor(() =>
      expect(lastQuery(requests)).toEqual({
        page: "1",
        limit: "20",
        desde: "2026-03-01",
        hasta: "2026-03-31",
      }),
    )
  })

  test("si una fecha deja el rango invertido limpia la otra", async () => {
    useOrders()
    renderPage("/admin/ordenes?desde=2026-03-10&hasta=2026-03-20")
    await screen.findByRole("table")

    fireEvent.change(screen.getByLabelText("Desde"), {
      target: { value: "2026-03-25" },
    })

    await expectSearch("?desde=2026-03-25")
  })

  test("busca con debounce y manda una sola request por lo escrito", async () => {
    const requests = useOrders()
    const { user } = renderPage()
    await screen.findByRole("table")

    await user.type(
      screen.getByRole("searchbox", {
        name: "Número de orden, nombre o email del comprador",
      }),
      "ana@",
    )

    expect(requests).toHaveLength(1)
    await expectSearch("?q=ana%40")
    await waitFor(() => expect(lastQuery(requests)).toMatchObject({ q: "ana@" }))
    expect(requests).toHaveLength(2)
  })

  test("con parámetros inválidos en la URL usa los valores por defecto", async () => {
    const requests = useOrders()
    renderPage(
      "/admin/ordenes?page=abc&limit=7&estado=cancelada&desde=ayer&hasta=2026-02-30",
    )

    expect(await screen.findByRole("table")).toBeInTheDocument()
    expect(lastQuery(requests)).toEqual({ page: "1", limit: "20" })
    expect(screen.getByRole("combobox", { name: "Estado" })).toHaveValue("")
    expect(screen.getByLabelText("Desde")).toHaveValue("")
  })

  test("limpia los filtros y la búsqueda manteniendo la cantidad por página", async () => {
    const requests = useOrders()
    const { user } = renderPage(
      "/admin/ordenes?limit=15&estado=rechazada&desde=2026-03-01&q=ana&page=2",
    )
    await screen.findByRole("table")

    expect(
      screen.getByRole("searchbox", {
        name: "Número de orden, nombre o email del comprador",
      }),
    ).toHaveValue("ana")

    await user.click(screen.getByRole("button", { name: "Limpiar filtros" }))

    await expectSearch("?limit=15")
    expect(
      screen.getByRole("searchbox", {
        name: "Número de orden, nombre o email del comprador",
      }),
    ).toHaveValue("")
    await waitFor(() => expect(lastQuery(requests)).toEqual({ page: "1", limit: "15" }))
    expect(screen.queryByRole("button", { name: "Limpiar filtros" })).not.toBeInTheDocument()
  })

  test("pagina y cambia la cantidad por página desde la URL", async () => {
    const requests = useOrders(({ query }) =>
      paginatedResponse([buildOrder()], {
        page: Number(query.page),
        limit: Number(query.limit),
        total: 45,
      }),
    )
    const { user } = renderPage()

    const nav = await screen.findByRole("navigation", { name: "Paginación de órdenes" })
    expect(nav).toHaveTextContent("Página 1 de 3")

    await user.click(within(nav).getByRole("button", { name: "Siguiente" }))

    await expectSearch("?page=2")
    await waitFor(() => expect(lastQuery(requests)).toEqual({ page: "2", limit: "20" }))

    await user.selectOptions(
      await screen.findByRole("combobox", { name: "Por página" }),
      "15",
    )

    await expectSearch("?limit=15")
    await waitFor(() => expect(lastQuery(requests)).toEqual({ page: "1", limit: "15" }))
  })

  test("muestra un estado vacío cuando todavía no hay órdenes", async () => {
    useOrders(paginatedResponse([], { limit: 20 }))
    renderPage()

    expect(await screen.findByText("Todavía no hay órdenes.")).toBeInTheDocument()
    expect(screen.queryByRole("table")).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Limpiar filtros" })).not.toBeInTheDocument()
  })

  test("muestra un estado vacío con limpiar filtros cuando los filtros no tienen resultados", async () => {
    const requests = useOrders(({ query }) =>
      query.estado
        ? paginatedResponse([], { limit: 20 })
        : paginatedResponse([buildOrder()], { limit: 20 }),
    )
    const { user } = renderPage("/admin/ordenes?estado=pendiente")

    expect(
      await screen.findByText("No hay órdenes que coincidan con los filtros."),
    ).toBeInTheDocument()

    const clearButtons = screen.getAllByRole("button", { name: "Limpiar filtros" })
    await user.click(clearButtons.at(-1))

    expect(await screen.findByRole("table")).toBeInTheDocument()
    expect(lastQuery(requests)).toEqual({ page: "1", limit: "20" })
  })

  test("vuelve a la página 1 si la página de la URL quedó fuera de rango", async () => {
    const requests = useOrders(({ query }) =>
      query.page === "9"
        ? paginatedResponse([], { page: 9, limit: 20, total: 3 })
        : paginatedResponse([buildOrder()], { limit: 20, total: 3 }),
    )
    renderPage("/admin/ordenes?page=9")

    expect(await screen.findByRole("table")).toBeInTheDocument()
    expect(screen.getByTestId("search")).toHaveTextContent(/^$/)
    expect(requests.map(({ query }) => query.page)).toEqual(["9", "1"])
  })
})
