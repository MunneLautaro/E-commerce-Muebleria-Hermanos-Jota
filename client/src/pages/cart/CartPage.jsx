import { useEffect, useState } from "react"
import { ShoppingCart } from "lucide-react"
import { toast } from "react-toastify"
import { Link, useNavigate } from "react-router-dom"
import { PageMeta } from "../../components/PageMeta/PageMeta"
import { useAuth } from "../../features/auth"
import {
  CartItem,
  CartProductModal,
  CartRecommendations,
  CartSummary,
  CheckoutAddressForm,
  CheckoutPayment,
  CheckoutProgress,
  ConfirmPurchaseModal,
  calculateCartSummary,
  formatCartCurrency,
  hasAddressErrors,
  hasStockFor,
  loadCheckoutAddress,
  persistCheckoutAddress,
  toShippingData,
  useCart,
  useCartItemActions,
  useCartProducts,
  validateCheckoutAddress,
} from "../../features/cart"
import { orderService } from "../../features/orders"
import { cartPageStyles as s } from "./CartPageStyles"

const cartPageMeta = { title: "Mi carrito", noIndex: true }
const REMOVE_ANIMATION_MS = 200
const HIGHLIGHT_MS = 350
const LOGIN_REDIRECT = { state: { from: "/carrito" } }

export default function CartPage() {
  const navigate = useNavigate()
  const { isAuthenticated, loading: authLoading, logout } = useAuth()
  const { cart, addItem, clearCart } = useCart()
  const { products, loading, error, rememberProduct } = useCartProducts()
  const actions = useCartItemActions()
  const [initialAddress] = useState(loadCheckoutAddress)
  const [step, setStep] = useState(1)
  const [address, setAddress] = useState(initialAddress.address)
  const [saveAddress, setSaveAddress] = useState(initialAddress.shouldSave)
  const [addressErrors, setAddressErrors] = useState({})
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [submittingOrder, setSubmittingOrder] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState(null)
  const [removingProduct, setRemovingProduct] = useState(null)
  const [highlightedId, setHighlightedId] = useState(null)
  const [appliedCoupon, setAppliedCoupon] = useState("")

  const summary = calculateCartSummary(products, appliedCoupon)
  const totalItems = products.reduce((sum, product) => sum + product.quantity, 0)
  const selectedProduct = products.find(({ _id }) => _id === selectedProductId)
  const { remove } = actions

  if (!loading && products.length === 0 && step !== 1) {
    setStep(1)
    setShowPurchaseModal(false)
  }

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

  const isCartReady = () => {
    if (products.length === 0) return false

    if (products.some((product) => !hasStockFor(product))) {
      toast.error("Algunos productos no tienen suficiente stock.")
      setStep(1)
      return false
    }

    return true
  }

  const goToLogin = (message) => {
    toast.info(message)
    void navigate("/login", LOGIN_REDIRECT)
  }

  const handleCheckout = () => {
    if (authLoading || !isCartReady()) return

    if (!isAuthenticated) {
      goToLogin("Iniciá sesión para continuar con tu compra.")
      return
    }

    setStep(2)
  }

  const handleAddressChange = (field, value) => {
    setAddress((current) => ({ ...current, [field]: value }))
    if (addressErrors[field]) {
      setAddressErrors((current) => ({ ...current, [field]: "" }))
    }
  }

  const handleNextFromAddress = () => {
    const errors = validateCheckoutAddress(address)
    setAddressErrors(errors)

    if (hasAddressErrors(errors) || !isCartReady()) return

    persistCheckoutAddress(address, saveAddress)
    setStep(3)
  }

  const handleConfirmPurchase = async () => {
    if (submittingOrder) return
    if (!isCartReady()) {
      setShowPurchaseModal(false)
      return
    }

    setSubmittingOrder(true)

    try {
      const order = await orderService.createOrder(
        products,
        toShippingData(address),
      )
      clearCart()
      void navigate("/compra-confirmada", {
        replace: true,
        state: { orderId: order._id },
      })
    } catch (orderError) {
      setSubmittingOrder(false)
      setShowPurchaseModal(false)

      if (orderError.status === 401) {
        await logout()
        goToLogin("Tu sesión expiró. Iniciá sesión para confirmar la compra.")
        return
      }

      toast.error(orderError.message || "No se pudo confirmar la compra.")
    }
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
      <CheckoutProgress step={step} />

      {step === 1 && (
        <>
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
              <div className={s.actions}>
                <button
                  type="button"
                  className={s.checkoutButton}
                  onClick={handleCheckout}
                  disabled={authLoading}
                >
                  Siguiente
                </button>
              </div>
            </>
          )}

          <CartRecommendations onAdd={handleAddRecommendation} />
        </>
      )}

      {step === 2 && (
        <>
          <h1 id="cart-title" className={s.title}>
            Datos de entrega
          </h1>
          <p className={s.intro}>
            Indicá dónde y cómo podemos comunicarte la entrega.
          </p>
          <CheckoutAddressForm
            address={address}
            errors={addressErrors}
            saveAddress={saveAddress}
            onChange={handleAddressChange}
            onToggleSave={setSaveAddress}
            onBack={() => setStep(1)}
            onSubmit={handleNextFromAddress}
          />
        </>
      )}

      {step === 3 && (
        <>
          <h1 id="cart-title" className={s.title}>
            Pago
          </h1>
          <p className={s.intro}>
            Revisá el detalle final antes de confirmar tu compra.
          </p>
          <CheckoutPayment
            products={products}
            summary={summary}
            address={address}
            onBack={() => setStep(2)}
            onBuy={() => setShowPurchaseModal(true)}
          />
        </>
      )}

      {selectedProduct && (
        <CartProductModal
          product={selectedProduct}
          onClose={() => setSelectedProductId(null)}
        />
      )}

      {showPurchaseModal && (
        <ConfirmPurchaseModal
          total={summary.subtotal}
          submitting={submittingOrder}
          onCancel={() => setShowPurchaseModal(false)}
          onConfirm={handleConfirmPurchase}
        />
      )}
    </section>
  )
}
