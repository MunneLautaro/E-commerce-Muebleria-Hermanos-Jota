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

const respondWithProduct = (status = 200) =>
  server.use(
    http.get(apiUrl("/products/:id"), () =>
      HttpResponse.json(
        status === 200 ? product : { error: "Error interno" },
        { status },
      ),
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
    vi.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test("muestra el resumen y abre el detalle del producto en un modal", async () => {
    respondWithProduct()

    const { user } = renderCart()

    expect(
      await screen.findByRole("heading", { level: 1, name: "Mi carrito" }),
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
    respondWithProduct()
    const successToast = vi.spyOn(toast, "success")
    const infoToast = vi.spyOn(toast, "info")
    const { user } = renderCart()

    await screen.findByRole("button", { name: "Aumentar cantidad de Mesa Roble" })
    await user.click(screen.getByRole("button", { name: "Aumentar cantidad de Mesa Roble" }))
    expect(successToast).toHaveBeenCalledWith("Se agregó 1 Mesa Roble al carrito")
    await waitFor(() =>
      expect(screen.getByLabelText("Cantidad")).toHaveTextContent("3"),
    )

    await user.click(screen.getByRole("button", { name: "Disminuir cantidad de Mesa Roble" }))
    expect(infoToast).toHaveBeenCalledWith("Se eliminó 1 Mesa Roble del carrito")
    await waitFor(() =>
      expect(screen.getByLabelText("Cantidad")).toHaveTextContent("2"),
    )

    await user.click(screen.getByRole("button", { name: "Eliminar Mesa Roble del carrito" }))
    expect(infoToast).toHaveBeenCalledWith("Se eliminó Mesa Roble del carrito")
    expect(await screen.findByRole("heading", { name: "Tu carrito está vacío" }))
      .toBeInTheDocument()
  })

  test("muestra un error de carga y mantiene los metadatos privados", async () => {
    respondWithProduct(500)

    renderCart()

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent("No se pudieron cargar los productos de tu carrito.")
    expect(document.title).toBe("Mi carrito | Mueblería Hermanos Jota")
    expect(getMeta("robots")).toHaveAttribute("content", "noindex, nofollow")
  })

  test("invita a explorar productos cuando el carrito está vacío", async () => {
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
})
