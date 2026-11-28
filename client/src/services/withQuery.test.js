import { withQuery } from "./withQuery"

describe("withQuery", () => {
  test("devuelve el path sin query string si no hay parámetros", () => {
    expect(withQuery("/products")).toBe("/products")
    expect(withQuery("/products", {})).toBe("/products")
  })

  test("convierte los parámetros en query string", () => {
    expect(withQuery("/ordenes", { page: 2, limit: 15, q: "ana pérez" })).toBe(
      "/ordenes?page=2&limit=15&q=ana+p%C3%A9rez",
    )
  })

  test("omite los parámetros vacíos", () => {
    expect(
      withQuery("/ordenes", {
        page: 1,
        estado: "",
        desde: undefined,
        hasta: null,
        minPrice: 0,
      }),
    ).toBe("/ordenes?page=1&minPrice=0")
  })
})
