import { useEffect, useState } from "react"
import { useCart } from "../../hooks/useCart"
import { cartDrawerStyles } from "./CartDrawerStyles"

const TrashIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className={cartDrawerStyles.trashIcon}
    aria-hidden="true"
  >
    <path d="M3 6h18" strokeLinecap="round" />
    <path
      d="M8 6V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M6 6l1 14h10l1-14" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 10v6M14 10v6" strokeLinecap="round" />
  </svg>
)

const CloseIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className={cartDrawerStyles.closeIcon}
    aria-hidden="true"
  >
    <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
  </svg>
)

export const CartDrawer = ({ isOpen, onClose }) => {
  const { cart, removeItem, updateQuantity } = useCart()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    let isMounted = true

    const loadProducts = async () => {
      if (!cart.length) {
        if (isMounted) {
          setCartItems([])
          setLoading(false)
        }
        return
      }

      setLoading(true)
      setError("")

      try {
        const products = await Promise.all(
          cart.map(async ({ id, quantity }) => {
            const response = await fetch(
              `http://localhost:3000/api/productos/${id}`,
            )

            if (!response.ok) {
              throw new Error("No se pudo cargar el producto")
            }

            const product = await response.json()
            return { ...product, quantity }
          }),
        )

        if (isMounted) {
          setCartItems(products)
        }
      } catch (loadError) {
        console.error(loadError)

        if (isMounted) {
          setError("No pudimos cargar tus productos del carrito.")
          setCartItems([])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadProducts()

    return () => {
      isMounted = false
    }
  }, [cart])

  return (
    <>
      <button
        type="button"
        aria-label="Cerrar carrito"
        className={cartDrawerStyles.overlay(isOpen)}
        onClick={onClose}
      />

      <aside
        className={cartDrawerStyles.aside(isOpen)}
        aria-label="Carrito de compras"
      >
        <div className={cartDrawerStyles.header}>
          <div>
            <p className={cartDrawerStyles.subtitle}>Tu carrito</p>
            <h2 className={cartDrawerStyles.title}>Productos</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={cartDrawerStyles.closeButton}
            aria-label="Cerrar carrito"
          >
            <CloseIcon />
          </button>
        </div>

        <div className={cartDrawerStyles.content}>
          {loading ? (
            <p className={cartDrawerStyles.loadingText}>
              Cargando productos...
            </p>
          ) : error ? (
            <p className={cartDrawerStyles.errorText}>{error}</p>
          ) : cartItems.length === 0 ? (
            <div className={cartDrawerStyles.emptyContainer}>
              <div className={cartDrawerStyles.emptyIconWrapper}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className={cartDrawerStyles.emptyIcon}
                  aria-hidden="true"
                >
                  <path
                    d="M3 4h2l2.4 9.4a1 1 0 0 0 1 .8h8.7a1 1 0 0 0 1-.8L19 6H7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="10" cy="17.5" r="1.25" />
                  <circle cx="17" cy="17.5" r="1.25" />
                </svg>
              </div>
              <p className={cartDrawerStyles.emptyTitle}>
                Tu carrito está vacío
              </p>
              <p className={cartDrawerStyles.emptyText}>
                Agregá un producto para verlo aquí.
              </p>
            </div>
          ) : (
            <ul className={cartDrawerStyles.itemList}>
              {cartItems.map((product) => (
                <li key={product.id} className={cartDrawerStyles.itemCard}>
                  <img
                    src={product.image}
                    alt={product.nombre}
                    className={cartDrawerStyles.itemImage}
                  />

                  <div className={cartDrawerStyles.itemInfo}>
                    <p className={cartDrawerStyles.itemName}>
                      {product.nombre}
                    </p>

                    <div className={cartDrawerStyles.quantityControls}>
                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, -1)}
                        className={cartDrawerStyles.quantityButton}
                        aria-label={`Quitar una unidad de ${product.nombre}`}
                      >
                        -
                      </button>

                      <span className={cartDrawerStyles.quantityText}>
                        {product.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, 1)}
                        className={cartDrawerStyles.quantityButton}
                        aria-label={`Agregar una unidad de ${product.nombre}`}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(product.id)}
                    className={cartDrawerStyles.removeButton}
                    aria-label={`Eliminar ${product.nombre} del carrito`}
                  >
                    <TrashIcon />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  )
}
