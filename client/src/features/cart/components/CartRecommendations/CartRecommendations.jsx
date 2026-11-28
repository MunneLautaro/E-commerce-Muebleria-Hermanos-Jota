import { useEffect, useState } from "react"
import { Plus } from "lucide-react"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"
import { productService } from "../../../products/services/productService"
import { CART_BUSINESS_RULES } from "../../constants/cartBusinessRules"
import { useCart } from "../../hooks/useCart"
import { formatCartCurrency } from "../../utils/cartCalculations"
import { cartRecommendationsStyles as s } from "./CartRecommendationsStyles"

const RecommendationCard = ({ product, onAdd }) => {
  const stock = Number(product.stock)
  const hasStock = Number.isFinite(stock) && stock > 0

  return (
    <li className={s.card}>
      <Link
        to={`/productos/${product._id}`}
        aria-label={`Ver detalle de ${product.nombre}`}
      >
        <img
          src={product.imagenUrl}
          alt={product.nombre}
          loading="lazy"
          className={s.image}
        />
      </Link>
      <div className={s.content}>
        <Link to={`/productos/${product._id}`} className={s.name}>
          {product.nombre}
        </Link>
        <p className={s.price}>
          {formatCartCurrency.format(Number(product.precio) || 0)}
        </p>
        {product.stock !== undefined && (
          <p className={s.stock}>Stock disponible: {product.stock}</p>
        )}
        <button
          type="button"
          className={s.addButton}
          onClick={() => onAdd(product)}
          disabled={!hasStock}
          aria-label={`Agregar ${product.nombre} al carrito`}
        >
          <Plus className={s.addIcon} aria-hidden="true" />
          {hasStock ? "Agregar al carrito" : "Sin stock"}
        </button>
      </div>
    </li>
  )
}

export const CartRecommendations = ({ onAdd }) => {
  const { cart } = useCart()
  const [catalog, setCatalog] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let isActive = true

    const fetchCatalog = async () => {
      try {
        const result = await productService.getProducts({
          page: 1,
          limit: CART_BUSINESS_RULES.catalogPageLimit,
          order: "name_asc",
        })

        if (!Array.isArray(result?.items)) {
          throw new TypeError("La respuesta del catálogo no contiene productos.")
        }

        if (isActive) setCatalog(result.items)
      } catch (requestError) {
        if (!isActive) return

        console.error(requestError)
        setError("No se pudieron cargar las recomendaciones.")
        toast.error("No se pudieron cargar las recomendaciones.")
      } finally {
        if (isActive) setLoading(false)
      }
    }

    void fetchCatalog()

    return () => {
      isActive = false
    }
  }, [])

  const cartIds = new Set(cart.map(({ id }) => id))
  const recommended = catalog
    .filter((product) => !cartIds.has(product._id))
    .slice(0, CART_BUSINESS_RULES.recommendationLimit)

  const renderContent = () => {
    if (loading) {
      return (
        <output className={s.notice}>
          Buscando productos del catálogo...
        </output>
      )
    }

    if (error) {
      return (
        <p className={s.notice} role="alert">
          {error}
        </p>
      )
    }

    if (recommended.length === 0) {
      return (
        <p className={s.notice}>
          Ya estás viendo todos los productos disponibles en esta selección.
        </p>
      )
    }

    return (
      <ul className={s.list}>
        {recommended.map((product) => (
          <RecommendationCard key={product._id} product={product} onAdd={onAdd} />
        ))}
      </ul>
    )
  }

  return (
    <section className={s.section} aria-labelledby="cart-recommendations-title">
      <header className={s.header}>
        <p className={s.eyebrow}>Inspiración para tu espacio</p>
        <h2 id="cart-recommendations-title" className={s.title}>
          Completá tu compra
        </h2>
      </header>
      {renderContent()}
    </section>
  )
}
