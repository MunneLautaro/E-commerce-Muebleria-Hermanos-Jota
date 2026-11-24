import { screen } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { Route, Routes } from "react-router-dom"
import { CartProvider } from "../../features/cart"
import { apiUrl } from "../../test/msw/handlers"
import { server } from "../../test/msw/server"
import { renderWithProviders } from "../../test/renderWithProviders"
import ProductDetail from "./ProductDetail"

const respondWith = (body, status = 200) =>
  server.use(
    http.get(apiUrl("/products/:id"), () => HttpResponse.json(body, { status })),
  )

const renderDetail = (id = "abc123") =>
  renderWithProviders(
    <CartProvider>
      <Routes>
        <Route path="/productos/:id" element={<ProductDetail />} />
      </Routes>
    </CartProvider>,
    { route: `/productos/${id}` },
  )

describe("ProductDetail", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test("muestra el producto cuando existe", async () => {
    respondWith({
      _id: "abc123",
      nombre: "Mesa Roble",
      descripcion: "Mesa de roble macizo",
      precio: 150000,
      stock: 3,
      imagenUrl: "/mesa.jpg",
    })

    renderDetail()

    expect(
      await screen.findByRole("heading", { level: 1, name: "Mesa Roble" }),
    ).toBeInTheDocument()
  })

  test("muestra la página 404 cuando el producto no existe", async () => {
    respondWith({ error: "Producto no encontrado" }, 404)

    renderDetail()

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Producto no encontrado",
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: "Volver al inicio" }),
    ).toBeInTheDocument()
  })

  test("muestra la página 404 cuando el id no es válido", async () => {
    respondWith({ error: "El ID del producto no es válido" }, 400)

    renderDetail("id-invalido")

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Producto no encontrado",
      }),
    ).toBeInTheDocument()
  })

  test("muestra el mensaje de error ante una falla del servidor", async () => {
    respondWith({ error: "Error interno" }, 500)

    renderDetail()

    expect(
      await screen.findByText("No se pudo cargar el producto."),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole("heading", { name: "Producto no encontrado" }),
    ).not.toBeInTheDocument()
  })
})
