import { render, screen } from "@testing-library/react"
import { ProductListSkeleton } from "./ProductListSkeleton"

const getCards = () =>
  screen.getByRole("status").querySelectorAll(".animate-pulse")

describe("ProductListSkeleton", () => {
  test("anuncia la carga con el texto recibido", () => {
    render(<ProductListSkeleton count={3} label="Cargando productos..." />)

    expect(screen.getByRole("status")).toHaveTextContent("Cargando productos...")
  })

  test("renderiza la cantidad de tarjetas pedida", () => {
    render(<ProductListSkeleton count={5} label="Cargando productos..." />)

    expect(getCards()).toHaveLength(5)
  })

  test("oculta las tarjetas a los lectores de pantalla", () => {
    render(<ProductListSkeleton count={2} label="Cargando productos..." />)

    expect(getCards()[0].parentElement).toHaveAttribute("aria-hidden", "true")
  })
})
