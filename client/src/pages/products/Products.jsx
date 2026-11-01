import { useEffect, useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react"
import { toast } from "react-toastify"
import { ProductList, productService } from "../../features/products"
import { productsStyles } from "./ProductsStyles"

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [productsPerPage, setProductsPerPage] = useState(12)

  useEffect(() => {
    let ignore = false
    const invalidRange =
      minPrice !== "" && maxPrice !== "" && Number(minPrice) > Number(maxPrice)

    if (invalidRange) {
      return () => {
        ignore = true
      }
    }

    const timeoutId = setTimeout(async () => {
      try {
        const data = await productService.getProducts({
          page: currentPage,
          limit: productsPerPage,
          order: "name_asc",
          ...(searchTerm.trim() && { q: searchTerm.trim() }),
          ...(minPrice !== "" && { minPrice }),
          ...(maxPrice !== "" && { maxPrice }),
        })
        if (ignore) return
        setError("")
        setProducts(data.items)
        setPagination(data.pagination)
      } catch (error) {
        if (ignore) return
        console.error(error)
        setError("No se pudieron cargar los productos.")
        toast.error("No se pudieron cargar los productos.")
      } finally {
        if (!ignore) setLoading(false)
      }
    }, 300)

    return () => {
      ignore = true
      clearTimeout(timeoutId)
    }
  }, [currentPage, productsPerPage, searchTerm, minPrice, maxPrice])

  const pageCount = Math.max(1, pagination.totalPages)
  const invalidPriceRange =
    minPrice !== "" && maxPrice !== "" && Number(minPrice) > Number(maxPrice)
  const hasFilters = searchTerm !== "" || minPrice !== "" || maxPrice !== ""

  const updateFilter = (setter) => (event) => {
    setter(event.target.value)
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setMinPrice("")
    setMaxPrice("")
    setCurrentPage(1)
  }

  if (loading) {
    return (
      <section className={productsStyles.loadingSection}>
        <p className={productsStyles.loadingText}>Cargando productos...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className={productsStyles.errorSection}>
        <p className={productsStyles.errorText}>{error}</p>
      </section>
    )
  }

  return (
    <main className={productsStyles.container}>
      <header className={productsStyles.header}>
        <p className={productsStyles.eyebrow}>
          Hermanos Jota · Diseño para durar
        </p>
        <h1 className={productsStyles.title}>Catálogo de muebles</h1>
        <p className={productsStyles.description}>
          Muebles de diseño, hechos para acompañar tu vida y transformar cada
          espacio.
        </p>
      </header>

      <section
        className={productsStyles.filters}
        aria-label="Buscar y filtrar productos"
      >
        <div className={productsStyles.filterHeading}>
          <div className={productsStyles.filterTitle}>
            <SlidersHorizontal size={18} aria-hidden="true" />
            <h2 className={productsStyles.filterTitleText}>
              Encontrá tu próximo mueble
            </h2>
          </div>
          <p className={productsStyles.resultCount} aria-live="polite">
            {pagination.total}{" "}
            {pagination.total === 1 ? "producto" : "productos"}
          </p>
        </div>

        <div className={productsStyles.filterControls}>
          <label className={productsStyles.searchField}>
            <span className={productsStyles.fieldLabel}>Buscar por nombre</span>
            <span className={productsStyles.inputWrapper}>
              <Search size={18} aria-hidden="true" />
              <input
                type="search"
                value={searchTerm}
                onChange={updateFilter(setSearchTerm)}
                placeholder="Ej.: Sofá Patagonia"
                className={productsStyles.searchInput}
              />
            </span>
          </label>

          <fieldset className={productsStyles.priceFieldset}>
            <legend className={productsStyles.fieldLabel}>
              Filtrar por precio
            </legend>
            <div className={productsStyles.priceInputs}>
              <label className={productsStyles.priceField}>
                <span className={productsStyles.priceLabel}>Desde</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  value={minPrice}
                  onChange={updateFilter(setMinPrice)}
                  placeholder="Mínimo"
                  aria-label="Precio mínimo"
                  aria-invalid={invalidPriceRange}
                  className={productsStyles.priceInput}
                />
              </label>
              <span className={productsStyles.priceSeparator} aria-hidden="true">
                —
              </span>
              <label className={productsStyles.priceField}>
                <span className={productsStyles.priceLabel}>Hasta</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  value={maxPrice}
                  onChange={updateFilter(setMaxPrice)}
                  placeholder="Máximo"
                  aria-label="Precio máximo"
                  aria-invalid={invalidPriceRange}
                  className={productsStyles.priceInput}
                />
              </label>
            </div>
          </fieldset>
        </div>

        <div className={productsStyles.filterFooter}>
          {invalidPriceRange && (
            <p className={productsStyles.filterError} role="alert">
              El precio mínimo no puede superar al máximo.
            </p>
          )}
          <label>
            Productos por página
            <select
              value={productsPerPage}
              onChange={(event) => {
                setProductsPerPage(Number(event.target.value))
                setCurrentPage(1)
              }}
            >
              <option value={12}>12</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
            </select>
          </label>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className={productsStyles.clearButton}
            >
              <X size={15} aria-hidden="true" />
              Limpiar filtros
            </button>
          )}
        </div>
      </section>

      <section
        className={productsStyles.listWrapper}
        aria-label="Lista de productos"
      >
        {products.length > 0 ? (
          <ProductList products={products} />
        ) : (
          <div className={productsStyles.emptyState}>
            <h2 className={productsStyles.emptyStateTitle}>
              {pagination.total === 0
                ? "Todavía no hay productos disponibles"
                : "No encontramos productos"}
            </h2>
            <p>
              {products.length === 0
                ? "Volvé pronto para descubrir nuestra colección."
                : "Probá con otro nombre o ajustá el rango de precios."}
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className={productsStyles.emptyStateButton}
              >
                Ver todos los productos
              </button>
            )}
          </div>
        )}
      </section>

      <nav
        className={productsStyles.pagination}
        aria-label="Paginación de productos"
      >
        <button
          type="button"
          onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
          disabled={currentPage === 1}
          className={productsStyles.pageButton}
          aria-label="Página anterior"
        >
          <ChevronLeft size={18} aria-hidden="true" />
          Anterior
        </button>
        <span className={productsStyles.pageStatus} aria-live="polite">
          Página {currentPage} de {pageCount}
        </span>
        <button
          type="button"
          onClick={() =>
            setCurrentPage((page) => Math.min(pageCount, page + 1))
          }
          disabled={currentPage >= pageCount}
          className={productsStyles.pageButton}
          aria-label="Página siguiente"
        >
          Siguiente
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </nav>
    </main>
  )
}
