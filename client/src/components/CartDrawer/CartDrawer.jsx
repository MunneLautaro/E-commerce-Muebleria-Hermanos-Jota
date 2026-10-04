import { useEffect, useState } from "react"
import { useCart } from "../../context/CartContext"

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
    <path d="M3 6h18" strokeLinecap="round" />
    <path d="M8 6V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 6l1 14h10l1-14" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 10v6M14 10v6" strokeLinecap="round" />
  </svg>
)

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
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
            const response = await fetch(`http://localhost:3000/api/productos/${id}`)

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
        className={`fixed inset-0 z-40 bg-[#3a2622]/30 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-[420px] max-w-[90vw] flex-col border-l border-linea bg-crema shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Carrito de compras"
      >
        <div className="flex items-center justify-between border-b border-linea px-5 py-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-soft">
              Tu carrito
            </p>
            <h2 className="mt-1 font-display text-xl text-siena">Productos</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-linea text-siena transition-colors hover:bg-alabastro"
            aria-label="Cerrar carrito"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {loading ? (
            <p className="text-sm text-ink-soft">Cargando productos...</p>
          ) : error ? (
            <p className="text-sm text-error">{error}</p>
          ) : cartItems.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-alabastro text-siena">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7" aria-hidden="true">
                  <path d="M3 4h2l2.4 9.4a1 1 0 0 0 1 .8h8.7a1 1 0 0 0 1-.8L19 6H7" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="10" cy="17.5" r="1.25" />
                  <circle cx="17" cy="17.5" r="1.25" />
                </svg>
              </div>
              <p className="font-display text-lg text-siena">Tu carrito está vacío</p>
              <p className="mt-2 text-sm text-ink-soft">
                Agregá un producto para verlo aquí.
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {cartItems.map((product) => (
                <li key={product.id} className="flex items-center gap-3 rounded-marca border border-linea bg-white p-3 shadow-tarjeta">
                  <img
                    src={product.image}
                    alt={product.nombre}
                    className="h-16 w-16 rounded-full border border-linea object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink">{product.nombre}</p>

                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, -1)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-linea text-siena transition-colors hover:bg-alabastro"
                        aria-label={`Quitar una unidad de ${product.nombre}`}
                      >
                        -
                      </button>

                      <span className="min-w-9 text-center text-sm font-medium text-ink-soft">
                        {product.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, 1)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-linea text-siena transition-colors hover:bg-alabastro"
                        aria-label={`Agregar una unidad de ${product.nombre}`}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(product.id)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-linea text-error transition-colors hover:bg-error-bg"
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
