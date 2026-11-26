import { useEffect, useRef } from "react"
import { screen, waitFor } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { toast } from "react-toastify"
import { CartProvider, useCart } from "../../features/cart"
import { apiUrl } from "../../test/msw/handlers"
import { server } from "../../test/msw/server"
import { renderWithProviders } from "../../test/renderWithProviders"
import CartPage from "./CartPage"

const product = {
  _id: "mesa-1",
  nombre: "Mesa Roble",
  descripcion: "Mesa de roble macizo para el comedor.",
  precio: 150000,
  stock: 5,
  imagenUrl: "/mesa.jpg",
  sku: "MR-01",
  medidas: "120 x 80 cm",
  materiales: "Roble macizo",
}

const recommendationProduct = {
  _id: "silla-1",
  nombre: "Sillas Córdoba",
  descripcion: "Sillas de madera maciza.",
  precio: 85000,
  stock: 4,
  imagenUrl: "/sillas-cordoba.jpg",
}

const catalogProducts = [product, recommendationProduct]

const CartSeed = () => {
  const { addItem } = useCart()
  const seeded = useRef(false)

  useEffect(() => {
    if (seeded.current) return
    seeded.current = true
    addItem(product, 2)
  }, [addItem])

  return null
}

const respondWithProducts = (status = 200) =>
  server.use(
    http.get(apiUrl("/products"), () =>
      HttpResponse.json({
        items: [recommendationProduct],
        pagination: { page: 1, totalPages: 1 },
      }),
    ),
    http.get(apiUrl("/products/:id"), ({ params }) => {
      if (status !== 200) {
        return HttpResponse.json({ error: "Error interno" }, { status })
      }

      const foundProduct = catalogProducts.find(
        ({ _id }) => _id === params.id,
      )
      return foundProduct
        ? HttpResponse.json(foundProduct)
        : HttpResponse.json(
            { error: "Producto no encontrado" },
            { status: 404 },
          )
    },
    ),
  )

const renderCart = () =>
  renderWithProviders(
    <CartProvider>
      <CartSeed />
      <CartPage />
    </CartProvider>,
    { route: "/carrito" },
  )

const getMeta = (name) =>
  document.head.querySelector(`meta[name="${name}"]`)

describe("CartPage", () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test("muestra el resumen y abre el detalle del producto en un modal", async () => {
    respondWithProducts()

    const { user } = renderCart()

    expect(
      await screen.findByRole("button", { name: "Ver detalle de Mesa Roble" }),
    ).toBeInTheDocument()
    expect(screen.getByText("Subtotal: $ 300.000")).toBeInTheDocument()
    expect(document.title).toBe("Mi carrito | Mueblería Hermanos Jota")
    expect(getMeta("robots")).toHaveAttribute("content", "noindex, nofollow")

    await user.click(screen.getByRole("button", { name: "Ver detalle de Mesa Roble" }))

    expect(
      screen.getByRole("heading", { level: 2, name: "Mesa Roble" }),
    ).toBeInTheDocument()
    expect(screen.getByText("Mesa de roble macizo para el comedor.")).toBeInTheDocument()
    expect(screen.getByText("MR-01")).toBeInTheDocument()
    expect(screen.getByText("Roble macizo")).toBeInTheDocument()
  })

  test("aumenta, disminuye y elimina productos con avisos en castellano", async () => {
    respondWithProducts()
    const successToast = vi.spyOn(toast, "success")
    const infoToast = vi.spyOn(toast, "info")
    const { user } = renderCart()

    await screen.findByRole("button", { name: "Aumentar cantidad de Mesa Roble" })
    await user.click(screen.getByRole("button", { name: "Aumentar cantidad de Mesa Roble" }))
    expect(successToast).toHaveBeenCalledWith("Se agregó 1 Mesa Roble al carrito")
    await waitFor(() =>
      expect(
        screen.getByLabelText("Cantidad de Mesa Roble"),
      ).toHaveTextContent("3"),
    )

    await user.click(screen.getByRole("button", { name: "Disminuir cantidad de Mesa Roble" }))
    expect(infoToast).toHaveBeenCalledWith("Se eliminó 1 Mesa Roble del carrito")
    await waitFor(() =>
      expect(
        screen.getByLabelText("Cantidad de Mesa Roble"),
      ).toHaveTextContent("2"),
    )

    await user.click(screen.getByRole("button", { name: "Eliminar Mesa Roble del carrito" }))
    expect(infoToast).toHaveBeenCalledWith("Se eliminó Mesa Roble del carrito")
    expect(await screen.findByRole("heading", { name: "Tu carrito está vacío" }))
      .toBeInTheDocument()
  })

  test("muestra un error de carga y mantiene los metadatos privados", async () => {
    respondWithProducts(500)

    renderCart()

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent("No se pudieron cargar los productos de tu carrito.")
    expect(document.title).toBe("Mi carrito | Mueblería Hermanos Jota")
    expect(getMeta("robots")).toHaveAttribute("content", "noindex, nofollow")
  })

  test("invita a explorar productos cuando el carrito está vacío", async () => {
    respondWithProducts()

    renderWithProviders(
      <CartProvider>
        <CartPage />
      </CartProvider>,
      { route: "/carrito" },
    )

    expect(
      await screen.findByRole("heading", { name: "Tu carrito está vacío" }),
    ).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Explorar productos" })).toHaveAttribute(
      "href",
      "/productos",
    )
  })

  test("aplica un cupón sin distinguir mayúsculas y recalcula el total", async () => {
    respondWithProducts()
    const successToast = vi.spyOn(toast, "success")
    const { user } = renderCart()

    await screen.findByRole("heading", { name: "Resumen de compra" })
    await user.type(screen.getByLabelText("Código promocional"), "jOtA10")
    await user.click(screen.getByRole("button", { name: "Aplicar" }))

    expect(
      await screen.findByText(/Cupón demostrativo JOTA10 aplicado localmente/),
    ).toHaveTextContent(
      "Cupón demostrativo JOTA10 aplicado localmente.",
    )
    expect(screen.getByLabelText("Descuento")).toHaveTextContent("30.000")
    expect(screen.getByLabelText("Total final")).toHaveTextContent("270.000")
    expect(successToast).toHaveBeenCalledWith(
      expect.stringContaining("Cupón demostrativo JOTA10"),
    )

    await user.click(screen.getByRole("button", { name: "Quitar cupón JOTA10" }))
    expect(screen.getByLabelText("Descuento")).toHaveTextContent("0")
    expect(screen.getByLabelText("Total final")).toHaveTextContent("300.000")
  })

  test("rechaza JOTA15 si el subtotal no supera el mínimo", async () => {
    respondWithProducts()
    const errorToast = vi.spyOn(toast, "error")
    const { user } = renderCart()

    await screen.findByRole("heading", { name: "Resumen de compra" })
    await user.type(screen.getByLabelText("Código promocional"), "jota15")
    await user.click(screen.getByRole("button", { name: "Aplicar" }))

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /JOTA15 requiere una compra superior/,
    )
    expect(screen.getByLabelText("Descuento")).toHaveTextContent("0")
    expect(errorToast).toHaveBeenCalled()
  })

  test("agrega al carrito una recomendación real devuelta por el catálogo", async () => {
    respondWithProducts()
    const successToast = vi.spyOn(toast, "success")
    const { user } = renderCart()

    await user.click(
      await screen.findByRole("button", {
        name: "Agregar Sillas Córdoba al carrito",
      }),
    )

    expect(successToast).toHaveBeenCalledWith(
      "Se agregó 1 Sillas Córdoba al carrito",
    )
    expect(
      await screen.findByRole("button", {
        name: "Aumentar cantidad de Sillas Córdoba",
      }),
    ).toBeInTheDocument()
  })
})
