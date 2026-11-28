import { screen } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { useLocation } from "react-router-dom"
import { CART_STORAGE_KEY, CartProvider } from "../../index"
import { apiUrl } from "../../../../test/msw/handlers"
import { server } from "../../../../test/msw/server"
import { renderWithProviders } from "../../../../test/renderWithProviders"
import { CartDrawer } from "./CartDrawer"

const LocationProbe = () => {
  const { pathname } = useLocation()
  return <span data-testid="pathname">{pathname}</span>
}

const mesa = {
  _id: "mesa-1",
  nombre: "Mesa Roble",
  precio: 150000,
  stock: 5,
  imagenUrl: "/mesa.jpg",
}

const renderDrawer = (isOpen) =>
  renderWithProviders(
    <CartProvider>
      <CartDrawer isOpen={isOpen} onClose={vi.fn()} />
      <LocationProbe />
    </CartProvider>,
  )

describe("CartDrawer", () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  test("ofrece el acceso a la página completa del carrito", async () => {
    const { user } = renderDrawer(true)

    await user.click(screen.getByRole("link", { name: "Ver carrito" }))

    expect(screen.getByTestId("pathname")).toHaveTextContent("/carrito")
  })

  test("carga los productos solo cuando está abierto y quita los que ya no existen", async () => {
    window.localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify([
        { id: "mesa-1", quantity: 2 },
        { id: "producto-desactivado", quantity: 1 },
      ]),
    )
    const requests = []
    server.use(
      http.get(apiUrl("/products/:id"), ({ params }) => {
        requests.push(params.id)
        return params.id === mesa._id
          ? HttpResponse.json(mesa)
          : HttpResponse.json({ error: "Producto no encontrado" }, { status: 404 })
      }),
    )

    const closed = renderDrawer(false)
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(requests).toEqual([])
    closed.unmount()

    renderDrawer(true)

    expect(await screen.findByText("Mesa Roble")).toBeInTheDocument()
    expect(screen.queryByText("No pudimos cargar tus productos del carrito.")).not.toBeInTheDocument()
    expect(requests.sort()).toEqual(["mesa-1", "producto-desactivado"])
  })
})
