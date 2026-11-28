import { screen } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { Route, Routes, useLocation } from "react-router-dom"
import { apiUrl } from "../../test/msw/handlers"
import { server } from "../../test/msw/server"
import { renderWithProviders } from "../../test/renderWithProviders"
import CreateProductPage from "./CreateProductPage"

const admin = { email: "admin@example.com", role: "admin" }

const storedProduct = {
  _id: "abc123",
  nombre: "Mesa Roble",
  descripcion: "Mesa de roble macizo",
  medidas: "180x90 cm",
  precio: 150000,
  stock: 3,
  imagenUrl: "/mesa.jpg",
  isActive: true,
  atributos: [],
}

const ListProbe = () => {
  const location = useLocation()
  return (
    <>
      <h1>Panel de productos</h1>
      <p data-testid="list-search">{location.search}</p>
    </>
  )
}

const renderEditor = (route, routeState) =>
  renderWithProviders(
    <Routes>
      <Route path="/admin/productos" element={<ListProbe />} />
      <Route path="/admin/crear-producto" element={<CreateProductPage />} />
      <Route
        path="/admin/editar-producto/:id"
        element={<CreateProductPage />}
      />
    </Routes>,
    { route, routeState, auth: { user: admin, isAuthenticated: true } },
  )

const fillNewProduct = async (user) => {
  await user.type(screen.getByRole("textbox", { name: /^Nombre/ }), "Silla Nórdica")
  await user.type(screen.getByRole("textbox", { name: /^Precio/ }), "85.000")
  await user.type(
    screen.getByRole("textbox", { name: /URL de la imagen/ }),
    "/silla.jpg",
  )
}

const confirmSave = async (user, submitLabel) => {
  await user.click(screen.getByRole("button", { name: submitLabel }))
  await user.click(await screen.findByRole("button", { name: "Confirmar" }))
}

describe("CreateProductPage", () => {
  test("usa el título de creación y pide no indexar la página", () => {
    renderEditor("/admin/crear-producto")

    expect(document.title).toBe("Crear producto | Mueblería Hermanos Jota")
    expect(
      document.head.querySelector('meta[name="robots"]'),
    ).toHaveAttribute("content", "noindex, nofollow")
  })

  test("al crear un producto redirige al panel", async () => {
    let createdBody
    server.use(
      http.post(apiUrl("/products"), async ({ request }) => {
        createdBody = await request.json()
        return HttpResponse.json({ ...createdBody, _id: "nuevo" }, { status: 201 })
      }),
    )
    const { user } = renderEditor("/admin/crear-producto")

    await fillNewProduct(user)
    await confirmSave(user, "Guardar producto")

    expect(
      await screen.findByRole("heading", { name: "Panel de productos" }),
    ).toBeInTheDocument()
    expect(createdBody).toMatchObject({
      nombre: "Silla Nórdica",
      imagenUrl: "/silla.jpg",
    })
  })

  test("al editar un producto redirige al panel", async () => {
    let updatedPath
    server.use(
      http.get(apiUrl("/products/admin/:id"), () =>
        HttpResponse.json(storedProduct),
      ),
      http.put(apiUrl("/products/:id"), async ({ request }) => {
        updatedPath = new URL(request.url).pathname
        return HttpResponse.json({ ...storedProduct, ...(await request.json()) })
      }),
    )
    const { user } = renderEditor("/admin/editar-producto/abc123")

    expect(
      await screen.findByRole("textbox", { name: /^Nombre/ }),
    ).toHaveValue("Mesa Roble")

    await confirmSave(user, "Guardar cambios")

    expect(
      await screen.findByRole("heading", { name: "Panel de productos" }),
    ).toBeInTheDocument()
    expect(updatedPath).toBe("/api/products/abc123")
  })

  test("al editar vuelve a la lista con los filtros y la página de origen", async () => {
    server.use(
      http.get(apiUrl("/products/admin/:id"), () =>
        HttpResponse.json(storedProduct),
      ),
      http.put(apiUrl("/products/:id"), async ({ request }) =>
        HttpResponse.json({ ...storedProduct, ...(await request.json()) }),
      ),
    )
    const from = "/admin/productos?estado=inactivos&page=2"
    const { user } = renderEditor("/admin/editar-producto/abc123", { from })

    expect(
      await screen.findByRole("link", { name: "Volver al panel" }),
    ).toHaveAttribute("href", from)
    expect(screen.getByRole("link", { name: "Cancelar" })).toHaveAttribute("href", from)

    await confirmSave(user, "Guardar cambios")

    expect(await screen.findByTestId("list-search")).toHaveTextContent(
      "?estado=inactivos&page=2",
    )
  })

  test("ignora un origen que no es la lista de productos", async () => {
    server.use(
      http.get(apiUrl("/products/admin/:id"), () =>
        HttpResponse.json(storedProduct),
      ),
    )
    renderEditor("/admin/editar-producto/abc123", { from: "/admin/ordenes" })

    expect(
      await screen.findByRole("link", { name: "Volver al panel" }),
    ).toHaveAttribute("href", "/admin/productos")
  })

  test("si el guardado falla se queda en el formulario", async () => {
    server.use(
      http.post(apiUrl("/products"), () =>
        HttpResponse.json({ error: "Error interno" }, { status: 500 }),
      ),
    )
    const { user } = renderEditor("/admin/crear-producto")

    await fillNewProduct(user)
    await confirmSave(user, "Guardar producto")

    expect(
      await screen.findByRole("button", { name: "Guardar producto" }),
    ).toBeEnabled()
    expect(
      screen.getByRole("heading", { level: 1, name: "Crear producto" }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole("heading", { name: "Panel de productos" }),
    ).not.toBeInTheDocument()
  })
})
