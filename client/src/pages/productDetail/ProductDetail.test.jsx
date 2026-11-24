import { screen } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { Route, Routes } from "react-router-dom"
import { CartProvider } from "../../features/cart"
import { apiUrl } from "../../test/msw/handlers"
import { server } from "../../test/msw/server"
import { renderWithProviders } from "../../test/renderWithProviders"
import ProductDetail from "./ProductDetail"

const getMeta = (name) =>
  document.head.querySelector(`meta[name="${name}"]`)

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

  test("usa el nombre y la descripción del producto en los metadatos", async () => {
    respondWith({
      _id: "abc123",
      nombre: "Mesa Roble",
      descripcion: "  Mesa de roble\n  macizo  ",
      precio: 150000,
      stock: 3,
      imagenUrl: "/mesa.jpg",
    })

    renderDetail()

    await screen.findByRole("heading", { level: 1, name: "Mesa Roble" })
    expect(document.title).toBe("Mesa Roble | Mueblería Hermanos Jota")
    expect(getMeta("description")).toHaveAttribute(
      "content",
      "Mesa de roble macizo",
    )
    expect(
      document.head.querySelector('link[rel="canonical"]'),
    ).toHaveAttribute("href", `${globalThis.location.origin}/productos/abc123`)
    expect(getMeta("robots")).toBeNull()
  })

  test("recorta las descripciones largas para los metadatos", async () => {
    respondWith({
      _id: "abc123",
      nombre: "Sofá Patagonia",
      descripcion: "a".repeat(300),
      precio: 450000,
      stock: 1,
      imagenUrl: "/sofa.jpg",
    })

    renderDetail()

    await screen.findByRole("heading", { level: 1, name: "Sofá Patagonia" })
    const content = getMeta("description").getAttribute("content")
    expect(content).toHaveLength(155)
    expect(content.endsWith("…")).toBe(true)
  })

  test("arma una descripción por defecto si el producto no tiene", async () => {
    respondWith({
      _id: "abc123",
      nombre: "Silla Nórdica",
      precio: 85000,
      stock: 2,
      imagenUrl: "/silla.jpg",
    })

    renderDetail()

    await screen.findByRole("heading", { level: 1, name: "Silla Nórdica" })
    expect(getMeta("description").getAttribute("content")).toMatch(
      /^Conocé Silla Nórdica en Mueblería Hermanos Jota/,
    )
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
    expect(getMeta("robots")).toHaveAttribute("content", "noindex, nofollow")
  })
})
