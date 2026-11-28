import { useId } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { paginationStyles as styles } from "./PaginationStyles"

export function Pagination({
  pagination,
  currentPage,
  isLoading,
  onPageChange,
  label,
  limitOptions,
  onLimitChange,
}) {
  const limitId = useId()
  const hasPages = pagination.totalPages > 1
  const hasLimitSelector = Boolean(onLimitChange && limitOptions?.length)

  if (!hasPages && !hasLimitSelector) return null

  return (
    <nav className={styles.nav} aria-label={label}>
      <div className={styles.info}>
        {hasPages && (
          <p className={styles.status}>
            Página {pagination.page} de {pagination.totalPages}
          </p>
        )}
        {hasLimitSelector && (
          <div className={styles.limit}>
            <label htmlFor={limitId}>Por página</label>
            <select
              id={limitId}
              value={pagination.limit}
              onChange={(event) => onLimitChange(Number(event.target.value))}
              disabled={isLoading}
              className={styles.limitSelect}
            >
              {limitOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      {hasPages && (
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
      )}
    </nav>
  )
}
