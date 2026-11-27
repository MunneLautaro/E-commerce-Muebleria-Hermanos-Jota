import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react"
import { Link } from "react-router-dom"
import { hasStockFor, useCartItemActions } from "../../hooks/useCartItemActions"
import { useCartProducts } from "../../hooks/useCartProducts"
import { cartDrawerStyles } from "./CartDrawerStyles"

export const CartDrawer = ({ isOpen, onClose }) => {
  const { products, loading, error } = useCartProducts({ enabled: isOpen })
  const { increase, decrease, remove } = useCartItemActions()

  const renderContent = () => {
    if (loading) {
      return (
        <p className={cartDrawerStyles.loadingText}>Cargando productos...</p>
      )
    }

    if (error && products.length === 0) {
      return (
        <p className={cartDrawerStyles.errorText}>
          No pudimos cargar tus productos del carrito.
        </p>
      )
    }

    if (products.length === 0) {
      return (
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
      )
    }

    return (
      <ul className={cartDrawerStyles.itemList}>
        {products.map((product) => (
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
                  onClick={() => decrease(product)}
                  className={cartDrawerStyles.quantityButton}
                  aria-label={`Quitar una unidad de ${product.nombre}`}
                >
                  <Minus className={cartDrawerStyles.quantityIcon} aria-hidden="true" />
                </button>

                <span className={cartDrawerStyles.quantityText}>
                  {product.quantity}
                </span>

                <button
                  type="button"
                  disabled={!hasStockFor(product, product.quantity + 1)}
                  onClick={() => increase(product)}
                  className={cartDrawerStyles.quantityButton}
                  aria-label={`Agregar una unidad de ${product.nombre}`}
                >
                  <Plus className={cartDrawerStyles.quantityIcon} aria-hidden="true" />
                </button>
              </div>

              <p className={cartDrawerStyles.stockText}>
                Stock disponible: {product.stock}
              </p>
            </div>

            <button
              type="button"
              onClick={() => remove(product)}
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
    )
  }

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
          {renderContent()}
        </div>
        <div className={cartDrawerStyles.footer}>
          <Link
            to="/carrito"
            className={cartDrawerStyles.viewCartButton}
            onClick={onClose}
          >
            Ver carrito
          </Link>
        </div>
      </aside>
    </>
  )
}
