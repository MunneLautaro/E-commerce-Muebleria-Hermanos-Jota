import { useCallback, useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { RefreshCw } from "lucide-react"
import { PageMeta } from "../../components/PageMeta/PageMeta"
import { Pagination } from "../../components/Pagination/Pagination"
import { useAuth } from "../../features/auth"
import { OrderDetailModal, orderService } from "../../features/orders"
import {
  AdminOrderFilters,
  AdminOrderTable,
  AdminPageHeader,
  ORDER_LIST_DEFAULTS,
  PAGE_SIZE_OPTIONS,
  parseOrderListParams,
  useDebouncedSearch,
  useListSearchParams,
} from "../../features/admin"
import { adminListPageStyles as styles } from "../../features/admin/styles/AdminListPageStyles"
import { useRequest } from "../../hooks/useRequest"

const ordersMeta = { title: "Panel de órdenes", noIndex: true }
const CLEARED_FILTERS = { estado: "", desde: "", hasta: "", q: "" }

export default function AdminOrdersPage() {
  const { user, loading } = useAuth()
  const { params, updateParams } = useListSearchParams(
    parseOrderListParams,
    ORDER_LIST_DEFAULTS,
  )
  const { page, limit, estado, desde, hasta, q } = params
  const [selectedOrder, setSelectedOrder] = useState(null)
  const isAdmin = user?.role === "admin"

  const request = useCallback(
    () => orderService.getAdminOrders({ page, limit, estado, desde, hasta, q }),
    [page, limit, estado, desde, hasta, q],
  )
  const { data, error, isLoading, reload } = useRequest(request, {
    enabled: isAdmin,
    errorMessage: "No se pudieron cargar las órdenes.",
  })

  const commitSearch = useCallback(
    (value) => updateParams({ q: value }),
    [updateParams],
  )
  const [searchTerm, setSearchTerm] = useDebouncedSearch(q, commitSearch)

  const isPageOutOfRange =
    !isLoading && data?.items.length === 0 && data.pagination.total > 0 && page > 1

  useEffect(() => {
    if (isPageOutOfRange) updateParams({ page: 1 })
  }, [isPageOutOfRange, updateParams])

  if (loading) {
    return (
      <section className={styles.loadingSection} aria-busy="true">
        <PageMeta {...ordersMeta} />
        <p className={styles.loadingText}>Verificando permisos...</p>
      </section>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />

  const orders = data?.items ?? []
  const pagination = data?.pagination ?? { page, limit, total: 0, totalPages: 0 }
  const hasActiveFilters = Boolean(estado || desde || hasta || q)

  const clearFilters = () => {
    setSearchTerm("")
    updateParams(CLEARED_FILTERS)
  }

  const handleDateChange = (field, value) => {
    const [otherField, isInverted] =
      field === "desde"
        ? ["hasta", value && hasta && value > hasta]
        : ["desde", value && desde && value < desde]

    updateParams(isInverted ? { [field]: value, [otherField]: "" } : { [field]: value })
  }

  const renderOrders = () => {
    if (isLoading) {
      return <p className={styles.feedback}>Cargando órdenes...</p>
    }

    if (error) {
      return (
        <div className={styles.errorFeedback}>
          <p className={styles.errorText}>{error}</p>
          <button type="button" onClick={reload} className={styles.retryButton}>
            Intentar nuevamente
          </button>
        </div>
      )
    }

    if (orders.length === 0) {
      return hasActiveFilters ? (
        <div className={styles.feedback}>
          <p>No hay órdenes que coincidan con los filtros.</p>
          <button type="button" onClick={clearFilters} className={styles.emptyButton}>
            Limpiar filtros
          </button>
        </div>
      ) : (
        <p className={styles.feedback}>Todavía no hay órdenes.</p>
      )
    }

    return <AdminOrderTable orders={orders} onShowDetail={setSelectedOrder} />
  }

  return (
    <div className={styles.container}>
      <PageMeta {...ordersMeta} />
      <AdminPageHeader
        title="Órdenes de compra"
        description="Revisá las compras de la tienda y filtralas por estado, fecha o comprador."
      />

      <section className={styles.catalog} aria-labelledby="admin-orders-title">
        <div className={styles.catalogHeader}>
          <div>
            <h2 id="admin-orders-title" className={styles.catalogTitle}>
              Todas las órdenes
            </h2>
            <p className={styles.catalogCount}>
              {pagination.total} {pagination.total === 1 ? "orden" : "órdenes"}
            </p>
          </div>
          <button
            type="button"
            onClick={reload}
            disabled={isLoading}
            className={styles.refreshButton}
          >
            <RefreshCw size={15} aria-hidden="true" />
            Actualizar
          </button>
        </div>

        <AdminOrderFilters
          estado={estado}
          desde={desde}
          hasta={hasta}
          searchTerm={searchTerm}
          hasFilters={hasActiveFilters || searchTerm.trim() !== ""}
          onEstadoChange={(value) => updateParams({ estado: value })}
          onDateChange={handleDateChange}
          onSearchChange={setSearchTerm}
          onClear={clearFilters}
        />

        {renderOrders()}

        {!isLoading && !error && orders.length > 0 && (
          <Pagination
            label="Paginación de órdenes"
            pagination={pagination}
            currentPage={page}
            isLoading={isLoading}
            onPageChange={(nextPage) => updateParams({ page: nextPage })}
            limitOptions={PAGE_SIZE_OPTIONS}
            onLimitChange={(nextLimit) => updateParams({ limit: nextLimit })}
          />
        )}
      </section>

      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        showBuyer
      />
    </div>
  )
}
