import {
  CART_BUSINESS_RULES,
  CART_COUPONS,
} from "../constants/cartBusinessRules"

export const formatCartCurrency = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
})

const isCouponEligible = (coupon, subtotal) =>
  !coupon.minimumSubtotal || subtotal > coupon.minimumSubtotal

export const validateCartCoupon = (code, subtotal) => {
  const normalizedCode = String(code ?? "").trim().toUpperCase()
  const normalizedSubtotal = Number.isFinite(Number(subtotal))
    ? Math.max(0, Math.round(Number(subtotal)))
    : 0

  if (!normalizedCode) {
    return { coupon: null, error: "Ingresá un código promocional." }
  }

  const coupon = CART_COUPONS[normalizedCode]

  if (!coupon) {
    return { coupon: null, error: "El código ingresado no es válido." }
  }

  if (!isCouponEligible(coupon, normalizedSubtotal)) {
    return {
      coupon: null,
      error: `${coupon.code} requiere una compra superior a ${formatCartCurrency.format(
        coupon.minimumSubtotal,
      )}.`,
    }
  }

  return { coupon, error: "" }
}

export const calculateCartSummary = (products, couponCode = "") => {
  const subtotal = Array.isArray(products)
    ? products.reduce((sum, product) => {
    const price = Number(product.precio)
    const quantity = Number(product.quantity)

    if (
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      return sum
    }
    return sum + Math.round(price) * quantity
  }, 0)
    : 0

  const coupon = CART_COUPONS[couponCode]
  const discount =
    coupon && isCouponEligible(coupon, subtotal)
      ? Math.round(subtotal * coupon.discountRate)
      : 0
  const normalizedDiscount = Math.min(discount, subtotal)
  const shipping =
    subtotal > 0 && subtotal < CART_BUSINESS_RULES.freeShippingThreshold
      ? CART_BUSINESS_RULES.standardShippingCost
      : 0
  const freeShippingRemaining = Math.max(
    0,
    CART_BUSINESS_RULES.freeShippingThreshold - subtotal,
  )

  return {
    subtotal,
    discount: normalizedDiscount,
    shipping,
    total: Math.max(0, subtotal - normalizedDiscount + shipping),
    freeShippingRemaining,
    freeShippingProgress: Math.min(
      100,
      (subtotal / CART_BUSINESS_RULES.freeShippingThreshold) * 100,
    ),
    qualifiesForFreeShipping: freeShippingRemaining === 0,
  }
}
