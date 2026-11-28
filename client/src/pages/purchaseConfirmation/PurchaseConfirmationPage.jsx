import { Link, Navigate, useLocation } from "react-router-dom"
import { CheckCircle2 } from "lucide-react"
import { PageMeta } from "../../components/PageMeta/PageMeta"
import { purchaseConfirmationStyles as s } from "./PurchaseConfirmationStyles"

export default function PurchaseConfirmationPage() {
  const location = useLocation()
  const orderId = location.state?.orderId

  if (!orderId) {
    return <Navigate to="/carrito" replace />
  }

  return (
    <section className={s.section} aria-labelledby="purchase-confirmation-title">
      <PageMeta
        title="Compra confirmada"
        description="Confirmación de tu pago y agradecimiento por tu compra en Hermanos Jota."
        noIndex
      />
      <CheckCircle2 className={s.icon} aria-hidden="true" />
      <p className={s.eyebrow}>Pago confirmado</p>
      <h1 id="purchase-confirmation-title" className={s.title}>
        ¡Gracias por tu compra!
      </h1>
      <p className={s.description}>
        Tu pago fue confirmado y empezamos a preparar tu pedido.
      </p>
      <p className={s.orderNumber}>
        Número de orden: <span className={s.orderId}>{orderId}</span>
      </p>
      <Link to="/" className={s.primaryButton}>
        Volver al inicio
      </Link>
    </section>
  )
}
