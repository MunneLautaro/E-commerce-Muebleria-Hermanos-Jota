import { http, HttpResponse } from "msw"
import { server } from "../test/msw/server"
import { apiUrl } from "../test/msw/handlers"
import { fetchApi } from "./api"
import { tokenStorage } from "./tokenStorage"

describe("fetchApi", () => {
  afterEach(() => tokenStorage.clear())

  test("devuelve el JSON de la respuesta", async () => {
    server.use(
      http.get(apiUrl("/products"), () =>
        HttpResponse.json({ items: [{ nombre: "Silla" }] }),
      ),
    )

    await expect(fetchApi("/products")).resolves.toEqual({
      items: [{ nombre: "Silla" }],
    })
  })

  test("envía el token guardado como Bearer", async () => {
    let authorization
    server.use(
      http.get(apiUrl("/auth/me"), ({ request }) => {
        authorization = request.headers.get("Authorization")
        return HttpResponse.json({})
      }),
    )
    tokenStorage.set("token-de-prueba")

    await fetchApi("/auth/me")

    expect(authorization).toBe("Bearer token-de-prueba")
  })

  test("no envía Authorization si no hay token", async () => {
    let authorization = "sin leer"
    server.use(
      http.get(apiUrl("/products"), ({ request }) => {
        authorization = request.headers.get("Authorization")
        return HttpResponse.json({})
      }),
    )

    await fetchApi("/products")

    expect(authorization).toBeNull()
  })

  test("usa el campo error del backend y expone el status", async () => {
    server.use(
      http.post(apiUrl("/products"), () =>
        HttpResponse.json(
          { error: "Se requieren permisos de administrador" },
          { status: 403 },
        ),
      ),
    )

    await expect(
      fetchApi("/products", { method: "POST", body: "{}" }),
    ).rejects.toMatchObject({
      message: "Se requieren permisos de administrador",
      status: 403,
    })
  })

  test("une los details de validación en un solo mensaje", async () => {
    server.use(
      http.post(apiUrl("/products"), () =>
        HttpResponse.json(
          { error: "Validación", details: ["Falta nombre", "Precio inválido"] },
          { status: 400 },
        ),
      ),
    )

    await expect(
      fetchApi("/products", { method: "POST", body: "{}" }),
    ).rejects.toThrow("Falta nombre. Precio inválido")
  })

  test("avisa si no puede conectar con el backend", async () => {
    server.use(http.get(apiUrl("/products"), () => HttpResponse.error()))

    await expect(fetchApi("/products")).rejects.toThrow(
      "No se pudo conectar con el backend",
    )
  })
})
