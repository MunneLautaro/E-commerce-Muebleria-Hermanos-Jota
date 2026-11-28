import { X } from "lucide-react"
import { ModalDialog } from "../../../../components/ModalDialog/ModalDialog"
import { productOptionalFields } from "../../../products/constants/productFields"
import { formatCartCurrency } from "../../utils/cartCalculations"
import { cartProductModalStyles as s } from "./CartProductModalStyles"

const hasValue = (value) => value !== undefined && value !== null && value !== ""

const Fact = ({ label, children }) => (
  <p className={s.fact}>
    <strong>{label}:</strong> {children}
  </p>
)

export const CartProductModal = ({ product, onClose }) => (
  <ModalDialog labelledBy="cart-product-title" onClose={onClose}>
    <div className={s.header}>
      <h2 id="cart-product-title" className={s.title}>
        {product.nombre}
      </h2>
      <button
        type="button"
        className={s.close}
        onClick={onClose}
        aria-label="Cerrar detalle del producto"
      >
        <X className={s.closeIcon} aria-hidden="true" />
      </button>
    </div>
    <img src={product.imagenUrl} alt={product.nombre} className={s.image} />
    {product.descripcion && (
      <p className={s.description}>{product.descripcion}</p>
    )}
    <div className={s.facts}>
      {product.sku && <Fact label="SKU">{product.sku}</Fact>}
      <Fact label="Precio">
        {formatCartCurrency.format(Number(product.precio) || 0)}
      </Fact>
      <Fact label="Cantidad en el carrito">{product.quantity}</Fact>
      <Fact label="Stock disponible">{product.stock}</Fact>
      {product.medidas && <Fact label="Medidas">{product.medidas}</Fact>}
    </div>
    <div className={s.optional}>
      {productOptionalFields
        .filter(({ key }) => hasValue(product[key]))
        .map(({ key, label }) => (
          <p key={key} className={s.optionalItem}>
            <strong>{label}:</strong> {product[key]}
          </p>
        ))}
      {product.atributos?.map(({ clave, valor }, index) => (
        <p key={`${clave}-${index}`} className={s.optionalItem}>
          <strong>{clave}:</strong> {valor}
        </p>
      ))}
    </div>
  </ModalDialog>
)
