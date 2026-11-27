export const CART_BUSINESS_RULES = Object.freeze({
  freeShippingThreshold: 200000,
  standardShippingCost: 15000,
  recommendationLimit: 4,
  catalogPageLimit: 20,
})

export const CART_COUPONS = Object.freeze({
  JOTA10: Object.freeze({
    code: "JOTA10",
    discountRate: 0.1,
    minimumSubtotal: 0,
    label: "10% de descuento en la compra",
  }),
  JOTA15: Object.freeze({
    code: "JOTA15",
    discountRate: 0.15,
    minimumSubtotal: 300000,
    label: "15% de descuento",
  }),
  BIENVENIDO: Object.freeze({
    code: "BIENVENIDO",
    discountRate: 0.05,
    minimumSubtotal: 0,
    label: "5% de descuento demostrativo para primera compra",
  }),
})
