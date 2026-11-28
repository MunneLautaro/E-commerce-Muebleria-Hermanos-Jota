import { formatCartCurrency } from "../../utils/cartCalculations"
import { checkoutPaymentStyles as s } from "./CheckoutPaymentStyles"

const SummaryRow = ({ label, value, className = s.row }) => (
  <div className={className}>
    <dt>{label}</dt>
    <dd>{value}</dd>
  </div>
)

export const CheckoutPayment = ({ products, summary, address, onBack, onBuy }) => (
  <>
    <div className={s.layout}>
      <ul className={s.list} aria-label="Detalle de productos">
        {products.map((product) => (
          <li className={s.item} key={product._id}>
            <span>
              <span>{product.nombre}</span> × {product.quantity}
            </span>
            <span>
              {formatCartCurrency.format(product.precio * product.quantity)}
            </span>
          </li>
        ))}
      </ul>
      <dl className={s.summary}>
        <SummaryRow
          label="Subtotal"
          value={formatCartCurrency.format(summary.subtotal)}
        />
        <SummaryRow
          label="Descuentos"
          value={formatCartCurrency.format(summary.discount)}
        />
        <SummaryRow
          label="Envío"
          value={
            summary.shipping === 0
              ? "Gratis"
              : formatCartCurrency.format(summary.shipping)
          }
        />
        <SummaryRow
          label="Total final"
          value={formatCartCurrency.format(summary.total)}
          className={s.total}
        />
      </dl>
    </div>
    <section className={s.address} aria-label="Datos de entrega">
      <p className={s.addressTitle}>Entrega</p>
      <p>
        {address.nombreCompleto} · {address.telefono}
      </p>
      <p>
        {address.direccion} {address.altura}, {address.ciudad} (
        {address.codigoPostal})
      </p>
    </section>
    <div className={s.actions}>
      <button type="button" className={s.secondaryButton} onClick={onBack}>
        Volver
      </button>
      <button type="button" className={s.primaryButton} onClick={onBuy}>
        Comprar
      </button>
    </div>
  </>
)
