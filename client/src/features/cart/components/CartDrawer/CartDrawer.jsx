
import { useEffect, useState } from "react"
import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react"
import { toast } from "react-toastify"
import { useCart } from "../../hooks/useCart"
import { fetchApi } from "../../../../services/api"
import { cartDrawerStyles } from "./CartDrawerStyles"

export const CartDrawer = ({ isOpen, onClose }) => {
  const { cart, removeItem, updateQuantity } = useCart()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleRemoveItem = (product) => {
    removeItem(product._id)
    toast.info(`${product.nombre} eliminado del carrito`)
  }

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
            const product = await fetchApi(`/productos/${id}`)
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
          toast.error("No pudimos cargar tus productos del carrito.")
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
            <X
              className={cartDrawerStyles.closeIcon}
              aria-hidden="true"
            />
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
                <ShoppingCart
                  className={cartDrawerStyles.emptyIcon}
                  aria-hidden="true"
                />
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
                <li key={product._id} className={cartDrawerStyles.itemCard}>
                  <img
                    src={product.imagenUrl}
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
                        onClick={() =>
                          updateQuantity(product._id, -1, product.stock)
                        }
                        className={cartDrawerStyles.quantityButton}
                        aria-label={`Quitar una unidad de ${product.nombre}`}
                      >
                        <Minus className="h-4 w-4" aria-hidden="true" />
                      </button>

                      <span className={cartDrawerStyles.quantityText}>
                        {product.quantity}
                      </span>

                      <button
                        type="button"
                        disabled={product.quantity >= product.stock}
                        onClick={() =>
                          updateQuantity(product._id, 1, product.stock)
                        }
                        className={`${cartDrawerStyles.quantityButton} disabled:cursor-not-allowed disabled:opacity-40`}
                        aria-label={`Agregar una unidad de ${product.nombre}`}
                      >
                        <Plus className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>

                    <p className="mt-1 text-xs text-gray-500">
                      Stock disponible: {product.stock}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(product)}
                    className={cartDrawerStyles.removeButton}
                    aria-label={`Eliminar ${product.nombre} del carrito`}
                  >
                    <Trash2
                      className={cartDrawerStyles.trashIcon}
                      aria-hidden="true"
                    />
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