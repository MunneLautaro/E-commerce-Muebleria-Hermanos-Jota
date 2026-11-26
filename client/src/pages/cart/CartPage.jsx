import { useEffect, useRef, useState } from "react"
import {
  Minus,
  Plus,
  ShoppingCart,
  Tag,
  Trash2,
  Truck,
  X,
} from "lucide-react"
import { toast } from "react-toastify"
import { Link } from "react-router-dom"
import { PageMeta } from "../../components/PageMeta/PageMeta"
import { ModalDialog } from "../../components/ModalDialog/ModalDialog"
import {
  CART_BUSINESS_RULES,
  CART_COUPONS,
  calculateCartSummary,
  formatCartCurrency,
  useCart,
  validateCartCoupon,
} from "../../features/cart"
import { productOptionalFields, productService } from "../../features/products"
import { cartPageStyles as s } from "./CartPageStyles"

const cartPageMeta = { title: "Mi carrito", noIndex: true }

export default function CartPage() {
  const { cart, addItem, updateQuantity, removeItem } = useCart()
  const [products, setProducts] = useState([])
  const [cartProductsLoaded, setCartProductsLoaded] = useState(false)
  const [error, setError] = useState("")
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [removingProductId, setRemovingProductId] = useState(null)
  const [feedbackProductId, setFeedbackProductId] = useState(null)
  const [catalogProducts, setCatalogProducts] = useState([])
  const [recommendationsLoading, setRecommendationsLoading] = useState(true)
  const [recommendationsError, setRecommendationsError] = useState("")
  const [couponInput, setCouponInput] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState("")
  const [couponError, setCouponError] = useState("")
  const [couponMessage, setCouponMessage] = useState("")
  const hasLoadedCartRef = useRef(false)
  const cartIdsKey = cart.map(({ id }) => id).sort().join("|")
  const summary = calculateCartSummary(products, appliedCoupon)
  const cartProductIds = new Set(cart.map(({ id }) => id))
  const recommendedProducts = catalogProducts
    .filter((product) => !cartProductIds.has(product._id))
    .slice(0, CART_BUSINESS_RULES.recommendationLimit)
  const isLoading = cart.length > 0 && !cartProductsLoaded

  useEffect(() => {
    let isActive = true

    const fetchCartProducts = async () => {
      if (cart.length === 0) {
        setProducts([])
        setError("")
        hasLoadedCartRef.current = true
        setCartProductsLoaded(true)
        return
      }

      setError("")

      try {
        const cartProducts = await Promise.all(
          cart.map(async ({ id, quantity }) => {
            const product = await productService.getProductById(id)
            if (!product) {
              throw new Error(`No se encontró el producto ${id} del carrito.`)
            }
            return { ...product, quantity }
          }),
        )

        if (isActive) {
          setProducts(cartProducts)
          hasLoadedCartRef.current = true
        }
      } catch (requestError) {
        if (!isActive) return

        console.error(requestError)
        if (!hasLoadedCartRef.current) {
          setProducts([])
          setError("No se pudieron cargar los productos de tu carrito.")
        } else {
          toast.error("No se pudieron actualizar los productos de tu carrito.")
        }
      } finally {
        if (isActive) setCartProductsLoaded(true)
      }
    }

    void fetchCartProducts()

    return () => {
      isActive = false
    }
  }, [cart])

  useEffect(() => {
    let isActive = true

    const fetchRecommendations = async () => {
      setRecommendationsLoading(true)
      setRecommendationsError("")

      try {
        const result = await productService.getProducts({
          page: 1,
          limit: CART_BUSINESS_RULES.catalogPageLimit,
          order: "name_asc",
        })

        if (!Array.isArray(result?.items)) {
          throw new Error("La respuesta del catálogo no contiene productos.")
        }

        if (isActive) setCatalogProducts(result.items)
      } catch (requestError) {
        if (!isActive) return

        console.error(requestError)
        setCatalogProducts([])
        setRecommendationsError("No se pudieron cargar las recomendaciones.")
        toast.error("No se pudieron cargar las recomendaciones.")
      } finally {
        if (isActive) setRecommendationsLoading(false)
      }
    }

    void fetchRecommendations()

    return () => {
      isActive = false
    }
  }, [cartIdsKey])

  useEffect(() => {
    if (!removingProductId) return undefined

    const productId = removingProductId
    const timeoutId = window.setTimeout(() => {
      setProducts((current) =>
        current.filter((product) => product._id !== productId),
      )
      removeItem(productId)
      setRemovingProductId(null)
    }, 200)

    return () => window.clearTimeout(timeoutId)
  }, [removingProductId, removeItem])

  useEffect(() => {
    if (!feedbackProductId) return undefined

    const timeoutId = window.setTimeout(
      () => setFeedbackProductId(null),
      350,
    )
    return () => window.clearTimeout(timeoutId)
  }, [feedbackProductId])

  useEffect(() => {
    if (!appliedCoupon) return

    const { error: validationError } = validateCartCoupon(
      appliedCoupon,
      summary.subtotal,
    )

    if (validationError) {
      setAppliedCoupon("")
      setCouponInput("")
      setCouponError(validationError)
      setCouponMessage("")
      toast.info(`Se quitó ${appliedCoupon}: ${validationError}`)
    }
  }, [appliedCoupon, summary.subtotal])

  const handleRemove = (product) => {
    if (removingProductId) return
    setSelectedProduct((selected) =>
      selected?._id === product._id ? null : selected,
    )
    setRemovingProductId(product._id)
    toast.info(`Se eliminó ${product.nombre} del carrito`)
  }

  const handleDecrease = (product) => {
    if (product.quantity <= 1) {
      handleRemove(product)
      return
    }

    updateQuantity(product._id, -1, product.stock)
    setProducts((current) =>
      current.map((item) =>
        item._id === product._id
          ? { ...item, quantity: item.quantity - 1 }
          : item,
      ),
    )
    setFeedbackProductId(product._id)
    toast.info(`Se eliminó 1 ${product.nombre} del carrito`)
  }

  const handleIncrease = (product) => {
    const stock = Number(product.stock)
    if (!Number.isFinite(stock) || product.quantity >= stock) {
      toast.error(`No hay más unidades disponibles de ${product.nombre}.`)
      return
    }

    updateQuantity(product._id, 1, product.stock)
    setProducts((current) =>
      current.map((item) =>
        item._id === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      ),
    )
    setFeedbackProductId(product._id)
    toast.success(`Se agregó 1 ${product.nombre} al carrito`)
  }

  const handleAddRecommendation = (product) => {
    const currentQuantity =
      cart.find((item) => item.id === product._id)?.quantity ?? 0
    const stock = Number(product.stock)

    if (!Number.isFinite(stock) || currentQuantity >= stock) {
      toast.error(`No hay más unidades disponibles de ${product.nombre}.`)
      return
    }

    addItem(product)
    setProducts((current) => {
      const existingProduct = current.find(
        (item) => item._id === product._id,
      )

      if (existingProduct) {
        return current.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
      }

      return [...current, { ...product, quantity: 1 }]
    })
    setFeedbackProductId(product._id)
    toast.success(`Se agregó 1 ${product.nombre} al carrito`)
  }

  const handleApplyCoupon = (event) => {
    event.preventDefault()

    if (appliedCoupon) {
      const message = "Ya hay un cupón aplicado. Quitalo antes de cambiarlo."
      setCouponError(message)
      toast.error(message)
      return
    }

    const { coupon, error: validationError } = validateCartCoupon(
      couponInput,
      summary.subtotal,
    )

    if (validationError) {
      setCouponError(validationError)
      setCouponMessage("")
      toast.error(validationError)
      return
    }

    const discount = Math.round(summary.subtotal * coupon.discountRate)
    const message = `Cupón demostrativo ${coupon.code} aplicado localmente. Ahorrás ${formatCartCurrency.format(discount)}.`
    setAppliedCoupon(coupon.code)
    setCouponInput("")
    setCouponError("")
    setCouponMessage(message)
    toast.success(message)
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon("")
    setCouponInput("")
    setCouponError("")
    setCouponMessage("Se quitó el cupón de esta compra.")
    toast.info("Se quitó el cupón de esta compra.")
  }

  const availableCouponCodes = Object.values(CART_COUPONS)
  const totalItems = products.reduce(
    (sum, product) => sum + product.quantity,
    0,
  )

  if (isLoading) {
    return (
      <section className={s.section} aria-busy="true">
        <PageMeta {...cartPageMeta} />
        <h1 className={s.title}>Mi carrito</h1>
        <p className={s.loading}>Cargando los productos de tu carrito...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className={s.section}>
        <PageMeta {...cartPageMeta} />
        <h1 className={s.title}>Mi carrito</h1>
        <p className={s.error} role="alert">{error}</p>
      </section>
    )
  }

  return (
    <section className={s.section} aria-labelledby="cart-title">
      <PageMeta {...cartPageMeta} />
      <p className={s.eyebrow}>Tu selección</p>
      <h1 id="cart-title" className={s.title}>Mi carrito</h1>
      <p className={s.intro}>
        Revisá los productos que elegiste y ajustá las cantidades antes de
        continuar.
      </p>

      {products.length === 0 ? (
        <div className={s.empty}>
          <ShoppingCart
            className="mx-auto h-9 w-9 text-siena"
            aria-hidden="true"
          />
          <h2 className={`${s.emptyTitle} mt-4`}>Tu carrito está vacío</h2>
          <p className={s.emptyText}>
            Cuando agregues un mueble, lo vas a encontrar acá.
          </p>
          <Link to="/productos" className={s.primaryLink}>
            Explorar productos
          </Link>
        </div>
      ) : (
        <div className={s.layout}>
          <ul className={s.itemList} aria-label="Productos en tu carrito">
            {products.map((product) => {
              const isRemoving = removingProductId === product._id

              return (
                <li
                  key={product._id}
                  className={s.itemCard(
                    isRemoving,
                    feedbackProductId === product._id,
                  )}
                  aria-busy={isRemoving}
                >
                  <button
                    type="button"
                    className="rounded-marca focus-visible:outline-siena"
                    onClick={() => setSelectedProduct(product)}
                    aria-label={`Ver imagen de ${product.nombre}`}
                    disabled={isRemoving}
                  >
                    <img
                      src={product.imagenUrl}
                      alt={product.nombre}
                      className={s.itemImage}
                    />
                  </button>

                  <div className="min-w-0">
                    <button
                      type="button"
                      className={s.detailButton}
                      onClick={() => setSelectedProduct(product)}
                      aria-label={`Ver detalle de ${product.nombre}`}
                      disabled={isRemoving}
                    >
                      {product.nombre}
                    </button>
                    {product.descripcion && (
                      <p className={s.itemDescription}>{product.descripcion}</p>
                    )}
                    <p className={s.itemPrice}>
                      Precio unitario: {formatCartCurrency.format(
                        Number(product.precio) || 0,
                      )}
                    </p>
                    <p className={s.itemSubtotal}>
                      Subtotal: {formatCartCurrency.format(
                        (Number(product.precio) || 0) * product.quantity,
                      )}
                    </p>
                    {product.stock !== undefined && (
                      <p className={s.recommendationStock}>
                        Stock disponible: {product.stock}
                      </p>
                    )}
                  </div>

                  <div className={s.controls}>
                    <button
                      type="button"
                      className={s.quantityButton}
                      onClick={() => handleDecrease(product)}
                      aria-label={`Disminuir cantidad de ${product.nombre}`}
                      disabled={Boolean(removingProductId)}
                    >
                      <Minus className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <span
                      className={s.quantity}
                      aria-label={`Cantidad de ${product.nombre}`}
                      aria-live="polite"
                    >
                      {product.quantity}
                    </span>
                    <button
                      type="button"
                      className={s.quantityButton}
                      onClick={() => handleIncrease(product)}
                      disabled={
                        Boolean(removingProductId) ||
                        !Number.isFinite(Number(product.stock)) ||
                        product.quantity >= Number(product.stock)
                      }
                      aria-label={`Aumentar cantidad de ${product.nombre}`}
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className={s.removeButton}
                      onClick={() => handleRemove(product)}
                      aria-label={`Eliminar ${product.nombre} del carrito`}
                      disabled={Boolean(removingProductId)}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>

          <aside className={s.summary} aria-label="Resumen del carrito">
            <h2 className={s.summaryTitle}>Resumen de compra</h2>

            <div className={s.shippingProgress}>
              <p className={s.shippingMessage}>
                <Truck className={s.shippingIcon} aria-hidden="true" />
                <span>
                  {summary.qualifiesForFreeShipping
                    ? "¡Ya tenés envío gratis!"
                    : `Te faltan ${formatCartCurrency.format(summary.freeShippingRemaining)} para obtener envío gratis.`}
                </span>
              </p>
              <div
                className={s.progressTrack}
                role="progressbar"
                aria-label="Progreso para obtener envío gratis"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(summary.freeShippingProgress)}
              >
                <div
                  className={s.progressFill}
                  style={{ width: `${summary.freeShippingProgress}%` }}
                />
              </div>
            </div>

            <dl className={s.summaryRows}>
              <div className={s.summaryRow}>
                <dt>Subtotal ({totalItems} productos)</dt>
                <dd aria-label="Subtotal">
                  {formatCartCurrency.format(summary.subtotal)}
                </dd>
              </div>
              <div className={s.summaryRow}>
                <dt>Descuentos</dt>
                <dd
                  className={s.discountValue}
                  aria-label="Descuento"
                >
                  −{formatCartCurrency.format(summary.discount)}
                </dd>
              </div>
              <div className={s.summaryRow}>
                <dt>Costo de envío</dt>
                <dd aria-label="Costo de envío">
                  {summary.shipping === 0
                    ? "Gratis"
                    : formatCartCurrency.format(summary.shipping)}
                </dd>
              </div>
            </dl>

            <p className={s.summaryTotal}>
              <span>Total final</span>
              <strong aria-label="Total final">
                {formatCartCurrency.format(summary.total)}
              </strong>
            </p>

            <div className={s.couponSection}>
              <h3 className={s.couponTitle}>
                <Tag className={s.couponIcon} aria-hidden="true" />
                Código promocional de prueba
              </h3>

              {appliedCoupon ? (
                <div>
                  <p className={s.couponSuccess} role="status">
                    {couponMessage || `Cupón ${appliedCoupon} aplicado localmente.`}
                  </p>
                  <button
                    type="button"
                    className={s.couponRemove}
                    onClick={handleRemoveCoupon}
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                    Quitar cupón {appliedCoupon}
                  </button>
                </div>
              ) : (
                <form className={s.couponForm} onSubmit={handleApplyCoupon}>
                  <label className="sr-only" htmlFor="cart-coupon-code">
                    Código promocional
                  </label>
                  <input
                    id="cart-coupon-code"
                    type="text"
                    autoComplete="off"
                    maxLength={32}
                    value={couponInput}
                    onChange={(event) => {
                      setCouponInput(event.target.value)
                      setCouponError("")
                      setCouponMessage("")
                    }}
                    placeholder="Ingresá tu código"
                    className={s.couponInput}
                  />
                  <button type="submit" className={s.couponApply}>
                    Aplicar
                  </button>
                </form>
              )}

              {couponError && (
                <p className={s.couponError} role="alert">{couponError}</p>
              )}
              {couponMessage && !appliedCoupon && (
                <p className={s.couponSuccess} role="status">{couponMessage}</p>
              )}

              <div className={s.couponCodes} aria-label="Cupones demostrativos">
                {availableCouponCodes.map((coupon) => (
                  <p key={coupon.code}>
                    <strong>{coupon.code}</strong>: {coupon.label}
                    {coupon.minimumSubtotal > 0 &&
                      ` en compras superiores a ${formatCartCurrency.format(coupon.minimumSubtotal)}`}
                    {coupon.code === "BIENVENIDO" &&
                      " (promoción simulada, no se verifica primera compra)"}
                  </p>
                ))}
              </div>
            </div>

            <p className={s.localDisclosure}>
              Los descuentos y el envío son demostrativos y se calculan solo en
              este frontend; no se validan ni confirman desde un servidor.
            </p>
            <Link to="/productos" className={s.continueLink}>
              Seguir comprando
            </Link>
          </aside>
        </div>
      )}

      <section
        className={s.recommendations}
        aria-labelledby="cart-recommendations-title"
      >
        <header className={s.recommendationsHeader}>
          <p className={s.recommendationsEyebrow}>Inspiración para tu espacio</p>
          <h2
            id="cart-recommendations-title"
            className={s.recommendationsTitle}
          >
            Completá tu compra
          </h2>
        </header>

        {recommendationsLoading && (
          <p className={s.recommendationNotice} role="status">
            Buscando productos del catálogo...
          </p>
        )}
        {recommendationsError && (
          <p className={s.recommendationNotice} role="alert">
            {recommendationsError}
          </p>
        )}
        {!recommendationsLoading &&
          !recommendationsError &&
          recommendedProducts.length > 0 && (
            <ul className={s.recommendationList}>
              {recommendedProducts.map((product) => (
                <li key={product._id} className={s.recommendationCard}>
                  <Link
                    to={`/productos/${product._id}`}
                    aria-label={`Ver detalle de ${product.nombre}`}
                  >
                    <img
                      src={product.imagenUrl}
                      alt={product.nombre}
                      loading="lazy"
                      className={s.recommendationImage}
                    />
                  </Link>
                  <div className={s.recommendationContent}>
                    <Link
                      to={`/productos/${product._id}`}
                      className={s.recommendationName}
                    >
                      {product.nombre}
                    </Link>
                    <p className={s.recommendationPrice}>
                      {formatCartCurrency.format(Number(product.precio) || 0)}
                    </p>
                    {product.stock !== undefined && (
                      <p className={s.recommendationStock}>
                        Stock disponible: {product.stock}
                      </p>
                    )}
                    <button
                      type="button"
                      className={s.recommendationAdd}
                      onClick={() => handleAddRecommendation(product)}
                      disabled={
                        !Number.isFinite(Number(product.stock)) ||
                        Number(product.stock) <= 0
                      }
                      aria-label={`Agregar ${product.nombre} al carrito`}
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      {Number(product.stock) > 0
                        ? "Agregar al carrito"
                        : "Sin stock"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        {!recommendationsLoading &&
          !recommendationsError &&
          recommendedProducts.length === 0 && (
            <p className={s.recommendationNotice}>
              Ya estás viendo todos los productos disponibles en esta selección.
            </p>
          )}
      </section>

      {selectedProduct && (
        <ModalDialog
          labelledBy="cart-product-title"
          onClose={() => setSelectedProduct(null)}
        >
          <div className={s.modalHeader}>
            <h2 id="cart-product-title" className={s.modalTitle}>
              {selectedProduct.nombre}
            </h2>
            <button
              type="button"
              className={s.modalClose}
              onClick={() => setSelectedProduct(null)}
              aria-label="Cerrar detalle del producto"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <img
            src={selectedProduct.imagenUrl}
            alt={selectedProduct.nombre}
            className={s.modalImage}
          />
          {selectedProduct.descripcion && (
            <p className={s.modalDescription}>{selectedProduct.descripcion}</p>
          )}
          <div className={s.modalFacts}>
            {selectedProduct.sku && (
              <p className={s.modalFact}>
                <strong>SKU:</strong> {selectedProduct.sku}
              </p>
            )}
            <p className={s.modalFact}>
              <strong>Precio:</strong>{" "}
              {formatCartCurrency.format(Number(selectedProduct.precio) || 0)}
            </p>
            <p className={s.modalFact}>
              <strong>Cantidad en el carrito:</strong> {selectedProduct.quantity}
            </p>
            <p className={s.modalFact}>
              <strong>Stock disponible:</strong> {selectedProduct.stock}
            </p>
            {selectedProduct.medidas && (
              <p className={s.modalFact}>
                <strong>Medidas:</strong> {selectedProduct.medidas}
              </p>
            )}
          </div>
          <div className={s.modalOptional}>
            {productOptionalFields.map(({ key, label }) => {
              const value = selectedProduct[key]
              if (value === undefined || value === null || value === "") {
                return null
              }
              return (
                <p key={key} className={s.modalOptionalItem}>
                  <strong>{label}:</strong> {value}
                </p>
              )
            })}
            {selectedProduct.atributos?.map(({ clave, valor }, index) => (
              <p
                key={`${clave}-${index}`}
                className={s.modalOptionalItem}
              >
                <strong>{clave}:</strong> {valor}
              </p>
            ))}
          </div>
        </ModalDialog>
      )}
    </section>
  )
}
