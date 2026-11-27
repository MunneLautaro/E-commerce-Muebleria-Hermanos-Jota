import { useEffect, useState } from "react"
import { ShoppingCart } from "lucide-react"
import { toast } from "react-toastify"
import { Link } from "react-router-dom"
import { PageMeta } from "../../components/PageMeta/PageMeta"
import {
  CartItem,
  CartProductModal,
  CartRecommendations,
  CartSummary,
  calculateCartSummary,
  formatCartCurrency,
  hasStockFor,
  useCart,
  useCartItemActions,
  useCartProducts,
} from "../../features/cart"
import { cartPageStyles as s } from "./CartPageStyles"

const cartPageMeta = { title: "Mi carrito", noIndex: true }
const REMOVE_ANIMATION_MS = 200
const HIGHLIGHT_MS = 350

export default function CartPage() {
  const { cart, addItem } = useCart()
  const { products, loading, error, rememberProduct } = useCartProducts()
  const actions = useCartItemActions()
  const [selectedProductId, setSelectedProductId] = useState(null)
  const [removingProduct, setRemovingProduct] = useState(null)
  const [highlightedId, setHighlightedId] = useState(null)
  const [appliedCoupon, setAppliedCoupon] = useState("")

  const summary = calculateCartSummary(products, appliedCoupon)
  const totalItems = products.reduce((sum, product) => sum + product.quantity, 0)
  const selectedProduct = products.find(({ _id }) => _id === selectedProductId)
  const { remove } = actions

  useEffect(() => {
    if (!removingProduct) return undefined

    const timeoutId = window.setTimeout(() => {
      remove(removingProduct)
      setRemovingProduct(null)
    }, REMOVE_ANIMATION_MS)

    return () => window.clearTimeout(timeoutId)
  }, [removingProduct, remove])

  useEffect(() => {
    if (!highlightedId) return undefined

    const timeoutId = window.setTimeout(() => setHighlightedId(null), HIGHLIGHT_MS)
    return () => window.clearTimeout(timeoutId)
  }, [highlightedId])

  const handleRemove = (product) => {
    if (removingProduct) return
    if (selectedProductId === product._id) setSelectedProductId(null)
    setRemovingProduct(product)
  }

  const handleDecrease = (product) => {
    if (product.quantity <= 1) {
      handleRemove(product)
      return
    }

    actions.decrease(product)
    setHighlightedId(product._id)
  }

  const handleIncrease = (product) => {
    if (actions.increase(product)) setHighlightedId(product._id)
  }

  const handleAddRecommendation = (product) => {
    const quantity = cart.find(({ id }) => id === product._id)?.quantity ?? 0

    if (!hasStockFor(product, quantity + 1)) {
      toast.error(`No hay más unidades disponibles de ${product.nombre}.`)
      return
    }

    rememberProduct(product)
    addItem(product)
    setHighlightedId(product._id)
    toast.success(`Se agregó 1 ${product.nombre} al carrito`)
  }

  if (loading) {
    return (
      <section className={s.section} aria-busy="true">
        <PageMeta {...cartPageMeta} />
        <h1 className={s.title}>Mi carrito</h1>
        <p className={s.loading}>Cargando los productos de tu carrito...</p>
      </section>
    )
  }

  if (error && products.length === 0) {
    return (
      <section className={s.section}>
        <PageMeta {...cartPageMeta} />
        <h1 className={s.title}>Mi carrito</h1>
        <p className={s.error} role="alert">
          No se pudieron cargar los productos de tu carrito.
        </p>
      </section>
    )
  }

  return (
    <section className={s.section} aria-labelledby="cart-title">
      <PageMeta {...cartPageMeta} />
      <p className={s.eyebrow}>Tu selección</p>
      <h1 id="cart-title" className={s.title}>
        Mi carrito
      </h1>
      <p className={s.intro}>
        Revisá los productos que elegiste y ajustá las cantidades antes de
        continuar.
      </p>

      {products.length === 0 ? (
        <div className={s.empty}>
          <ShoppingCart className={s.emptyIcon} aria-hidden="true" />
          <h2 className={s.emptyTitle}>Tu carrito está vacío</h2>
          <p className={s.emptyText}>
            Cuando agregues un mueble, lo vas a encontrar acá.
          </p>
          <Link to="/productos" className={s.primaryLink}>
            Explorar productos
          </Link>
        </div>
      ) : (
        <>
          <div className={s.mobileSummary}>
            <div>
              <p className={s.mobileSummaryLabel}>Total final</p>
              <p className={s.mobileSummaryValue}>
                {formatCartCurrency.format(summary.total)}
              </p>
            </div>
            <p className={s.mobileSummaryLabel}>
              {summary.qualifiesForFreeShipping
                ? "Envío gratis"
                : `${formatCartCurrency.format(summary.freeShippingRemaining)} para envío gratis`}
            </p>
          </div>
          <div className={s.layout}>
            <ul className={s.itemList} aria-label="Productos en tu carrito">
              {products.map((product) => (
                <CartItem
                  key={product._id}
                  product={product}
                  isRemoving={removingProduct?._id === product._id}
                  isHighlighted={highlightedId === product._id}
                  disabled={Boolean(removingProduct)}
                  onIncrease={handleIncrease}
                  onDecrease={handleDecrease}
                  onRemove={handleRemove}
                  onShowDetail={(item) => setSelectedProductId(item._id)}
                />
              ))}
            </ul>

            <CartSummary
              summary={summary}
              totalItems={totalItems}
              appliedCoupon={appliedCoupon}
              onApplyCoupon={setAppliedCoupon}
              onRemoveCoupon={() => setAppliedCoupon("")}
            />
          </div>
        </>
      )}

      <CartRecommendations onAdd={handleAddRecommendation} />

      {selectedProduct && (
        <CartProductModal
          product={selectedProduct}
          onClose={() => setSelectedProductId(null)}
        />
      )}
    </section>
  )
}
