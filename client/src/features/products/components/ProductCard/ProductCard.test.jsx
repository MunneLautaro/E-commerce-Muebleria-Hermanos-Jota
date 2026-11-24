import { screen } from "@testing-library/react"
import { renderWithProviders } from "../../../../test/renderWithProviders"
import { ProductCard } from "./ProductCard"

const product = {
  _id: "abc123",
  nombre: "Mesa Roble",
  precio: 150000,
  descripcion: "Mesa de roble macizo",
  imagenUrl: "/mesa.jpg",
  medidas: "180x90 cm",
}

const renderCard = (overrides = {}, props = {}) =>
  renderWithProviders(
    <ProductCard product={{ ...product, ...overrides }} {...props} />,
  )

const getField = (label) => screen.getByText(`${label}:`).parentElement

describe("ProductCard", () => {
  describe("contenido básico", () => {
    test("muestra el nombre como encabezado", () => {
      renderCard()

      expect(
        screen.getByRole("heading", { name: "Mesa Roble" }),
      ).toBeInTheDocument()
    })

    test("muestra la imagen con el nombre como texto alternativo", () => {
      renderCard()

      expect(screen.getByRole("img", { name: "Mesa Roble" })).toHaveAttribute(
        "src",
        "/mesa.jpg",
      )
    })

    test("carga la imagen en diferido y con dimensiones fijas", () => {
      renderCard()

      const image = screen.getByRole("img", { name: "Mesa Roble" })
      expect(image).toHaveAttribute("loading", "lazy")
      expect(image).toHaveAttribute("decoding", "async")
      expect(image).toHaveAttribute("width", "800")
      expect(image).toHaveAttribute("height", "800")
    })

    test("muestra la descripción", () => {
      renderCard()

      expect(screen.getByText("Mesa de roble macizo")).toBeInTheDocument()
    })

    test("muestra las medidas cuando existen", () => {
      renderCard()

      expect(getField("Medidas")).toHaveTextContent("Medidas: 180x90 cm")
    })

    test("no muestra medidas cuando no existen", () => {
      renderCard({ medidas: undefined })

      expect(screen.queryByText("Medidas:")).not.toBeInTheDocument()
    })
  })

  describe("enlace", () => {
    test("enlaza al detalle del producto", () => {
      renderCard()

      expect(
        screen.getByRole("link", {
          name: "Ver detalle del producto Mesa Roble",
        }),
      ).toHaveAttribute("href", "/productos/abc123")
    })

    test("toda la tarjeta queda dentro del enlace", () => {
      renderCard()

      const link = screen.getByRole("link")
      expect(link).toContainElement(screen.getByRole("heading"))
      expect(link).toContainElement(screen.getByRole("img"))
    })
  })

  describe("precio", () => {
    test("formatea el precio en pesos argentinos sin decimales", () => {
      renderCard({ precio: 150000.75 })

      const price = screen.getByText(/\$/)
      expect(price).toHaveTextContent(/150\.001/)
      expect(price).not.toHaveTextContent(",")
    })

    test("acepta precios que llegan como string numérico", () => {
      renderCard({ precio: "2500" })

      expect(screen.getByText(/\$/)).toHaveTextContent(/2\.500/)
    })

    test("muestra un precio de 0", () => {
      renderCard({ precio: 0 })

      expect(screen.getByText(/\$/)).toHaveTextContent(/0/)
    })

    test.each([
      ["null", null],
      ["undefined", undefined],
      ["string vacío", ""],
      ["texto no numérico", "consultar"],
      ["Infinity", Infinity],
    ])("no muestra precio si es %s", (_, precio) => {
      renderCard({ precio })

      expect(screen.queryByText(/\$/)).not.toBeInTheDocument()
    })
  })

  describe("campos opcionales", () => {
    test("muestra los campos opcionales con su etiqueta", () => {
      renderCard({ materiales: "Roble macizo", garantia: "5 años" })

      expect(getField("Materiales")).toHaveTextContent(
        "Materiales: Roble macizo",
      )
      expect(getField("Garantía")).toHaveTextContent("Garantía: 5 años")
    })

    test("no muestra campos opcionales vacíos", () => {
      renderCard({ materiales: "", acabado: null, peso: undefined })

      expect(screen.queryByText("Materiales:")).not.toBeInTheDocument()
      expect(screen.queryByText("Acabado:")).not.toBeInTheDocument()
      expect(screen.queryByText("Peso:")).not.toBeInTheDocument()
    })

    test("respeta el orden definido en productOptionalFields", () => {
      renderCard({ garantia: "5 años", caracteristicas: "Extensible" })

      const caracteristicas = screen.getByText("Características:")
      const garantia = screen.getByText("Garantía:")
      expect(
        caracteristicas.compareDocumentPosition(garantia) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy()
    })

    test("ignora propiedades que no son campos opcionales conocidos", () => {
      renderCard({ proveedor: "Interno" })

      expect(screen.queryByText("Interno")).not.toBeInTheDocument()
    })
  })

  describe("atributos personalizados", () => {
    test("muestra cada atributo como clave y valor", () => {
      renderCard({
        atributos: [
          { clave: "Color", valor: "Nogal" },
          { clave: "Patas", valor: "Hierro" },
        ],
      })

      expect(getField("Color")).toHaveTextContent("Color: Nogal")
      expect(getField("Patas")).toHaveTextContent("Patas: Hierro")
    })

    test("admite atributos con la misma clave", () => {
      renderCard({
        atributos: [
          { clave: "Color", valor: "Nogal" },
          { clave: "Color", valor: "Blanco" },
        ],
      })

      expect(screen.getAllByText("Color:")).toHaveLength(2)
    })

    test("no falla si no hay atributos", () => {
      renderCard({ atributos: undefined })

      expect(
        screen.getByRole("heading", { name: "Mesa Roble" }),
      ).toBeInTheDocument()
    })
  })

  describe("modo compact", () => {
    const full = {
      materiales: "Roble",
      atributos: [{ clave: "Color", valor: "Nogal" }],
    }

    test("mantiene nombre, imagen y enlace", () => {
      renderCard(full, { compact: true })

      expect(
        screen.getByRole("heading", { name: "Mesa Roble" }),
      ).toBeInTheDocument()
      expect(screen.getByRole("img", { name: "Mesa Roble" })).toBeInTheDocument()
      expect(screen.getByRole("link")).toHaveAttribute(
        "href",
        "/productos/abc123",
      )
    })

    test("oculta precio, descripción, medidas, opcionales y atributos", () => {
      renderCard(full, { compact: true })

      expect(screen.queryByText(/\$/)).not.toBeInTheDocument()
      expect(screen.queryByText("Mesa de roble macizo")).not.toBeInTheDocument()
      expect(screen.queryByText("Medidas:")).not.toBeInTheDocument()
      expect(screen.queryByText("Materiales:")).not.toBeInTheDocument()
      expect(screen.queryByText("Color:")).not.toBeInTheDocument()
    })
  })
})
