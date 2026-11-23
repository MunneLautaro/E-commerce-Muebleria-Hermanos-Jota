import { productOptionalFields } from "./productFields"

describe("productOptionalFields", () => {
  test("cada campo tiene key y label no vacíos", () => {
    for (const field of productOptionalFields) {
      expect(field.key).toEqual(expect.any(String))
      expect(field.key.trim()).not.toBe("")
      expect(field.label).toEqual(expect.any(String))
      expect(field.label.trim()).not.toBe("")
    }
  })

  test("no hay keys repetidas", () => {
    const keys = productOptionalFields.map(({ key }) => key)

    expect(new Set(keys).size).toBe(keys.length)
  })

  test("no hay labels repetidos", () => {
    const labels = productOptionalFields.map(({ label }) => label)

    expect(new Set(labels).size).toBe(labels.length)
  })

  test("no pisa los campos que la tarjeta ya muestra aparte", () => {
    const keys = productOptionalFields.map(({ key }) => key)

    for (const reserved of [
      "_id",
      "nombre",
      "precio",
      "descripcion",
      "imagenUrl",
      "medidas",
      "atributos",
    ]) {
      expect(keys).not.toContain(reserved)
    }
  })
})
