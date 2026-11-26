import { useEffect, useState } from "react"
import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react"
import { toast } from "react-toastify"
import { Link } from "react-router-dom"
import { PageMeta } from "../../components/PageMeta/PageMeta"
import { ModalDialog } from "../../components/ModalDialog/ModalDialog"
import { useCart } from "../../features/cart"
import { productOptionalFields, productService } from "../../features/products"
import { cartPageStyles as s } from "./CartPageStyles"

const formatPrice = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
})

const cartPageMeta = { title: "Mi carrito", noIndex: true }

export default function CartPage() {
  const { cart, updateQuantity, removeItem } = useCart()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(cart.length > 0)
  const [error, setError] = useState("")
  const [selectedProduct, setSelectedProduct] = useState(null)

  useEffect(() => {
    let isActive = true

    const fetchCartProducts = async () => {
      if (cart.length === 0) {
        setProducts([])
        setLoading(false)
        setError("")
        return
      }

      setLoading(true)
      setError("")

      try {
        const cartProducts = await Promise.all(
          cart.map(async ({ id, quantity }) => {
            const product = await productService.getProductById(id)
            return { ...product, quantity }
          }),
        )

        if (isActive) setProducts(cartProducts)
      } catch (requestError) {
        if (!isActive) return

        console.error(requestError)
        setProducts([])
        setError("No se pudieron cargar los productos de tu carrito.")
        toast.error("No se pudieron cargar los productos de tu carrito.")
      } finally {
        if (isActive) setLoading(false)
      }
    }

    void fetchCartProducts()

    return () => {
      isActive = false
    }
  }, [cart])

  const handleDecrease = (product) => {
    updateQuantity(product._id, -1, product.stock)
    if (product.quantity <= 1) {
      toast.info(`Se eliminó ${product.nombre} del carrito`)
      return
    }
    toast.info(`Se eliminó 1 ${product.nombre} del carrito`)
  }

  const handleIncrease = (product) => {
    updateQuantity(product._id, 1, product.stock)
    toast.success(`Se agregó 1 ${product.nombre} al carrito`)
  }

  const handleRemove = (product) => {
    removeItem(product._id)
    setSelectedProduct((selected) =>
      selected?._id === product._id ? null : selected,
    )
    toast.info(`Se eliminó ${product.nombre} del carrito`)
  }

  const total = products.reduce(
    (sum, product) => sum + (Number(product.precio) || 0) * product.quantity,
    0,
  )

  if (loading) {
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
          <ShoppingCart className="mx-auto h-9 w-9 text-siena" aria-hidden="true" />
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
            {products.map((product) => (
              <li key={product._id} className={s.itemCard}>
                <button
                  type="button"
                  className="rounded-marca focus-visible:outline-siena"
                  onClick={() => setSelectedProduct(product)}
                  aria-label={`Ver imagen de ${product.nombre}`}
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
                  >
                    {product.nombre}
                  </button>
                  {product.descripcion && (
                    <p className={s.itemDescription}>{product.descripcion}</p>
                  )}
                  <p className={s.itemPrice}>
                    {formatPrice.format(Number(product.precio) || 0)} c/u
                  </p>
                  <p className={s.itemSubtotal}>
                    Subtotal: {formatPrice.format(
                      (Number(product.precio) || 0) * product.quantity,
                    )}
                  </p>
                </div>

                <div className={s.controls}>
                  <button
                    type="button"
                    className={s.quantityButton}
                    onClick={() => handleDecrease(product)}
                    aria-label={`Disminuir cantidad de ${product.nombre}`}
                  >
                    <Minus className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <span className={s.quantity} aria-label="Cantidad">
                    {product.quantity}
                  </span>
                  <button
                    type="button"
                    className={s.quantityButton}
                    onClick={() => handleIncrease(product)}
                    disabled={product.quantity >= Number(product.stock)}
                    aria-label={`Aumentar cantidad de ${product.nombre}`}
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className={s.removeButton}
                    onClick={() => handleRemove(product)}
                    aria-label={`Eliminar ${product.nombre} del carrito`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <aside className={s.summary} aria-label="Resumen del carrito">
            <h2 className={s.summaryTitle}>Resumen</h2>
            <p className={s.summaryRow}>
              <span>Productos ({products.reduce((sum, item) => sum + item.quantity, 0)})</span>
              <span>{formatPrice.format(total)}</span>
            </p>
            <p className={s.summaryTotal}>
              <span>Total</span>
              <span>{formatPrice.format(total)}</span>
            </p>
            <Link to="/productos" className={s.continueLink}>
              Seguir comprando
            </Link>
          </aside>
        </div>
      )}

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
              <p className={s.modalFact}><strong>SKU:</strong> {selectedProduct.sku}</p>
            )}
            <p className={s.modalFact}>
              <strong>Precio:</strong> {formatPrice.format(Number(selectedProduct.precio) || 0)}
            </p>
            <p className={s.modalFact}>
              <strong>Cantidad en el carrito:</strong> {selectedProduct.quantity}
            </p>
            <p className={s.modalFact}>
              <strong>Stock disponible:</strong> {selectedProduct.stock}
            </p>
            {selectedProduct.medidas && (
              <p className={s.modalFact}><strong>Medidas:</strong> {selectedProduct.medidas}</p>
            )}
          </div>
          <div className={s.modalOptional}>
            {productOptionalFields.map(({ key, label }) => {
              const value = selectedProduct[key]
              if (value === undefined || value === null || value === "") return null
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
