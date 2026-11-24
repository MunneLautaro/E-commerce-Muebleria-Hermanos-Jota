import { screen } from "@testing-library/react"
import { renderWithProviders } from "../../test/renderWithProviders"
import NotFoundPage from "./NotFoundPage"

const getMeta = (name) =>
  document.head.querySelector(`meta[name="${name}"]`)

describe("NotFoundPage", () => {
  test("muestra el título y la descripción por defecto", () => {
    renderWithProviders(<NotFoundPage />)

    expect(
      screen.getByRole("heading", { level: 1, name: "Página no encontrada" }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/el enlace que seguiste no existe/i),
    ).toBeInTheDocument()
  })

  test("permite personalizar el título y la descripción", () => {
    renderWithProviders(
      <NotFoundPage title="Producto no encontrado" description="No está." />,
    )

    expect(
      screen.getByRole("heading", { level: 1, name: "Producto no encontrado" }),
    ).toBeInTheDocument()
    expect(screen.getByText("No está.")).toBeInTheDocument()
  })

  test("pide no indexar la página y usa el título en la pestaña", () => {
    renderWithProviders(<NotFoundPage title="Producto no encontrado" />)

    expect(document.title).toBe(
      "Producto no encontrado | Mueblería Hermanos Jota",
    )
    expect(getMeta("robots")).toHaveAttribute("content", "noindex, nofollow")
  })

  test("ofrece volver al inicio y ver la colección", () => {
    renderWithProviders(<NotFoundPage />)

    expect(
      screen.getByRole("link", { name: "Volver al inicio" }),
    ).toHaveAttribute("href", "/")
    expect(screen.getByRole("link", { name: "Ver colección" })).toHaveAttribute(
      "href",
      "/productos",
    )
  })
})
