import { useCallback, useEffect, useState } from "react"
import { Link, Navigate } from "react-router-dom"
import { toast } from "react-toastify"
import { useAuth } from "../../features/auth"
import { productService } from "../../features/products"
import {
  AdminPageHeader,
  AdminPagination,
  AdminProductTable,
  DeleteProductModal,
} from "../../features/admin"
import { adminProductsPageStyles as styles } from "../../features/admin/styles/AdminProductsPageStyles"
import { RefreshCw } from "lucide-react"

const initialPagination = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
}

export default function AdminProductsPage() {
  const { user, loading } = useAuth()
  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState(initialPagination)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [productToDelete, setProductToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadProducts = useCallback(async () => {
    setIsLoading(true)
    setError("")

    try {
      const data = await productService.getAdminProducts({
        page: currentPage,
        limit: 20,
        order: "name_asc",
      })
      setProducts(data.items)
      setPagination(data.pagination)
    } catch (requestError) {
      setError("No se pudieron cargar los productos.")
      toast.error(requestError.message || "No se pudieron cargar los productos.")
    } finally {
      setIsLoading(false)
    }
  }, [currentPage])

  useEffect(() => {
    if (user?.role !== "admin") return undefined

    const timeoutId = setTimeout(loadProducts, 0)
    return () => clearTimeout(timeoutId)
  }, [user, loadProducts])

  const handleDelete = async () => {
    if (!productToDelete || isDeleting) return

    setIsDeleting(true)
    try {
      await productService.deleteProduct(productToDelete._id)
      toast.success("Producto eliminado del catálogo.")
      setProductToDelete(null)

      if (products.length === 1 && currentPage > 1) {
        setCurrentPage((page) => page - 1)
      } else {
        await loadProducts()
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
        <p className={styles.loadingText}>Verificando permisos...</p>
      </section>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (user.role !== "admin") return <Navigate to="/" replace />

  return (
    <main className={styles.container}>
      <AdminPageHeader />

      <section className={styles.catalog}>
        <div className={styles.catalogHeader}>
          <div>
            <h2 className={styles.catalogTitle}>Catálogo completo</h2>
            <p className={styles.catalogCount}>
              {pagination.total}{" "}
              {pagination.total === 1 ? "producto" : "productos"}
            </p>
          </div>
          <button
            type="button"
            onClick={loadProducts}
            disabled={isLoading}
            className={styles.refreshButton}
          >
            <RefreshCw size={15} aria-hidden="true" />
            Actualizar
          </button>
        </div>

        {isLoading ? (
          <p className={styles.feedback}>Cargando productos...</p>
        ) : error ? (
          <div className={styles.errorFeedback}>
            <p className={styles.errorText}>{error}</p>
            <button
              type="button"
              onClick={loadProducts}
              className={styles.retryButton}
            >
              Intentar nuevamente
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className={styles.feedback}>
            <p>Todavía no hay productos activos.</p>
            <Link to="/admin/crear-producto" className={styles.emptyButton}>
              Crear el primero
            </Link>
          </div>
        ) : (
          <AdminProductTable
            products={products}
            onDelete={setProductToDelete}
          />
        )}

        {!isLoading && !error && (
          <AdminPagination
            pagination={pagination}
            currentPage={currentPage}
            isLoading={isLoading}
            onPageChange={setCurrentPage}
          />
        )}
      </section>

      <DeleteProductModal
        product={productToDelete}
        isDeleting={isDeleting}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleDelete}
      />
    </main>
  )
}
