import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ProductConfirmationModal } from "./ProductConfirmationModal"

const payload = { nombre: "Mesa Roble" }

const renderModal = (props = {}) => {
  const handlers = { onClose: vi.fn(), onConfirm: vi.fn() }
  render(
    <ProductConfirmationModal
      payload={payload}
      isEditing={false}
      isSubmitting={false}
      {...handlers}
      {...props}
    />,
  )
  return { ...handlers, user: userEvent.setup() }
}

describe("ProductConfirmationModal", () => {
  test("no renderiza nada sin payload", () => {
    render(
      <ProductConfirmationModal
        payload={null}
        isEditing={false}
        isSubmitting={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    )

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  test("al crear muestra el título y el texto de alta", () => {
    renderModal()

    expect(
      screen.getByRole("dialog", { name: "¿Crear producto?" }),
    ).toBeInTheDocument()
    expect(
      screen.getByText("Se agregará “Mesa Roble” al catálogo."),
    ).toBeInTheDocument()
  })

  test("al editar muestra el título y el texto de actualización", () => {
    renderModal({ isEditing: true })

    expect(
      screen.getByRole("dialog", { name: "¿Guardar cambios?" }),
    ).toBeInTheDocument()
    expect(
      screen.getByText("Se actualizará “Mesa Roble” en el catálogo."),
    ).toBeInTheDocument()
  })

  test("confirma y permite volver a revisar", async () => {
    const { user, onConfirm, onClose } = renderModal()

    await user.click(screen.getByRole("button", { name: "Confirmar" }))
    await user.click(screen.getByRole("button", { name: "Revisar" }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  test("deshabilita la confirmación mientras guarda", () => {
    renderModal({ isSubmitting: true })

    expect(screen.getByRole("button", { name: "Guardando..." })).toBeDisabled()
  })
})
