import {
  CART_BUSINESS_RULES,
  CART_COUPONS,
} from "../config/cartBusinessRules"

export const formatCartCurrency = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
})

const isCouponEligible = (coupon, subtotal) =>
  !coupon.minimumSubtotal || subtotal > coupon.minimumSubtotal

export const validateCartCoupon = (code, subtotal) => {
  const normalizedCode = code.trim().toUpperCase()

  if (!normalizedCode) {
    return { coupon: null, error: "Ingresá un código promocional." }
  }

  const coupon = CART_COUPONS[normalizedCode]

  if (!coupon) {
    return { coupon: null, error: "El código ingresado no es válido." }
  }

  if (!isCouponEligible(coupon, subtotal)) {
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
  const subtotal = products.reduce((sum, product) => {
    const price = Number(product.precio)
    const quantity = Number(product.quantity)

    if (!Number.isFinite(price) || !Number.isFinite(quantity)) return sum
    return sum + price * quantity
  }, 0)

  const coupon = CART_COUPONS[couponCode]
  const discount =
    coupon && isCouponEligible(coupon, subtotal)
      ? Math.round(subtotal * coupon.discountRate)
      : 0
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
    discount,
    shipping,
    total: subtotal - discount + shipping,
    freeShippingRemaining,
    freeShippingProgress: Math.min(
      100,
      (subtotal / CART_BUSINESS_RULES.freeShippingThreshold) * 100,
    ),
    qualifiesForFreeShipping: freeShippingRemaining === 0,
  }
}
