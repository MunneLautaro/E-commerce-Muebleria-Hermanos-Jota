import { useEffect, useRef } from "react"
import { act, screen } from "@testing-library/react"
import { CART_STORAGE_KEY, CartProvider, useCart } from "../index"
import { renderWithProviders } from "../../../test/renderWithProviders"

const CartControls = () => {
  const {
    cart,
    addItem,
    setItemQuantity,
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
      <span>{cart.map((item) => `${item.id}:${item.quantity}`).join(",")}</span>
      <button type="button" onClick={() => setItemQuantity("mesa-1", 5, 3)}>
        Limitar stock
      </button>
      <button type="button" onClick={() => removeItem("mesa-1")}>
        Quitar
      </button>
    </div>
  )
}

describe("CartProvider", () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  test("persiste el carrito y conserva el límite real de stock", async () => {
    const firstRender = renderWithProviders(
      <CartProvider>
        <CartControls />
      </CartProvider>,
    )

    expect(await screen.findByText("mesa-1:2")).toBeInTheDocument()

    await act(async () => {
      firstRender.user.click(screen.getByRole("button", { name: "Limitar stock" }))
    })
    expect(screen.getByText("mesa-1:3")).toBeInTheDocument()

    firstRender.unmount()

    renderWithProviders(
      <CartProvider>
        <CartControls />
      </CartProvider>,
    )

    expect(await screen.findByText("mesa-1:3")).toBeInTheDocument()
    expect(JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY))).toEqual([
      { id: "mesa-1", quantity: 3 },
    ])
  })
})
