import { Search, X } from "lucide-react"
import { ORDER_STATUSES } from "../../../orders"
import { adminFiltersStyles as styles } from "../../styles/AdminFiltersStyles"
import { SEARCH_MAX_LENGTH } from "../../utils/listParams"

export function AdminOrderFilters({
  estado,
  desde,
  hasta,
  searchTerm,
  hasFilters,
  onEstadoChange,
  onDateChange,
  onSearchChange,
  onClear,
}) {
  return (
    <form
      role="search"
      aria-label="Filtrar órdenes"
      className={styles.form}
      onSubmit={(event) => event.preventDefault()}
    >
      <div className={styles.fields}>
        <label className={styles.searchField}>
          <span className={styles.label}>
            Número de orden, nombre o email del comprador
          </span>
          <span className={styles.inputWrapper}>
            <Search size={16} aria-hidden="true" />
            <input
              type="search"
              value={searchTerm}
              maxLength={SEARCH_MAX_LENGTH}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Ej.: ana@correo.com"
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
            <option value="">Todos</option>
            {ORDER_STATUSES.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Desde</span>
          <input
            type="date"
            value={desde}
            max={hasta || undefined}
            onChange={(event) => onDateChange("desde", event.target.value)}
            className={styles.input}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Hasta</span>
          <input
            type="date"
            value={hasta}
            min={desde || undefined}
            onChange={(event) => onDateChange("hasta", event.target.value)}
            className={styles.input}
          />
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
