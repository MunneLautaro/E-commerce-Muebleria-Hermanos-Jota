import { screen } from "@testing-library/react"
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
  test("muestra la página 404 en una ruta inexistente", () => {
    renderRoute("/una-ruta-que-no-existe")

    expect(
      screen.getByRole("heading", { level: 1, name: "Página no encontrada" }),
    ).toBeInTheDocument()
  })

  test("marca /contact como URL canónica de las dos rutas de contacto", () => {
    renderRoute("/contacto")

    expect(document.title).toBe("Contacto | Mueblería Hermanos Jota")
    expect(
      document.head.querySelector('link[rel="canonical"]'),
    ).toHaveAttribute("href", `${globalThis.location.origin}/contact`)
  })

  test("no redirige al inicio ante una ruta inexistente", () => {
    renderRoute("/admin/algo/raro")

    expect(screen.getByTestId("pathname")).toHaveTextContent(
      "/admin/algo/raro",
    )
  })
})
