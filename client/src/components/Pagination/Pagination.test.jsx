import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Pagination } from "./Pagination"

const renderPagination = (props = {}) => {
  const onPageChange = vi.fn()
  const onLimitChange = vi.fn()
  render(
    <Pagination
      pagination={{ page: 2, limit: 12, total: 30, totalPages: 3 }}
      currentPage={2}
      isLoading={false}
      onPageChange={onPageChange}
      label="Paginación de órdenes"
      {...props}
    />,
  )
  return { onPageChange, onLimitChange, user: userEvent.setup() }
}

describe("Pagination", () => {
  test("usa el label recibido y muestra la página actual", () => {
    renderPagination()

    expect(
      screen.getByRole("navigation", { name: "Paginación de órdenes" }),
    ).toBeInTheDocument()
    expect(screen.getByText("Página 2 de 3")).toBeInTheDocument()
  })

  test("avisa la página anterior y la siguiente", async () => {
    const { onPageChange, user } = renderPagination()

    await user.click(screen.getByRole("button", { name: "Anterior" }))
    await user.click(screen.getByRole("button", { name: "Siguiente" }))

    expect(onPageChange.mock.calls).toEqual([[1], [3]])
  })

  test("deshabilita Anterior en la primera página", () => {
    renderPagination({
      pagination: { page: 1, limit: 12, total: 30, totalPages: 3 },
      currentPage: 1,
    })

    expect(screen.getByRole("button", { name: "Anterior" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Siguiente" })).toBeEnabled()
  })

  test("deshabilita los botones mientras carga", () => {
    renderPagination({ isLoading: true })

    expect(screen.getByRole("button", { name: "Anterior" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Siguiente" })).toBeDisabled()
  })

  test("no se renderiza con una sola página y sin selector de cantidad", () => {
    renderPagination({
      pagination: { page: 1, limit: 12, total: 3, totalPages: 1 },
      currentPage: 1,
    })

    expect(screen.queryByRole("navigation")).not.toBeInTheDocument()
  })

  test("muestra el selector de cantidad aunque haya una sola página", async () => {
    const onLimitChange = vi.fn()
    const { user } = renderPagination({
      pagination: { page: 1, limit: 20, total: 3, totalPages: 1 },
      currentPage: 1,
      limitOptions: [12, 15, 20],
      onLimitChange,
    })

    const select = screen.getByRole("combobox", { name: "Por página" })
    expect(select).toHaveValue("20")
    expect(screen.queryByRole("button", { name: "Siguiente" })).not.toBeInTheDocument()

    await user.selectOptions(select, "15")

    expect(onLimitChange).toHaveBeenCalledWith(15)
  })
})
