import { useEffect, useMemo, useState } from "react"
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

const PRODUCTS_PER_PAGE = 12

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await productService.getProducts()
        setProducts(data)
      } catch (error) {
        console.error(error)
        setError("No se pudieron cargar los productos.")
        toast.error("No se pudieron cargar los productos.")
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase("es")
    const minimum = minPrice === "" ? null : Number(minPrice)
    const maximum = maxPrice === "" ? null : Number(maxPrice)

    return products.filter((product) => {
      const name = String(product.nombre ?? "").toLocaleLowerCase("es")
      const price =
        product.precio === null ||
        product.precio === undefined ||
        product.precio === ""
          ? Number.NaN
          : Number(product.precio)

      return (
        name.includes(normalizedSearch) &&
        (minimum === null || (Number.isFinite(price) && price >= minimum)) &&
        (maximum === null || (Number.isFinite(price) && price <= maximum))
      )
    })
  }, [products, searchTerm, minPrice, maxPrice])

  const pageCount = Math.max(
    1,
    Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE),
  )
  const pageProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE,
  )
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
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1 ? "producto" : "productos"}
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
        {pageProducts.length > 0 ? (
          <ProductList products={pageProducts} />
        ) : (
          <div className={productsStyles.emptyState}>
            <h2 className={productsStyles.emptyStateTitle}>
              {products.length === 0
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
