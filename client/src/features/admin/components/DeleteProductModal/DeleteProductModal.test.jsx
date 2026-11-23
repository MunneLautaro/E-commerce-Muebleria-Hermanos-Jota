import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { DeleteProductModal } from "./DeleteProductModal"

const product = { _id: "1", nombre: "Mesa Roble" }

const renderModal = (props = {}) => {
  const handlers = { onClose: vi.fn(), onConfirm: vi.fn() }
  render(
    <DeleteProductModal
      product={product}
      isDeleting={false}
      {...handlers}
      {...props}
    />,
  )
  return { ...handlers, user: userEvent.setup() }
}

describe("DeleteProductModal", () => {
  test("no renderiza nada sin producto", () => {
    render(
      <DeleteProductModal
        product={null}
        isDeleting={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    )

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  test("muestra un dialog con el nombre del producto", () => {
    renderModal()

    expect(
      screen.getByRole("dialog", { name: "¿Eliminar producto?" }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Mesa Roble/)).toBeInTheDocument()
  })

  test("confirma la eliminación", async () => {
    const { user, onConfirm } = renderModal()

    await user.click(screen.getByRole("button", { name: "Eliminar producto" }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  test("cancela con el botón Cancelar y con la X", async () => {
    const { user, onClose } = renderModal()

    await user.click(screen.getByRole("button", { name: "Cancelar" }))
    await user.click(screen.getByRole("button", { name: "Cerrar confirmación" }))

    expect(onClose).toHaveBeenCalledTimes(2)
  })

  test("deshabilita la confirmación mientras elimina", () => {
    renderModal({ isDeleting: true })

    expect(screen.getByRole("button", { name: "Eliminando..." })).toBeDisabled()
  })
})
