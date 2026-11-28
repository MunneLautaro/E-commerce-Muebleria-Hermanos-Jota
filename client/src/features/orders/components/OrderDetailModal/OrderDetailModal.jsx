import { PackageX, X } from "lucide-react"
import { ModalDialog } from "../../../../components/ModalDialog/ModalDialog"
import { formatPrice } from "../../../../utils/formatPrice"
import { formatOrderDateTime, getUnitPrice } from "../../utils/orderFormat"
import { OrderStatusBadge } from "../OrderStatusBadge/OrderStatusBadge"
import { orderDetailModalStyles as s } from "./OrderDetailModalStyles"

const Fact = ({ label, children }) => (
  <p>
    <span className={s.factLabel}>{label}:</span> {children}
  </p>
)

const OrderItem = ({ item }) => {
  const { producto } = item

  return (
    <li className={s.item}>
      {producto?.imagenUrl ? (
        <img src={producto.imagenUrl} alt={producto.nombre} className={s.image} />
      ) : (
        <span className={s.imagePlaceholder} aria-hidden="true">
          <PackageX size={20} />
        </span>
      )}
      <div className={s.itemBody}>
        <p className={producto ? s.itemName : s.itemUnavailable}>
          {producto?.nombre ?? "Producto no disponible"}
        </p>
        <dl className={s.itemFacts}>
          <dt>Cantidad</dt>
          <dd>{item.cantidad}</dd>
          <dt>Precio unitario</dt>
          <dd>{formatPrice(getUnitPrice(item))}</dd>
          <dt>Subtotal</dt>
          <dd className={s.itemSubtotal}>{formatPrice(item.subtotal)}</dd>
        </dl>
      </div>
    </li>
  )
}

export function OrderDetailModal({ order, onClose, showBuyer = false }) {
  if (!order) return null

  const { envio, comprador } = order

  return (
    <ModalDialog labelledBy="order-detail-title" onClose={onClose}>
      <div className={s.header}>
        <div>
          <p className={s.eyebrow}>Detalle de la orden</p>
          <h2 id="order-detail-title" className={s.title}>
            Orden N° {order._id}
          </h2>
          <div className={s.meta}>
            <span>{formatOrderDateTime(order.createdAt)}</span>
            <OrderStatusBadge estado={order.estado} />
          </div>
        </div>
        <button
          type="button"
          className={s.close}
          onClick={onClose}
          aria-label="Cerrar detalle de la orden"
        >
          <X className={s.closeIcon} aria-hidden="true" />
        </button>
      </div>

      {showBuyer && (
        <section className={s.section} aria-labelledby="order-buyer-title">
          <h3 id="order-buyer-title" className={s.sectionTitle}>
            Comprador
          </h3>
          <div className={s.facts}>
            <Fact label="Nombre">{comprador?.name || "Sin nombre"}</Fact>
            <Fact label="Email">{comprador?.email ?? "Usuario no disponible"}</Fact>
          </div>
        </section>
      )}

      <section className={s.section} aria-labelledby="order-items-title">
        <h3 id="order-items-title" className={s.sectionTitle}>
          Productos
        </h3>
        <ul className={s.items}>
          {order.productos.map((item, index) => (
            <OrderItem key={`${item.producto?._id ?? "sin-producto"}-${index}`} item={item} />
          ))}
        </ul>
      </section>

      {envio && (
        <section className={s.section} aria-labelledby="order-shipping-title">
          <h3 id="order-shipping-title" className={s.sectionTitle}>
            Envío
          </h3>
          <div className={s.facts}>
            <Fact label="Recibe">{envio.nombreCompleto}</Fact>
            <Fact label="Teléfono">{envio.telefono}</Fact>
            <Fact label="Dirección">
              {envio.direccion} {envio.altura}
            </Fact>
            <Fact label="Ciudad">
              {envio.ciudad} ({envio.codigoPostal})
            </Fact>
          </div>
        </section>
      )}

      <p className={s.total}>
        <span className={s.totalLabel}>Total</span>
        <span className={s.totalValue}>{formatPrice(order.total)}</span>
      </p>
    </ModalDialog>
  )
}
