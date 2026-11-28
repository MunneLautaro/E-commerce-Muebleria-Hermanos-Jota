import { getRedirectPath, getRedirectState } from "./redirect"

describe("getRedirectState", () => {
  test("conserva solo una ruta de origen válida", () => {
    expect(getRedirectState({ from: "/carrito", email: "a@b.com" })).toEqual({
      from: "/carrito",
    })
    expect(getRedirectState({ from: "//otro-sitio.com" })).toBeUndefined()
    expect(getRedirectState(null)).toBeUndefined()
  })
})

describe("getRedirectPath", () => {
  test("devuelve la ruta interna recibida en state.from", () => {
    expect(getRedirectPath({ from: "/carrito" })).toBe("/carrito")
  })

  test("usa el inicio si no hay ruta o no es interna", () => {
    expect(getRedirectPath(undefined)).toBe("/")
    expect(getRedirectPath({ email: "a@b.com" })).toBe("/")
    expect(getRedirectPath({ from: "https://otro-sitio.com" })).toBe("/")
    expect(getRedirectPath({ from: "//otro-sitio.com" })).toBe("/")
  })
})
