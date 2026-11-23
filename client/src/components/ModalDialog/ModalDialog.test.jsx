import { createEvent, fireEvent, render, screen } from "@testing-library/react"
import { ModalDialog } from "./ModalDialog"

const renderDialog = (onClose = vi.fn()) => {
  const result = render(
    <ModalDialog labelledBy="titulo" onClose={onClose}>
      <h2 id="titulo">Título del modal</h2>
      <button type="button">Acción</button>
    </ModalDialog>,
  )
  return { ...result, onClose, dialog: screen.getByRole("dialog") }
}

describe("ModalDialog", () => {
  test("abre el dialog como modal al montarse", () => {
    const { dialog } = renderDialog()

    expect(dialog.tagName).toBe("DIALOG")
    expect(dialog).toHaveAttribute("open")
  })

  test("toma el nombre accesible del título", () => {
    renderDialog()

    expect(
      screen.getByRole("dialog", { name: "Título del modal" }),
    ).toBeInTheDocument()
  })

  test("cierra el dialog nativo al desmontarse", () => {
    const { dialog, unmount } = renderDialog()

    unmount()

    expect(dialog.open).toBe(false)
  })

  test("llama a onClose con Escape y evita el cierre nativo", () => {
    const { dialog, onClose } = renderDialog()
    const cancelEvent = createEvent("cancel", dialog, { cancelable: true })

    fireEvent(dialog, cancelEvent)

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(cancelEvent.defaultPrevented).toBe(true)
    expect(dialog).toHaveAttribute("open")
  })

  test("llama a onClose al hacer click en el fondo", () => {
    const { dialog, onClose } = renderDialog()

    fireEvent.mouseDown(dialog)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  test("no se cierra al hacer click dentro del contenido", () => {
    const { onClose } = renderDialog()

    fireEvent.mouseDown(screen.getByRole("button", { name: "Acción" }))

    expect(onClose).not.toHaveBeenCalled()
  })
})
