import {
  ORDER_LIST_DEFAULTS,
  PRODUCT_LIST_DEFAULTS,
  parseDate,
  parseOrderListParams,
  parseProductListParams,
} from "./listParams"

const parse = (parser, query) => parser(new URLSearchParams(query))

describe("parseOrderListParams", () => {
  test("usa los valores por defecto sin parámetros", () => {
    expect(parse(parseOrderListParams, "")).toEqual(ORDER_LIST_DEFAULTS)
  })

  test("lee los parámetros válidos", () => {
    expect(
      parse(
        parseOrderListParams,
        "page=3&limit=15&estado=pendiente&desde=2026-03-01&hasta=2026-03-31&q=%20ana%20",
      ),
    ).toEqual({
      page: 3,
      limit: 15,
      estado: "pendiente",
      desde: "2026-03-01",
      hasta: "2026-03-31",
      q: "ana",
    })
  })

  test("descarta los parámetros inválidos sin romper", () => {
    expect(
      parse(
        parseOrderListParams,
        `page=-2&limit=100&estado=cancelada&desde=ayer&hasta=2026-02-30&q=${"a".repeat(101)}`,
      ),
    ).toEqual(ORDER_LIST_DEFAULTS)
    expect(parse(parseOrderListParams, "page=1.5").page).toBe(1)
    expect(parse(parseOrderListParams, "page=abc").page).toBe(1)
  })

  test("descarta el rango de fechas si desde es posterior a hasta", () => {
    const params = parse(parseOrderListParams, "desde=2026-03-10&hasta=2026-03-01")

    expect(params.desde).toBe("")
    expect(params.hasta).toBe("")
  })
})

describe("parseProductListParams", () => {
  test("usa los valores por defecto sin parámetros o con valores inválidos", () => {
    expect(parse(parseProductListParams, "")).toEqual(PRODUCT_LIST_DEFAULTS)
    expect(parse(parseProductListParams, "estado=borrados&limit=7&page=0")).toEqual(
      PRODUCT_LIST_DEFAULTS,
    )
  })

  test("lee el estado, la búsqueda y la paginación", () => {
    expect(
      parse(parseProductListParams, "estado=inactivos&q=HJ-1&page=2&limit=12"),
    ).toEqual({ estado: "inactivos", q: "HJ-1", page: 2, limit: 12 })
  })
})

describe("parseDate", () => {
  test("acepta solo fechas reales con formato AAAA-MM-DD", () => {
    expect(parseDate("2024-02-29")).toBe("2024-02-29")
    expect(parseDate("2026-02-29")).toBe("")
    expect(parseDate("2026-3-1")).toBe("")
    expect(parseDate(null)).toBe("")
  })
})
