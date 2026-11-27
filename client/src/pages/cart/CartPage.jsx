import { useEffect, useState } from "react"
import { ShoppingCart } from "lucide-react"
import { toast } from "react-toastify"
import { Link, useNavigate } from "react-router-dom"
import { PageMeta } from "../../components/PageMeta/PageMeta"
import { ModalDialog } from "../../components/ModalDialog/ModalDialog"
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
import { CHECKOUT_ADDRESS_STORAGE_KEY, loadCheckoutAddress } from "./checkoutAddress"
import { cartPageStyles as s } from "./CartPageStyles"

const cartPageMeta = { title: "Mi carrito", noIndex: true }
const REMOVE_ANIMATION_MS = 200
const HIGHLIGHT_MS = 350

const addressFields = [
  ["nombreCompleto", "Nombre completo", "text", "name"],
  ["telefono", "Teléfono", "tel", "tel"],
  ["direccion", "Dirección", "text", "street-address"],
  ["altura", "Altura", "text", "address-line2"],
  ["ciudad", "Ciudad", "text", "address-level2"],
  ["codigoPostal", "Código postal", "text", "postal-code"],
]

const validateAddress = (address) => ({
  nombreCompleto: address.nombreCompleto.trim()
    ? ""
    : "Ingresá tu nombre completo.",
  telefono: address.telefono.trim()
    ? ""
    : "Ingresá tu teléfono de contacto.",
  direccion: address.direccion.trim()
    ? ""
    : "Ingresá tu dirección de entrega.",
  altura: address.altura.trim()
    ? ""
    : "Ingresá el número de la dirección.",
  ciudad: address.ciudad.trim() ? "" : "Ingresá tu ciudad.",
  codigoPostal: address.codigoPostal.trim()
    ? ""
    : "Ingresá tu código postal.",
})

export default function CartPage() {
  const navigate = useNavigate()
  const { cart, addItem, clearCart } = useCart()
  const initialAddress = loadCheckoutAddress()
  const [step, setStep] = useState(1)
  const [address, setAddress] = useState(initialAddress.address)
  const [saveAddress, setSaveAddress] = useState(initialAddress.shouldSave)
  const [addressErrors, setAddressErrors] = useState({})
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
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

  const handleAddressChange = (field, value) => {
    setAddress((current) => ({ ...current, [field]: value }))
    if (addressErrors[field]) {
      setAddressErrors((current) => ({ ...current, [field]: "" }))
    }
  }

  const handleNextFromAddress = () => {
    const errors = validateAddress(address)
    setAddressErrors(errors)

    if (Object.values(errors).some(Boolean)) return

    if (saveAddress) {
      window.localStorage.setItem(
        CHECKOUT_ADDRESS_STORAGE_KEY,
        JSON.stringify(address),
      )
    } else {
      window.localStorage.removeItem(CHECKOUT_ADDRESS_STORAGE_KEY)
    }

    setStep(3)
  }

  const handleConfirmPurchase = () => {
    clearCart()
    setShowPurchaseModal(false)
    navigate("/compra-confirmada", { replace: true })
  }

  const handleCheckout = () => {
    if (products.length === 0) return

    const hasNoStock = products.some((product) => !hasStockFor(product))
    if (hasNoStock) {
      toast.error("Algunos productos no tienen suficiente stock.")
      return
    }

    setStep(2)
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

      <div className={s.progress} aria-label="Progreso de la compra">
        {[1, 2, 3].map((number) => (
          <div
            key={number}
            className={`${s.progressStep} ${number <= step ? s.progressStepActive : ""}`}
            aria-current={number === step ? "step" : undefined}
          >
            <span className={s.progressNumber}>{number}</span>
            <span className={s.progressLabel}>
              {number === 1 ? "Carrito" : number === 2 ? "Ubicación" : "Pago"}
            </span>
          </div>
        ))}
      </div>
      <p className={s.stepText}>Paso {step} de 3</p>

      {step === 1 && (
        <>
          <p className={s.eyebrow}>Tu selección</p>
          <h1 id="cart-title" className={s.title}>Mi carrito</h1>
          <p className={s.intro}>Revisá los productos que elegiste y ajustá las cantidades antes de continuar.</p>

          {products.length === 0 ? (
            <div className={s.empty}>
              <ShoppingCart className={s.emptyIcon} aria-hidden="true" />
              <h2 className={s.emptyTitle}>Tu carrito está vacío</h2>
              <p className={s.emptyText}>Cuando agregues un mueble, lo vas a encontrar acá.</p>
              <Link to="/productos" className={s.primaryLink}>Explorar productos</Link>
            </div>
          ) : (
            <>
              <div className={s.mobileSummary}>
                <div>
                  <p className={s.mobileSummaryLabel}>Total final</p>
                  <p className={s.mobileSummaryValue}>{formatCartCurrency.format(summary.total)}</p>
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
                <button type="button" className={s.checkoutButton} onClick={handleCheckout}>Siguiente</button>
              </div>
            </>
          )}
          <CartRecommendations onAdd={handleAddRecommendation} />
        </>
      )}

      {step === 2 && (
        <>
          <h1 id="cart-title" className={s.title}>Datos de entrega</h1>
          <p className={s.intro}>Indicá dónde y cómo podemos comunicarte la entrega.</p>
          <form className={s.addressForm} noValidate onSubmit={(event) => { event.preventDefault(); handleNextFromAddress() }}>
            <div className={s.addressGrid}>
              {addressFields.map(([field, label, type, autoComplete]) => (
                <div className={s.addressField} key={field}>
                  <label className={s.addressLabel} htmlFor={`checkout-${field}`}>{label}</label>
                  <input
                    id={`checkout-${field}`}
                    className={s.addressInput(addressErrors[field])}
                    type={type}
                    autoComplete={autoComplete}
                    value={address[field]}
                    onChange={(event) => handleAddressChange(field, event.target.value)}
                    aria-invalid={Boolean(addressErrors[field])}
                  />
                  {addressErrors[field] && <span className={s.addressError}>{addressErrors[field]}</span>}
                </div>
              ))}
            </div>
            <label className={s.saveAddress}>
              <input
                type="checkbox"
                checked={saveAddress}
                onChange={(event) => setSaveAddress(event.target.checked)}
              />
              <span>Guardar para futuras compras</span>
            </label>
            <div className={s.addressActions}>
              <button type="button" className={s.secondaryButton} onClick={() => setStep(1)}>Volver</button>
              <button type="submit" className={s.checkoutButton}>Siguiente</button>
            </div>
          </form>
        </>
      )}

      {step === 3 && (
        <>
          <h1 id="cart-title" className={s.title}>Pago</h1>
          <p className={s.intro}>Revisá el detalle final antes de confirmar tu compra.</p>
          <div className={s.paymentLayout}>
            <ul className={s.paymentList} aria-label="Detalle de productos">
              {products.map((product) => (
                <li className={s.paymentItem} key={product._id}>
                  <span><span>{product.nombre}</span> × {product.quantity}</span>
                  <span>{formatCartCurrency.format(product.precio * product.quantity)}</span>
                </li>
              ))}
            </ul>
            <dl className={s.paymentSummary}>
              <div><dt>Subtotal</dt><dd>{formatCartCurrency.format(summary.subtotal)}</dd></div>
              <div><dt>Descuentos</dt><dd>{formatCartCurrency.format(summary.discount)}</dd></div>
              <div><dt>Envío</dt><dd>{summary.shipping === 0 ? "Gratis" : formatCartCurrency.format(summary.shipping)}</dd></div>
              <div className={s.paymentTotal}><dt>Total final</dt><dd>{formatCartCurrency.format(summary.total)}</dd></div>
            </dl>
          </div>
          <div className={s.addressActions}>
            <button type="button" className={s.secondaryButton} onClick={() => setStep(2)}>Volver</button>
            <button type="button" className={s.checkoutButton} onClick={() => setShowPurchaseModal(true)}>Comprar</button>
          </div>
        </>
      )}

      {selectedProduct && (
        <CartProductModal product={selectedProduct} onClose={() => setSelectedProductId(null)} />
      )}

      {showPurchaseModal && (
        <ModalDialog labelledBy="confirm-purchase-title" onClose={() => setShowPurchaseModal(false)}>
          <div className={s.modalContent}>
            <p className={s.modalEyebrow}>Confirmación</p>
            <h2 id="confirm-purchase-title" className={s.modalTitle}>Confirmar compra</h2>
            <p className={s.modalDescription}>Estás a punto de confirmar un pago por {formatCartCurrency.format(summary.total)}.</p>
            <div className={s.modalActions}>
              <button type="button" className={s.secondaryButton} onClick={() => setShowPurchaseModal(false)}>Rechazar</button>
              <button type="button" className={s.checkoutButton} onClick={handleConfirmPurchase}>Confirmar</button>
            </div>
          </div>
        </ModalDialog>
      )}
    </section>
  )
}
