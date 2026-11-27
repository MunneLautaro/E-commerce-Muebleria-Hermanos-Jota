import { Minus, Plus, Trash2 } from "lucide-react"
import { formatCartCurrency } from "../../utils/cartCalculations"
import { hasStockFor } from "../../hooks/useCartItemActions"
import { cartItemStyles as s } from "./CartItemStyles"

export const CartItem = ({
  product,
  isRemoving = false,
  isHighlighted = false,
  disabled = false,
  onIncrease,
  onDecrease,
  onRemove,
  onShowDetail,
}) => {
  const price = Number(product.precio) || 0
  const canIncrease = hasStockFor(product, product.quantity + 1)

  return (
    <li className={s.card(isRemoving, isHighlighted)} aria-busy={isRemoving}>
      <button
        type="button"
        className={s.imageButton}
        onClick={() => onShowDetail(product)}
        aria-label={`Ver imagen de ${product.nombre}`}
        disabled={disabled}
      >
        <img src={product.imagenUrl} alt={product.nombre} className={s.image} />
      </button>

      <div className={s.info}>
        <button
          type="button"
          className={s.detailButton}
          onClick={() => onShowDetail(product)}
          aria-label={`Ver detalle de ${product.nombre}`}
          disabled={disabled}
        >
          {product.nombre}
        </button>
        {product.descripcion && (
          <p className={s.description}>{product.descripcion}</p>
        )}
        <p className={s.price}>
          Precio unitario: {formatCartCurrency.format(price)}
        </p>
        <p className={s.subtotal}>
          Subtotal: {formatCartCurrency.format(price * product.quantity)}
        </p>
        {product.stock !== undefined && (
          <p className={s.stock}>Stock disponible: {product.stock}</p>
        )}
      </div>

      <div className={s.controls}>
        <button
          type="button"
          className={s.quantityButton}
          onClick={() => onDecrease(product)}
          aria-label={`Disminuir cantidad de ${product.nombre}`}
          disabled={disabled}
        >
          <Minus className={s.icon} aria-hidden="true" />
        </button>
        <output className={s.quantity} aria-label={`Cantidad de ${product.nombre}`}>
          {product.quantity}
        </output>
        <button
          type="button"
          className={s.quantityButton}
          onClick={() => onIncrease(product)}
          disabled={disabled || !canIncrease}
          aria-label={`Aumentar cantidad de ${product.nombre}`}
        >
          <Plus className={s.icon} aria-hidden="true" />
        </button>
        <button
          type="button"
          className={s.removeButton}
          onClick={() => onRemove(product)}
          aria-label={`Eliminar ${product.nombre} del carrito`}
          disabled={disabled}
        >
          <Trash2 className={s.icon} aria-hidden="true" />
        </button>
      </div>
    </li>
  )
}
