import { useCallback, useState } from "react"
import { ShoppingBag } from "lucide-react"
import { Link, Navigate } from "react-router-dom"
import { PageMeta } from "../../components/PageMeta/PageMeta"
import { Pagination } from "../../components/Pagination/Pagination"
import { useAuth } from "../../features/auth"
import {
  OrderDetailModal,
  OrderStatusBadge,
  formatOrderDate,
  formatOrderUnits,
  orderService,
} from "../../features/orders"
import { useRequest } from "../../hooks/useRequest"
import { formatPrice } from "../../utils/formatPrice"
import { myOrdersStyles as s } from "./MyOrdersPageStyles"

const myOrdersMeta = { title: "Mis órdenes", noIndex: true }
const LOGIN_REDIRECT_STATE = { from: "/mis-ordenes" }
const PAGE_SIZE = 12

export default function MyOrdersPage() {
  const { user, loading } = useAuth()
  const [page, setPage] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const userId = user?.id

  const request = useCallback(
    () => orderService.getMyOrders(userId, { page, limit: PAGE_SIZE }),
    [userId, page],
  )
  const { data, error, isLoading, reload } = useRequest(request, {
    enabled: Boolean(userId),
    errorMessage: "No se pudieron cargar tus órdenes.",
  })

  if (loading) {
    return (
      <section className={s.section} aria-busy="true">
        <PageMeta {...myOrdersMeta} />
        <p className={s.loading}>Verificando tu sesión...</p>
      </section>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={LOGIN_REDIRECT_STATE} />
  }

  const orders = data?.items ?? []

  const renderContent = () => {
    if (isLoading) {
      return <p className={s.loading}>Cargando tus órdenes...</p>
    }

    if (error) {
      return (
        <div className={s.errorBox}>
          <p className={s.errorText} role="alert">
            {error}
          </p>
          <button type="button" onClick={reload} className={s.retryButton}>
            Intentar nuevamente
          </button>
        </div>
      )
    }

    if (orders.length === 0) {
      return (
        <div className={s.empty}>
          <ShoppingBag className={s.emptyIcon} aria-hidden="true" />
          <h2 className={s.emptyTitle}>Todavía no hiciste compras</h2>
          <p className={s.emptyText}>
            Cuando confirmes una compra, la vas a ver acá con su estado.
          </p>
          <Link to="/productos" className={s.primaryLink}>
            Explorar productos
          </Link>
        </div>
      )
    }

    return (
      <div className={s.listCard}>
        <ul className={s.list} aria-label="Tus órdenes">
          {orders.map((order) => (
            <li key={order._id}>
              <button
                type="button"
                className={s.orderButton}
                onClick={() => setSelectedOrder(order)}
              >
                <span className={s.orderMain}>
                  <span className={s.orderNumber}>Orden N° {order._id}</span>
                  <span className={s.orderMeta}>
                    {formatOrderDate(order.createdAt)} · {formatOrderUnits(order)}
                  </span>
                </span>
                <span className={s.orderSide}>
                  <span className={s.orderTotal}>{formatPrice(order.total)}</span>
                  <OrderStatusBadge estado={order.estado} />
                </span>
              </button>
            </li>
          ))}
        </ul>
        <Pagination
          label="Paginación de órdenes"
          pagination={data.pagination}
          currentPage={page}
          isLoading={isLoading}
          onPageChange={setPage}
        />
      </div>
    )
  }

  return (
    <section className={s.section} aria-labelledby="my-orders-title">
      <PageMeta {...myOrdersMeta} />
      <p className={s.eyebrow}>Tu cuenta</p>
      <h1 id="my-orders-title" className={s.title}>
        Mis órdenes
      </h1>
      <p className={s.intro}>
        Revisá tus compras, de la más reciente a la más antigua. Tocá una orden
        para ver el detalle.
      </p>

      {renderContent()}

      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </section>
  )
}
