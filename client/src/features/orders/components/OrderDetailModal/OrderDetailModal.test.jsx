import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { buildOrder } from "../../../../test/msw/handlers"
import { OrderDetailModal } from "./OrderDetailModal"

const renderModal = (props = {}) => {
  const onClose = vi.fn()
  render(<OrderDetailModal order={buildOrder()} onClose={onClose} {...props} />)
  return { onClose, user: userEvent.setup() }
}

const normalize = (text) => text.replace(/\s/g, " ")

describe("OrderDetailModal", () => {
  test("muestra el número de orden, el estado, el envío y el total", () => {
    renderModal()

    const dialog = screen.getByRole("dialog", {
      name: "Orden N° 64b7f0c2a1b2c3d4e5f60001",
    })
    expect(within(dialog).getByText("Pago confirmado")).toBeInTheDocument()
    expect(within(dialog).getByText("Av. Corrientes 1234")).toBeInTheDocument()
    expect(within(dialog).getByText("Buenos Aires (1043)")).toBeInTheDocument()
    expect(normalize(within(dialog).getByText(/385\.000/).textContent)).toBe(
      "$ 385.000",
    )
  })

  test("calcula el precio unitario con subtotal / cantidad y no con el precio actual", () => {
    renderModal()

    const item = screen.getByText("Mesa Roble").closest("li")
    expect(within(item).getByRole("img", { name: "Mesa Roble" })).toBeInTheDocument()
    expect(normalize(item.textContent)).toContain("Precio unitario$ 150.000")
    expect(normalize(item.textContent)).toContain("Subtotal$ 300.000")
    expect(item.textContent).not.toMatch(/999\.999/)
  })

  test("indica cuando el producto ya no está disponible", () => {
    renderModal()

    const item = screen.getByText("Producto no disponible").closest("li")
    expect(within(item).queryByRole("img")).not.toBeInTheDocument()
    expect(normalize(item.textContent)).toContain("Precio unitario$ 85.000")
  })

  test("muestra los datos del comprador solo con showBuyer", () => {
    const { unmount } = render(
      <OrderDetailModal order={buildOrder()} onClose={vi.fn()} />,
    )
    expect(screen.queryByRole("heading", { name: "Comprador" })).not.toBeInTheDocument()
    unmount()

    renderModal({ showBuyer: true })

    const buyer = screen.getByRole("region", { name: "Comprador" })
    expect(within(buyer).getByText("Ana Pérez")).toBeInTheDocument()
    expect(within(buyer).getByText("ana@example.com")).toBeInTheDocument()
  })

  test("se cierra con el botón de cerrar", async () => {
    const { onClose, user } = renderModal()

    await user.click(screen.getByRole("button", { name: "Cerrar detalle de la orden" }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
