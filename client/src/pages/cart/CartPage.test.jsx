import { screen, waitFor, within } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { toast } from "react-toastify"
import { CART_STORAGE_KEY, CartProvider } from "../../features/cart"
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

const storeCart = (items) =>
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))

const storedCart = () =>
  JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY))

const respondWithProducts = ({
  catalog = [product, recommendationProduct],
  detailStatus = 200,
  catalogStatus = 200,
} = {}) => {
  const detailRequests = []

  server.use(
    http.get(apiUrl("/products"), () =>
      catalogStatus === 200
        ? HttpResponse.json({
            items: [recommendationProduct],
            pagination: { page: 1, totalPages: 1 },
          })
        : HttpResponse.json({ error: "Error interno" }, { status: catalogStatus }),
    ),
    http.get(apiUrl("/products/:id"), ({ params }) => {
      detailRequests.push(params.id)

      if (detailStatus !== 200) {
        return HttpResponse.json({ error: "Error interno" }, { status: detailStatus })
      }

      const found = catalog.find(({ _id }) => _id === params.id)
      return found
        ? HttpResponse.json(found)
        : HttpResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }),
  )

  return detailRequests
}

const renderCart = () =>
  renderWithProviders(
    <CartProvider>
      <CartPage />
    </CartProvider>,
    { route: "/carrito" },
  )

const summaryValue = (label) =>
  within(screen.getByRole("complementary", { name: "Resumen de compra" }))
    .getByText(label)
    .closest("div")

const getMeta = (name) => document.head.querySelector(`meta[name="${name}"]`)

describe("CartPage", () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test("muestra el resumen y abre el detalle del producto en un modal", async () => {
    storeCart([{ id: "mesa-1", quantity: 2 }])
    respondWithProducts()

    const { user } = renderCart()

    expect(
      await screen.findByRole("button", { name: "Ver detalle de Mesa Roble" }),
    ).toBeInTheDocument()
    expect(screen.getByText("Subtotal: $ 300.000")).toBeInTheDocument()
    expect(document.title).toBe("Mi carrito | Mueblería Hermanos Jota")
    expect(getMeta("robots")).toHaveAttribute("content", "noindex, nofollow")

    await user.click(screen.getByRole("button", { name: "Ver detalle de Mesa Roble" }))

    const modal = within(screen.getByRole("dialog", { name: "Mesa Roble" }))
    expect(modal.getByText("Mesa de roble macizo para el comedor.")).toBeInTheDocument()
    expect(modal.getByText("MR-01")).toBeInTheDocument()
    expect(modal.getByText("Roble macizo")).toBeInTheDocument()
    expect(modal.getByText("Cantidad en el carrito:").parentElement).toHaveTextContent("2")
  })

  test("aumenta, disminuye y elimina productos con avisos en castellano", async () => {
    storeCart([{ id: "mesa-1", quantity: 2 }])
    respondWithProducts()
    const successToast = vi.spyOn(toast, "success")
    const infoToast = vi.spyOn(toast, "info")
    const { user } = renderCart()
    const quantity = () =>
      screen.getByRole("status", { name: "Cantidad de Mesa Roble" })

    await user.click(
      await screen.findByRole("button", { name: "Aumentar cantidad de Mesa Roble" }),
    )
    expect(successToast).toHaveBeenCalledWith("Se agregó 1 Mesa Roble al carrito")
    expect(quantity()).toHaveTextContent("3")

    await user.click(screen.getByRole("button", { name: "Disminuir cantidad de Mesa Roble" }))
    expect(infoToast).toHaveBeenCalledWith("Se eliminó 1 Mesa Roble del carrito")
    expect(quantity()).toHaveTextContent("2")

    await user.click(screen.getByRole("button", { name: "Eliminar Mesa Roble del carrito" }))
    expect(
      await screen.findByRole("heading", { name: "Tu carrito está vacío" }),
    ).toBeInTheDocument()
    expect(infoToast).toHaveBeenCalledWith("Se eliminó Mesa Roble del carrito")
    expect(storedCart()).toEqual([])
  })

  test("no vuelve a pedir los productos al cambiar las cantidades", async () => {
    storeCart([{ id: "mesa-1", quantity: 1 }])
    const detailRequests = respondWithProducts()
    const { user } = renderCart()

    const increase = await screen.findByRole("button", {
      name: "Aumentar cantidad de Mesa Roble",
    })
    await user.click(increase)
    await user.click(increase)

    expect(
      screen.getByRole("status", { name: "Cantidad de Mesa Roble" }),
    ).toHaveTextContent("3")
    expect(detailRequests).toEqual(["mesa-1"])
  })

  test("quita del carrito los productos que ya no están disponibles", async () => {
    storeCart([
      { id: "mesa-1", quantity: 1 },
      { id: "producto-desactivado", quantity: 2 },
    ])
    respondWithProducts()
    const infoToast = vi.spyOn(toast, "info")

    renderCart()

    expect(
      await screen.findByRole("button", { name: "Ver detalle de Mesa Roble" }),
    ).toBeInTheDocument()
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    expect(infoToast).toHaveBeenCalledWith(
      "Quitamos del carrito un producto que ya no está disponible.",
      expect.anything(),
    )
    await waitFor(() =>
      expect(storedCart()).toEqual([{ id: "mesa-1", quantity: 1 }]),
    )
  })

  test("muestra el carrito vacío si el único producto dejó de estar disponible", async () => {
    storeCart([{ id: "producto-desactivado", quantity: 1 }])
    respondWithProducts()

    renderCart()

    expect(
      await screen.findByRole("heading", { name: "Tu carrito está vacío" }),
    ).toBeInTheDocument()
  })

  test("ajusta la cantidad guardada al stock disponible", async () => {
    storeCart([{ id: "mesa-1", quantity: 9 }])
    respondWithProducts()

    renderCart()

    expect(
      await screen.findByRole("status", { name: "Cantidad de Mesa Roble" }),
    ).toHaveTextContent("5")
    await waitFor(() =>
      expect(storedCart()).toEqual([{ id: "mesa-1", quantity: 5 }]),
    )
  })

  test("muestra un error de carga y mantiene los metadatos privados", async () => {
    storeCart([{ id: "mesa-1", quantity: 2 }])
    respondWithProducts({ detailStatus: 500 })

    renderCart()

    expect(
      await screen.findByText("No se pudieron cargar los productos de tu carrito."),
    ).toHaveAttribute("role", "alert")
    expect(document.title).toBe("Mi carrito | Mueblería Hermanos Jota")
    expect(getMeta("robots")).toHaveAttribute("content", "noindex, nofollow")
    expect(storedCart()).toEqual([{ id: "mesa-1", quantity: 2 }])
  })

  test("invita a explorar productos cuando el carrito está vacío", async () => {
    respondWithProducts()

    renderCart()

    expect(
      await screen.findByRole("heading", { name: "Tu carrito está vacío" }),
    ).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Explorar productos" })).toHaveAttribute(
      "href",
      "/productos",
    )
  })

  test("aplica un cupón sin distinguir mayúsculas y recalcula el total", async () => {
    storeCart([{ id: "mesa-1", quantity: 2 }])
    respondWithProducts()
    const successToast = vi.spyOn(toast, "success")
    const { user } = renderCart()

    await screen.findByRole("heading", { name: "Resumen de compra" })
    await user.type(screen.getByLabelText("Código promocional"), "jOtA10")
    await user.click(screen.getByRole("button", { name: "Aplicar" }))

    expect(
      await screen.findByText(/Cupón demostrativo JOTA10 aplicado localmente/),
    ).toBeInTheDocument()
    expect(summaryValue("Descuentos")).toHaveTextContent("30.000")
    expect(summaryValue("Total final")).toHaveTextContent("270.000")
    expect(successToast).toHaveBeenCalledWith(
      expect.stringContaining("Cupón demostrativo JOTA10"),
    )

    await user.click(screen.getByRole("button", { name: "Quitar cupón JOTA10" }))
    expect(summaryValue("Descuentos")).toHaveTextContent("$ 0")
    expect(summaryValue("Total final")).toHaveTextContent("300.000")
  })

  test("deja de aplicar el cupón si el subtotal baja del mínimo y lo vuelve a aplicar al subir", async () => {
    storeCart([{ id: "mesa-1", quantity: 3 }])
    respondWithProducts()
    const { user } = renderCart()

    await screen.findByRole("heading", { name: "Resumen de compra" })
    await user.type(screen.getByLabelText("Código promocional"), "JOTA15")
    await user.click(screen.getByRole("button", { name: "Aplicar" }))
    expect(summaryValue("Descuentos")).toHaveTextContent("67.500")

    await user.click(screen.getByRole("button", { name: "Disminuir cantidad de Mesa Roble" }))
    expect(
      screen.getByText(/El cupón JOTA15 no se aplica: JOTA15 requiere una compra superior/),
    ).toBeInTheDocument()
    expect(summaryValue("Descuentos")).toHaveTextContent("$ 0")

    await user.click(screen.getByRole("button", { name: "Aumentar cantidad de Mesa Roble" }))
    expect(summaryValue("Descuentos")).toHaveTextContent("67.500")
  })

  test("pide un código si se envía el cupón vacío o inexistente", async () => {
    storeCart([{ id: "mesa-1", quantity: 1 }])
    respondWithProducts()
    const { user } = renderCart()

    await screen.findByRole("heading", { name: "Resumen de compra" })
    await user.click(screen.getByRole("button", { name: "Aplicar" }))

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Ingresá un código promocional.",
    )
    expect(screen.getByLabelText("Código promocional")).toHaveAttribute(
      "aria-invalid",
      "true",
    )

    await user.type(screen.getByLabelText("Código promocional"), "NOEXISTE")
    await user.click(screen.getByRole("button", { name: "Aplicar" }))

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "El código ingresado no es válido.",
    )
  })

  test("rechaza JOTA15 si el subtotal no supera el mínimo", async () => {
    storeCart([{ id: "mesa-1", quantity: 2 }])
    respondWithProducts()
    const errorToast = vi.spyOn(toast, "error")
    const { user } = renderCart()

    await screen.findByRole("heading", { name: "Resumen de compra" })
    await user.type(screen.getByLabelText("Código promocional"), "jota15")
    await user.click(screen.getByRole("button", { name: "Aplicar" }))

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /JOTA15 requiere una compra superior/,
    )
    expect(summaryValue("Descuentos")).toHaveTextContent("$ 0")
    expect(errorToast).toHaveBeenCalled()
  })

  test("agrega al carrito una recomendación real devuelta por el catálogo", async () => {
    storeCart([{ id: "mesa-1", quantity: 1 }])
    const detailRequests = respondWithProducts()
    const successToast = vi.spyOn(toast, "success")
    const { user } = renderCart()

    await user.click(
      await screen.findByRole("button", { name: "Agregar Sillas Córdoba al carrito" }),
    )

    expect(successToast).toHaveBeenCalledWith("Se agregó 1 Sillas Córdoba al carrito")
    expect(
      await screen.findByRole("button", { name: "Aumentar cantidad de Sillas Córdoba" }),
    ).toBeInTheDocument()
    expect(detailRequests).toEqual(["mesa-1"])
  })

  test("avanza por el carrito y la ubicación hasta la información de pago", async () => {
    storeCart([{ id: "mesa-1", quantity: 2 }])
    respondWithProducts()
    const { user } = renderCart()

    expect(await screen.findByText("Paso 1 de 3")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Siguiente" }))

    expect(screen.getByText("Paso 2 de 3")).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { name: "Datos de entrega" }),
    ).toBeInTheDocument()

    await user.type(screen.getByLabelText("Nombre completo"), "Ana Pérez")
    await user.type(screen.getByLabelText("Teléfono"), "11 5555-1234")
    await user.type(screen.getByLabelText("Dirección"), "Av. Corrientes")
    await user.type(screen.getByLabelText("Altura"), "1234")
    await user.type(screen.getByLabelText("Ciudad"), "Buenos Aires")
    await user.type(screen.getByLabelText("Código postal"), "1043")

    await user.click(screen.getByRole("checkbox", { name: "Guardar para futuras compras" }))
    await user.click(screen.getByRole("button", { name: "Siguiente" }))

    expect(screen.getByText("Paso 3 de 3")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Pago" })).toBeInTheDocument()
    expect(screen.getByText("Mesa Roble")).toBeInTheDocument()
    expect(screen.getByText("$ 300.000")).toBeInTheDocument()
    expect(JSON.parse(window.localStorage.getItem("hj-checkout-address"))).toEqual({
      nombreCompleto: "Ana Pérez",
      telefono: "11 5555-1234",
      direccion: "Av. Corrientes",
      altura: "1234",
      ciudad: "Buenos Aires",
      codigoPostal: "1043",
    })
  })

  test("carga los datos guardados y permite dejarlos de guardar", async () => {
    storeCart([{ id: "mesa-1", quantity: 1 }])
    window.localStorage.setItem(
      "hj-checkout-address",
      JSON.stringify({
        nombreCompleto: "Ana Pérez",
        telefono: "11 5555-1234",
        direccion: "Av. Corrientes",
        altura: "1234",
        ciudad: "Buenos Aires",
        codigoPostal: "1043",
      }),
    )
    respondWithProducts()
    const { user } = renderCart()

    await screen.findByRole("button", { name: "Siguiente" })
    await user.click(screen.getByRole("button", { name: "Siguiente" }))

    expect(screen.getByLabelText("Nombre completo")).toHaveValue("Ana Pérez")
    expect(screen.getByLabelText("Teléfono")).toHaveValue("11 5555-1234")
    expect(screen.getByRole("checkbox", { name: "Guardar para futuras compras" })).toBeChecked()

    await user.clear(screen.getByLabelText("Nombre completo"))
    await user.type(screen.getByLabelText("Nombre completo"), "Ana Modificada")
    await user.click(screen.getByRole("checkbox", { name: "Guardar para futuras compras" }))
    await user.click(screen.getByRole("button", { name: "Siguiente" }))

    expect(window.localStorage.getItem("hj-checkout-address")).toBeNull()
  })

  test("valida la ubicación antes de avanzar al pago", async () => {
    storeCart([{ id: "mesa-1", quantity: 1 }])
    respondWithProducts()
    const { user } = renderCart()

    await screen.findByRole("button", { name: "Siguiente" })
    await user.click(screen.getByRole("button", { name: "Siguiente" }))
    await user.click(screen.getByRole("button", { name: "Siguiente" }))

    expect(screen.getByText("Ingresá tu nombre completo.")).toBeInTheDocument()
    expect(screen.getByText("Ingresá tu teléfono de contacto.")).toBeInTheDocument()
    expect(screen.getByText("Ingresá tu dirección de entrega.")).toBeInTheDocument()
    expect(screen.getByText("Ingresá el número de la dirección.")).toBeInTheDocument()
    expect(screen.getByText("Ingresá tu ciudad.")).toBeInTheDocument()
    expect(screen.getByText("Ingresá tu código postal.")).toBeInTheDocument()
    expect(screen.getByText("Paso 2 de 3")).toBeInTheDocument()
  })

  test("confirma el pago desde un modal y vacía por completo el carrito", async () => {
    storeCart([{ id: "mesa-1", quantity: 2 }])
    respondWithProducts()
    const { user } = renderCart()

    await screen.findByRole("button", { name: "Siguiente" })
    await user.click(screen.getByRole("button", { name: "Siguiente" }))

    await user.type(screen.getByLabelText("Nombre completo"), "Ana Pérez")
    await user.type(screen.getByLabelText("Teléfono"), "11 5555-1234")
    await user.type(screen.getByLabelText("Dirección"), "Av. Corrientes")
    await user.type(screen.getByLabelText("Altura"), "1234")
    await user.type(screen.getByLabelText("Ciudad"), "Buenos Aires")
    await user.type(screen.getByLabelText("Código postal"), "1043")
    await user.click(screen.getByRole("button", { name: "Siguiente" }))

    await user.click(screen.getByRole("button", { name: "Comprar" }))

    const modal = within(screen.getByRole("dialog", { name: "Confirmar compra" }))
    expect(modal.getByRole("button", { name: "Rechazar" })).toBeInTheDocument()
    expect(modal.getByRole("button", { name: "Confirmar" })).toBeInTheDocument()

    await user.click(modal.getByRole("button", { name: "Rechazar" }))
    expect(screen.queryByRole("dialog", { name: "Confirmar compra" })).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Comprar" }))
    await user.click(within(screen.getByRole("dialog", { name: "Confirmar compra" })).getByRole("button", { name: "Confirmar" }))

    await waitFor(() => expect(storedCart()).toEqual([]))
  })
})
