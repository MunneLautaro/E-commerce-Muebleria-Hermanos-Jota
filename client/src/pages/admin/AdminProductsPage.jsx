import { useCallback, useEffect, useState } from "react"
import { Link, Navigate, useLocation } from "react-router-dom"
import { toast } from "react-toastify"
import { Plus, RefreshCw } from "lucide-react"
import { PageMeta } from "../../components/PageMeta/PageMeta"
import { Pagination } from "../../components/Pagination/Pagination"
import { useAuth } from "../../features/auth"
import { productService } from "../../features/products"
import {
  AdminPageHeader,
  AdminProductFilters,
  AdminProductTable,
  DeleteProductModal,
  PAGE_SIZE_OPTIONS,
  PRODUCT_LIST_DEFAULTS,
  parseProductListParams,
  useDebouncedSearch,
  useListSearchParams,
} from "../../features/admin"
import { adminListPageStyles as styles } from "../../features/admin/styles/AdminListPageStyles"
import { useRequest } from "../../hooks/useRequest"

const productsMeta = { title: "Panel de productos", noIndex: true }
const CLEARED_FILTERS = { estado: "todos", q: "" }

export default function AdminProductsPage() {
  const { user, loading } = useAuth()
  const location = useLocation()
  const { params, updateParams } = useListSearchParams(
    parseProductListParams,
    PRODUCT_LIST_DEFAULTS,
  )
  const { page, limit, estado, q } = params
  const [productToDelete, setProductToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const isAdmin = user?.role === "admin"

  const request = useCallback(
    () =>
      productService.getAdminProducts({
        page,
        limit,
        order: "name_asc",
        estado,
        q,
      }),
    [page, limit, estado, q],
  )
  const { data, error, isLoading, reload } = useRequest(request, {
    enabled: isAdmin,
    errorMessage: "No se pudieron cargar los productos.",
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

  const products = data?.items ?? []

  const handleDelete = async () => {
    if (!productToDelete || isDeleting) return

    setIsDeleting(true)
    try {
      await productService.deleteProduct(productToDelete._id)
      toast.success("Producto eliminado del catálogo.")
      setProductToDelete(null)

      if (products.length === 1 && page > 1) {
        updateParams({ page: page - 1 })
      } else {
        reload()
      }
    } catch (requestError) {
      toast.error(requestError.message || "No se pudo eliminar el producto.")
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <section className={styles.loadingSection} aria-busy="true">
        <PageMeta {...productsMeta} />
        <p className={styles.loadingText}>Verificando permisos...</p>
      </section>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />

  const pagination = data?.pagination ?? { page, limit, total: 0, totalPages: 0 }
  const hasActiveFilters = estado !== PRODUCT_LIST_DEFAULTS.estado || q !== ""
  const editState = { from: `${location.pathname}${location.search}` }

  const clearFilters = () => {
    setSearchTerm("")
    updateParams(CLEARED_FILTERS)
  }

  const renderCatalog = () => {
    if (isLoading) {
      return <p className={styles.feedback}>Cargando productos...</p>
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

    if (products.length === 0) {
      return hasActiveFilters ? (
        <div className={styles.feedback}>
          <p>No hay productos que coincidan con los filtros.</p>
          <button type="button" onClick={clearFilters} className={styles.emptyButton}>
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className={styles.feedback}>
          <p>Todavía no hay productos cargados.</p>
          <Link to="/admin/crear-producto" className={styles.emptyButton}>
            Crear el primero
          </Link>
        </div>
      )
    }

    return (
      <AdminProductTable
        products={products}
        onDelete={setProductToDelete}
        editState={editState}
      />
    )
  }

  return (
    <div className={styles.container}>
      <PageMeta {...productsMeta} />
      <AdminPageHeader
        title="Gestionar productos"
        description="Consultá el catálogo y actualizá rápidamente la información de cada producto."
        action={
          <Link to="/admin/crear-producto" className={styles.createLink}>
            <Plus size={18} aria-hidden="true" />
            Nuevo producto
          </Link>
        }
      />

      <section className={styles.catalog} aria-labelledby="admin-products-title">
        <div className={styles.catalogHeader}>
          <div>
            <h2 id="admin-products-title" className={styles.catalogTitle}>
              Catálogo completo
            </h2>
            <p className={styles.catalogCount}>
              {pagination.total}{" "}
              {pagination.total === 1 ? "producto" : "productos"}
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

        <AdminProductFilters
          estado={estado}
          searchTerm={searchTerm}
          hasFilters={hasActiveFilters || searchTerm.trim() !== ""}
          onEstadoChange={(value) => updateParams({ estado: value })}
          onSearchChange={setSearchTerm}
          onClear={clearFilters}
        />

        {renderCatalog()}

        {!isLoading && !error && products.length > 0 && (
          <Pagination
            label="Paginación de productos"
            pagination={pagination}
            currentPage={page}
            isLoading={isLoading}
            onPageChange={(nextPage) => updateParams({ page: nextPage })}
            limitOptions={PAGE_SIZE_OPTIONS}
            onLimitChange={(nextLimit) => updateParams({ limit: nextLimit })}
          />
        )}
      </section>

      <DeleteProductModal
        product={productToDelete}
        isDeleting={isDeleting}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
