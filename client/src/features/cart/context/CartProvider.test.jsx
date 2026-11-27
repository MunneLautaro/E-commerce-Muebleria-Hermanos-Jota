import { useEffect, useRef } from "react"
import { screen } from "@testing-library/react"
import { CART_STORAGE_KEY, CartProvider, useCart } from "../index"
import { renderWithProviders } from "../../../test/renderWithProviders"

const CartControls = () => {
  const {
    cart,
    addItem,
    setItemQuantity,
    limitToStock,
    removeItem,
  } = useCart()
  const seeded = useRef(false)

  useEffect(() => {
    if (seeded.current) return
    seeded.current = true
    addItem({ _id: "mesa-1", stock: 3 }, 2)
  }, [addItem])

  return (
    <div>
      <span>
        {cart.length === 0
          ? "vacío"
          : cart.map((item) => `${item.id}:${item.quantity}`).join(",")}
      </span>
      <button type="button" onClick={() => setItemQuantity("mesa-1", 5, 3)}>
        Limitar stock
      </button>
      <button type="button" onClick={() => limitToStock("mesa-1", 1)}>
        Queda una unidad
      </button>
      <button type="button" onClick={() => limitToStock("mesa-1", 0)}>
        Sin stock
      </button>
      <button type="button" onClick={() => removeItem("mesa-1")}>
        Quitar
      </button>
    </div>
  )
}

const renderCart = () =>
  renderWithProviders(
    <CartProvider>
      <CartControls />
    </CartProvider>,
  )

describe("CartProvider", () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  test("persiste el carrito y conserva el límite real de stock", async () => {
    const firstRender = renderCart()

    expect(await screen.findByText("mesa-1:2")).toBeInTheDocument()

    await firstRender.user.click(
      screen.getByRole("button", { name: "Limitar stock" }),
    )
    expect(await screen.findByText("mesa-1:3")).toBeInTheDocument()

    firstRender.unmount()

    renderCart()

    expect(await screen.findByText("mesa-1:3")).toBeInTheDocument()
    expect(JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY))).toEqual([
      { id: "mesa-1", quantity: 3 },
    ])
  })

  test("ajusta la cantidad al stock disponible y quita el producto sin stock", async () => {
    const { user } = renderCart()

    expect(await screen.findByText("mesa-1:2")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Queda una unidad" }))
    expect(await screen.findByText("mesa-1:1")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Sin stock" }))
    expect(await screen.findByText("vacío")).toBeInTheDocument()
  })
})
