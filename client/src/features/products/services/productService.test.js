import { http, HttpResponse } from "msw"
import { server } from "../../../test/msw/server"
import { apiUrl } from "../../../test/msw/handlers"
import { tokenStorage } from "../../../services/tokenStorage"
import { productService } from "./productService"

const captureRequest = (method, path, responseBody = {}) => {
  const captured = {}
  server.use(
    http[method](apiUrl(path), async ({ request }) => {
      const url = new URL(request.url)
      captured.method = request.method
      captured.pathname = url.pathname
      captured.search = url.search
      captured.params = Object.fromEntries(url.searchParams)
      captured.headers = request.headers
      captured.body = request.method === "GET" ? null : await request.text()
      return HttpResponse.json(responseBody)
    }),
  )
  return captured
}

const productPayload = {
  nombre: "Mesa Roble",
  precio: 150000,
  descripcion: "Mesa de roble macizo",
  stock: 4,
}

describe("productService", () => {
  afterEach(() => tokenStorage.clear())

  describe("getProducts", () => {
    test("pide /products sin query string si no hay parámetros", async () => {
      const request = captureRequest("get", "/products", { items: [] })

      await productService.getProducts()

      expect(request.method).toBe("GET")
      expect(request.pathname).toBe("/api/products")
      expect(request.search).toBe("")
    })

    test("convierte los parámetros en query string", async () => {
      const request = captureRequest("get", "/products", { items: [] })

      await productService.getProducts({
        page: 2,
        limit: 12,
        order: "name_asc",
        q: "mesa roble",
        minPrice: "1000",
      })

      expect(request.params).toEqual({
        page: "2",
        limit: "12",
        order: "name_asc",
        q: "mesa roble",
        minPrice: "1000",
      })
    })

    test("devuelve la respuesta del backend", async () => {
      const response = {
        items: [{ _id: "1", nombre: "Mesa" }],
        pagination: { page: 1, totalPages: 1 },
      }
      captureRequest("get", "/products", response)

      await expect(productService.getProducts()).resolves.toEqual(response)
    })
  })

  describe("getFeaturedProducts", () => {
    test("pide /products/destacados y devuelve la respuesta", async () => {
      const response = { items: [{ _id: "1", nombre: "Mesa", masVendido: true }] }
      const request = captureRequest("get", "/products/destacados", response)

      await expect(productService.getFeaturedProducts()).resolves.toEqual(
        response,
      )
      expect(request.method).toBe("GET")
      expect(request.pathname).toBe("/api/products/destacados")
      expect(request.search).toBe("")
    })
  })

  describe("getProductById", () => {
    test("pide el producto por id", async () => {
      const request = captureRequest("get", "/products/:id", { _id: "abc" })

      const product = await productService.getProductById("abc")

      expect(request.pathname).toBe("/api/products/abc")
      expect(product).toEqual({ _id: "abc" })
    })

    test("propaga el 404 con su mensaje y status", async () => {
      server.use(
        http.get(apiUrl("/products/:id"), () =>
          HttpResponse.json({ error: "Producto no encontrado" }, { status: 404 }),
        ),
      )

      await expect(productService.getProductById("nope")).rejects.toMatchObject({
        message: "Producto no encontrado",
        status: 404,
      })
    })
  })

  describe("getAdminProducts", () => {
    test("pide /products/admin con los parámetros", async () => {
      const request = captureRequest("get", "/products/admin", { items: [] })

      await productService.getAdminProducts({ page: 1, limit: 20 })

      expect(request.pathname).toBe("/api/products/admin")
      expect(request.params).toEqual({ page: "1", limit: "20" })
    })

    test("pide /products/admin sin query string si no hay parámetros", async () => {
      const request = captureRequest("get", "/products/admin", { items: [] })

      await productService.getAdminProducts()

      expect(request.search).toBe("")
    })

    test("envía el token del admin", async () => {
      tokenStorage.set("admin-token")
      const request = captureRequest("get", "/products/admin", { items: [] })

      await productService.getAdminProducts()

      expect(request.headers.get("Authorization")).toBe("Bearer admin-token")
    })

    test("propaga el 403 si el usuario no es admin", async () => {
      server.use(
        http.get(apiUrl("/products/admin"), () =>
          HttpResponse.json(
            { error: "Se requieren permisos de administrador" },
            { status: 403 },
          ),
        ),
      )

      await expect(productService.getAdminProducts()).rejects.toMatchObject({
        status: 403,
      })
    })
  })

  describe("getAdminProductById", () => {
    test("pide el producto por la ruta de admin", async () => {
      tokenStorage.set("admin-token")
      const request = captureRequest("get", "/products/admin/:id", {
        _id: "abc",
      })

      const product = await productService.getAdminProductById("abc")

      expect(request.pathname).toBe("/api/products/admin/abc")
      expect(request.headers.get("Authorization")).toBe("Bearer admin-token")
      expect(product).toEqual({ _id: "abc" })
    })
  })

  describe("createProduct", () => {
    test("hace POST a /products con el producto en JSON", async () => {
      tokenStorage.set("admin-token")
      const request = captureRequest("post", "/products", {
        _id: "nuevo",
        ...productPayload,
      })

      const created = await productService.createProduct(productPayload)

      expect(request.method).toBe("POST")
      expect(request.pathname).toBe("/api/products")
      expect(JSON.parse(request.body)).toEqual(productPayload)
      expect(request.headers.get("Content-Type")).toBe("application/json")
      expect(request.headers.get("Authorization")).toBe("Bearer admin-token")
      expect(created).toEqual({ _id: "nuevo", ...productPayload })
    })

    test("propaga los errores de validación del backend", async () => {
      server.use(
        http.post(apiUrl("/products"), () =>
          HttpResponse.json(
            { error: "Datos inválidos", details: ["El nombre es obligatorio"] },
            { status: 400 },
          ),
        ),
      )

      await expect(productService.createProduct({})).rejects.toMatchObject({
        message: "El nombre es obligatorio",
        status: 400,
      })
    })
  })

  describe("updateProduct", () => {
    test("hace PUT a /products/:id con el producto en JSON", async () => {
      const request = captureRequest("put", "/products/:id", productPayload)

      await productService.updateProduct("abc", productPayload)

      expect(request.method).toBe("PUT")
      expect(request.pathname).toBe("/api/products/abc")
      expect(JSON.parse(request.body)).toEqual(productPayload)
    })
  })

  describe("deleteProduct", () => {
    test("hace DELETE a /products/:id", async () => {
      tokenStorage.set("admin-token")
      const request = captureRequest("delete", "/products/:id", {
        message: "Producto eliminado",
      })

      await productService.deleteProduct("abc")

      expect(request.method).toBe("DELETE")
      expect(request.pathname).toBe("/api/products/abc")
      expect(request.body).toBe("")
      expect(request.headers.get("Authorization")).toBe("Bearer admin-token")
    })

    test("propaga el 401 si el token es inválido", async () => {
      server.use(
        http.delete(apiUrl("/products/:id"), () =>
          HttpResponse.json(
            { error: "Token inválido o expirado" },
            { status: 401 },
          ),
        ),
      )

      await expect(productService.deleteProduct("abc")).rejects.toMatchObject({
        message: "Token inválido o expirado",
        status: 401,
      })
    })
  })
})
