import { Tag, X } from "lucide-react"
import { CART_COUPONS } from "../../constants/cartBusinessRules"
import { useCouponForm } from "../../hooks/useCouponForm"
import {
  formatCartCurrency,
  validateCartCoupon,
} from "../../utils/cartCalculations"
import { cartCouponStyles as s } from "./CartCouponStyles"

const availableCoupons = Object.values(CART_COUPONS)

const describeCoupon = (coupon) => {
  const minimum =
    coupon.minimumSubtotal > 0
      ? ` en compras superiores a ${formatCartCurrency.format(coupon.minimumSubtotal)}`
      : ""
  const disclaimer =
    coupon.code === "BIENVENIDO"
      ? " (promoción simulada, no se verifica primera compra)"
      : ""

  return `${coupon.label}${minimum}${disclaimer}`
}

export const CartCoupon = ({ appliedCoupon, subtotal, onApply, onRemove }) => {
  const { codeField, handleSubmit, error, message, removeCoupon } =
    useCouponForm({ subtotal, onApply, onRemove })
  const inactiveReason = appliedCoupon
    ? validateCartCoupon(appliedCoupon, subtotal).error
    : ""

  return (
    <div className={s.section}>
      <h3 className={s.title}>
        <Tag className={s.titleIcon} aria-hidden="true" />
        Código promocional de prueba
      </h3>

      {appliedCoupon ? (
        <div>
          <output className={inactiveReason ? s.error : s.success}>
            {inactiveReason
              ? `El cupón ${appliedCoupon} no se aplica: ${inactiveReason}`
              : message || `Cupón ${appliedCoupon} aplicado localmente.`}
          </output>
          <button type="button" className={s.remove} onClick={removeCoupon}>
            <X className={s.removeIcon} aria-hidden="true" />
            Quitar cupón {appliedCoupon}
          </button>
        </div>
      ) : (
        <form className={s.form} onSubmit={handleSubmit} noValidate>
          <label className="sr-only" htmlFor="cart-coupon-code">
            Código promocional
          </label>
          <input
            id="cart-coupon-code"
            type="text"
            autoComplete="off"
            maxLength={32}
            placeholder="Ingresá tu código"
            className={s.input}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "cart-coupon-error" : undefined}
            {...codeField}
          />
          <button type="submit" className={s.apply}>
            Aplicar
          </button>
        </form>
      )}

      {error && !appliedCoupon && (
        <p id="cart-coupon-error" className={s.error} role="alert">
          {error}
        </p>
      )}
      {message && !appliedCoupon && (
        <output className={s.success}>{message}</output>
      )}

      <ul className={s.codes} aria-label="Cupones demostrativos">
        {availableCoupons.map((coupon) => (
          <li key={coupon.code}>
            <strong>{coupon.code}</strong>: {describeCoupon(coupon)}
          </li>
        ))}
      </ul>
    </div>
  )
}
