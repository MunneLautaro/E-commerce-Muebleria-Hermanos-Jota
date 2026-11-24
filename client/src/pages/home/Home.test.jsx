import { screen } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { toast } from "react-toastify"
import { apiUrl } from "../../test/msw/handlers"
import { server } from "../../test/msw/server"
import { renderWithProviders } from "../../test/renderWithProviders"
import HomePage from "./Home"

vi.mock("react-toastify", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

const products = [
  { _id: "1", nombre: "Mesa Roble", vendidos: 3, imagenUrl: "/mesa.jpg" },
  { _id: "2", nombre: "Silla Nórdica", vendidos: 10, imagenUrl: "/silla.jpg" },
]

const respondWith = (body, status = 200) =>
  server.use(
    http.get(apiUrl("/products"), () => HttpResponse.json(body, { status })),
  )

describe("HomePage", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test("muestra el contenido fijo mientras cargan los destacados", async () => {
    respondWith({ items: products })

    renderWithProviders(<HomePage />)

    expect(
      screen.getByRole("heading", { level: 1, name: "Hermanos Jota" }),
    ).toBeInTheDocument()
    expect(
      screen.getByText("Cargando productos destacados..."),
    ).toBeInTheDocument()

    expect(
      await screen.findByRole("heading", { name: "Silla Nórdica" }),
    ).toBeInTheDocument()
    expect(
      screen.queryByText("Cargando productos destacados..."),
    ).not.toBeInTheDocument()
  })

  test("ordena los destacados por cantidad de ventas", async () => {
    respondWith({ items: products })

    renderWithProviders(<HomePage />)

    await screen.findByRole("heading", { name: "Silla Nórdica" })
    const titles = screen
      .getAllByRole("heading", { level: 2 })
      .map((heading) => heading.textContent)

    expect(titles.indexOf("Silla Nórdica")).toBeLessThan(
      titles.indexOf("Mesa Roble"),
    )
  })

  test("mantiene el resto de la página si fallan los destacados", async () => {
    respondWith({ message: "Error" }, 500)

    renderWithProviders(<HomePage />)

    expect(
      await screen.findByText("No se pudieron cargar los productos destacados."),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { level: 1, name: "Hermanos Jota" }),
    ).toBeInTheDocument()
    expect(toast.error).toHaveBeenCalledWith(
      "No se pudieron cargar los productos destacados.",
    )
  })
})
