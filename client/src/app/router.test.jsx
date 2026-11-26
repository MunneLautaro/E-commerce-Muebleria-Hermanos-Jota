import { screen, waitFor } from "@testing-library/react"
import { useLocation } from "react-router-dom"
import { CartProvider } from "../features/cart"
import { renderWithProviders } from "../test/renderWithProviders"
import { AppRouter } from "./router"

const LocationProbe = () => {
  const { pathname } = useLocation()
  return <span data-testid="pathname">{pathname}</span>
}

const renderRoute = (route) =>
  renderWithProviders(
    <CartProvider>
      <AppRouter />
      <LocationProbe />
    </CartProvider>,
    { route },
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
})
