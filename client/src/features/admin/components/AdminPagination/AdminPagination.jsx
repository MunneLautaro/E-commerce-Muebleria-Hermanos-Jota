import { ChevronLeft, ChevronRight } from "lucide-react"
import { adminPaginationStyles as styles } from "./AdminPaginationStyles"

export function AdminPagination({
  pagination,
  currentPage,
  isLoading,
  onPageChange,
}) {
  if (pagination.totalPages <= 1) return null

  return (
    <nav className={styles.nav} aria-label="Paginación de productos">
      <p className={styles.status}>
        Página {pagination.page} de {pagination.totalPages}
      </p>
      <div className={styles.controls}>
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          className={styles.button}
        >
          <ChevronLeft size={15} aria-hidden="true" />
          Anterior
        </button>
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= pagination.totalPages || isLoading}
          className={styles.button}
        >
          Siguiente
          <ChevronRight size={15} aria-hidden="true" />
        </button>
      </div>
    </nav>
  )
}
