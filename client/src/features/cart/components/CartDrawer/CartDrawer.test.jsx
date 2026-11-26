import { screen } from "@testing-library/react"
import { useLocation } from "react-router-dom"
import { CartProvider } from "../../index"
import { renderWithProviders } from "../../../../test/renderWithProviders"
import { CartDrawer } from "./CartDrawer"

const LocationProbe = () => {
  const { pathname } = useLocation()
  return <span data-testid="pathname">{pathname}</span>
}

describe("CartDrawer", () => {
  test("ofrece el acceso a la página completa del carrito", async () => {
    const { user } = renderWithProviders(
      <CartProvider>
        <CartDrawer isOpen onClose={vi.fn()} />
        <LocationProbe />
      </CartProvider>,
    )

    await user.click(screen.getByRole("link", { name: "Ver carrito" }))

    expect(screen.getByTestId("pathname")).toHaveTextContent("/carrito")
  })
})
