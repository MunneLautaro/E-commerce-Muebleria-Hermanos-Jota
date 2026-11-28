import {
  countOrderUnits,
  formatOrderDate,
  formatOrderDateTime,
  formatOrderUnits,
  getUnitPrice,
} from "./orderFormat"

describe("orderFormat", () => {
  test("formatea la fecha en es-AR con la hora de Argentina", () => {
    expect(formatOrderDate("2026-03-11T02:30:00.000Z")).toBe("10/03/2026")
    expect(formatOrderDateTime("2026-03-11T02:30:00.000Z")).toMatch(
      /^10\/03\/2026,? 23:30$/,
    )
  })

  test("devuelve un texto vacío si la fecha no es válida", () => {
    expect(formatOrderDate(undefined)).toBe("")
  })

  test("cuenta las unidades de todos los productos", () => {
    const order = { productos: [{ cantidad: 2 }, { cantidad: 3 }] }

    expect(countOrderUnits(order)).toBe(5)
    expect(formatOrderUnits(order)).toBe("5 productos")
    expect(formatOrderUnits({ productos: [{ cantidad: 1 }] })).toBe("1 producto")
  })

  test("calcula el precio unitario a partir del subtotal", () => {
    expect(getUnitPrice({ subtotal: 300000, cantidad: 2 })).toBe(150000)
    expect(getUnitPrice({ subtotal: 1000, cantidad: 0 })).toBe(0)
  })
})
