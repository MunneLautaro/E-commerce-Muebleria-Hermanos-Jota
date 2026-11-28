import { screen, within } from "@testing-library/react"
import { CartProvider } from "../../features/cart"
import { renderWithProviders } from "../../test/renderWithProviders"
import { Header } from "./Header"

const renderHeader = (auth) =>
  renderWithProviders(
    <CartProvider>
      <Header />
    </CartProvider>,
    { auth },
  )

const openMobileMenu = async (user) => {
  await user.click(screen.getByRole("button", { name: "Abrir menú" }))
  return screen.getByRole("navigation", { name: "Principal móvil" })
}

describe("Header", () => {
  test("muestra Mis órdenes en el menú de escritorio y en el móvil con sesión iniciada", async () => {
    const { user } = renderHeader({
      user: { id: "usuario-1", email: "ana@example.com", role: "user" },
      isAuthenticated: true,
    })

    const desktop = screen.getByRole("navigation", { name: "Principal" })
    expect(
      within(desktop).getByRole("link", { name: "Mis órdenes" }),
    ).toHaveAttribute("href", "/mis-ordenes")

    const mobile = await openMobileMenu(user)
    expect(
      within(mobile).getByRole("link", { name: "Mis órdenes" }),
    ).toHaveAttribute("href", "/mis-ordenes")
  })

  test("no muestra Mis órdenes sin sesión", async () => {
    const { user } = renderHeader()

    expect(screen.queryByRole("link", { name: "Mis órdenes" })).not.toBeInTheDocument()

    const mobile = await openMobileMenu(user)
    expect(
      within(mobile).queryByRole("link", { name: "Mis órdenes" }),
    ).not.toBeInTheDocument()
  })
})
