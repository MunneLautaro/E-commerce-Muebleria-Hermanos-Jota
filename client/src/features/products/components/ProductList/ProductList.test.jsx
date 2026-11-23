import { screen } from "@testing-library/react"
import { renderWithProviders } from "../../../../test/renderWithProviders"
import { ProductList } from "./ProductList"

const products = [
  {
    _id: "1",
    nombre: "Mesa Roble",
    precio: 150000,
    descripcion: "Mesa de roble macizo",
    imagenUrl: "/mesa.jpg",
  },
  {
    _id: "2",
    nombre: "Silla Nórdica",
    precio: 45000,
    descripcion: "Silla tapizada",
    imagenUrl: "/silla.jpg",
  },
  {
    _id: "3",
    nombre: "Rack TV",
    precio: 98000,
    descripcion: "Rack con estantes",
    imagenUrl: "/rack.jpg",
  },
]

describe("ProductList", () => {
  test("renderiza una tarjeta por producto", () => {
    renderWithProviders(<ProductList products={products} />)

    expect(screen.getAllByRole("link")).toHaveLength(3)
    expect(screen.getAllByRole("heading")).toHaveLength(3)
  })

  test("respeta el orden recibido", () => {
    renderWithProviders(<ProductList products={products} />)

    expect(
      screen.getAllByRole("heading").map((heading) => heading.textContent),
    ).toEqual(["Mesa Roble", "Silla Nórdica", "Rack TV"])
  })

  test("cada tarjeta enlaza a su producto", () => {
    renderWithProviders(<ProductList products={products} />)

    expect(
      screen.getAllByRole("link").map((link) => link.getAttribute("href")),
    ).toEqual(["/productos/1", "/productos/2", "/productos/3"])
  })

  test("no renderiza tarjetas si la lista está vacía", () => {
    renderWithProviders(<ProductList products={[]} />)

    expect(screen.queryAllByRole("link")).toHaveLength(0)
  })

  test("pasa compact a las tarjetas", () => {
    renderWithProviders(<ProductList products={products} compact />)

    expect(screen.queryByText("Mesa de roble macizo")).not.toBeInTheDocument()
    expect(screen.queryByText(/\$/)).not.toBeInTheDocument()
  })

  test("sin compact las tarjetas muestran el detalle completo", () => {
    renderWithProviders(<ProductList products={products} />)

    expect(screen.getByText("Mesa de roble macizo")).toBeInTheDocument()
    expect(screen.getAllByText(/\$/)).toHaveLength(3)
  })
})
