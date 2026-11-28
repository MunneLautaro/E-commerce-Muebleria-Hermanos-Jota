import {
  calculateCartSummary,
  validateCartCoupon,
} from "./cartCalculations"

describe("cartCalculations", () => {
  test("calcula el envío y el progreso hasta el mínimo de envío gratis", () => {
    const summary = calculateCartSummary([
      { precio: 100000, quantity: 1 },
    ])

    expect(summary).toMatchObject({
      subtotal: 100000,
      shipping: 15000,
      total: 115000,
      freeShippingRemaining: 100000,
      freeShippingProgress: 50,
      qualifiesForFreeShipping: false,
    })
  })

  test("ofrece envío gratis al llegar al umbral", () => {
    const summary = calculateCartSummary([
      { precio: 200000, quantity: 1 },
    ])

    expect(summary.shipping).toBe(0)
    expect(summary.freeShippingRemaining).toBe(0)
    expect(summary.qualifiesForFreeShipping).toBe(true)
  })

  test("valida códigos sin distinguir mayúsculas y calcula descuentos sobre el subtotal", () => {
    const { coupon } = validateCartCoupon("jota10", 250000)
    const summary = calculateCartSummary(
      [{ precio: 250000, quantity: 1 }],
      coupon.code,
    )

    expect(coupon.code).toBe("JOTA10")
    expect(summary).toMatchObject({
      subtotal: 250000,
      discount: 25000,
      shipping: 0,
      total: 225000,
    })
  })

  test("rechaza JOTA15 en el límite exacto y lo acepta por encima del mínimo", () => {
    expect(validateCartCoupon("JOTA15", 300000).error).toMatch(
      /superior a \$\s300\.000/,
    )
    expect(validateCartCoupon("jota15", 300001)).toMatchObject({
      coupon: { code: "JOTA15", discountRate: 0.15 },
      error: "",
    })
  })

  test("calcula el cinco por ciento de BIENVENIDO como promoción local", () => {
    const { coupon } = validateCartCoupon("BIENVENIDO", 100000)
    const summary = calculateCartSummary(
      [{ precio: 100000, quantity: 1 }],
      coupon.code,
    )

    expect(summary.discount).toBe(5000)
    expect(summary.total).toBe(110000)
  })

  test("informa los códigos inválidos", () => {
    expect(validateCartCoupon("NOEXISTE", 100000)).toMatchObject({
      coupon: null,
      error: "El código ingresado no es válido.",
    })
  })

  test("ignora cantidades inválidas y limita el descuento al subtotal", () => {
    const summary = calculateCartSummary([
      { precio: 100000, quantity: 0 },
      { precio: -100, quantity: 2 },
      { precio: 50000, quantity: 1.5 },
    ], "JOTA10")

    expect(summary).toMatchObject({
      subtotal: 0,
      discount: 0,
      shipping: 0,
      total: 0,
    })
  })
})
