import { screen, waitFor, within } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { useLocation } from "react-router-dom"
import { CartProvider } from "../features/cart"
import { adminProductsHandler, apiUrl } from "../test/msw/handlers"
import { renderWithProviders } from "../test/renderWithProviders"
import { server } from "../test/msw/server"
import { AppRouter } from "./router"

const LocationProbe = () => {
  const { pathname } = useLocation()
  return <span data-testid="pathname">{pathname}</span>
}

const renderRoute = (route, routeState, auth) =>
  renderWithProviders(
    <CartProvider>
      <AppRouter />
      <LocationProbe />
    </CartProvider>,
    { route, routeState, auth },
  )

describe("AppRouter", () => {
  test("muestra la página 404 en una ruta inexistente", async () => {
    renderRoute("/una-ruta-que-no-existe")

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Página no encontrada",
      }),
    ).toBeInTheDocument()
  })

  test("marca /contact como URL canónica de las dos rutas de contacto", async () => {
    renderRoute("/contacto")

    await waitFor(() =>
      expect(document.title).toBe("Contacto | Mueblería Hermanos Jota"),
    )
    expect(
      document.head.querySelector('link[rel="canonical"]'),
    ).toHaveAttribute("href", `${globalThis.location.origin}/contact`)
  })

  test("muestra el carrito en /carrito y lo marca como privado para buscadores", async () => {
    server.use(
      http.get(apiUrl("/products"), () =>
        HttpResponse.json({ items: [], pagination: { page: 1, totalPages: 0 } }),
      ),
    )

    renderRoute("/carrito")

    expect(
      await screen.findByRole("heading", { level: 1, name: "Mi carrito" }),
    ).toBeInTheDocument()
    expect(document.title).toBe("Mi carrito | Mueblería Hermanos Jota")
    expect(
      document.head.querySelector('meta[name="robots"]'),
    ).toHaveAttribute("content", "noindex, nofollow")
  })

  test("no redirige al inicio ante una ruta inexistente", async () => {
    renderRoute("/admin/algo/raro")

    await screen.findByRole("heading", {
      level: 1,
      name: "Página no encontrada",
    })

    expect(screen.getByTestId("pathname")).toHaveTextContent(
      "/admin/algo/raro",
    )
  })

  test("muestra la confirmación de compra y permite volver al inicio", async () => {
    renderRoute("/compra-confirmada", { orderId: "orden-123" })

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "¡Gracias por tu compra!",
      }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Tu pago fue confirmado/)).toBeInTheDocument()
    expect(screen.getByText("orden-123")).toBeInTheDocument()
    expect(document.title).toBe("Compra confirmada | Mueblería Hermanos Jota")
    expect(
      screen.getByRole("link", { name: "Volver al inicio" }),
    ).toHaveAttribute("href", "/")
    expect(
      screen.getByRole("link", { name: "Ver mis órdenes" }),
    ).toHaveAttribute("href", "/mis-ordenes")
  })

  test("redirige /admin a la lista de productos del panel", async () => {
    const { handler } = adminProductsHandler()
    server.use(handler)

    renderRoute("/admin", undefined, {
      user: { id: "admin-1", email: "admin@example.com", role: "admin" },
      isAuthenticated: true,
    })

    expect(
      await screen.findByRole("heading", { level: 1, name: "Gestionar productos" }),
    ).toBeInTheDocument()
    expect(screen.getByTestId("pathname")).toHaveTextContent("/admin/productos")
    const tabs = screen.getByRole("navigation", { name: "Secciones del panel" })
    expect(
      within(tabs).getByRole("link", { name: "Productos" }),
    ).toHaveAttribute("aria-current", "page")
  })

  test("manda al login a quien entra a /mis-ordenes sin sesión", async () => {
    renderRoute("/mis-ordenes")

    expect(
      await screen.findByRole("heading", { level: 1, name: "Ingresá a tu cuenta" }),
    ).toBeInTheDocument()
    expect(screen.getByTestId("pathname")).toHaveTextContent("/login")
  })

  test("redirige al carrito si se entra a la confirmación sin una compra", async () => {
    server.use(
      http.get(apiUrl("/products"), () =>
        HttpResponse.json({ items: [], pagination: { page: 1, totalPages: 0 } }),
      ),
    )

    renderRoute("/compra-confirmada")

    expect(
      await screen.findByRole("heading", { level: 1, name: "Mi carrito" }),
    ).toBeInTheDocument()
    expect(screen.getByTestId("pathname")).toHaveTextContent("/carrito")
    expect(
      screen.queryByRole("heading", { name: "¡Gracias por tu compra!" }),
    ).not.toBeInTheDocument()
  })
})
