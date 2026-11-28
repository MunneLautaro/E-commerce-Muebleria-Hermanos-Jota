import { screen, waitFor, within } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { Route, Routes, useLocation } from "react-router-dom"
import {
  adminProductsHandler,
  apiUrl,
  paginatedResponse,
} from "../../test/msw/handlers"
import { server } from "../../test/msw/server"
import { renderWithProviders } from "../../test/renderWithProviders"
import AdminProductsPage from "./AdminProductsPage"

const adminAuth = {
  user: { id: "admin-1", email: "admin@example.com", role: "admin" },
  isAuthenticated: true,
}

const mesa = {
  _id: "mesa-1",
  nombre: "Mesa Palermo",
  sku: "HJ-000123",
  precio: 450000,
  stock: 5,
  imagenUrl: "/mesa.jpg",
  isActive: true,
}
const silla = { ...mesa, _id: "silla-1", nombre: "Silla Nórdica", sku: "HJ-000456", isActive: false }

const LocationProbe = () => {
  const location = useLocation()
  return <p data-testid="search">{location.search}</p>
}

const EditProbe = () => {
  const location = useLocation()
  return <p data-testid="edit-state">{JSON.stringify(location.state)}</p>
}

const renderPage = (route = "/admin/productos", auth = adminAuth) =>
  renderWithProviders(
    <>
      <Routes>
        <Route path="/admin/productos" element={<AdminProductsPage />} />
        <Route path="/admin/editar-producto/:id" element={<EditProbe />} />
        <Route path="/login" element={<h1>Login</h1>} />
        <Route path="/" element={<h1>Inicio</h1>} />
      </Routes>
      <LocationProbe />
    </>,
    { route, auth },
  )

const useProducts = (respond = paginatedResponse([mesa, silla], { limit: 20 })) => {
  const { handler, requests } = adminProductsHandler(respond)
  server.use(handler)
  return requests
}

const lastQuery = (requests) => requests.at(-1).query
const expectSearch = (value) =>
  waitFor(() =>
    expect(screen.getByTestId("search")).toHaveTextContent(value === "" ? /^$/ : value),
  )
const searchbox = () => screen.getByRole("searchbox", { name: "Nombre o SKU" })

describe("AdminProductsPage", () => {
  test("sin sesión redirige al login", async () => {
    renderPage("/admin/productos", { user: null, isAuthenticated: false })

    expect(await screen.findByRole("heading", { name: "Login" })).toBeInTheDocument()
  })

  test("redirige al inicio a un usuario que no es admin", async () => {
    renderPage("/admin/productos", {
      user: { id: "user-1", email: "ana@example.com", role: "user" },
      isAuthenticated: true,
    })

    expect(await screen.findByRole("heading", { name: "Inicio" })).toBeInTheDocument()
  })

  test("lista los productos con 20 por página por defecto y marca la tab activa", async () => {
    const requests = useProducts()
    renderPage()

    const table = await screen.findByRole("table")
    expect(within(table).getByText("Mesa Palermo")).toBeInTheDocument()
    expect(within(table).getByText("Inactivo")).toBeInTheDocument()
    expect(lastQuery(requests)).toEqual({
      page: "1",
      limit: "20",
      order: "name_asc",
      estado: "todos",
    })
    const tabs = screen.getByRole("navigation", { name: "Secciones del panel" })
    expect(within(tabs).getByRole("link", { name: "Productos" })).toHaveAttribute(
      "aria-current",
      "page",
    )
    expect(within(tabs).getByRole("link", { name: "Órdenes" })).toHaveAttribute(
      "href",
      "/admin/ordenes",
    )
  })

  test("filtra por estado y vuelve a la página 1", async () => {
    const requests = useProducts()
    const { user } = renderPage("/admin/productos?page=2")
    await screen.findByRole("table")

    await user.selectOptions(screen.getByRole("combobox", { name: "Estado" }), "Inactivos")

    await expectSearch("?estado=inactivos")
    await waitFor(() =>
      expect(lastQuery(requests)).toMatchObject({ page: "1", estado: "inactivos" }),
    )
  })

  test("busca por nombre o SKU con debounce", async () => {
    const requests = useProducts()
    const { user } = renderPage()
    await screen.findByRole("table")

    await user.type(searchbox(), "HJ-0001")

    expect(requests).toHaveLength(1)
    await expectSearch("?q=HJ-0001")
    await waitFor(() => expect(lastQuery(requests)).toMatchObject({ q: "HJ-0001" }))
    expect(requests).toHaveLength(2)
  })

  test("pagina y cambia la cantidad por página", async () => {
    const requests = useProducts(({ query }) =>
      paginatedResponse([mesa], {
        page: Number(query.page),
        limit: Number(query.limit),
        total: 50,
      }),
    )
    const { user } = renderPage("/admin/productos?estado=activos")

    const nav = await screen.findByRole("navigation", { name: "Paginación de productos" })
    expect(nav).toHaveTextContent("Página 1 de 3")
    expect(within(nav).getByRole("combobox", { name: "Por página" })).toHaveValue("20")

    await user.click(within(nav).getByRole("button", { name: "Siguiente" }))
    await expectSearch("?estado=activos&page=2")

    await user.selectOptions(
      await screen.findByRole("combobox", { name: "Por página" }),
      "12",
    )
    await expectSearch("?estado=activos&limit=12")
    await waitFor(() =>
      expect(lastQuery(requests)).toMatchObject({ page: "1", limit: "12", estado: "activos" }),
    )
  })

  test("con parámetros inválidos en la URL usa los valores por defecto", async () => {
    const requests = useProducts()
    renderPage("/admin/productos?estado=borrados&limit=99&page=-1")

    expect(await screen.findByRole("table")).toBeInTheDocument()
    expect(lastQuery(requests)).toEqual({
      page: "1",
      limit: "20",
      order: "name_asc",
      estado: "todos",
    })
  })

  test("muestra el estado vacío de los filtros y permite limpiarlos", async () => {
    const requests = useProducts(({ query }) =>
      query.q
        ? paginatedResponse([], { limit: 20 })
        : paginatedResponse([mesa], { limit: 20 }),
    )
    const { user } = renderPage("/admin/productos?q=inexistente&estado=inactivos")

    expect(
      await screen.findByText("No hay productos que coincidan con los filtros."),
    ).toBeInTheDocument()
    expect(searchbox()).toHaveValue("inexistente")

    await user.click(screen.getAllByRole("button", { name: "Limpiar filtros" }).at(-1))

    expect(await screen.findByRole("table")).toBeInTheDocument()
    await expectSearch("")
    expect(searchbox()).toHaveValue("")
    expect(lastQuery(requests)).toMatchObject({ estado: "todos" })
    expect(lastQuery(requests)).not.toHaveProperty("q")
  })

  test("muestra el estado vacío cuando todavía no hay productos", async () => {
    useProducts(paginatedResponse([], { limit: 20 }))
    renderPage()

    expect(await screen.findByText("Todavía no hay productos cargados.")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Crear el primero" })).toHaveAttribute(
      "href",
      "/admin/crear-producto",
    )
  })

  test("el link de editar lleva la URL actual para volver con los mismos filtros", async () => {
    useProducts()
    const { user } = renderPage("/admin/productos?estado=inactivos&page=2&q=silla")

    await user.click((await screen.findAllByRole("link", { name: "Editar" }))[0])

    expect(await screen.findByTestId("edit-state")).toHaveTextContent(
      JSON.stringify({ from: "/admin/productos?estado=inactivos&page=2&q=silla" }),
    )
  })

  test("al eliminar el único producto de una página vuelve a la anterior", async () => {
    const requests = useProducts(({ query }) =>
      paginatedResponse([mesa], { page: Number(query.page), limit: 20, total: 21 }),
    )
    server.use(http.delete(apiUrl("/products/:id"), () => HttpResponse.json(mesa)))
    const { user } = renderPage("/admin/productos?page=2")

    await user.click(await screen.findByRole("button", { name: "Eliminar" }))
    await user.click(screen.getByRole("button", { name: "Eliminar producto" }))

    await expectSearch("")
    await waitFor(() => expect(lastQuery(requests)).toMatchObject({ page: "1" }))
  })
})
