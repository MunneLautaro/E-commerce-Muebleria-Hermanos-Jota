import { Truck } from "lucide-react"
import { Link } from "react-router-dom"
import { datosContacto } from "../../../../datos/contacto"
import { formatCartCurrency } from "../../utils/cartCalculations"
import { CartCoupon } from "../CartCoupon/CartCoupon"
import { cartSummaryStyles as s } from "./CartSummaryStyles"

const SummaryRow = ({ label, value, valueClassName }) => (
  <div className={s.row}>
    <dt>{label}</dt>
    <dd className={valueClassName}>{value}</dd>
  </div>
)

export const CartSummary = ({
  summary,
  totalItems,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
}) => (
  <aside className={s.aside} aria-labelledby="cart-summary-title">
    <h2 id="cart-summary-title" className={s.title}>
      Resumen de compra
    </h2>

    <div className={s.shipping}>
      <p className={s.shippingMessage}>
        <Truck className={s.shippingIcon} aria-hidden="true" />
        <span>
          {summary.qualifiesForFreeShipping
            ? "¡Ya tenés envío gratis!"
            : `Te faltan ${formatCartCurrency.format(summary.freeShippingRemaining)} para obtener envío gratis.`}
        </span>
      </p>
      <div
        className={s.progressTrack}
        role="progressbar"
        aria-label="Progreso para obtener envío gratis"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(summary.freeShippingProgress)}
      >
        <div
          className={s.progressFill}
          style={{ width: `${summary.freeShippingProgress}%` }}
        />
      </div>
    </div>

    <dl className={s.rows}>
      <SummaryRow
        label={`Subtotal (${totalItems} productos)`}
        value={formatCartCurrency.format(summary.subtotal)}
      />
      <SummaryRow
        label="Descuentos"
        value={`−${formatCartCurrency.format(summary.discount)}`}
        valueClassName={s.discount}
      />
      <SummaryRow
        label="Costo de envío"
        value={
          summary.shipping === 0
            ? "Gratis"
            : formatCartCurrency.format(summary.shipping)
        }
      />
      <div className={s.total}>
        <dt>Total final</dt>
        <dd>{formatCartCurrency.format(summary.total)}</dd>
      </div>
    </dl>

    <CartCoupon
      appliedCoupon={appliedCoupon}
      subtotal={summary.subtotal}
      onApply={onApplyCoupon}
      onRemove={onRemoveCoupon}
    />

    <p className={s.disclosure}>
      Los descuentos y el envío son demostrativos y se calculan solo en este
      frontend; no se validan ni confirman desde un servidor.
    </p>
    <Link to="/productos" className={s.continueLink}>
      Seguir comprando
    </Link>
    <div className={s.contact}>
      <p>Consultas y atención: {datosContacto.horario}</p>
      <p>
        <a className={s.contactLink} href={`tel:${datosContacto.telefono}`}>
          {datosContacto.telefono}
        </a>
        {" · "}
        <a className={s.contactLink} href={`mailto:${datosContacto.email}`}>
          {datosContacto.email}
        </a>
      </p>
    </div>
  </aside>
)
