import { screen } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { apiUrl } from "../../test/msw/handlers"
import { server } from "../../test/msw/server"
import { renderWithProviders } from "../../test/renderWithProviders"
import ProductsPage from "./Products"

vi.mock("react-toastify", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

const respondWithProducts = (items) =>
  server.use(
    http.get(apiUrl("/products"), () =>
      HttpResponse.json({
        items,
        pagination: { page: 1, limit: 12, total: items.length, totalPages: 1 },
      }),
    ),
  )

describe("ProductsPage", () => {
  test("muestra el encabezado y el skeleton mientras cargan los productos", async () => {
    respondWithProducts([
      { _id: "1", nombre: "Mesa Roble", precio: 150000, imagenUrl: "/mesa.jpg" },
    ])

    renderWithProviders(<ProductsPage />)

    expect(
      screen.getByRole("heading", { level: 1, name: "Catálogo de muebles" }),
    ).toBeInTheDocument()
    expect(screen.getByRole("status")).toHaveTextContent("Cargando productos...")
    expect(
      screen.queryByRole("navigation", { name: "Paginación de productos" }),
    ).not.toBeInTheDocument()

    expect(
      await screen.findByRole("heading", { name: "Mesa Roble" }),
    ).toBeInTheDocument()
    expect(screen.queryByRole("status")).not.toBeInTheDocument()
    expect(
      screen.getByRole("navigation", { name: "Paginación de productos" }),
    ).toBeInTheDocument()
  })

  test("muestra el estado vacío cuando no hay productos", async () => {
    respondWithProducts([])

    renderWithProviders(<ProductsPage />)

    expect(
      await screen.findByRole("heading", {
        name: "Todavía no hay productos disponibles",
      }),
    ).toBeInTheDocument()
  })
})
