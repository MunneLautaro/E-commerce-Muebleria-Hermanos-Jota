import { Search, X } from "lucide-react"
import { adminFiltersStyles as styles } from "../../styles/AdminFiltersStyles"
import { PRODUCT_STATUS_OPTIONS, SEARCH_MAX_LENGTH } from "../../utils/listParams"

export function AdminProductFilters({
  estado,
  searchTerm,
  hasFilters,
  onEstadoChange,
  onSearchChange,
  onClear,
}) {
  return (
    <form
      role="search"
      aria-label="Filtrar productos"
      className={styles.form}
      onSubmit={(event) => event.preventDefault()}
    >
      <div className={styles.fields}>
        <label className={styles.searchField}>
          <span className={styles.label}>Nombre o SKU</span>
          <span className={styles.inputWrapper}>
            <Search size={16} aria-hidden="true" />
            <input
              type="search"
              value={searchTerm}
              maxLength={SEARCH_MAX_LENGTH}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Ej.: Mesa Palermo o HJ-000123"
              className={styles.searchInput}
            />
          </span>
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Estado</span>
          <select
            value={estado}
            onChange={(event) => onEstadoChange(event.target.value)}
            className={styles.input}
          >
            {PRODUCT_STATUS_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {hasFilters && (
        <button type="button" onClick={onClear} className={styles.clearButton}>
          <X size={15} aria-hidden="true" />
          Limpiar filtros
        </button>
      )}
    </form>
  )
}
